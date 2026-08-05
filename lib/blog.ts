export interface BlogArticle {
    slug: string;
    title: string;
    excerpt: string;
    category: string;
    date: string;
    readingTime: string;
    image: string;
    content: string[];
}

const FALLBACK_IMG = 'https://files.catbox.moe/z44d2s.png';

export const BLOG_ARTICLES: BlogArticle[] = [
    {
        slug: 'perawatan-keris-pusaka-sepuh',
        title: 'Panduan Penjamasan & Perawatan Keris Pusaka Sepuh',
        excerpt: 'Merawat keris pusaka tidak bisa sembarangan. Ikuti tata cara penjamasan yang benar agar tuah dan fisik pusaka tetap terjaga turun-temurun.',
        category: 'Pusaka & Keris',
        date: '2026-07-20',
        readingTime: '5 menit',
        image: FALLBACK_IMG,
        content: [
            'Keris pusaka sepuh adalah warisan leluhur yang menyimpan energi dan sejarah panjang. Merawatnya bukan sekadar membersihkan logam, melainkan menjaga adab, tatakrama, dan kehormatan pusaka itu sendiri.',
            'Penjamasan (pembersihan) idealnya dilakukan setahun sekali pada malam 1 Suro atau waktu yang disepakati secara spiritual. Gunakan jeruk nipis dan air kelapa tua, lalu bilas dengan air bersih dan lap kering menggunakan kain halus.',
            'Setelah kering, oleskan minyak wangi non-alkohol seperti minyak cendana atau jasmine secara merata ke seluruh permukaan bilah. Minyak ini berfungsi mencegah karat sekaligus menjaga aura pusaka tetap hidup.',
            'Simpan keris pada warangka (sarung) yang bersih, di tempat kering dengan sirkulasi udara baik. Hindari ruang lembab atau terkena sinar matahari langsung dalam waktu lama.',
            'Terakhir, perlakukan pusaka dengan penuh penghormatan. Bersihkan tangan, niatkan yang baik, dan hindari menyentuh bilah secara kasar. Pusaka yang dirawat dengan benar akan "merawat" pemiliknya pula.',
        ],
    },
    {
        slug: 'mengenal-media-bertuah',
        title: 'Mengenal Media Bertuah & Fungsinya dalam Tradisi Nusantara',
        excerpt: 'Dari azimat hingga media hikmah, kenali berbagai jenis media bertuah, cara kerjanya, dan mana yang paling sesuai dengan hajat Anda.',
        category: 'Media Bertuah',
        date: '2026-07-08',
        readingTime: '4 menit',
        image: FALLBACK_IMG,
        content: [
            'Dalam tradisi Nusantara, media bertuah adalah perantara yang digunakan untuk memfokuskan energi spiritual agar lebih mudah diamalkan. Bentuknya beragam: azimat, batu bertuah, minyak pengasihan, hingga media hikmah yang diisi doa.',
            'Setiap media memiliki fungsi spesifik. Ada yang difungsikan untuk ketenangan batin, pagaran diri, kewibawaan, rezeki, hingga pengobatan. Tidak ada media yang "paling hebat" — yang ada adalah media yang paling sesuai dengan kebutuhan dan keimanan pemiliknya.',
            'Keberkahan media bertuah sangat bergantung pada proses pembuatan dan pembersihan spiritual (pengisian) oleh orang yang berkompeten, serta cara perawatan oleh pemilik. Media yang jarang dirawat akan kehilangan daya fokusnya.',
            'Sebagai pemula, pilihlah media dengan fungsi yang jelas dan bersumber dari tempat terpercaya. Hindari media yang "dipasarkan" dengan klaim berlebihan, karena hakikatnya media hanyalah wasilah, bukan tujuan.',
            'Konsultasikan kebutuhan Anda kepada ahlinya agar media yang dipilih benar-benar tepat dan dirawat sesuai tata caranya.',
        ],
    },
    {
        slug: 'tips-memilih-pusaka-pemula',
        title: 'Tips Memilih Pusaka & Benda Bertuah untuk Pemula',
        excerpt: 'Bingung memilih pusaka pertama? Berikut panduan sederhana memilih benda bertuah yang aman, tepat, dan sesuai hajat Anda.',
        category: 'Keilmuan',
        date: '2026-06-22',
        readingTime: '4 menit',
        image: FALLBACK_IMG,
        content: [
            'Memilih pusaka atau benda bertuah pertama sering terasa membingungkan karena banyaknya pilihan. Kunci utamanya sederhana: kenali hajat Anda terlebih dahulu sebelum melihat koleksi.',
            'Tanyakan pada diri sendiri: untuk apa Anda membutuhkannya? Ketenangan batin, perlindungan, kewibawaan dalam pekerjaan, atau kelancaran rezeki? Jawaban ini akan mempersempit jenis media yang tepat.',
            'Perhatikan juga faktor keaslian. Pusaka asli memiliki riwayat perawatan dan pembuatan yang jelas. Belilah dari sanggar atau penjual yang terbuka mengenai asal-usul, proses, dan tata cara perawatannya.',
            'Jangan terburu-buru. Rasakan energi media tersebut saat berinteraksi. Media yang tepat biasanya terasa "pas" dan nyaman, bukan menimbulkan rasa berat atau tidak nyaman berlebihan.',
            'Terakhir, anggaran tidak harus mahal. Ada banyak pusaka berkualitas dengan mahar terjangkau. Yang terpenting adalah kesesuaian dan kepercayaan Anda terhadap wasilah tersebut.',
        ],
    },
    {
        slug: 'peran-ruwatan-keilmuan',
        title: 'Peran Ruwatan & Keilmuan dalam Tradisi Jawa',
        excerpt: 'Ruwatan bukan sekadar ritual. Simak makna, fungsi, dan bagaimana keilmuan Jawa membantu menjaga keseimbangan hidup manusia.',
        category: 'Keilmuan',
        date: '2026-06-05',
        readingTime: '5 menit',
        image: FALLBACK_IMG,
        content: [
            'Ruwatan adalah tradisi penyucian diri yang bertujuan membersihkan seseorang dari hal-hal yang dianggap membawa ketidakberuntungan (sengkala). Tradisi ini berakar kuat pada kosmologi Jawa yang memandang manusia sebagai mikrokosmos.',
            'Secara spiritual, ruwatan membantu memulihkan keseimbangan energi, meredam pengaruh negatif, dan membuka jalan agar hajat baik lebih mudah terkabul. Pelaksanaannya dipimpin oleh tokoh spiritual yang memahami tata caranya.',
            'Selain ruwatan, ada pula pengijazahan keilmuan — proses "penyerahan" amalan dan khodam pendamping secara sah dari guru kepada murid. Ini bukan sekadar warisan teks, melainkan mata rantai sanad yang menjaga keabsahan amalan.',
            'Keilmuan Jawa tidak bertentangan dengan iman bila dilandasi niat yang benar. Justru ia menjadi sarana mendekatkan diri dan menata kehidupan yang lebih baik, selama tidak menyimpang ke arah syirik dan kesesatan.',
            'Bagi Anda yang ingin mendalami, pelajarilah dari guru yang jelas sanad dan akhlaknya. Ilmu tanpa adab adalah api tanpa kendali.',
        ],
    },
];

export const getArticleBySlug = (slug: string): BlogArticle | undefined =>
    BLOG_ARTICLES.find(a => a.slug === slug);
