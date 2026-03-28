import "./style.css";
import { MAX_LENGTH, BUTTON_COOLDOWN_MS, HISTORY_KEY } from "./features/constants.js";
import { analyzeWithGemini, selfCorrectWithGemini } from "./features/gemini.js";
import { renderResult } from "./features/render.js";
import { addToHistory, renderHistory } from "./features/history.js";

const app = document.querySelector("#app");
app.innerHTML = `
  <main class="page">
    <section class="card">
      <h1 class="title">TrueLens <span class="title-emoji">📸</span></h1>
      <p class="subtitle">Sosyal medyadan gelen metni yapistir, saniyeler icinde guven skorunu al.</p>

      <label for="newsInput" class="label">Supheli metin</label>
      <textarea id="newsInput" placeholder="Mesaji buraya yapistir..."></textarea>

      <div class="row">
        <span class="hint" id="charHint">0 / ${MAX_LENGTH}</span>
        <button id="analyzeBtn">Dogrulugunu Kontrol Et</button>
      </div>

      <p id="feedback" class="feedback"></p>
      <section id="resultContainer"></section>
      <section class="history" aria-label="Gecmis Analizler">
        <div class="history-header">
          <h2 class="history-title">Geçmiş Analizler</h2>
          <button id="clearHistoryBtn" class="history-clear" type="button">Temizle</button>
        </div>
        <ul id="historyList" class="history-list"></ul>
      </section>
    </section>
  </main>
`;

const newsInput = document.querySelector("#newsInput");
const analyzeBtn = document.querySelector("#analyzeBtn");
const feedback = document.querySelector("#feedback");
const resultContainer = document.querySelector("#resultContainer");
const charHint = document.querySelector("#charHint");
const historyList = document.querySelector("#historyList");
const clearHistoryBtn = document.querySelector("#clearHistoryBtn");
let lastUserTextForSearch = "";

newsInput.addEventListener("input", () => {
  charHint.textContent = `${newsInput.value.length} / ${MAX_LENGTH}`;
});

renderHistory({
  newsInput,
  charHint,
  historyList,
  resultContainer,
  clearMessages
});

clearHistoryBtn.addEventListener("click", () => {
  localStorage.removeItem(HISTORY_KEY);
  renderHistory({
    newsInput,
    charHint,
    historyList,
    resultContainer,
    clearMessages
  });
});

analyzeBtn.addEventListener("click", async () => {
  const startedAt = Date.now();
  const text = newsInput.value.trim();

  if (!text) {
    showError("Lutfen once analiz icin bir metin gir.");
    return;
  }

  if (text.length > MAX_LENGTH) {
    showError(`Metin en fazla ${MAX_LENGTH} karakter olabilir.`);
    return;
  }

  setLoading(true);
  clearMessages();
  lastUserTextForSearch = text;

  try {
    const { analysis: first, liveSearchUsed } = await analyzeWithGemini(text);
    const corrected = await selfCorrectWithGemini(text, first);
    resultContainer.innerHTML = renderResult(corrected, lastUserTextForSearch, liveSearchUsed);
    addToHistory({ text, result: corrected });
    renderHistory({
      newsInput,
      charHint,
      historyList,
      resultContainer,
      clearMessages
    });
  } catch (error) {
    showError(getUserFriendlyError(error));
  } finally {
    const elapsed = Date.now() - startedAt;
    const waitMs = Math.max(0, BUTTON_COOLDOWN_MS - elapsed);
    if (waitMs > 0) {
      await sleep(waitMs);
    }
    setLoading(false);
  }
});

function setLoading(isLoading) {
  analyzeBtn.disabled = isLoading;
  analyzeBtn.textContent = isLoading ? "Analiz Ediliyor..." : "Dogrulugunu Kontrol Et";
  if (isLoading) {
    feedback.className = "feedback";
    feedback.textContent = "Kaynaklar taraniyor, lutfen bekle...";
  }
}

function clearMessages() {
  feedback.textContent = "";
  feedback.className = "feedback";
  resultContainer.innerHTML = "";
}

function showError(message) {
  feedback.textContent = message;
  feedback.className = "feedback error";
}

function getUserFriendlyError(error) {
  const fallback = "Su an analiz yapilamiyor, lutfen tekrar dene.";
  const message = String(error?.message || "").toLowerCase();

  const highDemand =
    message.includes("429") ||
    message.includes("too many requests") ||
    message.includes("high demand") ||
    message.includes("resource_exhausted") ||
    message.includes("quota") ||
    message.includes("rate limit");

  if (highDemand) {
    return "Şu an Google sunucularında yoğunluk yaşanıyor, lütfen birkaç saniye bekleyip tekrar deneyin";
  }

  return error?.message || fallback;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
