# Fikir — TrueLens 📸

## Problem Tanımı

Sosyal medyada her gün milyonlarca paylaşım yapılıyor. Bu paylaşımların büyük bir kısmı asılsız haberler, manipüle edilmiş içerikler veya kasıtlı dezenformasyon barındırıyor. Kullanıcılar bir haberin doğru olup olmadığını anlamak için ya zaman harcıyor ya da hiç sorgulamadan paylaşıyor. Mevcut doğrulama araçları ise yavaş, karmaşık ve teknik bilgi gerektiriyor.

---

## Hedef Kullanıcı

- Sosyal medyada gördüğü haberi paylaşmadan önce teyit etmek isteyen sıradan bireyler
- Dijital okuryazarlığı düşük, yaşlı veya çocuk kullanıcılar
- Haberleri hızlıca doğrulamak isteyen öğrenci ve araştırmacılar
- Dezenformasyonla mücadele eden gazeteciler ve sivil toplum kuruluşları

---

## Çözüm Fikri

TrueLens 📸, kullanıcının şüpheli gördüğü bir metni yapıştırmasıyla çalışan, yapay zeka destekli bir anlık doğrulama aracıdır. Uygulama saniyeler içinde:

- Metnin güvenilirliğini analiz eder
- 0–100 arası bir güven skoru üretir
- Sonucu renk ve emoji ile sezgisel biçimde gösterir
- Kısa bir analiz özeti ve doğrulama kaynakları sunar

Amaç; doğrulama sürecini herkes için hızlı, kolay ve erişilebilir hale getirmek.

---

## Yapay Zekanın Rolü

TrueLens'in kalbi Google Gemini 1.5 Flash API'dir. Yapay zeka bu projede:

- Metnin içeriğini, dilini, bağlamını ve kaynak güvenilirliğini değerlendirir
- Güncel haberler için Google Search Grounding ile canlı web araması yapar
- İlk analizini kendi kendine sorgulayıp düzelterek (öz-düzeltme) daha güvenilir sonuç üretir
- Kullanıcıya 2 cümlelik sade ve anlaşılır bir analiz özeti sunar

Yapay zeka burada sadece bir araç değil; uygulamanın karar veren, sorgulayan ve kendini düzelten aktif bir bileşenidir.

---

## Rakip Durum

Benzer alanda çalışan bazı araçlar mevcut:

| Araç | Ne Yapıyor? | Eksikliği |
|---|---|---|
| Teyit.org | Manuel doğrulama ekibi | Yavaş, anlık değil |
| FactCheck.org | Uzman editör analizi | İngilizce, kullanıcı girişi yok |
| Google Fact Check | Arama tabanlı | Doğrudan metin analizi yapmıyor |
| InVID / WeVerify | Görsel doğrulama | Metin analizi yok |

**TrueLens'in farkı:** Kullanıcı kendi metnini yapıştırır ve saniyeler içinde yapay zeka destekli, sezgisel bir sonuç alır. Teknik bilgi gerektirmez, Türkçe çalışır ve güncel haberler için canlı web araması yapar.

---

## Başarı Kriteri

- Teknik bilgisi olmayan biri uygulamayı açıklamaya gerek kalmadan kullanabilmeli
- Yanlış haberleri "güvenli" gösterme oranı minimize edilmeli
- Uygulama mobil ve masaüstünde sorunsuz çalışmalı
- Kullanıcı sonucu gördükten sonra kaynakları teyit etmeye yönlendirilebilmeli