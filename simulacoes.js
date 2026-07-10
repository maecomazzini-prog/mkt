
const fallbackData={products:[
{id:"imersao",name:"Imersão executiva",ticket:8500},{id:"pos",name:"Pós-graduação",ticket:24000},
{id:"mba",name:"MBA",ticket:42000},{id:"corporate",name:"Programa in company",ticket:78000},
{id:"evento",name:"Evento executivo",ticket:2800}],
crossSellPaths:{imersao:["pos","mba","corporate"],pos:["mba","evento","corporate"],mba:["evento","corporate"],corporate:["imersao","evento","pos"],evento:["imersao","pos","mba"]}};
const brl=v=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0}).format(v||0);
const fmt=v=>new Intl.NumberFormat("pt-BR",{maximumFractionDigits:1}).format(v||0);

function bars(el,values,labels,colors){
 const max=Math.max(...values,1),base=245,bw=88,gap=55,start=55;
 let s=`<line x1="40" y1="${base}" x2="500" y2="${base}" stroke="rgba(255,255,255,.22)"/>`;
 values.forEach((v,i)=>{const bh=v/max*175,x=start+i*(bw+gap),y=base-bh;
 s+=`<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="12" fill="${colors[i]}"/>`;
 s+=`<text x="${x+bw/2}" y="${Math.max(y-10,18)}" text-anchor="middle" fill="#fff" font-size="14" font-weight="700">${brl(v)}</text>`;
 s+=`<text x="${x+bw/2}" y="273" text-anchor="middle" fill="rgba(255,255,255,.72)" font-size="12">${labels[i]}</text>`});
 el.innerHTML=s;
}
function line(el,cac,ltv,months){
 const L=48,R=500,T=28,B=245,max=Math.max(cac,ltv,1)*1.12,pts=[];
 const step=Math.max(1,Math.round(months/6));
 for(let m=0;m<=months;m+=step){let v=ltv/months*m;pts.push([L+m/months*(R-L),B-v/max*(B-T),m])}
 if(pts.at(-1)[2]!==months)pts.push([R,B-ltv/max*(B-T),months]);
 const cy=B-cac/max*(B-T);
 let s=`<line x1="${L}" y1="${B}" x2="${R}" y2="${B}" stroke="rgba(255,255,255,.22)"/>
 <line x1="${L}" y1="${T}" x2="${L}" y2="${B}" stroke="rgba(255,255,255,.22)"/>
 <line x1="${L}" y1="${cy}" x2="${R}" y2="${cy}" stroke="#f4c928" stroke-dasharray="7 6"/>
 <text x="${R-4}" y="${cy-8}" text-anchor="end" fill="#f4c928" font-size="12">CAC ${brl(cac)}</text>
 <polyline points="${pts.map(p=>p[0]+","+p[1]).join(" ")}" fill="none" stroke="#a77ad6" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
 pts.forEach(p=>s+=`<circle cx="${p[0]}" cy="${p[1]}" r="5" fill="#fff"/><text x="${p[0]}" y="272" text-anchor="middle" fill="rgba(255,255,255,.7)" font-size="11">${p[2]}m</text>`);
 s+=`<text x="${R}" y="${Math.max(T+12,pts.at(-1)[1]-12)}" text-anchor="end" fill="#fff" font-size="13" font-weight="700">LTV margem ${brl(ltv)}</text>`;
 el.innerHTML=s;
}
async function loadData(){try{const r=await fetch("dados.json");if(r.ok)return await r.json()}catch(e){}return fallbackData}
loadData().then(data=>{
 const byId=Object.fromEntries(data.products.map(p=>[p.id,p])),select=document.getElementById("entryProduct");
 data.products.forEach(p=>select.insertAdjacentHTML("beforeend",`<option value="${p.id}">${p.name}</option>`));
 const employeesEl=document.getElementById("employees");
 function updateCross(){
  const p=byId[select.value],emp=+employeesEl.value,rate=+crossRate.value/100,extra=+expansionTicket.value;
  const initial=p.ticket*Math.max(1,Math.ceil(emp/25)),expansion=extra*rate*Math.max(1,Math.ceil(emp/50)),total=initial+expansion;
  entryLabel.textContent=p.name;employeesValue.textContent=emp;crossValue.textContent=Math.round(rate*100)+"%";expansionValue.textContent=brl(extra);
  initialRevenue.textContent=brl(initial);expansionRevenue.textContent=brl(expansion);accountValue.textContent=brl(total);
  const ids=data.crossSellPaths[p.id]||[];suggestedCount.textContent=ids.length;
  bars(crossChart,[initial,expansion,total],["Entrada","Expansão","Total"],["#8b5cc4","#f4c928","#ffffff"]);
  productPath.innerHTML=`<div class="product-pill primary"><strong>${p.name}</strong><br><small>Produto de entrada</small></div>`+
  ids.map(id=>`<span class="path-arrow">→</span><div class="product-pill cross"><strong>${byId[id].name}</strong><br><small>Possível cross-sell</small></div>`).join("");
 }
 [select,employeesEl,crossRate,expansionTicket].forEach(el=>el.addEventListener("input",updateCross));select.value="corporate";updateCross();

 function updateEconomics(){
  const spend=+acqSpend.value,customers=Math.max(1,+newCustomers.value),ticket=+avgTicket.value,margin=+grossMargin.value/100,pur=+purchases.value,months=Math.max(1,+retention.value);
  const cac=spend/customers,rev=ticket*pur,ltv=rev*margin,ratio=ltv/cac,monthly=ltv/months,payback=monthly?cac/monthly:0;
  cacResult.textContent=brl(cac);ltvRevenue.textContent=brl(rev);ltvMargin.textContent=brl(ltv);ratioResult.textContent=fmt(ratio)+"x";paybackResult.textContent=fmt(payback)+" meses";
  scenarioHealth.textContent=ratio>=3?"Saudável":ratio>=1.5?"Atenção":"Crítico";line(ltvChart,cac,ltv,months);
 }
 [acqSpend,newCustomers,avgTicket,grossMargin,purchases,retention].forEach(el=>el.addEventListener("input",updateEconomics));updateEconomics();
});
