import {createClient} from 'https://esm.sh/@supabase/supabase-js@2';
const $=id=>document.getElementById(id),cfg=window.ATLAS_CONFIG||{};
let db,user,mangas=[],episodes=[];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const visible=(id,v)=>$(id).hidden=!v;
const title=m=>m?.title?.english||m?.title?.romaji||m?.title?.native||'Sem título';
function notice(s){$('notice').textContent=s;$('notice').classList.add('show');setTimeout(()=>$('notice').classList.remove('show'),6500)}
async function readAll(table){let data=[],offset=0;for(;;){const r=await db.from(table).select('*').eq('user_id',user.id).range(offset,offset+999);if(r.error)throw r.error;data.push(...r.data);if(r.data.length<1000)return data;offset+=1000}}
async function refresh(){try{const [all,watched]=await Promise.all([readAll('library_entries'),readAll('watch_events')]);mangas=all.filter(x=>x.media_type==='MANGA');episodes=watched;const series=new Set(watched.map(x=>x.crunchyroll_series_id||x.payload?.series||x.source_event_id));$('mangaCount').textContent=mangas.length;$('animeCount').textContent=all.filter(x=>x.media_type==='ANIME').length;$('episodeCount').textContent=watched.length;$('seriesCount').textContent=series.size;renderManga();renderAnime()}catch(e){notice('Erro de leitura: '+e.message)}}
function renderManga(){const search=$('mangaSearch').value.toLowerCase();$('mangaList').innerHTML=mangas.filter(e=>title(e.payload?.media).toLowerCase().includes(search)).slice(0,240).map(e=>{const m=e.payload?.media||{},cover=m.coverImage?.large||'';return '<article><div class="cover">'+(cover?'<img loading="lazy" src="'+esc(cover)+'">':'')+'</div><div class="body"><b>'+esc(title(m))+'</b><small>'+esc(e.status)+' · '+e.progress+' capítulos</small><a href="https://anilist.co/manga/'+e.anilist_id+'" target="_blank" rel="noopener noreferrer">AniList ↗</a></div></article>'}).join('')||'<p>Sem mangás. Use a aba Importar.</p>'}
function renderAnime(){const groups=new Map();for(const e of episodes){const r=e.payload||{},key=e.crunchyroll_series_id||r.series||e.source_event_id;if(!groups.has(key))groups.set(key,{name:r.series||'Não identificado',rows:[]});groups.get(key).rows.push(r)}const search=$('animeSearch').value.toLowerCase();$('animeList').innerHTML=[...groups.values()].filter(g=>g.name.toLowerCase().includes(search)).slice(0,240).map(g=>{const r=g.rows.sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')))[0],dur=Number(r.duration_ms)/1000,head=Number(r.playhead),pct=r.completed?100:dur>0&&r.playhead!=null?Math.max(0,Math.min(100,100*head/dur)):null;return '<article><div class="cover">'+(r.thumbnail?'<img loading="lazy" src="'+esc(r.thumbnail)+'">':'')+'</div><div class="body"><b>'+esc(g.name)+'</b><small>'+g.rows.length+' reproduções · Episódio '+esc(r.episode??'—')+'</small><small>'+(r.completed?'✓ Assistido':pct===null?'Progresso indisponível':Math.max(0,Math.ceil((dur-head)/60))+' min restantes')+'</small>'+(pct===null?'':'<div class="progress"><i style="width:'+pct+'%"></i></div>')+'</div></article>'}).join('')||'<p>Sem histórico. Use a aba Importar.</p>'}
function parseAniList(data){const lists=data?.data?.MediaListCollection?.lists||data?.MediaListCollection?.lists||data?.lists;if(!Array.isArray(lists))throw Error('Estrutura AniList inválida');return lists.flatMap(l=>l.entries||[]).filter(e=>e.media?.id).map(e=>({media_type:e.media.type==='ANIME'?'ANIME':'MANGA',anilist_id:Number(e.media.id),status:e.status||null,progress:Number(e.progress)||0,personal_score:e.score||null,payload:e}))}
function parseCrunchy(data){const rows=Array.isArray(data)?data:Array.isArray(data?.data)?data.data:Array.isArray(data?.data?.items)?data.data.items:null;if(!rows)throw Error('Exportação Itamae não reconhecida');return rows.map((r,i)=>{const m=r.panel||r.metadata||{},id=r.id||r.content_id||m.id||r.episode_id;if(!id)throw Error('Registro '+(i+1)+' sem ID; importação cancelada para evitar duplicidades');const sid=r.series_id||m.series_id||m.series?.id||r.parent?.id||null;const date=r.date||r.watched_at||r.updated_at||r.date_played||null;const p={id:String(id),series_id:sid,series:r.series||m.series_title||m.series?.title||r.series_title||'',episode:r.episode??m.episode_number??null,title:r.title||m.title||'',date,playhead:r.playhead??null,duration_ms:r.duration_ms??null,thumbnail:r.thumbnail||null,completed:r.completed===true};return {source:'crunchyroll',source_event_id:String(id),crunchyroll_series_id:sid,watched_at:date&&Number.isFinite(Date.parse(date))?new Date(date).toISOString():null,completed:p.completed,playhead_seconds:p.playhead,duration_ms:p.duration_ms,payload:p}})}

const ANILIST_ENDPOINT='https://graphql.anilist.co';
const ANILIST_QUERY=`query AtlasMangaSync($name:String!,$page:Int!){MediaListCollection(userName:$name,type:MANGA){user{id name}} Page(page:$page,perPage:50){pageInfo{hasNextPage} mediaList(userName:$name,type:MANGA,sort:UPDATED_TIME_DESC){status progress score updatedAt notes startedAt{year month day} completedAt{year month day} media{id type title{romaji english native} coverImage{large medium} description(asHtml:false) chapters volumes status genres averageScore siteUrl}}}}`;
async function syncAniList(){
 const name=$('anilistUsername').value.trim(),button=$('syncAniList'),status=$('anilistSyncStatus');
 if(!user||!db)return notice('Entre na sua conta para sincronizar');
 if(!/^[a-zA-Z0-9_]{2,50}$/.test(name))return notice('Informe um nome de usuário AniList válido');
 button.disabled=true;status.textContent='Consultando AniList…';
 try{
  let page=1,entries=[],hasNext=true;
  while(hasNext){
   if(page>100)throw Error('Limite de páginas excedido. Nenhum dado foi gravado.');
   const response=await fetch(ANILIST_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({query:ANILIST_QUERY,variables:{name,page}})});
   if(!response.ok)throw Error(response.status===429?'Limite temporário do AniList. Aguarde alguns minutos e tente novamente.':'AniList respondeu HTTP '+response.status);
   const result=await response.json();
   if(result.errors?.length)throw Error(result.errors.map(e=>e.message).join('; '));
   const list=result.data?.Page?.mediaList;
   if(!Array.isArray(list))throw Error('Resposta inesperada do AniList');
   entries.push(...list);hasNext=!!result.data.Page.pageInfo?.hasNextPage;
   status.textContent='Consultando AniList… '+entries.length+' mangás encontrados';
   page++;
  }
  if(!entries.length){status.textContent='Nenhum mangá público encontrado para esse usuário.';return}
  const rows=entries.filter(e=>e?.media?.id).map(e=>({media_type:'MANGA',anilist_id:Number(e.media.id),status:e.status||null,progress:Number(e.progress)||0,personal_score:e.score??null,payload:e}));
  if(!rows.length)throw Error('Nenhum registro válido foi recebido');
  status.textContent='Salvando '+rows.length+' mangás na sua biblioteca…';
  await upload('library_entries',rows);
  await refresh();
  status.textContent=rows.length+' mangás sincronizados de '+name+'. Registros existentes foram atualizados.';
  notice('AniList sincronizado: '+rows.length+' mangás');
 }catch(err){status.textContent='Falha na sincronização: '+err.message;notice('AniList: '+err.message)}
 finally{button.disabled=false}
}

async function upload(table,rows){for(let i=0;i<rows.length;i+=100){const r=await db.from(table).upsert(rows.slice(i,i+100).map(v=>({...v,user_id:user.id})),{onConflict:table==='library_entries'?'user_id,media_type,anilist_id':'user_id,source,source_event_id'});if(r.error)throw Error('Falha no lote '+i+': '+r.error.message)}}
async function importJson(kind){const input=$(kind==='ani'?'anilistFile':'crunchyFile'),file=input.files?.[0];if(!file)return notice('Selecione um arquivo JSON');const button=$(kind==='ani'?'importAniList':'importCrunchy');button.disabled=true;try{if(file.size>50e6)throw Error('Arquivo maior que 50MB');const data=JSON.parse(await file.text()),rows=kind==='ani'?parseAniList(data):parseCrunchy(data);if(!rows.length)throw Error('Arquivo vazio');await upload(kind==='ani'?'library_entries':'watch_events',rows);notice(rows.length+' registros importados ou atualizados');await refresh()}catch(e){notice('Importação interrompida: '+e.message)}finally{button.disabled=false}}
async function session(s){user=s?.user||null;visible('auth',!user);visible('app',!!user);if(user){visible('magicSent',false);visible('magicForm',true)}$('identity').textContent=user?.email||'Biblioteca pessoal';if(user)await refresh()}
async function init(){const params=new URLSearchParams(location.search);const err=params.get('error_description')||params.get('error');if(err){notice('Acesso não concluído: '+err);history.replaceState(null,'',location.pathname)}if(!cfg.supabaseUrl?.startsWith('https://')||!cfg.supabaseAnonKey){visible('setup',true);return}try{db=createClient(cfg.supabaseUrl,cfg.supabaseAnonKey);const r=await db.auth.getSession();if(r.error)throw r.error;await session(r.data.session);db.auth.onAuthStateChange((event,s)=>{if(event==='SIGNED_IN'||event==='SIGNED_OUT')setTimeout(()=>session(s),0)})}catch(e){notice('Configuração Supabase inválida: '+e.message);visible('setup',true)}}
$('magicForm').onsubmit=async e=>{e.preventDefault();if(!db)return notice('O banco de dados ainda não está configurado');const email=$('magicEmail').value.trim();if(!email)return;const button=$('magicSubmit');button.disabled=true;button.querySelector('span').textContent='Enviando…';try{const r=await db.auth.signInWithOtp({email,options:{emailRedirectTo:cfg.siteUrl||window.location.origin+'/',shouldCreateUser:true}});if(r.error)throw r.error;visible('magicForm',false);visible('magicSent',true)}catch(err){notice('Não foi possível enviar o link: '+err.message)}finally{button.disabled=false;button.querySelector('span').textContent='Receber link de acesso'}};
$('magicAgain').onclick=()=>{visible('magicSent',false);visible('magicForm',true);$('magicEmail').focus()};
$('logout').onclick=()=>db.auth.signOut();document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>['manga','anime','import'].forEach(n=>visible('tab-'+n,n===b.dataset.tab)));
$('mangaSearch').oninput=renderManga;$('animeSearch').oninput=renderAnime;$('syncAniList').onclick=syncAniList;$('importAniList').onclick=()=>importJson('ani');$('importCrunchy').onclick=()=>importJson('crunchy');init();