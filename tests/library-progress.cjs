const assert=require('node:assert/strict');
const test=require('node:test');
const fs=require('node:fs');
const vm=require('node:vm');
vm.runInThisContext(fs.readFileSync('atlas-library-shared.js','utf8'));
const {progress,manga,anime,meter,matches,animeLibrary,buttons}=globalThis.atlasLibrary;

test('capítulos reais, publicação conhecida, concluído e planejado',()=>{
 assert.equal(manga({progress:364,status:'CURRENT',media:{status:'RELEASING'}}).percent,null);
 assert.equal(manga({progress:116,status:'COMPLETED',media:{status:'FINISHED',chapters:116}}).percent,100);
 assert.equal(manga({progress:0,status:'PLANNING',media:{status:'FINISHED',chapters:147}}).percent,0);
 assert.equal(manga({progress:773,status:'CURRENT',media:{status:'RELEASING',chapters:900}}).percent,null);
 assert.equal(manga({progress:364,status:'CURRENT',media:{status:'RELEASING'}},null,{chapter:400}).percent,91);
 assert.equal(manga({status:'COMPLETED',media:{}},0).percent,100);
 assert.equal(progress(undefined,10).percent,null);
 assert.equal(progress(1,0).percent,null);
 assert.equal(progress(120,100).percent,100);
 assert.equal(progress(-1,10).percent,0);
});
test('episódios concluídos únicos, temporadas separadas e marcação explícita',()=>{
 const first={completed:true,season:1,episode:1};
 const rows=[first,{...first,date:'2026-01-01'},{completed:true,season:2,episode:1},{completed:false,season:2,episode:2}];
 assert.equal(anime(rows).amount,2);
 assert.equal(anime(rows).percent,null);
 assert.equal(anime(rows,{confirmed:true,season:1,episodes:12}).percent,null);
 assert.equal(anime([first],{confirmed:true,season:1,episodes:4}).percent,25);
 assert.equal(anime(rows,{userStatus:'COMPLETED'}).percent,100);
 assert.equal(anime([{completed:true,id:'evento-1',series_total_episodes:12}]).percent,null);
});
test('barra acessível separa zero, desconhecido e concluído',()=>{
 assert.match(meter(progress(0,12),{unit:'episódios'}),/aria-valuenow="0"/);
 assert.doesNotMatch(meter(progress(364,null),{unit:'capítulos'}),/aria-valuenow|width:/);
 assert.match(meter(progress(1,null,true),{unit:'episódios'}),/finished.*aria-valuenow="100"/);
});
test('busca compartilhada sem acentos, filtros, ordenação e modos',()=>{
 assert.ok(matches('aço guerra',['A Guerra de Aco']));
 const group=(title,date,completed)=>({title,rows:[{date,completed,metadata:true}],years:new Set([date.slice(0,4)])});
 const rows=[group('Árvore','2026-01-01',true),group('Ficção','2025-01-01',false)];
 assert.deepEqual(animeLibrary(rows,{query:'arvore',year:'2026',filter:'complete'}),[rows[0]]);
 assert.deepEqual(animeLibrary(rows,{sort:'score',score:r=>r===rows[1]?1:0}),[rows[1],rows[0]]);
 for(const mode of ['compact','large','list'])assert.match(buttons(mode,'data-mode'),new RegExp('data-mode="'+mode+'" aria-pressed="true"'));
});
test('scripts clássicos do site compilam e ambos os catálogos usam o componente',()=>{
 const html=fs.readFileSync('index.html','utf8');
 for(const script of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
  if(script[2].trim()&&!/type=["']module/.test(script[1]))new vm.Script(script[2]);
 }
 assert.match(html,/atlasLibrary\.matches\(\$\('search'\)/);
 assert.match(html,/\$\{progressMarkup\(e\)\}/);
 assert.match(html,/\$\{animeProgress\(g\)\}/);
});

test('usa capítulos já publicados para qualquer obra em andamento',()=>{
 const user={progress:364,status:'CURRENT',media:{status:'RELEASING'}};
 assert.equal(manga(user,null,{original_chapters:390,translated_chapters:385}).percent,100*(364/390));
 assert.match(meter(manga(user,null,{original_chapters:390}),{unit:'capítulos lidos'}),/364\/390.*93,33%/);
 assert.match(meter(manga(user,null,{translated_chapters:390}),{unit:'capítulos lidos'}),/publicados · tradução/);
});
test('usa episódios já exibidos em vez do total planejado de anime',()=>{
 const count=atlasLibrary.publishedAnime({status:'RELEASING',episodes:24,nextAiringEpisode:{episode:10}});
 assert.equal(count,9);
 assert.equal(atlasLibrary.publishedAnime({status:'RELEASING',episodes:24}),null);
 assert.equal(atlasLibrary.publishedAnime({status:'FINISHED',episodes:24}),24);
 const rows=[{completed:true,season:1,episode:1},{completed:true,season:1,episode:1}];
 assert.equal(anime(rows,{confirmed:true,season:1,episodes:count}).percent,100*(1/9));
});

test('tradução abaixo da leitura não enche a barra de uma obra em andamento',()=>{
 const ongoing={progress:96,status:'CURRENT',media:{status:'RELEASING'}};
 const stale=manga(ongoing,null,{translated_chapters:3});
 assert.equal(stale.percent,null);
 assert.match(meter(stale,{unit:'capítulos lidos'}),/96 capítulos lidos.*3.*abaixo/);
 assert.equal(manga(ongoing,null,{original_chapters:90,translated_chapters:100}).percent,96);
 assert.equal(manga({...ongoing,status:'COMPLETED'},null,{translated_chapters:3}).percent,100);
});
