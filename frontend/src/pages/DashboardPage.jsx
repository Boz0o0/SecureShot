import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import supabase from '../services/supabaseClient';
import toast, { Toaster } from 'react-hot-toast';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [stats, setStats] = useState({ photos: 0, ventes: 0, revenus: 0 });
  const [salesData, setSalesData] = useState([]);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    if (!loading && !user) navigate('/login');
    if (user) {
      fetchStats();
      fetchGraphData();
    }
  }, [user, loading]);

  const fetchStats = async () => {
    const userId = user.id;

    try {
      const { count: photoCount } = await supabase
        .from('photos')
        .select('*', { count: 'exact', head: true })
        .eq('photographer_id', userId);

      const { count: soldPhotoCount } = await supabase
        .from('sales')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', userId);

      const { data: revenueData, error } = await supabase
        .from('sales')
        .select('amount')
        .eq('seller_id', userId);

      if (error) throw error;

      let totalRevenue = 0;
      if (revenueData) {
        totalRevenue = revenueData.reduce((sum, sale) => sum + (sale.amount || 0), 0);
      }

      setStats({
        photos: (photoCount || 0) + (soldPhotoCount || 0),
        ventes: soldPhotoCount || 0,
        revenus: totalRevenue
      });
    } catch (err) {
      toast.error('Erreur lors du chargement des statistiques.');
    }
  };

  const fetchGraphData = async () => {
    const userId = user.id;

    try {
      const { data, error } = await supabase
        .from('sales')
        .select('sale_date, amount')
        .eq('seller_id', userId);

      if (error) throw error;

      const aggregated = data.reduce((acc, sale) => {
        const dateKey = new Date(sale.sale_date).toISOString().split('T')[0];
        if (!acc[dateKey]) acc[dateKey] = { date: dateKey, revenus: 0, ventes: 0 };
        acc[dateKey].revenus += sale.amount || 0;
        acc[dateKey].ventes += 1;
        return acc;
      }, {});

      const result = Object.values(aggregated).sort((a, b) => new Date(a.date) - new Date(b.date));
      setSalesData(result);
    } catch (err) {
      toast.error("Erreur lors du chargement des données de ventes.");
      setSalesData([]);
    }
  };

  const filteredSalesData = useMemo(() => {
    if (!salesData || salesData.length === 0) return [];

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - period);

    return salesData.filter(({ date }) => new Date(date) >= cutoffDate);
  }, [salesData, period]);

  if (loading || !user) return null;

  const pseudo = user.user_metadata?.pseudo || 'utilisateur';

  return (
    <div style={{ position: 'relative', zIndex: 0 }}>
      <Toaster position="top-center" />

      {/* Background */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'linear-gradient(135deg, #0f0f0f, #1e293b)',
          zIndex: -1,
        }}
      >
        <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '300px', height: '300px', backgroundColor: '#3b82f6', opacity: 0.1, transform: 'rotate(45deg)', borderRadius: '2rem', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '-120px', right: '-120px', width: '350px', height: '350px', backgroundColor: '#ec4899', opacity: 0.1, transform: 'rotate(-30deg)', borderRadius: '1rem', filter: 'blur(100px)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: '100px', height: '100px', backgroundColor: '#10b981', opacity: 0.1, transform: 'translate(-50%, -50%) rotate(15deg)', borderRadius: '50%', filter: 'blur(50px)' }} />
      </div>

      <div style={{ padding: '2rem', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📁 Mon Espace</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: '#9ca3af' }}>
          Bonjour <strong>{pseudo}</strong> ! Voici un aperçu de votre activité :
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          <StatCard title="📸 Photos mises en ligne" value={stats.photos} />
          <StatCard title="🛒 Ventes" value={stats.ventes} />
          <StatCard title="💰 Revenus (€)" value={stats.revenus.toFixed(2)} />
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
          <button onClick={() => navigate('/upload')} style={actionButtonStyle}>
            ➕ Ajouter une photo
          </button>
          <button onClick={() => navigate('/gallery')} style={actionButtonStyle}>
            🌐 Voir la galerie
          </button>
        </div>

        {/* Sélecteur de période */}
        <div style={{ marginBottom: '1.5rem', color: 'white', fontWeight: '600', fontSize: '1.1rem' }}>
          Période :{' '}
          <select
            value={period}
            onChange={e => setPeriod(Number(e.target.value))}
            style={{
              backgroundColor: '#1f2937',
              border: '1px solid #334155',
              color: 'white',
              borderRadius: '0.5rem',
              padding: '0.25rem 0.5rem',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            <option value={7}>7 jours</option>
            <option value={30}>30 jours</option>
            <option value={90}>90 jours</option>
            <option value={365}>1 an</option>
          </select>
        </div>

        {/* Graphiques */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', flexWrap: 'wrap' }}>
          <ChartCard title="💸 Revenus journaliers (€)">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filteredSalesData}>
                <CartesianGrid stroke="#334155" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Line type="monotone" dataKey="revenus" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="📈 Ventes journalières">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filteredSalesData}>
                <CartesianGrid stroke="#334155" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Line type="monotone" dataKey="ventes" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div style={{
      background: '#1f2937',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      border: '1px solid #334155',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#9ca3af' }}>{title}</div>
      <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>{value}</div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div style={{
      background: '#1f2937',
      borderRadius: '0.75rem',
      padding: '1rem',
      border: '1px solid #334155',
      color: 'white'
    }}>
      <div style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600', color: '#9ca3af' }}>{title}</div>
      {children}
    </div>
  );
}

const actionButtonStyle = {
  background: 'linear-gradient(to right, #6366f1, #3b82f6)',
  border: 'none',
  color: 'white',
  padding: '0.75rem 1.5rem',
  borderRadius: '0.75rem',
  cursor: 'pointer',
  fontSize: '1rem',
  fontWeight: '500',
};
