import { Product } from '../types.js';

/**
 * Convert string to URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

/**
 * Get unique product slug (uses product.slug if present, otherwise slugifies product.name)
 */
export function getProductSlug(product: Product): string {
  if (product.slug && product.slug.trim()) {
    return product.slug.trim();
  }
  return slugify(product.name);
}

/**
 * Get targeted SEO keywords for a product (uses product.keywords or dynamic auto-generated keywords)
 */
export function getProductKeywords(product: Product): string {
  if (product.keywords && product.keywords.trim()) {
    return product.keywords.trim();
  }
  const cleanName = product.name.trim();
  const cleanCategory = (product.category || 'Pusaka & Benda Bertuah').trim();
  return `${cleanName}, ${cleanCategory}, pemaharan ${cleanName}, jual ${cleanName}, harga ${cleanName}, keaslian ${cleanName}, pusaka ${cleanName}, ${DEFAULT_KEYWORDS}`;
}

export interface SEOProps {
  title: string;
  description: string;
  image?: string;
  keywords?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  jsonLd?: object | object[];
  noindex?: boolean;
}

export const SITE_URL = 'https://tapakpamungkas.my.id';
export const SITE_NAME = 'Tapak Pamungkas';
export const SITE_LOGO = 'https://files.catbox.moe/z44d2s.png';
export const DEFAULT_KEYWORDS = 'Tapak Pamungkas, keris pusaka, benda bertuah, azimat bertuah, media hikmah, spiritual nusantara, pemaharan keris, keris sepuh, ruwatan, kebatinan, keilmuan hikmah, piranti bertuah, pusaka nusantara, supranatural, khodam';

/**
 * Dynamically update document title, meta tags, OpenGraph, Twitter, Canonical, and Schema.org JSON-LD for top-tier SEO
 */
export function updateSEO({
  title,
  description,
  image = SITE_LOGO,
  keywords = DEFAULT_KEYWORDS,
  url,
  type = 'website',
  jsonLd,
  noindex = false
}: SEOProps) {
  // Update Document Title
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  document.title = fullTitle;

  // Helper to set or create meta tag
  const setMetaTag = (selector: string, attrName: string, attrVal: string, contentVal: string) => {
    let element = document.querySelector(selector);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attrName, attrVal);
      document.head.appendChild(element);
    }
    element.setAttribute('content', contentVal);
  };

  // Helper to set canonical link
  const setCanonical = (canonicalUrl: string) => {
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonicalUrl);
  };

  // Canonical URL: always clean (no hash, no query params) and pointing to tapakpamungkas.my.id
  const requestedUrl = url || (typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : SITE_URL);
  const canonicalUrl = requestedUrl.startsWith('http') ? requestedUrl : `${SITE_URL}${requestedUrl}`;

  // Standard Meta Tags
  setMetaTag('meta[name="description"]', 'name', 'description', description);
  setMetaTag('meta[name="keywords"]', 'name', 'keywords', keywords);

  // Robots: indexable pages get the enhanced directive, private/search pages get noindex
  const robotsContent = noindex
    ? 'noindex, nofollow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
  setMetaTag('meta[name="robots"]', 'name', 'robots', robotsContent);
  setMetaTag('meta[name="googlebot"]', 'name', 'googlebot', noindex ? 'noindex, nofollow' : 'index, follow');

  // Canonical URL
  setCanonical(canonicalUrl);

  // Open Graph Meta Tags
  setMetaTag('meta[property="og:title"]', 'property', 'og:title', fullTitle);
  setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
  setMetaTag('meta[property="og:image"]', 'property', 'og:image', image);
  setMetaTag('meta[property="og:image:secure_url"]', 'property', 'og:image:secure_url', image);
  setMetaTag('meta[property="og:image:alt"]', 'property', 'og:image:alt', `${SITE_NAME} - Pusaka & Benda Bertuah Nusantara`);
  setMetaTag('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
  setMetaTag('meta[property="og:type"]', 'property', 'og:type', type);
  setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', SITE_NAME);
  setMetaTag('meta[property="og:locale"]', 'property', 'og:locale', 'id_ID');
  setMetaTag('meta[property="og:locale:alternate"]', 'property', 'og:locale:alternate', 'id_ID');

  // Twitter Meta Tags
  setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
  setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
  setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
  setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', image);
  setMetaTag('meta[name="twitter:url"]', 'name', 'twitter:url', canonicalUrl);

  // Schema.org JSON-LD Structured Data (supports single object or array)
  const schemaArr = Array.isArray(jsonLd) ? jsonLd : (jsonLd ? [jsonLd] : []);
  document.querySelectorAll('script[data-seo-schema="true"]').forEach(el => el.remove());
  if (schemaArr.length > 0) {
    schemaArr.forEach((schema) => {
      const scriptEl = document.createElement('script');
      scriptEl.type = 'application/ld+json';
      scriptEl.dataset.seoSchema = 'true';
      scriptEl.textContent = JSON.stringify(schema);
      document.head.appendChild(scriptEl);
    });
  }
}

