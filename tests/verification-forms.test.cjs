const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const os = require('node:os');

const root = path.join(__dirname, '..');
function compile(file, resolve = require) {
    const module = {exports: {}};
    const source = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
        fileName: file,
        compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true},
    }).outputText;
    new Function('require', 'module', 'exports', source)(resolve, module, module.exports);
    return module.exports;
}
const model = compile('utils/verificationForms.ts');
const defaults = model.createDefaultVerificationForms();
const mappings = [
    ['Alias', 'accNo'], ['Alias', 'accountNo'], ['Alias', 'invoiceIdOrUpr'],
    ['Type', 'accType'], ['Type', 'type'], ['Type', 'accountType'],
    ['ToBIC', 'agent'], ['ToBIC', 'destination'], ['Code', 'QRCode'], ['Rail', 'rail'],
].map(([internalField, userField]) => ({internalField, userField, type: 'string'}));

test('all four presets validate against the adapter', () => {
    assert.equal(model.validateRequestForms(defaults), true);
    for (const id of model.presetIds) assert.deepEqual(model.validatePreset(id, defaults.presets[id], mappings), []);
});
test('domestic account sends one alias per internal field and omits rail', () => {
    assert.deepEqual(model.buildVerificationPayload('domesticAccount', defaults.presets.domesticAccount,
        {Alias: ' 123 ', ToBIC: 'BANKBIC'}, mappings), {accNo: '123', accType: 'ACCT', agent: 'BANKBIC'});
});
test('P2G, SOMQR and PAPSS build distinct payloads', () => {
    assert.deepEqual(model.buildVerificationPayload('domesticP2g', defaults.presets.domesticP2g,
        {Alias: 'INV1', Type: 'INVOICE', ToBIC: 'BANKBIC'}, mappings), {invoiceIdOrUpr: 'INV1', accountType: 'INVOICE', agent: 'BANKBIC'});
    assert.deepEqual(model.buildVerificationPayload('domesticQr', defaults.presets.domesticQr, {Code: 'SOMQR-data'}, mappings), {QRCode: 'SOMQR-data'});
    assert.equal(model.buildVerificationPayload('papssAccount', defaults.presets.papssAccount,
        {Alias: '123', ToBIC: 'BANKBIC'}, mappings).rail, 'PAPSS');
});
test('changed names, order and defaults control the outgoing payload', () => {
    const preset = structuredClone(defaults.presets.domesticAccount);
    preset.fields.reverse();
    preset.fields.find(f => f.internalField === 'Alias').userField = 'accountNo';
    preset.fields.find(f => f.internalField === 'Type').defaultValue = 'IBAN';
    assert.deepEqual(model.buildVerificationPayload('domesticAccount', preset,
        {Alias: '123', ToBIC: 'BANKBIC'}, mappings), {agent: 'BANKBIC', accType: 'IBAN', accountNo: '123'});
});
test('missing fields, unsupported types, stale aliases and conflicting names are rejected', () => {
    const preset = structuredClone(defaults.presets.domesticAccount);
    assert.throws(() => model.buildVerificationPayload('domesticAccount', preset, {Alias: '123'}, mappings));
    assert.throws(() => model.buildVerificationPayload('domesticAccount', preset, {Alias: '123', Type: 'BILL', ToBIC: 'BANKBIC'}, mappings));
    preset.fields[0].userField = 'removedAlias';
    assert(model.validatePreset('domesticAccount', preset, mappings).length);
    preset.fields[0].userField = 'agent';
    assert(model.validatePreset('domesticAccount', preset, mappings).some(e => e.includes('unique')));
    preset.fields.pop();
    assert(model.validatePreset('domesticAccount', preset, mappings).some(e => e.includes('Required fields')));
    assert(model.validatePreset('papssAccount', defaults.presets.papssAccount, mappings.filter(m => m.internalField !== 'Rail')).length);
});
test('sensitive defaults, extra persisted data and malformed option arrays are rejected', () => {
    const preset = structuredClone(defaults.presets.domesticAccount);
    preset.fields[0].defaultValue = 'real-account';
    assert(model.validatePreset('domesticAccount', preset).length);
    preset.fields[1].options = {};
    assert(model.validatePreset('domesticAccount', preset).length);
    const forms = structuredClone(defaults);
    forms.response = {secret: 'not allowed'};
    assert.equal(model.validateRequestForms(forms), false);
});

