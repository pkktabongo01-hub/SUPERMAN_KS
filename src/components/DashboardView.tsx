import React, { useState, useEffect, useCallback } from 'react';
import {
  DashboardDataResult,
  fetchDashboardData,
  getGasWebAppUrl,
} from '../services/dashboardService';
import { SKOR_MAKSIMAL_INSTRUMEN } from '../data/instrumenData';

interface DashboardViewProps {
  onNavigateSupervisiBaru: () => void;
  onOpenGasModal?: () => void;
}

const Y_AXIS_TICKS = [228, 200, 180, 160, 140, 120, 80, 40, 0];

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateSupervisiBaru,
  onOpenGasModal,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardDataResult | null>(null);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await fetchDashboardData();
      setDashboardData(result);
    } catch (err: any) {
      setErrorMessage(
        err?.message || 'Data Dashboard belum dapat dimuat dari server.'
      );
      setDashboardData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getBarColor = (nilai: number) => {
    const pct = (nilai / SKOR_MAKSIMAL_INSTRUMEN) * 100;
    if (pct >= 85) return 'linear-gradient(180deg, #1f4e78 0%, #2b6cb0 100%)';
    if (pct >= 75) return 'linear-gradient(180deg, #0d6efd 0%, #3b82f6 100%)';
    if (pct >= 60) return 'linear-gradient(180deg, #0dcaf0 0%, #0aa2c0 100%)';
    return 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)';
  };

  const rataRataFormatted =
    dashboardData && typeof dashboardData.rataRata === 'number'
      ? dashboardData.rataRata.toFixed(2)
      : '0.00';

  const daftarSekolah = dashboardData?.daftarSekolah || [];

  return (
    <div id="dashboardView" className="view-section">
      {/* HEADER DASHBOARD PENGAWAS */}
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <div>
          <h1 className="h4 mb-0 fw-bold" style={{ color: '#1f4e78' }}>
            Dashboard Pengawas
          </h1>
          <small className="text-muted">
            Sumber Data: Proxy Netlify (<code>/api/dashboard</code>) &rarr; Sheet <b>SUPERVISI</b>
          </small>
        </div>
        <div className="d-flex align-items-center gap-2 mt-2 mt-md-0">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={loadData}
            disabled={isLoading}
            title="Muat ulang data dari Google Apps Script Web App"
          >
            <i
              className={`fa-solid fa-arrows-rotate me-1 ${
                isLoading ? 'fa-spin' : ''
              }`}
            ></i>
            Refresh Data
          </button>
          {onOpenGasModal && (
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={onOpenGasModal}
              title="Informasi Konfigurasi Web App"
            >
              <i className="fa-solid fa-gear me-1"></i> Konfigurasi API
            </button>
          )}
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onNavigateSupervisiBaru}
          >
            <i className="fa-solid fa-plus me-1"></i> Supervisi Baru
          </button>
        </div>
      </div>

      {/* STATUS LOADING */}
      {isLoading && (
        <div className="text-center py-5 my-4 bg-white rounded border shadow-sm">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Memuat data...</span>
          </div>
          <p className="mt-3 text-muted fw-semibold mb-0">
            Memuat data Dashboard...
          </p>
          <small className="text-muted">
            Mengambil data aktual melalui fetch('/api/dashboard')
          </small>
        </div>
      )}

      {/* STATUS ERROR (JIKA API GAGAL) */}
      {!isLoading && errorMessage && (
        <div className="alert alert-warning border shadow-sm p-4 mb-4" role="alert">
          <div className="d-flex align-items-center mb-2">
            <i className="fa-solid fa-triangle-exclamation text-warning fs-3 me-3"></i>
            <div>
              <h5 className="alert-heading mb-0 fw-bold">Gagal mengambil data</h5>
              <div className="small text-muted">
                Data Dashboard belum dapat dimuat dari server.
              </div>
            </div>
          </div>
          <hr />
          <p className="mb-2 small text-dark">{errorMessage}</p>
          <p className="mb-3 small text-muted">
            Endpoint Proxy:{' '}
            <code>/api/dashboard</code> &rarr; Google Apps Script Web App
          </p>
          <div className="d-flex gap-2 flex-wrap">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={loadData}
            >
              <i className="fa-solid fa-arrows-rotate me-1"></i> Refresh Data / Coba Lagi
            </button>
            {onOpenGasModal && (
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={onOpenGasModal}
              >
                <i className="fa-solid fa-circle-question me-1"></i> Bantuan Deployment Google Apps Script
              </button>
            )}
          </div>
        </div>
      )}

      {/* KONTEN UTAMA DASHBOARD (JIKA DATA BERHASIL DIMUAT) */}
      {!isLoading && !errorMessage && dashboardData && (
        <>
          {/* 3 KARTU RINGKASAN DASHBOARD */}
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="card card-stat p-3 bg-white h-100">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="text-muted mb-1">Total Sekolah Binaan</h6>
                    <h3 id="statSekolah" className="fw-bold text-primary mb-0">
                      {dashboardData.totalSekolah}
                    </h3>
                  </div>
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center"
                    style={{
                      width: '42px',
                      height: '42px',
                      backgroundColor: 'rgba(13, 110, 253, 0.1)',
                      color: '#0d6efd',
                    }}
                  >
                    <i className="fa-solid fa-school fs-5"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card card-stat p-3 bg-white h-100">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="text-muted mb-1">Supervisi Selesai</h6>
                    <h3 id="statSupervisi" className="fw-bold text-success mb-0">
                      {dashboardData.supervisiSelesai}
                    </h3>
                  </div>
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center"
                    style={{
                      width: '42px',
                      height: '42px',
                      backgroundColor: 'rgba(25, 135, 84, 0.1)',
                      color: '#198754',
                    }}
                  >
                    <i className="fa-solid fa-circle-check fs-5"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card card-stat p-3 bg-white h-100">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="text-muted mb-1">Rata-rata Nilai Akhir</h6>
                    <h3 id="statRataRata" className="fw-bold text-info mb-0">
                      {rataRataFormatted}
                    </h3>
                  </div>
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center"
                    style={{
                      width: '42px',
                      height: '42px',
                      backgroundColor: 'rgba(13, 202, 240, 0.12)',
                      color: '#0aa2c0',
                    }}
                  >
                    <i className="fa-solid fa-chart-line fs-5"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PANEL 1: DAFTAR SEKOLAH YANG TELAH DISUPERVISI */}
          <div className="dashboard-panel">
            <div className="dashboard-panel-header">
              <h2 className="dashboard-panel-title">
                <i className="fa-solid fa-list-check me-2"></i>
                DAFTAR SEKOLAH YANG TELAH DISUPERVISI
              </h2>
              <span className="text-muted small">
                Total: <b>{daftarSekolah.length}</b> Sekolah Tersupervisi
              </span>
            </div>

            <div className="p-3 p-md-4">
              <div className="table-responsive">
                <table
                  id="tabelSekolahSupervisi"
                  className="table table-hover table-bordered table-supervisi mb-0 align-middle"
                >
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }} className="text-center">
                        No
                      </th>
                      <th>Nama Sekolah</th>
                      <th style={{ width: '180px' }} className="text-center">
                        Tanggal Supervisi
                      </th>
                      <th style={{ width: '150px' }} className="text-center">
                        Nilai Akhir
                      </th>
                      <th style={{ width: '140px' }} className="text-center">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody id="tbodySekolahSupervisi">
                    {daftarSekolah.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center text-muted py-4">
                          Belum ada data sekolah yang telah disupervisi pada sheet{' '}
                          <b>SUPERVISI</b>.
                        </td>
                      </tr>
                    ) : (
                      daftarSekolah.map((item) => (
                        <tr key={item.idSekolah || `sek_${item.no}`}>
                          <td className="text-center fw-semibold text-secondary">
                            {item.no}
                          </td>
                          <td className="fw-semibold text-dark">
                            {item.nama}
                          </td>
                          <td className="text-center text-secondary">
                            {item.tanggal}
                          </td>
                          <td className="text-center fw-bold text-primary">
                            {item.nilai}
                          </td>
                          <td className="text-center">
                            <span className="status-selesai">
                              {item.status || '✓ Selesai'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* PANEL 2: CAPAIAN NILAI SUPERVISI PER SEKOLAH (GRAFIK BATANG) */}
          <div className="dashboard-panel">
            <div className="dashboard-panel-header">
              <h2 className="dashboard-panel-title">
                <i className="fa-solid fa-chart-column me-2"></i>
                Capaian Nilai Supervisi per Sekolah
              </h2>
              <span className="text-muted small">
                Rentang Skor Maksimum: <b>0 – {SKOR_MAKSIMAL_INSTRUMEN}</b>
              </span>
            </div>

            <div className="p-3 p-md-4" id="chartCapaianContainer">
              {daftarSekolah.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <i className="fa-solid fa-chart-simple fs-2 mb-2 d-block opacity-50"></i>
                  Belum ada data supervisi untuk ditampilkan pada grafik.
                </div>
              ) : (
                <div className="chart-scroll-wrapper">
                  <div
                    style={{
                      minWidth: Math.max(320, daftarSekolah.length * 110),
                      paddingTop: '24px',
                      paddingBottom: '8px',
                    }}
                  >
                    {/* Y-Axis Label Header */}
                    <div className="d-flex align-items-center justify-content-between mb-2 px-1">
                      <span
                        className="small fw-semibold text-secondary"
                        style={{ fontSize: '0.78rem' }}
                      >
                        Sumbu Y: Nilai Akhir (Maks. {SKOR_MAKSIMAL_INSTRUMEN})
                      </span>
                      <span
                        className="small text-muted"
                        style={{ fontSize: '0.78rem' }}
                      >
                        Rata-rata: <b>{rataRataFormatted}</b> / {SKOR_MAKSIMAL_INSTRUMEN}
                      </span>
                    </div>

                    {/* Plot Area */}
                    <div
                      className="d-flex"
                      style={{ height: '300px', position: 'relative' }}
                    >
                      {/* Y-Axis Numbers Column */}
                      <div
                        className="d-flex flex-column justify-content-between pe-2 text-end"
                        style={{
                          width: '44px',
                          height: '240px',
                          fontSize: '0.75rem',
                          color: '#64748b',
                          fontWeight: 600,
                          userSelect: 'none',
                        }}
                      >
                        {Y_AXIS_TICKS.map((tick) => (
                          <div
                            key={tick}
                            style={{
                              position: 'absolute',
                              left: 0,
                              width: '38px',
                              bottom: `${
                                60 +
                                (tick / SKOR_MAKSIMAL_INSTRUMEN) * 240 -
                                8
                              }px`,
                              textAlign: 'right',
                            }}
                          >
                            {tick}
                          </div>
                        ))}
                      </div>

                      {/* Chart Grid & Bars */}
                      <div
                        className="flex-grow-1 position-relative"
                        style={{ height: '300px' }}
                      >
                        {/* Horizontal Grid Lines */}
                        {Y_AXIS_TICKS.map((tick) => {
                          const bottomPx =
                            60 + (tick / SKOR_MAKSIMAL_INSTRUMEN) * 240;
                          return (
                            <div
                              key={tick}
                              style={{
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                bottom: `${bottomPx}px`,
                                borderBottom:
                                  tick === 0
                                    ? '2px solid #94a3b8'
                                    : tick === 228
                                    ? '1px dashed #94a3b8'
                                    : '1px dashed #e2e8f0',
                                zIndex: 1,
                              }}
                            />
                          );
                        })}

                        {/* Bars Row */}
                        <div
                          className="d-flex align-items-end justify-content-around position-absolute"
                          style={{
                            left: '12px',
                            right: '12px',
                            bottom: '60px',
                            height: '240px',
                            zIndex: 2,
                            gap: '16px',
                          }}
                        >
                          {daftarSekolah.map((item, index) => {
                            const clampedScore = Math.max(
                              0,
                              Math.min(SKOR_MAKSIMAL_INSTRUMEN, item.nilai)
                            );
                            const heightPercent =
                              (clampedScore / SKOR_MAKSIMAL_INSTRUMEN) * 100;
                            const isHovered = hoveredBarIndex === index;

                            return (
                              <div
                                key={item.idSekolah || `bar_${item.no}`}
                                className="d-flex flex-column align-items-center justify-content-end h-100 bar-item-group position-relative"
                                style={{
                                  flex: '1 1 0px',
                                  maxWidth: '90px',
                                  minWidth: '54px',
                                }}
                                onMouseEnter={() => setHoveredBarIndex(index)}
                                onMouseLeave={() => setHoveredBarIndex(null)}
                              >
                                {/* Hover Detail Popover */}
                                {isHovered && (
                                  <div
                                    className="position-absolute bg-dark text-white rounded px-2 py-1 shadow-sm text-center"
                                    style={{
                                      bottom: `calc(${heightPercent}% + 30px)`,
                                      zIndex: 20,
                                      whiteSpace: 'nowrap',
                                      fontSize: '0.75rem',
                                      pointerEvents: 'none',
                                    }}
                                  >
                                    <div className="fw-bold">{item.nama}</div>
                                    <div>
                                      Nilai: <b>{item.nilai}</b> /{' '}
                                      {SKOR_MAKSIMAL_INSTRUMEN}
                                    </div>
                                    <div className="text-light opacity-75">
                                      Tgl: {item.tanggal}
                                    </div>
                                  </div>
                                )}

                                {/* Score Label Above Bar */}
                                <div
                                  className="fw-bold mb-1"
                                  style={{
                                    fontSize: '0.82rem',
                                    color: '#1f4e78',
                                  }}
                                >
                                  {item.nilai}
                                </div>

                                {/* Bar Fill */}
                                <div
                                  className="bar-fill w-100"
                                  style={{
                                    height: `${Math.max(heightPercent, 2)}%`,
                                    background: getBarColor(item.nilai),
                                    borderRadius: '6px 6px 0 0',
                                    transition:
                                      'height 0.35s ease, transform 0.15s ease',
                                    boxShadow: isHovered
                                      ? '0 4px 12px rgba(31, 78, 120, 0.3)'
                                      : '0 2px 4px rgba(0, 0, 0, 0.08)',
                                    cursor: 'pointer',
                                  }}
                                  title={`${item.nama} — Nilai Akhir: ${item.nilai}`}
                                />
                              </div>
                            );
                          })}
                        </div>

                        {/* X-Axis Labels Row (Nama Sekolah) */}
                        <div
                          className="d-flex justify-content-around position-absolute"
                          style={{
                            left: '12px',
                            right: '12px',
                            bottom: 0,
                            height: '54px',
                            paddingTop: '8px',
                            gap: '16px',
                          }}
                        >
                          {daftarSekolah.map((item) => (
                            <div
                              key={`label_${item.idSekolah || item.no}`}
                              className="text-center d-flex align-items-start justify-content-center"
                              style={{
                                flex: '1 1 0px',
                                maxWidth: '100px',
                                minWidth: '54px',
                              }}
                            >
                              <span
                                className="fw-semibold text-dark"
                                style={{
                                  fontSize: '0.78rem',
                                  lineHeight: '1.15',
                                  wordBreak: 'break-word',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                                title={item.nama}
                              >
                                {item.nama}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* X-Axis Title */}
                    <div className="text-center mt-1">
                      <span
                        className="small fw-semibold text-secondary"
                        style={{ fontSize: '0.78rem' }}
                      >
                        Sumbu X: Nama Sekolah
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* PANEL SAMBUTAN & PINTASAN SUPERVISI BARU */}
      <div className="card card-stat p-4 bg-white text-center py-4">
        <h5 className="fw-semibold">
          Selamat Datang di Aplikasi Supervisi Administrasi Kepala Sekolah
        </h5>
        <p className="text-muted mb-3">
          Silakan klik menu <b>Supervisi Baru</b> di samping untuk memulai
          penilaian dokumen administrasi sekolah binaan.
        </p>
        <div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onNavigateSupervisiBaru}
          >
            <i className="fa-solid fa-plus me-1"></i> Mulai Supervisi Baru
          </button>
        </div>
      </div>
    </div>
  );
};
