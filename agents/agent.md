# TrueLens Agent 🤖

## Genel Bakış

TrueLens, kullanıcıdan gelen şüpheli metni alıp **iki aşamalı yapay zeka analizi** ile değerlendiren ve sonucu yapılandırılmış biçimde sunan bir AI agentı içerir. Agent, içeriğin türüne göre canlı web araması yapıp yapmayacağına otomatik karar verir ve ilk analizini kendi kendine düzelterek en güvenilir sonucu üretir.

---

## Agent Mimarisi

```
Kullanıcı Girdisi
      │
      ▼
┌─────────────────────────┐
│    Girdi Doğrulama      │  → Boş metin, 2500 karakter limiti kontrolü
└─────────────────────────┘
      │
      ▼
┌─────────────────────────┐
│  Canlı Arama Kararı     │  → Güncel haber mi? Politik mi? Vefat haberi mi?
│  (shouldUseLiveSearch)  │     Otomatik karar verir
└─────────────────────────┘
      │
      ▼
┌─────────────────────────┐
│   1. Analiz Aşaması     │  → Gemini'ye prompt + JSON şeması gönderilir
│  (analyzeWithGemini)    │     Gerekirse Google Search Grounding aktif olur
└─────────────────────────┘
      │
      ▼
┌─────────────────────────┐
│   2. Öz-Düzeltme        │  → İlk analiz tekrar Gemini'ye gönderilir
│ (selfCorrectWithGemini) │     "Bugünün tarihi 2026" bağlamıyla kontrol edilir
└─────────────────────────┘
      │
      ▼
┌─────────────────────────┐
│  Muhafazakar Birleştirme│  → İki sonuçtan daha düşük (temkinli) skor seçilir
│ (mergeConservatively)   │
└─────────────────────────┘
      │
      ▼
┌─────────────────────────┐
│  Kanıt Güvenceleri      │  → Kaynak yoksa skor max 60, genel kaynak varsa max 75
│ (applyEvidenceGuardrails│
└─────────────────────────┘
      │
      ▼
┌─────────────────────────┐
│    Sonuç Gösterimi      │  → Güven skoru, renk+emoji, özet, kaynaklar,
│    + Geçmiş Kaydı       │     Google'da Canlı Ara butonu
└─────────────────────────┘
```

---

## Agent Adımları

### 1. Girdi Doğrulama
- Boş metin kontrolü → kullanıcı uyarılır, agent durur
- 2500 karakter limiti kontrolü → aşılırsa kullanıcı uyarılır

### 2. Akıllı Canlı Arama Kararı
Agent, metni analiz ederek Google Search Grounding'ı otomatik aktive eder:
- 2024, 2025, 2026 yıllarından bahsediliyorsa
- "Son dakika", "breaking", "güncel" gibi ifadeler varsa
- Siyasi içerik (seçim, bakan, meclis vb.) tespit edilirse
- Vefat/ölüm haberi içeriyorsa

### 3. Birinci Analiz (analyzeWithGemini)
- Kullanılabilir Gemini Flash modeli otomatik seçilir (`v1` → `v1beta` fallback)
- Prompt'a tarih bağlamı, dürüstlük kuralları ve JSON şeması eklenir
- Yanıt JSON olarak parse edilip şema doğrulaması yapılır

Üretilen JSON formatı:
```json
{
  "score": 0-100,
  "explanation": "En fazla 2 cümlelik analiz özeti",
  "sources": ["https://kaynak1.com", "https://kaynak2.com"],
  "source_names": ["Kaynak Adı 1", "Kaynak Adı 2"]
}
```

### 4. Öz-Düzeltme Aşaması (selfCorrectWithGemini)
- İlk analiz sonucu tekrar Gemini'ye gönderilir
- "Bugünün tarihi 25 Mart 2026" bağlamıyla tutarlılık kontrolü yapılır
- Hatalı veya aşırı iddialı sonuçlar düzeltilir

### 5. Muhafazakar Birleştirme
- İki aşamanın sonucundan **daha düşük güven skoru** seçilir
- Yanlış-pozitifleri minimize eder (yanlış haberi güvenli gösterme riskini azaltır)

### 6. Kanıt Güvenceleri
| Kaynak Durumu | Maksimum Skor |
|---|---|
| Kaynak yok | %60 |
| Sadece genel/ana sayfa kaynaklar | %75 |
| Doğrudan kanıt kaynakları | %100 |

### 7. Sonuç Gösterimi
Skora göre renk + emoji ile sonuç kartı:
- 🚨 0–39 → Yanıltıcı / Yanlış (Kırmızı)
- ⚠️ 40–79 → Şüpheli (Sarı)
- ✅ 80–100 → Güvenli (Yeşil)

Ek özellikler:
- Kaynak linkleri ile doğrulama yönlendirmesi
- "Google'da Canlı Ara" butonu
- Son 20 analiz oturum geçmişi (localStorage)

---

## Hata Yönetimi

| Durum | Agent Davranışı |
|---|---|
| Boş metin | Kullanıcıyı uyarır, API çağrısı yapmaz |
| 2500 karakter aşımı | Kullanıcıyı uyarır, API çağrısı yapmaz |
| API kota aşımı (429) | "Sunucularda yoğunluk var, bekleyip tekrar dene" mesajı |
| JSON parse hatası | İlk analiz sonucuna güvenli fallback |
| Öz-düzeltme başarısız | İlk analiz sonucu korunur |
| Model bulunamadı | Kullanıcıya API key/bölge kontrolü önerilir |

---

## Kullanılan Teknolojiler

| Bileşen | Teknoloji |
|---|---|
| AI Modeli | Google Gemini Flash (otomatik seçim) |
| Canlı Arama | Google Search Grounding (opsiyonel) |
| Dil | JavaScript (Vanilla) |
| Build | Vite 7 |
| Geçmiş | localStorage |