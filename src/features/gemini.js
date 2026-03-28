import {
  normalizeAnalysis,
  validateAnalysis,
  mergeConservatively,
  applyEvidenceGuardrails
} from "./analysisNormalize.js";

export async function analyzeWithGemini(text) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY bulunamadi. .env dosyasini kontrol et.");
  }

  const useLiveSearch = shouldUseLiveSearch(text);

  const prompt = `
Sen TrueLens 📸 asistanısın. Bugünün tarihi ${new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}.

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
  "mikro": {
    "kaynak": { "puan": 0, "aciklama": "" },
    "baglam": { "puan": 0, "aciklama": "" },
    "dil": { "puan": 0, "aciklama": "" },
    "kanit": { "puan": 0, "aciklama": "" }
  },
  "sources": ["https://ornek1.com", "https://ornek2.com"],
  "source_names": ["Kaynak Adi 1", "Kaynak Adi 2"]
}

Kurallar:
- score: 0-100 arasinda number
- explanation: en fazla 2 cumle. Eger %100 emin degilsen veya bilgi kesintisi/yetersizligi yasiyorsan explanation sonuna su notu ekle: "⚠️ Bu haber çok yeni olabilir, lütfen en güncel resmi haber ajanslarından (AA, DHA vb.) teyit etmeyi unutmayın."
- mikro: 4 kriter icin 0-100 arasi puan ve 1 cumlelik aciklama
  - kaynak: Haberin kaynaginin guvenilirligi
  - baglam: Haberin baglamsal tutarliligi
  - dil: Dil tonu, duygusal manipulasyon, tiklama odakli ifadeler
  - kanit: Haberi destekleyen somut kanit ve veriler
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
  const analysis = applyEvidenceGuardrails(normalized);
  return { analysis, liveSearchUsed: useLiveSearch };
}

export async function selfCorrectWithGemini(originalText, firstResult) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return firstResult;
  const useLiveSearch = shouldUseLiveSearch(originalText);

  const correctionPrompt = `
Az once bir analiz yaptin. Lutfen bu analizi "Bugünün tarihi ${new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}" gerçekliğiyle tekrar kontrol et.
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
  "mikro": {
    "kaynak": { "puan": 0, "aciklama": "" },
    "baglam": { "puan": 0, "aciklama": "" },
    "dil": { "puan": 0, "aciklama": "" },
    "kanit": { "puan": 0, "aciklama": "" }
  },
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
    return mergeConservatively(firstResult, applyEvidenceGuardrails(normalized));
  } catch {
    return applyEvidenceGuardrails(firstResult);
  }
}

async function requestGemini(apiKey, prompt) {
  const apiVersions = ["v1", "v1beta"];
  let lastError = "Gemini istegi basarisiz oldu.";
  const useLiveSearch = arguments.length >= 3 ? arguments[2]?.useLiveSearch === true : false;

  for (const version of apiVersions) {
    const model = await pickUsableModel(apiKey, version);
    if (!model) {
      continue;
    }

    const requestBody = {
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    };

    if (useLiveSearch) {
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

    const groundingNotSupported =
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
      continue;
    }

    const regionError =
      lowerDetail.includes("location") ||
      lowerDetail.includes("region") ||
      lowerDetail.includes("not available") ||
      lowerDetail.includes("unsupported location");

    if (useLiveSearch && regionError) {
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

export function shouldUseLiveSearch(text) {
  const t = String(text || "").toLowerCase();
  const hasRecentYear = /\b(2024|2025|2026)\b/.test(t);
  const mentionsBreaking = /(son dakika|breaking|acil|guncel|güncel)/.test(t);
  const mentionsPolitics =
    /(secim|seçim|bakan|bakanlik|bakanlık|istifa|kabine|meclis|cumhurbaskani|cumhurbaşkanı|parti|anayasa|kararname)/.test(
      t
    );
  const mentionsDeath = /(vefat|öldü|oldu|hayatini kaybetti|hayatını kaybetti)/.test(t);

  return hasRecentYear || mentionsBreaking || mentionsPolitics || mentionsDeath;
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

  return usable.name.replace("models/", "");
}
