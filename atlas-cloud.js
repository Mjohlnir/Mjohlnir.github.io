import {createClient} from 'https://esm.sh/@supabase/supabase-js@2';
const cfg=window.ATLAS_CONFIG||{};
const $=id=>document.getElementById(id);
let db=null,account=null,library=[],watch=[],username='',sessionBusy=false,initializedFor='';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const batches=(a,n=75)=>Array.from({length:Math.ceil(a.length/n)},(_,i)=>a.slice(i*n,(i+1)*n));
const json=(obj,status=200)=>new Response(JSON.stringify(obj),{status,headers:{'content-type':'application/json; charset=utf-8'}});
function message(s,bad=false){const el=$('atlas-cloud-message');if(el){el.textContent=s;el.hidden=!s;el.classList.toggle('bad',bad)}}
async function rows(table,order){if(!account)throw Error('Faça login para acessar a biblioteca.');const result=[];for(let offset=0;offset<50000;offset+=1000){let q=db.from(table).select('*').eq('user_id',account.id).range(offset,offset+999);if(order)q=q.order(order,{ascending:false});const {data,error}=await q;if(error)throw error;result.push(...data);if(data.length<1000)return result;}throw Error('Limite de paginação atingido.');}
async function pref(key,fallback={}){const {data,error}=await db.from('user_preferences').select('value').eq('user_id',account.id).eq('preference_key',key).maybeSingle();if(error)throw error;return data?.value??fallback;}
async function setPref(key,value){const {error}=await db.from('user_preferences').upsert({user_id:account.id,preference_key:key,value,updated_at:new Date().toISOString()},{onConflict:'user_id,preference_key'});if(error)throw error;}
async function rememberAniListName(value){const name=String(value??'').trim();if(!/^[\w-]{2,50}$/.test(name))throw Error('Informe um nome de usuário AniList válido na aba Importar.');if(!account)throw Error('Entre na sua conta antes de configurar o AniList.');if(name!==username){await setPref('anilist_username',{name});username=name;}if(window.atlasCloud)window.atlasCloud.anilistUsername=name;const input=$('atlas-username');if(input&&input.value!==name)input.value=name;return name;}
function scoreTen(v,format){if(v==null||v==='')return null;let n=Number(v);if(!Number.isFinite(n)||n<0)throw Error('Nota inválida recebida do AniList.');if(format==='POINT_100'||format==='POINT_10_DECIMAL'&&n>10)n/=10;else if(format==='POINT_5')n*=2;else if(format==='POINT_3')n=n/3*10;else if(n>10&&n<=100)n/=10;if(n>10)throw Error('Nota acima da escala de 10: '+n);return Math.round(n*100)/100;}
function normalizeEntry(e,format){if(!e?.media?.id)return null;const id=Number(e.media.id),score=scoreTen(e.score,format);if(!Number.isSafeInteger(id)||id<=0)return null;const progress=Math.max(0,Math.round(Number(e.progress)||0));return {user_id:account.id,media_type:'MANGA',anilist_id:id,status:e.status||null,progress,personal_score:score,payload:{...e,score:score??0,media:e.media},updated_at:new Date().toISOString()};}
function libraryPayload(){return {data:{MediaListCollection:{lists:[{entries:library.filter(r=>r.media_type==='MANGA').map(r=>({...r.payload,media:r.payload?.media||{id:r.anilist_id},status:r.status??r.payload?.status,progress:r.progress??r.payload?.progress,score:r.personal_score??r.payload?.score??0}))}]}}};}
function thumbnailOf(r){if(typeof r?.thumbnail==='string')return r.thumbnail;const img=r?.panel?.images||r?.images||{};for(const candidate of [img.thumbnail,img.poster_tall]){if(!candidate)continue;const items=candidate.flat?.(3)||[];const selected=items.find(x=>x?.width>=600&&x?.source)||items.find(x=>x?.source);if(selected)return selected.source;}return null;}
function normalizeWatch(r){const m=r?.panel?.episode_metadata||r?.metadata?.episode_metadata||r?.metadata||{};const id=r.id||r.content_id||r.source_event_id||r.episode_id||r.panel?.id;const seriesId=r.series_id||m.series_id||r.parent_id||r.crunchyroll_series_id||null;const date=r.date||r.date_played||r.watched_at||r.updated_at||null;const duration=r.duration_ms??m.duration_ms??null;const playhead=r.playhead??r.playhead_seconds??null;return {id:id?String(id):'',episode_id:r.episode_id??r.content_id??r.panel?.id??null,series_total_episodes:r.series_total_episodes??null,series_id:seriesId?String(seriesId):null,series:r.series||m.series_title||r.series_title||'',season:r.season??m.season_number??null,episode:r.episode??m.episode_number??null,title:r.title||r.panel?.title||m.title||'',date,playhead:playhead==null?null:Number(playhead),duration_ms:duration==null?null:Number(duration),completed:r.completed===true||r.fully_watched===true,thumbnail:thumbnailOf(r),metadata:!!(r.metadata===true||m.series_title||r.series||r.episode!=null)};}
function watchPayload(){return watch.map(w=>{const p=w.payload||{};const r=normalizeWatch({...p,id:p.id||w.source_event_id,series_id:p.series_id||w.crunchyroll_series_id,date:p.date||w.watched_at,completed:p.completed??w.completed,playhead:p.playhead??w.playhead_seconds,duration_ms:p.duration_ms??w.duration_ms});return r;}).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));}
async function loadFromDb(){[library,watch]=await Promise.all([rows('library_entries'),rows('watch_events','watched_at')]);}
async function upsert(table,values,conflict,onProgress){for(let i=0;i<values.length;i+=75){const batch=values.slice(i,i+75);const {error}=await db.from(table).upsert(batch,{onConflict:conflict});if(error)throw Error('Falha no lote '+(Math.floor(i/75)+1)+': '+error.message);onProgress?.(Math.min(i+75,values.length),values.length);}}
async function gql(query,variables){const r=await fetch('https://graphql.anilist.co',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({query,variables})});const j=await r.json().catch(()=>null);if(r.status===429)throw Error('Limite temporário de consultas AniList. Aguarde e tente novamente.');const detail=Array.isArray(j?.errors)?j.errors.map(e=>e.message).filter(Boolean).join('; '):'';if(!r.ok||detail)throw Error(detail||('AniList HTTP '+r.status));if(!j?.data)throw Error('O AniList não retornou dados válidos.');return j.data;}
const MANGA_FIELDS='id type title{romaji english native} synonyms coverImage{extraLarge large medium} description(asHtml:false) format status countryOfOrigin startDate{year month day} endDate{year month day} chapters volumes genres tags{name rank} averageScore popularity siteUrl staff(perPage:12){edges{node{name{full}}}}';
async function syncAniList(name){name=await rememberAniListName(name);message('Consultando a biblioteca pública de '+name+'…');const u=await gql('query($name:String){User(name:$name){id name mediaListOptions{scoreFormat}}}',{name});if(!u.User?.id)throw Error('Usuário AniList não encontrado.');const format=u.User.mediaListOptions?.scoreFormat||null;let page=1,all=[];for(;;){if(page>60)throw Error('Muitas páginas no AniList; sincronização interrompida sem excluir registros.');const data=await gql('query($name:String,$page:Int){Page(page:$page,perPage:40){pageInfo{hasNextPage} mediaList(userName:$name,type:MANGA,sort:UPDATED_TIME_DESC){status progress progressVolumes repeat score updatedAt notes startedAt{year month day} completedAt{year month day} media{'+MANGA_FIELDS+'}}}}',{name,page});const batch=data.Page?.mediaList||[];all.push(...batch);message('AniList: '+all.length+' mangás encontrados…');if(!data.Page?.pageInfo?.hasNextPage)break;page++;}
 const normalized=all.map(e=>normalizeEntry(e,format)).filter(Boolean);const unique=[...new Map(normalized.map(e=>[e.anilist_id,e])).values()];if(!unique.length)throw Error('O AniList não retornou mangás para este usuário.');message('Salvando '+unique.length+' mangás na sua conta…');await upsert('library_entries',unique,'user_id,media_type,anilist_id',(n,t)=>message('Salvando mangás: '+n+'/'+t));await loadFromDb();message(unique.length+' mangás sincronizados. Seus registros anteriores foram preservados.');return {data:libraryPayload(),updated:'sincronizado com '+name};}
