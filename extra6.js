(()=>{
if(window.__r6)return;window.__r6=1;
try{
const KEY='r6_log',HK=['Pergunta','Número ou dado','Mistério ou contradição','Promessa','Outro'],PL=['YouTube Shorts','Facebook Reels','Ambos'];
const rd=()=>{try{const a=JSON.parse(localStorage.getItem(KEY));return Array.isArray(a)?a:[]}catch{return[]}};
const wr=a=>{try{localStorage.setItem(KEY,JSON.stringify(a));return true}catch{return false}};
const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const ni=s=>{const x=String(s??'').replace(/[.\s]/g,'').replace(',','.');if(x==='')return null;const n=+x;return isNaN(n)||n<0?null:Math.round(n)};
const nd=s=>{const x=String(s??'').replace(/\s/g,'').replace('%','').replace(',','.');if(x==='')return null;const n=+x;return isNaN(n)||n<0?null:n};
const m=a=>{a=a.filter(x=>x!=null&&!isNaN(x)).sort((x,y)=>x-y);if(!a.length)return null;const h=a.length>>1;return a.length%2?a[h]:(a[h-1]+a[h])/2};
const f=n=>n==null?'—':Math.round(n).toLocaleString('pt-BR');
const dt=d=>{const x=new Date(d+'T12:00:00');return isNaN(x)?d:x.toLocaleDateString('pt-BR')};
const ageD=d=>(Date.now()-new Date(d+'T12:00:00'))/864e5;
const val=v=>v==null?'':v;
const opts=(arr,sel)=>arr.map(x=>`<option${x===sel?' selected':''}>${E(x)}</option>`).join('');
const blank=()=>({t:'',d:today(),tm:'',hk:HK[0],pl:PL[0],du:''});
let F=blank();
const band=du=>du==null?null:du<=20?'até 20 s':du<=35?'21 a 35 s':'36 s ou mais';
const grp=(W,key)=>{const g={};W.forEach(e=>{const k=key(e);if(!k)return;(g[k]=g[k]||[]).push(e.v48)});return Object.entries(g).filter(([,v])=>v.length>=2).map(([k,v])=>({k,n:v.length,m:m(v)})).sort((a,b)=>b.m-a.m)};
const render=()=>{
const L=rd(),W=L.filter(e=>e.v48!=null),M=m(W.map(e=>e.v48)),AP=m(L.map(e=>e.ap)),nAP=L.filter(e=>e.ap!=null).length;
let h=`<div class="card"><b>Resultados dos Shorts</b><p class="k">Registre cada Short quando publicar e volte depois para anotar os números (48 h e 7 dias). Os dados ficam só neste navegador: use Exportar CSV para guardar uma cópia. Onde achar os números: YouTube Studio > Análises > Conteúdo; Facebook > Insights.</p>
<input id="r6t" value="${E(F.t)}" placeholder="Título do Short">
<input id="r6d" type="date" value="${E(F.d)}">
<input id="r6tm" value="${E(F.tm)}" placeholder="Série ou tema (opcional)">
<span class="k">Tipo de gancho</span><select id="r6hk">${opts(HK,F.hk)}</select>
<span class="k">Plataforma</span><select id="r6pl">${opts(PL,F.pl)}</select>
<input id="r6du" inputmode="numeric" value="${E(F.du)}" placeholder="Duração em segundos (opcional)">
<button class="p" onclick="r6Add()">Registrar Short</button></div>`;
const ins=[];
if(!L.length)ins.push('Nenhum Short registrado ainda. Registre o primeiro assim que publicar.');
const pend=L.filter(e=>e.v48==null&&ageD(e.d)>=2);
if(pend.length)ins.push('Medir agora (as 48 h já passaram): '+pend.slice(0,5).map(e=>'"'+e.t+'"').join(', ')+'.');
const pend7=L.filter(e=>e.v7==null&&e.v48!=null&&ageD(e.d)>=7);
if(pend7.length)ins.push('Anotar as views de 7 dias: '+pend7.slice(0,5).map(e=>'"'+e.t+'"').join(', ')+'.');
if(W.length&&W.length<5)ins.push('Só '+W.length+' Short(s) com views em 48 h. Com menos de 5, qualquer padrão é palpite: publique mais, mudando UMA variável (o gancho) de um para outro.');
if(W.length>=5){
const top=W.slice().sort((a,b)=>b.v48-a.v48),fm=e=>'"'+e.t+'" ('+f(e.v48)+' views, '+(M?(e.v48/M).toFixed(1):'—')+'× a mediana)';
ins.push('Mediana de views em 48 h: '+f(M)+'.');
ins.push('Melhores: '+top.slice(0,3).map(fm).join('; ')+'.');
ins.push('Piores: '+top.slice(-3).reverse().map(fm).join('; ')+'.');
[['Tipo de gancho',grp(W,e=>e.hk)],['Série ou tema',grp(W,e=>(e.tm||'').trim().toLowerCase())],['Duração',grp(W,e=>band(e.du))]].forEach(([n,g])=>{if(g.length>=2)ins.push(n+' (mediana de views em 48 h): '+g.map(x=>x.k+' '+f(x.m)+' (n='+x.n+')').join(' · ')+'.')});
}
if(nAP>=3){const low=L.filter(e=>e.ap!=null&&e.ap<AP-10);ins.push('Retenção mediana: '+AP.toFixed(0)+'%.'+(low.length?' Bem abaixo da mediana: '+low.slice(0,4).map(e=>'"'+e.t+'"').join(', ')+'.':''))}
h+=`<div class="card"><b class="y">O que os números dizem</b>${ins.map(x=>'<div>• '+E(x)+'</div>').join('')}<span class="k">Padrões com poucos vídeos são hipóteses, não causa. Compare sempre com a mediana e mude uma variável por vez.</span></div>`;
if(L.length)h+=`<button class="s" onclick="r6Csv()">Exportar CSV</button><button class="s" onclick="r6Clear()">Apagar tudo</button>`;
h+=L.map(e=>{const r=e.v48!=null&&M&&W.length>=5?' · '+(e.v48/M).toFixed(1)+'× a mediana':'',id='m_'+e.id+'_',inp=(k,l,mode)=>`<div><span class="k">${l}</span><input id="${id}${k}" inputmode="${mode}" value="${E(val(e[k]))}"></div>`;
return`<div class="card"><b>${E(e.t)}</b><br><span class="k">${dt(e.d)} · ${E(e.pl)} · gancho: ${E(e.hk)}${e.du!=null?' · '+e.du+' s':''}${e.tm?' · série: '+E(e.tm):''}${r}</span>
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:6px">${inp('v48','Views em 48 h','numeric')}${inp('v7','Views em 7 dias','numeric')}${inp('ap','Retenção (%)','decimal')}${inp('lk','Curtidas','numeric')}${inp('cm','Comentários','numeric')}${inp('sg','Inscritos ganhos','numeric')}</div>
<button class="p" onclick="r6Save('${e.id}')">Salvar métricas</button><button class="s" onclick="r6Del('${e.id}')">Remover</button></div>`}).join('');
return h};
window.r6Add=()=>{const t=F.t.trim();if(!t)return toast('Escreva o título do Short.');const a=rd();
a.unshift({id:Date.now().toString(36)+Math.random().toString(36).slice(2,5),t,d:F.d||today(),tm:F.tm.trim(),hk:F.hk,pl:F.pl,du:ni(F.du),v48:null,v7:null,ap:null,lk:null,cm:null,sg:null});
if(!wr(a))return toast('Não consegui salvar neste navegador.');F=blank();draw()};
window.r6Save=id=>{const a=rd(),e=a.find(x=>x.id===id);if(!e)return;const g=k=>{const el=$('#m_'+id+'_'+k);return el?el.value:''};
const ap=nd(g('ap'));if(ap!=null&&ap>100)return toast('A retenção deve ficar entre 0 e 100.');
e.v48=ni(g('v48'));e.v7=ni(g('v7'));e.ap=ap;e.lk=ni(g('lk'));e.cm=ni(g('cm'));e.sg=ni(g('sg'));
if(!wr(a))return toast('Não consegui salvar neste navegador.');toast('Métricas salvas.');draw()};
window.r6Del=id=>{if(!window.confirm('Remover este Short do registro?'))return;wr(rd().filter(x=>x.id!==id));draw()};
window.r6Clear=()=>{if(!window.confirm('Apagar TODO o registro de Shorts? Isso não pode ser desfeito.'))return;wr([]);draw()};
window.r6Csv=()=>{const L=rd();if(!L.length)return toast('Nada para exportar.');const q=s=>'"'+String(s==null?'':s).replace(/"/g,'""')+'"';
const rows=[['titulo','data','serie','gancho','plataforma','duracao_s','views_48h','views_7d','retencao_pct','curtidas','comentarios','inscritos'].join(',')].concat(L.map(e=>[e.t,e.d,e.tm,e.hk,e.pl,e.du,e.v48,e.v7,e.ap,e.lk,e.cm,e.sg].map(q).join(',')));
const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+rows.join('\n')],{type:'text/csv'}));a.download='shorts-'+today()+'.csv';a.click()};
const h=e=>{const i=e.target&&e.target.id;if(i==='r6t')F.t=e.target.value;else if(i==='r6d')F.d=e.target.value;else if(i==='r6tm')F.tm=e.target.value;else if(i==='r6hk')F.hk=e.target.value;else if(i==='r6pl')F.pl=e.target.value;else if(i==='r6du')F.du=e.target.value};
document.addEventListener('input',h);document.addEventListener('change',h);
TABS.push('Resultados dos Shorts');
V[TABS.length-1]=()=>{try{return render()}catch(e){return'<div class="card bad">Erro no painel: '+E(e.message)+'</div>'}};
}catch(e){console.error('extra6.js',e)}
})();
