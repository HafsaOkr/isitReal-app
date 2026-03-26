# Features 🚀

## ✅ Mevcut Özellikler (v1.0.0 MVP)

### 🔍 Metin Analizi
- Şüpheli metin veya haber içeriğini yapay zeka ile analiz etme
- **0–100 arası güven skoru** üretme
- Skora göre renk kodlu sonuç kartı (🔴 Kırmızı / 🟡 Sarı / 🟢 Yeşil)
- 2 cümlelik özet analiz açıklaması

### 🤖 Yapay Zeka Entegrasyonu
- Google Gemini 1.5 Flash API ile güçlendirilmiş analiz motoru
- Kaynak güvenilirliği, bağlam, dil kalitesi ve kanıt puanlaması
- Yapılandırılmış JSON formatında yanıt işleme

### 🎨 Kullanıcı Arayüzü
- Mobil öncelikli, tek sayfa arayüz (SPA)
- Analiz sırasında yüklenme göstergesi (spinner + disabled buton)
- Boş metin ve karakter limiti uyarıları
- Kullanıcı dostu hata mesajları
- Renk + emoji ile çift kodlu sonuç gösterimi (renk körü, yaşlı ve çocuk kullanıcılar için sezgisel tasarım)
- Önerilen doğrulama kaynakları ve bağlantıları
- Analiz geçmişi (oturum bazlı, son 20 analiz)

### ⚡ Teknik Altyapı
- Vite tabanlı hızlı geliştirme ortamı
- `.env` ile güvenli API anahtarı yönetimi
- JSON şema doğrulama ve hata yönetimi

---

## 🚧 Planlanan Özellikler

### 🔗 İçerik Genişletme
- [ ] URL girişi ile haber sayfası analizi
- [ ] Görsel / ekran görüntüsü yükleme ve OCR desteği
- [ ] Sosyal medya paylaşım bağlantısı analizi

### 📊 Detay & Raporlama
- [ ] Detay puanları için genişletilebilir kart (kaynak, bağlam, dil, kanıt)

### 🌍 Çoklu Dil & Erişilebilirlik
- [ ] Türkçe dışında dil desteği
- [ ] Ekran okuyucu uyumlu arayüz iyileştirmeleri
- [ ] Görme engelli kullanıcılar için sesli girdi ve sesli yanıt desteği

---

## 🛠 Teknik Notlar

| Katman | Teknoloji |
|---|---|
| Frontend | HTML5, CSS3, JavaScript (Vanilla) |
| Build Tool | Vite 7 |
| AI API | Google Gemini 1.5 Flash |
| Deployment | — |

---

## 📌 Sürüm Notları

### v1.0.0 — MVP (Mevcut)
- Temel metin analizi ve güven skoru
- Renk kodlu sonuç kartı
- Hata yönetimi ve yükleme durumları

📢 Önemli Not: Projenin tüm kaynak kodları (HTML, CSS, JavaScript) teknik gereksinimler gereği ana dizinde (root) ve src/ klasörü altında yapılandırılmıştır. features/ klasörü, uygulamanın sunduğu fonksiyonel özellikleri ve teknik detayları dökümante etmek amacıyla oluşturulmuştur.