async function ratingsGet(){const r=await rows('critical_ratings');return Object.fromEntries(r.filter(x=>x.media_type==='MANGA').map(x=>[String(x.anilist_id),x.dimensions||{}]));}
async function ratingsSave(obj){if(!obj||typeof obj!=='object'||Array.isArray(obj))throw Error('Formato inválido de avaliações.');const values=Object.entries(obj).filter(([id,v])=>/^\d+$/.test(id)&&v&&typeof v==='object'&&!Array.isArray(v)).map(([id,v])=>({user_id:account.id,media_type:'MANGA',anilist_id:Number(id),dimensions:Object.fromEntries(Object.entries(v).filter(([,n])=>Number.isFinite(Number(n))&&Number(n)>=0&&Number(n)<=10).map(([k,n])=>[k,Number(n)])),updated_at:new Date().toISOString()}));if(values.length)await upsert('critical_ratings',values,'user_id,media_type,anilist_id');return {ok:true,obras:values.length};}
async function activityFeed(){if(!username)return {activities:[],error:'Informe seu usuário AniList na aba Importar para consultar o feed.'};try{const u=await gql('query($name:String){User(name:$name){id name}}',{name:username});const uid=u.User?.id;if(!uid)throw Error('Usuário AniList não encontrado.');let all=[];for(let page=1;page<=3;page++){const d=await gql('query($id:Int,$page:Int){Page(page:$page,perPage:40){pageInfo{hasNextPage} activities(userId:$id,sort:ID_DESC){... on ListActivity{id createdAt status progress media{id type title{romaji english native} coverImage{extraLarge large medium}}}}}}',{id:uid,page});all.push(...(d.Page?.activities||[]).filter(a=>a?.media?.type==='MANGA'));if(!d.Page?.pageInfo?.hasNextPage)break;}return {source:'AniList',user:username,activities:all,fetchedAt:new Date().toISOString(),error:null};}catch(e){return {activities:[],error:e.message};}}
async function related(id){const data=await gql('query($id:Int){Media(id:$id,type:MANGA){relations{edges{relationType node{id type title{romaji english native} coverImage{medium large} siteUrl}}}}}',{id:Number(id)});return {relations:data.Media?.relations?.edges||[],recommendations:[]};}

