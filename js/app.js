(() => {
  const cfg = window.HO_CONFIG || {};
  const form = document.getElementById("rsvp-form");
  const status = document.getElementById("form-status");
  const success = document.getElementById("success-panel");
  const successMessage = document.getElementById("success-message");
  const whatsappLink = document.getElementById("whatsapp-link");
  const noButton = document.getElementById("no-button");
  document.getElementById("event-date").textContent = cfg.EVENT_DATE_LABEL || "Em breve";
  document.getElementById("maps-link").href = cfg.MAPS_URL || "#";

  const configured = () => cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY &&
    !cfg.SUPABASE_URL.includes("SEU-PROJETO") && !cfg.SUPABASE_ANON_KEY.includes("SUA_CHAVE");
  const client = configured() && window.supabase
    ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY)
    : null;

  function digits(value) { return (value || "").replace(/\D/g, ""); }
  function whatsappUrl(name, phone, attendance) {
    const answer = attendance === "yes" ? "Confirmo minha presença" : "Não poderei participar";
    const msg = `Olá! Minha resposta para ${cfg.EVENT_NAME || "a confraternização da H.Olhos Minas"}:\n\nNome: ${name}\nWhatsApp: ${phone}\nResposta: ${answer}\n\nObrigado!`;
    return `https://wa.me/${cfg.WHATSAPP_NUMBER || "5535987127985"}?text=${encodeURIComponent(msg)}`;
  }
  async function submit(attendance) {
    status.textContent = "";
    const name = document.getElementById("guest-name").value.trim();
    const phone = document.getElementById("guest-phone").value.trim();
    const consent = document.getElementById("privacy-consent").checked;
    if (!name || !phone || digits(phone).length < 10 || !consent) {
      status.textContent = "Informe seu nome, um WhatsApp válido e aceite o uso dos dados para organização do evento.";
      return;
    }
    if (!client) {
      status.textContent = "O site ainda está em configuração. A organização precisa conectar o Supabase antes de receber confirmações.";
      return;
    }
    const payload = {
      name,
      phone,
      attendance,
      companions: 0,
      consent: true,
      source: "website"
    };
    const buttons = form.querySelectorAll("button");
    buttons.forEach(b => b.disabled = true);
    status.textContent = "Registrando sua resposta...";
    try {
      const { error } = await client.from("celebrar_confirmations").insert(payload);
      if (error) throw error;
      form.hidden = true;
      success.hidden = false;
      successMessage.textContent = attendance === "yes"
        ? "Sua presença foi registrada. Será muito bom celebrar com você!"
        : "Obrigado por nos avisar. Sua resposta foi registrada.";
      whatsappLink.href = whatsappUrl(name, phone, attendance);
      whatsappLink.hidden = false;
    } catch (err) {
      console.error(err);
      status.textContent = "Não foi possível registrar agora. Confira sua conexão ou tente novamente mais tarde.";
      buttons.forEach(b => b.disabled = false);
    }
  }
  form.addEventListener("submit", e => { e.preventDefault(); submit("yes"); });
  noButton.addEventListener("click", () => submit("no"));
})();