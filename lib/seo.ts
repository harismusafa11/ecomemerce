import { Product } from '../types';

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

/**
 * Dynamically update document title, meta tags, OpenGraph, and Schema.org JSON-LD for top-tier SEO
 */
export function updateSEO({
  title,
  description,
  image = 'https://files.catbox.moe/z44d2s.png',
  keywords = 'Tapak Pamungkas, keris pusaka, benda bertuah, media bertuah, spiritual nusantara, herbal ruwatan',
  url = window.location.href,
  type = 'website',
  jsonLd
}: SEOProps) {
  // Update Document Title
  const siteName = 'Tapak Pamungkas';
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
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

  // Standard Meta Tags
  setMetaTag('meta[name="description"]', 'name', 'description', description);
  setMetaTag('meta[name="keywords"]', 'name', 'keywords', keywords);

  // Open Graph Meta Tags
  setMetaTag('meta[property="og:title"]', 'property', 'og:title', fullTitle);
  setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
  setMetaTag('meta[property="og:image"]', 'property', 'og:image', image);
  setMetaTag('meta[property="og:url"]', 'property', 'og:url', url);
  setMetaTag('meta[property="og:type"]', 'property', 'og:type', type);

  // Twitter Meta Tags
  setMetaTag('meta[property="twitter:title"]', 'property', 'twitter:title', fullTitle);
  setMetaTag('meta[property="twitter:description"]', 'property', 'twitter:description', description);
  setMetaTag('meta[property="twitter:image"]', 'property', 'twitter:image', image);

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
  const canonicalUrl = `${window.location.origin}/#/produk/${productSlug}`;

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
