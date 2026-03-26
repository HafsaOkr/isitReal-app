import "./style.css";

const MAX_LENGTH = 2500;
const BUTTON_COOLDOWN_MS = 3000;

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
const HISTORY_KEY = "truelens_history_v1";
let lastLiveSearchUsed = false;

newsInput.addEventListener("input", () => {
  charHint.textContent = `${newsInput.value.length} / ${MAX_LENGTH}`;
});

renderHistory();

clearHistoryBtn.addEventListener("click", () => {
  localStorage.removeItem(HISTORY_KEY);
  renderHistory();
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
  lastLiveSearchUsed = false;

  try {
    const first = await analyzeWithGemini(text);
    const corrected = await selfCorrectWithGemini(text, first);
    renderResult(corrected, lastUserTextForSearch, lastLiveSearchUsed);
    addToHistory({ text, result: corrected });
    renderHistory();
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

function renderResult(result, userText, liveSearchUsed = false) {
  const colorClass = getColorClass(result.score);
  const colorText = getColorText(result.score);
  const { emoji, tag } = getScoreEmojiLabel(result.score);
  const sourcesHtml = renderSources(result.sources, result.source_names);
  const googleQuery = buildGoogleQuery(userText);
  const liveNote = liveSearchUsed
    ? `<p class="details live-note">Güncel veriler için canlı arama yapıldı.</p>`
    : "";

  resultContainer.innerHTML = `
    <article class="result ${colorClass}">
      <div class="score">
        <span>Guven Skoru: %${result.score}</span>
        <span class="score-emoji" aria-hidden="true">${emoji}</span>
        <span class="score-tag">(${escapeHtml(tag)})</span>
      </div>
      <p><strong>Renk:</strong> ${colorText}</p>
      <p class="summary">${escapeHtml(result.explanation)}</p>
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

async function analyzeWithGemini(text) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY bulunamadi. .env dosyasini kontrol et.");
  }

  const useLiveSearch = shouldUseLiveSearch(text);
  lastLiveSearchUsed = useLiveSearch;

  const prompt = `
Sen TrueLens 📸 asistanısın. Bugünün tarihi ${new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}.

GENEL ANALİZ MANTIĞI:
1. Eğer kullanıcı 2025 veya 2026 yılına ait, senin iç kütüphanende (training data) bulunmayan bir olaydan bahsediyorsa; bu haberi doğrudan 'YALAN' olarak etiketleme.
2. Haberin içindeki tutarlılığa bak: Belirli bir tarih, mekan, kurum adı veya resmi bir dil kullanılmış mı?
3. Kendi eski bilgilerinle çelişen bir durum varsa (Örn: Hayatta bildiğin birinin vefat haberi veya bitmiş bildiğin bir projenin devam etmesi); kullanıcıya 'Eski kayıtlarımda durum farklı görünse de, 2026 yılına ait bu yeni gelişme ciddiyetle takip edilmelidir' şeklinde, güncel iddiayı yok saymayan bir analiz sun.
4. Sadece tamamen mantıksız (Örn: "Ay dünyaya çarptı") veya kanıtsız spekülasyonlara düşük güven skoru ver.

Analiz sirasinda guncel olaylari ve varsa Google Search'te bulunabilecek guncel bilgi baglamini dikkate al.
"Henuz gerceklesmedi" gibi zaman baglamini kaciran hatali yorumlardan kacin.

AKILLI KAYNAK YONETIMI:
1) Eger analiz ettigin metin 2023 sonrasina ait guncel bir olay, siyasi bir degisim veya son dakika haberi iceriyorsa MUTLAKA google_search aracini kullan.
2) Eger bilgi genelgecer, tarihi veya 2023 oncesinde kesinlesmis bir bilgi ise internet aramasini kullanmadan kendi hafizandan hizlica yanit uret.

DURUSTLUK KURALI (2025-2026 HABERLERI):
Eger bir haber 2025-2026 yilina aitse ve senin egitim verilerinde (knowledge cutoff) yoksa, ASLA "Bu dogrudur" veya "Yalandir" diye uydurma.
Kullaniciya acikca sunu soyle: "Bu haber cok yeni oldugu icin veritabanimda kesin bir dogrulama bulunmuyor. Lutfen asagidaki butona tiklayarak en guncel kaynaklardan teyit edin."

KANIT / TEMKIN KURALI (COK ONEMLI):
- Eger dogrudan dogrulanabilir guclu kaynaklar (resmi kurum, haber ajansi, kurum duyurusu) bulamiyorsan skoru asla %80-100 gibi kesin araliklara cikarma.
- Kaynaklarin sadece genel ana sayfa/arama sayfasi ise (dogrudan kanit yoksa) skoru "temkinli" tut (genelde %40-%70).
- Kesin degilsen explanation icinde bunu acikca belirt ve kullaniciyi "Google'da Canli Ara" butonuyla teyide yonlendir.

Analiz ettigin haber icin mutlaka dogrulanabilir kaynak URL'leri (haber siteleri, resmi kurumlar) bulmaya calis.
Sadece dogrudan habere giden tam URL'ler degil: eger tam linkten emin degilsen ilgili kurumun ana sayfasini veya haber arama sayfasini kaynak olarak goster (Orn: https://www.tcmb.gov.tr veya https://www.aa.com.tr).
Eger haber cok yeniyse veya birebir link bulamazsan; haberin teyit edilebilecegi guvenilir ana kaynaklari (Orn: teyit.org, Anadolu Ajansi, Resmi Gazete veya ilgili Bakanlik sitesi) genel URL olarak oner.
Gercekten 404 olabilecek veya uydurma gibi duran uzun haber URL'si verme; suphe varsa kisa, bilinen ana sayfa veya liste/arama adresi tercih et.

Sadece gecerli JSON dondur. Baska hicbir aciklama ekleme.
JSON formati zorunlu olarak su sekilde olmalidir:
{
  "score": 0,
  "explanation": "",
  "sources": ["https://ornek1.com", "https://ornek2.com"],
  "source_names": ["Kaynak Adi 1", "Kaynak Adi 2"]
}

Kurallar:
- score: 0-100 arasinda number
- explanation: en fazla 2 cumle. Eger %100 emin degilsen veya bilgi kesintisi/yetersizligi yasiyorsan explanation sonuna su notu ekle: "⚠️ Bu haber çok yeni olabilir, lütfen en güncel resmi haber ajanslarından (AA, DHA vb.) teyit etmeyi unutmayın."
- sources: URL listesi, bos olabilir
- source_names: sources ile ayni uzunlukta isim listesi, bos olabilir

Metin:
"""${text}"""
`;

  const data = await requestGemini(apiKey, prompt, { useLiveSearch });
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!raw) {
    throw new Error("Gemini gecerli bir yanit donmedi.");
  }

  const cleaned = raw.replace(/```json|```/g, "").trim();
  let parsed;

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Model JSON disi bir yapi dondurdu. Lutfen tekrar dene.");
  }

  const normalized = normalizeAnalysis(parsed);
  validateAnalysis(normalized);
  return applyEvidenceGuardrails(normalized);
}

async function selfCorrectWithGemini(originalText, firstResult) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return firstResult;
  const useLiveSearch = shouldUseLiveSearch(originalText);

  const correctionPrompt = `
Az once bir analiz yaptin. Lutfen bu analizi "Bugünün tarihi ${new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}" gerçekliğiyle tekrar kontrol et.
Eger hatali veya tutarsiz bir yer varsa duzelt ve en durust halini ver.
Sadece gecerli JSON dondur (baska aciklama yok).
Ek kurallar:
- Uydurma kesinlik yapma. Kanit yoksa temkinli ol.
- Kaynak veremiyorsan (veya kaynaklar genel sayfa ise) skoru 80+ yapma.
- Kesin degilsen explanation icinde acikca belirt ve canli arama ile teyit oner.

Orijinal metin:
"""${originalText}"""

Onceki analiz (JSON):
${JSON.stringify(firstResult)}

JSON formati zorunlu:
{
  "score": 0,
  "explanation": "",
  "sources": ["https://ornek1.com", "https://ornek2.com"],
  "source_names": ["Kaynak Adi 1", "Kaynak Adi 2"]
}
`;

  try {
    const data = await requestGemini(apiKey, correctionPrompt, { useLiveSearch });
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) return firstResult;

    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    const normalized = normalizeAnalysis(parsed);
    validateAnalysis(normalized);
    // Iki asama arasinda en "guvenli/temkinli" sonucu goster.
    return mergeConservatively(firstResult, applyEvidenceGuardrails(normalized));
  } catch {
    // Self-correction basarisiz olursa ilk sonucu gostermek daha iyi.
    return applyEvidenceGuardrails(firstResult);
  }
}

function mergeConservatively(firstResult, correctedResult) {
  // Asiri "kesin" iyimserligi azaltmak icin daha dusuk skoru tercih et.
  // (Yanlis-pozitifleri azaltir; dogru haberlerde skoru biraz dusurebilir.)
  const score = Math.min(firstResult.score, correctedResult.score);
  const picked = score === correctedResult.score ? correctedResult : firstResult;
  return { ...picked, score };
}

function applyEvidenceGuardrails(result) {
  const sources = Array.isArray(result.sources) ? result.sources : [];
  const hasAnySource = sources.length > 0;

  // Kaynak yoksa veya sadece genel kaynak/arama sayfalari varsa "kesin" skor vermeyi engelle.
  const looksGeneric = sources.every((u) => /\/search|arama|\/$/.test(String(u)) || /^[^?]+$/.test(String(u)) === false);
  let scoreCap = 100;
  if (!hasAnySource) scoreCap = 60;
  else if (looksGeneric) scoreCap = 75;

  const score = Math.min(result.score, scoreCap);
  return { ...result, score };
}

async function requestGemini(apiKey, prompt) {
  // Once hesabin erisebildigi modeli ListModels ile bulup, sonra o modelle istek at.
  const apiVersions = ["v1", "v1beta"];
  let lastError = "Gemini istegi basarisiz oldu.";
  const enableGrounding = String(import.meta.env.VITE_ENABLE_GROUNDING || "").toLowerCase() === "true";
  const useLiveSearch = arguments.length >= 3 ? arguments[2]?.useLiveSearch === true : false;

  for (const version of apiVersions) {
    const model = await pickUsableModel(apiKey, version);
    if (!model) {
      continue;
    }

    const requestBody = {
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    };

    // Google Search Grounding (bazı projelerde/endpointlerde desteklenmeyebilir)
    if (enableGrounding && useLiveSearch) {
      requestBody.tools = [{ googleSearch: {} }];
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      }
    );

    if (response.ok) {
      return await response.json();
    }

    let detail = "";
    try {
      const errorData = await response.json();
      detail = errorData?.error?.message || "";
    } catch {
      detail = "";
    }

    const lowerDetail = detail.toLowerCase();
    const quotaExceeded =
      response.status === 429 ||
      lowerDetail.includes("quota") ||
      lowerDetail.includes("rate limit") ||
      lowerDetail.includes("exceeded");

    if (quotaExceeded) {
      throw new Error(
        "API kotasi asildi. Google AI Studio plan/limit ayarini kontrol et ve bir sure sonra tekrar dene."
      );
    }

    // Grounding desteklenmiyorsa otomatik kapatip tekrar denemek daha iyi UX.
    const groundingNotSupported =
      enableGrounding &&
      useLiveSearch &&
      (lowerDetail.includes("tools") ||
        lowerDetail.includes("googlesearchretrieval") ||
        lowerDetail.includes("googlesearch") ||
        lowerDetail.includes("google search") ||
        lowerDetail.includes("unknown name") ||
        lowerDetail.includes("invalid json payload"));

    if (groundingNotSupported) {
      lastError =
        "Google Search Grounding bu hesap/endpoint icin desteklenmiyor. VITE_ENABLE_GROUNDING=false yaparak devam edebilirsin.";
      // Grounding acik geldiyse bu version/model kombinasyonunda tekrar denemek anlamsiz.
      continue;
    }

    const regionError =
      lowerDetail.includes("location") ||
      lowerDetail.includes("region") ||
      lowerDetail.includes("not available") ||
      lowerDetail.includes("unsupported location");

    // Bölge hatası varsa: modeli bir kez sabitleyip (gemini-1.5-flash) grounding ile tekrar dene.
    if (enableGrounding && useLiveSearch && regionError) {
      const fixedModel = "gemini-1.5-flash";
      const fixedResponse = await fetch(
        `https://generativelanguage.googleapis.com/${version}/models/${fixedModel}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            tools: [{ googleSearch: {} }]
          })
        }
      );

      if (fixedResponse.ok) {
        return await fixedResponse.json();
      }

      try {
        const fixedError = await fixedResponse.json();
        lastError = fixedError?.error?.message || lastError;
      } catch {
        // ignore
      }
      continue;
    }

    lastError = detail || `Gemini istegi basarisiz oldu (HTTP ${response.status}).`;
  }

  throw new Error(
    `${lastError} Kullanilabilir model bulunamadi. API key izinlerini ve Gemini proje bolgesini kontrol et.`
  );
}

