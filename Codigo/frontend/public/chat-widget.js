(function initWidgetFactory() {
  // Guarda de duplicação: se já existe um host do widget, não cria outro.
  if (document.querySelector('[data-chatbot="nextstep-english-widget"]')) {
    return;
  }

  const STYLE_TEXT = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap');

:host {
  all: initial;
}

* {
  box-sizing: border-box;
  font-family: 'Outfit', 'Segoe UI', sans-serif;
}

.chatbot-root {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 999999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

/* ── Bolinha ────────────────────────────────────────────── */
.chatbot-bubble {
  width: 64px;
  height: 64px;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  background: linear-gradient(145deg, #ae211f 0%, #224292 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(174, 33, 31, 0.45), 0 2px 8px rgba(34, 66, 146, 0.3);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  position: relative;
}

.chatbot-bubble:hover {
  transform: scale(1.08) translateY(-2px);
  box-shadow: 0 14px 32px rgba(174, 33, 31, 0.5), 0 4px 12px rgba(34, 66, 146, 0.35);
}

.chatbot-bubble:active {
  transform: scale(0.97);
}

.chatbot-bubble-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
}

.chatbot-bubble-label {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.04em;
  line-height: 1;
  color: #fbbf24;
}

/* ── Painel ─────────────────────────────────────────────── */
.chatbot-panel {
  width: min(370px, calc(100vw - 30px));
  height: min(580px, calc(100vh - 110px));
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 14px;
  display: none;
  flex-direction: column;
  background: #f8fafc;
  box-shadow: 0 20px 48px rgba(34, 66, 146, 0.22), 0 4px 12px rgba(174, 33, 31, 0.12);
  border: 2px solid #224292;
}

.chatbot-panel.open {
  display: flex;
  animation: ns-slide-up 0.22s ease both;
}

@keyframes ns-slide-up {
  from { opacity: 0; transform: translateY(16px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.chatbot-header {
  background: linear-gradient(135deg, #224292 0%, #ae211f 100%);
  color: #ffffff;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.chatbot-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.chatbot-header-avatar {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: rgba(255,255,255,0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.chatbot-header-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.chatbot-title {
  margin: 0;
  font-size: 15px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0.01em;
}

.chatbot-subtitle {
  font-size: 11px;
  font-weight: 500;
  opacity: 0.82;
  line-height: 1;
}

.chatbot-close {
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 999px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.18);
  color: #ffffff;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.chatbot-close:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* ── Mensagens ──────────────────────────────────────────── */
.chatbot-messages {
  flex: 1;
  overflow-y: auto;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #f0f4ff;
}

.chatbot-message {
  max-width: 85%;
  padding: 10px 13px;
  border-radius: 14px;
  line-height: 1.5;
  font-size: 14px;
  font-weight: 500;
  white-space: pre-wrap;
}

.chatbot-message.user {
  align-self: flex-end;
  background: #224292;
  color: #ffffff;
  border-bottom-right-radius: 3px;
}

.chatbot-message.assistant {
  align-self: flex-start;
  background: #ffffff;
  color: #1a1a2e;
  border-bottom-left-radius: 3px;
  border: 1px solid #dde5ff;
}

.chatbot-message.error {
  align-self: flex-start;
  background: #fff1f0;
  color: #ae211f;
  border: 1px solid #fca5a5;
  border-bottom-left-radius: 3px;
  font-weight: 600;
}

.chatbot-typing {
  align-self: flex-start;
  color: #224292;
  font-style: italic;
  font-size: 13px;
  font-weight: 500;
}

/* ── Rodapé ─────────────────────────────────────────────── */
.chatbot-footer {
  border-top: 2px solid #dde5ff;
  background: #ffffff;
  padding: 10px 12px;
  display: flex;
  gap: 8px;
  align-items: center;
}

.chatbot-input {
  flex: 1;
  border: 2px solid #dde5ff;
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 14px;
  font-weight: 500;
  outline: none;
  font-family: 'Outfit', 'Segoe UI', sans-serif;
  transition: border-color 0.15s;
  color: #1a1a2e;
}

.chatbot-input:focus {
  border-color: #224292;
}

.chatbot-send {
  border: none;
  border-radius: 12px;
  cursor: pointer;
  background: linear-gradient(135deg, #224292, #ae211f);
  color: #ffffff;
  font-weight: 700;
  font-family: 'Outfit', 'Segoe UI', sans-serif;
  padding: 10px 16px;
  font-size: 14px;
  transition: opacity 0.15s, transform 0.15s;
}

.chatbot-send:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.chatbot-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 600px) {
  .chatbot-root {
    right: 12px;
    bottom: 12px;
  }
  .chatbot-panel {
    width: calc(100vw - 24px);
    height: min(560px, calc(100vh - 88px));
  }
}
`;

  const DEFAULT_CONFIG = {
    apiUrl: "http://localhost:3001/api/chat",
    title: "Tutor de Ingles",
    welcomeMessage:
      "Oi! Eu sou seu tutor de ingles. Manda sua duvida e vamos praticar juntos.",
  };

  function createMessageElement(root, role, text) {
    const messageEl = root.ownerDocument.createElement("div");
    messageEl.className = `chatbot-message ${role}`;
    messageEl.textContent = text;
    return messageEl;
  }

  function mountWidget(userConfig) {
    const config = { ...DEFAULT_CONFIG, ...(userConfig || {}) };
    const host = document.createElement("div");
    host.setAttribute("data-chatbot", "nextstep-english-widget");
    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = STYLE_TEXT;
    shadow.appendChild(style);

    const root = document.createElement("div");
    root.className = "chatbot-root";

    root.innerHTML = `
      <section class="chatbot-panel" aria-live="polite">
        <header class="chatbot-header">
          <div class="chatbot-header-left">
            <div class="chatbot-header-avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#fbbf24" stroke="#fbbf24" stroke-width="1.5" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="chatbot-header-info">
              <h2 class="chatbot-title"></h2>
              <span class="chatbot-subtitle">Tutor de Ingl\u00eas \u2022 Online</span>
            </div>
          </div>
          <button class="chatbot-close" type="button" aria-label="Fechar chat">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="white" stroke-width="2.2" stroke-linecap="round"/></svg>
          </button>
        </header>
        <div class="chatbot-messages"></div>
        <footer class="chatbot-footer">
          <input class="chatbot-input" type="text" maxlength="1200" placeholder="Digite sua d\u00favida..." />
          <button class="chatbot-send" type="button">Enviar</button>
        </footer>
      </section>
      <button class="chatbot-bubble" type="button" aria-label="Abrir tutor de ingl\u00eas">
        <div class="chatbot-bubble-icon">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#fbbf24" stroke="#f59e0b" stroke-width="1.2" stroke-linejoin="round"/>
          </svg>
          <span class="chatbot-bubble-label">EN</span>
        </div>
      </button>
    `;

    shadow.appendChild(root);

    const panel = root.querySelector(".chatbot-panel");
    const bubble = root.querySelector(".chatbot-bubble");
    const closeBtn = root.querySelector(".chatbot-close");
    const title = root.querySelector(".chatbot-title");
    const messagesEl = root.querySelector(".chatbot-messages");
    const inputEl = root.querySelector(".chatbot-input");
    const sendBtn = root.querySelector(".chatbot-send");

    title.textContent = config.title;

    const history = [];

    function scrollToBottom() {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function appendMessage(role, text) {
      const safeRole = role === "user" ? "user" : "assistant";
      messagesEl.appendChild(createMessageElement(root, safeRole, text));
      scrollToBottom();
    }

    function setLoading(isLoading) {
      sendBtn.disabled = isLoading;
      inputEl.disabled = isLoading;

      const existingTyping = messagesEl.querySelector(".chatbot-typing");

      if (isLoading && !existingTyping) {
        const typingEl = root.ownerDocument.createElement("div");
        typingEl.className = "chatbot-typing";
        typingEl.textContent = "Tutor digitando...";
        messagesEl.appendChild(typingEl);
        scrollToBottom();
      }

      if (!isLoading && existingTyping) {
        existingTyping.remove();
      }
    }

    async function sendMessage() {
      const question = inputEl.value.trim();
      if (!question) {
        return;
      }

      appendMessage("user", question);
      history.push({ role: "user", content: question });
      inputEl.value = "";
      setLoading(true);

      try {
        const response = await fetch(config.apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: question,
            history,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `Erro ${response.status}: nao foi possivel obter resposta.`);
        }

        const answer = data.reply || "Nao consegui gerar uma resposta agora.";
        appendMessage("assistant", answer);
        history.push({ role: "assistant", content: answer });
      } catch (error) {
        const errEl = root.ownerDocument.createElement("div");
        errEl.className = "chatbot-message error";
        // Extrai mensagem amigável do backend ou usa genérica
        const serverMsg = error && error.message && error.message.length < 200
          ? error.message
          : "Falha ao conectar com o tutor. Verifique se o backend está ativo e tente novamente.";
        errEl.textContent = serverMsg;
        messagesEl.appendChild(errEl);
        scrollToBottom();
        console.error("[widget-chatbot]", error);
      } finally {
        setLoading(false);
        inputEl.focus();
      }
    }

    bubble.addEventListener("click", () => {
      panel.classList.toggle("open");
      if (panel.classList.contains("open")) {
        inputEl.focus();
      }
    });

    closeBtn.addEventListener("click", () => {
      panel.classList.remove("open");
    });

    sendBtn.addEventListener("click", sendMessage);

    inputEl.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        sendMessage();
      }
    });

    appendMessage("assistant", config.welcomeMessage);
    history.push({ role: "assistant", content: config.welcomeMessage });

    return {
      open() {
        panel.classList.add("open");
        inputEl.focus();
      },
      close() {
        panel.classList.remove("open");
      },
      destroy() {
        host.remove();
      },
    };
  }

  window.NextStepEnglishChatWidget = {
    init: mountWidget,
  };

  const script = document.currentScript;

  if (script && script.dataset.autoinit !== "false") {
    mountWidget({
      apiUrl: script.dataset.apiUrl,
      title: script.dataset.title,
      welcomeMessage: script.dataset.welcome,
    });
  }
})();
