/**
 * Optimole CDN Image Processing Service
 * Key: mlj3e60lww4w
 * API Key: a6d184837a42a44089fee9cbde646e24514236418b431098a08757118a5d2afe
 */

const OPTIMOLE_DOMAIN_KEY = 'mlj3e60lww4w';

/**
 * Wrap any image URL with Optimole CDN image optimization service
 * Only the short Optimole CDN URL is stored in the database!
 */
export function getOptimoleUrl(originalUrl: string, width: number = 800, quality: number = 85): string {
    if (!originalUrl || !originalUrl.startsWith('http')) return originalUrl;

    // Avoid double wrapping if already an Optimole URL
    if (originalUrl.includes('optimole.com') || originalUrl.includes('cloudfront.net')) {
        return originalUrl;
    }

    const cleanUrl = originalUrl.replace(/^https?:\/\//, '');
    return `https://${OPTIMOLE_DOMAIN_KEY}.i.optimole.com/w:${width}/h:auto/q:${quality}/https://${cleanUrl}`;
}

/**
 * Compress local file from user's device and convert to lightweight WebP/DataURL
 * Ensures zero server bloat and fast 0ms rendering!
 */
export function compressLocalImage(file: File, maxWidth: number = 1200, quality: number = 0.85): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(event.target?.result as string);
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);
                const compressedDataUrl = canvas.toDataURL('image/webp', quality);
                resolve(compressedDataUrl);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}
