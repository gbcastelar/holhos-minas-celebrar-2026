
(() => {
  const cfg = window.HO_CONFIG || {};

  const form = document.getElementById("rsvp-form");
  const status = document.getElementById("form-status");
  const success = document.getElementById("success-panel");
  const successMessage = document.getElementById("success-message");
  const whatsappLink = document.getElementById("whatsapp-link");
  const noButton = document.getElementById("no-button");

  // Elementos opcionais: não interromper o site se não existirem.
  const eventDate = document.getElementById("event-date");
  if (eventDate) {
    eventDate.textContent = cfg.EVENT_DATE_LABEL || "20 de dezembro de 2026";
  }

  const mapsLink = document.getElementById("maps-link");
  if (mapsLink) {
    mapsLink.href = cfg.MAPS_URL || "#";
  }

  if (!form || !status || !success || !noButton) {
    console.error("Elementos obrigatórios do formulário não encontrados.");
    return;
  }

  const configured = () =>
    cfg.SUPABASE_URL &&
    cfg.SUPABASE_ANON_KEY &&
    !cfg.SUPABASE_URL.includes("SEU-PROJETO") &&
    !cfg.SUPABASE_ANON_KEY.includes("SUA_CHAVE");

  const client = configured() && window.supabase
    ? window.supabase.createClient(
        cfg.SUPABASE_URL,
        cfg.SUPABASE_ANON_KEY
      )
    : null;

  function digits(value) {
    return (value || "").replace(/\D/g, "");
  }

  function whatsappUrl(name, phone, attendance) {
    const answer = attendance === "yes"
      ? "Confirmo minha presença"
      : "Não poderei participar";

    const msg =
      `Olá! Minha resposta para ${cfg.EVENT_NAME || "a confraternização da H.Olhos Minas"}:\n\n` +
      `Nome: ${name}\n` +
      `WhatsApp: ${phone}\n` +
      `Resposta: ${answer}\n\n` +
      "Gostaria de conversar sobre o evento. Obrigado!";

    return `https://wa.me/${cfg.WHATSAPP_NUMBER || "5535987127985"}?text=${encodeURIComponent(msg)}`;
  }

  async function submit(attendance) {
    status.textContent = "";

    const name = document.getElementById("guest-name").value.trim();
    const phone = document.getElementById("guest-phone").value.trim();
    const consent = document.getElementById("privacy-consent").checked;

    if (!name || !phone || digits(phone).length < 10 || !consent) {
      status.textContent =
        "Informe seu nome, um WhatsApp válido e aceite o uso dos dados.";
      return;
    }

    if (!client) {
      status.textContent =
        "Não foi possível conectar ao sistema. Avise a organização pelo WhatsApp.";
      console.error("Supabase não configurado ou biblioteca indisponível.");
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
    buttons.forEach(button => button.disabled = true);

    status.textContent = "Registrando sua resposta...";

    try {
      const { data, error } = await client
        .from("celebrar_confirmations")
        .insert(payload)
        .select("id")
        .single();

      if (error) {
        console.error("Erro Supabase:", error);
        throw error;
      }

      console.log("Confirmação gravada:", data);

      form.hidden = true;
      success.hidden = false;

      successMessage.textContent = attendance === "yes"
        ? "Sua presença foi registrada. Será muito bom celebrar com você!"
        : "Obrigado por nos avisar. Sua resposta foi registrada.";

      whatsappLink.href = whatsappUrl(name, phone, attendance);
      whatsappLink.hidden = false;

    } catch (err) {
      console.error("Falha ao registrar confirmação:", err);

      status.textContent =
        "Não foi possível registrar sua resposta. Tente novamente ou fale com a organização pelo WhatsApp.";

      buttons.forEach(button => button.disabled = false);
    }
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    submit("yes");
  });

  noButton.addEventListener("click", () => submit("no"));

})();
