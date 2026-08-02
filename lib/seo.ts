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

export interface SEOProps {
  title: string;
  description: string;
  image?: string;
  keywords?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  jsonLd?: object;
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
  url = window.location.href,
  type = 'website',
  jsonLd
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

  // Standard Meta Tags
  setMetaTag('meta[name="description"]', 'name', 'description', description);
  setMetaTag('meta[name="keywords"]', 'name', 'keywords', keywords);

  // Canonical URL (always pointing to tapakpamungkas.my.id)
  setCanonical(url.startsWith('http') ? url : `${SITE_URL}${url}`);

  // Open Graph Meta Tags
  setMetaTag('meta[property="og:title"]', 'property', 'og:title', fullTitle);
  setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
  setMetaTag('meta[property="og:image"]', 'property', 'og:image', image);
  setMetaTag('meta[property="og:url"]', 'property', 'og:url', url.startsWith('http') ? url : `${SITE_URL}${url}`);
  setMetaTag('meta[property="og:type"]', 'property', 'og:type', type);
  setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', SITE_NAME);
  setMetaTag('meta[property="og:locale"]', 'property', 'og:locale', 'id_ID');

  // Twitter Meta Tags
  setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
  setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
  setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', image);
  setMetaTag('meta[name="twitter:url"]', 'name', 'twitter:url', url.startsWith('http') ? url : `${SITE_URL}${url}`);

  // Schema.org JSON-LD Structured Data
  let scriptTag = document.getElementById('json-ld-schema') as HTMLScriptElement | null;
  if (jsonLd) {
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'json-ld-schema';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(jsonLd);
  } else if (scriptTag) {
    scriptTag.remove();
  }
}

/**
 * Generate Schema.org Product JSON-LD markup with ImageObject metadata for Google Images SEO
 */
export function generateProductSchema(product: Product) {
  const productSlug = getProductSlug(product);
  const canonicalUrl = `${SITE_URL}/#/produk/${productSlug}`;

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
    'name': product.name,
    'image': imageObjects,
    'description': product.description,
    'category': product.category,
    'offers': {
      '@type': 'Offer',
      'priceCurrency': 'IDR',
      'price': product.price,
      'availability': product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      'url': canonicalUrl,
      'seller': {
        '@type': 'Organization',
        'name': 'Tapak Pamungkas'
      }
    }
  };
}
