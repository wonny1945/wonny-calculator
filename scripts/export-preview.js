import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';

const assets = readdirSync('dist/assets');
const css = readFileSync(`dist/assets/${assets.find(name => name.endsWith('.css'))}`, 'utf8');
const js = readFileSync(`dist/assets/${assets.find(name => name.endsWith('.js'))}`, 'utf8').split('\n').map(line => line.trimEnd()).join('\n');
mkdirSync('previews', { recursive: true });
writeFileSync('previews/first-edition.html', `<!doctype html>
<html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Wonny Calculator — First Edition</title><style>${css}</style></head>
<body><div id="app"></div><script type="module">${js.replaceAll('</script', '<\\/script')}</script></body></html>`);
console.log('Exported previews/first-edition.html');
