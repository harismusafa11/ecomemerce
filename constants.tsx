import { SocialLink } from './types';

export const CATEGORIES = [
    'Keilmuan',
    'Media Bertuah',
    'Media Herbal',
];

export const SOCIAL_LINKS: SocialLink[] = [
    { name: 'TikTok', url: 'https://www.tiktok.com/@pria_normal', icon: ({ className }) => <img src="https://img.freepik.com/premium-vector/tiktok-logo_628407-1683.jpg?semt=ais_hybrid&w=740&q=80" alt="TikTok" className={`${className} object-contain`} loading="lazy" decoding="async" /> },
    { name: 'Instagram', url: 'https://www.instagram.com/tapak.pamungkas/', icon: ({ className }) => <img src="https://img.freepik.com/premium-psd/instagram-logo_971166-164497.jpg?semt=ais_hybrid&w=740&q=80" alt="Instagram" className={`${className} object-contain`} loading="lazy" decoding="async" /> },
    { name: 'Facebook', url: 'https://www.facebook.com/profile.php?id=100070686909565', icon: ({ className }) => <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Facebook_f_logo_%282019%29.svg/1280px-Facebook_f_logo_%282019%29.svg.png" alt="Facebook" className={`${className} object-contain`} loading="lazy" decoding="async" /> },
    { name: 'WhatsApp', url: 'https://wa.me/6285880231697', icon: ({ className }) => <img src="https://img.freepik.com/premium-vector/whatsapp-icon-design-social-media-messaging-app-branding_1303737-6449.jpg?semt=ais_hybrid&w=740&q=80" alt="WhatsApp" className={`${className} object-contain`} loading="lazy" decoding="async" /> },
    { name: 'TikTok Shop', url: 'https://www.tiktok.com/@pria_normal?_r=1&_t=ZS-91N2wLoqDUy', icon: ({ className }) => <img src="https://freepnglogo.com/images/all_img/1714299248tiktok-shop-logo-png-transparent.png" alt="TikTok Shop" className={`${className} object-contain`} loading="lazy" decoding="async" /> },
    { name: 'Tokopedia', url: 'https://www.tokopedia.com/tapak-pamungkas-official', icon: ({ className }) => <img src="https://e7.pngegg.com/pngimages/741/278/png-clipart-tokopedia-android-online-shopping-android-shopping-mall-owl-thumbnail.png" alt="Tokopedia" className={`${className} object-contain`} loading="lazy" decoding="async" /> },
    { name: 'Lazada', url: 'https://www.lazada.co.id/shop/tapak-pamungkas-real/?spm=a2o4j.pdp_revamp.seller.1.59e967e7A4UaMW&itemId=8337868160&channelSource=pdp', icon: ({ className }) => <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyVJeyWvujx6niVxLr2dF017Ju5SjWMA07Ng&s" alt="Lazada" className={`${className} object-contain`} loading="lazy" decoding="async" /> },
    { name: 'Toco', url: 'https://toco.id/store/tapak-pamungkas', icon: ({ className }) => <img src="https://sprout.co.id/_next/image?url=https%3A%2F%2Fsprout-img.azureedge.net%2Fimages-dev%2FDekstop%2Fproject%2FToco%2FLogoToco.png&w=256&q=75" alt="Toco" className={`${className} object-contain`} loading="lazy" decoding="async" /> },
];
