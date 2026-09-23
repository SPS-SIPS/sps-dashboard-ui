const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
function compile(file, resolve = require) {const m = {exports: {}}; const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {fileName: file, compilerOptions: {module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true}}).outputText; new Function('require', 'module', 'exports', code)(resolve, m, m.exports); return m.exports;}
const rules = compile('utils/paymentForms.ts');
function harness(verified = false) {
    let step, sent = 0;
    const values = verified ? {ToBIC: 'BANKSOS0', CreditorAgentBIC: 'BANKSOS0', CreditorName: 'Recipient', CreditorAccount: '123', CreditorAccountType: 'ACCT'} : {};
    Object.assign(values, {Currency: 'USD', CreditorIssuer: 'C', EndToEndId: 'AUTO-1'});
    const lockedFields = new Set(Object.keys(values));
    const Component = compile('component/RequestForm/AccountTransferSteps.tsx', id => {
        if (id === 'react') return {useState: initial => [step ??= initial, value => {step = value;}]};
        if (id === 'react/jsx-runtime') return {jsx: (type, props) => ({type, props}), jsxs: (type, props) => ({type, props})};
        if (id.endsWith('AuthProvider')) return {useAuthentication: () => ({config: {profile: 'test'}})};
        if (id.endsWith('paymentForms')) return rules;
        if (id.endsWith('gatewayFormOptions')) return {verificationMethods: [{value: 'ACCT', label: 'Account'}], bicOptionsDev: [{value: 'BANKSOS0', label: 'Bank'}], bicOptionsProd: []};
        return {__esModule: true, default: id};
    }).default;
    const mappings = rules.applicableFields.map(internalField => ({internalField, userField: internalField, type: 'string'}));
    const walk = n => !n || typeof n !== 'object' ? [] : [n, ...[n.props?.children].flat(Infinity).flatMap(walk)];
    const render = () => walk(Component({values, mappings, preset: {fields: mappings.map(m => ({internalField: m.internalField, label: m.internalField, visible: true}))}, locked: f => lockedFields.has(f), change: (f, v) => {values[f] = v;}, errors: [], busy: false, verified, onPreview() {}, onSubmit: () => {sent++;}}));
    return {values, render, get step() {return step;}, get sent() {return sent;}, input(label, value) {render().find(n => n.props?.label === label).props.onChange({target: {value}});}, advance() {render().find(n => n.type === 'form').props.onSubmit({preventDefault() {}});}};
}
test('account transfer validates each step, links recipient BICs and preserves fields on back', () => {
    const h = harness(); h.advance(); assert.equal(h.step, 1); assert.equal(h.sent, 0);
    h.input('Recipient bank BIC', 'BANKSOS0'); assert.equal(h.values.CreditorAgentBIC, 'BANKSOS0');
    h.input('Recipient account', '123'); h.input('Recipient account type', 'ACCT'); h.input('Recipient name', 'Recipient');
    h.advance(); assert.equal(h.step, 2); assert.equal(h.sent, 0);
    h.input('Amount', '-1'); h.input('Payment description', 'Account transfer'); h.input('Payer name', 'Payer'); h.input('Payer account', '456'); h.input('Payer account type', 'ACCT');
    h.advance(); assert.equal(h.step, 2);
    h.input('Amount', '25'); h.advance(); assert.equal(h.step, 3); assert.equal(h.sent, 0);
    h.render().find(n => n.props?.children === '← Back').props.onClick(); assert.equal(h.values.Amount, '25');
    h.advance(); h.advance(); assert.equal(h.sent, 1);
});
test('verified account transfer begins at recipient with disabled prefilled fields', () => {
    const h = harness(true); const nodes = h.render(); assert.equal(h.step, 1);
    assert(!nodes.some(n => n.props?.children === 'Verified recipient'));
    assert.equal(nodes.find(n => n.props?.label === 'Recipient account').props.disabled, true);
    assert(!nodes.some(n => n.props?.label === 'LocalInstrument'));
});


test('account controls use bank options, lock USD and hide background fields', () => {
    const direct = harness();
    assert.deepEqual(direct.render().find(n => n.props?.label === 'Recipient bank BIC').props.options, [{value: 'BANKSOS0', label: 'Bank'}]);
    const verified = harness(true);
    verified.advance();
    const nodes = verified.render();
    const currency = nodes.find(n => n.props?.label === 'Currency');
    assert.equal(currency.props.disabled, true);
    assert.equal(currency.props.value, 'USD');
    assert.deepEqual(currency.props.options, [{value: 'USD', label: 'USD - US Dollar'}]);
    assert(!nodes.some(n => ['Payment reference', 'CreditorIssuer'].includes(n.props?.label)));
    assert.equal(verified.values.EndToEndId, 'AUTO-1');
    assert.equal(verified.values.CreditorIssuer, 'C');
});
