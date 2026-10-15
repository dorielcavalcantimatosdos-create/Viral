(()=>{
S.chs=ls('chs',[]);S.cache={};S.niche=S.niche||ls('niche',{n:'',k:''});S.rc=S.rc||{};
const cur=()=>S.ch&&S.chs.find(p=>p.id===S.ch.id);
const ensure=()=>{if(S.ch&&!cur())S.chs.push({id:S.ch.id,n:S.ch.snippet.title,niche:S.niche,comps:S.comps})};
const persist=()=>{ensure();const p=cur();if(p){p.niche=S.niche;p.comps=S.comps}sv('chs',S.chs)};
const stash=()=>{if(!S.ch)return;persist();S.cache[S.ch.id]={tok:S.tok,tt:S.tokT,ch:S.ch,ok:S.ok,vids:S.vids,an:S.an,anErr:S.anErr,sync:S.sync,cd:S.cd,cs:S.cs,rc:S.rc,rsel:S.rsel}};
const put=(k,p)=>Object.assign(S,{tok:k.tok,tokT:k.tt,ch:k.ch,ok:k.ok,vids:k.vids||[],an:k.an||null,anErr:k.anErr||'',sync:k.sync||null,cd:k.cd||[],cs:k.cs||{},rc:k.rc||{},rsel:k.rsel||null,niche:p.niche,comps:p.comps});
window.addCh=()=>{
if(!S.cid)return toast('Cole o Client ID em Configurações.');
if(!window.google)return toast('Biblioteca do Google não carregou. Verifique a internet.');
google.accounts.oauth2.initTokenClient({client_id:S.cid,scope:SC,prompt:'select_account',callback:async r=>{
if(r.error)return toast('Erro: '+r.error);
try{const res=await fetch(Y+'channels?part=snippet,contentDetails,statistics&mine=true',{headers:{Authorization:'Bearer '+r.access_token}}),j=await res.json();
if(!res.ok)throw new Error(j.error?.message||'Erro '+res.status);
if(!j.items)throw new Error('Nenhum canal do YouTube nesta conta.');
const c=j.items[0];stash();
let p=S.chs.find(x=>x.id===c.id);const novo=!p;
if(novo){p={id:c.id,n:c.snippet.title,niche:S.chs.length?{n:'',k:''}:S.niche,comps:S.chs.length?[]:S.comps};S.chs.push(p)}
p.n=c.snippet.title;const k=S.cache[c.id]||{};
put({...k,tok:r.access_token,tt:Date.now(),ch:c,ok:!novo},p);persist();draw();
if(!novo&&!S.vids.length)syncAll()}catch(e){toast(e.message)}}}).requestAccessToken()};
connect=window.addCh;
window.swCh=id=>{if(id==='+'){draw();return addCh()}if(!id||(S.ch&&id===S.ch.id))return;const p=S.chs.find(x=>x.id===id);if(!p)return;stash();const k=S.cache[id];
if(!k||!k.tok||Date.now()-k.tt>3300000){draw();toast('Sessão expirou. Escolha a conta do canal "'+p.n+'".');return addCh()}put(k,p);draw()};
window.rmCh=id=>{if(!confirm('Remover este canal da lista?'))return;const k=S.cache[id];if(k?.tok&&window.google)google.accounts.oauth2.revoke(k.tok);delete S.cache[id];S.chs=S.chs.filter(p=>p.id!==id);sv('chs',S.chs);if(S.ch?.id===id)disc();else draw()};
window.saveNiche=()=>{S.niche={n:$('#nn').value.trim(),k:$('#nk').value.trim()};sv('niche',S.niche);persist();toast('Nicho salvo'+(S.ch?' para '+S.ch.snippet.title:''))};
const dc=disc;disc=function(){if(S.ch)delete S.cache[S.ch.id];S.cs={};S.rc={};S.rsel=null;dc()};
const w0=wipe;wipe=function(){['chs','niche'].forEach(k=>{try{localStorage.removeItem(k)}catch{}});S.chs=[];S.cache={};S.niche={n:'',k:''};w0()};
const chCard=()=>`<div class="card"><b>Meus canais</b>${S.chs.length?S.chs.map(p=>`<div>${S.ch&&p.id===S.ch.id?'● ':''}${E(p.n)} <span class="k">${(S.ch&&p.id===S.ch.id)||S.cache[p.id]?.tok?'sessão ativa':'reconectar para analisar'}</span><br><button class="s" onclick="swCh('${p.id}')">Abrir</button><button class="s" onclick="rmCh('${p.id}')">Remover</button></div>`).join(''):'<span class="k">Nenhum canal salvo ainda.</span>'}<br><button class="p" onclick="addCh()">+ Adicionar canal</button><p class="k">Cada canal tem nicho e concorrentes próprios. A sessão do Google dura cerca de 1 hora; depois, toque em Abrir para reconectar. Os dados ficam só na memória desta aba.</p></div>`;
V[0]=(o=>()=>chCard()+o())(V[0]);
const d0=draw;
draw=function(){persist();d0();if(S.chs.length)$('#st').innerHTML='<select id="cs" style="width:auto;max-width:60vw" onchange="swCh(this.value)">'+(S.ch?'':'<option value="" selected>Selecione um canal</option>')+S.chs.map(p=>`<option value="${p.id}" ${S.ch&&p.id===S.ch.id?'selected':''}>${E(p.n)}</option>`).join('')+'<option value="+">+ Adicionar canal</option></select>'};
draw();
})();
