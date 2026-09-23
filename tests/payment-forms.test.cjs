const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
function compile(file, resolve = require) {
    const module = {exports: {}};
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {fileName: file, compilerOptions: {module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true}}).outputText;
    new Function('require', 'module', 'exports', code)(resolve, module, module.exports);
    return module.exports;
}
const rules = compile('utils/paymentForms.ts');
const settings = compile('utils/paymentFormConfig.ts', id => id.endsWith('paymentForms') ? rules : require(id));
const mappings = rules.applicableFields.map(internalField => ({internalField, userField: internalField === 'Amount' ? 'amount' : internalField, type: internalField === 'Amount' ? 'double' : 'string'}));
const complete = {...Object.fromEntries(rules.fieldsFor('account').filter(f => !rules.isOptional(f, 'account')).map(f => [f, 'value'])), Amount: '12.50'};
test('all supported payment types build only relevant fields and correct amount type', () => {
    for (const type of ['account', 'staticQr', 'dynamicQr']) {
        const {payload, errors} = rules.buildPaymentPayload({...complete, ...rules.paymentDefaults(type), InvoiceId: 'hidden', SenderCountry: 'SO'}, [...mappings, {internalField: 'InvoiceId', userField: 'invoice', type: 'string'}]);
        assert.deepEqual(errors, []);
        assert.equal(payload.amount, 12.5);
        assert.equal(payload.CategoryPurpose, rules.purposes[type]);
        assert.equal('invoice' in payload, false);
        assert.equal('SenderCountry' in payload, false);
        assert.equal('CreditorAddress' in payload, false);
    }
});
test('missing required values, missing mappings and invalid amounts prevent sending', () => {
    assert(rules.buildPaymentPayload({...complete, Amount: '-1'}, mappings).errors.some(e => e.includes('greater than zero')));
    assert(rules.buildPaymentPayload({...complete, CreditorAccount: ''}, mappings).errors.some(e => e.includes('required')));
    assert(rules.buildPaymentPayload(complete, mappings.filter(m => m.internalField !== 'Currency')).errors.some(e => e.includes('missing Currency')));
});
test('nested aliases build nested JSON and conflicting aliases are blocked', () => {
    const nested = mappings.map(m => m.internalField === 'CreditorAccount' ? {...m, userField: 'recipient.account'} : m);
    assert.equal(rules.buildPaymentPayload(complete, nested).payload.recipient.account, 'value');
    assert(rules.buildPaymentPayload(complete, mappings.map(m => ({...m, userField: 'same'}))).errors.some(e => e.includes('Conflicting')));
});
test('payment settings protect required fields, sensitive defaults and stale aliases', () => {
    const forms = settings.createDefaultPaymentForms();
    assert(settings.validatePaymentForms(forms));
    const preset = forms.presets.account;
    preset.fields.find(f => f.internalField === 'Amount').visible = false;
    assert(settings.validatePaymentPreset('account', preset).length);
    preset.fields.find(f => f.internalField === 'Amount').visible = true;
    preset.fields.find(f => f.internalField === 'CreditorAccount').defaultValue = '123';
    assert(settings.validatePaymentPreset('account', preset).length);
    delete preset.fields.find(f => f.internalField === 'CreditorAccount').defaultValue;
    preset.fields.find(f => f.internalField === 'Currency').defaultValue = 'SOS';
    assert.deepEqual(settings.configuredDefaults(preset), {Currency: 'SOS'});
    preset.fields.find(f => f.internalField === 'Currency').userField = 'removedAlias';
    assert(settings.validatePaymentPreset('account', preset, mappings).some(e => e.includes('no longer mapped')));
});

