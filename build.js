// Baut index.html aus src/index.src.html: JSX wird vorab uebersetzt, Babel-Standalone entfaellt.
// Aufruf: node build.js   (kein Netz noetig, Babel steckt in der Quelldatei)
const fs = require('fs'), vm = require('vm');
let src = fs.readFileSync('src/index.src.html', 'utf8');
const BABEL_MARK = '/* Babel Standalone';
const bs = src.indexOf(BABEL_MARK);
if (bs < 0) throw new Error('Babel-Block nicht gefunden');
const bTagStart = src.lastIndexOf('<script', bs), bTagEnd = src.indexOf('>', bTagStart) + 1;
const bEnd = src.indexOf('</script>', bTagEnd);
const babelCode = src.slice(bTagEnd, bEnd);
const aTagStart = src.indexOf('<script type="text/babel">');
if (aTagStart < 0) throw new Error('JSX-Block nicht gefunden');
const aTagEnd = aTagStart + '<script type="text/babel">'.length;
const aEnd = src.indexOf('</script>', aTagEnd);
const jsx = src.slice(aTagEnd, aEnd);
const ctx = { console, setTimeout, clearTimeout, TextEncoder, TextDecoder };
ctx.self = ctx; ctx.window = ctx;
ctx.document = { addEventListener() {}, querySelectorAll: () => [], readyState: 'complete' };
vm.createContext(ctx); vm.runInContext(babelCode, ctx);
const out = ctx.Babel.transform(jsx, { presets: [['react', { runtime: 'classic' }]] }).code.replace(/<\/script>/g, '<\\/script>');
// Hinten zuerst ersetzen, damit die Positionen stimmen
let res = src.slice(0, aTagStart) + '<script>' + out + src.slice(aEnd);
res = res.slice(0, bTagStart) + res.slice(res.indexOf('</script>', bTagStart) + 9);
// Versionsanzeige in der App aus sw.js uebernehmen (roadtrip-vNNN), damit sie nicht vergessen wird
const ver = (fs.readFileSync('sw.js', 'utf8').match(/roadtrip-v(\d+)/) || [])[1];
if (!ver) throw new Error('Version in sw.js nicht gefunden');
res = res.replace(/Version 1\d\d(?=<|')/g, 'Version ' + ver);
fs.writeFileSync('index.html', res);
console.log('index.html:', (res.length / 1e6).toFixed(2), 'MB');
