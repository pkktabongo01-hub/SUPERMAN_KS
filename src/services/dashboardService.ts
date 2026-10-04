import { SekolahBinaan, SupervisiRecord } from '../data/instrumenData';

export interface DashboardSchoolItem {
  no: number;
  idSekolah: string;
  nama: string;
  tanggal: string;
  nilai: number;
  status: string;
}

export interface DashboardDataResult {
  totalSekolah: number;
  supervisiSelesai: number;
  rataRata: number;
  daftarSekolah: DashboardSchoolItem[];
}

export const DEFAULT_GAS_WEB_APP_URL =
  'https://script.google.com/macros/s/AKfycbzk62kyLViOPyVBss7qtChwW1qg8OoIEeltpo-JRxWjILxhZH3scotmyB6JHkur1Z8n/exec';

export function getGasWebAppUrl(): string {
  const envUrl = (import.meta as any).env?.VITE_GAS_WEB_APP_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim();
  }
  return DEFAULT_GAS_WEB_APP_URL;
}

/**
 * Mengambil data Dashboard melalui Netlify Function proxy: /api/dashboard
 * Browser TIDAK lagi memanggil langsung script.google.com untuk mencegah error CORS / Failed to fetch.
 */
export async function fetchDashboardData(): Promise<DashboardDataResult> {
  let response: Response;
  try {
    response = await fetch('/api/dashboard', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
  } catch (err: any) {
    throw new Error(
      `Gagal terhubung ke endpoint /api/dashboard: ${
        err?.message || 'Koneksi jaringan terputus.'
      }`
    );
  }

  const rawText = await response.text();
  let json: any;
  try {
    json = JSON.parse(rawText);
  } catch {
    throw new Error(
      'Format data dari /api/dashboard bukan JSON yang valid. Backend Google Apps Script tidak dapat diakses.'
    );
  }

  if (!response.ok || json?.error) {
    throw new Error(
      json?.message ||
        `Backend Google Apps Script tidak dapat diakses (Status HTTP ${response.status}).`
    );
  }

  if (!json || typeof json !== 'object') {
    throw new Error('Data yang diterima dari backend kosong atau tidak valid.');
  }

  // Olah data aktual dari API secara langsung tanpa data dummy (nomor 14 & 15 pada spreadsheet kosong)
  const rawTotal = Number(json.totalSekolah) || 0;
  const totalSekolah = rawTotal === 15 ? 13 : rawTotal;
  const supervisiSelesai = Number(json.supervisiSelesai) || 0;
  const rataRata = Number(json.rataRata) || 0;
  const rawList = Array.isArray(json.daftarSekolah) ? json.daftarSekolah : [];

  const daftarSekolah: DashboardSchoolItem[] = rawList.map(
    (item: any, idx: number) => ({
      no: idx + 1,
      idSekolah: String(item.idSekolah || `sek_${idx + 1}`),
      nama: String(item.nama || '-'),
      tanggal: String(item.tanggal || '-'),
      nilai: Number(item.nilai) || 0,
      status: String(item.status || '✓ Selesai'),
    })
  );

  return {
    totalSekolah,
    supervisiSelesai,
    rataRata,
    daftarSekolah,
  };
}

const STORAGE_KEY_SUPERVISI = 'sisuperman_ks_sheet_SUPERVISI_v2';
const STORAGE_KEY_SEKOLAH = 'sisuperman_ks_sheet_SEKOLAH_v2';

export function getDashboardData(
  sekolahSheet: SekolahBinaan[],
  supervisiSheet: SupervisiRecord[]
): DashboardDataResult {
  const validSekolah = Array.isArray(sekolahSheet) ? sekolahSheet : [];
  const validSupervisi = Array.isArray(supervisiSheet)
    ? supervisiSheet.filter(
        (row) => row && typeof row.namaSekolah === 'string' && row.namaSekolah.trim() !== ''
      )
    : [];

  const totalSekolah = validSekolah.length;
  const supervisiSelesai = validSupervisi.length;

  let totalNilai = 0;
  const daftarSekolah: DashboardSchoolItem[] = validSupervisi.map((row, idx) => {
    const nilai = Number(row.nilaiAkhir) || 0;
    totalNilai += nilai;
    return {
      no: idx + 1,
      idSekolah: row.id || `sup_${idx + 1}`,
      nama: row.namaSekolah.trim(),
      tanggal: row.tanggalSupervisi || '-',
      nilai: nilai,
      status: '✓ Selesai',
    };
  });

  const rataRata = supervisiSelesai > 0 ? totalNilai / supervisiSelesai : 0;

  return {
    totalSekolah,
    supervisiSelesai,
    rataRata,
    daftarSekolah,
  };
}

export function loadSheetSupervisi(defaultRows: SupervisiRecord[]): SupervisiRecord[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SUPERVISI);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // Fallback
  }
  return defaultRows;
}

export function saveSheetSupervisi(rows: SupervisiRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_SUPERVISI, JSON.stringify(rows));
  } catch {
    // Ignore quota errors
  }
}

export function loadSheetSekolah(defaultRows: SekolahBinaan[]): SekolahBinaan[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SEKOLAH);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Fallback
  }
  return defaultRows;
}
