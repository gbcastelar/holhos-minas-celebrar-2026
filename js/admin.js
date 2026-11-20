(() => {
 const cfg=window.HO_CONFIG||{}, $=id=>document.getElementById(id);
 const configured=cfg.SUPABASE_URL&&!cfg.SUPABASE_URL.includes("SEU-PROJETO")&&cfg.SUPABASE_ANON_KEY&&!cfg.SUPABASE_ANON_KEY.includes("SUA_CHAVE");
 const db=configured&&window.supabase?window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY):null;
 let records=[],attendanceChart=null,timelineChart=null;
 const msg=(id,text)=>$(id).textContent=text;
 const date=v=>v?new Date(v).toLocaleString("pt-BR"):"—";
 const escapeHtml=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 function filtered(){const q=$("search").value.toLocaleLowerCase("pt-BR"),f=$("filter").value;return records.filter(r=>(f==="all"||r.attendance===f)&&(`${r.name||""} ${r.phone||""}`).toLocaleLowerCase("pt-BR").includes(q));}
 function chartDefaults(){return {responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{backgroundColor:"#071a30",titleColor:"#fff",bodyColor:"#dce8f5",padding:12,cornerRadius:10}},animation:{duration:650}};}
 function drawCharts(yes,no){
  const dctx=$("attendance-chart");
  if(attendanceChart)attendanceChart.destroy();
  attendanceChart=new Chart(dctx,{type:"doughnut",data:{labels:["Confirmados","Não participarão"],datasets:[{data:[yes,no],backgroundColor:["#48c78e","#ff7b72"],borderColor:"#10253d",borderWidth:5,hoverOffset:7}]},options:{...chartDefaults(),cutout:"76%"}});
  const labels=[],values=[];for(let i=6;i>=0;i--){const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-i);labels.push(d.toLocaleDateString("pt-BR",{weekday:"short",day:"2-digit"}).replace(".",""));const key=d.toISOString().slice(0,10);values.push(records.filter(r=>r.created_at&&new Date(r.created_at).toISOString().slice(0,10)===key).length);}
  if(timelineChart)timelineChart.destroy();
  timelineChart=new Chart($("timeline-chart"),{type:"line",data:{labels,datasets:[{data:values,borderColor:"#65a9ff",backgroundColor:"rgba(72,145,255,.15)",fill:true,tension:.38,borderWidth:3,pointRadius:4,pointHoverRadius:6,pointBackgroundColor:"#8bcf83",pointBorderColor:"#10253d",pointBorderWidth:2}]},options:{...chartDefaults(),scales:{x:{grid:{display:false},ticks:{color:"#8fa5bd",font:{size:10}}},y:{beginAtZero:true,ticks:{precision:0,color:"#8fa5bd",font:{size:10}},grid:{color:"rgba(255,255,255,.07)"}}}}});
 }
 function render(){
  const yes=records.filter(r=>r.attendance==="yes").length,no=records.filter(r=>r.attendance==="no").length,total=records.length,rate=total?Math.round(yes/total*100):0;
  $("total").textContent=total;$("yes").textContent=yes;$("no").textContent=no;$("rate").textContent=rate+"%";$("donut-total").textContent=total;$("legend-yes").textContent=yes;$("legend-no").textContent=no;
  const list=filtered();$("rows").innerHTML=list.length?list.map(r=>`<tr><td><strong class="guest-name">${escapeHtml(r.name)}</strong></td><td>${escapeHtml(r.phone)}</td><td><span class="pill ${r.attendance}"><i></i>${r.attendance==="yes"?"Confirmado":"Não participará"}</span></td><td>${date(r.created_at)}</td></tr>`).join(""):'<tr><td colspan="4" class="empty">Nenhum registro encontrado.</td></tr>';
  drawCharts(yes,no);
 }
 async function load(){if(!db)return;msg("data-status","Buscando registros...");$("refresh").disabled=true;
  const {data,error}=await db.from("celebrar_confirmations").select("id,name,phone,attendance,created_at").order("created_at",{ascending:false});
  $("refresh").disabled=false;
  if(error){msg("data-status","Não foi possível carregar: "+error.message);return;}
  records=data||[];render();const now=new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});msg("data-status",`${records.length} resposta(s) carregada(s).`);msg("last-updated",now);
 }
 async function showDashboard(){const {data}=await db.auth.getUser();if(!data.user)return;$("login-card").hidden=true;$("dashboard").hidden=false;$("admin-email").textContent=data.user.email||"Administrador";await load();}
 $("login-form").addEventListener("submit",async e=>{e.preventDefault();if(!db){msg("login-status","Verifique a configuração do Supabase em js/config.js.");return;}msg("login-status","Validando acesso...");const {error}=await db.auth.signInWithPassword({email:$("email").value.trim(),password:$("password").value});if(error){msg("login-status","Não foi possível entrar. Confira o e-mail, a senha e a confirmação do usuário no Supabase.");return;}await showDashboard();});
 $("logout").addEventListener("click",async()=>{await db.auth.signOut();$("dashboard").hidden=true;$("login-card").hidden=false;});
 $("refresh").addEventListener("click",load);$("search").addEventListener("input",render);$("filter").addEventListener("change",render);
 $("csv").addEventListener("click",()=>{const rows=[["Nome","WhatsApp","Resposta","Data da resposta"],...filtered().map(r=>[r.name,r.phone,r.attendance==="yes"?"Confirmado":"Não participará",date(r.created_at)])];const csv="\uFEFF"+rows.map(row=>row.map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(";")).join("\r\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));a.download="holhos-minas-confirmacoes.csv";a.click();URL.revokeObjectURL(a.href);});
 $("print").addEventListener("click",()=>window.print());
 if(!db)msg("login-status","Configure o Supabase em js/config.js.");else db.auth.getSession().then(({data})=>{if(data.session)showDashboard();});
})();