function apiHarness() {
    let writes = 0, upstreamStatus = 200, profile = 'test', backupFailure = false, readFailure = false, transportCode;
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'sps-verification-'));
    test.after(() => {
        assert(path.resolve(directory).startsWith(path.join(path.resolve(os.tmpdir()), 'sps-verification-')));
        fs.rmSync(directory, {recursive: true, force: true});
    });
    const target = path.join(directory, 'runtime-config', 'verification-forms.json');
    fs.mkdirSync(path.dirname(target));
    fs.writeFileSync(target, JSON.stringify(defaults));
    const upstreamCalls = [];
    const mockFs = {...fs,
        readFileSync(file, ...args) {
            if (file.endsWith('app-config.json')) return JSON.stringify({config: {profile, api: {baseUrl: 'https://configured-backend'}}});
            if (readFailure && file === target) throw Object.assign(new Error('denied'), {code: 'EACCES'});
            return fs.readFileSync(file, ...args);
        },
        writeFileSync(file, ...args) {
            if (backupFailure && file.includes(`${path.sep}backups${path.sep}`)) throw Object.assign(new Error('denied'), {code: 'EACCES'});
            return fs.writeFileSync(file, ...args);
        },
        renameSync(from, to) {fs.renameSync(from, to); writes++;},
    };
    const storage = compile('utils/verificationFormsStorage.ts', id => id === 'node:fs' ? mockFs : id.endsWith('verificationForms') ? model : require(id));
    const axios = {isAxiosError: e => e.isAxiosError, get: async (url, options) => {
        upstreamCalls.push({url, options});
        if (transportCode) throw {isAxiosError: true, code: transportCode, message: 'Internal diagnostic must not leak credentials'};
        if (upstreamStatus !== 200) throw {isAxiosError: true, response: {status: upstreamStatus}};
        return {data: {VerificationRequest: {fieldMappings: mappings}}};
    }};
    const handler = compile('pages/api/request-forms.ts', id => id === 'node:fs' ? mockFs : id === 'axios' ? axios : id.endsWith('verificationForms') ? model : id.endsWith('verificationFormsStorage') ? {...storage, createVerificationFormsStorage: () => storage.createVerificationFormsStorage(directory)} : require(id)).default;
    return {get writes() {return writes;}, upstreamCalls, directory, target,
        setRaw(raw) {fs.writeFileSync(target, raw);},
        failBackup() {backupFailure = true;}, failRead() {readFailure = true;},
        setStatus(value) {upstreamStatus = value;}, setProfile(value) {profile = value;},
        setTransportCode(value) {transportCode = value;},
        async request(method, body, token = 'Bearer test-token') {
            const result = {};
            await handler({method, body, headers: token ? {authorization: token} : {}}, {
                setHeader() {}, status(value) {result.status = value; return this;}, json(value) {result.body = value; return this;},
            });
            return result;
        }};
}

