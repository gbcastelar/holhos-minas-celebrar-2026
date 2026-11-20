(() => {
 const cfg=window.HO_CONFIG||{}, $=id=>document.getElementById(id);
 const configured=cfg.SUPABASE_URL&&!cfg.SUPABASE_URL.includes("SEU-PROJETO")&&cfg.SUPABASE_ANON_KEY&&!cfg.SUPABASE_ANON_KEY.includes("SUA_CHAVE");
 const db=configured&&window.supabase?window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY):null;
 let records=[];
 function message(id,text){$(id).textContent=text}
 function date(v){return v?new Date(v).toLocaleString("pt-BR"):"—"}
 function filtered(){const q=$("search").value.toLowerCase(),f=$("filter").value;return records.filter(r=>(f==="all"||r.attendance===f)&&(`${r.name} ${r.phone}`.toLowerCase().includes(q)))}
 function render(){
  const yes=records.filter(r=>r.attendance==="yes").length,no=records.filter(r=>r.attendance==="no").length;
  $("total").textContent=records.length;$("yes").textContent=yes;$("no").textContent=no;$("people").textContent=yes;
  const list=filtered();$("rows").innerHTML=list.length?list.map(r=>`<tr><td>${escapeHtml(r.name)}</td><td>${escapeHtml(r.phone)}</td><td><span class="pill ${r.attendance}">${r.attendance==="yes"?"Confirmado":"Não participará"}</span></td><td>${date(r.created_at)}</td></tr>`).join(""):'<tr><td colspan="4">Nenhum registro encontrado.</td></tr>';
 }
 function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
 async function load(){
  message("data-status","Atualizando...");
  const {data,error}=await db.from("celebrar_confirmations").select("id,name,phone,attendance,created_at").order("created_at",{ascending:false});
  if(error){message("data-status","Erro ao carregar: "+error.message);return}
  records=data||[];render();message("data-status",`${records.length} resposta(s) carregada(s).`);
 }
 $("login-form").addEventListener("submit",async e=>{e.preventDefault();if(!db){message("login-status","Configure o Supabase em js/config.js antes de acessar.");return}
  message("login-status","Validando acesso...");
  const {error}=await db.auth.signInWithPassword({email:$("email").value,password:$("password").value});
  if(error){message("login-status","Não foi possível entrar. Verifique suas credenciais.");return}
  await showDashboard();
 });
 async function showDashboard(){
  const {data}=await db.auth.getUser();if(!data.user)return;
  $("login-card").hidden=true;$("dashboard").hidden=false;$("admin-email").textContent=data.user.email||"Administrador";await load();
 }
 $("logout").addEventListener("click",async()=>{await db.auth.signOut();$("dashboard").hidden=true;$("login-card").hidden=false});
 $("refresh").addEventListener("click",load);$("search").addEventListener("input",render);$("filter").addEventListener("change",render);
 $("csv").addEventListener("click",()=>{
  const rows=[["Nome","WhatsApp","Resposta","Data da resposta"],...filtered().map(r=>[r.name,r.phone,r.attendance==="yes"?"Confirmado":"Não participará",date(r.created_at)])];
  const csv="\uFEFF"+rows.map(row=>row.map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(";")).join("\r\n");
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));a.download="holhos-minas-confirmacoes.csv";a.click();URL.revokeObjectURL(a.href);
 });
 $("print").addEventListener("click",()=>window.print());
 if(!db){message("login-status","Configure as credenciais do Supabase em js/config.js.");}
 else db.auth.getSession().then(({data})=>{if(data.session)showDashboard()});
})();