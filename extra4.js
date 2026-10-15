(()=>{
const st=document.createElement('style');
st.textContent=`
#mb{display:none}#bk{display:none}
@media (min-width:720px){
body{display:grid;grid-template-columns:240px minmax(0,1fr);grid-template-rows:auto auto 1fr;min-height:100vh}
.tape,header{grid-column:1/-1}
nav{grid-column:1;grid-row:3;flex-direction:column;overflow-x:visible;overflow-y:auto;gap:6px;padding:12px;position:sticky;top:0;align-self:start;height:100vh;border-bottom:0;border-right:1px solid var(--l)}
nav button{white-space:normal;text-align:left;width:100%;padding:10px 12px;border-left:3px solid transparent}
nav .on{border-left-color:#000}
main{grid-column:2;grid-row:3;margin:0;max-width:1000px;width:100%;min-width:0;padding:16px 20px}
}
@media (max-width:719px){
#mb{display:inline-block;margin:0}
nav{position:fixed;top:0;left:0;bottom:0;width:260px;max-width:80vw;flex-direction:column;overflow-x:visible;overflow-y:auto;gap:6px;padding:12px;border-bottom:0;border-right:1px solid var(--l);transform:translateX(-100%);transition:transform .2s;z-index:20}
nav.open{transform:none}
nav button{white-space:normal;text-align:left;width:100%;padding:12px}
#bk.open{display:block;position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:15}
}
@media (prefers-reduced-motion:reduce){nav{transition:none}}`;
document.head.appendChild(st);
const nav=$('#nav'),bk=document.createElement('div'),mb=document.createElement('button');
bk.id='bk';document.body.appendChild(bk);
mb.id='mb';mb.className='p';mb.textContent='☰ Menu';mb.setAttribute('aria-label','Abrir ou fechar o menu');mb.setAttribute('aria-expanded','false');
document.querySelector('header').prepend(mb);
const set=o=>{nav.classList.toggle('open',o);bk.classList.toggle('open',o);mb.setAttribute('aria-expanded',String(o))};
mb.onclick=()=>set(!nav.classList.contains('open'));
bk.onclick=()=>set(false);
document.addEventListener('keydown',e=>{if(e.key==='Escape')set(false)});
const d0=draw;draw=function(){d0.apply(this,arguments);set(false)};
})();
