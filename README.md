# Sigortacılık Uygulaması - React, Node.js, Express, MongoDB Projesi

## Proje Özeti

Bu proje, kullanıcıların sigorta işlemlerini yönetmelerine olanak tanıyan bir sigortacılık uygulamasıdır. Uygulama, kullanıcıların sigorta teklifleri oluşturmasını, poliçe satın alma işlemleri yapmasını ve mevcut poliçeleri yönetmesini sağlar. Ayrıca, kullanıcılar müşteri bilgilerini ekleyebilir, düzenleyebilir ve silebilir.

### Kullanılan Teknolojiler
- **React**: Frontend geliştirme için kullanılan JavaScript kütüphanesi.
- **Node.js & Express**: Backend geliştirme ve API oluşturma için kullanılan teknolojiler.
- **MongoDB & Mongoose**: Veritabanı yönetimi ve veri modelleme için kullanılır.
- **Passport.js**: Kimlik doğrulama ve kullanıcı rollendirme işlemleri için kullanıldı.
- **bcrypt**: Şifrelerin güvenli bir şekilde hashlenmesi için kullanılır.
- **Formik & Yup**: Form işlemleri ve form doğrulama için kullanılır.
- **html2canvas & jsPDF**: Poliçeler ve teklifler için PDF çıktısı almak amacıyla kullanılır.
- **jsonwebtoken**: JSON Web Token (JWT) ile kimlik doğrulama ve yetkilendirme işlemleri için kullanılır.
- **React Router DOM**: React uygulamasında yönlendirme işlemleri için kullanılır.

## Özellikler

- **Kullanıcı Yönetimi**: Kullanıcılar, uygulamaya giriş yapabilir ve üye olabilir. Ayrıca, rol bazlı yetkilendirme (Admin ve Kullanıcı rolleri) mevcuttur.
  
- **CRUD Operasyonları**: Kullanıcılar, müşteri bilgilerini oluşturabilir, düzenleyebilir, silebilir ve görüntüleyebilir.
  
- **Poliçe Yönetimi**:
  - Kullanıcılar, oluşturdukları müşteriler için poliçe teklifi alabilir (Kasko, Trafik, Sağlık, DASK).
  - Poliçeler için PDF çıktısı alınabilir.
  
- **Poliçe Satın Alma**: Kullanıcılar, aldıkları teklifler arasından poliçe satın alabilir ve poliçeleştirme işlemi yapabilir.
  
- **Arama ve Filtreleme**: Mevcut müşteriler ve poliçeler arasında arama, sıralama ve filtreleme işlemleri yapılabilir.
  
- **Kullanıcı Profil Yönetimi**: Kullanıcılar, şifrelerini değiştirebilir ve profil bilgilerini güncelleyebilir.
  
- **Admin Yetkileri**: Admin kullanıcıları, sistemdeki diğer kullanıcıları ve teklifleri yönetebilir.

## Kurulum ve Çalıştırma

### Gereksinimler
- Node.js (v14.x veya üzeri)
- MongoDB

### Kurulum Adımları

1. **Depoyu Klonlayın**:
   ```bash
   git clone https://github.com/kullanici/sigortacilik-uygulamasi.git
   cd sigortacilik-uygulamasi


2. **Backend Kurulumu"":
   ```bash
   cd backend
   npm install
   npm start
   ```

4. **Frontend Kurulumu:"
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. Veritabanınızı başlatın.
   ```bash
   mongod
   ```
