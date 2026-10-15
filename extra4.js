(()=>{
const st=document.createElement('style');
st.textContent=`
@media (min-width:720px){
body{display:grid;grid-template-columns:240px minmax(0,1fr);grid-template-rows:auto auto 1fr;min-height:100vh}
.tape,header{grid-column:1/-1}
nav{grid-column:1;grid-row:3;flex-direction:column;overflow-x:visible;overflow-y:auto;gap:6px;padding:12px;position:sticky;top:0;align-self:start;height:100vh;border-bottom:0;border-right:1px solid var(--l)}
nav button{white-space:normal;text-align:left;width:100%;padding:10px 12px;border-left:3px solid transparent}
nav .on{border-left-color:#000}
main{grid-column:2;grid-row:3;margin:0;max-width:1000px;width:100%;min-width:0;padding:16px 20px}
}`;
document.head.appendChild(st);
})();
