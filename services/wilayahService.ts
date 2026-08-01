import { ALL_514_REGENCIES } from './wilayahData';
import { ALL_EMSIFA_DISTRICTS } from './districtsData';
import { ALL_EMSIFA_VILLAGES } from './villagesData';

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

export const wilayahService = {
    // 1. Get All Provinces (34 Provinces)
    getProvinces: async (): Promise<Province[]> => {
        return ALL_34_PROVINCES;
    },

    // 2. Get Regencies / Kota & Kabupaten by Province ID (514 Regencies)
    getRegencies: async (provinceId: string): Promise<Regency[]> => {
        if (!provinceId) return [];

        if (ALL_514_REGENCIES[provinceId] && ALL_514_REGENCIES[provinceId].length > 0) {
            return ALL_514_REGENCIES[provinceId];
        }

        return [];
    },

    // 3. Get Districts / Kecamatan by Regency ID (7,199 Kecamatan)
    getDistricts: async (regencyId: string): Promise<District[]> => {
        if (!regencyId) return [];

        if (ALL_EMSIFA_DISTRICTS[regencyId] && ALL_EMSIFA_DISTRICTS[regencyId].length > 0) {
            return ALL_EMSIFA_DISTRICTS[regencyId];
        }

        return [];
    },

    // 4. Get Villages / Kelurahan & Desa by District ID (80,159 Real Official Villages 100% Instant!)
    getVillages: async (districtId: string): Promise<Village[]> => {
        if (!districtId) return [];

        if (ALL_EMSIFA_VILLAGES[districtId] && ALL_EMSIFA_VILLAGES[districtId].length > 0) {
            return ALL_EMSIFA_VILLAGES[districtId];
        }

        // Try Emsifa API Wilayah fallback if not found in embedded dataset
        try {
            const response = await fetch(`${EMSIFA_BASE_URL}/villages/${districtId}.json`);
            if (response.ok) {
                const data: Village[] = await response.json();
                if (data && data.length > 0) {
                    return data;
                }
            }
        } catch (error) {
            console.error(`[EMSIFA API] Error fetching villages for ${districtId}:`, error);
        }

        return [];
    }
};
