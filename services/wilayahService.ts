// ============================================================
// WILAYAH SERVICE — Data fetched from static JSON (tidak di-bundle)
// Menghindari bundling villagesData.ts (415K baris) ke dalam JS
// ============================================================

export interface Province {
    id: string;
    name: string;
}

export interface Regency {
    id: string;
    province_id: string;
    name: string;
}

export interface District {
    id: string;
    regency_id: string;
    name: string;
}

export interface Village {
    id: string;
    district_id: string;
    name: string;
}

const EMSIFA_BASE_URL = 'https://emsifa.github.io/api-wilayah-indonesia/api';

// Cache in-memory agar tidak fetch berulang
const cache: {
    regencies?: Record<string, Regency[]>;
    districts?: Record<string, District[]>;
    villages?: Record<string, Village[]>;
} = {};

// Complete 34 Provinces List of Indonesia
export const ALL_34_PROVINCES: Province[] = [
    { id: '33', name: 'JAWA TENGAH' },
    { id: '31', name: 'DKI JAKARTA' },
    { id: '32', name: 'JAWA BARAT' },
    { id: '35', name: 'JAWA TIMUR' },
    { id: '34', name: 'DI YOGYAKARTA' },
    { id: '36', name: 'BANTEN' },
    { id: '51', name: 'BALI' },
    { id: '11', name: 'ACEH' },
    { id: '12', name: 'SUMATERA UTARA' },
    { id: '13', name: 'SUMATERA BARAT' },
    { id: '14', name: 'RIAU' },
    { id: '15', name: 'JAMBI' },
    { id: '16', name: 'SUMATERA SELATAN' },
    { id: '17', name: 'BENGKULU' },
    { id: '18', name: 'LAMPUNG' },
    { id: '19', name: 'KEPULAUAN BANGKA BELITUNG' },
    { id: '21', name: 'KEPULAUAN RIAU' },
    { id: '52', name: 'NUSA TENGGARA BARAT' },
    { id: '53', name: 'NUSA TENGGARA TIMUR' },
    { id: '61', name: 'KALIMANTAN BARAT' },
    { id: '62', name: 'KALIMANTAN TENGAH' },
    { id: '63', name: 'KALIMANTAN SELATAN' },
    { id: '64', name: 'KALIMANTAN TIMUR' },
    { id: '65', name: 'KALIMANTAN UTARA' },
    { id: '71', name: 'SULAWESI UTARA' },
    { id: '72', name: 'SULAWESI TENGAH' },
    { id: '73', name: 'SULAWESI SELATAN' },
    { id: '74', name: 'SULAWESI TENGGARA' },
    { id: '75', name: 'GORONTALO' },
    { id: '76', name: 'SULAWESI BARAT' },
    { id: '81', name: 'MALUKU' },
    { id: '82', name: 'MALUKU UTARA' },
    { id: '91', name: 'PAPUA' },
    { id: '92', name: 'PAPUA BARAT' }
];

async function loadRegencies(): Promise<Record<string, Regency[]>> {
    if (cache.regencies) return cache.regencies;
    try {
        const res = await fetch('/data/wilayahData.json');
        if (res.ok) {
            cache.regencies = await res.json();
            return cache.regencies!;
        }
    } catch (e) {
        console.error('[Wilayah] Failed to load regencies from static JSON:', e);
    }
    return {};
}

async function loadDistricts(): Promise<Record<string, District[]>> {
    if (cache.districts) return cache.districts;
    try {
        const res = await fetch('/data/districtsData.json');
        if (res.ok) {
            cache.districts = await res.json();
            return cache.districts!;
        }
    } catch (e) {
        console.error('[Wilayah] Failed to load districts from static JSON:', e);
    }
    return {};
}

async function loadVillages(): Promise<Record<string, Village[]>> {
    if (cache.villages) return cache.villages;
    try {
        const res = await fetch('/data/villagesData.json');
        if (res.ok) {
            cache.villages = await res.json();
            return cache.villages!;
        }
    } catch (e) {
        console.error('[Wilayah] Failed to load villages from static JSON:', e);
    }
    return {};
}

export const wilayahService = {
    // 1. Get All Provinces (34 Provinces)
    getProvinces: async (): Promise<Province[]> => {
        return ALL_34_PROVINCES;
    },

    // 2. Get Regencies / Kota & Kabupaten by Province ID (514 Regencies)
    getRegencies: async (provinceId: string): Promise<Regency[]> => {
        if (!provinceId) return [];
        const allRegencies = await loadRegencies();
        return allRegencies[provinceId] ?? [];
    },

    // 3. Get Districts / Kecamatan by Regency ID (7,199 Kecamatan)
    getDistricts: async (regencyId: string): Promise<District[]> => {
        if (!regencyId) return [];
        const allDistricts = await loadDistricts();
        if (allDistricts[regencyId]?.length > 0) {
            return allDistricts[regencyId];
        }
        // Fallback ke Emsifa API
        try {
            const response = await fetch(`${EMSIFA_BASE_URL}/districts/${regencyId}.json`);
            if (response.ok) {
                return await response.json();
            }
        } catch (e) {
            console.error(`[EMSIFA] Error fetching districts for ${regencyId}:`, e);
        }
        return [];
    },

    // 4. Get Villages / Kelurahan & Desa by District ID (80,159 Desa)
    getVillages: async (districtId: string): Promise<Village[]> => {
        if (!districtId) return [];
        const allVillages = await loadVillages();
        if (allVillages[districtId]?.length > 0) {
            return allVillages[districtId];
        }
        // Fallback ke Emsifa API
        try {
            const response = await fetch(`${EMSIFA_BASE_URL}/villages/${districtId}.json`);
            if (response.ok) {
                return await response.json();
            }
        } catch (e) {
            console.error(`[EMSIFA] Error fetching villages for ${districtId}:`, e);
        }
        return [];
    }
};
