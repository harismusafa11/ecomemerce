import React from 'react';
import { ScrollText, CheckCircle2, Truck, RefreshCcw, HandHeart } from 'lucide-react';

const SECTIONS = [
    {
        icon: ScrollText,
        title: '1. Umum',
        content: 'Dengan mengakses dan menggunakan situs Tapak Pamungkas, Anda dianggap telah membaca, memahami, dan menyetujui seluruh syarat & ketentuan ini. Layanan yang kami sediakan berupa pemaharan pusaka, media bertuah, keilmuan, serta konsultasi spiritual sesuai tradisi Nusantara.',
    },
    {
        icon: HandHeart,
        title: '2. Keaslian & Karakter Produk',
        content: 'Seluruh pusaka dan media bertuah yang kami maharkan adalah asli dan telah melalui proses pembersihan spiritual. Hasil dan pengalaman spiritual bersifat subjektif; kami tidak menjanjikan hasil tertentu karena hakikat media hanyalah wasilah yang bergantung pada keimanan dan niat pemilik.',
    },
    {
        icon: CheckCircle2,
        title: '3. Pesanan & Pembayaran',
        content: 'Pesanan dibuat melalui akun yang terdaftar dan wajib melakukan login. Pembayaran dilakukan via Transfer Bank atau QRIS dengan nominal persis sesuai total pemaharan. Pesanan baru diproses setelah bukti pembayaran terverifikasi oleh admin.',
    },
    {
        icon: Truck,
        title: '4. Pengiriman & Garansi',
        content: 'Seluruh pengiriman menggunakan packing khusus (peti/kotak pengaman) ke seluruh Indonesia. Kami memberikan garansi 100% uang kembali bila paket rusak atau tidak sampai sesuai kesepakatan. Klaim dilakukan melalui WhatsApp official dengan menyertakan nomor resi.',
    },
    {
        icon: RefreshCcw,
        title: '5. Pengembalian & Pembatalan',
        content: 'Karena sifat produk bertuah yang telah melalui proses penahbisan/pembersihan, permintaan pengembalian (retur) hanya dapat diproses bila kesalahan berasal dari pihak kami (produk salah, rusak saat pengiriman, atau tidak sesuai pesanan). Pembatalan pesanan setelah pembayaran terverifikasi tidak dapat dilakukan.',
    },
    {
        icon: ScrollText,
        title: '6. Kewajiban Pengguna',
        content: 'Pengguna wajib menjaga kerahasiaan akun dan bertanggung jawab atas seluruh aktivitas yang terjadi dalam akunnya. Pengguna dilarang menyalahgunakan layanan, memalsukan bukti pembayaran, atau menggunakan konten situs tanpa izin.',
    },
];

const TermsPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-stone-950 text-stone-100 py-12 sm:py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                        Legal & Ketentuan
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-serif font-bold text-stone-100 mt-4 mb-4">
                        Syarat & Ketentuan
                    </h1>
                    <p className="text-stone-400 text-sm leading-relaxed">
                        Terakhir diperbarui: Agustus 2026. Harap baca dengan saksama sebelum menggunakan layanan Tapak Pamungkas.
                    </p>
                </div>

                <div className="max-w-3xl mx-auto space-y-4">
                    {SECTIONS.map((section, idx) => (
                        <div key={idx} className="glass-panel p-6 rounded-3xl border border-amber-500/20">
                            <h2 className="flex items-center gap-3 font-serif font-bold text-stone-100 mb-3">
                                <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 flex-shrink-0">
                                    <section.icon className="w-5 h-5" />
                                </span>
                                {section.title}
                            </h2>
                            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed pl-12">
                                {section.content}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TermsPage;