// Capítulos: consulta autenticada à Edge Function. O banco armazena o cache;
// números de traduções nunca são tratados como publicação original.
async function chapterCloudReferences(includeSummary=false){
 const {data:{session}}=await db.auth.getSession();
 if(!session?.access_token)throw Error('Sessão expirada');
 const response=await fetch(cfg.supabaseUrl+'/functions/v1/atlas-chapters',{
  method:'POST',
  headers:{'Authorization':'Bearer '+session.access_token,'apikey':cfg.supabaseAnonKey,'Content-Type':'application/json'},
  body:'{}'
 });
 const payload=await response.json();
 if(!response.ok){
  if(/permission denied.*chapter_references/i.test(payload.error||''))throw Error('O Supabase ainda não permite consultar o catálogo de capítulos publicados.');
  throw Error(payload.error||'Falha ao consultar capítulos');
 }
 const out={};
 for(const [id,r] of Object.entries(payload.references||{})){
  const orig=Number(r.original_chapters)||null,translated=Number(r.translated_chapters)||null;
  out[id]={
   chapter:orig,
   original_chapters:orig,translated_chapters:translated,
   original_source:r.original_source,translation_source:r.translation_source,
   source:orig?r.original_source:'Publicação original não confirmada',
   confidence:orig?'Referência da publicação original':'Publicação original não confirmada',
   checkedAt:r.checked_at,
   mangadex:translated?{chapter:translated,url:r.translation_url}:null,
   mangaupdates:null,
   errors:r.error_message?[r.error_message]:[],
   translatedChapter:translated,
   translationSource:r.translation_source
  };
 }
 return includeSummary?{references:out,checked:Number(payload.updated)||0,pending:Number(payload.pending)||0}:out;
}
async function atlasFetch(url,options={}){try{const path=String(url),method=String(options?.method||'GET').toUpperCase(),body=options?.body?JSON.parse(options.body):null;if(!account)throw Error('Acesso não autenticado.');
 if(path==='historico_crunchyroll.json')return json(watchPayload());
 if(path==='biblioteca_inicial.json')return json(libraryPayload());
 if(path==='/api/library')return json({data:libraryPayload(),updated:'biblioteca privada no Supabase'});
 if(path==='/api/versao')return json({version:'web-1'});
 if(path==='/api/aliases')return json(method==='POST'?(await setPref('aliases',body),{ok:true}):await pref('aliases'));
 if(path==='/api/avaliacoes')return json(method==='POST'?await ratingsSave(body):await ratingsGet());
 if(path==='/api/capitulos-referencia')return json(method==='POST'?(await setPref('chapter_refs',body),{ok:true}):await pref('chapter_refs'));
 if(path==='/api/capitulos-fontes')return json(await chapterCloudReferences());
 if(path==='/api/capitulos-fontes/atualizar'&&method==='POST')return json(await chapterCloudReferences(true));
 if(path.startsWith('/api/capitulos-consultar/')){const all=await chapterCloudReferences();return json(all[path.split('/').pop()]||{error:'Referência ainda não disponível'});}
 if(path==='/api/atividades'||path==='/api/atividades/atualizar')return json(await activityFeed());
 if(path.startsWith('/api/relacionados/'))return json(await related(path.split('/').pop()));
 if(path==='/api/sync'){const name=$('atlas-username')?.value?.trim()||username;if(!name){showImport();$('atlas-username')?.focus();throw Error('Configure seu usuário AniList uma única vez em Importar dados. Ele será salvo na sua conta.');}return json(await syncAniList(name));}
 return json({error:'Recurso não disponível na versão online: '+path},404);
 }catch(e){console.error('[Atlas]',String(url),e);return json({error:e.message||'Erro inesperado'},500);}}
