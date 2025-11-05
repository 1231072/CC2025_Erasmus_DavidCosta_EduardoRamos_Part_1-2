// A URL base da sua API Spring Boot (ajuste se estiver noutra porta/domínio)
const BASE_URL = 'https://erasmus-cc2025-api.azurewebsites.net/api';

// --- Funções de Autenticação ---

async function registerUser(username, password) {
    const url = `${BASE_URL}/auth/register`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    return response;
}

async function loginUser(username, password) {
    const url = `${BASE_URL}/auth/login`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    if (response.ok) {
        const data = await response.json();
        const jwt = data.token;
        localStorage.setItem('jwtToken', jwt); // Armazena o JWT
        return true;
    }
    return false;
}

function logout() {
    localStorage.removeItem('jwtToken');
}

function getAuthHeader() {
    const token = localStorage.getItem('jwtToken');
    return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

// --- Funções de Consumo de Dados (/api/items) ---

async function fetchItems() {
    const url = `${BASE_URL}/items`;
    const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeader() // Usa o JWT para aceder ao endpoint protegido
    });

    if (response.ok) {
        return await response.json();
    }
    // Lidar com 401 Unauthorized (se o token for inválido/expirado)
    if (response.status === 401) {
        alert("Sessão expirada. Por favor, faça login novamente.");
        logout();
        showView('auth-view');
    }
    return [];
}

async function createItem(name) {
    const url = `${BASE_URL}/items`;
    const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ name: name })
    });
    return response;
}

// Exportar funções necessárias (não é estritamente necessário em Vanilla JS, mas é boa prática)
// Pode simplesmente referenciar as funções globais no ui.js
// Para simplificar, vamos assumir que estas funções são globais.