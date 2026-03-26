# PRD — TrueLens 📸
## Ürün Gereksinim Belgesi

---

## Problem

Sosyal medya ve dijital platformlarda yayılan dezenformasyon, toplumun doğru bilgiye ulaşmasını engelliyor. Kullanıcılar karşılaştıkları haberlerin, mesajların veya paylaşımların gerçek olup olmadığını teyit etmekte zorlanıyor. Mevcut doğrulama araçları yavaş, karmaşık veya uzmanlık gerektiriyor.

---

## Çözüm

TrueLens 📸, yapay zeka destekli bir metin doğrulama uygulamasıdır. Kullanıcı şüpheli bir metni yapıştırır, uygulama saniyeler içinde bir güven skoru ve analiz özeti üretir. Böylece herkes — teknik bilgisi olmayan kullanıcılar dahil — haberlerin doğruluğunu hızlıca sorgulayabilir.

---

## Hedef Kullanıcılar

- Sosyal medyada karşılaştığı haberleri teyit etmek isteyen bireyler
- Yaşlı ve dijital okuryazarlığı düşük kullanıcılar (sezgisel arayüz sayesinde)
- Gazetecilik öğrencileri ve araştırmacılar
- Dezenformasyonla mücadele eden sivil toplum kuruluşları

---

## Yapay Zekanın Rolü

TrueLens, Google Gemini 1.5 Flash API'yi iki aşamalı bir agent mimarisiyle kullanır:

1. **Birinci Analiz** — Kullanıcı metni Gemini'ye gönderilir. Model, metnin güvenilirliğini değerlendirir, 0–100 arası bir güven skoru üretir ve 2 cümlelik bir özet analiz sunar.
2. **Öz-Düzeltme** — İlk analiz sonucu tekrar Gemini'ye gönderilir, güncel tarih bağlamıyla tutarlılık kontrolü yapılır ve gerekirse düzeltilir.

Güncel veya siyasi içerikler için Google Search Grounding otomatik olarak aktive edilir.

---

## Temel Özellikler (MVP)

- Şüpheli metin girişi (maks. 2500 karakter)
- 0–100 arası güven skoru
- Renk + emoji ile kodlanmış sonuç kartı (🔴 Yanıltıcı / ⚠️ Şüpheli / ✅ Güvenli)
- 2 cümlelik analiz özeti
- Doğrulama kaynak linkleri
- "Google'da Canlı Ara" butonu
- Son 20 analiz geçmişi (oturum bazlı)
- Yükleme göstergesi ve hata yönetimi

---

## Başarı Kriterleri

- Arayüz teknik bilgisi olmayan kullanıcılar tarafından da kolayca kullanılabilmeli
- Yanlış-pozitif oranı minimize edilmeli (muhafazakar skor sistemi)
- Uygulama mobil ve masaüstü cihazlarda sorunsuz çalışmalı

---

## Kapsam Dışı (MVP)

- Kullanıcı hesabı / giriş sistemi
- Görsel veya URL analizi
- Çoklu dil desteği
- Sesli girdi / sesli yanıt