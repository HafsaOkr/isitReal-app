## 🛠️ Teknoloji Yığını (Tech Stack) - TrueLens

Aşağıdaki tablo, projenin geliştirilmesinde kullanılan temel teknolojileri ve seçilme nedenlerini özetlemektedir:

| Teknoloji | Görevi | Neden Bunu Seçtik? |
| :--- | :--- | :--- |
| **Vite** | Proje Yöneticisi | Modern, çok hızlı ve `.env` dosyası desteği sayesinde API anahtarını güvenle yönetmeni sağlar. |
| **HTML5** | İskelet | Uygulamanın temel yapısını (metin kutusu, buton) kurar. |
| **Tailwind CSS** | Tasarım | Dosya kalabalığı yapmadan, sadece sınıf isimleri yazarak profesyonel ve mobil uyumlu bir tasarım sunar. |
| **JavaScript (ES6)** | Beyin | Kullanıcı metnini alır, Gemini API'ye gönderir ve gelen JSON verisini ekrana basar. |
| **Cursor & GitHub** | Geliştirme Ortamı | Cursor'ın AI desteğiyle hızlı kod yazıp, `.gitignore` ile anahtarını dünyadan saklarız. |
## Kurulum Adımları (Adım Adım)

Cursor terminalini ( `Ctrl + J` ) aç ve şu adımları sırayla takip et:

### 1. Projeyi Başlat (Vite Kurulumu)

Terminaline şu komutu yapıştır ve Enter'a bas:

Bash

`npm create vite@latest . -- --template vanilla`

*(Eğer "Package name?" diye sorarsa sadece nokta `.` koy veya Enter'a bas. Mevcut klasöre kuracaktır.)*

### 2. Gerekli Paketleri Yükle

Ardından bağımlılıkları yüklemek için şunu yaz:

Bash

`npm install`

### 3. API Anahtarını Tanımla (Güvenlik)

Proje klasöründe yeni bir dosya oluştur ve adını `.env` yap. İçine Google AI Studio'dan aldığın anahtarı şu formatta yapıştır:

Plaintext

`VITE_GEMINI_API_KEY=senin_gerçek_anahtarın_buraya`

> **Önemli:** Vite ile çalışırken değişken isminin başına mutlaka `VITE_` eklemelisin, yoksa JavaScript bu anahtara erişemez.
> 

### 4. GitHub Koruması (.gitignore)

Proje klasöründe otomatik oluşan `.gitignore` dosyasını aç. İçinde `.env` satırının olduğundan emin ol. Eğer yoksa en alta şu satırı ekle:

Plaintext

`.env`

*Bu sayede GitHub'a yüklediğinde anahtarın senin bilgisayarında gizli kalır.*

### 5. Uygulamayı Çalıştır

Terminaline şunu yazarak canlı önizlemeyi başlat:

Bash

`npm run dev`

*Terminalde çıkan linke (genelde `http://localhost:5173`) tıklayarak tarayıcıda boş sayfanı görebilirsin.*
 
