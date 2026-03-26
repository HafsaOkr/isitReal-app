# TrueLens 📸

TrueLens 📸, kullanıcıların şüpheli gördükleri metinleri saniyeler içinde analiz eden yapay zeka tabanlı bir web uygulamasıdır. Google Gemini API ile metnin doğruluğunu değerlendirir, %0–100 arası bir güven skoru üretir ve kısa açıklama ile önerilen kaynak bağlantılarını sunar.

## Problem
Sosyal medya ve dijital platformlarda yayılan dezenformasyon (bilgi kirliliği), toplumun doğru bilgiye ulaşmasını engelliyor. Kullanıcılar, karşılaştıkları haberlerin doğruluğunu teyit etmekte zorlanıyor.

## Çözüm
TrueLens 📸, yapay zeka desteğiyle şüpheli metinleri analiz eder. Google Gemini API'yi kullanarak metnin doğruluğunu sorgular, bir güven skoru üretir ve analizin nedenlerini kullanıcıya sunar.

## Canlı Demo
Yayın Linki: [Uygulama linkiniz buraya gelecek]
Demo Video: [Video linkiniz buraya gelecek]

## Kullanılan Teknolojiler
- Google Gemini 1.5 Flash API
- JavaScript (Vite)
- HTML5 & CSS3
- Cursor AI & GitHub

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