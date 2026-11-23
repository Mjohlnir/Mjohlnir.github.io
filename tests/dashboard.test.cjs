const test=require('node:test');
const assert=require('node:assert/strict');
const {summarize,renderActivity,renderGrades}=require('../atlas-dashboard.js');
require('../atlas-library-shared.js');
const now=new Date(2026,10,23,15);

test('calendário local inclui exatamente 91 dias e conta todas as reproduções',()=>{
 const events=[{date:'2026-11-23'},{date:'2026-11-23'},{date:new Date(2026,10,23,9),hasTime:true},{date:new Date(2026,10,23,18),hasTime:true},{date:null},{date:'inválida'}];
 const stats=summarize(events,now);
 assert.equal(stats.cells.length,91);
 assert.equal(stats.cells.at(-1).count,3);
 assert.equal(stats.weekdays[1],3);
 assert.equal(stats.hours[0],0);
 assert.equal(stats.hours[9],1);
 assert.equal(stats.timed,1);
});

test('gráficos distinguem indisponível, vazio e registros sem horário',()=>{
 assert.doesNotMatch(renderActivity([],{source:'AniList',loading:true,now}),/atlas-dashboard-heatmap/);
 assert.match(renderActivity([],{source:'AniList',error:'<offline>',now}),/&lt;offline&gt;/);
 assert.match(renderActivity([],{source:'AniList',now}),/Nenhuma atividade/);
 assert.match(renderActivity([{date:'2026-11-23'}],{source:'Crunchyroll',now}),/sem horário/);
 assert.match(renderGrades([0,11,null,9.5]),/1 obras avaliadas/);
});

test('histórico com 3.180 eventos preserva replays na contagem',()=>{
 const entries=Array.from({length:3180},()=>({date:'2026-11-23'}));
 const stats=summarize(entries,now);
 assert.equal(stats.dated,3180);
 assert.equal(stats.cells.at(-1).count,3180);
});

test('backup v21 mantém dimensões e recusa conteúdo inválido',()=>{
 const {parseRatingsBackup}=globalThis.atlasLibrary;
 assert.deepEqual(parseRatingsBackup({version:1,ratings:{42:{Arte:'9.5',História:0}}},['Arte','História']),{42:{Arte:9.5,História:0}});
 for(const bad of [{42:{Arte:null}},{42:{Arte:11}},{42:{Extra:9}},{version:2,ratings:{42:{Arte:10}}}]){
  assert.throws(()=>parseRatingsBackup(bad,['Arte']));
 }
});
