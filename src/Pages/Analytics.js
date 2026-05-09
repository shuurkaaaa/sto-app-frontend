import React from 'react';
import { StatsCards } from '../Components/AnalyticsComponents/StatsCards';
import { Leaderboard } from '../Components/AnalyticsComponents/Leaderboard';
import { PopularServices } from '../Components/AnalyticsComponents/PopularServices';
import { RevenueChart } from '../Components/AnalyticsComponents/RevenueChart';
import { useAnalytics } from '../Context/AnalyticsContext';

const Analytics = () => {
  const { loading, error, timeRange, setTimeRange } = useAnalytics();

  const periodBtnClass = (range) =>
    `btn btn-sm fw-semibold mx-1 px-3 py-2 rounded-3 border-0 ${timeRange === range ? 'text-white' : 'sto-text-muted'}`;
  const periodBtnStyle = (range) => ({
    background: timeRange === range ? 'var(--sto-accent-2)' : 'transparent',
    boxShadow: timeRange === range ? '0 4px 12px rgba(59,130,246,.3)' : 'none',
  });

  if (loading) {
    return (
      <div className="sto-page d-flex justify-content-center align-items-center">
        <div className="text-center">
          <h2 className="text-light mb-2">Завантаження даних OneWayLogistic...</h2>
          <div
            className="loader mx-auto my-4"
            style={{
              border: '4px solid var(--sto-bg-2)',
              borderTop: '4px solid var(--sto-accent-2)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              animation: 'spin 1s linear infinite',
            }}
          />
          <p className="sto-text-muted">Готуємо звітність СТО</p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sto-page text-center" style={{ paddingTop: '100px' }}>
        <h2 className="sto-text-danger mb-2" style={{ fontSize: '32px' }}>Помилка завантаження</h2>
        <p className="sto-text-muted mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="sto-btn sto-btn-primary">
          Оновити дані
        </button>
      </div>
    );
  }

  return (
    <div className="sto-page">
      <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-4">
        <div>
          <h1 className="m-0 text-light fw-bold" style={{ fontSize: '32px', letterSpacing: '-0.5px' }}>
            Аналітика сервісу
          </h1>
          <p className="sto-text-muted mt-1 mb-0">Звітність про роботу СТО в реальному часі</p>
        </div>

        <div
          className="d-flex border"
          style={{ background: 'var(--sto-bg-2)', padding: '5px', borderRadius: '12px', borderColor: 'var(--sto-border)' }}
        >
          <button onClick={() => setTimeRange('day')} className={periodBtnClass('day')} style={periodBtnStyle('day')}>День</button>
          <button onClick={() => setTimeRange('week')} className={periodBtnClass('week')} style={periodBtnStyle('week')}>Тиждень</button>
          <button onClick={() => setTimeRange('month')} className={periodBtnClass('month')} style={periodBtnStyle('month')}>Місяць</button>
        </div>
      </div>

      <StatsCards />

      <div
        className="d-grid mt-4"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '25px', alignItems: 'start' }}
      >
        <div className="sto-section h-100">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="m-0 text-light" style={{ fontSize: '18px' }}>Рейтинг майстрів</h3>
            <span className="sto-text-dim small px-3 py-1 rounded-pill" style={{ background: 'var(--sto-bg-2)' }}>ТОП-5</span>
          </div>
          <Leaderboard />
        </div>

        <div className="sto-section h-100">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="m-0 text-light" style={{ fontSize: '18px' }}>Популярні послуги</h3>
            <span className="sto-text-dim small px-3 py-1 rounded-pill" style={{ background: 'var(--sto-bg-2)' }}>За попитом</span>
          </div>
          <PopularServices />
        </div>

        <div className="sto-section mt-2" style={{ gridColumn: '1 / -1' }}>
          <h3 className="sto-section-title">Динаміка прибутку</h3>
          <div
            className="rounded-3 p-3"
            style={{ width: '100%', height: '350px', background: 'rgba(30,41,59,0.2)' }}
          >
            <RevenueChart />
          </div>
        </div>
      </div>

      <footer className="text-center mt-5 sto-text-dim small">
        OneWayLogistic Analytics System © 2026
      </footer>
    </div>
  );
};

export default Analytics;
