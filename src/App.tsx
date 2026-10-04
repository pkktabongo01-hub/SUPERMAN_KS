import React, { useState } from 'react';
import {
  INITIAL_SEKOLAH_SHEET,
  INITIAL_PENGAWAS_SHEET,
  INITIAL_SUPERVISI_SHEET,
  SekolahBinaan,
  Pengawas,
  SupervisiRecord,
} from './data/instrumenData';
import {
  loadSheetSupervisi,
  saveSheetSupervisi,
  loadSheetSekolah,
  getGasWebAppUrl,
} from './services/dashboardService';
import { DashboardView } from './components/DashboardView';
import { SupervisiBaruView } from './components/SupervisiBaruView';
import { GasCodeModal } from './components/GasCodeModal';

export default function App() {
  const [activeView, setActiveView] = useState<'dashboardView' | 'supervisiView'>('dashboardView');
  const [sekolahSheet] = useState<SekolahBinaan[]>(() =>
    loadSheetSekolah(INITIAL_SEKOLAH_SHEET)
  );
  const [pengawasSheet] = useState<Pengawas[]>(INITIAL_PENGAWAS_SHEET);
  const [supervisiSheet, setSupervisiSheet] = useState<SupervisiRecord[]>(() =>
    loadSheetSupervisi(INITIAL_SUPERVISI_SHEET)
  );
  const [isGasModalOpen, setIsGasModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSaveSupervisi = async (newRecord: SupervisiRecord) => {
    const updatedRows = [...supervisiSheet, newRecord];
    setSupervisiSheet(updatedRows);
    saveSheetSupervisi(updatedRows);

    // Format answers agar diterima oleh Code.gs saveSupervisiLogic:
    // answers[indId] = { skor: number, catatan: string }
    const answersPayload: Record<string, { skor: number; catatan: string }> = {};
    if (newRecord.skorIndikator) {
      Object.keys(newRecord.skorIndikator).forEach((indKey) => {
        const skor = Number(newRecord.skorIndikator![indKey]) || 1;
        const catatan = newRecord.catatanIndikator?.[indKey] || '';
        const itemObj = { skor, catatan };
        answersPayload[indKey] = itemObj;
        if (indKey.startsWith('ind_')) {
          answersPayload[indKey.replace('ind_', '')] = itemObj;
        }
      });
    }

    // Kirim data supervisi ke Google Apps Script Web App jika backend aktif
    try {
      const gasUrl = getGasWebAppUrl();
      fetch(gasUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'saveSupervisi',
          formData: {
            idSekolah: newRecord.idSekolah || newRecord.id,
            namaSekolah: newRecord.namaSekolah,
            namaKepalaSekolah: newRecord.kepalaSekolah,
            idPengawas: newRecord.idPengawas || 'pgw_1',
            namaPengawas: newRecord.pengawas,
            tanggal: newRecord.tanggalSupervisi,
            tanggalSupervisi: newRecord.tanggalSupervisi,
            tahunAjaran: newRecord.tahunAjaran,
            semester: newRecord.semester,
            status: '✓ Selesai',
            catatanUmum: newRecord.catatanUmum || '',
            tindakLanjut: newRecord.tindakLanjut || '',
            rekomendasi: newRecord.rekomendasi || newRecord.tindakLanjut || '',
            answers: answersPayload,
          },
        }),
        mode: 'no-cors', // Standard Google Apps Script POST compatibility
      }).catch(() => {});
    } catch {
      // Abaikan jika network offline
    }

    setActiveView('dashboardView');
    setToastMessage(
      `Data supervisi "${newRecord.namaSekolah}" (Nilai Akhir: ${newRecord.nilaiAkhir}) berhasil disimpan.`
    );
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleResetDefaultData = () => {
    setSupervisiSheet(INITIAL_SUPERVISI_SHEET);
    saveSheetSupervisi(INITIAL_SUPERVISI_SHEET);
  };

  const handleClearSupervisiData = () => {
    setSupervisiSheet([]);
    saveSheetSupervisi([]);
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* SIDEBAR NAVIGATION */}
        <nav className="col-md-3 col-lg-2 d-md-block sidebar p-3">
          <h4 className="text-white py-2 fs-6 fw-bold border-bottom pb-3 mb-3">
            <i className="fa-solid fa-clipboard-check me-2"></i> SISUPERMAN KS
          </h4>
          <ul className="nav flex-column">
            <li className="nav-item">
              <a
                className={`nav-link ${
                  activeView === 'dashboardView' ? 'active' : ''
                }`}
                href="#dashboard"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveView('dashboardView');
                }}
              >
                <i className="fa-solid fa-house me-2"></i> Dashboard
              </a>
            </li>
            <li className="nav-item">
              <a
                className={`nav-link ${
                  activeView === 'supervisiView' ? 'active' : ''
                }`}
                href="#supervisi-baru"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveView('supervisiView');
                }}
              >
                <i className="fa-solid fa-pen-to-square me-2"></i> Supervisi
                Baru
              </a>
            </li>
          </ul>
        </nav>

        {/* MAIN CONTENT */}
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 content-area">
          {toastMessage && (
            <div
              className="alert alert-success alert-dismissible fade show mb-3 shadow-sm"
              role="alert"
            >
              <i className="fa-solid fa-circle-check me-2"></i>
              {toastMessage}
              <button
                type="button"
                className="btn-close"
                onClick={() => setToastMessage(null)}
                aria-label="Close"
              />
            </div>
          )}

          {activeView === 'dashboardView' ? (
            <DashboardView
              onNavigateSupervisiBaru={() => setActiveView('supervisiView')}
              onOpenGasModal={() => setIsGasModalOpen(true)}
            />
          ) : (
            <SupervisiBaruView
              sekolahList={sekolahSheet}
              pengawasList={pengawasSheet}
              onSaveSupervisi={handleSaveSupervisi}
            />
          )}
        </main>
      </div>

      <GasCodeModal
        isOpen={isGasModalOpen}
        onClose={() => setIsGasModalOpen(false)}
        supervisiRows={supervisiSheet}
        onResetDefaultData={handleResetDefaultData}
        onClearSupervisiData={handleClearSupervisiData}
      />
    </div>
  );
}