test('missing and blank files load defaults without writing; first save creates all presets', async () => {
    for (const initial of [null, '', ' \r\n\t ']) {
        const api = apiHarness();
        if (initial === null) {
            fs.unlinkSync(api.target);
            fs.rmdirSync(path.dirname(api.target));
        } else api.setRaw(initial);
        const loaded = await api.request('GET');
        assert.equal(loaded.status, 200);
        assert.equal(loaded.body.source, 'defaults');
        assert.equal(api.writes, 0);
        const preset = structuredClone(defaults.presets.domesticP2g);
        preset.fields[0].label = 'Saved invoice reference';
        assert.equal((await api.request('PUT', {presetId: 'domesticP2g', preset, revision: loaded.body.revision})).status, 200);
        const saved = JSON.parse(fs.readFileSync(api.target));
        assert.equal(saved.presets.domesticP2g.fields[0].label, 'Saved invoice reference');
        assert.deepEqual(saved.presets.papssAccount, defaults.presets.papssAccount);
        assert.equal((await api.request('GET')).body.source, 'saved');
    }
});
test('valid legacy settings migrate without changing the original; new settings take precedence', async () => {
    const api = apiHarness();
    const legacy = path.join(api.directory, 'request-forms.json');
    const customized = structuredClone(defaults);
    customized.presets.domesticAccount.fields[0].label = 'Legacy custom label';
    const raw = JSON.stringify(customized);
    fs.writeFileSync(legacy, raw);
    assert.deepEqual((await api.request('GET')).body.forms, defaults);
    fs.unlinkSync(api.target);
    const migrated = await api.request('GET');
    assert.equal(migrated.body.forms.presets.domesticAccount.fields[0].label, 'Legacy custom label');
    assert.equal(fs.readFileSync(legacy, 'utf8'), raw);
    assert.deepEqual(JSON.parse(fs.readFileSync(api.target)), customized);
});
test('invalid nonempty files require confirmed reset and are backed up byte for byte', async () => {
    for (const raw of ['{ broken json', '{}']) {
        const api = apiHarness(); api.setRaw(raw);
        const loaded = await api.request('GET');
        assert.equal(loaded.status, 422); assert.equal(loaded.body.code, 'INVALID_CONFIG');
        assert.equal(api.writes, 0);
        const body = {action: 'reset', revision: loaded.body.revision};
        assert.equal((await api.request('POST', body)).status, 400);
        assert.equal((await api.request('PUT', {revision: body.revision, presetId: 'domesticAccount', preset: defaults.presets.domesticAccount})).status, 422);
        const reset = await api.request('POST', {...body, confirmed: true});
        assert.equal(reset.status, 200);
        assert.equal(fs.readFileSync(path.join(api.directory, reset.body.backup), 'utf8'), raw);
        assert.deepEqual(JSON.parse(fs.readFileSync(api.target)), defaults);
    }
});
test('backup failure and permission failure preserve the original file', async () => {
    const api = apiHarness(); api.setRaw('invalid original');
    const loaded = await api.request('GET'); api.failBackup();
    assert.equal((await api.request('POST', {action: 'reset', confirmed: true, revision: loaded.body.revision})).status, 500);
    assert.equal(fs.readFileSync(api.target, 'utf8'), 'invalid original');
    assert.equal(api.writes, 0);
    api.failRead();
    const denied = await api.request('GET');
    assert.equal(denied.status, 500); assert.equal(denied.body.code, 'CONFIG_STORAGE_ERROR');
    assert.equal(denied.body.forms, undefined); assert.equal(denied.body.revision, undefined);
});
test('reset authorization, stale revisions and storage locks prevent overwrites', async () => {
    const api = apiHarness(); api.setRaw('invalid original');
    const loaded = await api.request('GET');
    const body = {action: 'reset', confirmed: true, revision: loaded.body.revision};
    assert.equal((await api.request('POST', body, '')).status, 401);
    api.setStatus(403); assert.equal((await api.request('POST', body)).status, 403);
    api.setStatus(200); api.setProfile('prod'); assert.equal((await api.request('POST', body)).status, 403);
    api.setProfile('test'); api.setRaw('changed invalid original');
    assert.equal((await api.request('POST', body)).status, 409);
    fs.mkdirSync(path.join(api.directory, 'runtime-config', '.verification-forms.lock'));
    assert.equal((await api.request('POST', body)).body.code, 'CONFIG_BUSY');
    assert.equal(fs.readFileSync(api.target, 'utf8'), 'changed invalid original');
});
test('save persists one preset, rereads it, and rejects stale concurrent revisions', async () => {
    const api = apiHarness();
    const initial = await api.request('GET');
    const preset = structuredClone(initial.body.forms.presets.domesticAccount);
    preset.fields[0].label = 'Beneficiary Account';
    const body = {presetId: 'domesticAccount', preset, revision: initial.body.revision};
    assert.equal((await api.request('PUT', body)).status, 200);
    assert.equal((await api.request('PUT', body)).status, 409);
    const saved = await api.request('GET');
    assert.equal(saved.body.forms.presets.domesticAccount.fields[0].label, 'Beneficiary Account');
    assert.deepEqual(saved.body.forms.presets.domesticP2g, defaults.presets.domesticP2g);
    assert.equal(api.writes, 1);
    assert.equal(api.upstreamCalls[0].url, 'https://configured-backend/api/v1/Adapter');
});
test('save requires backend authorization and rejects production and invalid presets', async () => {
    const api = apiHarness();
    const initial = await api.request('GET');
    const body = {presetId: 'domesticAccount', preset: defaults.presets.domesticAccount, revision: initial.body.revision};
    assert.equal((await api.request('PUT', body, '')).status, 401);
    api.setStatus(403);
    assert.equal((await api.request('PUT', body)).status, 403);
    api.setStatus(200); api.setProfile('prod');
    assert.equal((await api.request('PUT', body)).status, 403);
    api.setProfile('test');
    assert.equal((await api.request('PUT', {...body, preset: {fields: []}})).status, 400);
    assert.equal(api.writes, 0);
});

