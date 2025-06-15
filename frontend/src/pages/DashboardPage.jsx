import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import supabase from '../services/supabaseClient';
import toast, { Toaster } from 'react-hot-toast';
import UserMenu from '../components/UserMenu.jsx';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

import '../styles/pages/DashboardPage.css';

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
    <div className="dashboard-page">
      <Toaster position="top-center" />

      {/* Navbar utilisateur en haut à droite */}
      <div className="dashboard-navbar">
        <UserMenu />
      </div>

      {/* Background */}
      <div className="dashboard-background">
        <div className="bg-blue-blur" />
        <div className="bg-pink-blur" />
        <div className="bg-green-blur" />
      </div>

      <div className="dashboard-content">
        <h1 className="dashboard-title">📁 Mon Espace</h1>
        <p className="dashboard-greeting">
          Bonjour <strong>{pseudo}</strong> ! Voici un aperçu de votre activité :
        </p>

        <div className="dashboard-stats-grid">
          <StatCard title="📸 Photos mises en ligne" value={stats.photos} />
          <StatCard title="🛒 Ventes" value={stats.ventes} />
          <StatCard title="💰 Revenus (€)" value={stats.revenus.toFixed(2)} />
        </div>

        <div className="dashboard-action-buttons">
          <button onClick={() => navigate('/upload')} className="action-button">
            ➕ Ajouter une photo
          </button>
          <button onClick={() => navigate('/gallery')} className="action-button">
            🌐 Voir la galerie
          </button>
        </div>

        {/* Sélecteur de période */}
        <div className="dashboard-period-select">
          Période :{' '}
          <select
            value={period}
            onChange={e => setPeriod(Number(e.target.value))}
            className="period-select"
          >
            <option value={7}>7 jours</option>
            <option value={30}>30 jours</option>
            <option value={90}>90 jours</option>
            <option value={365}>1 an</option>
          </select>
        </div>

        {/* Graphiques */}
        <div className="dashboard-charts-grid">
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
    <div className="stat-card">
      <div className="stat-title">{title}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="chart-card">
      <div className="chart-title">{title}</div>
      {children}
    </div>
  );
}
