(function(){
'use strict';
var P=window.PRODUCTS||[];
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var num=function(v){var m=String(v==null?'':v).match(/[\d]+(?:[.,]\d+)?/);return m?parseFloat(m[0].replace(',','.')):NaN};
var fmt=function(n,d){return n.toLocaleString('pl-PL',{minimumFractionDigits:d||0,maximumFractionDigits:d==null?2:d})};
var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
var SITE='https://dynamicdecor.pl';
var plural=function(n,a,b,c){return n===1?a:(n%10>=2&&n%10<=4&&(n%100<10||n%100>20))?b:c};

/* ---------- dane ---------- */
var CATS=['Listwy przypodłogowe','Listwy ścienne','Listwy karniszowe','Panele ścienne','Panele elastyczne','Panele skalne','Lamele elewacyjne','Deski tarasowe','Tynki dekoracyjne','Dodatki'];
var CATSLUG={'Listwy przypodłogowe':'listwy-przypodlogowe','Listwy ścienne':'listwy-scienne','Listwy karniszowe':'listwy-karniszowe','Panele ścienne':'panele-scienne','Panele elastyczne':'panele-elastyczne','Panele skalne':'panele-skalne','Lamele elewacyjne':'lamele-elewacyjne','Deski tarasowe':'deski-tarasowe','Tynki dekoracyjne':'tynki-dekoracyjne','Dodatki':'dodatki','Listwy podłogowo-ścienne':'listwy-przypodlogowe'};
var GLY={'Listwy przypodłogowe':'g-przyp','Listwy podłogowo-ścienne':'g-podsc','Listwy ścienne':'g-scienna','Listwy karniszowe':'g-karnisz','Panele ścienne':'g-panel','Panele elastyczne':'g-flex','Panele skalne':'g-skala','Lamele elewacyjne':'g-lamela','Deski tarasowe':'g-deska','Tynki dekoracyjne':'g-tynk','Dodatki':'g-klej'};
var COLORS={'Biały':'#FFFFFF','Czarny':'#1A1A1A','Brązowy':'#8A5A36','Kremowy':'#C9A77C','Szary':'#8E9398'};
var ENDS={P12122:1,P16250:1,P8120:1};
var FIX=[[/łącznie/,'łączenia'],[/Wodoorporna/,'Wodoodporna'],[/\s*[\u2013\u2014]\s*/g,' - '],[/\.$/,'']];
P.forEach(function(p){
 p.cats=p.cat==='Listwy podłogowo-ścienne'?['Listwy przypodłogowe','Listwy ścienne']:[p.cat];
 p.W=num(p.w);p.G=num(p.g);p.L=num(p.l);
 p.listwa=p.calc==='listwa';
 p.feat=(p.feat||[]).map(function(f){FIX.forEach(function(x){f=f.replace(x[0],x[1])});return f}).filter(function(f){return f.length<110&&!/^Minimum logistyczne/.test(f)&&!(p.calc==='lamela'&&/LightShield|Czysta biel/.test(f))});
 p.min=(window.PRODUCTS_MIN||{})[p.s];
});
var bySlug=function(s){return P.filter(function(p){return p.s===s})[0]};
var isFloor=function(p){return p.cat==='Listwy przypodłogowe'||p.cat==='Listwy podłogowo-ścienne'};
var wLabel=function(p){return isFloor(p)?'Wysokość':'Szerokość'};
var glyph=function(p,cls){return '<svg viewBox="0 0 120 90" aria-hidden="true"'+(cls?' class="'+cls+'"':'')+'><use href="#'+(GLY[p.cat]||'g-przyp')+'"/></svg>'};
var dimLine=function(p){
 if(p.calc==='tynk'||p.calc==='klej')return p.cat;
 if(p.calc==='flex'||p.calc==='skala')return 'płyta '+p.w+' x '+p.l+' mm, gr. '+p.g+' mm';
 return (isFloor(p)?'wys. ':'szer. ')+p.w+' x gr. '+p.g+' mm · dł. '+fmt(p.L/1000,1)+' m';
};

/* ---------- lista probek ---------- */
var SM=[];try{SM=JSON.parse(localStorage.getItem('dd-probki')||'[]')}catch(e){SM=[]}
function smSave(){try{localStorage.setItem('dd-probki',JSON.stringify(SM))}catch(e){}smUpd()}
function smUpd(){$$('[data-cnt]').forEach(function(c){c.textContent=SM.length;c.hidden=!SM.length});var l=$('#slist');if(l)l.innerHTML=SM.length?SM.map(function(s){var p=bySlug(s);return p?'<span>'+esc(p.kod)+' <button type="button" data-smdel="'+s+'" aria-label="Usuń '+esc(p.kod)+' z próbek">×</button></span>':''}).join(''):'<em>Brak profili. Dodasz je przyciskiem "Zamów próbkę" w karcie produktu.</em>'}

/* ---------- jezyk naturalny ---------- */
var CRULES=[
 [/karnisz|zasłon|zaslon|firan|rolet/i,'Listwy karniszowe','listwa karniszowa'],
 [/elewac|fasad/i,'Lamele elewacyjne','lamele elewacyjne'],
 [/taras|balkon/i,'Deski tarasowe','deska tarasowa'],
 [/elastycz|łuk|luk\b|kolumn|gięt|giet|akusty/i,'Panele elastyczne','panele elastyczne'],
 [/skał|skal|rock|kamie/i,'Panele skalne','panele skalne'],
 [/tynk|beton|trawert|travert|glinian/i,'Tynki dekoracyjne','tynk dekoracyjny'],
 [/panel(?![a-ząęółżźćń]*\s*(elastycz|skal))|ryfl|lamel(?!.*elewac)|\b3d\b|telewiz|\btv\b/i,'Panele ścienne','panele ścienne'],
 [/przypodł|przypodl|podłogow|podlogow|przy podłodze|cokoł/i,'Listwy przypodłogowe','listwa przypodłogowa'],
 [/listw[a-ząęółżźćń]*\s+ścienn|listw[a-ząęółżźćń]*\s+scienn|ramk|sztukater|boazer|na ścian/i,'Listwy ścienne','listwa ścienna'],
 [/\bklej/i,'Dodatki','klej do listew']
];
var KRULES=[[/biał|bial/i,['Biały'],'kolor biały'],[/czarn/i,['Czarny'],'kolor czarny'],[/drewn|brąz|braz|teak|orzech/i,['Brązowy','Kremowy'],'kolor drewna'],[/szar|grafit/i,['Szary'],'kolor szary']];
function parse(q){
 var r={cats:[],kol:null,size:null,soft:{},tags:[]};if(!q)return r;
 for(var i=0;i<CRULES.length;i++){var x=CRULES[i];if(x[0].test(q)&&r.cats.indexOf(x[1])<0){r.cats.push(x[1]);r.tags.push(x[2]);if(r.cats.length>=2)break}}
 if(r.cats.length===0&&/listw/i.test(q)){r.cats=['Listwy przypodłogowe','Listwy ścienne','Listwy karniszowe'];r.tags.push('listwy')}
 KRULES.forEach(function(x){if(!r.kol&&x[0].test(q)){r.kol=x[1];r.tags.push(x[2])}});
 var m=q.match(/(\d+(?:[.,]\d+)?)\s*(cm|mm|centymetr|milimetr)/i);
 if(m){var v=parseFloat(m[1].replace(',','.'));if(/^c/i.test(m[2]))v*=10;if(v>=10&&v<=400){r.size=v;r.tags.push((r.cats[0]==='Listwy przypodłogowe'?'wysokość ':'szerokość ')+fmt(v,0)+' mm')}}
 if(!r.size&&/wysok/i.test(q)){r.soft.tall=1;r.tags.push('wysoka')}
 if(!r.size&&/nisk/i.test(q)){r.soft.low=1;r.tags.push('niska')}
 if(/malow|farb|kolor ścian|kolor scian/i.test(q)){r.soft.paint=1;r.tags.push('do malowania')}
 if(/wod|wilg|łazien|lazien|kuchn/i.test(q)){r.soft.wet=1;r.tags.push('wilgoć')}
 if(/światł|swiatl|prześwit|przeswit|lightshield/i.test(q)){r.soft.light=1;r.tags.push('nie przepuszcza światła')}
 if(/krzyw|nierówn|nierown/i.test(q)){r.soft.uneven=1;r.tags.push('krzywe ściany')}
 return r;
}
function has(p,re){return p.feat.some(function(f){return re.test(f)})}
function score(p,pr){
 var sc=50,why=[];pr=pr||{cats:[],soft:{}};var s=pr.soft||{};
 if(pr.cats&&pr.cats.length){if(p.cats.some(function(c){return pr.cats.indexOf(c)>=0})){sc+=20}else sc-=32}
 if(pr.kol){if(pr.kol.indexOf(p.kolor)>=0){sc+=12;why.push('kolor '+p.kolor.toLowerCase())}else sc-=p.kolor?20:10}
 if(pr.size&&!isNaN(p.W)){var d=Math.abs(p.W-pr.size);if(d<=3){sc+=24;why.unshift(wLabel(p).toLowerCase()+' '+p.w+' mm, dokładnie jak szukasz')}else if(d<=25){sc+=14-d/2;why.unshift(wLabel(p).toLowerCase()+' '+p.w+' mm, najbliżej '+fmt(pr.size,0)+' mm')}else sc-=Math.min(26,d/4)}
 else if(pr.size)sc-=20;
 if(s.tall){if(p.W>=100){sc+=10;why.push('wysoki profil '+p.w+' mm')}else sc-=8}
 if(s.low){if(p.W<=80){sc+=10;why.push('niski profil '+p.w+' mm')}else sc-=8}
 if(s.paint){if(has(p,/malowania/)){sc+=8;why.push('zagruntowana, do malowania farbą wodną na dowolny kolor')}else sc-=6}
 if(s.wet){if(has(p,/Wodoodporn|wilgo/)){sc+=8;why.push('odporna na wodę i wilgoć')}else sc-=6}
 if(s.light){if(has(p,/LightShield/)){sc+=p.cat==='Listwy karniszowe'?14:6;why.push('LightShield: profil nie przepuszcza światła')}else sc-=8}
 if(s.uneven&&p.listwa){sc+=4;why.push('przy krzywych ścianach pomoże poradnik o klejeniu')}
 if(!why.length&&p.listwa&&has(p,/DynaTech/))why.push('twardość gwarantowana technologią DynaTech');
 return {p:p,sc:Math.max(0,Math.min(99,Math.round(sc))),why:why};
}

/* ---------- filtry ---------- */
var LISTWY=['Listwy przypodłogowe','Listwy ścienne','Listwy karniszowe'],PANELE=['Panele ścienne','Panele elastyczne','Panele skalne','Lamele elewacyjne'];
var F=[
 {k:'zast',t:'Zastosowanie',vis:1,opts:CATS.map(function(c){return [c,c]}),test:function(p,v){return p.cats.indexOf(v)>=0}},
 {k:'kolor',t:'Kolor',sw:1},
 {k:'szer',t:'Wysokość lub szerokość profilu',opts:[['s1','do 50 mm'],['s2','51-100 mm'],['s3','101-150 mm'],['s4','ponad 150 mm']],test:function(p,v){var w=p.W;if(isNaN(w))return false;return v==='s1'?w<=50:v==='s2'?w>50&&w<=100:v==='s3'?w>100&&w<=150:w>150}},
 {k:'gr',t:'Grubość',opts:[['g1','do 12 mm'],['g2','13-20 mm'],['g3','ponad 20 mm']],test:function(p,v){var g=p.G;if(isNaN(g))return false;return v==='g1'?g<=12:v==='g2'?g>12&&g<=20:g>20}},
 {k:'dl',t:'Długość',dl:1},
 {k:'gdzie',t:'Miejsce montażu',opts:[['in','Wnętrze'],['out','Na zewnątrz']],test:function(p,v){var out=p.calc==='lamela'||p.calc==='deska';return v==='out'?out:!out}}
];
(function(){var kv={},dv={};P.forEach(function(p){if(p.kolor)kv[p.kolor]=1;if(!isNaN(p.L))dv[p.L]=1});
 var kf=F[1];kf.opts=['Biały','Czarny','Brązowy','Kremowy','Szary'].filter(function(k){return kv[k]}).map(function(k){return [k,k]});kf.test=function(p,v){return p.kolor===v};
 var df=F[4];df.opts=Object.keys(dv).map(Number).sort(function(a,b){return a-b}).map(function(v){return [String(v),fmt(v,0)+' mm']});df.test=function(p,v){return p.L===+v}})();
var st={f:{},q:'',sort:'dop'};
function pass(p,skip){return F.every(function(f){if(f.k===skip)return true;var sel=st.f[f.k];return !sel||!sel.length||sel.some(function(v){return f.test(p,v)})})}
function renderFilters(){
 var h='';
 F.forEach(function(f){
  var sel=st.f[f.k]||[];
  h+='<div class="fgr"><h3>'+f.t+(sel.length?'<button type="button" data-clr="'+f.k+'">Wyczyść</button>':'')+'</h3><div class="'+(f.vis?'fvis':'fchips')+'">';
  f.opts.forEach(function(o){
   var n=P.filter(function(p){return pass(p,f.k)&&f.test(p,o[0])}).length;var on=sel.indexOf(o[0])>=0;
   if(!n&&!on&&!f.vis)return;
   var inner=f.sw?'<span class="sw" style="background:'+(COLORS[o[0]]||'#ccc')+'"></span>'+o[1]:f.vis?'<svg viewBox="0 0 120 90" aria-hidden="true"><use href="#'+GLY[o[0]]+'"/></svg>'+esc(o[1]):esc(o[1]);
   h+='<button type="button" class="fc" aria-pressed="'+on+'" data-f="'+f.k+'" data-v="'+esc(o[0])+'"'+(!n&&!on?' disabled style="opacity:.45"':'')+'>'+inner+' <small>'+n+'</small></button>';
  });
  h+='</div></div>';
 });
 $('#filters').innerHTML=h;
}
function card(r,showWhy){
 var p=r.p||r;
 return '<a class="pc" href="#/produkt/'+p.s+'"><div class="ph"><img src="'+p.img+'" width="600" height="450" loading="lazy" alt="'+esc(p.n)+'"></div><div class="t"><span class="k">'+esc(p.cat)+'</span><h3>'+esc(p.n.replace(' Dynamic Decor',''))+'</h3>'+(showWhy&&r.why&&r.why.length?'<span class="why">'+esc(r.why[0])+'</span>':'')+'<span class="spec">'+glyph(p)+'<span>'+esc(dimLine(p))+'</span></span></div></a>';
}
function renderGrid(){
 var pr=parse(st.q);
 var list=P.filter(function(p){return pass(p)}).map(function(p){return score(p,pr)});
 var hard=st.q&&(pr.cats.length||pr.kol);
 if(hard){var ok=function(r){return (!pr.cats.length||r.p.cats.some(function(c){return pr.cats.indexOf(c)>=0}))&&(!pr.kol||pr.kol.indexOf(r.p.kolor)>=0)};var strict=list.filter(ok);if(strict.length>=3)list=strict;else if(strict.length){var rest=list.filter(function(r){return !ok(r)});list=strict.sort(function(a,b){return b.sc-a.sc}).concat(rest.sort(function(a,b){return b.sc-a.sc}));list.__keep=1}}
 if(st.sort==='dop'&&!list.__keep)list.sort(function(a,b){return b.sc-a.sc||CATS.indexOf(a.p.cats[0])-CATS.indexOf(b.p.cats[0])});
 else if(st.sort==='kat')list.sort(function(a,b){return CATS.indexOf(a.p.cats[0])-CATS.indexOf(b.p.cats[0])});
 else if(st.sort==='wa'||st.sort==='wd')list.sort(function(a,b){var x=isNaN(a.p.W)?9999:a.p.W,y=isNaN(b.p.W)?9999:b.p.W;return st.sort==='wa'?x-y:y-x});
 $('#count').textContent=list.length+' '+plural(list.length,'produkt','produkty','produktów');
 $('#grid').innerHTML=list.length?list.map(function(r){return card(r,!!st.q)}).join(''):'<div class="empty" style="grid-column:1/-1">Brak produktów dla tych filtrów w makiecie. Usuń jeden z filtrów.</div>';
 var u=$('#understood');
 if(st.q){u.hidden=false;u.innerHTML=pr.tags.length?'Zrozumiałem: '+pr.tags.map(function(t){return '<span class="tag">'+esc(t)+'</span>'}).join('')+' <button type="button" data-qclr>Wyczyść</button>':'Nie rozpoznałem parametrów w "'+esc(st.q)+'". Spróbuj np. "biała listwa przypodłogowa 10 cm".'}else u.hidden=true;
}
function renderKatalog(qs){
 st.f={};st.q='';
 var u=new URLSearchParams(qs||'');var g=u.get('grupa');
 u.forEach(function(v,k){if(k==='q')st.q=v;else if(F.some(function(f){return f.k===k}))(st.f[k]=st.f[k]||[]).push(v)});
 if(g==='listwy')st.f.zast=LISTWY.slice();if(g==='panele')st.f.zast=PANELE.slice();
 $('#q2').value=st.q;$('#sort').value=st.sort;
 var one=st.f.zast&&st.f.zast.length===1?st.f.zast[0]:null;
 var h1=one?one:g==='listwy'?'Listwy przypodłogowe, ścienne i karniszowe':g==='panele'?'Panele ścienne, elastyczne, skalne i lamele':'Listwy, panele i lamele';
 $('#kh1').textContent=h1;$('#kcrumb').textContent=one||g==='listwy'&&'Listwy'||g==='panele'&&'Panele i lamele'||'Katalog';
 document.title=(one?one+' - katalog':h1)+' | Dynamic Decor';
 renderFilters();renderGrid();
}

/* ---------- przekroj profilu (schemat z wymiarow karty) ---------- */
function dimV(x,y1,y2,t){return '<path class="ds" d="M'+(x-6)+' '+y1+'H'+(x+6)+'M'+(x-6)+' '+y2+'H'+(x+6)+'M'+x+' '+y1+'V'+y2+'"/><text class="dt" x="'+(x+10)+'" y="'+((y1+y2)/2+4)+'">'+t+'</text>'}
function dimH(x1,x2,y,t){return '<path class="ds" d="M'+x1+' '+(y-6)+'V'+(y+6)+'M'+x2+' '+(y-6)+'V'+(y+6)+'M'+x1+' '+y+'H'+x2+'"/><text class="dt" text-anchor="middle" x="'+((x1+x2)/2)+'" y="'+(y+20)+'">'+t+'</text>'}
function xsec(p){
 var W=p.W,G=p.G,h='',vb='0 0 440 300';
 if(isNaN(W)||isNaN(G))return '';
 if(isFloor(p)){
  var s=Math.min(210/W,200/G),x0=170,y0=255,H=W*s,T=G*s,yt=y0-H;
  h='<path class="bs" d="M'+x0+' 20V'+y0+'H420"/>';
  if(p.cat==='Listwy podłogowo-ścienne')h+='<path class="pf" d="M'+x0+' '+y0+'V'+(yt+T*.5)+'Q'+x0+' '+yt+' '+(x0+T*.5)+' '+yt+'Q'+(x0+T)+' '+yt+' '+(x0+T)+' '+(yt+T*.5)+'V'+y0+'Z"/>';
  else h+='<path class="pf" d="M'+x0+' '+y0+'V'+yt+'H'+(x0+T*.4)+'Q'+(x0+T)+' '+yt+' '+(x0+T)+' '+(yt+T*.6)+'V'+(yt+H*.16)+'Q'+(x0+T)+' '+(yt+H*.2)+' '+(x0+T*.82)+' '+(yt+H*.22)+'V'+(y0-T*.2)+'Q'+(x0+T*.82)+' '+y0+' '+(x0+T)+' '+y0+'Z"/>';
  h+=dimV(x0+T+44,yt,y0,p.w+' mm')+dimH(x0,x0+T,y0+18,p.g+' mm');
  h+='<text class="dt" x="'+(x0-14)+'" y="34" text-anchor="end" style="fill:#7B8188">ściana</text><text class="dt" x="410" y="'+(y0-8)+'" text-anchor="end" style="fill:#7B8188">podłoga</text>';
 }else if(p.cat==='Listwy ścienne'){
  var s2=Math.min(200/W,150/G),x1=170,yt2=40,Hh=W*s2,Tt=G*s2;
  h='<path class="bs" d="M'+x1+' 14V286"/><path class="pf" d="M'+x1+' '+yt2+'H'+(x1+Tt*.3)+'C'+(x1+Tt)+' '+(yt2+Hh*.08)+' '+(x1+Tt)+' '+(yt2+Hh*.3)+' '+(x1+Tt*.92)+' '+(yt2+Hh*.48)+'C'+(x1+Tt*.84)+' '+(yt2+Hh*.66)+' '+(x1+Tt*.5)+' '+(yt2+Hh*.7)+' '+(x1+Tt*.55)+' '+(yt2+Hh*.84)+'C'+(x1+Tt*.6)+' '+(yt2+Hh*.95)+' '+(x1+Tt*.3)+' '+(yt2+Hh)+' '+x1+' '+(yt2+Hh)+'Z"/>';
  h+=dimV(x1+Tt+40,yt2,yt2+Hh,p.w+' mm')+dimH(x1,x1+Tt,yt2+Hh+20,p.g+' mm')+'<text class="dt" x="'+(x1-14)+'" y="30" text-anchor="end" style="fill:#7B8188">ściana</text>';
 }else if(p.cat==='Listwy karniszowe'){
  var s3=Math.min(300/W,170/G),xa=70,ya=60,Wd=W*s3,Gd=G*s3,t=Math.max(5,3*s3);
  h='<path class="bs" d="M20 '+ya+'H430M'+(xa-20)+' '+ya+'V290"/><path class="bs" stroke-dasharray="4 4" d="M'+(xa+Wd*.45)+' '+(ya+t+10)+'V290M'+(xa+Wd*.3)+' '+(ya+t+10)+'H'+(xa+Wd*.6)+'"/>';
  h+='<path class="pf" d="M'+xa+' '+ya+'H'+(xa+Wd)+'V'+(ya+Gd)+'H'+(xa+Wd-t)+'V'+(ya+t)+'H'+(xa+t)+'V'+(ya+t*2.6)+'H'+xa+'Z"/>';
  h+=dimH(xa,xa+Wd,ya+Gd+26,p.w+' mm')+dimV(xa+Wd+30,ya,ya+Gd,p.g+' mm')+'<text class="dt" x="24" y="'+(ya-10)+'" style="fill:#7B8188">sufit</text><text class="dt" x="'+(xa+Wd*.45+8)+'" y="280" style="fill:#7B8188">zasłona</text>';
 }else if(p.calc==='panel'){
  var s4=380/W,xb=30,yb=190,Wp=W*s4,Gp=Math.min(G*s4,90),n={P12122:9,P16250:5,P8120:4}[p.kod]||Math.max(3,Math.round(W/30)),fw=Wp/n,d='M'+xb+' '+yb+'V'+(yb-Gp*.45);
  for(var i=0;i<n;i++)d+='A'+(fw/2)+' '+(Gp*.55)+' 0 0 1 '+(xb+fw*(i+1))+' '+(yb-Gp*.45);
  d+='V'+yb+'Z';
  h='<path class="bs" d="M10 '+yb+'H430"/><path class="pf" d="'+d+'"/>'+dimH(xb,xb+Wp,yb+26,p.w+' mm')+dimV(xb+Wp-6,yb-Gp,yb,'')+'<text class="dt" x="'+(xb+Wp-10)+'" y="'+(yb-Gp-10)+'" text-anchor="end">'+p.g+' mm</text>';
 }else if(p.calc==='lamela'||p.calc==='deska'){
  var s5=360/W,xc=40,yc=190,Wl=W*s5,Gl=Math.max(G*s5,24),q='';
  if(p.calc==='lamela'){var gw=Wl/12;q='<path class="pf" d="M'+xc+' '+yc+'V'+(yc-Gl);for(var j=1;j<4;j++){var gx=xc+Wl*j/4;q+='H'+(gx-gw/2)+'V'+(yc-Gl*.62)+'H'+(gx+gw/2)+'V'+(yc-Gl)}q+='H'+(xc+Wl)+'V'+yc+'Z"/>'}
  else{q='<path class="pf" d="M'+xc+' '+yc+'V'+(yc-Gl)+'H'+(xc+Wl)+'V'+yc+'Z"/>';var cw=Wl/6;for(var k=0;k<5;k++){var cx=xc+cw*(k+.55);q+='<rect class="pf" x="'+cx+'" y="'+(yc-Gl*.72)+'" width="'+cw*.7+'" height="'+Gl*.5+'" rx="3"/>'}}
  h='<path class="bs" d="M10 '+yc+'H430"/>'+q+dimH(xc,xc+Wl,yc+26,p.w+' mm')+'<text class="dt" x="'+(xc+Wl)+'" y="'+(yc-Gl-10)+'" text-anchor="end">gr. '+p.g+' mm</text>';
 }else if(p.calc==='flex'||p.calc==='skala'){
  var Lp=p.L,s6=Math.min(220/Lp,300/W),wd=W*s6,ld=Lp*s6,xd=(440-wd)/2-20,yd=30;
  h='<path class="pf" d="M'+xd+' '+yd+'H'+(xd+wd)+'V'+(yd+ld)+'H'+xd+'Z"/>'+dimH(xd,xd+wd,yd+ld+18,p.w+' mm')+dimV(xd+wd+24,yd,yd+ld,p.l+' mm');vb='0 0 440 300';
 }else return '';
 return '<svg viewBox="'+vb+'" role="img" aria-label="Przekrój '+esc(p.kod)+': '+esc(dimLine(p))+'">'+h+'</svg>';
}

/* ---------- karta produktu ---------- */
function jsonld(p){
 var cs=CATSLUG[p.cat]||'produkty';
 return {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Strona główna',item:SITE+'/'},{'@type':'ListItem',position:2,name:p.cats[0],item:SITE+'/'+cs+'/'},{'@type':'ListItem',position:3,name:p.n,item:SITE+'/'+cs+'/'+p.s+'/'}]};
}
var GAL=[];
function renderProdukt(slug,anchor){
 var p=bySlug(slug)||bySlug('f1275');
 var imgs=[{s:p.img,l:p.imgL,a:p.n,c:''}].concat(p.gal.map(function(g,i){return {s:g.s,l:g.l,a:p.n+' we wnętrzu, zdjęcie '+(i+1),c:''}}));
 if(p.rys)imgs.push({s:p.rys,l:p.rys,a:'Rysunek przekroju '+p.kod+' (producent)',c:'dr'});
 var facts=[];
 if(!isNaN(p.W)){
  if(p.calc==='flex'||p.calc==='skala')facts.push(['Format płyty',p.w+' x '+p.l+' mm'],['Grubość',p.g+' mm']);
  else facts.push([wLabel(p),p.w+' mm'],['Grubość',p.g+' mm'],['Długość',fmt(p.L,0)+' mm'],['Sprzedaż',p.listwa?'na pełne listwy po '+fmt(p.L/1000,1)+' m':p.calc==='panel'?'na sztuki po '+fmt(p.L/1000,1)+' m':'na sztuki']);
 }
 if(p.kolor)facts.push(['Kolor',p.kolor]);
 if(p.listwa||p.calc==='panel')facts.push(['Materiał','polistyren (EPS)']);
 Object.keys(p.extra).forEach(function(k){facts.push([k,p.extra[k].replace(/\s*[\u2013\u2014]\s*/g,' - ').replace(/m2/,'m²')])});
 if(p.calc==='flex')facts.push(['Minimum logistyczne','SC01: 20 m², pozostałe kolory: 100 m²']);
 if(p.calc==='skala')facts.push(['Opakowanie','3 szt. (wzory A, B, C)']);
 var tech=[['Kod produktu',p.kod],['Kategoria',p.cats.join(', ')]];
 if(!isNaN(p.W)){tech.push(['Szerokość'+(isFloor(p)?' (wysokość listwy)':''),p.w+' mm'],['Grubość',p.g+' mm'],['Długość',fmt(p.L,0)+' mm'])}
 if(p.kolor)tech.push(['Kolor',p.kolor]);
 if(p.listwa||p.calc==='panel')tech.push(['Materiał','spieniony polistyren, gęstość ok. 0,45 g/cm³'],['Wykończenie','matowe, zagruntowane, do malowania farbą wodną']);
 Object.keys(p.extra).forEach(function(k){tech.push([k,p.extra[k].replace(/m2/,'m²')])});
 tech.push(['Opakowanie (szt. w kartonie)','do uzupełnienia w CMS']);
 var same=P.filter(function(x){return x.s!==p.s&&x.cats.some(function(c){return p.cats.indexOf(c)>=0})});
 if(same.length<4)same=same.concat(P.filter(function(x){return x.s!==p.s&&same.indexOf(x)<0&&x.listwa===p.listwa}).slice(0,6-same.length));
 var cs=CATSLUG[p.cat]||'produkty';
 var x=xsec(p);
 var desc=p.desc.filter(function(d){return d.length>60}).slice(0,3);
 var inSm=SM.indexOf(p.s)>=0;
 var h='<nav class="crumb" aria-label="Okruszki"><a href="#/">Strona główna</a><span>/</span><a href="#/katalog">Katalog</a><span>/</span><a href="#/katalog?zast='+encodeURIComponent(p.cats[0])+'">'+esc(p.cats[0])+'</a><span>/</span>'+esc(p.kod)+'</nav>'+
 '<div class="pv"><div class="gal">'+imgs.map(function(g,i){return '<button type="button" class="'+g.c+'" data-lbg="p" data-lb="'+g.l+'" aria-label="Powiększ: '+esc(g.a)+'"><img src="'+g.s+'" alt="'+esc(g.a)+'" '+(i?'loading="lazy"':'')+' width="600" height="450"></button>'}).join('')+'<p class="cap">Zdjęcia i rysunki z dynamicdecor.pl. Kliknij, żeby powiększyć.</p></div>'+
 '<div class="pinfo"><span class="k">'+esc(p.cat)+'</span><h1>'+esc(p.n)+'</h1><p class="kod">Kod: '+esc(p.kod)+' · adres docelowy: dynamicdecor.pl/'+cs+'/'+p.s+'/</p>'+
 '<div class="facts">'+facts.map(function(f){return '<div><span>'+esc(f[0])+'</span><b>'+esc(f[1])+'</b></div>'}).join('')+'</div>'+
 '<div class="pact"><button class="btn" type="button" data-smadd="'+p.s+'">'+(inSm?'Próbka na liście':'Zamów próbkę')+'</button><a class="btn line" href="#docs">Dokumenty</a>'+(inSm?'<a class="added" href="#/wspolpraca">Przejdź do zamówienia</a>':'')+'</div>'+
 calcHTML(p)+
 '</div></div>'+
 (x||p.rys?'<section class="psec" id="przekroj"><div class="ptwo"><div><h2>Przekrój i wymiary</h2>'+(x?'<div class="xsec">'+x+'<p class="note">Schemat narysowany z wymiarów zapisanych przy produkcie. Docelowo przy każdym profilu rysunek techniczny z panelu.</p></div>':'')+(p.rys?'<button type="button" class="xrys" data-lbg="r" data-lb="'+p.rys+'" aria-label="Powiększ rysunek producenta"><img src="'+p.rys+'" alt="Rysunek przekroju '+esc(p.kod)+' z wymiarami" loading="lazy" width="1400" height="400"></button><p class="note" style="margin-top:6px">Rysunek producenta z obecnej karty produktu.</p>':'')+'</div>'+
 '<div><h2>Cechy</h2><ul class="feat">'+p.feat.map(function(f){return '<li>'+esc(f)+'</li>'}).join('')+'</ul></div></div></section>':
 (p.feat.length?'<section class="psec"><h2>Cechy</h2><ul class="feat">'+p.feat.map(function(f){return '<li>'+esc(f)+'</li>'}).join('')+'</ul></section>':''))+
 '<section class="psec"><div class="ptwo"><div><h2>Parametry</h2><table class="tech"><tbody>'+tech.map(function(t){return '<tr><th>'+esc(t[0])+'</th><td>'+esc(t[1])+'</td></tr>'}).join('')+'</tbody></table><p class="note" style="margin-top:12px">Wymiary zapisane w panelu jako osobne pola: z nich korzystają filtry, kalkulator, przekrój i dane dla Google.</p></div>'+
 '<div id="docs"><h2>Dokumenty do pobrania</h2><ul class="docs">'+p.docs.map(function(d){return '<li><a href="'+d.u+'"'+(d.k==='PDF'?' target="_blank"':'')+' rel="noopener"><span class="ft2">'+d.k+'</span><span>'+esc(d.t)+'<small>'+d.k+', '+d.z+' · plik z dynamicdecor.pl</small></span></a></li>'}).join('')+
 '<li class="miss">'+(p.docs.length?'Instrukcja montażu i certyfikat dla '+esc(p.kod)+': do przypisania w panelu.':'Dla tego produktu na obecnej stronie nie ma dokumentów. Po wdrożeniu karta techniczna, instrukcja i certyfikat przypisuje się w panelu i pojawiają się tutaj.')+'</li></ul></div></div></section>'+
 (desc.length?'<section class="psec"><h2>Opis</h2><div class="pdesc">'+desc.map(function(d){return '<p>'+esc(d.replace(/\s*[\u2013\u2014]\s*/g,' - '))+'</p>'}).join('')+'</div></section>':'')+
 '<section class="psec"><div class="shead" style="margin-bottom:22px"><h2 style="margin:0">'+(p.listwa?'Inne listwy':'Podobne produkty')+'</h2><div class="arrows" data-for="samerow"><button type="button" aria-label="Poprzednie" data-d="-1"><svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M12.5 4 6.5 10l6 6" fill="none" stroke="currentColor" stroke-width="2"/></svg></button><button type="button" aria-label="Następne" data-d="1"><svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="m7.5 4 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2"/></svg></button></div></div><div class="row" id="samerow">'+same.slice(0,8).map(function(s){return card(s)}).join('')+'</div></section>';
 $('#pview').innerHTML=h;
 setLd(jsonld(p));
 bindCalc(p);
 arrowsInit();
 document.title=p.n+(isNaN(p.W)?'':' - '+p.w+' x '+p.g+' mm')+' | Dynamic Decor';
 return p;
}

/* ---------- kalkulator na pelne sztuki ---------- */
function inp(lbl,key,val,step,cls){return '<label'+(cls?' class="'+cls+'"':'')+' data-k="'+key+'">'+lbl+'<input type="number" inputmode="decimal" min="0" step="'+(step||0.1)+'" value="'+val+'" data-c="'+key+'"></label>'}
function zap(def){return '<label data-k="z">Zapas na docinki<select data-c="z"><option value="5"'+(def===5?' selected':'')+'>5%</option><option value="10"'+(def===10?' selected':'')+'>10%</option><option value="15"'+(def===15?' selected':'')+'>15%</option></select></label>'}
function calcHTML(p){
 var c=p.calc,h='',t='';
 if(c==='klej')return '<div class="calc"><h2>Ile kleju potrzebujesz?</h2><div class="res"><p>Wydajność kleju (metry listwy na opakowanie) nie jest podana na obecnej stronie. Po uzupełnieniu pola w panelu kalkulator przy każdej listwie doliczy klej automatycznie.</p></div></div>';
 if(c==='listwa'){
  var fl=isFloor(p),sc=p.cat==='Listwy ścienne',ka=p.cat==='Listwy karniszowe';
  t=ka?'Ile listew karniszowych?':'Ile listew kupić?';
  h='<div class="mode">'+(ka?'<button type="button" class="fc" aria-pressed="true" data-mode="len">Długość ściany z oknem</button><button type="button" class="fc" aria-pressed="false" data-mode="room">Cały obwód pokoju</button>':'<button type="button" class="fc" aria-pressed="true" data-mode="room">Wymiary pokoju</button><button type="button" class="fc" aria-pressed="false" data-mode="len">Długość ścian</button>'+(sc?'<button type="button" class="fc" aria-pressed="false" data-mode="frames">Ramki na ścianie</button>':''))+'</div>'+
  '<div class="in">'+inp('Długość pokoju (m)','a',5,0.1,'m-room')+inp('Szerokość pokoju (m)','b',4,0.1,'m-room')+inp(ka?'Długość ściany (m)':'Suma długości ścian (m)','len',ka?3.6:12,0.1,'m-len')+inp('Liczba ramek','fn',4,1,'m-frames')+inp('Szer. ramki (m)','fw',0.6,0.05,'m-frames')+inp('Wys. ramki (m)','fh',0.9,0.05,'m-frames')+
  (fl?inp('Drzwi (szt.)','d',1,1,'m-room m-len')+inp('Szer. drzwi (m)','dw',0.9,0.05,'m-room m-len'):'')+zap(10)+'</div>';
 }else if(c==='panel'){t='Ile paneli na ścianę?';h='<div class="in">'+inp('Szerokość ściany (m)','a',3,0.1)+inp('Wysokość ściany (m)','b',2.6,0.1)+zap(5)+'</div>'}
 else if(c==='lamela'){t='Ile lamel na elewację?';h='<div class="in">'+inp('Szerokość elewacji (m)','a',6,0.1)+inp('Wysokość pola (m)','b',2.5,0.1)+zap(10)+'</div>'}
 else if(c==='deska'){t='Ile desek na taras?';h='<div class="in">'+inp('Długość tarasu (m)','a',5,0.1)+inp('Szerokość tarasu (m)','b',3,0.1)+zap(10)+'</div>'}
 else if(c==='flex'){t='Ile płyt Naturflex?';h='<div class="in">'+inp('Szerokość ściany (m)','a',4,0.1)+inp('Wysokość (m)','b',2.6,0.1)+zap(10)+'</div>'}
 else if(c==='skala'){t='Ile paneli Rock?';h='<div class="in">'+inp('Szerokość ściany (m)','a',3.6,0.1)+inp('Wysokość (m)','b',2.4,0.1)+zap(5)+'</div>'}
 else if(c==='tynk'){t='Ile tynku?';h='<div class="in">'+inp('Szerokość ściany (m)','a',4,0.1)+inp('Wysokość (m)','b',2.6,0.1)+zap(10)+'</div>'}
 return '<div class="calc" id="calc"><h2>'+t+'</h2>'+h+'<div class="res" id="res" aria-live="polite"></div></div>';
}
function bar(net,zap,buy){var a=net/buy*100,b=Math.min(zap,buy-net)/buy*100;return '<div class="bar" aria-hidden="true" style="gap:0;background:#E3E5E8"><i style="width:'+a+'%"></i><i class="cut" style="width:'+Math.max(0,b)+'%"></i></div>'}
function listwaCalc(p,v,mode){
 var L=p.L/1000,len=0,steps=[];
 if(mode==='room'){len=2*(v.a+v.b);steps.push('obwód 2 x ('+fmt(v.a)+' + '+fmt(v.b)+') = '+fmt(len)+' m')}
 else if(mode==='frames'){len=v.fn*2*(v.fw+v.fh);steps.push(v.fn+' '+plural(v.fn,'ramka','ramki','ramek')+' x '+fmt(2*(v.fw+v.fh))+' m = '+fmt(len)+' m')}
 else{len=v.len;steps.push(fmt(len)+' m ścian')}
 if(isFloor(p)&&mode!=='frames'&&v.d){var dd=v.d*(v.dw||0);len=Math.max(0,len-dd);steps.push('minus drzwi '+v.d+' x '+fmt(v.dw)+' m')}
 var need=len*(1+v.z/100);var n=Math.ceil(need/L-1e-9);
 return {len:len,need:need,n:n,buy:n*L,steps:steps,L:L};
}
function bindCalc(p){
 var box=$('#calc');if(!box)return;var mode=(box.querySelector('[data-mode][aria-pressed=true]')||{}).dataset;mode=mode?mode.mode:'room';
 function vis(){$$('label[data-k]',box).forEach(function(l){var c=l.className;if(!c)return;l.hidden=c.split(' ').indexOf('m-'+mode)<0})}
 function run(){
  var v={};$$('[data-c]',box).forEach(function(i){v[i.dataset.c]=num(i.value)||0});
  var r=$('#res',box),c=p.calc;
  if(c==='listwa'){
   var o=listwaCalc(p,v,mode);
   if(!o.len){r.innerHTML='<p>Podaj wymiary.</p>';return}
   r.innerHTML='<b class="big">'+o.n+' '+plural(o.n,'listwa','listwy','listew')+' '+p.kod+'</b><p>'+o.steps.join(', ')+' = '+fmt(o.len)+' m, z zapasem '+v.z+'% = '+fmt(o.need)+' m. Sprzedaż na pełne listwy po '+fmt(o.L,1)+' m, razem '+fmt(o.buy)+' m.</p>'+bar(o.len,o.need-o.len,o.buy)+'<p>Czarny pasek to długość ścian, złoty to zapas na docinki i narożniki. Do montażu: <a href="#/produkt/klej-do-listew">klej do listew Dynamic Decor</a>.</p>';
   return;
  }
  var area=v.a*v.b,z=v.z/100,n,txt;
  if(!area){r.innerHTML='<p>Podaj wymiary.</p>';return}
  if(c==='panel'){var across=Math.ceil(v.a*1000/p.W*(1+z)-1e-9),rows=Math.ceil(v.b/(p.L/1000)-1e-9);n=across*rows;txt='Ściana '+fmt(v.a)+' m / panel '+p.w+' mm = '+Math.ceil(v.a*1000/p.W-1e-9)+' szt. w rzędzie, z zapasem '+v.z+'% = '+across+'. '+(rows>1?'Wysokość ponad 2,7 m: '+rows+' rzędy na wysokości. ':'Jeden panel 2,7 m na całą wysokość. ')+(ENDS[p.kod]?'Do domknięcia brzegów: zakończenie lewe '+p.kod+'L i prawe '+p.kod+'R, po '+rows+' szt.':'')}
  else if(c==='lamela'||c==='deska'){var r1=Math.ceil(v.b*1000/p.W-1e-9),per=Math.ceil(v.a/(p.L/1000)-1e-9);n=Math.ceil(r1*per*(1+z)-1e-9);txt=r1+' '+plural(r1,'rząd','rzędy','rzędów')+' po '+per+' szt. (długość '+fmt(p.L/1000,1)+' m), z zapasem '+v.z+'%. Bez szczelin i profili montażowych: te dolicza się według instrukcji montażu.'}
  else if(c==='flex'){var pl=num(p.extra['Powierzchnia płyty']);n=Math.ceil(area*(1+z)/pl-1e-9);txt=fmt(area)+' m² + '+v.z+'% zapasu, 1 płyta = '+fmt(pl)+' m². Minimum logistyczne: 20 m² dla koloru SC01, 100 m² dla pozostałych.'}
  else if(c==='skala'){var pa=Math.ceil(area*(1+z)/0.72-1e-9);n=Math.ceil(pa/3);r.innerHTML='<b class="big">'+n+' '+plural(n,'opakowanie','opakowania','opakowań')+' ('+n*3+' paneli)</b><p>'+fmt(area)+' m² + '+v.z+'% zapasu, 1 panel 60 x 120 cm = 0,72 m², w opakowaniu 3 wzory A, B, C, które łączą się bez szwu w pionie i poziomie.</p>';return}
  else if(c==='tynk'){var kg=area*(1+z)*1.1;r.innerHTML='<b class="big">do '+fmt(kg,1)+' kg</b><p>'+fmt(area)+' m² + '+v.z+'% zapasu, wydajność do 1,1 kg/m² suchego produktu. Wielkość opakowania: do uzupełnienia w panelu, wtedy wynik pokaże liczbę opakowań.</p>';return}
  r.innerHTML='<b class="big">'+n+' szt.</b><p>'+txt+'</p>';
 }
 box.addEventListener('input',run);box.addEventListener('change',run);
 $$('[data-mode]',box).forEach(function(b){b.addEventListener('click',function(){mode=b.dataset.mode;$$('[data-mode]',box).forEach(function(x){x.setAttribute('aria-pressed',x===b)});vis();run()})});
 vis();run();
}
function miniCalc(){
 var box=$('#mcalc');if(!box)return;var p=bySlug('f1275');
 function run(){var v={a:0,b:0,d:0};$$('[data-m]',box).forEach(function(i){v[i.dataset.m]=num(i.value)||0});var o=listwaCalc(p,{a:v.a,b:v.b,d:v.d,dw:0.9,z:10},'room');
  $('#mres').innerHTML=o.len?'<b class="big">'+o.n+' '+plural(o.n,'listwa','listwy','listew')+'</b><p>'+o.steps.join(', ')+' = '+fmt(o.len)+' m, z zapasem 10% = '+fmt(o.need)+' m. Kupujesz '+o.n+' x 2,5 m = '+fmt(o.buy)+' m.</p>'+bar(o.len,o.need-o.len,o.buy):'<p>Podaj wymiary pokoju.</p>'}
 box.addEventListener('input',run);run();
}

/* ---------- doradca ---------- */
var FAQ=[
 [/malow|farb/i,'Listwy i panele Dynamic Decor mają matowe, zagruntowane wykończenie i są gotowe do malowania. Najlepiej farbą na bazie wody. Więcej w poradniku <a href="#/blog/czym-malowac-listwy-przypodlogowe">Czym malować listwy przypodłogowe?</a>'],
 [/krzyw|nierówn|nierown/i,'Do krzywych ścian listwę można przykleić na 2 sposoby, opisane krok po kroku we wpisie <a href="#/blog/jak-przykleic-listwy-przypodlogowe-do-krzywych-scian">Jak przykleić listwy przypodłogowe do krzywych ścian?</a> Lekki polistyren łatwo dociąć i docisnąć do ściany.'],
 [/\bklej|przykle|przyklej/i,'Do listew z polistyrenu jest <a href="#/produkt/klej-do-listew">klej do listew Dynamic Decor</a>: jednoskładnikowy, na bazie dyspersji. Więcej we wpisie <a href="#/blog/czym-przyklejac-listwy-przypodlogowe">Czym przyklejać listwy przypodłogowe</a>.'],
 [/ciąć|ciac|cięc|ciec|docin|przecin|piła|pila/i,'Listwy z polistyrenu tnie się narożnikiem i ostrą piłką lub nożem, szczegóły we wpisie <a href="#/blog/czym-ciac-listwy-przypodlogowe-z-polistyrenu">Czym ciąć listwy przypodłogowe z polistyrenu</a>.'],
 [/tapet/i,'Przed montażem tapetę najlepiej usunąć. W razie potrzeby można wyciąć tylko pas pod listwę.'],
 [/pomalowan/i,'Tak, listwy można kleić do pomalowanej ściany, jeśli powierzchnia jest czysta, sucha i odtłuszczona, a farba dobrze trzyma się podłoża.'],
 [/próbk|probk/i,'Próbkę dodasz z każdej karty produktu przyciskiem "Zamów próbkę", a zamówienie wyślesz w zakładce <a href="#/wspolpraca">Współpraca i próbki</a>.'],
 [/kupi|sklep|dealer|salon|cen[ay]|ile kosztuj/i,'Produkty Dynamic Decor kupisz u dystrybutorów. Ceny i dostępność poda dział handlowy: <a href="tel:+48500079199">500 079 199</a>, albo napisz w zakładce <a href="#/wspolpraca">Współpraca</a>.'],
 [/z czego|materiał|material|polistyren/i,'Listwy są ze spienionego polistyrenu o gęstości ok. 0,45 g/cm³: twarde (technologia DynaTech), odporne na wilgoć, grzyby i zadrapania, a przy tym lekkie.'],
 [/sam.*zamont|samodziel|trudny montaż|trudny montaz/i,'Montaż jest prosty: wystarczy trzymać się instrukcji krok po kroku i użyć odpowiedniego kleju. Zobacz <a href="#/blog/jak-zamontowac-listwy-wykonczeniowe-kompletny-poradnik-krok-po-kroku">poradnik montażu</a>.']
];
function advise(q){
 var pr=parse(q);var isQ=/\?|^(czym|jak|czy|ile|gdzie|co |z czego)/i.test(q.trim());var pq=pr.cats.length||pr.size||pr.kol;
 var out=[];FAQ.forEach(function(f){if(f[0].test(q)&&(isQ||!pq))out.push(f[1])});var dm=q.match(/(\d+(?:[.,]\d+)?)\s*(?:m\s*)?(?:x|×|na)\s*(\d+(?:[.,]\d+)?)\s*m?/i);
 var prodAsk=pr.cats.length||pr.size||pr.kol||pr.soft.light;
 if(prodAsk&&!(out.length&&!pr.cats.length&&!pr.size)){
  var list=P.map(function(p){return score(p,pr)}).sort(function(a,b){return b.sc-a.sc}).slice(0,3);
  var s='Rozumiem: '+pr.tags.join(', ')+'. Proponuję:<ul>'+list.map(function(r){return '<li><a href="#/produkt/'+r.p.s+'">'+esc(r.p.n.replace(' Dynamic Decor',''))+'</a> - '+esc(r.why[0]||dimLine(r.p))+'</li>'}).join('')+'</ul>';
  if(dm){var a=parseFloat(dm[1].replace(',','.')),b=parseFloat(dm[2].replace(',','.'));var top=list[0].p;
   if(top.listwa&&a<30&&b<30){var o=listwaCalc(top,{a:a,b:b,d:1,dw:0.9,z:10},'room');s+='Dla pokoju '+fmt(a)+' x '+fmt(b)+' m z jednymi drzwiami potrzebujesz <b>'+o.n+' '+plural(o.n,'listwy','listew','listew')+' '+top.kod+'</b> po 2,5 m (z 10% zapasu). ';}}
  s+='Wszystkie wyniki: <a href="#/katalog?q='+encodeURIComponent(q)+'">katalog</a>.';
  out.unshift(s);
 }
 if(!out.length)return 'Nie rozpoznałem jeszcze, czego szukasz. Napisz, co chcesz wykończyć (podłoga, ściana, sufit, elewacja), jaki kolor i jaka wysokość listwy, albo zapytaj o klejenie, cięcie i malowanie.';
 return out.join('<br><br>');
}
function advSend(q){var ms=$('#msgs');ms.insertAdjacentHTML('beforeend','<div class="msg me">'+esc(q)+'</div><div class="msg ai">'+advise(q)+'</div>');ms.scrollTop=ms.scrollHeight}
function advOpen(on){var p=$('#advp');p.hidden=!on;$('.adv').setAttribute('aria-expanded',on);if(on&&innerWidth>700)$('#advq').focus()}

/* ---------- blog ---------- */
function loadScript(src,cb){var s=document.createElement('script');s.src=src;s.onload=cb;document.head.appendChild(s)}
function bcard(x){return '<a href="#/blog/'+x.s+'"><div class="ph"><img src="'+x.img+'" width="768" height="480" loading="lazy" alt="'+esc(x.t)+'"></div><div class="t"><span class="c">'+esc(x.cn)+'</span><h3>'+esc(x.t)+'</h3><p>'+esc(x.ex)+'</p></div></a>'}
function blogHome(){var el=$('#blhome');if(!el||!window.POSTS)return;el.innerHTML=window.POSTS.slice(0,3).map(bcard).join('')}
var bcat='';
function renderBlog(arg){
 var B=window.POSTS||[];var el=$('#bview');
 var slug=arg&&arg.split('?')[0];
 if(slug){
  var x=B.filter(function(b){return b.s===slug})[0];if(!x){location.hash='#/blog';return}
  var d=x.d.split('-');
  var body=window.POSTBODY?window.POSTBODY[x.s]:null;
  var rel=P.filter(function(p){return CATSLUG[p.cat]===x.c||(x.c==='montaz'&&p.listwa)}).slice(0,4);
  el.innerHTML='<nav class="crumb" aria-label="Okruszki"><a href="#/">Strona główna</a><span>/</span><a href="#/blog">Blog</a><span>/</span><a href="#/blog" data-bc="'+x.c+'">'+esc(x.cn)+'</a></nav><article class="art"><div class="pagehead" style="padding-bottom:0"><h1>'+esc(x.t)+'</h1></div><p class="meta">'+d[2]+'.'+d[1]+'.'+d[0]+' · '+esc(x.cn)+'</p><p class="url">Adres docelowy: <b>dynamicdecor.pl/blog/'+x.c+'/'+x.s+'/</b> (dziś: '+esc(x.old.replace('https://',''))+')</p><div class="cover"><img src="'+x.img+'" alt="'+esc(x.t)+'" width="768" height="480"></div><div class="body">'+(body||'<p>Wczytywanie treści...</p>')+'</div></article>'+(rel.length?'<section class="artside"><div class="shead" style="margin-bottom:22px"><h2 style="font-size:28px">Produkty z tego wpisu</h2><a class="more" href="#/katalog">Katalog</a></div><div class="grid" style="padding-bottom:72px">'+rel.map(function(p){return card(p)}).join('')+'</div></section>':'<div style="height:72px"></div>');
  document.title=x.t+' | Blog Dynamic Decor';
  setLd({'@context':'https://schema.org','@type':'BlogPosting',headline:x.t,datePublished:x.d,url:SITE+'/blog/'+x.c+'/'+x.s+'/',publisher:{'@type':'Organization',name:'Dynamic Decor'}});
  if(!body)loadScript('blog-body.js',function(){if(location.hash.indexOf('#/blog/'+x.s)===0)renderBlog(arg)});
  return;
 }
 var cats=[];B.forEach(function(b){if(!cats.some(function(c){return c[0]===b.c}))cats.push([b.c,b.cn])});
 var list=B.filter(function(b){return !bcat||b.c===bcat});
 el.innerHTML='<nav class="crumb" aria-label="Okruszki"><a href="#/">Strona główna</a><span>/</span>Blog</nav><div class="pagehead"><h1>Blog i poradniki</h1><p>16 wpisów z obecnej strony, każdy w swojej kategorii i z adresem bez "bez-kategorii".</p></div><div class="bcats">'+'<button type="button" class="fc" data-bcat="" aria-pressed="'+(!bcat)+'">Wszystkie <small>'+B.length+'</small></button>'+cats.map(function(c){return '<button type="button" class="fc" data-bcat="'+c[0]+'" aria-pressed="'+(bcat===c[0])+'">'+esc(c[1])+' <small>'+B.filter(function(b){return b.c===c[0]}).length+'</small></button>'}).join('')+'</div><div class="bl" style="padding-bottom:88px">'+list.map(bcard).join('')+'</div>';
 document.title='Blog i poradniki o listwach i panelach | Dynamic Decor';
}

/* ---------- pasy: strzalki ---------- */
function arrowsInit(){$$('.arrows').forEach(function(a){var row=document.getElementById(a.dataset.for);if(!row||row.__ar)return;row.__ar=1;var b=$$('button',a);function u(){b[0].disabled=row.scrollLeft<4;b[1].disabled=row.scrollLeft+row.clientWidth>=row.scrollWidth-4}row.addEventListener('scroll',u,{passive:true});addEventListener('resize',u);setTimeout(u,60)})}

/* ---------- lightbox ---------- */
var LB={list:[],i:0};
function lbShow(){var it=LB.list[LB.i];var lb=$('.lb');$('img',lb).src=it.l;$('img',lb).alt=it.a;$('.lc',lb).textContent=LB.list.length>1?(LB.i+1)+' / '+LB.list.length+' · '+it.a:it.a;$$('.nv',lb).forEach(function(n){n.hidden=LB.list.length<2});lb.hidden=false}
function lbOpen(t){var g=t.dataset.lbg;var els=g?$$('[data-lbg="'+g+'"]',t.closest('main')||document):[t];LB.list=els.map(function(e){return {l:e.dataset.lb,a:(e.getAttribute('aria-label')||'').replace(/^Powiększ:\s*/,'')}});LB.i=Math.max(0,els.indexOf(t));lbShow()}
function lbStep(d){if(LB.list.length<2)return;LB.i=(LB.i+d+LB.list.length)%LB.list.length;lbShow()}

/* ---------- router ---------- */
var LD=null;
function setLd(o){if(LD){LD.remove();LD=null}if(!o)return;LD=document.createElement('script');LD.type='application/ld+json';LD.textContent=JSON.stringify(o);document.head.appendChild(LD)}
function route(){
 var raw=location.hash.replace(/^#/,'')||'/';
 var anchor=null;var ai=raw.indexOf('#',1);if(ai>0){anchor=raw.slice(ai+1);raw=raw.slice(0,ai)}
 var view='home',arg='',qs='';
 var m=raw.match(/^\/(katalog|produkt|wspolpraca|blog|doradca)(?:\/([^?]*))?(?:\?(.*))?$/);
 if(m){view=m[1];arg=m[2]||'';qs=m[3]||''}
 var adv=view==='doradca';if(adv)view='home';
 $$('[data-view]').forEach(function(v){v.classList.toggle('on',v.dataset.view===view)});
 var cur=view;if(view==='katalog'){var g=new URLSearchParams(qs).get('grupa');cur=g==='listwy'?'listwy':g==='panele'?'panele':'katalog'}
 $$('[data-nav]').forEach(function(n){if(n.dataset.nav===cur)n.setAttribute('aria-current','page');else n.removeAttribute('aria-current')});
 setLd(null);closeMenu();
 if(view==='katalog')renderKatalog(qs);
 if(view==='produkt')renderProdukt(arg,anchor);
 if(view==='wspolpraca'){smUpd();var pq=new URLSearchParams(qs).get('probka');if(pq)$('#samplefld').value=pq;document.title='Współpraca dla dystrybutorów, architektów i wykonawców | Dynamic Decor'}
 if(view==='blog')renderBlog(arg);
 if(view==='home')document.title='Listwy przypodłogowe, ścienne, panele 3D i lamele | Dynamic Decor';
 advOpen(adv);
 if(anchor){var t=document.getElementById(anchor);if(t){setTimeout(function(){t.scrollIntoView({behavior:'auto',block:'start'});scrollBy(0,-80)},30);return}}
 window.scrollTo(0,0);
}
function closeMenu(){document.body.classList.remove('fo');$('#fpanel').classList.remove('open');$('.scrim').hidden=true;$('#mnav').hidden=true;$('.burger').setAttribute('aria-expanded','false')}

/* ---------- zdarzenia ---------- */
document.addEventListener('click',function(e){
 var t=e.target.closest('button,a');if(!t)return;
 if(t.matches('.burger')){var mn=$('#mnav');mn.hidden=!mn.hidden;t.setAttribute('aria-expanded',!mn.hidden);return}
 if(t.dataset.q){location.hash='#/katalog?q='+encodeURIComponent(t.dataset.q);return}
 if(t.dataset.f){var k=t.dataset.f,v=t.dataset.v,s=st.f[k]=st.f[k]||[];var i=s.indexOf(v);i<0?s.push(v):s.splice(i,1);renderFilters();renderGrid();return}
 if(t.dataset.clr){st.f[t.dataset.clr]=[];renderFilters();renderGrid();return}
 if(t.hasAttribute('data-qclr')){st.q='';$('#q2').value='';renderGrid();return}
 if(t.hasAttribute('data-fopen')){$('#fpanel').classList.add('open');$('.scrim').hidden=false;document.body.classList.add('fo');return}
 if(t.hasAttribute('data-fclose')){document.body.classList.remove('fo');$('#fpanel').classList.remove('open');$('.scrim').hidden=true;return}
 if(t.dataset.smadd){var sl=t.dataset.smadd;if(SM.indexOf(sl)<0){SM.push(sl);smSave()}t.textContent='Próbka na liście';if(!$('.pact .added'))t.parentNode.insertAdjacentHTML('beforeend','<a class="added" href="#/wspolpraca">Przejdź do zamówienia</a>');return}
 if(t.dataset.smdel){SM=SM.filter(function(x){return x!==t.dataset.smdel});smSave();return}
 if(t.hasAttribute('data-bcat')){bcat=t.dataset.bcat;renderBlog('');return}
 if(t.dataset.bc){bcat=t.dataset.bc}
 if(t.dataset.lb){e.preventDefault();lbOpen(t);return}
 if(t.closest('.lb')){if(t.matches('.nv.p'))lbStep(-1);else if(t.matches('.nv.n'))lbStep(1);else $('.lb').hidden=true;return}
 if(t.matches('.adv')){var open=$('#advp').hidden;advOpen(open);return}
 if(t.hasAttribute('data-advclose')){advOpen(false);if(location.hash==='#/doradca')history.replaceState(null,'','#/');return}
 if(t.dataset.aq){advSend(t.dataset.aq);return}
 if(t.closest('.arrows')){var row=document.getElementById(t.closest('.arrows').dataset.for);var c=row.firstElementChild;row.scrollBy({left:(+t.dataset.d)*(c.offsetWidth+20)*(innerWidth>1100?2:1),behavior:'smooth'});return}
 if(t.matches('a[href="#docs"]')){e.preventDefault();$('#docs').scrollIntoView({behavior:'smooth'});return}
 if(t.closest('.msg.ai')&&t.matches('a[href^="#/"]')&&innerWidth<700)advOpen(false);
});
$('.scrim').addEventListener('click',function(){document.body.classList.remove('fo');$('#fpanel').classList.remove('open');this.hidden=true});
$('.lb').addEventListener('click',function(e){if(e.target===this)this.hidden=true});
(function(){var x0=null;var lb=$('.lb');lb.addEventListener('touchstart',function(e){x0=e.touches[0].clientX},{passive:true});lb.addEventListener('touchend',function(e){if(x0==null)return;var dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>50)lbStep(dx<0?1:-1);x0=null})})();
document.addEventListener('keydown',function(e){var lb=$('.lb');if(!lb.hidden&&(e.key==='ArrowRight'||e.key==='ArrowLeft')){lbStep(e.key==='ArrowRight'?1:-1);return}if(e.key==='Escape'){lb.hidden=true;advOpen(false);closeMenu()}});
document.addEventListener('submit',function(e){
 var f=e.target;
 if(f.matches('[data-ask],[data-ask2]')){e.preventDefault();var q=$('input',f).value.trim();if(f.matches('[data-ask2]')&&location.hash.indexOf('#/katalog')===0){st.q=q;renderGrid();return}location.hash='#/katalog'+(q?'?q='+encodeURIComponent(q):'');return}
 if(f.matches('[data-advform]')){e.preventDefault();var inp2=$('#advq',f),q2=inp2.value.trim();if(!q2)return;advSend(q2);inp2.value='';return}
 if(f.matches('[data-sform]')){e.preventDefault();$('.ok',f).hidden=false}
});
$('#sort').addEventListener('change',function(){st.sort=this.value;renderGrid()});
/* przeciaganie pasow mysza */
document.addEventListener('pointerdown',function(e){
 var row=e.target.closest('.row');if(!row||e.pointerType!=='mouse')return;
 var x0=e.clientX,s0=row.scrollLeft,moved=false;
 function mv(ev){var dx=ev.clientX-x0;if(Math.abs(dx)>5){moved=true;row.classList.add('drag')}row.scrollLeft=s0-dx}
 function up(){document.removeEventListener('pointermove',mv);document.removeEventListener('pointerup',up);setTimeout(function(){row.classList.remove('drag')},0);if(moved){var c=row.firstElementChild,w=c.offsetWidth+parseFloat(getComputedStyle(row).columnGap||20);row.scrollTo({left:Math.round(row.scrollLeft/w)*w,behavior:'smooth'})}}
 document.addEventListener('pointermove',mv);document.addEventListener('pointerup',up);
});
document.addEventListener('dragstart',function(e){if(e.target.closest('.row'))e.preventDefault()});
$$('[data-year]').forEach(function(y){y.textContent=new Date().getFullYear()});
$$('[data-fill]').forEach(function(r){r.innerHTML=r.dataset.fill.split(',').map(function(s){var p=bySlug(s);return p?card(p):''}).join('')});
function topc(){document.body.classList.toggle('top',(location.hash.replace('#','').replace(/^\/$/,'')===''||location.hash==='#/doradca')&&scrollY<innerHeight*.6)}
addEventListener('scroll',topc,{passive:true});
window.addEventListener('hashchange',function(){route();topc()});
smUpd();miniCalc();arrowsInit();
if(innerWidth<560){$('#q1').placeholder='np. biała listwa 10 cm pod malowanie';$('#q2').placeholder='np. czarna listwa 10 cm'}
loadScript('blog-index.js',function(){blogHome();if(location.hash.indexOf('#/blog')===0)route()});
route();topc();
})();
