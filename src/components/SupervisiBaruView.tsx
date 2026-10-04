import React, { useState, useMemo } from 'react';
import {
  SekolahBinaan,
  Pengawas,
  KATEGORI_INSTRUMEN,
  SKOR_MAKSIMAL_INSTRUMEN,
  SupervisiRecord,
  generateAutoCatatanIndikator,
} from '../data/instrumenData';

interface SupervisiBaruViewProps {
  sekolahList: SekolahBinaan[];
  pengawasList: Pengawas[];
  onSaveSupervisi: (record: SupervisiRecord) => void;
}

const TOTAL_INDIKATOR = 57;

export const SupervisiBaruView: React.FC<SupervisiBaruViewProps> = ({
  sekolahList,
  pengawasList,
  onSaveSupervisi,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [selectedSekolah, setSelectedSekolah] = useState<string>('');
  const [infoKepalaSekolah, setInfoKepalaSekolah] = useState<string>('');
  const [selectedPengawas, setSelectedPengawas] = useState<string>('');
  const [tahunAjaran, setTahunAjaran] = useState<string>('2025/2026');
  const [semester, setSemester] = useState<string>('1 (Ganjil)');
  const [tanggalSupervisi, setTanggalSupervisi] = useState<string>(todayStr);

  const [scores, setScores] = useState<Record<string, number>>({});
  const [catatanIndikator, setCatatanIndikator] = useState<Record<string, string>>({});
  const [autoFillEnabled, setAutoFillEnabled] = useState<boolean>(true);
  const [catatanUmum, setCatatanUmum] = useState<string>('');
  const [tindakLanjut, setTindakLanjut] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'danger' | 'warning';
    message: string;
  } | null>(null);

  const updateInfoSekolah = (namaSekolahValue: string) => {
    setSelectedSekolah(namaSekolahValue);
    const found = sekolahList.find((s) => s.namaSekolah === namaSekolahValue);
    setInfoKepalaSekolah(found ? found.kepalaSekolah : '');
  };

  const { terisiCount, totalSkor } = useMemo(() => {
    const keys = Object.keys(scores);
    const sum = keys.reduce((acc, key) => acc + (scores[key] ?? 0), 0);
    return {
      terisiCount: keys.length,
      totalSkor: sum,
    };
  }, [scores]);

  // Saat skor indikator dipilih, otomatis isi catatan indikator jika mode auto-fill aktif
  const handleScoreSelect = (
    indikatorId: string,
    nilai: number,
    deskripsi: string
  ) => {
    setScores((prev) => ({
      ...prev,
      [indikatorId]: nilai,
    }));

    if (autoFillEnabled) {
      setCatatanIndikator((prev) => ({
        ...prev,
        [indikatorId]: generateAutoCatatanIndikator(deskripsi, nilai),
      }));
    }
  };

  const triggerAutoNotesManual = () => {
    const pct = (totalSkor / SKOR_MAKSIMAL_INSTRUMEN) * 100;
    let predikat = 'Kurang';
    let masukan = '';
    let rekomendasi = '';

    if (pct >= 91) {
      predikat = 'Sangat Baik (A)';
      masukan = `Pelaksanaan administrasi manajemen Kepala Sekolah pada ${
        selectedSekolah || 'sekolah binaan'
      } memperoleh skor ${totalSkor} dari ${SKOR_MAKSIMAL_INSTRUMEN} (${pct.toFixed(
        1
      )}% — Predikat ${predikat}). Seluruh komponen dokumen supervisi, kurikulum, kesiswaan, kepegawaian, sarpras, keuangan, persuratan, dan kepemimpinan manajerial telah tersusun sangat lengkap, sistematis, dan mutakhir.`;
      rekomendasi =
        'Pertahankan mutu tata kelola administrasi satuan pendidikan dan jadikan sebagai rujukan praktik baik (best practice) pada forum K3S/MKKS.';
    } else if (pct >= 76) {
      predikat = 'Baik (B)';
      masukan = `Pelaksanaan administrasi manajemen Kepala Sekolah pada ${
        selectedSekolah || 'sekolah binaan'
      } memperoleh skor ${totalSkor} dari ${SKOR_MAKSIMAL_INSTRUMEN} (${pct.toFixed(
        1
      )}% — Predikat ${predikat}). Sebagian besar dokumen administrasi pokok telah tersedia dengan baik, namun masih terdapat beberapa indikator yang memerlukan pemutakhiran bukti fisik berkala.`;
      rekomendasi =
        'Lengkapi dokumen evaluasi tindak lanjut supervisi serta tertibkan pengarsipan bukti fisik pada indikator yang masih bernilai 2 atau 3.';
    } else if (pct >= 60) {
      predikat = 'Cukup (C)';
      masukan = `Pelaksanaan administrasi manajemen Kepala Sekolah pada ${
        selectedSekolah || 'sekolah binaan'
      } memperoleh skor ${totalSkor} dari ${SKOR_MAKSIMAL_INSTRUMEN} (${pct.toFixed(
        1
      )}% — Predikat ${predikat}). Beberapa dokumen administrasi utama sudah ada tetapi belum lengkap dan belum seluruhnya terdokumentasi sesuai standar.`;
      rekomendasi =
        'Perlu pendampingan intensif penyusunan dokumen KOSP, RKJM/RKT berbasis Rapor Pendidikan, serta penertiban administrasi keuangan dan inventaris sekolah.';
    } else {
      predikat = 'Kurang (D)';
      masukan = `Pelaksanaan administrasi manajemen Kepala Sekolah pada ${
        selectedSekolah || 'sekolah binaan'
      } memperoleh skor ${totalSkor} dari ${SKOR_MAKSIMAL_INSTRUMEN} (${pct.toFixed(
        1
      )}% — Predikat ${predikat}). Mayoritas instrumen administrasi kepala sekolah belum terisi lengkap atau belum memiliki dokumen bukti fisik yang memadai.`;
      rekomendasi =
        'Laksanakan pembinaan khusus dan penyusunan ulang dokumen administrasi wajib kepala sekolah secara bertahap bersama pengawas pembina.';
    }

    setCatatanUmum(masukan);
    setTindakLanjut(rekomendasi);
  };

  // Isi cepat skor sekaligus otomatis mengisi seluruh 57 catatan indikator
  const isiSemuaSkorOtomatis = (defaultSkor: number) => {
    const nextScores: Record<string, number> = {};
    const nextNotes: Record<string, string> = {};

    KATEGORI_INSTRUMEN.forEach((kat) => {
      kat.indikator.forEach((ind) => {
        nextScores[ind.id] = defaultSkor;
        nextNotes[ind.id] = generateAutoCatatanIndikator(ind.deskripsi, defaultSkor);
      });
    });

    setScores(nextScores);
    setCatatanIndikator(nextNotes);

    // Auto-generate catatan umum & rekomendasi
    setTimeout(() => {
      triggerAutoNotesManual();
    }, 50);

    setNotification({
      type: 'success',
      message: `Berhasil mengisi cepat 57 indikator dengan Skor ${defaultSkor} dan catatan indikator otomatis telah terisi lengkap.`,
    });
    setTimeout(() => setNotification(null), 4000);
  };

  // Isi otomatis seluruh catatan indikator berdasarkan skor yang sudah dipilih
  const isiSemuaCatatanOtomatis = () => {
    const nextNotes: Record<string, string> = {};
    KATEGORI_INSTRUMEN.forEach((kat) => {
      kat.indikator.forEach((ind) => {
        const val = scores[ind.id] ?? 4;
        nextNotes[ind.id] = generateAutoCatatanIndikator(ind.deskripsi, val);
      });
    });
    setCatatanIndikator(nextNotes);
    triggerAutoNotesManual();
    setNotification({
      type: 'success',
      message: 'Seluruh 57 catatan indikator berhasil diisi otomatis sesuai skor masing-masing indikator.',
    });
    setTimeout(() => setNotification(null), 4000);
  };

  const submitSupervisi = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    if (!selectedSekolah) {
      setNotification({
        type: 'warning',
        message: 'Silakan pilih Sekolah Binaan terlebih dahulu.',
      });
      return;
    }

    if (!selectedPengawas) {
      setNotification({
        type: 'warning',
        message: 'Silakan pilih Pengawas terlebih dahulu.',
      });
      return;
    }

    setIsSubmitting(true);

    const foundSekolah = sekolahList.find((s) => s.namaSekolah === selectedSekolah);
    const foundPengawas = pengawasList.find((p) => p.namaPengawas === selectedPengawas);

    // Pastikan semua 57 catatan indikator terisi secara otomatis jika belum diisi manual
    const finalCatatanIndikator: Record<string, string> = {};
    KATEGORI_INSTRUMEN.forEach((kat) => {
      kat.indikator.forEach((ind) => {
        const val = scores[ind.id] ?? 4;
        finalCatatanIndikator[ind.id] =
          catatanIndikator[ind.id]?.trim() ||
          generateAutoCatatanIndikator(ind.deskripsi, val);
      });
    });

    const newRecord: SupervisiRecord = {
      id: `sup_${Date.now()}`,
      timestamp: new Date().toISOString(),
      namaSekolah: selectedSekolah,
      idSekolah: foundSekolah ? foundSekolah.id : `SD001`,
      kepalaSekolah: infoKepalaSekolah,
      pengawas: selectedPengawas,
      idPengawas: foundPengawas ? foundPengawas.id : `pgw_1`,
      tahunAjaran,
      semester,
      tanggalSupervisi,
      nilaiAkhir: totalSkor,
      skorMaksimal: SKOR_MAKSIMAL_INSTRUMEN,
      catatanUmum:
        catatanUmum ||
        `Supervisi administrasi kepala sekolah selesai dilaksanakan dengan total skor ${totalSkor} / ${SKOR_MAKSIMAL_INSTRUMEN}.`,
      tindakLanjut:
        tindakLanjut ||
        'Lakukan tindak lanjut perbaikan dokumen administrasi sesuai catatan indikator.',
      rekomendasi:
        tindakLanjut ||
        'Tingkatkan keteraturan pengarsipan berkas dokumen administrasi secara berkala.',
      skorIndikator: { ...scores },
      catatanIndikator: finalCatatanIndikator,
    };

    onSaveSupervisi(newRecord);
    setIsSubmitting(false);
  };

  return (
    <div id="supervisiView" className="view-section">
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <div>
          <h1 className="h4 fw-bold" style={{ color: '#1f4e78' }}>
            Instrumen Supervisi Administrasi Kepala Sekolah
          </h1>
          <small className="text-muted">
            57 Indikator Manajerial (Kategori A — H) • Terintegrasi Otomatisasi Catatan &amp; Spreadsheet
          </small>
        </div>
        <div className="d-flex flex-wrap gap-2 mt-2 mt-md-0 align-items-center">
          <div className="form-check form-switch me-2 mb-0" title="Aktifkan untuk mengisi catatan otomatis saat skor diklik">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              id="switchAutoCatatan"
              checked={autoFillEnabled}
              onChange={(e) => setAutoFillEnabled(e.target.checked)}
            />
            <label className="form-check-label small fw-semibold" htmlFor="switchAutoCatatan">
              Auto Catatan
            </label>
          </div>
          <button
            type="button"
            className="btn btn-outline-success btn-sm"
            onClick={isiSemuaCatatanOtomatis}
            title="Isi otomatis semua 57 catatan indikator sesuai skor saat ini"
          >
            <i className="fa-solid fa-wand-magic-sparkles me-1"></i> Isi Catatan Otomatis
          </button>
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={() => isiSemuaSkorOtomatis(4)}
            title="Isi cepat semua 57 indikator dengan skor 4 dan catatan otomatis"
          >
            <i className="fa-solid fa-bolt me-1"></i> Cepat (Skor 4)
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => isiSemuaSkorOtomatis(3)}
            title="Isi cepat semua 57 indikator dengan skor 3 dan catatan otomatis"
          >
            Cepat (Skor 3)
          </button>
        </div>
      </div>

      {notification && (
        <div className={`alert alert-${notification.type} mb-3`} role="alert">
          {notification.message}
        </div>
      )}

      <form id="formSupervisi" onSubmit={submitSupervisi}>
        {/* Identitas Supervisi */}
        <div className="card card-stat p-4 bg-white mb-4 shadow-sm border">
          <h5 className="mb-3 text-primary fw-bold">
            <i className="fa-solid fa-id-card me-2"></i> Identitas Pelaksanaan Supervisi
          </h5>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Pilih Sekolah Binaan <span className="text-danger">*</span>
              </label>
              <select
                id="selectSekolah"
                className="form-select"
                required
                value={selectedSekolah}
                onChange={(e) => updateInfoSekolah(e.target.value)}
              >
                <option value="">-- Pilih Sekolah --</option>
                {sekolahList.map((sek) => (
                  <option key={sek.id} value={sek.namaSekolah}>
                    {sek.namaSekolah}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Nama Kepala Sekolah
              </label>
              <input
                type="text"
                id="namaKepsek"
                className="form-control bg-light"
                readOnly
                value={infoKepalaSekolah}
                placeholder="Otomatis terisi saat sekolah dipilih"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Pengawas Pembina <span className="text-danger">*</span>
              </label>
              <select
                id="selectPengawas"
                className="form-select"
                required
                value={selectedPengawas}
                onChange={(e) => setSelectedPengawas(e.target.value)}
              >
                <option value="">-- Pilih Pengawas --</option>
                {pengawasList.map((pgw) => (
                  <option key={pgw.id} value={pgw.namaPengawas}>
                    {pgw.namaPengawas}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">Tahun Ajaran</label>
              <input
                type="text"
                id="tahunAjaran"
                className="form-control"
                value={tahunAjaran}
                onChange={(e) => setTahunAjaran(e.target.value)}
                required
              />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">Semester</label>
              <select
                id="semester"
                className="form-select"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
              >
                <option value="1 (Ganjil)">1 (Ganjil)</option>
                <option value="2 (Genap)">2 (Genap)</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Tanggal Supervisi <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                id="tanggalSupervisi"
                className="form-control"
                value={tanggalSupervisi}
                onChange={(e) => setTanggalSupervisi(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Sticky Progress Bar & Quick Info */}
        <div className="sticky-progress mb-4 d-flex justify-content-between align-items-center border shadow-sm">
          <div>
            <span className="fw-bold text-dark">
              Status Pengisian 57 Indikator
            </span>
            <div className="text-muted small" id="progressText">
              {terisiCount} / {TOTAL_INDIKATOR} Indikator Terisi • {autoFillEnabled ? 'Catatan Otomatis Aktif' : 'Catatan Manual'}
            </div>
          </div>
          <div>
            <span className="badge bg-primary fs-6" id="badgeTotalSkor">
              Total Skor: {totalSkor} / {SKOR_MAKSIMAL_INSTRUMEN}
            </span>
          </div>
        </div>

        {/* Container Dinamis Indikator A-H */}
        <div id="containerInstrumen">
          {KATEGORI_INSTRUMEN.map((kategori) => (
            <div key={kategori.kode} className="category-section border mb-4 bg-white p-3 rounded shadow-sm">
              <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                <h5 className="text-primary fw-bold mb-0">
                  <i className="fa-solid fa-folder-open me-2"></i>
                  {kategori.judul}
                </h5>
                <span className="badge bg-light text-primary border">
                  {kategori.indikator.length} Indikator
                </span>
              </div>
              <div className="d-flex flex-column gap-3">
                {kategori.indikator.map((ind) => {
                  const currentVal = scores[ind.id];
                  const currentNote = catatanIndikator[ind.id] || '';
                  return (
                    <div
                      key={ind.id}
                      className="p-3 rounded border bg-light bg-opacity-50"
                    >
                      <div className="row align-items-center g-2">
                        <div className="col-lg-5 col-md-12">
                          <div className="fw-semibold text-dark">
                            <span className="text-primary me-2">
                              {ind.nomor}. [{ind.kode}]
                            </span>
                            {ind.deskripsi}
                          </div>
                        </div>
                        <div className="col-lg-3 col-md-5">
                          <div
                            className="btn-group w-100"
                            role="group"
                            aria-label={`Skor indikator ${ind.nomor}`}
                          >
                            {[0, 1, 2, 3, 4].map((val) => {
                              const active = currentVal === val;
                              return (
                                <button
                                  key={val}
                                  type="button"
                                  className={`btn btn-sm ${
                                    active
                                      ? 'btn-primary fw-bold'
                                      : 'btn-outline-secondary'
                                  }`}
                                  onClick={() =>
                                    handleScoreSelect(ind.id, val, ind.deskripsi)
                                  }
                                  title={`Skor ${val}`}
                                >
                                  {val}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <div className="col-lg-4 col-md-7">
                          <div className="input-group input-group-sm">
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Catatan / deskripsi otomatis..."
                              value={currentNote}
                              onChange={(e) =>
                                setCatatanIndikator((prev) => ({
                                  ...prev,
                                  [ind.id]: e.target.value,
                                }))
                              }
                              title="Catatan bukti fisik / deskripsi hasil supervisi"
                            />
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              title="Perbarui catatan otomatis indikator ini"
                              onClick={() => {
                                const s = currentVal ?? 4;
                                setCatatanIndikator((prev) => ({
                                  ...prev,
                                  [ind.id]: generateAutoCatatanIndikator(
                                    ind.deskripsi,
                                    s
                                  ),
                                }));
                              }}
                            >
                              <i className="fa-solid fa-wand-magic-sparkles text-primary"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Catatan & Tindak Lanjut */}
        <div className="card card-stat p-4 bg-white mb-4 shadow-sm border">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="text-primary mb-0 fw-bold">
              <i className="fa-solid fa-comment-dots me-2"></i> Catatan &amp; Rekomendasi Pengawas
            </h5>
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={triggerAutoNotesManual}
              title="Generate otomatis kesimpulan dan rekomendasi pengawas berdasarkan skor"
            >
              <i className="fa-solid fa-wand-magic-sparkles me-1"></i> Generate Otomatis Rekomendasi
            </button>
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">
              A. Masukan terhadap Proses Pembelajaran &amp; Administrasi Secara Umum
            </label>
            <textarea
              id="catatanUmum"
              className="form-control"
              rows={3}
              value={catatanUmum}
              onChange={(e) => setCatatanUmum(e.target.value)}
              placeholder="Akan terisi otomatis saat tombol generate diklik atau ketik manual..."
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">
              B. Tindak Lanjut &amp; Rekomendasi Pembinaan Kepala Sekolah
            </label>
            <textarea
              id="tindakLanjut"
              className="form-control"
              rows={3}
              value={tindakLanjut}
              onChange={(e) => setTindakLanjut(e.target.value)}
              placeholder="Rekomendasi perbaikan dan tindak lanjut supervisi..."
            />
          </div>
          <div className="d-flex justify-content-end">
            <button
              type="submit"
              className="btn btn-success px-4 py-2 fw-semibold shadow-sm"
              disabled={isSubmitting}
            >
              <i className="fa-solid fa-floppy-disk me-2"></i>
              {isSubmitting ? 'Menyimpan...' : 'Simpan Hasil Supervisi'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
