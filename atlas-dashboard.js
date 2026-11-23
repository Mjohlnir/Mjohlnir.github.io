(function(root,factory){
 const charts=factory();
 if(typeof module==='object'&&module.exports)module.exports=charts;
 else root.atlasDashboard=charts;
})(globalThis,function(){
 const weekdayLabels=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
 const number=new Intl.NumberFormat('pt-BR');
 const calendarDate=new Intl.DateTimeFormat('pt-BR',{dateStyle:'long'});
 const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
 const key=date=>[date.getFullYear(),date.getMonth()+1,date.getDate()].join('-');
 function localDate(value){
  if(value==null||value==='')return null;
  const date=typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)?new Date(value+'T00:00:00'):new Date(value);
  return Number.isFinite(date.getTime())?date:null;
 }
 function summarize(events,now=new Date()){
  const weekdays=Array(7).fill(0),hours=Array(24).fill(0),counts=new Map();
  let dated=0,timed=0;
  for(const event of events){
   const date=localDate(event.date);
   if(!date||date>now)continue;
   dated++;
   weekdays[date.getDay()]++;
   counts.set(key(date),(counts.get(key(date))||0)+1);
   if(event.hasTime){timed++;hours[date.getHours()]++;}
  }
  const end=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  const start=new Date(end);
  start.setDate(end.getDate()-90);
  const cells=Array.from({length:91},(_,i)=>{
   const date=new Date(start);
   date.setDate(start.getDate()+i);
   return {date,count:counts.get(key(date))||0};
  });
  return {cells,weekdays,hours,dated,timed};
 }
 function bars(values,labels,kind){
  const peak=Math.max(1,...values),total=values.reduce((a,b)=>a+b,0);
  return '<div class="atlas-dashboard-bars atlas-dashboard-'+kind+'" role="list">'+values.map((n,i)=>{
   const percent=total?(100*n/total).toLocaleString('pt-BR',{maximumFractionDigits:1}):'0';
   const description=labels[i]+' · '+number.format(n)+' · '+percent+'%';
   return '<div role="listitem" aria-label="'+description+'" title="'+description+'"><span class="atlas-dashboard-track"><i style="height:'+100*n/peak+'%"></i></span><small>'+((kind==='hour'&&i%3!==0)?'':labels[i])+'</small>'+(kind==='hour'?'':'<strong>'+number.format(n)+'</strong>')+'</div>';
  }).join('')+'</div>';
 }
 function renderActivity(events,{source,loading=false,error,now=new Date()}){
  const data=summarize(events,now);
  const heading='<h3>Mapa de calor</h3>';
  if(error)return heading+'<p class="feed-error" role="status">'+escape(error)+'</p>';
  if(loading)return heading+'<p class="muted" role="status">Carregando atividades…</p>';
  if(!data.dated)return heading+'<p class="muted">Nenhuma atividade com data disponível.</p>';
  const maximum=Math.max(1,...data.cells.map(cell=>cell.count));
  const total=data.cells.reduce((sum,cell)=>sum+cell.count,0);
  return heading+'<p class="muted mini">'+number.format(total)+' nos últimos 91 dias · '+escape(source)+'</p>'+
   '<div class="atlas-dashboard-heatmap" role="group" aria-label="Atividades nos últimos 91 dias">'+data.cells.map(cell=>{
    const label=calendarDate.format(cell.date)+' · '+number.format(cell.count)+' '+(cell.count===1?'evento':'eventos');
    const level=cell.count?Math.ceil(4*cell.count/maximum):0;
    return '<button type="button" data-atlas-heat-day="'+label+'" class="atlas-heat-'+level+'" title="'+label+'" aria-label="'+label+'"></button>';
   }).join('')+'</div><div class="atlas-dashboard-legend" aria-hidden="true">Menos '+[0,1,2,3,4].map(level=>'<i class="atlas-heat-'+level+'"></i>').join('')+' Mais</div>'+
   '<p class="atlas-dashboard-day muted mini" role="status">Selecione um dia para ver a contagem.</p>'+
   '<h4 class="activity-subtitle">Atividades por dia da semana</h4>'+bars(data.weekdays,weekdayLabels,'week')+
   '<h4 class="activity-subtitle">Horário das atividades</h4>'+(data.timed?bars(data.hours,data.hours.map((_,i)=>String(i).padStart(2,'0')+'h'),'hour'):'<p class="muted mini">A fonte informa a data, sem horário.</p>')+
   '<p class="muted mini">'+number.format(data.dated)+' eventos com data na amostra · horário local · cada evento pode representar vários capítulos ou uma reprodução.</p>';
 }
 function renderGrades(scores){
  const counts=Array(10).fill(0);
  for(const score of scores)if(Number.isFinite(score)&&score>0&&score<=10)counts[10-Math.ceil(score)]++;
  const total=counts.reduce((a,b)=>a+b,0);
  return total?bars(counts,counts.map((_,i)=>10-i),'grade')+'<p class="muted mini">'+number.format(total)+' obras avaliadas · escala 1–10</p>':'<p class="muted mini">Nenhuma obra avaliada.</p>';
 }
 function bind(root){
  root.querySelectorAll('[data-atlas-heat-day]').forEach(button=>button.onclick=()=>{
   button.closest('section').querySelector('.atlas-dashboard-day').textContent=button.dataset.atlasHeatDay;
  });
 }
 return {summarize,renderActivity,renderGrades,bind};
});