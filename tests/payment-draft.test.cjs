const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const output = {exports: {}};
const code = ts.transpileModule(fs.readFileSync('utils/paymentDraft.ts', 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020}}).outputText;
new Function('module', 'exports', code)(output, output.exports);
const {paymentPrefill, readPaymentDraft} = output.exports;
test('payment draft maps verified recipient and QR amount using internal fields', () => {
    const result = paymentPrefill({ToBIC: ' BANKBIC ', AccountNo: '00123', AccountType: 'ACCT', Name: 'Recipient', Amount: 12.5, Currency: 'SOS', CategoryPurpose: 'C2BDQR'});
    assert.equal(result.CreditorAccount, '00123');
    assert.equal(result.CreditorAgentBIC, 'BANKBIC');
    assert.equal(result.Amount, '12.5');
    assert.equal(result.Currency, 'SOS');
    assert.equal(result.Rail, 'SIPS');
    assert.equal(result.CategoryPurpose, 'C2BDQR');
});
test('missing details stay absent and currency is not invented', () => {
    const result = paymentPrefill({Name: '', Currency: null, Address: undefined});
    for (const key of ['CreditorName', 'Currency', 'CreditorAddress', 'Amount', 'CreditorAccount']) assert.equal(key in result, false);
});
test('session draft must match its ID and be within its lifetime', () => {
    const raw = JSON.stringify({id: 'draft1', createdAt: 1000, data: {AccountNo: '123'}});
    assert.equal(readPaymentDraft(raw, 'draft1', 2000).CreditorAccount, '123');
    assert.throws(() => readPaymentDraft(raw, 'other', 2000));
    assert.throws(() => readPaymentDraft(raw, 'draft1', 31 * 60 * 1000));
    assert.throws(() => readPaymentDraft(null, 'draft1', 2000));
    assert.throws(() => readPaymentDraft('{', 'draft1', 2000));
});
