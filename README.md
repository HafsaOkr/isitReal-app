# TrueLens 📸

TrueLens 📸, kullanıcıların şüpheli gördükleri metinleri saniyeler içinde analiz eden yapay zeka tabanlı bir web uygulamasıdır. Google Gemini API ile metnin doğruluğunu değerlendirir, %0–100 arası bir güven skoru üretir ve kısa açıklama ile önerilen kaynak bağlantılarını sunar.

## Problem
Sosyal medya ve dijital platformlarda yayılan dezenformasyon (bilgi kirliliği), toplumun doğru bilgiye ulaşmasını engelliyor. Kullanıcılar, karşılaştıkları haberlerin doğruluğunu teyit etmekte zorlanıyor.

## Çözüm
TrueLens 📸, yapay zeka desteğiyle şüpheli metinleri analiz eder. Google Gemini API'yi kullanarak metnin doğruluğunu sorgular, bir güven skoru üretir ve analizin nedenlerini kullanıcıya sunar.
1. Adım Adım Mantık (Chain of Thought - CoT)
Sistemimiz sadece bir "doğru/yanlış" cevabı üretmez. Arka planda haberi parçalara ayırır, mantıksal tutarlılığı denetler ve "Neden bu sonuca vardım?" sorusuna kanıtlar arayarak adım adım ilerler. Bu, modelin ezbere cevap vermesini engeller.

2. İki Aşamalı Bağlamsal Analiz (Dual-Stage Analysis)
Model bir yanıt ürettikten sonra, bu yanıtı "Bugünün Tarihi" (Örn: 27 Mart 2026) filtresinden geçirir. Eğer ilk yanıt modelin eski hafızasından geliyorsa, sistem bunu fark eder ve güncel bağlama göre kendini revize eder.

3. Canlı Veri Güvencesi (Search Grounding)
Yapay zekanın yanılma payına karşı son savunma hattı olarak Google Search Grounding mekanizmasını entegre ettik. Kullanıcı, sistemin analizine ek olarak tek tuşla canlı internet verilerini, resmi haber ajanslarını ve kaynak linklerini sorgulayabilir.

## Canlı Demo
Yayın Linki:  https://isit-real-app.vercel.app/
Demo Video: https://www.loom.com/share/8df83453fa2b469da651c6cbf79be189

## Kullanılan Teknolojiler
- Google Gemini 1.5 Flash API
- JavaScript (Vite)
- HTML5 & CSS3
- Cursor AI & GitHub
- Antigravity
- Claude AI
- Perplexity AI
- Netlify
- loom
- Vercel

## Nasıl Çalıştırılır?

### 🌐 Kullanıcılar İçin (Canlı Demo)
1. Uygulama linki üzerinden web sitesine gidin.
2. Analiz etmek istediğiniz metni kutucuğa yapıştırın.
3. **"Doğruluğunu Kontrol Et"** butonuna basarak yapay zeka analizini saniyeler içinde görün.

### 💻 Geliştiriciler İçin (Yerel Kurulum)
1. Proje klasörüne gidin: `cd isItReal-app`
2. Bağımlılıkları yükleyin: `npm install`
3. `.env` dosyasına API anahtarınızı ekleyin: `VITE_GEMINI_API_KEY=anahtarınız`
4. Uygulamayı başlatın: `npm run dev`
