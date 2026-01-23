import React, { useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import {
    processLatestDataForTable,
    processHistoricalDataForLineChart,
    processHistoricalDataForBarChart,
    processHistoricalDataForAverages // Nova função para médias e contagem
} from '../utils/dataProcessor';

import LatestDataTable from './LatestDataTable';
import LinearChartComponent from './LinearChartComponent';
import BarChartComponent from './BarChartComponent';

const Dashboard = () => {
    const auth = useAuth();
    const [latestData, setLatestData] = useState([]);
    const [historicalLineChartData, setHistoricalLineChartData] = useState([]);
    const [barChartData, setBarChartData] = useState([]);
    const [avgData, setAvgData] = useState([]); // State para médias e contagem
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userRole, setUserRole] = useState('user');

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!auth.isAuthenticated) return;

            // O ID do dispositivo e permissões viajam no id_token da AWS
            const token = auth.user?.id_token;

            try {
                const response = await fetch('http://localhost:8080/api/dashboard-data', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

                const data = await response.json();
                setUserRole(data.role);

                // 1. Processar dados para a Tabela (Vista 1)
                if (data.latest) {
                    const latestArray = Array.isArray(data.latest) ? data.latest : [data.latest];
                    setLatestData(processLatestDataForTable(latestArray));
                }

                // 2. Processar dados para Gráficos Históricos (Vistas 2 a 5)
                if (data.historical) {
                    const deviceIdFilter = data.role === 'user' ? data.device_id : null;

                    // Vista 2: Tendência (Linha)
                    setHistoricalLineChartData(processHistoricalDataForLineChart(data.historical, deviceIdFilter));

                    // Vista 3: Total por Device (Barras)
                    setBarChartData(processHistoricalDataForBarChart(data.historical));

                    // Vistas 4 e 5: Médias e Performance
                    setAvgData(processHistoricalDataForAverages(data.historical));
                }

            } catch (e) {
                console.error("Erro ao carregar dados:", e);
                setError("Não foi possível ligar à base de dados.");
            } finally {
                setLoading(false);
            }
        };

        if (!auth.isLoading) fetchDashboardData();
    }, [auth.isAuthenticated, auth.isLoading, auth.user]);

    if (auth.isLoading) return <div style={{ padding: '20px' }}>A verificar credenciais AWS...</div>;
    if (!auth.isAuthenticated) return <div style={{ padding: '20px' }}>Acesso Negado. Faça Login.</div>;
    if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;

    return (
        <div style={{ padding: '30px', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                <h1>Energy Analytics Dashboard</h1>
                <button onClick={() => auth.signoutRedirect()} style={{ backgroundColor: '#ff4d4d', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}>Sair</button>
            </header>

            {/* VISTA 1: Tabela de Estado Recente */}
            <section style={{ marginBottom: '40px' }}>
                <LatestDataTable data={latestData} />
            </section>

            {/* GRID PARA GRÁFICOS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '25px' }}>

                {/* VISTA 2: Gráfico de Tendência (Linha) */}
                <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <LinearChartComponent
                        data={historicalLineChartData}
                        title="Tendência de Consumo Temporal (kWh)"
                    />
                </div>

                {/* VISTA 3: Consumo Total (Barras) */}
                <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <BarChartComponent
                        data={barChartData}
                        title={userRole === 'admin' ? "Total kWh por Dispositivo" : "O Seu Consumo Acumulado"}
                    />
                </div>

                {/* VISTA 4: Consumo Médio (Barras) - EXTRA */}
                <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <BarChartComponent
                        data={avgData.map(d => ({ name: d.name, kwhTotal: d.mediaKwh }))}
                        title="Consumo Médio por Leitura (kWh)"
                    />
                </div>

                {/* VISTA 5: Volume de Dados (Barras) - EXTRA */}
                <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <BarChartComponent
                        data={avgData.map(d => ({ name: d.name, kwhTotal: d.totalRegistos }))}
                        title="Nº Total de Registos Processados"
                    />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;