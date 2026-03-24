import API_URL from './api';

const API_BASE_URL = `${API_URL}/admin`;

const normalizeAdminRequestError = (error) => {
  if (error instanceof TypeError) {
    return new Error(
      'Falha de conexao com a API do painel. Verifique se o backend publicado liberou CORS para este dominio.'
    );
  }

  return error;
};

const parseApiResponse = async (response) => {
  const responseText = await response.text();
  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    throw new Error(`A API de login nao respondeu em JSON. Verifique se o backend esta rodando em ${API_BASE_URL}.`);
  }

  try {
    return JSON.parse(responseText);
  } catch (error) {
    throw new Error('A resposta da API de login veio invalida. Confira o backend do admin.');
  }
};

export const loginAdmin = async (credentials) => {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
  } catch (error) {
    throw normalizeAdminRequestError(error);
  }

  const data = await parseApiResponse(response);

  if (!response.ok) {
    throw new Error(data.error || 'Nao foi possivel entrar no painel.');
  }

  return data;
};

export const validateAdminSession = async () => {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/session`, {
      credentials: 'include'
    });
  } catch (error) {
    throw normalizeAdminRequestError(error);
  }

  if (!response.ok) {
    return { authenticated: false };
  }

  const data = await parseApiResponse(response);
  return { authenticated: true, ...data };
};

export const logoutAdmin = async () => {
  try {
    await fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
      credentials: 'include'
    });
  } catch (error) {
    throw normalizeAdminRequestError(error);
  }
};
