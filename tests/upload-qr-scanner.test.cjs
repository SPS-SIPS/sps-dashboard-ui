const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const source = ts.transpileModule(fs.readFileSync('component/ScanToPay/UploadQRScanner/UploadQRScanner.tsx', 'utf8'), {
    compilerOptions: {module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true},
}).outputText;
function scanner({imageError = false, context = true, SOMQR = 'decoded'} = {}) {
    const output = {exports: {}};
    class Image {
        naturalWidth = 4000;
        naturalHeight = 2000;
        set src(value) {queueMicrotask(() => imageError ? this.onerror() : this.onload());}
    }
    const canvas = {getContext: () => context ? {
        drawImage() {}, getImageData: () => ({data: [], width: canvas.width, height: canvas.height}),
    } : null};
    const resolve = id => id === 'jsqr' ? (() => SOMQR ? {data: SOMQR} : null) : {};
    new Function('require', 'module', 'exports', 'Image', 'document', source)(resolve, output, output.exports, Image, {createElement: () => canvas});
    return {...output.exports, canvas};
}
test('rejects unsupported images and images over 5 MB', () => {
    const {validateQRImage} = scanner();
    assert.match(validateQRImage({type: 'image/svg+xml', size: 20}), /PNG/);
    assert.match(validateQRImage({type: 'image/png', size: 5 * 1024 * 1024 + 1}), /5 MB/);
    assert.equal(validateQRImage({type: 'image/webp', size: 1024}), null);
});
test('image load failure rejects instead of leaving scanner pending', async () => {
    await assert.rejects(scanner({imageError: true}).decodeQRImage('blob:test'), /could not be opened/);
});
test('unavailable canvas gives actionable paste fallback', async () => {
    await assert.rejects(scanner({context: false}).decodeQRImage('blob:test'), /Paste SOMQR data/);
});
test('decodes image with bounded canvas size', async () => {
    const api = scanner();
    assert.equal(await api.decodeQRImage('blob:test'), 'decoded');
    assert.equal(api.canvas.width, 2048);
    assert.equal(api.canvas.height, 1024);
});
test('image with no SOMQR returns an empty result', async () => {
    assert.equal(await scanner({SOMQR: null}).decodeQRImage('blob:test'), null);
});
