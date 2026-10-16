(()=>{
if(window.__r7)return;window.__r7=1;
try{
const KEY='r7_hist',MAX=100;
const rd=()=>{try{const a=JSON.parse(localStorage.getItem(KEY));return Array.isArray(a)?a:[]}catch{return[]}};
const wr=a=>{try{localStorage.setItem(KEY,JSON.stringify(a.slice(0,MAX)));return true}catch{return false}};
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,5);
const dfmt=s=>{const d=new Date(s);return isNaN(d)?'':d.toLocaleString('pt-BR')};
const add=it=>{const a=rd();a.unshift({id:uid(),at:new Date().toISOString(),...it});if(!wr(a))return toast('Não consegui salvar neste navegador.');toast('Salvo no histórico.')};
const fw=(s,n)=>String(s).split(/\s+/).slice(0,n).join(' ');
const cap=s=>s?s[0].toUpperCase()+s.slice(1):s;
const err=e=>'<div class="card bad">Erro nesta tela: '+E(e.message)+'</div>';
const copy=t=>{if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(()=>toast('Copiado.')).catch(()=>toast('Não consegui copiar. Selecione o texto e copie manualmente.'));else toast('Seu navegador não permite copiar. Selecione o texto e copie manualmente.')};

/* 1. RADAR */
const fz=v=>isS(v)?'Short (até 3 min)':'Vídeo longo';
let OPS=[];
const radar=()=>{const out=[];let sem=0;
S.cd.forEach(v=>{if(age(v)>30)return;if(v.ratio==null){sem++;return}if(v.ratio<1.5)return;
const vp=vpd(v),a=age(v),w=new Set(words(v.t)),sim=S.cd.filter(o=>o.id!==v.id&&words(o.t).filter(x=>w.has(x)).length>=2).length,
nb=S.cd.filter(x=>x.ch===v.ch&&isS(x)===isS(v)&&age(x)>=3).length,
sp=Math.round(40*Math.min(1,v.ratio/5)),dm=Math.round(20*Math.min(1,Math.log10(vp+1)/4)),at=a<=7?20:a<=14?13:6,sa=Math.round(20*(1-Math.min(1,sim/5)));
out.push({v,vp,a,sim,nb,sp,dm,at,sa,score:sp+dm+at+sa,base:vp/v.ratio,k:[...w].sort((x,y)=>y.length-x.length).slice(0,3),conf:nb<8?'baixa':'média'})});
out.sort((x,y)=>y.score-x.score);return{out,sem}};
const rvRadar=()=>{
if(!S.cd||!S.cd.length)return'<div class="card">Cadastre concorrentes na aba Concorrentes e sincronize para detectar oportunidades.</div>';
const r=radar();OPS=r.out.slice(0,10);
let h=`<div class="card k"><b class="y">Como a pontuação é calculada (0 a 100)</b><br>Velocidade, até 40: views por dia do vídeo ÷ mediana de views por dia dos vídeos do mesmo formato e do mesmo canal (5× ou mais = 40). Demanda, até 20: views por dia, em escala logarítmica. Atualidade, até 20: 7 dias ou menos = 20, até 14 = 13, até 30 = 6. Pouca saturação, até 20: quanto menos vídeos parecidos entre os concorrentes cadastrados, mais pontos. Só entram vídeos com até 30 dias e pelo menos 1,5× a mediana comparável. É uma estimativa calculada de uma única coleta (${S.sync?S.sync.toLocaleString('pt-BR'):'data indisponível'}): não mede crescimento e não prevê viralização.</div>`;
if(!OPS.length)return h+`<div class="card">Nenhum vídeo dos últimos 30 dias com pelo menos 1,5× a mediana comparável. Isso também é informação.${r.sem?' '+r.sem+' vídeo(s) ficaram sem base comparável.':''}</div>`;
h+=OPS.map((x,i)=>`<div class="card"><b class="y">${x.score}/100</b> ${link(x.v)}<br><span class="k">${E(x.v.ch)} · ${fz(x.v)} · publicado há ${Math.round(x.a)} d · ${fmt(x.v.v)} views · ${fmt(x.vp)} views/dia · mediana comparável ${fmt(x.base)} views/dia</span><br><b>Motivo:</b> ${x.v.ratio.toFixed(1)}× a mediana dos vídeos do mesmo formato do canal. <span class="k">Confiança ${x.conf}: ${x.nb} vídeos comparáveis do canal e uma única coleta.</span><div class="k" style="margin:6px 0">+${x.sp}/40 velocidade · +${x.dm}/20 demanda · +${x.at}/20 atualidade · +${x.sa}/20 pouca saturação (${x.sim} vídeo(s) parecido(s))</div><button class="s" onclick="r7SaveOp(${i})">Salvar no histórico</button><button class="s" onclick="r7Use(${i})">Gerar roteiro</button></div>`).join('');
if(r.sem)h+=`<p class="k">${r.sem} vídeo(s) recentes ficaram de fora por falta de base comparável (poucos vídeos do mesmo formato no canal).</p>`;
return h};
window.r7SaveOp=i=>{const x=OPS[i];if(!x)return;
add({k:'op',t:x.v.t,ch:x.v.ch,vid:x.v.id,score:x.score,body:`Canal: ${x.v.ch}\nFormato: ${fz(x.v)}\nPublicado há ${Math.round(x.a)} dias · ${fmt(x.v.v)} views · ${fmt(x.vp)} views/dia\nMotivo: ${x.v.ratio.toFixed(1)}× a mediana comparável do canal (${fmt(x.base)} views/dia)\nPontuação ${x.score}/100: velocidade ${x.sp}/40, demanda ${x.dm}/20, atualidade ${x.at}/20, pouca saturação ${x.sa}/20\nConfiança ${x.conf} (${x.nb} vídeos comparáveis, uma coleta)`})};

/* 2. GERADOR DE ROTEIROS */
const TONES={
'Direto':[t=>`${t}: o essencial em poucos segundos.`,t=>`Antes de seguir, veja isto sobre ${t}.`,t=>`${t}: o que você precisa saber agora.`],
'Curioso':[t=>`Por que ${t} chama tanta atenção?`,t=>`${t}: o detalhe que pode passar despercebido.`,t=>`Você já olhou para ${t} por este ângulo?`],
'Investigativo':[t=>`O que se sabe sobre ${t} e o que ainda precisa de confirmação.`,t=>`${t}: os fatos documentados, em ordem.`,t=>`Linha do tempo de ${t}: o que está confirmado.`],
'Educativo':[t=>`${t} explicado em poucos segundos.`,t=>`Três pontos para entender ${t}.`,t=>`Entenda ${t} sem complicação.`]};
const CTAS={'Comentários':'Qual ponto você quer ver aprofundado? Conta nos comentários.','Inscritos':'Siga o canal para ver os próximos vídeos desta série.','Série':'Quer a parte 2? Comente "parte 2" e acompanhe a série.'};
const TP=['Tema geral','Fato real (crime, saúde, notícia ou história)'];
let Fg={t:'',tom:'Direto',du:'30',ob:'Comentários',tp:TP[0],fa:''},G=null,GI=-1;
const opts=(a,s)=>a.map(x=>`<option${x===s?' selected':''}>${E(x)}</option>`).join('');
const wcOf=s=>String(s||'').split('\n').filter(l=>!/^(COMEÇO|DESENVOLVIMENTO|FINAL)$/.test(l.trim())).join(' ').split(/\s+/).filter(Boolean).length;
const wcTxt=()=>{const d=+Fg.du||30,bud=Math.floor(d*2.5*.88),n=wcOf(G&&G.script);return 'Narração: '+n+' palavras (~'+(n/2.5).toFixed(0)+' s a 150 palavras por minuto; limite sugerido para '+d+' s: '+bud+')'+(n>bud?' — corte cerca de '+(n-bud)+' palavras.':' — cabe.')};
window.r7Gen=()=>{const t=Fg.t.trim();if(!t)return toast('Informe o tema.');
const d=+Fg.du||30,real=Fg.tp!==TP[0],F0=Fg.fa.split('\n').map(x=>x.trim()).filter(Boolean),BAD=/^(cena\s*\d|tela\s*:|ritmo\s*:|fontes na descri)|\(~\s*[\d.,]+\s*s\)/i,F=F0.filter(x=>!BAD.test(x)),T=cap(t),hk=TONES[Fg.tom].map(fn=>cap(fn(t)));
if(F.length)hk[2]=F[0].replace(/[.!?]+$/,'')+'. Veja o contexto completo.';
const dev=F.length?F:[1,2,3].map(i=>real?`[Fato ${i}: dado documentado sobre ${t}, com fonte]`:`[Ponto ${i}: desenvolva a ideia ${i} sobre ${t}]`);
const cta=CTAS[Fg.ob]||CTAS['Comentários'];
const sc=[`Cena 1 (abertura): texto grande na tela com "${fw(hk[0],10)}"; plano de impacto ou imagem ligada ao tema (arquivo livre ou licenciado).`];
const vis=l=>/\b(1[89]|20)\d\d\b|\bdia \d/i.test(l)?'linha do tempo com a data em destaque':/\b(rua|bairro|cidade|estrada|rio|mapa|região|estado|local)\b/i.test(l)?'mapa do local':/(relatório|laudo|processo|inquérito|decisão|documento|boletim|denúncia)/i.test(l)?'imagem do documento (arquivo público)':'imagem ou gráfico de apoio (arquivo livre ou licenciado)';
dev.forEach((l,i)=>{const c=l.replace(/[\[\]]/g,'');sc.push(l.startsWith('[')?`Cena ${i+2}: preencha o fato entre colchetes e defina a imagem depois.`:`Cena ${i+2}: ${vis(l)}. Na tela: "${fw(c,9)}${c.split(/\s+/).length>9?'…':''}"`)});
sc.push(`Cena ${dev.length+2} (final): frame final com a chamada para ação em texto e fundo limpo.`);
sc.push('Ritmo: troque a imagem a cada 2 a 3 segundos e mantenha o texto na tela curto.');
const ti=real?[`${T}: o que está documentado`,`${T}: fatos, datas e dúvidas em aberto`,`O que se sabe sobre ${t}`]:[`${T}: o essencial em ${d} s`,`Entenda ${t} em ${d} segundos`,`${T}: o que você precisa saber`];
const cw=n=>{const x=t.split(/\s+/).slice(0,n);while(x.length>1&&/^(para|de|da|do|das|dos|e|a|o|em|no|na|com|por|um|uma)$/i.test(x[x.length-1]))x.pop();return x.join(' ').toUpperCase()};
const cv=real?cw(3)+'\nO QUE SE SABE':cw(4);
if(F0.length>F.length)toast((F0.length-F.length)+' linha(s) dos fatos foram ignoradas por parecerem cenas ou telas de outro roteiro. Cole só fatos verificados.');
G={t,d,real,hooks:hk.join('\n'),script:`COMEÇO\n${hk[0]}\n\nDESENVOLVIMENTO\n${dev.join('\n')}\n\nFINAL\n${cta}`,scenes:sc.join('\n'),titles:ti.map(x=>x.slice(0,70)).join('\n'),cover:cv,cta};
draw()};
const FIELDS=[['hooks','3 opções de gancho (o roteiro usa a primeira)',3],['script','Roteiro (começo, desenvolvimento e final)',10],['scenes','Sugestões de cenas',8],['titles','Título principal e 2 alternativas',3],['cover','Texto da capa',2],['cta','Chamada para ação',2]];
const rvGen=()=>{
let h=`<div class="card"><b>Gerador de roteiros</b><p class="k">Funciona com regras e modelos de texto no seu navegador, sem IA e sem internet. Ele não pesquisa nem inventa fatos: o que estiver entre colchetes é lacuna que você precisa preencher e verificar.</p>
<input id="f7_t" value="${E(Fg.t)}" placeholder="Tema (ex.: um assunto do seu nicho)">
<span class="k">Tipo de tema</span><select id="f7_tp">${opts(TP,Fg.tp)}</select>
<span class="k">Tom</span><select id="f7_tom">${opts(Object.keys(TONES),Fg.tom)}</select>
<span class="k">Duração (segundos)</span><select id="f7_du">${opts(['15','20','30','45','60'],Fg.du)}</select>
<span class="k">Objetivo</span><select id="f7_ob">${opts(Object.keys(CTAS),Fg.ob)}</select>
<textarea id="f7_fa" rows="4" placeholder="Fatos verificados, um por linha (opcional; se vazio, o roteiro traz lacunas entre colchetes)">${E(Fg.fa)}</textarea>
<button class="p" onclick="r7Gen()">Gerar</button></div>`;
if(!G)return h;
if(G.real)h+='<div class="card bad">Tema real: confira cada fato em fonte aberta antes de gravar. Não trate ninguém como culpado sem condenação e evite detalhes gráficos.</div>';
h+=`<div class="card k" id="g7_wc">${E(wcTxt())}</div>`;
h+=FIELDS.map(([k,l,r])=>`<div class="card"><b>${l}</b><textarea id="g7_${k}" rows="${r}">${E(G[k])}</textarea><button class="s" onclick="r7Copy('${k}')">Copiar</button></div>`).join('');
return h+`<button class="p" onclick="r7CopyAll()">Copiar tudo</button><button class="s" onclick="r7SaveRo()">Salvar no histórico</button>`};
const all=()=>FIELDS.map(([k,l])=>l.toUpperCase()+'\n'+G[k]).join('\n\n');
window.r7Copy=k=>{if(G)copy(G[k])};
window.r7CopyAll=()=>{if(G)copy(all())};
window.r7SaveRo=()=>{if(!G)return;add({k:'ro',t:G.t,body:all()})};
window.r7Use=i=>{const x=OPS[i];if(!x)return;Fg.t=x.k.join(' ');Fg.tp=TP[0];G=null;S.tab=GI;draw()};

/* 3. HISTÓRICO */
const rvHist=()=>{const L=rd();
let h=`<div class="card"><b>Histórico local</b><p class="k">Oportunidades e roteiros salvos ficam só neste navegador e neste aparelho: não há conta nem sincronização, e limpar os dados do navegador apaga tudo. Guarda os ${MAX} mais recentes.</p>${L.length?'<button class="s" onclick="r7Clear()">Apagar tudo</button>':''}</div>`;
if(!L.length)return h+'<div class="card">Nada salvo ainda. Use "Salvar no histórico" no radar ou no gerador de roteiros.</div>';
return h+L.map(e=>`<div class="card"><b class="y">${e.k==='op'?'Oportunidade '+E(String(e.score))+'/100':'Roteiro'}</b> ${E(e.t)}<br><span class="k">${dfmt(e.at)}${e.k==='op'&&e.vid?' · <a href="https://youtu.be/'+encodeURIComponent(e.vid)+'" target="_blank" rel="noopener">abrir vídeo</a>':''}</span><textarea id="h7_${e.id}" rows="${e.k==='op'?6:8}" readonly>${E(e.body)}</textarea><button class="s" onclick="r7HCopy('${e.id}')">Copiar</button><button class="s" onclick="r7Del('${e.id}')">Excluir</button></div>`).join('')};
window.r7HCopy=id=>{const e=rd().find(x=>x.id===id);if(e)copy(e.body)};
window.r7Del=id=>{if(!window.confirm('Excluir este registro?'))return;wr(rd().filter(x=>x.id!==id));draw()};
window.r7Clear=()=>{if(!window.confirm('Apagar TODO o histórico? Isso não pode ser desfeito.'))return;wr([]);draw()};

/* eventos e abas */
const h=e=>{const t=e.target,i=t&&t.id;if(!i)return;
if(i.startsWith('f7_')){const k=i.slice(3);if(k in Fg)Fg[k]=t.value}
else if(i.startsWith('g7_')&&G){const k=i.slice(3);if(k in G){G[k]=t.value;if(k==='script'){const w=$('#g7_wc');if(w)w.textContent=wcTxt()}}}};
document.addEventListener('input',h);document.addEventListener('change',h);
const ri=TABS.indexOf('Oportunidades virais');
if(ri>=0)V[ri]=()=>{try{return rvRadar()}catch(e){return err(e)}};
TABS.push('Gerador de roteiros');GI=TABS.length-1;V[GI]=()=>{try{return rvGen()}catch(e){return err(e)}};
TABS.push('Histórico local');V[TABS.length-1]=()=>{try{return rvHist()}catch(e){return err(e)}};
draw();
}catch(e){console.error('extra7.js',e)}
})();
