import React from 'react';
import { SocialLink } from './types';

// Official WhatsApp number (international format, no + or dashes) for wa.me links
export const WHATSAPP_NUMBER = '6285880231697';
export const WHATSAPP_DISPLAY = '+62 858-8023-1697';

export const CATEGORIES = [
    'Keilmuan',
    'Media Bertuah',
    'Media Herbal',
    'Pusaka & Keris',
    'Herbal & Keilmuan',
];

export interface SocialChannel extends SocialLink {
    handle: string;
    description: string;
    logoUrl: string;
    bgGradient: string;
}

// 100% Reliable SVG Icons for every brand
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="#25D366"/>
    </svg>
);

const InstagramIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 2.163c3.203 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" fill="url(#ig-grad)"/>
        <defs>
            <radialGradient id="ig-grad" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(24 0 0 24 3 21)">
                <stop offset="0" stopColor="#FFDD55"/>
                <stop offset="0.3" stopColor="#FF543E"/>
                <stop offset="0.6" stopColor="#C837AB"/>
                <stop offset="1" stopColor="#3771CE"/>
            </radialGradient>
        </defs>
    </svg>
);

const TikTokIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19.589 6.686a4.793 4.793 0 01-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 11-2.896-2.896c.328 0 .643.056.936.159V9.45a6.34 6.34 0 00-.936-.07 6.341 6.341 0 106.341 6.341V8.675a8.214 8.214 0 004.77 1.493V6.723a4.814 4.814 0 01-1.35-.037z" fill="#00F2FE"/>
        <path d="M19.589 6.686a4.793 4.793 0 01-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 11-2.896-2.896c.328 0 .643.056.936.159V9.45a6.34 6.34 0 00-.936-.07 6.341 6.341 0 106.341 6.341V8.675a8.214 8.214 0 004.77 1.493V6.723a4.814 4.814 0 01-1.35-.037z" fill="#FE2C55"/>
        <path d="M19.589 6.686a4.793 4.793 0 01-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 11-2.896-2.896c.328 0 .643.056.936.159V9.45a6.34 6.34 0 00-.936-.07 6.341 6.341 0 106.341 6.341V8.675a8.214 8.214 0 004.77 1.493V6.723a4.814 4.814 0 01-1.35-.037z" fill="#FFFFFF"/>
    </svg>
);

const FacebookIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
    </svg>
);

const TokopediaIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="6" fill="#42B549"/>
        <path d="M12 5C8.134 5 5 8.134 5 12s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7zm-2 5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm4 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm-2 6.5c-1.933 0-3.5-1.12-3.5-2.5h7c0 1.38-1.567 2.5-3.5 2.5z" fill="#FFFFFF"/>
    </svg>
);

const LazadaIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="6" fill="#0F146D"/>
        <path d="M12 4.5l5.5 5.5-5.5 5.5L6.5 10 12 4.5zm0 9.5l3.5 3.5H8.5L12 14z" fill="#F57224"/>
    </svg>
);

const TocoIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="6" fill="#F97316"/>
        <path d="M7 9h10l-1 9H8L7 9zm3-3a2 2 0 014 0v3h-4V6z" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
    </svg>
);

export const REAL_SOCIAL_CHANNELS: SocialChannel[] = [
    {
        name: 'WhatsApp Official',
        handle: '+62 858-8023-1697',
        description: 'Konsultasi Kebatinan & Pemaharan Direct',
        url: 'https://wa.me/6285880231697',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/1024px-WhatsApp.svg.png',
        bgGradient: 'from-emerald-500/20 via-emerald-500/10 to-transparent',
        icon: ({ className }) => <WhatsAppIcon className={className || "w-8 h-8"} />
    },
    {
        name: 'Instagram Official',
        handle: '@tapak.pamungkas',
        description: 'Galeri Foto Pusaka & Edukasi Kebatinan',
        url: 'https://www.instagram.com/tapak.pamungkas/',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/1024px-Instagram_logo_2016.svg.png',
        bgGradient: 'from-pink-500/20 via-purple-500/10 to-transparent',
        icon: ({ className }) => <InstagramIcon className={className || "w-8 h-8"} />
    },
    {
        name: 'TikTok Official',
        handle: '@pria_normal',
        description: 'Live Penjamasan & Penjelasan Energetik',
        url: 'https://www.tiktok.com/@pria_normal',
        logoUrl: 'https://sf-tb-sg.ibytedtos.com/obj/eden-sg/uomzn_zjp_lzn/tiktok_icon.png',
        bgGradient: 'from-cyan-500/20 via-rose-500/10 to-transparent',
        icon: ({ className }) => <TikTokIcon className={className || "w-8 h-8"} />
    },
    {
        name: 'TikTok Shop',
        handle: 'Tapak Pamungkas Shop',
        description: 'Belanja Langsung via TikTok Shop',
        url: 'https://www.tiktok.com/@pria_normal?_r=1&_t=ZS-91N2wLoqDUy',
        logoUrl: 'https://freepnglogo.com/images/all_img/1714299248tiktok-shop-logo-png-transparent.png',
        bgGradient: 'from-rose-500/20 via-cyan-500/10 to-transparent',
        icon: ({ className }) => <TikTokIcon className={className || "w-8 h-8"} />
    },
    {
        name: 'Facebook Page',
        handle: 'Tapak Pamungkas',
        description: 'Komunitas & Komunikasi Majelis',
        url: 'https://www.facebook.com/profile.php?id=100070686909565',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/1024px-Facebook_Logo_%282019%29.png',
        bgGradient: 'from-blue-600/20 via-blue-500/10 to-transparent',
        icon: ({ className }) => <FacebookIcon className={className || "w-8 h-8"} />
    },
    {
        name: 'Tokopedia Official',
        handle: 'Tapak Pamungkas Official',
        description: 'Store Resmi Tokopedia dengan Rekber',
        url: 'https://www.tokopedia.com/tapak-pamungkas-official',
        logoUrl: 'https://images.tokopedia.net/img/official_store/badge_oss.png',
        bgGradient: 'from-emerald-600/20 via-green-500/10 to-transparent',
        icon: ({ className }) => <TokopediaIcon className={className || "w-8 h-8"} />
    },
    {
        name: 'Lazada Mall',
        handle: 'Tapak Pamungkas Real',
        description: 'Official Seller Lazada Indonesia',
        url: 'https://www.lazada.co.id/shop/tapak-pamungkas-real/?spm=a2o4j.pdp_revamp.seller.1.59e967e7A4UaMW&itemId=8337868160&channelSource=pdp',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Lazada_logo.svg/1024px-Lazada_logo.svg.png',
        bgGradient: 'from-orange-500/20 via-blue-600/10 to-transparent',
        icon: ({ className }) => <LazadaIcon className={className || "w-8 h-8"} />
    },
    {
        name: 'Toco Store',
        handle: 'toco.id/tapak-pamungkas',
        description: 'Etalase Produk Toco Official',
        url: 'https://toco.id/store/tapak-pamungkas',
        logoUrl: 'https://sprout.co.id/_next/image?url=https%3A%2F%2Fsprout-img.azureedge.net%2Fimages-dev%2FDekstop%2Fproject%2FToco%2FLogoToco.png&w=256&q=75',
        bgGradient: 'from-orange-600/20 via-amber-500/10 to-transparent',
        icon: ({ className }) => <TocoIcon className={className || "w-8 h-8"} />
    }
];

export const SOCIAL_LINKS: SocialLink[] = REAL_SOCIAL_CHANNELS;