test('backend TLS and connection failures explain the cause and never write settings', async () => {
    const api = apiHarness();
    const loaded = await api.request('GET');
    const body = {presetId: 'domesticAccount', preset: defaults.presets.domesticAccount, revision: loaded.body.revision};
    for (const [transport, expected] of [
        ['DEPTH_ZERO_SELF_SIGNED_CERT', 'BACKEND_TLS_UNTRUSTED'],
        ['ERR_TLS_CERT_ALTNAME_INVALID', 'BACKEND_TLS_HOSTNAME'],
        ['CERT_HAS_EXPIRED', 'BACKEND_TLS_DATES'],
        ['ECONNREFUSED', 'BACKEND_CONNECTION_FAILED'],
    ]) {
        api.setTransportCode(transport);
        const response = await api.request('PUT', body);
        assert.equal(response.status, 502);
        assert.equal(response.body.code, expected);
        assert(!response.body.message.includes('Internal diagnostic'));
    }
    assert.equal(api.writes, 0);
});

test('certificate bypass requires explicit opt-in and a dev/test profile', async () => {
    const previous = process.env.SIPS_BACKEND_ALLOW_SELF_SIGNED;
    try {
        for (const [flag, profile, bypass] of [['true', 'test', true], ['true', 'dev', true], ['false', 'test', false], ['true', 'unknown', false]]) {
            process.env.SIPS_BACKEND_ALLOW_SELF_SIGNED = flag;
            const api = apiHarness(); api.setProfile(profile);
            const loaded = await api.request('GET');
            await api.request('PUT', {presetId: 'domesticAccount', preset: defaults.presets.domesticAccount, revision: loaded.body.revision});
            assert.equal(api.upstreamCalls[0].options.httpsAgent?.options.rejectUnauthorized === false, bypass);
        }
        const api = apiHarness(); api.setProfile('prod');
        const loaded = await api.request('GET');
        assert.equal((await api.request('PUT', {presetId: 'domesticAccount', preset: defaults.presets.domesticAccount, revision: loaded.body.revision})).status, 403);
        assert.equal(api.upstreamCalls.length, 0);
    } finally {
        if (previous === undefined) delete process.env.SIPS_BACKEND_ALLOW_SELF_SIGNED;
        else process.env.SIPS_BACKEND_ALLOW_SELF_SIGNED = previous;
    }
});

test('settings panel previews fake data, cancels without saving, and saves edited labels', async () => {
    let state = [], cursor = 0, saved, closed = false, currentMappings = mappings;
    const react = {useEffect() {}, useRef() {return {current: null};}, useState(initial) {const i = cursor++; if (!(i in state)) state[i] = typeof initial === 'function' ? initial() : initial; return [state[i], v => state[i] = typeof v === 'function' ? v(state[i]) : v];}};
    const jsx = (type, props) => ({type, props});
    const Settings = compile('component/RequestForm/VerificationFormSettings.tsx', id => id === 'react' ? react : id === 'react/jsx-runtime' ? {jsx, jsxs: jsx} : id.endsWith('verificationForms') ? model : id.endsWith('gatewayFormOptions') ? compile('constants/gatewayFormOptions.ts') : {}).default;
    const walk = n => !n || typeof n !== 'object' ? [] : [n, ...[n.props?.children].flat(Infinity).flatMap(walk)];
    const render = () => {cursor = 0; return walk(Settings({id: 'domesticAccount', preset: defaults.presets.domesticAccount, mappings: currentMappings, onReloadAdapter: async () => {currentMappings = mappings.filter(m => m.userField !== 'accNo');}, onSave: async preset => {saved = preset;}, onClose: () => {closed = true;}}));};
    let nodes = render();
    assert.equal(nodes[0].type, 'dialog');
    assert.equal(nodes[0].props['aria-modal'], 'true');
    assert(nodes.find(n => n.type === 'pre').props.children.includes('<identifier>'));
    nodes.find(n => n.props?.children === 'Cancel').props.onClick();
    assert(closed); assert.equal(saved, undefined);
    nodes.find(n => n.props?.label === 'Display label' && n.props.value === 'Account Number').props.onChange({target: {value: 'Beneficiary Account'}});
    nodes = render();
    nodes.find(n => n.props?.children === 'Save & Apply').props.onClick();
    await Promise.resolve();
    assert.equal(saved.fields[0].label, 'Beneficiary Account');
    nodes = render();
    nodes.find(n => n.props?.label === 'Default Destination Bank').props.onChange({target: {value: 'AGROSOS0'}});
    nodes = render();
    nodes.find(n => n.props?.children === 'Save & Apply').props.onClick();
    await Promise.resolve();
    assert.equal(saved.fields.find(f => f.internalField === 'ToBIC').defaultValue, 'AGROSOS0');
    nodes = render();
    nodes.find(n => Array.isArray(n.props?.children) && n.props.children.includes('Reload Adapter')).props.onClick();
    await Promise.resolve();
    nodes = render();
    assert(nodes.find(n => n.props?.label === 'Display label' && n.props.value === 'Beneficiary Account'));
    assert.equal(nodes.find(n => n.props?.children === 'Save & Apply').props.disabled, true);
});

