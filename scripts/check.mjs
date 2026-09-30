import {readFile,access,readdir} from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const root=path.resolve('dist');const html=await readFile(path.join(root,'index.html'),'utf8');const css=await readFile(path.join(root,'styles.css'),'utf8');
execFileSync(process.execPath,['--check','dist/app.js']);
const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
const errors=[];for(const match of html.matchAll(/(?:src|href)="([^"#][^"]*)"/g)){const ref=match[1];if(ref.startsWith('/'))try{await access(path.join(root,ref));}catch{errors.push(`Missing asset: ${ref}`)}}
for(const match of css.matchAll(/url\(['"]?([^)'" ]+)/g)){if(match[1].startsWith('/'))try{await access(path.join(root,match[1]));}catch{errors.push(`Missing CSS asset: ${match[1]}`)}}
for(const match of html.matchAll(/href="#([^"]+)"/g))if(!ids.has(match[1]))errors.push(`Missing anchor: ${match[1]}`);
if(!html.includes('Formulario de demostración.'))errors.push('Missing demo disclosure');
if(!html.includes('noindex,nofollow'))errors.push('Missing prototype noindex');
if(/<\/option\s+value=/.test(html))errors.push('Malformed option tags');
if(errors.length)throw Error(errors.join('\n'));
console.log('PASS: JavaScript syntax, local assets, font assets, navigation anchors, demo disclosure and noindex.');