test('payment settings persist atomically, reject stale saves and back up malformed data', () => {
    const os = require('node:os'), path = require('node:path');
    const storageModule = compile('utils/paymentFormsStorage.ts', id => id.endsWith('paymentFormConfig') ? settings : require(id));
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'payment-settings-'));
    try {
        const storage = storageModule.createPaymentFormsStorage(root);
        const initial = storage.load();
        assert.equal(initial.source, 'defaults');
        assert.equal(fs.existsSync(path.join(root, 'runtime-config/payment-forms.json')), false);
        const saved = storage.update(initial.revision, forms => {forms.presets.staticQr.fields[0].label = 'Destination';});
        assert.equal(saved.forms.presets.staticQr.fields[0].label, 'Destination');
        assert.throws(() => storage.update(initial.revision, () => {}), /changed/);
        const target = path.join(root, 'runtime-config/payment-forms.json');
        fs.writeFileSync(target, 'broken JSON');
        const broken = storage.load();
        assert.equal(broken.forms, null);
        assert.throws(() => storage.update(broken.revision, () => {}), /invalid/);
        const reset = storage.reset(broken.revision);
        assert.equal(fs.readFileSync(path.join(root, reset.backup), 'utf8'), 'broken JSON');
        assert(settings.validatePaymentForms(reset.forms));
    } finally {fs.rmSync(root, {recursive: true, force: true});}
});


test('P2G payload includes one bill reference and blocks conflicting amounts or references', () => {
    const all = rules.fieldsFor('p2g').map(internalField => ({internalField, userField: internalField, type: ['Amount', 'AmountPayable'].includes(internalField) ? 'double' : 'string'}));
    const values = {...complete, ...rules.paymentDefaults('p2g'), CategoryPurpose: 'TEST', BillReference: 'BILL-123', AmountPayable: '12.50'};
    const built = rules.buildPaymentPayload(values, all, 'p2g');
    assert.deepEqual(built.errors, []);
    assert.equal(built.payload.BillReference, 'BILL-123');
    assert.equal(built.payload.AmountPayable, 12.5);
    assert.equal('ReceiverCurrency' in built.payload, false);
    assert(rules.buildPaymentPayload({...values, Upr: 'UPR-2'}, all, 'p2g').errors.some(e => e.includes('exactly one')));
    assert(rules.buildPaymentPayload({...values, AmountPayable: '99'}, all, 'p2g').errors.some(e => e.includes('must match')));
    assert(rules.buildPaymentPayload({...values, BillReference: ''}, all, 'p2g').errors.length);
});
test('PAPSS validates corridor, required routing and transaction fields', () => {
    const all = rules.fieldsFor('papss').map(internalField => ({internalField, userField: ['SenderCountry', 'ReceiverCountry', 'SenderCurrency', 'ReceiverCurrency'].includes(internalField) ? `papss.${internalField}` : internalField, type: internalField === 'Amount' ? 'double' : 'string'}));
    const values = {...complete, ...rules.paymentDefaults('papss'), Currency: 'SOS', SenderCountry: 'SO', ReceiverCountry: 'KE', SenderCurrency: 'SOS', ReceiverCurrency: 'KES', DebtorAgentBIC: 'TESTSOS0', TxId: 'TX-1'};
    const built = rules.buildPaymentPayload(values, all, 'papss');
    assert.deepEqual(built.errors, []);
    assert.equal(built.payload.Rail, 'PAPSS');
    assert.equal(built.payload.papss.ReceiverCurrency, 'KES');
    assert.equal('BillReference' in built.payload, false);
    assert(rules.buildPaymentPayload(values, all.filter(m => m.internalField !== 'TxId'), 'papss').errors.some(e => e.includes('missing TxId')));
    assert(rules.buildPaymentPayload({...values, SenderCurrency: 'USD'}, all, 'papss').errors.some(e => e.includes('must match')));
    assert(rules.buildPaymentPayload({...values, ReceiverCurrency: 'ke'}, all, 'papss').errors.some(e => e.includes('three-letter')));
});
test('older payment configuration gains P2G and PAPSS presets without losing custom settings', () => {
    const legacy = settings.createDefaultPaymentForms();
    delete legacy.presets.p2g; delete legacy.presets.papss;
    legacy.presets.account.fields[0].label = 'Custom bank';
    const upgraded = settings.upgradePaymentForms(legacy);
    assert(settings.validatePaymentForms(upgraded));
    assert.equal(upgraded.presets.account.fields[0].label, 'Custom bank');
    assert(upgraded.presets.papss.fields.some(f => f.internalField === 'ReceiverCurrency'));
    assert(upgraded.presets.p2g.fields.some(f => f.internalField === 'BillReference'));
    legacy.presets.account.fields.pop();
    assert.equal(settings.validatePaymentForms(settings.upgradePaymentForms(legacy)), false);
});