function shouldUseLiveSearch(text) {
  const t = String(text || "").toLowerCase();
  const hasRecentYear = /\b(2024|2025|2026)\b/.test(t);
  const mentionsBreaking = /(son dakika|breaking|acil|guncel|güncel)/.test(t);
  const mentionsPolitics = /(secim|seçim|bakan|bakanlik|bakanlık|istifa|kabine|meclis|cumhurbaskani|cumhurbaşkanı|parti|anayasa|kararname)/.test(
    t
  );
  const mentionsDeath = /(vefat|öldü|oldu|hayatini kaybetti|hayatını kaybetti)/.test(t);

  return hasRecentYear || mentionsBreaking || mentionsPolitics || mentionsDeath;
}

function addToHistory({ text, result }) {
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

function getHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function renderHistory() {
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
      lastUserTextForSearch = selected.text;
      clearMessages();
      renderResult(selected.result, selected.text);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function cryptoRandomId() {
  // Basit ve yeterince benzersiz id
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  }
  return String(Date.now()) + Math.random().toString(16).slice(2);
}

async function pickUsableModel(apiKey, version) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/${version}/models?key=${apiKey}`,
    { method: "GET" }
  );

  if (!response.ok) {
    return null;
  }

  let data;
  try {
    data = await response.json();
  } catch {
    return null;
  }

  const models = data?.models || [];
  const usable = models.find((m) => {
    const methods = m.supportedGenerationMethods || [];
    const supportsGenerate = methods.includes("generateContent");
    const name = (m.name || "").toLowerCase();
    const isFlash = name.includes("flash");
    return supportsGenerate && isFlash;
  });

  if (!usable?.name) {
    return null;
  }

  // API modeli "models/..." formatinda verebilir; path icin sadelestir.
  return usable.name.replace("models/", "");
}

function validateAnalysis(obj) {
  if (typeof obj !== "object" || obj === null) {
    throw new Error("Analiz verisi gecersiz.");
  }

  if (typeof obj.score !== "number" || obj.score < 0 || obj.score > 100) {
    throw new Error("Guven skoru beklenen aralikta degil.");
  }
  if (typeof obj.explanation !== "string" || !obj.explanation.trim()) {
    throw new Error("Analiz ozeti gecersiz.");
  }
  if (!Array.isArray(obj.sources)) {
    throw new Error("Kaynak listesi gecersiz.");
  }
  if (!Array.isArray(obj.source_names)) {
    throw new Error("Kaynak isimleri listesi gecersiz.");
  }
  if (obj.sources.length !== obj.source_names.length) {
    throw new Error("Kaynak linkleri ve isimleri ayni sayida olmali.");
  }
  obj.sources.forEach((url, index) => {
    if (typeof url !== "string" || !/^https?:\/\/\S+/i.test(url)) {
      throw new Error(`Kaynak URL gecersiz: ${index + 1}`);
    }
    if (typeof obj.source_names[index] !== "string" || !obj.source_names[index].trim()) {
      throw new Error(`Kaynak adi gecersiz: ${index + 1}`);
    }
  });
}

function normalizeAnalysis(raw) {
  const score = Number.isFinite(raw?.score) ? Math.round(raw.score) : 0;
  const explanation = typeof raw?.explanation === "string" ? raw.explanation : "";
  const sources = Array.isArray(raw?.sources) ? raw.sources : [];
  const sourceNamesRaw = Array.isArray(raw?.source_names) ? raw.source_names : [];

  // İsim listesi eksikse kullanıcıya boş link etiketi gostermemek icin otomatik ad uret.
  const source_names = sources.map((_, i) => {
    const candidate = sourceNamesRaw[i];
    return typeof candidate === "string" && candidate.trim() ? candidate : `Kaynak ${i + 1}`;
  });

  return { score, explanation, sources, source_names };
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

function buildGoogleQuery(text) {
  const words = String(text || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 10);

  // encodeURIComponent yerine URLSearchParams mantigi: query tek parametre.
  return encodeURIComponent(words.join(" "));
}
