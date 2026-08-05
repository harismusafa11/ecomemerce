import React from 'react';
import { ShieldCheck, Lock, UserCheck, FileText, Mail } from 'lucide-react';
import { WHATSAPP_NUMBER } from '../constants';

const SECTIONS = [
    {
        icon: Lock,
        title: '1. Informasi yang Kami Kumpulkan',
        content: 'Kami mengumpulkan data yang Anda berikan saat mendaftar akun, yaitu nama, alamat email, dan kata sandi (tersimpan terenkripsi). Saat melakukan pemaharan, kami juga menyimpan alamat pengiriman, nomor telepon, serta riwayat pesanan untuk keperluan verifikasi dan pengiriman.',
    },
    {
        icon: UserCheck,
        title: '2. Penggunaan Informasi',
        content: 'Data Anda digunakan untuk: (a) memproses dan mengirimkan pesanan, (b) memverifikasi identitas dan keamanan akun, (c) mengelola kupon, keranjang, dan wishlist Anda, (d) memberikan informasi status pesanan via WhatsApp, serta (e) meningkatkan kualitas layanan sanggar.',
    },
    {
        icon: ShieldCheck,
        title: '3. Keamanan Data',
        content: 'Kata sandi Anda disimpan dengan hashing berlapis (PBKDF2) sehingga tidak pernah disimpan dalam bentuk teks asli. Seluruh data pribadi dilindungi protokol HTTPS dan hanya dapat diakses oleh admin sanggar yang berwenang.',
    },
    {
        icon: FileText,
        title: '4. Berbagi Data dengan Pihak Ketiga',
        content: 'Kami tidak menjual data pribadi Anda. Data hanya dibagikan sebatas kebutuhan operasional, seperti penyedia jasa pengiriman (ekspedisi) untuk mencetak alamat tujuan, serta lembaga keuangan untuk verifikasi transaksi yang Anda lakukan sendiri.',
    },
    {
        icon: Mail,
        title: '5. Kontak & Pengaduan Privasi',
        content: 'Apabila Anda memiliki pertanyaan mengenai kebijakan privasi atau ingin memperbarui/menghapus data Anda, silakan hubungi kami melalui WhatsApp resmi sanggar.',
    },
];

const PrivacyPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-stone-950 text-stone-100 py-12 sm:py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                        Legal & Keamanan
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-serif font-bold text-stone-100 mt-4 mb-4">
                        Kebijakan Privasi
                    </h1>
                    <p className="text-stone-400 text-sm leading-relaxed">
                        Terakhir diperbarui: Agustus 2026. Kami menghormati dan melindungi privasi Anda sebagai bagian dari amanah pelayanan sanggar.
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

                    <div className="glass-panel p-6 rounded-3xl border border-emerald-500/30 text-center">
                        <p className="text-xs text-stone-300 leading-relaxed">
                            Kontak pengaduan privasi & data pribadi:
                        </p>
                        <a
                            href={`https://wa.me/${WHATSAPP_NUMBER}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 mt-3 px-6 py-3 rounded-xl font-bold text-stone-950 bg-emerald-400 hover:bg-emerald-300 transition-all text-xs uppercase tracking-wider"
                        >
                            Hubungi WhatsApp Resmi
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPage;
