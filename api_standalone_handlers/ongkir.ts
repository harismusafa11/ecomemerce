import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setSecurityHeaders, safeErrorResponse } from '../lib/security';

const BINDERBYTE_API_KEY = process.env.BINDERBYTE_API_KEY || '';
const ORIGIN_KECAMATAN = process.env.DEFAULT_ORIGIN_KECAMATAN || 'Ulujami';
const ORIGIN_KOTA = process.env.DEFAULT_ORIGIN_KOTA || 'Pemalang';
const ORIGIN_PROVINSI = process.env.DEFAULT_ORIGIN_PROVINSI || 'Jawa Tengah';

export interface ShippingOption {
    code: string;
    courierName: string;
    service: string;
    description: string;
    cost: number;
    etd: string;
    isFallback?: boolean;
}

/**
 * Smart Fallback Tariff Matrix from Ulujami, Pemalang to any destination in Indonesia
 */
function getSmartFallbackRates(province: string, city: string, weightKg: number): ShippingOption[] {
    const provUpper = (province || '').toUpperCase();

    let jneBase = 14000;
    let jntBase = 15000;
    let sicepatBase = 14500;
    let posBase = 13000;
    let etdJne = '1-2 Hari';
    let etdPos = '2-3 Hari';

    if (provUpper.includes('JAWA TENGAH') || provUpper.includes('YOGYAKARTA')) {
        jneBase = 10000;
        jntBase = 11000;
        sicepatBase = 10500;
        posBase = 9000;
        etdJne = '1-2 Hari';
        etdPos = '2-3 Hari';
    } else if (provUpper.includes('JAKARTA') || provUpper.includes('BANTEN') || provUpper.includes('JAWA BARAT')) {
        jneBase = 13000;
        jntBase = 14000;
        sicepatBase = 13500;
        posBase = 12000;
        etdJne = '1-2 Hari';
        etdPos = '2-3 Hari';
    } else if (provUpper.includes('JAWA TIMUR')) {
        jneBase = 14000;
        jntBase = 15000;
        sicepatBase = 14500;
        posBase = 13000;
        etdJne = '1-2 Hari';
        etdPos = '2-3 Hari';
    } else if (provUpper.includes('SUMATERA') || provUpper.includes('SUMATRA') || provUpper.includes('ACEH') || provUpper.includes('RIAU') || provUpper.includes('LAMPUNG') || provUpper.includes('JAMBI') || provUpper.includes('BENGKULU')) {
        jneBase = 24000;
        jntBase = 26000;
        sicepatBase = 25000;
        posBase = 22000;
        etdJne = '2-4 Hari';
        etdPos = '3-5 Hari';
    } else if (provUpper.includes('BALI') || provUpper.includes('NUSA TENGGARA')) {
        jneBase = 26000;
        jntBase = 28000;
        sicepatBase = 27000;
        posBase = 24000;
        etdJne = '2-4 Hari';
        etdPos = '3-5 Hari';
    } else if (provUpper.includes('KALIMANTAN')) {
        jneBase = 32000;
        jntBase = 35000;
        sicepatBase = 34000;
        posBase = 30000;
        etdJne = '3-5 Hari';
        etdPos = '4-6 Hari';
    } else if (provUpper.includes('SULAWESI') || provUpper.includes('GORONTALO')) {
        jneBase = 35000;
        jntBase = 38000;
        sicepatBase = 36000;
        posBase = 33000;
        etdJne = '3-5 Hari';
        etdPos = '4-6 Hari';
    } else if (provUpper.includes('PAPUA') || provUpper.includes('MALUKU')) {
        jneBase = 75000;
        jntBase = 82000;
        sicepatBase = 78000;
        posBase = 70000;
        etdJne = '4-7 Hari';
        etdPos = '5-8 Hari';
    }

    const multiplier = Math.max(1, weightKg);

    return [
        {
            code: 'jne',
            courierName: 'JNE Express',
            service: 'REG (Reguler)',
            description: `Pengiriman Reguler dari ${ORIGIN_KECAMATAN}, ${ORIGIN_KOTA}`,
            cost: Math.round(jneBase * multiplier),
            etd: etdJne,
            isFallback: true
        },
        {
            code: 'jnt',
            courierName: 'J&T Express',
            service: 'EZ (Standard)',
            description: `Layanan Express J&T dari ${ORIGIN_KECAMATAN}, ${ORIGIN_KOTA}`,
            cost: Math.round(jntBase * multiplier),
            etd: etdJne,
            isFallback: true
        },
        {
            code: 'sicepat',
            courierName: 'SiCepat Express',
            service: 'REG (Reguler)',
            description: `Layanan Reguler SiCepat`,
            cost: Math.round(sicepatBase * multiplier),
            etd: etdJne,
            isFallback: true
        },
        {
            code: 'pos',
            courierName: 'POS Indonesia',
            service: 'Kilat Khusus',
            description: `Paket Kilat Khusus POS Indonesia`,
            cost: Math.round(posBase * multiplier),
            etd: etdPos,
            isFallback: true
        }
    ];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    setSecurityHeaders(res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const searchTerm = String(req.query.search || req.body?.search || '').trim();

        // 1. Binderbyte Official Location Search Autocomplete (POSTMAN API CEK ONGKIR - locations)
        if (searchTerm) {
            try {
                const url = `https://api.binderbyte.com/v1/locations?search=${encodeURIComponent(searchTerm)}&api_key=${BINDERBYTE_API_KEY}`;
                const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.data && Array.isArray(data.data)) {
                        return res.status(200).json({ status: 200, data: data.data });
                    }
                }
            } catch (err) {
                console.error('[BINDERBYTE LOCATIONS SEARCH ERROR]:', err);
            }
            return res.status(200).json({ status: 200, data: [] });
        }

        // 2. Shipping Fee Calculation
        const destinationProvince = String(req.query.province || req.body?.province || '').trim();
        const destinationCity = String(req.query.city || req.body?.city || '').trim();
        const destinationDistrict = String(req.query.district || req.body?.district || '').trim();
        const weightGrams = Math.max(100, Number(req.query.weight || req.body?.weight || 1000));
        const weightKg = Math.ceil(weightGrams / 1000);

        if (!destinationProvince || !destinationCity) {
            return safeErrorResponse(res, 400, 'Provinsi dan Kota/Kabupaten tujuan wajib diisi');
        }

        console.log(`[ONGKIR API] Query from ${ORIGIN_KECAMATAN}, ${ORIGIN_KOTA} to ${destinationDistrict}, ${destinationCity}, ${destinationProvince} (Weight: ${weightKg}kg)`);

        // Try querying live Binderbyte API if API Key is configured
        if (BINDERBYTE_API_KEY) {
            const liveOptions: ShippingOption[] = [];

            try {
                // Query Binderbyte cost API
                const destinationQuery = destinationDistrict || destinationCity;
                const binderbyteUrl = `https://api.binderbyte.com/v1/cost?api_key=${BINDERBYTE_API_KEY}&courier=jne&origin=${encodeURIComponent(ORIGIN_KOTA)}&destination=${encodeURIComponent(destinationQuery)}&weight=${weightKg}`;
                
                const response = await fetch(binderbyteUrl, {
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data && data.data && data.data.costs && Array.isArray(data.data.costs)) {
                        for (const costItem of data.data.costs) {
                            liveOptions.push({
                                code: 'jne',
                                courierName: data.data.courier || 'JNE Express',
                                service: costItem.service,
                                description: costItem.description || costItem.service,
                                cost: costItem.cost,
                                etd: costItem.etd ? `${costItem.etd} Hari` : '1-3 Hari',
                                isFallback: false
                            });
                        }
                    }
                } else {
                    const errorText = await response.text();
                    console.log('[ONGKIR BINDERBYTE NOTICE] Using smart fallback due to response:', errorText);
                }
            } catch (err) {
                console.log('[ONGKIR BINDERBYTE FETCH ERROR] Falling back to smart tariff engine:', err);
            }

            if (liveOptions.length > 0) {
                return res.status(200).json({
                    origin: { kecamatan: ORIGIN_KECAMATAN, kota: ORIGIN_KOTA, provinsi: ORIGIN_PROVINSI },
                    destination: { district: destinationDistrict, city: destinationCity, province: destinationProvince },
                    weightKg,
                    source: 'binderbyte_live',
                    options: liveOptions
                });
            }
        }

        // Fallback to Smart Tariff Engine
        const fallbackOptions = getSmartFallbackRates(destinationProvince, destinationCity, weightKg);
        return res.status(200).json({
            origin: { kecamatan: ORIGIN_KECAMATAN, kota: ORIGIN_KOTA, provinsi: ORIGIN_PROVINSI },
            destination: { district: destinationDistrict, city: destinationCity, province: destinationProvince },
            weightKg,
            source: 'smart_tariff_matrix',
            options: fallbackOptions
        });

    } catch (error) {
        return safeErrorResponse(res, 500, 'Gagal menghitung ongkos kirim', error);
    }
}
