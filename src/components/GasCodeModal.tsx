import React, { useState } from 'react';
import { SupervisiRecord } from '../data/instrumenData';

interface GasCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  supervisiRows: SupervisiRecord[];
  onResetDefaultData: () => void;
  onClearSupervisiData: () => void;
}

export const GasCodeModal: React.FC<GasCodeModalProps> = ({
  isOpen,
  onClose,
  supervisiRows,
  onResetDefaultData,
  onClearSupervisiData,
}) => {
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'html' | 'js' | 'sheet'>('html');

  if (!isOpen) return null;

  const dashboardHtmlSnippet = `<!-- 1. DASHBOARD VIEW (Bagian HTML yang Diperbarui) -->
<div id="dashboardView" class="view-section" style="display: none;">
  <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
    <h1 class="h4">Dashboard Pengawas</h1>
  </div>

  <!-- KARTU RINGKASAN DASHBOARD -->
  <div class="row g-3 mb-4">
    <div class="col-md-4">
      <div class="card card-stat p-3 bg-white">
        <h6 class="text-muted">Total Sekolah Binaan</h6>
        <h3 id="statSekolah" class="fw-bold text-primary">0</h3>
      </div>
    </div>
    <div class="col-md-4">
      <div class="card card-stat p-3 bg-white">
        <h6 class="text-muted">Supervisi Selesai</h6>
        <h3 id="statSupervisi" class="fw-bold text-success">0</h3>
      </div>
    </div>
    <div class="col-md-4">
      <div class="card card-stat p-3 bg-white">
        <h6 class="text-muted">Rata-rata Nilai Akhir</h6>
        <h3 id="statRataRata" class="fw-bold text-info">0.00</h3>
      </div>
    </div>
  </div>

  <!-- PANEL 1: DAFTAR SEKOLAH YANG TELAH DISUPERVISI -->
  <div class="card card-stat p-4 bg-white mb-4">
    <h6 class="fw-bold text-primary text-uppercase mb-3">
      <i class="fa-solid fa-list-check me-2"></i>Daftar Sekolah yang Telah Disupervisi
    </h6>
    <div class="table-responsive">
      <table class="table table-bordered table-hover align-middle mb-0">
        <thead class="table-light">
          <tr>
            <th style="width:60px;" class="text-center">No</th>
            <th>Nama Sekolah</th>
            <th style="width:180px;" class="text-center">Tanggal Supervisi</th>
            <th style="width:150px;" class="text-center">Nilai Akhir</th>
            <th style="width:140px;" class="text-center">Status</th>
          </tr>
        </thead>
        <tbody id="tbodySekolahSupervisi">
          <tr>
            <td colspan="5" class="text-center text-muted py-3">Belum ada data supervisi.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- PANEL 2: CAPAIAN NILAI SUPERVISI PER SEKOLAH -->
  <div class="card card-stat p-4 bg-white mb-4">
    <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap">
      <h6 class="fw-bold text-primary text-uppercase mb-0">
        <i class="fa-solid fa-chart-column me-2"></i>Capaian Nilai Supervisi Per Sekolah
      </h6>
      <span class="text-muted small">Rentang Skor Maksimum: 0–228</span>
    </div>
    <div id="chartCapaianSekolah" style="min-height: 280px;"></div>
  </div>

  <div class="card card-stat p-4 bg-white text-center py-4">
    <h5>Selamat Datang di Aplikasi Supervisi Administrasi Kepala Sekolah</h5>
    <p class="text-muted">Silakan klik menu <b>Supervisi Baru</b> di samping untuk memulai penilaian dokumen administrasi sekolah binaan.</p>
    <div>
      <button class="btn btn-primary" onclick="switchView('supervisiView', document.querySelectorAll('.sidebar .nav-link')[1])">
        <i class="fa-solid fa-plus me-1"></i> Mulai Supervisi Baru
      </button>
    </div>
  </div>
</div>`;

  const dashboardJsSnippet = `// FUNGSI KHUSUS DASHBOARD (Membaca data aktual dari Sheet SUPERVISI)
function renderDashboardData(data) {
  var totalSekolah = Number(data && data.totalSekolah) || 0;
  // daftarSupervisi berisi array objek dari Sheet SUPERVISI: [{ namaSekolah, tanggalSupervisi, nilaiAkhir }]
  var listSupervisi = (data && Array.isArray(data.daftarSupervisi)) ? data.daftarSupervisi : [];
  var jumlahSelesai = listSupervisi.length;

  var totalNilai = 0;
  for (var i = 0; i < listSupervisi.length; i++) {
    totalNilai += Number(listSupervisi[i].nilaiAkhir) || 0;
  }
  var rataRata = jumlahSelesai > 0 ? (totalNilai / jumlahSelesai).toFixed(2) : '0.00';

  // 1. Update Kartu Ringkasan
  document.getElementById('statSekolah').innerText = totalSekolah;
  document.getElementById('statSupervisi').innerText = jumlahSelesai;
  document.getElementById('statRataRata').innerText = rataRata;

  // 2. Update Tabel Daftar Sekolah yang Telah Disupervisi (Sumber Data Sama)
  var tbody = document.getElementById('tbodySekolahSupervisi');
  var chartContainer = document.getElementById('chartCapaianSekolah');

  if (jumlahSelesai === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-3">Belum ada sekolah yang disupervisi pada sheet SUPERVISI.</td></tr>';
    chartContainer.innerHTML = '<div class="text-center text-muted py-5">Belum ada data supervisi untuk ditampilkan pada grafik.</div>';
    return;
  }

  var rowsHtml = '';
  for (var idx = 0; idx < listSupervisi.length; idx++) {
    var row = listSupervisi[idx];
    var nilai = Number(row.nilaiAkhir) || 0;
    rowsHtml += '<tr>' +
      '<td class="text-center">' + (idx + 1) + '</td>' +
      '<td class="fw-semibold">' + escapeHtml(row.namaSekolah) + '</td>' +
      '<td class="text-center">' + escapeHtml(row.tanggalSupervisi) + '</td>' +
      '<td class="text-center fw-bold text-primary">' + nilai + '</td>' +
      '<td class="text-center text-success fw-semibold">&#10003; Selesai</td>' +
    '</tr>';
  }
  tbody.innerHTML = rowsHtml;

  // 3. Update Grafik Batang Capaian Nilai Supervisi Per Sekolah (Rentang 0 - 228)
  var maxSkor = 228;
  var barsHtml = '<div style="overflow-x:auto; padding-top:20px;"><div style="display:flex; align-items:flex-end; gap:16px; height:240px; min-width:300px; border-bottom:2px solid #94a3b8; border-left:2px solid #94a3b8; padding:0 16px;">';
  var labelsHtml = '<div style="display:flex; gap:16px; min-width:300px; padding:8px 16px 0 16px;">';

  for (var j = 0; j < listSupervisi.length; j++) {
    var item = listSupervisi[j];
    var skor = Math.max(0, Math.min(maxSkor, Number(item.nilaiAkhir) || 0));
    var heightPct = ((skor / maxSkor) * 100).toFixed(1);
    barsHtml += '<div style="flex:1; min-width:56px; max-width:90px; height:100%; display:flex; flex-direction:column; justify-content:flex-end; align-items:center;">' +
      '<div style="font-size:12px; font-weight:700; color:#1f4e78; margin-bottom:4px;">' + skor + '</div>' +
      '<div style="width:100%; height:' + heightPct + '%; background:linear-gradient(180deg,#1f4e78,#2b6cb0); border-radius:6px 6px 0 0;" title="' + escapeHtml(item.namaSekolah) + ': ' + skor + '"></div>' +
    '</div>';
    labelsHtml += '<div style="flex:1; min-width:56px; max-width:90px; text-align:center; font-size:12px; font-weight:600; word-break:break-word;">' +
      escapeHtml(item.namaSekolah) +
    '</div>';
  }
  barsHtml += '</div>' + labelsHtml + '</div></div>';
  chartContainer.innerHTML = barsHtml;
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, function(m) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
  });
}`;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(label);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  return (
    <div
      className="modal d-block"
      tabIndex={-1}
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }}
    >
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title fw-bold" style={{ color: '#1f4e78' }}>
              <i className="fa-solid fa-database me-2"></i>
              Sinkronisasi Sheet SUPERVISI &amp; Kode Dashboard GAS
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            />
          </div>

          <div className="modal-body">
            <ul className="nav nav-tabs mb-3">
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link ${activeTab === 'html' ? 'active fw-semibold' : ''}`}
                  onClick={() => setActiveTab('html')}
                >
                  1. Kode HTML Dashboard
                </button>
              </li>
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link ${activeTab === 'js' ? 'active fw-semibold' : ''}`}
                  onClick={() => setActiveTab('js')}
                >
                  2. Fungsi JS Dashboard
                </button>
              </li>
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link ${activeTab === 'sheet' ? 'active fw-semibold' : ''}`}
                  onClick={() => setActiveTab('sheet')}
                >
                  3. Data Sheet SUPERVISI ({supervisiRows.length} Baris)
                </button>
              </li>
            </ul>

            {activeTab === 'html' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="small text-muted">
                    Gunakan blok <code>#dashboardView</code> ini pada file{' '}
                    <code>Index.html</code> Google Apps Script Anda:
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() => handleCopy(dashboardHtmlSnippet, 'html')}
                  >
                    <i className="fa-solid fa-copy me-1"></i>
                    {copiedTab === 'html' ? 'Tersalin!' : 'Salin HTML'}
                  </button>
                </div>
                <pre
                  className="bg-dark text-light p-3 rounded small"
                  style={{ maxHeight: '340px', overflowY: 'auto' }}
                >
                  <code>{dashboardHtmlSnippet}</code>
                </pre>
              </div>
            )}

            {activeTab === 'js' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="small text-muted">
                    Fungsi <code>renderDashboardData(data)</code> untuk mengisi
                    Kartu, Tabel, dan Grafik Batang dari Sheet{' '}
                    <code>SUPERVISI</code>:
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() => handleCopy(dashboardJsSnippet, 'js')}
                  >
                    <i className="fa-solid fa-copy me-1"></i>
                    {copiedTab === 'js' ? 'Tersalin!' : 'Salin Fungsi JS'}
                  </button>
                </div>
                <pre
                  className="bg-dark text-light p-3 rounded small"
                  style={{ maxHeight: '340px', overflowY: 'auto' }}
                >
                  <code>{dashboardJsSnippet}</code>
                </pre>
              </div>
            )}

            {activeTab === 'sheet' && (
              <div>
                <p className="small text-muted mb-3">
                  Data di bawah ini merupakan isi aktual dari sheet{' '}
                  <b>SUPERVISI</b>. Anda dapat menambah data baru melalui menu{' '}
                  <b>Supervisi Baru</b>, atau menguji kondisi sheet kosong
                  (CHECK 11).
                </p>
                <div className="d-flex gap-2 mb-3">
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={onResetDefaultData}
                  >
                    <i className="fa-solid fa-rotate-left me-1"></i> Muat Ulang
                    Data Awal Sheet SUPERVISI
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={onClearSupervisiData}
                  >
                    <i className="fa-solid fa-trash-can me-1"></i> Uji Kondisi
                    Belum Ada Supervisi (0 Data)
                  </button>
                </div>
                <div className="table-responsive">
                  <table className="table table-sm table-bordered small">
                    <thead className="table-light">
                      <tr>
                        <th>No</th>
                        <th>Nama Sekolah</th>
                        <th>Kepala Sekolah</th>
                        <th>Tanggal Supervisi</th>
                        <th>Nilai Akhir</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supervisiRows.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center text-muted">
                            Sheet SUPERVISI kosong (0 baris)
                          </td>
                        </tr>
                      ) : (
                        supervisiRows.map((r, i) => (
                          <tr key={r.id}>
                            <td>{i + 1}</td>
                            <td>{r.namaSekolah}</td>
                            <td>{r.kepalaSekolah}</td>
                            <td>{r.tanggalSupervisi}</td>
                            <td className="fw-bold">{r.nilaiAkhir}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onClose}
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
