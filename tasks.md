# IsItReal Uygulama Geliştirme Görev Listesi (MVP)

## 0) Ön hazırlık
- [ ] Uygulama için teknoloji seç (ör. Next.js/React + API route veya Node/Express veya Python/FastAPI).
- [ ] Proje yapısını oluştur (frontend + backend bölümleri).
- [ ] Ortam değişkenlerini hazırla (özellikle `GEMINI_API_KEY`) ve örnek `.env.example` ekle.

## 1) Frontend: Hızlı Giriş Alanı
- [ ] Mobil öncelikli tek sayfa arayüzü oluştur.
- [ ] Şüpheli metin için sade bir `textarea`/metin kutusu ekle.
- [ ] Kullanıcı analizi başlatmak için buton ekle.
- [ ] Boş metin kontrolü: kullanıcı uyarısı göster.

## 2) Backend: Analiz Endpoint’i
- [ ] Gemini’ye istek atan bir servis katmanı yaz.
- [ ] `/analyze` (veya benzeri) bir endpoint oluştur.
- [ ] Endpoint, frontend’den gelen metni alır ve Gemini’ye iletir.
- [ ] Gemini yanıtını JSON şemasına göre doğrula/parse et.

## 3) Gemini Prompt ve JSON Formatı
- [ ] PRD’deki JSON formatını sağlayacak bir prompt yaz:
  - `guven_skoru` (0-100)
  - `renk` (`kirmizi` / `sari` / `yesil`)
  - `analiz_ozeti` (en fazla 2 cümle)
  - `detaylar`: `kaynak`, `baglam`, `dil`, `kanit` (puanlar)
- [ ] Modeli PRD’ye uygun olarak ayarla (Gemini 1.5 Flash).
- [ ] Yanıt formatı bozulursa (JSON parse hatası vb.) güvenli hata mesajı üret.

## 4) Frontend: Güven Kartı
- [ ] Güven skorunu (0-100) ekranda göster.
- [ ] `renk` alanına göre kartı renklendir (Yeşil/Sarı/Kırmızı).
- [ ] `analiz_ozeti` alanını kullanıcıya 2 cümlelik özet şeklinde göster.
- [ ] (Opsiyonel MVP) Detay puanları için küçük bir alan/tooltip ekle.

## 5) Kullanıcı Deneyimi ve Hata Durumları
- [ ] Analiz sırasında `loading` durumu göster (buton disabled + spinner).
- [ ] API hatalarında kullanıcı dostu mesaj göster.
- [ ] Çok uzun metin için limit koy (ör. karakter limiti) ve uyar.

## 6) Doğrulama / Testler
- [ ] JSON parse + şema doğrulama için birim test yaz (örn. eksik anahtarlar).
- [ ] Frontend-in backend’e doğru istek attığını test et (basit entegrasyon).
- [ ] Örnek metinlerle “bulunamadı/yanlış format” senaryolarını dene.

## 7) Dokümantasyon
- [ ] `README.md` ekle:
  - Kurulum adımları
  - Ortam değişkenleri
  - Çalıştırma / build komutları
  - Gemini entegrasyonu

## 8) MVP Çıktısı
- [ ] Demo senaryoları:
  - Güvenli/orta risk/yüksek risk örnekleri
  - Boş metin
  - Gemini JSON bozuk dönüşü
- [ ] Uygulamanın temel akışını çalışır hale getir ve kontrol et.

