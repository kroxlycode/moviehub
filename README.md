# MovieHub - Film & Dizi Keşif Platformu

Modern ve kullanıcı dostu çok dilli film & dizi keşif platformu. TheMovieDB API kullanarak güncel içerikler sunar.

![MovieHub Banner](https://moviehub.kroxly.dev/placeholder-image.png)

## Özellikler

### Ana Sayfa
- **Hero Banner**: Trend olan filmler ve diziler
- **Kategoriler**: Popüler, En Çok Oylanan, Vizyondaki, Yakında Gelenler
- **Horizontal Scroll**: Kolay gezinme ve keşif

### Sayfalar
- **Filmler**: Grid layout, gelişmiş filtreleme, pagination
- **Diziler**: Grid layout, gelişmiş filtreleme, pagination  
- **Aktörler**: Oyuncular ve yönetmenler

### Detay Sayfaları
- **Film Detayları**: Tam bilgi, oyuncular, ekip, benzer filmler, fragman
- **Dizi Detayları**: Sezonlar, bölümler, oyuncular, benzer diziler, fragman
- **Kişi Detayları**: Filmografi ve biyografi *(yakında)*

### Arama & Filtreleme
- **Anlık Arama**: Dropdown sonuçlar ile hızlı erişim
- **Gelişmiş Filtreler**: Tür, yıl, puan bazlı filtreleme
- **Debounced Search**: Performans optimizasyonu

### Çok Dilli Destek
- **Türkçe/İngilizce**: Tam dil desteği
- **API İçeriği**: Seçilen dilde film/dizi bilgileri
- **UI Çevirileri**: Tüm arayüz metinleri

### Fragman Sistemi
- **YouTube Entegrasyonu**: Yerleşik fragman oynatıcı
- **Modal Tasarım**: Kesintisiz izleme deneyimi
- **Keyboard Shortcuts**: ESC ile kapatma

## Teknolojiler
- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **API**: TheMovieDB (TMDb)
- **Build Tool**: Create React App
- **State Management**: React Hooks + Context API

## Kurulum

1. **Projeyi klonlayın**
```bash
git clone https://github.com/kroxlycode/moviehub.git
cd moviehub
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **API Anahtarını ayarlayın**
- `.env.example` dosyasını `.env` olarak kopyalayın
- [TheMovieDB](https://www.themoviedb.org/settings/api) üzerinden API anahtarı alın
- `.env` dosyasına API anahtarınızı ekleyin:
```env
REACT_APP_TMDB_API_KEY=your_api_key_here
```

4. **Uygulamayı başlatın**
```bash
npm start
```

Uygulama http://localhost:3000 adresinde çalışacaktır.

## Proje Yapısı

```
src/
├── components/          # Yeniden kullanılabilir bileşenler
│   ├── Header.tsx       # Ana navigasyon + dil seçici
│   ├── HeroBanner.tsx   # Ana banner slider
│   ├── HorizontalScroll.tsx # Yatay kaydırma listeleri
│   ├── MovieCard.tsx    # Film/dizi kartları
│   ├── GridLayout.tsx   # Grid düzeni
│   ├── FilterBar.tsx    # Filtreleme bileşeni
│   ├── Pagination.tsx   # Sayfalama
│   ├── SearchDropdown.tsx # Arama dropdown
│   ├── TrailerModal.tsx # Fragman modal
│   ├── Footer.tsx       # Alt bilgi
│   └── GitHubButton.tsx # GitHub profil butonu
├── pages/               # Sayfa bileşenleri
│   ├── MoviesPage.tsx   # Filmler sayfası
│   ├── TVShowsPage.tsx  # Diziler sayfası
│   ├── PeoplePage.tsx   # Aktörler sayfası
│   ├── MovieDetailPage.tsx # Film detay
│   └── TVShowDetailPage.tsx # Dizi detay
├── services/            # API servisleri
│   └── tmdbApi.ts       # TheMovieDB API + dil desteği
├── contexts/            # React Context'ler
│   └── LanguageContext.tsx # Dil yönetimi
└── types/               # TypeScript tipleri
```

## Tasarım Özellikleri

- **Dark Theme**: Modern koyu tema
- **Responsive**: Tüm cihazlarda uyumlu
- **Smooth Animations**: Akıcı geçişler ve hover efektleri
- **Modern UI**: Gradient'ler, shadow'lar ve glassmorphism
- **Accessibility**: Keyboard navigation ve ARIA labels

## Responsive Tasarım

- **Desktop (1200px+)**: Full özellikli deneyim
- **Tablet (768px-1199px)**: Optimize edilmiş layout
- **Mobile (320px-767px)**: Touch-friendly arayüz

## Geliştirme

### Mevcut Komutlar

```bash
npm start          # Geliştirme sunucusu (http://localhost:3000)
npm run build      # Production build
npm test           # Testleri çalıştır
npm run eject      # CRA yapılandırmasını çıkar (dikkatli kullanın)
```

### Özellik Roadmap

- [x] Çok dilli sistem (TR/EN)
- [x] Film/Dizi detay sayfaları
- [x] Fragman sistemi
- [x] Arama ve filtreleme
- [x] Footer ve branding
- [x] Kişi detay sayfası
- [ ] Kullanıcı listeleri (Watchlist, Favorites)
- [x] Arama sonuçları sayfası
- [ ] PWA desteği
- [ ] Dark/Light theme toggle

## Performans
- **Lazy Loading**: Resimler için optimize edilmiş yükleme
- **Debounced Search**: API çağrılarını optimize eder
- **Code Splitting**: Sayfa bazlı kod bölünmesi *(yakında)*
- **Caching**: API yanıtları için akıllı önbellekleme *(yakında)*

## Ekran Görüntüleri
### Ana Sayfa
![Ana Sayfa](https://i.hizliresim.com/95n6u6r.png)

### Film Detay
![Film Detay](https://i.hizliresim.com/l0v9qy1.png)

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## Geliştirici

**Kroxly** - Web Designer & Developer 
*React • TypeScript • Node.js*

- GitHub: [@kroxlycode](https://github.com/kroxlycode)
- İletişim: GitHub profili üzerinden / [kroxly.dev](https://kroxly.dev)

## Teşekkürler

- [TheMovieDB](https://www.themoviedb.org/) - Kapsamlı film/dizi API'si
- [Lucide](https://lucide.dev/) - Güzel ve tutarlı icon kütüphanesi
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [React](https://reactjs.org/) - UI kütüphanesi
- [TypeScript](https://www.typescriptlang.org/) - Type safety

## Deployment

Projeyi Netlify veya GitHub Pages üzerinde kolayca deploy edebilirsiniz:

```bash
npm run build
# Build klasörünü hosting servisinize yükleyin
```

---

**Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!**

**Live Demo**: [MovieHub](https://moviehub.kroxly.dev)

---

*Made with ❤️ by Kroxly*

## Katkıda Bulunma
1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## İletişim
Herhangi bir sorunuz varsa, lütfen issue açın veya iletişime geçin.
