(()=>{
S.sh=S.sh||{tm:'',du:'30',fa:'',fo:'',tr:'',out:''};S.rv=S.rv||{rt:'',rs:'',out:''};
const lk=()=>{const e=$('#lk');if(!e)return;const q=($('#tm')?.value||'').trim();
if(!q){e.innerHTML='<span class="k">Escreva o tema para gerar os links de pesquisa.</span>';return}
const u=encodeURIComponent(q),L=[['Google',`https://www.google.com/search?q=${u}`],['Google Notícias',`https://www.google.com/search?tbm=nws&q=${u}`],['Wikipédia',`https://pt.wikipedia.org/w/index.php?search=${u}`],['G1',`https://g1.globo.com/busca/?q=${u}`],['Jusbrasil (processos e decisões)',`https://www.jusbrasil.com.br/busca?q=${u}`],['YouTube (vídeos sobre o tema)',`https://www.youtube.com/results?search_query=${u}`],['Google Trends (Brasil)',`https://trends.google.com/trends/explore?geo=BR&q=${u}`],['Hemeroteca Digital (jornais antigos)','https://memoria.bn.gov.br/hdb/']];
e.innerHTML='<span class="k">Pesquisar o tema em:</span><br>'+L.map(([n,h])=>`<a href="${h}" target="_blank" rel="noopener" style="display:inline-block;text-decoration:none;margin:4px 4px 4px 0;padding:8px 12px;border:1px solid var(--y);border-radius:4px">${n}</a>`).join('')};
const h=e=>{const i=e.target.id,v=e.target.value;if(['tm','du','fa','fo','tr'].includes(i))S.sh[i]=v;if(i==='rt'||i==='rs')S.rv[i]=v;if(i==='tm')lk()};
document.addEventListener('input',h);document.addEventListener('change',h);
V[5]=()=>{const g=S.sh;return`<div class="card"><b>Criador de Shorts</b><p class="k">Seu trabalho fica guardado enquanto você troca de aba. Ao recarregar ou fechar a página, ele é apagado. Eu estruturo o pacote; os fatos e as fontes vêm de você.</p><input id="tm" value="${E(g.tm)}" placeholder="Tema/caso"><select id="du">${[15,20,30,45,60].map(x=>`<option ${String(x)===g.du?'selected':''}>${x}</option>`).join('')}</select><div id="lk"></div></div>
<div class="card"><b>Transformar transcrição em Short</b><p class="k">Cole a transcrição de um vídeo. O app escolhe as frases com mais dados (datas, números, nomes, viradas) que cabem na duração escolhida e coloca no campo de fatos. Ideal para transformar um vídeo seu em Short. Se a transcrição for de outro canal, use só como pesquisa: reescreva com suas palavras e confira cada fato, porque copiar a fala de alguém pode violar direitos autorais e ser tratado como conteúdo reutilizado. Transcrições automáticas também têm erros.</p><textarea id="tr" rows="7" placeholder="Cole aqui a transcrição do vídeo">${E(g.tr)}</textarea><button class="s" onclick="trFacts()">Extrair fatos da transcrição</button></div>
<div class="card"><textarea id="fa" rows="6" placeholder="Fatos verificados, um por linha">${E(g.fa)}</textarea><textarea id="fo" rows="3" placeholder="Fontes (URL e data), uma por linha">${E(g.fo)}</textarea><button class="p" onclick="mk()">Gerar pacote</button><button class="s" onclick="cp()">Copiar prompt de pesquisa</button><button class="s" onclick="clSh()">Limpar tudo</button></div><div id="out">${g.out}</div>`};
window.clSh=()=>{S.sh={tm:'',du:'30',fa:'',fo:'',tr:'',out:''};draw()};
window.trFacts=()=>{const raw=$('#tr').value.trim();if(raw.length<80)return toast('Cole a transcrição (algumas frases, no mínimo).');
let t=raw.replace(/[\[(]?\b\d{1,2}:\d{2}(?::\d{2})?\b[\])]?/g,' ').replace(/\[(música|aplausos|music|applause)\]/gi,' ').replace(/\s+/g,' ').trim();
let ss=t.split(/(?<=[.!?…])\s+/).filter(Boolean);
if(ss.length<4){const w=t.split(' ');ss=[];for(let i=0;i<w.length;i+=18)ss.push(w.slice(i,i+18).join(' '))}
ss=ss.map(s=>s.replace(/^(então|aí|bom|tipo|né|olha|bem|e aí),?\s+/i,'').trim()).filter(s=>s.length>2).map(s=>s[0].toUpperCase()+s.slice(1));
const fr={};words(t).forEach(w=>fr[w]=(fr[w]||0)+1);const top=Object.entries(fr).sort((a,b)=>b[1]-a[1]).slice(0,8).map(x=>x[0]);
const sc=(s,i)=>{const w=s.split(/\s+/),n=w.length,lw=new Set(words(s));let p=0;
if(/\d/.test(s))p+=2;if(/\b(1[89]|20)\d\d\b/.test(s))p+=2;
p+=Math.min(3,w.slice(1).filter(x=>/^\p{Lu}\p{L}+/u.test(x)).length*.7);
p+=Math.min(3,top.filter(x=>lw.has(x)).length);if(NICHE.test(s))p+=1;
if(n<5)p-=3;if(n>30)p-=1;if(i<ss.length*.15)p+=1;if(i>=ss.length*.9)p+=1;return p};
const d=+$('#du').value,bud=Math.max(10,Math.floor(d*2.5*.88)-22);
const rk=ss.map((s,i)=>({s,i,p:sc(s,i),n:s.split(/\s+/).length})).sort((a,b)=>b.p-a.p);let pk=[],tot=0;
for(const r of rk)if(tot+r.n<=bud){pk.push(r);tot+=r.n}
if(!pk.length){const r=rk[0];pk=[{...r,s:r.s.split(/\s+/).slice(0,bud).join(' ')}];tot=bud}
pk.sort((a,b)=>a.i-b.i);const fa=pk.map(x=>x.s).join('\n');
$('#fa').value=fa;S.sh.fa=fa;
if(!$('#tm').value.trim()){const tm=top.slice(0,3).join(' ');$('#tm').value=tm;S.sh.tm=tm;lk()}
if(!$('#fo').value.trim()){const fo='Transcrição do vídeo: (cole o link e a data)';$('#fo').value=fo;S.sh.fo=fo}
toast(`${pk.length} frases selecionadas (~${tot} palavras). Confira, reescreva e verifique os fatos.`)};
const m5=mk;mk=function(){m5.apply(this,arguments);const o=$('#out');if(o)S.sh.out=o.innerHTML};
const r5=rv;rv=function(){r5.apply(this,arguments);const o=$('#out');if(o)S.rv.out=o.innerHTML};
V[6]=(o=>()=>o().replace('<input id="rt" placeholder="Título">',()=>`<input id="rt" value="${E(S.rv.rt)}" placeholder="Título">`).replace('<textarea id="rs" rows="8" placeholder="Cole o roteiro"></textarea>',()=>`<textarea id="rs" rows="8" placeholder="Cole o roteiro">${E(S.rv.rs)}</textarea>`).replace('<div id="out"></div>',()=>`<div id="out">${S.rv.out}</div>`))(V[6]);
const d5=draw;draw=function(){d5.apply(this,arguments);lk()};
draw();
})();
