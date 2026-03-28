import { HISTORY_KEY, MAX_LENGTH } from "./constants.js";
import { renderResult, escapeHtml, escapeAttribute } from "./render.js";

export function getHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addToHistory({ text, result }) {
  const history = getHistory();
  const entry = {
    id: cryptoRandomId(),
    text,
    result,
    createdAt: new Date().toISOString()
  };

  history.unshift(entry);
  const trimmed = history.slice(0, 20);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
}

export function renderHistory({
  newsInput,
  charHint,
  historyList,
  resultContainer,
  clearMessages
}) {
  const history = getHistory().slice(0, 5);
  if (!history.length) {
    historyList.innerHTML = `<li class="history-empty">Henüz analiz yok.</li>`;
    return;
  }

  historyList.innerHTML = history
    .map((h) => {
      const preview = escapeHtml(h.text).slice(0, 80);
      const date = new Date(h.createdAt).toLocaleString("tr-TR");
      return `
        <li class="history-item">
          <button class="history-btn" type="button" data-id="${escapeAttribute(h.id)}">
            <div class="history-top">
              <span class="history-score">%${h.result.score}</span>
              <span class="history-date">${escapeHtml(date)}</span>
            </div>
            <div class="history-preview">${preview}${h.text.length > 80 ? "…" : ""}</div>
          </button>
        </li>
      `;
    })
    .join("");

  historyList.querySelectorAll(".history-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const selected = getHistory().find((x) => x.id === id);
      if (!selected) return;

      newsInput.value = selected.text;
      charHint.textContent = `${newsInput.value.length} / ${MAX_LENGTH}`;
      clearMessages();
      resultContainer.innerHTML = renderResult(selected.result, selected.text);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function cryptoRandomId() {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  }
  return String(Date.now()) + Math.random().toString(16).slice(2);
}
