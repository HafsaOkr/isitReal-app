export function mergeConservatively(firstResult, correctedResult) {
  const score = Math.min(firstResult.score, correctedResult.score);
  const picked = score === correctedResult.score ? correctedResult : firstResult;
  return { ...picked, score };
}

export function applyEvidenceGuardrails(result) {
  const sources = Array.isArray(result.sources) ? result.sources : [];
  const hasAnySource = sources.length > 0;

  const looksGeneric = sources.every(
    (u) => /\/search|arama|\/$/.test(String(u)) || /^[^?]+$/.test(String(u)) === false
  );
  let scoreCap = 100;
  if (!hasAnySource) scoreCap = 60;
  else if (looksGeneric) scoreCap = 75;

  const score = Math.min(result.score, scoreCap);
  return { ...result, score };
}

export function validateAnalysis(obj) {
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

export function normalizeAnalysis(raw) {
  const score = Number.isFinite(raw?.score) ? Math.round(raw.score) : 0;
  const explanation = typeof raw?.explanation === "string" ? raw.explanation : "";
  const sources = Array.isArray(raw?.sources) ? raw.sources : [];
  const sourceNamesRaw = Array.isArray(raw?.source_names) ? raw.source_names : [];

  const source_names = sources.map((_, i) => {
    const candidate = sourceNamesRaw[i];
    return typeof candidate === "string" && candidate.trim() ? candidate : `Kaynak ${i + 1}`;
  });

  const normMikro = (key) => {
    const m = raw?.mikro?.[key];
    return {
      puan: Number.isFinite(m?.puan) ? Math.round(m.puan) : 0,
      aciklama: typeof m?.aciklama === "string" ? m.aciklama : ""
    };
  };

  const mikro = {
    kaynak: normMikro("kaynak"),
    baglam: normMikro("baglam"),
    dil: normMikro("dil"),
    kanit: normMikro("kanit")
  };

  return { score, explanation, mikro, sources, source_names };
}
