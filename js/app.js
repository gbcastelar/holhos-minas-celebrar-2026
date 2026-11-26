
(() => {
  const cfg = window.HO_CONFIG || {};

  const form = document.getElementById("rsvp-form");
  const status = document.getElementById("form-status");
  const success = document.getElementById("success-panel");
  const successMessage = document.getElementById("success-message");
  const whatsappLink = document.getElementById("whatsapp-link");
  const noButton = document.getElementById("no-button");

  // Elementos opcionais
  const eventDate = document.getElementById("event-date");

  if (eventDate) {
    eventDate.textContent =
      cfg.EVENT_DATE_LABEL || "20 de dezembro de 2026";
  }

  const mapsLink = document.getElementById("maps-link");

  if (mapsLink) {
    mapsLink.href = cfg.MAPS_URL || "#";
  }

  // Verifica os elementos obrigatórios
  if (!form || !status || !success || !noButton) {
    console.error("Elementos obrigatórios do formulário não encontrados.");
    return;
  }

  const configured = () =>
    cfg.SUPABASE_URL &&
    cfg.SUPABASE_ANON_KEY &&
    !cfg.SUPABASE_URL.includes("SEU-PROJETO") &&
    !cfg.SUPABASE_ANON_KEY.includes("SUA_CHAVE");

  // Conexão com Supabase
  const client =
    configured() && window.supabase
      ? window.supabase.createClient(
          cfg.SUPABASE_URL,
          cfg.SUPABASE_ANON_KEY
        )
      : null;

  function digits(value) {
    return (value || "").replace(/\D/g, "");
  }

  // Monta o link do WhatsApp
  function whatsappUrl(name, phone, attendance) {
    const answer =
      attendance === "yes"
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

  // Exibe uma mensagem de status
  function showStatus(message) {
    status.textContent = message;
    status.hidden = false;
  }

  // Finaliza o processamento com sucesso
  function showSuccess(name, phone, attendance) {
    // Limpa a mensagem de processamento
    status.textContent = "";
    status.hidden = true;
    status.style.display = "none";

    // Oculta o formulário
    form.hidden = true;
    form.style.display = "none";

    // Atualiza a mensagem de sucesso
    successMessage.textContent =
      attendance === "yes"
        ? "Sua presença foi registrada. Será muito bom celebrar com você!"
        : "Obrigado por nos avisar. Sua resposta foi registrada.";

    // Configura o WhatsApp
    if (whatsappLink) {
      whatsappLink.href = whatsappUrl(name, phone, attendance);
      whatsappLink.hidden = false;
    }

    // Mostra o painel de sucesso
    success.hidden = false;
    success.style.display = "";
  }

  // Envia a resposta
  async function submit(attendance) {
    status.textContent = "";
    status.hidden = false;
    status.style.display = "";

    const nameInput = document.getElementById("guest-name");
    const phoneInput = document.getElementById("guest-phone");
    const consentInput = document.getElementById("privacy-consent");

    if (!nameInput || !phoneInput || !consentInput) {
      showStatus("Não foi possível localizar todos os campos do formulário.");
      console.error("Campos obrigatórios não encontrados.");
      return;
    }

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const consent = consentInput.checked;

    // Validação
    if (!name || !phone || digits(phone).length < 10 || !consent) {
      showStatus(
        "Informe seu nome, um WhatsApp válido e aceite o uso dos dados."
      );
      return;
    }

    if (!client) {
      showStatus(
        "Não foi possível conectar ao sistema. Avise a organização pelo WhatsApp."
      );

      console.error(
        "Supabase não configurado ou biblioteca indisponível."
      );
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

    // Evita envios duplicados durante o processamento
    buttons.forEach(button => {
      button.disabled = true;
    });

    showStatus("Registrando sua resposta...");

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

      // Exibe a tela final e remove o status de processamento
      showSuccess(name, phone, attendance);

    } catch (err) {
      console.error("Falha ao registrar confirmação:", err);

      showStatus(
        "Não foi possível registrar sua resposta. Tente novamente ou fale com a organização pelo WhatsApp."
      );

      // Libera os botões para uma nova tentativa
      buttons.forEach(button => {
        button.disabled = false;
      });
    }
  }

  // Confirmação de presença
  form.addEventListener("submit", event => {
    event.preventDefault();
    submit("yes");
  });

  // Não poderá participar
  noButton.addEventListener("click", event => {
    event.preventDefault();
    submit("no");
  });

})();
