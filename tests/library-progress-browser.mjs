import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';

const mangas=[
 ['Berserk',364,'CURRENT',null,'RELEASING'],
 ['Fullmetal Alchemist',116,'COMPLETED',116,'FINISHED'],
 ['Goodnight Punpun',0,'PLANNING',147,'FINISHED'],
 ['Kingdom',773,'CURRENT',null,'RELEASING']
].map(([title,progress,status,chapters,publication],i)=>({progress,status,score:0,media:{id:i+1,title:{english:title},format:'MANGA',chapters,status:publication,genres:['Drama']}}));
const anime=[
 {series_id:'done',series:'Árvore Completa',season:1,episode:1,id:'a',date:'2026-01-01',completed:true,metadata:true,series_total_episodes:4},
 {series_id:'active',series:'Ficção em curso',season:1,episode:1,id:'b',date:'2025-02-01',completed:true,metadata:true,series_total_episodes:4},
 {series_id:'active',series:'Ficção em curso',season:1,episode:1,id:'b',date:'2025-03-01',completed:true,metadata:true,series_total_episodes:4},
 {series_id:'unknown',series:'Série sem total',season:1,episode:1,id:'c',date:'2026-03-01',completed:true,metadata:true}
];
const responses={'/api/library':{data:{data:{MediaListCollection:{lists:[{entries:mangas}]}}},updated:'fixture'},'historico_crunchyroll.json':anime};
const cloud=`
const responses=${JSON.stringify(responses)};
window.atlasCloud={user:{id:'fixture'},fetch:async path=>new Response(JSON.stringify(responses[path]??{}),{headers:{'Content-Type':'application/json'}}),
 animeProgressRead:async()=>({done:{userStatus:'COMPLETED'}})};
document.getElementById('atlas-private').hidden=false;
document.getElementById('atlas-access').hidden=true;
window.dispatchEvent(new Event('atlas-cloud-ready'));
`;
const server=createServer(async(req,res)=>{
 const path=new URL(req.url,'http://127.0.0.1').pathname;
 if(path==='/config.js'||path==='/atlas-cloud.js'){res.writeHead(200,{'Content-Type':'text/javascript'}).end(path==='/atlas-cloud.js'?cloud:'');return;}
 if(path!=='/'&&path!=='/atlas-library-shared.js'){res.writeHead(404).end();return;}
 res.writeHead(200,{'Content-Type':path==='/'?'text/html; charset=utf-8':'text/javascript; charset=utf-8'}).end(await readFile(path==='/'?'index.html':'atlas-library-shared.js'));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:1360,height:1000}});
 page.setDefaultTimeout(12000);
 await page.route('https://**',route=>route.fulfill({status:200,contentType:'application/json',body:'{"data":{}}'}));
 await page.goto('http://127.0.0.1:'+server.address().port);
 await page.waitForFunction(()=>typeof entries!=='undefined'&&entries.length===4);
 await page.evaluate(()=>{view='biblioteca';render()});
 const manga=title=>page.locator('#grid .manga').filter({hasText:title});
 const get=(card)=>card.locator('[role=progressbar]').getAttribute('aria-valuenow');
 assert.equal(await get(manga('Berserk')),null);
 assert.equal(await get(manga('Fullmetal Alchemist')),'100');
 assert.equal(await get(manga('Goodnight Punpun')),'0');
 assert.equal(await get(manga('Kingdom')),null);
 await page.locator('[data-layout=list]').click();
 assert.match(await page.locator('#grid').getAttribute('class'),/catalog-list/);
 await page.locator('#status').selectOption({label:'Lendo'});
 assert.equal(await page.locator('#grid .manga').count(),2);
 await page.locator('#resetFilters').click();
 await page.locator('#sort').selectOption('title');
 assert.match(await page.locator('#grid .manga').first().innerText(),/Berserk/);
 await mkdir('artifacts',{recursive:true});
 const mangaImage=await page.locator('#catalogview').screenshot({path:'artifacts/mangas.png'});
 await page.locator('button.nav[data-view=crunchyroll]').click({force:true});
 const cards=page.locator('.cr-anime-card');
 await cards.first().waitFor();
 const series=title=>cards.filter({hasText:title});
 assert.equal(await get(series('Árvore Completa')),'100');
 assert.equal(await get(series('Ficção em curso')),'25');
 assert.equal(await get(series('Série sem total')),null);
 await page.locator('[data-anime-layout=list]').click();
 assert.match(await page.locator('.cr-anime-grid').getAttribute('class'),/atlas-anime-layout-list/);
 await page.locator('#cr-search').fill('ficcao');
 assert.equal(await cards.count(),1);
 await page.locator('#cr-reset').click();
 await page.locator('#cr-sort').selectOption('count');
 assert.match(await cards.first().innerText(),/Ficção/);
 const animeImage=await page.locator('.atlas-showcase').filter({has:page.getByRole('heading',{name:'Biblioteca de animes',exact:true})}).screenshot({path:'artifacts/animes.png'});
 const comparison=await browser.newPage({viewport:{width:1600,height:1120}});
 await comparison.setContent('<body style="margin:0;background:#0b1019;display:flex;gap:12px;align-items:flex-start"><img width="790" src="data:image/png;base64,'+mangaImage.toString('base64')+'"><img width="790" src="data:image/png;base64,'+animeImage.toString('base64')+'"></body>');
 await comparison.screenshot({path:'artifacts/mangas-animes.png',fullPage:true});
 console.log('Chromium: progresso, filtros, ordenação e modos nas duas bibliotecas.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
