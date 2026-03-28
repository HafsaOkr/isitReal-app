export function renderResult(result, userText, liveSearchUsed = false) {
  const colorClass = getColorClass(result.score);
  const colorText = getColorText(result.score);
  const { emoji, tag } = getScoreEmojiLabel(result.score);
  const sourcesHtml = renderSources(result.sources, result.source_names);
  const googleQuery = buildGoogleQuery(userText);
  const liveNote = liveSearchUsed
    ? `<p class="details live-note">Güncel veriler için canlı arama yapıldı.</p>`
    : "";

  const mikro = result.mikro;
  const mikroHtml = mikro
    ? `
    <div class="mikro-grid">
      ${renderMikroKriter("🔗 Kaynak", mikro.kaynak)}
      ${renderMikroKriter("🧩 Bağlam", mikro.baglam)}
      ${renderMikroKriter("🗣️ Dil", mikro.dil)}
      ${renderMikroKriter("📋 Kanıt", mikro.kanit)}
    </div>
  `
    : "";

  return `
    <article class="result ${colorClass}">
      <div class="score">
        <span>Guven Skoru: %${result.score}</span>
        <span class="score-emoji" aria-hidden="true">${emoji}</span>
        <span class="score-tag">(${escapeHtml(tag)})</span>
      </div>
      <p><strong>Renk:</strong> ${colorText}</p>
      <p class="summary">${escapeHtml(result.explanation)}</p>
      ${mikroHtml}
      ${liveNote}
      ${sourcesHtml}
      <div class="cta-row">
        <a class="google-btn" href="https://www.google.com/search?q=${googleQuery}" target="_blank" rel="noopener noreferrer">
          🔍 Google'da Canlı Ara
        </a>
      </div>
    </article>
  `;
}

export function renderMikroKriter(label, kriter) {
  if (!kriter) return "";
  const puan = kriter.puan ?? 0;
  const aciklama = kriter.aciklama ?? "";
  const color = puan >= 70 ? "#16a34a" : puan >= 40 ? "#d97706" : "#dc2626";
  return `
    <div class="mikro-item">
      <div class="mikro-header">
        <span class="mikro-label">${label}</span>
        <span class="mikro-puan" style="color:${color}">%${puan}</span>
      </div>
      ${aciklama ? `<p class="mikro-aciklama">${escapeHtml(aciklama)}</p>` : ""}
    </div>
  `;
}

function getColorClass(score) {
  if (score >= 80) return "green";
  if (score >= 40) return "yellow";
  return "red";
}

function getColorText(score) {
  if (score >= 80) return "Yesil";
  if (score >= 40) return "Sari";
  return "Kirmizi";
}

/** Skor araliklarina gore emoji + kisa etiket (kart rengiyle ayni esikler: 80+, 40-79, 0-39) */
function getScoreEmojiLabel(score) {
  if (score >= 80) return { emoji: "✅", tag: "Güvenli" };
  if (score >= 40) return { emoji: "⚠️", tag: "Şüpheli" };
  return { emoji: "🚨", tag: "Yanıltıcı / Yanlış" };
}

function renderSources(sources, sourceNames) {
  if (!sources.length) {
    return `<p class="details">Resmi haber kaynaklarindan ve teyit platformlarindan kontrol etmeniz onerilir.</p>`;
  }

  const listItems = sources
    .map((url, index) => {
      const safeUrl = escapeAttribute(url);
      const safeName = escapeHtml(sourceNames[index] || `Kaynak ${index + 1}`);
      return `<li><a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeName}</a></li>`;
    })
    .join("");

  return `
    <div class="details">
      <strong>🔗 Kaynaklari Incele:</strong>
      <ul>${listItems}</ul>
      <p class="source-note">Not: Kaynak linkler zaman aşımına uğramış olabilir, ana sayfa üzerinden teyit ediniz.</p>
    </div>
  `;
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function escapeAttribute(value) {
  return escapeHtml(value);
}

function buildGoogleQuery(text) {
  const words = String(text || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 10);

  return encodeURIComponent(words.join(" "));
}
