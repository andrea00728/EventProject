import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useDarkMode } from '../../context/DarkModeContext';
import { MdPeople, MdEvent, MdOutlinePerson, MdTrendingUp } from 'react-icons/md';
import { url } from '../../api/url';

const StatsCard = ({ title, value, icon: Icon, color = 'blue' }) => {
  const { darkMode } = useDarkMode();
  const colors = {
    blue: { bg: 'from-blue-500 to-cyan-500', text: 'text-blue-500' },
    green: { bg: 'from-green-500 to-emerald-500', text: 'text-green-500' },
    orange: { bg: 'from-orange-500 to-yellow-500', text: 'text-orange-500' },
    purple: { bg: 'from-purple-500 to-pink-500', text: 'text-purple-500' },
  };

  return (
    <div className={`rounded-xl p-6 shadow-md border relative overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${colors[color].bg} opacity-10 rounded-full -mr-4 -mt-4`} />
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${colors[color].text} mb-1`}>{title}</p>
          <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</p>
        </div>
        <div className={`p-4 rounded-full bg-gradient-to-br ${colors[color].bg} text-white`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

const UserStats = () => {
  const { darkMode } = useDarkMode();
  const chartRef = useRef(null);
  const registrationsChartRef = useRef(null);
  const chartInstance = useRef(null);
  const registrationsChartInstance = useRef(null);

  const [userRate, setUserRate] = useState('0.0');
  const [organizerRate, setOrganizerRate] = useState('0.0');
  const [eventCount, setEventCount] = useState(0);
  const [revenueTotal, setRevenueTotal] = useState('$0');
  const [eventTypeData, setEventTypeData] = useState([]);
  const [registrationData, setRegistrationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const totalEventMax = 1000;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const rolesRes = await fetch(`${url}/auth/user-role-stats`);
        if (!rolesRes.ok) throw new Error('Erreur récupération des rôles');
        const rolesData = await rolesRes.json();

        const rolesIncluded = ['organisateur', 'caissier', 'cuisinier'];
        const includedCount = rolesData.filter(r => rolesIncluded.includes(r.role)).reduce((acc, r) => acc + r.count, 0);
        const totalUsers = rolesData.reduce((acc, r) => acc + r.count, 0);
        const organizerCount = rolesData.find(r => r.role === 'organisateur')?.count || 0;

        setUserRate(totalUsers > 0 ? ((includedCount / totalUsers) * 100).toFixed(1) : '0.0');
        setOrganizerRate(totalUsers > 0 ? ((organizerCount / totalUsers) * 100).toFixed(1) : '0.0');

        const eventRes = await fetch(`${url}/evenements/countEvent`);
        if (!eventRes.ok) throw new Error('Erreur récupération des événements');
        const totalEvents = await eventRes.json();
        setEventCount(totalEvents);

        const revenueRes = await fetch(`{url}/forfait/revenu-mensuel`);
        if (!revenueRes.ok) throw new Error('Erreur récupération des revenus');
        const revenueData = await revenueRes.json();
        const totalRevenueValue = revenueData.reduce((sum, f) => sum + f.total, 0);
        const formattedRevenue = totalRevenueValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        setRevenueTotal(formattedRevenue);

        const allEventsRes = await fetch('${}/evenements');
        console.log('API Response Status:', allEventsRes.status); 
        const allEvents = await allEventsRes.json();
        console.log('Raw Events Data:', allEvents);

        const counts = {};
        for (let ev of allEvents) {
          counts[ev.type] = (counts[ev.type] || 0) + 1;
        }

        const dataArray = Object.entries(counts).map(([type, count]) => ({
          type,
          count,
        }));

        console.log('Processed eventTypeData:', dataArray); 
        setEventTypeData(dataArray);

        const registrationsRes = await fetch(`${url}/auth/monthly-registrations`);
        if (!registrationsRes.ok) throw new Error('Erreur récupération des inscriptions');
        const registrationsData = await registrationsRes.json();
        setRegistrationData(registrationsData);

        setError(null);
      } catch (err) {
        console.error('Fetch Error:', err);
        setError(err.message || 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const intervalId = setInterval(fetchStats, 30000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    console.log('Current eventTypeData:', eventTypeData); 
    console.log('chartRef.current:', chartRef.current); 
    if (!chartRef.current || eventTypeData.length === 0) {
      console.log('Graph not rendered: chartRef or eventTypeData invalid');
      return;
    }

    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }

    const ctx = chartRef.current.getContext('2d');

    const total = eventTypeData.reduce((acc, e) => acc + e.count, 0);
    const percentages = eventTypeData.map(e => ((e.count / total) * 100).toFixed(1));

    const centerTextPlugin = {
      id: 'centerTextPlugin',
      beforeDraw(chart) {
        const { ctx, width, height } = chart;
        ctx.save();
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = darkMode ? '#E5E7EB' : '#374151';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`Total: ${total}`, width / 2, height / 2);
        ctx.restore();
      }
    };

    const dynamicColors = eventTypeData.map((_, index) => `hsl(${index * 60}, 70%, 50%)`);

    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: eventTypeData.map(e => e.type),
        datasets: [{
          data: eventTypeData.map(e => e.count),
          backgroundColor: dynamicColors,
          borderWidth: 2,
          borderColor: darkMode ? '#4B5563' : '#E5E7EB',
          hoverOffset: 10,
        }],
      },
      options: {
        cutout: '60%',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: darkMode ? '#E5E7EB' : '#374151',
              boxWidth: 15,
              padding: 15,
              font: {
                size: 14,
              },
            },
          },
          datalabels: {
            color: darkMode ? '#E5E7EB' : '#374151',
            formatter: (value, ctx) => `${percentages[ctx.dataIndex]}%`,
            font: { weight: 'bold', size: 14 },
            anchor: 'end',
            align: 'start',
            offset: 10,
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const val = ctx.raw;
                const percent = percentages[ctx.dataIndex];
                return `${ctx.label}: ${val} (${percent}%)`;
              },
              title: (tooltipItems) => tooltipItems[0].label,
            },
            backgroundColor: darkMode ? '#1F2937' : '#FFF',
            titleFont: { size: 16 },
            bodyFont: { size: 14 },
          },
        },
      },
      plugins: [ChartDataLabels, centerTextPlugin],
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [eventTypeData, darkMode]);

  useEffect(() => {
    if (!registrationsChartRef.current || registrationData.length === 0) return;

    if (registrationsChartInstance.current) {
      registrationsChartInstance.current.destroy();
      registrationsChartInstance.current = null;
    }

    const ctx = registrationsChartRef.current.getContext('2d');
    const labels = registrationData.map(item => item.month);
    const data = registrationData.map(item => item.count);

    registrationsChartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Inscriptions',
          data,
          borderColor: '#8B5CF6',
          backgroundColor: 'rgba(139, 92, 246, 0.2)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#8B5CF6',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#8B5CF6',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Évolution des Inscriptions',
            color: darkMode ? '#E5E7EB' : '#374151',
            font: {
              size: 16,
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => `Nouvelles inscriptions: ${context.raw}`,
            },
          },
          datalabels: {
            color: darkMode ? '#E5E7EB' : '#374151',
            anchor: 'end',
            align: 'top',
            formatter: (value) => value,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Nouvelles inscriptions par mois',
              color: darkMode ? '#E5E7EB' : '#374151',
            },
            ticks: {
              color: darkMode ? '#E5E7EB' : '#374151',
              stepSize: 5,
              precision: 0,
            },
            grid: {
              color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            },
          },
          x: {
            ticks: {
              color: darkMode ? '#E5E7EB' : '#374151',
            },
            grid: {
              display: false,
            },
          },
        },
      },
      plugins: [ChartDataLabels],
    });

    return () => {
      if (registrationsChartInstance.current) {
        registrationsChartInstance.current.destroy();
      }
    };
  }, [registrationData, darkMode]);

  const eventPercentage = totalEventMax > 0 ? ((eventCount / totalEventMax) * 100).toFixed(1) : '0.0';
  const bgClass = darkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-800';

  return (
    <div className={`min-h-screen p-6 w-full mx-auto transition duration-500 ${bgClass}`}>
      {loading && <p>Chargement...</p>}
      {error && <p className="text-red-500">Erreur : {error}</p>}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 max-w-5xl mx-auto mb-12">
            <StatsCard title="Taux Utilisateur Total" value={`${userRate}%`} icon={MdPeople} color="blue" />
            <StatsCard title="Taux Organisateur" value={`${organizerRate}%`} icon={MdOutlinePerson} color="orange" />
            <StatsCard title="Événements Créés" value={`${eventPercentage}%`} icon={MdEvent} color="green" />
            <StatsCard title="Revenus Totaux" value={revenueTotal} icon={MdTrendingUp} color="purple" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="rounded-2xl p-6 border shadow-sm bg-white border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">Types d'Événements</h3>
                  <p className="text-sm text-gray-500">Répartition des événements par catégorie</p>
                </div>
                <a href="#" className="text-blue-600 hover:underline text-sm">Voir détails ↗</a>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-full h-64">
                  <canvas ref={chartRef} className="max-w-full h-full"></canvas>
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-6 border shadow-sm bg-white border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">Évolution des Inscriptions</h3>
                </div>
                <div className="relative">
                  <select className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option>3 derniers mois</option>
                    <option>6 derniers mois</option>
                    <option>12 derniers mois</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                    </svg>
                  </div>
                </div>
              </div>
              <div className="h-64 overflow-y-auto">
                <canvas ref={registrationsChartRef} className="max-w-full"></canvas>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserStats;