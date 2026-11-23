import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {execFileSync} from 'node:child_process';
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
const beforeHtml=execFileSync('git',['show','origin/main:index.html']);
const server=createServer(async(req,res)=>{
 const path=new URL(req.url,'http://127.0.0.1').pathname;
 if(path==='/config.js'||path==='/atlas-cloud.js'){res.writeHead(200,{'Content-Type':'text/javascript'}).end(path==='/atlas-cloud.js'?cloud:'');return;}
 if(path!=='/'&&path!=='/before'&&path!=='/atlas-library-shared.js'){res.writeHead(404).end();return;}
 res.writeHead(200,{'Content-Type':path!=='/atlas-library-shared.js'?'text/html; charset=utf-8':'text/javascript; charset=utf-8'}).end(path==='/before'?beforeHtml:await readFile(path==='/'?'index.html':'atlas-library-shared.js'));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:900,height:1000}});
 page.setDefaultTimeout(12000);
 await page.route('https://**',route=>route.fulfill({status:200,contentType:'application/json',body:'{"data":{}}'}));
 await page.goto('http://127.0.0.1:'+server.address().port);
 await page.waitForFunction(()=>typeof entries!=='undefined'&&entries.length===4);
 await page.locator('button[data-menu=mangas]').click();
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
 assert.ok(await manga('Fullmetal Alchemist').locator('[role=progressbar]').isVisible());
 const mangaImage=await page.locator('#grid').screenshot({path:'artifacts/mangas.png'});
 await page.locator('button[data-menu=animes]').click();
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
 const animeText=await cards.first().locator('.atlas-library-series>div:last-child').boundingBox();
 const animeCover=await cards.first().locator('.atlas-anime-cover').boundingBox();
 assert.ok(animeText.x-(animeCover.x+animeCover.width)<25,'Texto deve ficar junto à capa');
 assert.ok(animeText.width>animeCover.width*2,'Texto deve ocupar a largura disponível');
 await page.locator('[data-anime-layout=large]').click();
 const animeImage=await page.locator('.cr-anime-grid').screenshot({path:'artifacts/animes.png'});

 const old=await browser.newPage({viewport:{width:900,height:1000}});
 await old.route('https://**',route=>route.fulfill({status:200,contentType:'application/json',body:'{"data":{}}'}));
 await old.goto('http://127.0.0.1:'+server.address().port+'/before');
 await old.waitForFunction(()=>typeof entries!=='undefined'&&entries.length===4);
 await old.locator('button[data-menu=mangas]').click();
 await old.locator('[data-layout=list]').click();
 await old.locator('#sort').selectOption('title');
 const oldManga=await old.locator('#grid').screenshot();
 await old.locator('button[data-menu=animes]').click();
 await old.locator('.cr-anime-card').first().waitFor();
 await old.locator('#cr-sort').selectOption('count');
 const oldAnime=await old.locator('.cr-anime-grid').screenshot();
 const comparison=await browser.newPage({viewport:{width:1820,height:1000}});
 for(const [name,before,after] of [['mangas',oldManga,mangaImage],['animes',oldAnime,animeImage]]){
  const panel=(label,png)=>'<section style="width:50%"><h2>'+label+'</h2><img style="display:block;width:100%" src="data:image/png;base64,'+png.toString('base64')+'"></section>';
  await comparison.setContent('<main style="margin:0;background:#0b1019;color:white;font:16px system-ui;display:flex;gap:12px;padding:12px;align-items:flex-start">'+panel('Antes · site publicado',before)+panel('Depois · PR #2',after)+'</main>');
  await comparison.locator('main').screenshot({path:'artifacts/comparativo-'+name+'.png'});
 }
 await page.locator('button[data-menu=mangas]').click();
 await page.evaluate(async()=>{
  const original=window.atlasCloud.fetch;
  window.atlasCloud.fetch=async(path,options)=>path==='/api/capitulos-fontes'
   ?new Response(JSON.stringify({1:{original_chapters:390},4:{original_chapters:800}}),{headers:{'Content-Type':'application/json'}})
   :original(path,options);
  await atlasRefreshChapterReferences(true);
 });
 assert.match(await manga('Berserk').innerText(),/364\/390.*93,33%/);
 assert.match(await manga('Kingdom').innerText(),/773\/800.*96,63%/);
 console.log('Chromium: progresso, filtros, ordenação e modos nas duas bibliotecas.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