async function importAniList(file){const text=await file.text(),j=JSON.parse(text);const lists=j?.data?.MediaListCollection?.lists||j?.MediaListCollection?.lists||j?.lists;if(!Array.isArray(lists))throw Error('JSON AniList incompatível.');const entries=lists.flatMap(x=>x.entries||[]);const values=entries.map(e=>normalizeEntry(e)).filter(Boolean);if(!values.length)throw Error('Nenhum mangá encontrado.');await upsert('library_entries',values,'user_id,media_type,anilist_id',(n,t)=>message('Importando mangás: '+n+'/'+t));return values.length;}
async function importCrunchy(file){const j=JSON.parse(await file.text());const data=Array.isArray(j)?j:Array.isArray(j?.data)?j.data:Array.isArray(j?.data?.items)?j.data.items:Array.isArray(j?.items)?j.items:null;if(!data)throw Error('O JSON não contém um histórico Crunchyroll reconhecível.');const mapped=data.map((raw,i)=>{const p=normalizeWatch(raw);if(!p.id)throw Error('Reprodução '+(i+1)+' sem identificador.');return {user_id:account.id,source:'crunchyroll',source_event_id:p.id,crunchyroll_series_id:p.series_id,watched_at:p.date&&Number.isFinite(Date.parse(p.date))?new Date(p.date).toISOString():null,completed:p.completed,playhead_seconds:p.playhead,duration_ms:p.duration_ms==null?null:Math.round(p.duration_ms),payload:p};});const values=[...new Map(mapped.map(x=>[x.source_event_id,x])).values()];await upsert('watch_events',values,'user_id,source,source_event_id',(n,t)=>message('Importando reproduções: '+n+'/'+t));return values.length;}
function showImport(){const app=$('atlas-private');if(!app||app.hidden)return;const panel=$('atlas-import');panel.hidden=false;['mainContent','crunchyrollview','detailPage','animeDetailPage'].forEach(id=>{const el=$(id);if(el)el.classList.add('hidden')});document.querySelectorAll('.atlas-menu').forEach(x=>x.classList.toggle('active',x.dataset.menu==='importar'));document.querySelectorAll('.atlas-subnav').forEach(x=>x.classList.add('hidden'));window.scrollTo(0,0);}
function hideImport(){const panel=$('atlas-import');if(panel)panel.hidden=true;}
async function session(s){if(sessionBusy)return;sessionBusy=true;try{const u=s?.user||null;if(!u){account=null;window.atlasCloud.user=null;initializedFor='';$('atlas-private').hidden=true;$('atlas-access').hidden=false;$('atlas-user').textContent='';message('');return;}if(initializedFor===u.id)return;account=u;$('atlas-user').textContent=u.email||'Conta autenticada';$('atlas-access').hidden=true;$('atlas-loading').hidden=false;const saved=await pref('anilist_username',{name:''});username=typeof saved==='string'?saved:(typeof saved?.name==='string'?saved.name:'');$('atlas-username').value=username;await loadFromDb();initializedFor=u.id;$('atlas-loading').hidden=true;$('atlas-private').hidden=false;window.atlasCloud.user=u;window.atlasCloud.anilistUsername=username;window.dispatchEvent(new Event('atlas-cloud-ready'));if(!library.some(r=>r.media_type==='MANGA')&&!watch.length)showImport();}catch(e){message('Falha ao carregar a conta: '+e.message,true);$('atlas-loading').hidden=true;$('atlas-access').hidden=false;}finally{sessionBusy=false;}}