test('destination defaults are prefilled, overridable, validated and still required when cleared', () => {
    const preset = structuredClone(defaults.presets.domesticAccount);
    preset.fields.find(f => f.internalField === 'ToBIC').defaultValue = 'AGROSOS0';
    assert.deepEqual(model.validatePreset('domesticAccount', preset, mappings), []);
    assert.equal(model.buildVerificationPayload('domesticAccount', preset, {Alias: '123'}, mappings).agent, 'AGROSOS0');
    assert.equal(model.buildVerificationPayload('domesticAccount', preset, {Alias: '123', ToBIC: 'ZKBASOS0'}, mappings).agent, 'ZKBASOS0');
    assert.throws(() => model.buildVerificationPayload('domesticAccount', preset, {Alias: '123', ToBIC: ''}, mappings));
    preset.fields.find(f => f.internalField === 'ToBIC').defaultValue = 'invalid';
    assert(model.validatePreset('domesticAccount', preset, mappings).length);
});

test('verification page switches methods, applies saved aliases, and saving never verifies', async () => {
    let state = [], cursor = 0;
    const posts = [], saves = [], discoveries = [];
    let discoveryFailure = true;
    let verificationFailure = null;
    const react = {Fragment: 'fragment', useEffect() {},
        useState(initial) {const i = cursor++; if (!(i in state)) state[i] = typeof initial === 'function' ? initial() : initial; return [state[i], value => state[i] = typeof value === 'function' ? value(state[i]) : value];},
        useRef(initial) {const i = cursor++; return state[i] ?? (state[i] = {current: initial});}};
    const jsx = (type, props) => ({type, props});
    const helpers = compile('utils/endpointHelpers.ts');
    const options = compile('constants/gatewayFormOptions.ts');
    const resolve = id => {
        if (id === 'react') return react;
        if (id === 'react/jsx-runtime') return {jsx, jsxs: jsx};
        if (id === 'axios') return {isAxiosError: error => !!error?.isAxiosError};
        if (id.endsWith('verificationForms')) return model;
        if (id.endsWith('validateSOMQR')) return compile('utils/validateSOMQR.ts');
        if (id.endsWith('extractErrorMessage')) return {extractErrorMessage: (error, fallback) => error?.message ?? fallback};
        if (id.endsWith('endpointHelpers')) return helpers;
        if (id.endsWith('gatewayFormOptions')) return options;
        if (id.endsWith('validation')) return {validateUrl: () => true};
        if (id.endsWith('useEndpoints')) return {__esModule: true, default: () => ({endpoints: {
            VerificationRequest: {fieldMappings: mappings},
            ParticipantDiscoveryRequest: {fieldMappings: [{internalField: 'Rail', userField: 'rail'}, {internalField: 'Online', userField: 'online'}]},
            ParticipantDiscoveryResponse: {fieldMappings: [{internalField: 'Participants', userField: 'participants'}]},
        }, loading: false, error: null})};
        if (id.endsWith('useAxiosPrivate')) return {__esModule: true, default: () => ({post: async (url, payload) => {
            if (url.endsWith('/Discovery')) {discoveries.push(payload);
                if (discoveryFailure) throw {isAxiosError: true, response: {status: 503, data: {code: 'PAPSS_DISABLED', message: 'PAPSS is not enabled.'}}};
                return {status: 200, data: {participants: [
                {bic: 'AGROSOS0', name: 'Agro', countryCode: 'SO'},
                {bic: 'TESTKEN0', name: 'Kenya Test', countryCode: 'KE'},
                {bic: null, name: 'Missing BIC', countryCode: 'SO'},
            ]}};}
            if (verificationFailure) throw verificationFailure;
            posts.push(payload); return {status: 200, data: {}};
        }})};
        if (id.endsWith('AuthProvider')) return {useAuthentication: () => ({roles: ['configuration', 'gateway'], config: {profile: 'test', api: {baseUrl: 'https://backend'}}, keycloak: {token: 'token', updateToken: async () => {}}})};
        if (id === 'next/router') return {useRouter: () => ({replace() {}, push() {}})};
        return {__esModule: true, default: id};
    };
    const Page = compile('pages/api-tester/verify.tsx', resolve).default;
    const walk = node => !node || typeof node !== 'object' ? [] : [node, ...[node.props?.children].flat(Infinity).flatMap(walk)];
    const render = () => {cursor = 0; return walk(Page());};
    const button = text => render().find(node => node.props?.onClick &&
        (node.props.children === text || [node.props.children].flat().some(child => child?.props?.children === text)))
        ?? render().find(node => node.props?.children === text);
    const input = label => render().find(node => node.props?.label === label);
    const originalFetch = global.fetch;
    let file = structuredClone(defaults), source = 'defaults', invalid = false, resets = 0;
    global.fetch = async (url, opts) => {
        assert.equal(url, '/api/request-forms');
        if (opts.method === 'POST') {
            assert.equal(JSON.parse(opts.body).confirmed, true);
            resets++; invalid = false; file = structuredClone(defaults); source = 'saved';
            return {ok: true, json: async () => ({forms: file, revision: 'reset-revision', source, backup: 'runtime-config/backups/test.json', mappings: {VerificationRequest: {fieldMappings: mappings}}})};
        }
        if (invalid) return {ok: false, json: async () => ({code: 'INVALID_CONFIG', revision: 'broken-revision', message: 'Invalid settings'})};
        if (opts.method === 'PUT') {const body = JSON.parse(opts.body); saves.push(body); file.presets[body.presetId] = body.preset;}
        return {ok: true, json: async () => ({forms: file, revision: 'test-revision', source})};
    };
    try {
        await button('Reload shared settings').props.onClick();
        await new Promise(resolve => setImmediate(resolve));
        assert(input('Account Number'));
        assert(button('Using default settings. Configure and save to persist changes.'));
        button('P2G Verification').props.onClick();
        assert(input('Bill / Invoice / UPR Reference'));
        assert.equal(input('Reference Type').props.value, 'BILL');
        input('Bill / Invoice / UPR Reference').props.onChange({target: {value: 'INV-123'}});
        input('Destination Bank').props.onChange({target: {value: 'BANKBIC'}});
        await button('Send Verification Request').props.onClick();
        assert.deepEqual(posts[0], {invoiceIdOrUpr: 'INV-123', accountType: 'BILL', agent: 'BANKBIC'});
        const backendError = {code: 'VERIFY_FAILED', message: 'Verification failed'};
        verificationFailure = {isAxiosError: true, response: {status: 400, data: backendError}};
        await button('Send Verification Request').props.onClick();
        assert(!render().find(node => node.props?.title === 'Error'));
        button('View Response Payload').props.onClick();
        const responsePopup = render().find(node => node.props?.title === 'Verification Response');
        assert.deepEqual(responsePopup.props.data, backendError);
        assert.equal(responsePopup.props.subtitle, undefined);
        assert.equal(responsePopup.props.rawResponse, true);
        responsePopup.props.onClose();
        verificationFailure = {isAxiosError: true, message: 'Network Error'};
        await button('Send Verification Request').props.onClick();
        assert.equal(button('View Response Payload').props.disabled, true);
        assert(button('No response received'));
        verificationFailure = null;
        button('SOMQR Verification').props.onClick();
        const scanner = () => render().find(node => node.props?.onManualChange);
        scanner().props.onManualChange('invalid SOMQR');
        assert.equal(scanner().props.validationError, '');
        assert.equal(button('Send Verification Request').props.disabled, false);
        await button('Send Verification Request').props.onClick();
        assert.equal(posts.length, 1);
        assert.match(scanner().props.validationError, /not a supported/);
        const SOMQR = '000201' + '1'.repeat(40);
        scanner().props.onManualChange(SOMQR);
        assert.equal(scanner().props.validationError, '');
        assert.equal(posts.length, 1);
        await button('Send Verification Request').props.onClick();
        assert.deepEqual(posts.pop(), {QRCode: SOMQR});
        scanner().props.onClear();
        assert.equal(button('Send Verification Request').props.disabled, true);
        input('Payment Rail').props.onChange({target: {value: 'PAPSS'}});
        assert(!button('P2G Verification'));
        assert(!input('Account Number')); assert.equal(discoveries.length, 0);
        assert(!button('Send Verification Request'));
        await button('Load PAPSS Participants').props.onClick();
        assert.deepEqual(discoveries[0], {rail: 'PAPSS', online: true});
        assert(button('PAPSS_DISABLED: PAPSS is not enabled.'));
        button('View Discovery Request').props.onClick();
        let viewer = render().find(node => node.props?.title === 'PAPSS Discovery Request');
        assert.equal(viewer.props.isOpen, true);
        assert.deepEqual(viewer.props.data, discoveries[0]);
        viewer.props.onClose();
        button('View Discovery Response').props.onClick();
        viewer = render().find(node => node.props?.title === 'PAPSS Discovery Response');
        assert.deepEqual(viewer.props.data, {code: 'PAPSS_DISABLED', message: 'PAPSS is not enabled.'});
        viewer.props.onClose();
        discoveryFailure = false;
        await button('Retry Discovery').props.onClick();
        button('View Discovery Response').props.onClick();
        viewer = render().find(node => node.props?.title === 'PAPSS Discovery Response');
        assert.equal(viewer.props.data.participants.length, 3);
        assert.deepEqual(Object.keys(viewer.props.data), ['participants']);
        viewer.props.onClose();
        assert.equal(input('Destination Country').props.options.length, 2);
        assert(!input('Account Number'));
        input('Destination Country').props.onChange({target: {value: 'SO'}});
        assert.deepEqual(input('Destination Bank').props.options.map(bank => bank.value), ['AGROSOS0']);
        input('Destination Bank').props.onChange({target: {value: 'AGROSOS0'}});
        assert(input('Account Number'));
        input('Destination Country').props.onChange({target: {value: 'KE'}});
        assert.equal(input('Destination Bank').props.value, ''); assert(!input('Account Number'));
        input('Destination Bank').props.onChange({target: {value: 'TESTKEN0'}});
        assert(input('Account Number'));
        const configure = button('Configure PAPSS Account Verification');
        configure.props.onClick();
        const panel = render().find(node => node.props?.onSave);
        const changed = structuredClone(file.presets.papssAccount);
        changed.fields[0].label = 'Beneficiary Identifier';
        changed.fields[0].userField = 'accountNo';
        await panel.props.onSave(changed);
        assert.equal(posts.length, 1);
        assert.equal(saves.length, 1);
        assert(!JSON.stringify(saves).includes('INV-123'));
        assert(!input('Beneficiary Identifier'));
        await button('Load PAPSS Participants').props.onClick();
        input('Destination Country').props.onChange({target: {value: 'SO'}});
        input('Destination Bank').props.onChange({target: {value: 'AGROSOS0'}});
        assert.equal(input('Beneficiary Identifier').props.value, '');
        await button('Reload PAPSS Participants').props.onClick();
        assert.equal(input('Destination Country').props.value, '');
        assert(!input('Beneficiary Identifier'));
        invalid = true;
        button('Reload shared settings').props.onClick();
        await new Promise(resolve => setImmediate(resolve));
        assert(!button('Send Verification Request'));
        button('Back up & Reset to Defaults').props.onClick();
        assert.equal(resets, 0);
        const confirmation = render().find(node => node.props?.title === 'Back up & Reset Verification Settings');
        assert(confirmation);
        confirmation.props.onConfirm();
        await new Promise(resolve => setImmediate(resolve));
        assert.equal(resets, 1);
        assert(render().find(node => node.props?.onSave));
        assert.equal(posts.length, 1);
    } finally {global.fetch = originalFetch;}
});
