import React from 'react';
import { StatsCards } from '../Components/AnalyticsComponents/StatsCards';
import { Leaderboard } from '../Components/AnalyticsComponents/Leaderboard';
import { PopularServices } from '../Components/AnalyticsComponents/PopularServices';
import { RevenueChart } from '../Components/AnalyticsComponents/RevenueChart';
import { analyticsStyles } from '../Components/AnalyticsComponents/AnalyticsStyles';
import { useAnalytics } from '../Context/AnalyticsContext';

const Analytics = () => {
  const { loading, error, timeRange, setTimeRange } = useAnalytics();

  // Допоміжна функція для стилізації активної кнопки періоду
  const getPeriodButtonStyle = (range) => ({
    padding: '8px 20px',
    backgroundColor: timeRange === range ? '#3B82F6' : '#1E293B',
    color: timeRange === range ? '#FFFFFF' : '#94A3B8',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    boxShadow: timeRange === range ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none'
  });

  if (loading) {
    return (
      <div style={{ 
        padding: '30px', 
        backgroundColor: '#0F172A', 
        minHeight: '100vh', 
        color: '#94A3B8',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
           <h2 style={{ color: '#F1F5F9', marginBottom: '10px' }}>Завантаження даних OneWayLogistic...</h2>
           <div className="loader" style={{ margin: '20px auto', border: '4px solid #1E293B', borderTop: '4px solid #3B82F6', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
           <p>Готуємо звітність СТО</p>
           <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '30px', color: '#F87171', backgroundColor: '#0F172A', minHeight: '100vh', textAlign: 'center', paddingTop: '100px' }}>
        <h2 style={{ fontSize: '32px', marginBottom: '10px' }}>Помилка завантаження</h2>
        <p style={{ color: '#94A3B8', marginBottom: '25px' }}>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          style={{ 
            padding: '12px 30px', 
            cursor: 'pointer',
            backgroundColor: '#3B82F6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '16px'
          }}
        >
          Оновити дані
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px', backgroundColor: '#0F172A', minHeight: '100vh', color: '#F1F5F9' }}>
      {/* Заголовок та фільтри */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-end', 
        marginBottom: '40px',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <h1 style={{ margin: 0, color: '#F1F5F9', fontSize: '32px', fontWeight: 'bold', letterSpacing: '-0.5px' }}>
            Аналітика сервісу
          </h1>
          <p style={{ color: '#94A3B8', marginTop: '8px', fontSize: '16px' }}>
            Звітність про роботу СТО в реальному часі
          </p>
        </div>

        {/* Перемикач періодів */}
        <div style={{ 
          display: 'flex', 
          backgroundColor: '#1E293B', 
          padding: '5px', 
          borderRadius: '12px',
          border: '1px solid #334155'
        }}>
          <button onClick={() => setTimeRange('day')} style={getPeriodButtonStyle('day')}>День</button>
          <button onClick={() => setTimeRange('week')} style={getPeriodButtonStyle('week')}>Тиждень</button>
          <button onClick={() => setTimeRange('month')} style={getPeriodButtonStyle('month')}>Місяць</button>
        </div>
      </div>
      
      {/* Картки статистики */}
      <StatsCards />

      {/* Основні звіти */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', 
        gap: '25px',
        alignItems: 'start',
        marginTop: '30px'
      }}>
        
        {/* Рейтинг майстрів */}
        <div style={{ ...analyticsStyles.section, height: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ ...analyticsStyles.sectionTitle, margin: 0 }}>Рейтинг майстрів</h3>
            <span style={{ fontSize: '12px', color: '#64748B', backgroundColor: '#1E293B', padding: '4px 10px', borderRadius: '20px' }}>ТОП-5</span>
          </div>
          <Leaderboard />
        </div>

        {/* Популярні послуги */}
        <div style={{ ...analyticsStyles.section, height: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ ...analyticsStyles.sectionTitle, margin: 0 }}>Популярні послуги</h3>
            <span style={{ fontSize: '12px', color: '#64748B', backgroundColor: '#1E293B', padding: '4px 10px', borderRadius: '20px' }}>За попитом</span>
          </div>
          <PopularServices />
        </div>

        {/* Графік прибутку */}
        <div style={{ ...analyticsStyles.section, gridColumn: '1 / -1', marginTop: '10px' }}>
          <h3 style={{ ...analyticsStyles.sectionTitle, marginBottom: '25px' }}>Динаміка прибутку</h3>
          <div style={{ width: '100%', height: '350px', backgroundColor: 'rgba(30, 41, 59, 0.2)', borderRadius: '12px', padding: '15px' }}>
            <RevenueChart />
          </div>
        </div>
      </div>

      <footer style={{ marginTop: '50px', textAlign: 'center', color: '#475569', fontSize: '13px' }}>
        OneWayLogistic Analytics System © 2026
      </footer>
    </div>
  );
};

export default Analytics;