// Preferência visual privada: apenas o proprietário acessa a imagem original.
async function atlasBannerRead(scope='profile'){
 if(!account)return {mode:'automatic'};
 const value=await pref(scope+'_banner',{mode:'automatic'});
 if(value?.mode==='upload'&&value.path){
  const {data,error}=await db.storage.from('atlas-banners').createSignedUrl(value.path,3600);
  return {...value,url:error?'':data?.signedUrl||''};
 }
 return value||{mode:'automatic'};
}
async function atlasBannerSave(value,scope='profile'){
 if(!account)throw Error('Faça login');
 const allowed=['automatic','library','upload'];
 if(!allowed.includes(value?.mode))throw Error('Modo de banner inválido');
 await setPref(scope+'_banner',value);
 return atlasBannerRead(scope);
}
async function atlasBannerUpload(file,scope='profile'){
 if(!account)throw Error('Faça login');
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('Use JPG, PNG ou WebP');
 if(file.size>5*1024*1024)throw Error('A imagem deve ter no máximo 5 MB');
 const extension=file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg';
 const path=account.id+'/'+scope+'-banner.'+extension;
 const {error}=await db.storage.from('atlas-banners').upload(path,file,{upsert:true,contentType:file.type,cacheControl:'3600'});
 if(error)throw error;
 return atlasBannerSave({mode:'upload',path},scope);
}

