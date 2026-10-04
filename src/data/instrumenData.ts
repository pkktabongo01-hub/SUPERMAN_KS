export interface SekolahBinaan {
  id: string;
  namaSekolah: string;
  kepalaSekolah: string;
  nipKepalaSekolah?: string;
  npsn?: string;
}

export interface Pengawas {
  id: string;
  namaPengawas: string;
  nip?: string;
}

export interface SupervisiRecord {
  id: string;
  timestamp: string;
  namaSekolah: string;
  idSekolah?: string;
  kepalaSekolah: string;
  pengawas: string;
  idPengawas?: string;
  tahunAjaran: string;
  semester: string;
  tanggalSupervisi: string;
  nilaiAkhir: number;
  skorMaksimal: number;
  catatanUmum: string;
  tindakLanjut: string;
  rekomendasi?: string;
  skorIndikator?: Record<string, number>;
  catatanIndikator?: Record<string, string>;
}

export function generateAutoCatatanIndikator(deskripsi: string, skor: number): string {
  const itemDesc = deskripsi.trim();
  switch (skor) {
    case 4:
      return `${itemDesc} sangat lengkap, terverifikasi sah, dan dimutakhirkan secara berkala sesuai standar.`;
    case 3:
      return `${itemDesc} telah tersedia lengkap dan tertata baik, perlu pemutakhiran data secara berkala.`;
    case 2:
      return `${itemDesc} tersedia sebagian, perlu penyempurnaan kelengkapan bukti fisik dokumen.`;
    case 1:
      return `${itemDesc} belum lengkap atau masih berupa draf, memerlukan pendampingan penyusunan kembali.`;
    case 0:
    default:
      return `${itemDesc} belum tersedia bukti fisik di sekolah, perlu segera ditindaklanjuti penyusunannya.`;
  }
}

export interface IndikatorItem {
  id: string;
  nomor: number;
  kode: string;
  deskripsi: string;
}

export interface KategoriInstrumen {
  kode: string;
  judul: string;
  indikator: IndikatorItem[];
}

export const SKOR_MAKSIMAL_INSTRUMEN = 228; // 57 Indikator x Skor Maks 4

