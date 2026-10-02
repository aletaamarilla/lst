import {readFile,access,readdir} from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const root=path.resolve('dist');const html=await readFile(path.join(root,'index.html'),'utf8');const css=await readFile(path.join(root,'styles.css'),'utf8');
execFileSync(process.execPath,['--check','dist/app.js']);
const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
const errors=[];for(const match of html.matchAll(/(?:src|href)="([^"#][^"]*)"/g)){const ref=match[1];if(ref.startsWith('/'))try{await access(path.join(root,ref));}catch{errors.push(`Missing asset: ${ref}`)}}
for(const match of css.matchAll(/url\(['"]?([^)'" ]+)/g)){if(match[1].startsWith('/'))try{await access(path.join(root,match[1]));}catch{errors.push(`Missing CSS asset: ${match[1]}`)}}
for(const match of html.matchAll(/href="#([^"]+)"/g))if(!ids.has(match[1]))errors.push(`Missing anchor: ${match[1]}`);
if(/<form\b|type="email"|mailto:|data-trip=/.test(html))errors.push('Legacy email/form contact remains');
if(!html.includes('Salida de ejemplo'))errors.push('Missing sample departure disclosure');
const whatsappLinks=[...html.matchAll(/data-whatsapp="([^"]+)" href="([^"]+)"/g)];
if(!whatsappLinks.length)errors.push('Missing WhatsApp contact');
for(const match of whatsappLinks){const url=new URL(match[2]);if(url.origin!=='https://wa.me'||url.pathname!=='/34648189257'||!url.searchParams.get('text'))errors.push('Invalid WhatsApp contact');}
for(const name of ['salvador','asturias','azores','euskadi','marruecos','cadiz','orientacion'])if(!whatsappLinks.some(match=>match[1]===name))errors.push(`Missing WhatsApp journey: ${name}`);
if(!html.includes('noindex,nofollow'))errors.push('Missing prototype noindex');
if(/<\/option\s+value=/.test(html))errors.push('Malformed option tags');
if(errors.length)throw Error(errors.join('\n'));
console.log('PASS: JavaScript syntax, local assets, font assets, navigation anchors, sample disclosure, WhatsApp journeys, absence of email forms and noindex.');