async function animeProgressRead(){
 if(!account)throw Error('Acesso não autenticado.');
 const {data,error}=await db.from('user_preferences').select('preference_key,value').eq('user_id',account.id).like('preference_key','anime-progress:%');
 if(error)throw error;
 return Object.fromEntries(data.map(row=>[row.preference_key.slice(15),row.value]));
}
async function animeProgressSave(id,value){
 if(!account||typeof id!=='string'||!id||id.length>200)throw Error('Série ou sessão inválida.');
 const saved={userStatus:value.userStatus==='COMPLETED'?'COMPLETED':null};
 if(value.confirmed===true&&Number.isInteger(value.season)&&value.season>=0&&Number.isInteger(value.episodes)&&value.episodes>0){
  Object.assign(saved,{confirmed:true,season:value.season,episodes:value.episodes});
  if(Number.isSafeInteger(value.anilistId)&&value.anilistId>0)saved.anilistId=value.anilistId;
 }
 await setPref('anime-progress:'+id,saved);
 return saved;
}
async function animeAniListRead(){
 const owner=account?.id;
 if(!owner)return {entries:[],lastSuccess:null};
 const entries=[];
 for(let offset=0;offset<50000;offset+=1000){
  const {data,error}=await db.from('library_entries').select('anilist_id,status,progress,payload')
   .eq('user_id',owner).eq('media_type','ANIME').order('anilist_id').range(offset,offset+999);
  if(error)throw error;
  if(account?.id!==owner)throw Error('Sessão alterada.');
  entries.push(...data);
  if(data.length<1000){
   const {data:state}=await db.from('sync_state').select('last_success').eq('user_id',owner).eq('media_type','ANIME').maybeSingle();
   if(account?.id!==owner)throw Error('Sessão alterada.');
   return {entries,lastSuccess:state?.last_success||null};
  }
 }
 throw Error('Limite de paginação atingido.');
}
window.atlasCloud={animeAniListRead,animeProgressRead,animeProgressSave,fetch:atlasFetch,user:null,anilistUsername:'',bannerRead:atlasBannerRead,bannerSave:atlasBannerSave,bannerUpload:atlasBannerUpload};
async function init(){if(!cfg.supabaseUrl?.startsWith('https://')||!cfg.supabaseAnonKey){message('Configuração Supabase ausente.',true);return;}try{db=createClient(cfg.supabaseUrl,cfg.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});const params=new URLSearchParams(location.search);if(params.get('error')){message('Autenticação: '+(params.get('error_description')||params.get('error')),true);history.replaceState({},'',location.pathname);}const {data,error}=await db.auth.getSession();if(error)throw error;await session(data.session);db.auth.onAuthStateChange((event,s)=>{if(event==='SIGNED_IN'||event==='SIGNED_OUT')setTimeout(()=>{if(event==='SIGNED_OUT')location.reload();else session(s);},0)});}catch(e){message('Não foi possível iniciar a autenticação: '+e.message,true);$('atlas-loading').hidden=true;}}
$('atlas-magic-form').addEventListener('submit',async e=>{e.preventDefault();const input=$('atlas-email'),button=$('atlas-magic-button');button.disabled=true;message('Enviando link de acesso…');try{const {error}=await db.auth.signInWithOtp({email:input.value.trim(),options:{emailRedirectTo:cfg.siteUrl||location.origin+'/',shouldCreateUser:true}});if(error)throw error;$('atlas-magic-form').hidden=true;$('atlas-magic-sent').hidden=false;message('');}catch(e){message('Não foi possível enviar o link: '+e.message,true)}finally{button.disabled=false}});
$('atlas-magic-again').onclick=()=>{$('atlas-magic-form').hidden=false;$('atlas-magic-sent').hidden=true;message('')};
$('atlas-logout').onclick=async()=>{await db.auth.signOut();location.reload()};
$('atlas-import-menu').onclick=showImport;
document.querySelectorAll('.atlas-menu:not([data-menu="importar"]), .atlas-subnav .nav').forEach(b=>b.addEventListener('click',hideImport,true));
$('atlas-username').addEventListener('change',async e=>{const name=e.target.value.trim();if(!name)return;try{await rememberAniListName(name)}catch(err){message('Usuário AniList: '+err.message,true)}});
$('atlas-sync-import').onclick=async()=>{const b=$('atlas-sync-import'),name=$('atlas-username').value.trim();b.disabled=true;try{await syncAniList(name);message('Biblioteca atualizada. Recarregando a interface…');setTimeout(()=>location.reload(),1000);}catch(e){message('AniList: '+e.message,true)}finally{b.disabled=false}};
for(const [id,kind] of [['atlas-import-anilist','anilist'],['atlas-import-crunchy','crunchy']]){$(id).onclick=async()=>{const file=$(kind==='anilist'?'atlas-anilist-file':'atlas-crunchy-file').files?.[0];if(!file){message('Selecione um arquivo JSON.',true);return;}if(file.size>55*1024*1024){message('Arquivo acima do limite de 55 MB.',true);return;}const b=$(id);b.disabled=true;try{const n=kind==='anilist'?await importAniList(file):await importCrunchy(file);message(n+' registros importados/atualizados. Recarregando…');setTimeout(()=>location.reload(),1200);}catch(e){message('Falha na importação: '+e.message,true)}finally{b.disabled=false}};}
init();
