(() => {
 'use strict';
 const num=value=>{if(typeof value!=='number'&&!(typeof value==='string'&&value.trim()))return null;const n=Number(value);return Number.isFinite(n)?n:null};
 const positive=value=>{const n=num(value);return n>0?n:null};
 const format=new Intl.NumberFormat('pt-BR',{maximumFractionDigits:2});
 const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const fold=value=>String(value??'').normalize('NFD').replace(/\p{Diacritic}/gu,'').toLocaleLowerCase('pt-BR').trim();
 const collator=new Intl.Collator('pt-BR',{numeric:true,sensitivity:'base'});
 const matches=(query,fields)=>{const hay=fold(fields.join(' '));return fold(query).split(/\s+/).filter(Boolean).every(term=>hay.includes(term))};
 const layouts=['compact','large','list'];
 const buttons=(current,attr)=>layouts.map(mode=>{
  const label={large:'Capas grandes',compact:'Grade compacta',list:'Lista detalhada'}[mode];
  const icon={large:'▥',compact:'▦',list:'☷'}[mode];
  return '<button type="button" '+attr+'="'+mode+'" aria-pressed="'+(mode===current)+'" aria-label="'+label+'" title="'+label+'" class="'+(mode===current?'active':'')+'">'+icon+'</button>';
 }).join('');
 function progress(current,total,complete=false){
  const n=num(current), denominator=positive(total), amount=n===null?null:Math.max(0,n);
  return {amount,total:denominator,complete,caughtUp:!complete&&denominator!==null&&amount!==null&&amount>=denominator,percent:complete?100:amount===null||denominator===null?null:Math.min(100,100*(amount/denominator))};
 }
 function manga(entry,manual,source={}){
  const media=entry?.media||{};
  const original=positive(source.original_chapters??source.originalChapters??source.original?.chapter);
  const translated=positive(source.translated_chapters??source.translatedChapters??source.translation?.chapter??source.mangadex?.chapter);
  const candidates=[
   [media.status==='FINISHED'?positive(media.chapters):null,'Total da obra · AniList'],
   [original,'Capítulos publicados · original'],
   [positive(manual),'Capítulos publicados · referência pessoal'],
   [positive(source.chapter),source.source?'Referência publicada · '+source.source:'Referência publicada'],
   [translated,'Capítulos publicados · tradução']
  ];
  const selected=candidates.find(([count])=>count!==null);
  return {...progress(entry?.progress,selected?.[0],entry?.status==='COMPLETED'),reference:selected?.[1]};
 }
 function anime(rows,metadata={}){
  const episodes=new Set();
  let unidentified=false;
  const seasons=new Set(rows.map(row=>num(row.season)));
  for(const row of rows){
   if(row.completed!==true)continue;
   const season=num(row.season),episode=num(row.episode??row.episode_number);
   const id=row.episode_id??row.content_id??row.panel?.id;
   if(season!==null&&season>=0&&episode!==null&&episode>=0)episodes.add('number:'+season+':'+episode);
   else if(id!=null&&id!=='')episodes.add('id:'+String(id));
   else unidentified=true;
  }
  const reported=[...new Set(rows.map(row=>positive(row.series_total_episodes)).filter(value=>value!==null))];
  const hasScope=metadata.confirmed===true&&seasons.size===1&&seasons.has(metadata.season);
  const total=reported.length===1?reported[0]:hasScope?positive(metadata.episodes):null;
  const complete=metadata.userStatus==='COMPLETED';
  return {...progress(episodes.size,unidentified?null:total,complete),unidentified,reference:hasScope?'Temporada '+metadata.season+' · publicação AniList':total?'Episódios publicados na série':null};
 }
 function meter(model,{unit,status=''}){
  const {amount,total,percent,complete,caughtUp,unidentified,reference}=model;
  const known=percent!==null;
  const absolute=amount===null?'Progresso não informado':format.format(amount)+(total!==null?'/'+format.format(total):'')+' '+unit;
  const caption=[status||(complete?'Concluído':''),absolute,known?format.format(percent)+'%':'total não confirmado',
   reference,unidentified?'há conclusões sem identificação':''].filter(Boolean).join(' · ');
  const attributes=known?' aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+percent+'"':'';
  const state=complete?'finished':caughtUp?'caught-up':'ongoing';
  return '<div class="progress-wrap atlas-media-progress" data-progress-state="'+(known?'known':'unknown')+'"><div class="profile-progress '+state+(known?'':' unverified')+'" role="progressbar" aria-label="'+escape(caption)+'"'+attributes+'>'+(known?'<i style="width:'+percent+'%"></i>':'')+'</div><span class="progress-caption">'+escape(caption)+'</span></div>';
 }
 function animeLibrary(groups,{query='',year='all',filter='all',sort='score',score=()=>0}={}){
  const latest=group=>group.rows.reduce((date,row)=>(row.date||'')>date?row.date:date,'');
  const state=group=>filter==='all'||filter==='complete'&&group.rows.every(row=>row.completed===true)||
   filter==='partial'&&group.rows.some(row=>row.completed!==true)||filter==='unknown'&&group.rows.some(row=>!row.metadata);
  return groups.filter(group=>state(group)&&(year==='all'||group.years.has(year))&&matches(query,[group.title]))
   .sort((a,b)=>(sort==='score'?score(b)-score(a):sort==='recent'?latest(b).localeCompare(latest(a)):sort==='count'?b.rows.length-a.rows.length:0)||collator.compare(a.title,b.title));
 }
 globalThis.atlasLibrary={progress,manga,anime,meter,matches,collator,layouts,buttons,animeLibrary,animeMetadata:new Map()};
})();
