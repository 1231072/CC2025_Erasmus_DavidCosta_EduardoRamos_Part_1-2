import { useAuth } from "react-oidc-context";
import React, { useState } from "react";

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
      <div style={{ padding: "20px" }}>
        <h2>Bem-vindo, {auth.user?.profile.email}</h2>
        <button onClick={() => callApi("profile")}>Ver Perfil</button>
        <button onClick={() => callApi("data")} style={{ marginLeft: "10px" }}>Aceder Dados</button>
        <button onClick={signOutRedirect} style={{ marginLeft: "10px", color: "red" }}>Sign Out</button>

        {apiData && (
          <div style={{ marginTop: "20px", background: "#eee", padding: "10px" }}>
            <pre>{JSON.stringify(apiData, null, 2)}</pre>
          </div>
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