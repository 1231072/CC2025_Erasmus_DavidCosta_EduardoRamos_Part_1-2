import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Activity, Database, ShieldCheck, Cpu } from 'lucide-react';

const Dashboard = ({ data, profile }) => {
    // Cálculo de métricas rápidas para os cards
    const totalReadings = data.length;
    const avgReading = totalReadings > 0
        ? (data.reduce((acc, curr) => acc + curr.sensor_reading, 0) / totalReadings).toFixed(1)
        : 0;

    return (
        <div style={{ padding: '20px', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
            {/* Header com Info do Perfil */}
            <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ margin: 0, color: '#2c3e50' }}>Monitorização ETL Azure</h1>
                    <p style={{ color: '#7f8c8d' }}>Visualização de telemetria em tempo real</p>
                </div>
                <div style={{ textAlign: 'right', backgroundColor: '#fff', padding: '10px 20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <ShieldCheck size={18} style={{ color: profile.role === 'admin' ? '#e74c3c' : '#27ae60' }} />
                    <span style={{ marginLeft: '8px', fontWeight: 'bold' }}>{profile.role.toUpperCase()}</span>
                    <div style={{ fontSize: '0.8em', color: '#95a5a6' }}>Device: {profile.deviceId}</div>
                </div>
            </header>

            {/* Grid de Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <StatCard icon={<Database color="#3498db"/>} title="Total Registos" value={totalReadings} />
                <StatCard icon={<Activity color="#e67e22"/>} title="Média Sensores" value={`${avgReading}°C`} />
                <StatCard icon={<Cpu color="#9b59b6"/>} title="Dispositivos Ativos" value={profile.role === 'admin' ? "Múltiplos" : "1"} />
            </div>

            {/* Gráfico Principal */}
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
                <h3 style={{ marginBottom: '20px' }}>Histórico de Leituras (Sensor Reading)</h3>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="id" label={{ value: 'ID do Registo', position: 'insideBottom', offset: -5 }} />
                            <YAxis />
                            <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                            <Line type="monotone" dataKey="sensor_reading" stroke="#3498db" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, title, value }) => (
    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ backgroundColor: '#f8f9fa', padding: '12px', borderRadius: '10px' }}>{icon}</div>
        <div>
            <div style={{ fontSize: '0.85em', color: '#95a5a6' }}>{title}</div>
            <div style={{ fontSize: '1.4em', fontWeight: 'bold', color: '#2c3e50' }}>{value}</div>
        </div>
    </div>
);

export default Dashboard;