export const KATEGORI_INSTRUMEN: KategoriInstrumen[] = [
  {
    kode: 'A',
    judul: 'Kategori A — Dokumen Supervisi',
    indikator: [
      { id: 'ind_1', nomor: 1, kode: 'A.1', deskripsi: 'Program Supervisi Akademik dan Manajerial Kepala Sekolah Tahun Berjalan' },
      { id: 'ind_2', nomor: 2, kode: 'A.2', deskripsi: 'Jadwal Pelaksanaan Supervisi Guru dan Tenaga Kependidikan' },
      { id: 'ind_3', nomor: 3, kode: 'A.3', deskripsi: 'Instrumen Supervisi Perencanaan Pembelajaran (RPP / Modul Ajar)' },
      { id: 'ind_4', nomor: 4, kode: 'A.4', deskripsi: 'Instrumen Supervisi Pelaksanaan Pembelajaran (Observasi Kelas)' },
      { id: 'ind_5', nomor: 5, kode: 'A.5', deskripsi: 'Instrumen Supervisi Penilaian / Asesmen Hasil Belajar' },
      { id: 'ind_6', nomor: 6, kode: 'A.6', deskripsi: 'Rekapitulasi Hasil Analisis Supervisi Akademik dan Manajerial' },
      { id: 'ind_7', nomor: 7, kode: 'A.7', deskripsi: 'Laporan Evaluasi dan Program Tindak Lanjut Hasil Supervisi Kepala Sekolah' },
    ],
  },
  {
    kode: 'B',
    judul: 'Kategori B — Dokumen Kurikulum & Pembelajaran',
    indikator: [
      { id: 'ind_8', nomor: 8, kode: 'B.1', deskripsi: 'Dokumen Kurikulum Satuan Pendidikan (KOSP / KTSP) yang Telah Disahkan' },
      { id: 'ind_9', nomor: 9, kode: 'B.2', deskripsi: 'SK Tim Pengembang Kurikulum Sekolah dan Bukti Rapat Penyusunan' },
      { id: 'ind_10', nomor: 10, kode: 'B.3', deskripsi: 'Kalender Pendidikan Sekolah Tahun Ajaran Berjalan' },
      { id: 'ind_11', nomor: 11, kode: 'B.4', deskripsi: 'SK Pembagian Tugas Mengajar Guru dan Tugas Tambahan' },
      { id: 'ind_12', nomor: 12, kode: 'B.5', deskripsi: 'Jadwal Pelajaran Seluruh Kelas / Rombongan Belajar' },
      { id: 'ind_13', nomor: 13, kode: 'B.6', deskripsi: 'Dokumen Silabus / Alur Tujuan Pembelajaran (ATP) Semua Mata Pelajaran' },
      { id: 'ind_14', nomor: 14, kode: 'B.7', deskripsi: 'Dokumen RPP / Modul Ajar dan Modul Projek Penguatan Profil Pelajar Pancasila' },
      { id: 'ind_15', nomor: 15, kode: 'B.8', deskripsi: 'Buku Nilai / Rekapitulasi Hasil Asesmen Formatif dan Sumatif serta Leger Nilai' },
    ],
  },
  {
    kode: 'C',
    judul: 'Kategori C — Administrasi Kesiswaan',
    indikator: [
      { id: 'ind_16', nomor: 16, kode: 'C.1', deskripsi: 'Dokumen PPDB (SK Panitia, Juknis, Daftar Calon & Peserta Didik Baru)' },
      { id: 'ind_17', nomor: 17, kode: 'C.2', deskripsi: 'Buku Induk Peserta Didik yang Terisi Lengkap dan Mutakhir' },
      { id: 'ind_18', nomor: 18, kode: 'C.3', deskripsi: 'Buku Klaper dan Daftar Nominatif Peserta Didik per Kelas' },
      { id: 'ind_19', nomor: 19, kode: 'C.4', deskripsi: 'Buku Mutasi Masuk dan Mutasi Keluar Peserta Didik' },
      { id: 'ind_20', nomor: 20, kode: 'C.5', deskripsi: 'Rekapitulasi Kehadiran / Absensi Bulanan dan Semester Peserta Didik' },
      { id: 'ind_21', nomor: 21, kode: 'C.6', deskripsi: 'Program dan Laporan Kegiatan Ekstrakurikuler / Pengembangan Diri' },
      { id: 'ind_22', nomor: 22, kode: 'C.7', deskripsi: 'Buku Catatan Prestasi Akademik dan Non-Akademik Peserta Didik' },
      { id: 'ind_23', nomor: 23, kode: 'C.8', deskripsi: 'Dokumen Layanan Bimbingan/Konseling, Tata Tertib, dan Penanganan Siswa' },
    ],
  },
  {
    kode: 'D',
    judul: 'Kategori D — Administrasi Pendidik & Tenaga Kependidikan (PTK)',
    indikator: [
      { id: 'ind_24', nomor: 24, kode: 'D.1', deskripsi: 'Buku Induk / Daftar Urut Kepangkatan (DUK) / Data Kepegawaian PTK' },
      { id: 'ind_25', nomor: 25, kode: 'D.2', deskripsi: 'File Berkas Kepegawaian Individu (SK Pengangkatan, SK Berkala, Sertifikat Pendidik)' },
      { id: 'ind_26', nomor: 26, kode: 'D.3', deskripsi: 'Daftar Hadir Harian dan Rekapitulasi Kehadiran Bulanan Guru & Tendik' },
      { id: 'ind_27', nomor: 27, kode: 'D.4', deskripsi: 'Dokumen Penilaian Kinerja Guru (PKG) / Pengelolaan Kinerja PMM' },
      { id: 'ind_28', nomor: 28, kode: 'D.5', deskripsi: 'Dokumen Sasaran Kinerja Pegawai (SKP) Guru dan Tenaga Kependidikan' },
      { id: 'ind_29', nomor: 29, kode: 'D.6', deskripsi: 'Program Pengembangan Keprofesian Berkelanjutan (PKB) / Komunitas Belajar' },
      { id: 'ind_30', nomor: 30, kode: 'D.7', deskripsi: 'Buku Cuti, Izin, dan Catatan Pembinaan Disiplin Pegawai' },
    ],
  },
  {
    kode: 'E',
    judul: 'Kategori E — Administrasi Sarana dan Prasarana',
    indikator: [
      { id: 'ind_31', nomor: 31, kode: 'E.1', deskripsi: 'Buku Induk Inventaris Barang Milik Negara / Daerah (KIB A, B, C, D, E)' },
      { id: 'ind_32', nomor: 32, kode: 'E.2', deskripsi: 'Daftar Inventaris Ruangan (DIR) pada Setiap Ruang Kelas dan Kantor' },
      { id: 'ind_33', nomor: 33, kode: 'E.3', deskripsi: 'Buku Penerimaan dan Pengeluaran Barang Habis Pakai' },
      { id: 'ind_34', nomor: 34, kode: 'E.4', deskripsi: 'Buku Peminjaman dan Pengembalian Alat / Barang Inventaris Sekolah' },
      { id: 'ind_35', nomor: 35, kode: 'E.5', deskripsi: 'Program Pemeliharaan, Perawatan, dan Perbaikan Sarana Prasarana Sekolah' },
      { id: 'ind_36', nomor: 36, kode: 'E.6', deskripsi: 'Administrasi Pengelolaan Perpustakaan / Pojok Baca dan UKS' },
      { id: 'ind_37', nomor: 37, kode: 'E.7', deskripsi: 'Dokumen Penghapusan Barang / Berita Acara Pemeriksaan Aset Sekolah' },
    ],
  },
  {
    kode: 'F',
    judul: 'Kategori F — Administrasi Keuangan & RKAS',
    indikator: [
      { id: 'ind_38', nomor: 38, kode: 'F.1', deskripsi: 'Dokumen Rencana Kegiatan dan Anggaran Sekolah (RKAS / ARKAS) Tahun Berjalan' },
      { id: 'ind_39', nomor: 39, kode: 'F.2', deskripsi: 'SK Tim Manajemen BOS Sekolah dan Uraian Tugasnya' },
      { id: 'ind_40', nomor: 40, kode: 'F.3', deskripsi: 'Buku Kas Umum (BKU) yang Ditutup Setiap Akhir Bulan' },
      { id: 'ind_41', nomor: 41, kode: 'F.4', deskripsi: 'Buku Pembantu Kas Tunai dan Buku Pembantu Bank' },
      { id: 'ind_42', nomor: 42, kode: 'F.5', deskripsi: 'Buku Pembantu Pajak serta Bukti Setoran Pajak (PPN / PPh)' },
      { id: 'ind_43', nomor: 43, kode: 'F.6', deskripsi: 'Dokumen SPJ (Bukti Kwitansi, Nota, Faktur, Dokumentasi Kegiatan)' },
      { id: 'ind_44', nomor: 44, kode: 'F.7', deskripsi: 'Laporan Realisasi Penggunaan Dana BOS pada Papan Informasi Publik Sekolah' },
    ],
  },
  {
    kode: 'G',
    judul: 'Kategori G — Administrasi Persuratan, Kearsipan & Humas',
    indikator: [
      { id: 'ind_45', nomor: 45, kode: 'G.1', deskripsi: 'Buku Agenda Surat Masuk dan Agenda Surat Keluar' },
      { id: 'ind_46', nomor: 46, kode: 'G.2', deskripsi: 'Buku Ekspedisi Pengiriman Surat Dinas' },
      { id: 'ind_47', nomor: 47, kode: 'G.3', deskripsi: 'Pengarsipan File Surat Masuk, Surat Keluar, dan Surat Keputusan (SK) Kepala Sekolah' },
      { id: 'ind_48', nomor: 48, kode: 'G.4', deskripsi: 'Buku Tamu Umum, Buku Tamu Dinas, dan Buku Tamu Pembinaan / Supervisi' },
      { id: 'ind_49', nomor: 49, kode: 'G.5', deskripsi: 'Buku Notulen Rapat Dewan Guru dan Rapat Komite / Orang Tua Siswa' },
      { id: 'ind_50', nomor: 50, kode: 'G.6', deskripsi: 'SK Pengurus Komite Sekolah dan Program Kerja Kemitraan / Humas' },
      { id: 'ind_51', nomor: 51, kode: 'G.7', deskripsi: 'Dokumentasi Kegiatan Sekolah dan Publikasi Informasi Satuan Pendidikan' },
    ],
  },
  {
    kode: 'H',
    judul: 'Kategori H — Manajemen & Kepemimpinan Kepala Sekolah',
    indikator: [
      { id: 'ind_52', nomor: 52, kode: 'H.1', deskripsi: 'Dokumen Evaluasi Diri Sekolah (EDS) / Analisis Rapor Pendidikan Satuan Pendidikan' },
      { id: 'ind_53', nomor: 53, kode: 'H.2', deskripsi: 'Dokumen Rencana Kerja Jangka Menengah (RKJM) 4 Tahunan' },
      { id: 'ind_54', nomor: 54, kode: 'H.3', deskripsi: 'Dokumen Rencana Kerja Tahunan (RKT) Berbasis Perencanaan Berbasis Data (PBD)' },
      { id: 'ind_55', nomor: 55, kode: 'H.4', deskripsi: 'Struktur Organisasi Sekolah dan Uraian Tugas (Job Description) Warga Sekolah' },
      { id: 'ind_56', nomor: 56, kode: 'H.5', deskripsi: 'Program Kerja Tahunan Kepala Sekolah dan Kalender Kegiatan Manajerial' },
      { id: 'ind_57', nomor: 57, kode: 'H.6', deskripsi: 'Laporan Tahunan Pelaksanaan Program Kerja Kepala Sekolah dan Akuntabilitas Kinerja' },
    ],
  },
];

// Master Data Sekolah Binaan dari Sheet SEKOLAH (Database Aktual ADM/Kepsek)
export const INITIAL_SEKOLAH_SHEET: SekolahBinaan[] = [
  { id: 'SD001', namaSekolah: 'SDN 1 Pulubala', kepalaSekolah: 'Titi Andriani Manyoe, S.Pd', nipKepalaSekolah: '198611132011012001' },
  { id: 'SD002', namaSekolah: 'SDN 2 Pulubala', kepalaSekolah: 'Anis A. Nuna, S.Pd', nipKepalaSekolah: '196901071994031000' },
  { id: 'SD003', namaSekolah: 'SDN 3 Pulubala', kepalaSekolah: 'Nina Kabaderan, M.Pd', nipKepalaSekolah: '198012192010012003' },
  { id: 'SD004', namaSekolah: 'SDN 4 Pulubala', kepalaSekolah: 'ANTON NAPU, S.Pd', nipKepalaSekolah: '196706281995041001' },
  { id: 'SD005', namaSekolah: 'SDN 7 Pulubala', kepalaSekolah: 'Fitriyanti Malahedi, S.Pd', nipKepalaSekolah: '198406282009012003' },
  { id: 'SD006', namaSekolah: 'SDN 8 PULUBALA', kepalaSekolah: 'MERI USMAN S.Pd', nipKepalaSekolah: '196705101991122002' },
  { id: 'SD007', namaSekolah: 'SDN 9 Pulubala', kepalaSekolah: 'HADIDJAH KAUDJI, S.Pd', nipKepalaSekolah: '197103122003122004' },
  { id: 'SD008', namaSekolah: 'SDN 10 PULUBALA', kepalaSekolah: 'RISMAN T. JABAR, S.Pd', nipKepalaSekolah: '196910081993031008' },
  { id: 'SD009', namaSekolah: 'SDN 15 Pulubala', kepalaSekolah: 'Yusri Salam, S.Pd', nipKepalaSekolah: '197202152006041017' },
  { id: 'SD010', namaSekolah: 'SDN 17 PULUBALA', kepalaSekolah: 'FELMI DAULIMA, S.Pd', nipKepalaSekolah: '19800429 2005012014' },
  { id: 'SD011', namaSekolah: 'SDN 18 Pulubala', kepalaSekolah: 'Yuliyana Tanango, S.Pd', nipKepalaSekolah: '19780618 2009012004' },
  { id: 'SD012', namaSekolah: 'SDN 21 PULUBALA', kepalaSekolah: 'SRIANI USU, S.Pd', nipKepalaSekolah: '197507272006042034' },
  { id: 'SD013', namaSekolah: 'SDN 23 Pulubala', kepalaSekolah: 'Ismail Y. Side, S.Pd', nipKepalaSekolah: '198309212014081000' },
];

// Master Data Pengawas dari Sheet PENGAWAS
export const INITIAL_PENGAWAS_SHEET: Pengawas[] = [
  { id: 'pgw_1', namaPengawas: 'Drs. H. Mahmud P. Oli\'i, M.Pd', nip: '196704121992031008' },
  { id: 'pgw_2', namaPengawas: 'Hj. Maryam K. Моnoarfa, S.Pd., M.Si', nip: '196908191994022003' },
  { id: 'pgw_3', namaPengawas: 'Yusuf R. Katili, S.Pd., M.Pd', nip: '197111051996061002' },
];

// Data Aktual Sheet SUPERVISI (Kosong sampai terbaca dari database)
export const INITIAL_SUPERVISI_SHEET: SupervisiRecord[] = [];