/**
 * Generate Schema.org Product JSON-LD markup with ImageObject metadata for Google Images SEO
 */
export function generateProductSchema(product: Product) {
  const productSlug = getProductSlug(product);
  const canonicalUrl = `${SITE_URL}/produk/${productSlug}`;

  const imageObjects = (product.imageUrls && product.imageUrls.length > 0
    ? product.imageUrls
    : ['https://files.catbox.moe/z44d2s.png']
  ).map((imgUrl, idx) => ({
    '@type': 'ImageObject',
    'url': imgUrl,
    'contentUrl': imgUrl,
    'name': `${product.name} - Foto ${idx + 1} Tapak Pamungkas`,
    'caption': `Foto Asli ${product.name} - Pemaharan ${product.category} Tapak Pamungkas`,
    'description': `${product.name}: ${product.description.slice(0, 120)}`,
    'author': {
      '@type': 'Organization',
      'name': 'Tapak Pamungkas'
    }
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': canonicalUrl,
    'name': product.name,
    'image': imageObjects,
    'description': product.description,
    'category': product.category,
    'keywords': getProductKeywords(product),
    'sku': product.slug || String(product.id),
    'mpn': String(product.id),
    'brand': {
      '@type': 'Brand',
      'name': 'Tapak Pamungkas'
    },
    'dateModified': product.updatedAt || new Date().toISOString(),
    'offers': {
      '@type': 'Offer',
      'priceCurrency': 'IDR',
      'price': product.price,
      'availability': product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      'itemCondition': 'https://schema.org/NewCondition',
      'url': canonicalUrl,
      'priceValidUntil': new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      'seller': {
        '@type': 'Organization',
        'name': 'Tapak Pamungkas'
      }
    }
  };
}

/**
 * Generate Schema.org BreadcrumbList JSON-LD
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, idx) => ({
      '@type': 'ListItem',
      'position': idx + 1,
      'name': item.name,
      'item': item.url
    }))
  };
}

/**
 * Generate Schema.org ItemList JSON-LD for the product catalog
 */
export function generateItemListSchema(products: Product[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': 'Katalog Pusaka & Benda Bertuah Tapak Pamungkas',
    'numberOfItems': products.length,
    'itemListElement': products.slice(0, 100).map((product, idx) => {
      const productSlug = getProductSlug(product);
      return {
        '@type': 'ListItem',
        'position': idx + 1,
        'url': `${SITE_URL}/produk/${productSlug}`,
        'name': product.name,
        'image': product.imageUrls && product.imageUrls[0] ? product.imageUrls[0] : 'https://files.catbox.moe/z44d2s.png'
      };
    })
  };
}

/**
 * Generate Schema.org Store JSON-LD for the homepage
 */
export function generateStoreSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    '@id': `${SITE_URL}/#store`,
    'name': 'Tapak Pamungkas',
    'alternateName': 'Sanggar Tapak Pamungkas',
    'url': SITE_URL,
    'logo': {
      '@type': 'ImageObject',
      'url': SITE_LOGO,
      'width': 512,
      'height': 512
    },
    'image': SITE_LOGO,
    'description': 'Pusat Benda Bertuah, Keris Pusaka, Layanan Spiritual & Herbal Nusantara. Pemaharan keris pusaka sepuh, azimat bertuah, media hikmah, serta ijazah keilmuan spiritual nusantara terpercaya.',
    'priceRange': 'IDR 100.000 - IDR 50.000.000',
    'currenciesAccepted': 'IDR',
    'paymentAccepted': 'Cash, Transfer Bank',
    'address': {
      '@type': 'PostalAddress',
      'addressRegion': 'Jawa Tengah',
      'addressCountry': 'ID'
    },
    'contactPoint': {
      '@type': 'ContactPoint',
      'contactType': 'customer service',
      'availableLanguage': 'Indonesian'
    }
  };
}
