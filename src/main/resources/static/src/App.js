import { useAuth } from "react-oidc-context";
import React, { useState } from "react";
import Dashboard from "./components/Dashboard";

function App() {
  const auth = useAuth();
  const [apiData, setApiData] = useState(null);

  // LINHA 11: Certifique-se de que a sintaxe é exatamente esta:
  const signOutRedirect = () => {
    const clientId = "2jumpgbb0cn80gqhfg2tth8f8";
    const logoutUri = "http://localhost:3000";
    const cognitoDomain = "https://eu-central-1k4a9quibh.auth.eu-central-1.amazoncognito.com";

    auth.removeUser();
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  const callApi = async (endpoint) => {
    try {
      // IMPORTANTE: Use id_token para ver o custom:device_id no backend
      const token = auth.user?.id_token;
      const response = await fetch(`http://localhost:8080/api/${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setApiData(data);
      }
    } catch (error) {
      console.error("Erro na API:", error);
    }
  };

  if (auth.isLoading) return <div>Loading...</div>;

  if (auth.isAuthenticated) {
    return (
        <div>
            <nav style={{ padding: '10px', background: '#2c3e50', color: 'white', display: 'flex', justifyContent: 'space-between' }}>
                <span>Erasmus Cloud Portal</span>
                <button onClick={signOutRedirect} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '5px', cursor: 'pointer' }}>Sair</button>
            </nav>

            {/* Botões de controle para teste */}
            <div style={{ padding: '10px 20px' }}>
                 <button onClick={() => callApi("data")}>Atualizar Dados do Azure</button>
            </div>

            {apiData && (
                <Dashboard
                    data={apiData.data}
                    profile={{ role: apiData.role, deviceId: apiData.device_id }}
                />
            )}
        </div>
    );

  }

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Sistema Erasmus Cloud</h1>
      <button onClick={() => auth.signinRedirect()}>Sign In com Cognito</button>
    </div>
  );
}

export default App;