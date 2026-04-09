import { API_BASE_URL } from './api';

export async function listarClientes() {
  try {
    const url = `${API_BASE_URL}/clientes/index.php`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    const texto = await response.text();

    console.log('URL CLIENTES:', url);
    console.log('STATUS CLIENTES:', response.status);
    console.log('RESPOSTA CLIENTES:', texto);

    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}: ${texto}`);
    }

    if (!texto.trim()) {
      return [];
    }

    try {
      return JSON.parse(texto);
    } catch {
      throw new Error(`Resposta inválida da API: ${texto}`);
    }
  } catch (error) {
    console.error('Erro real ao listar clientes:', error);
    throw error;
  }
}

export async function buscarCliente(id: number) {
  const response = await fetch(`${API_BASE_URL}/clientes/show.php?id=${id}`);
  const texto = await response.text();

  if (!response.ok) throw new Error(`Erro ao buscar cliente: ${texto}`);
  return JSON.parse(texto);
}

export async function criarCliente(dados: {
  nome: string;
  cpf?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/clientes/store.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(dados),
  });

  const texto = await response.text();

  if (!response.ok) throw new Error(`Erro ao criar cliente: ${texto}`);
  return JSON.parse(texto);
}

export async function atualizarCliente(dados: {
  id: number;
  nome: string;
  cpf?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/clientes/update.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(dados),
  });

  const texto = await response.text();

  if (!response.ok) throw new Error(`Erro ao atualizar cliente: ${texto}`);
  return JSON.parse(texto);
}

export async function excluirCliente(id: number) {
  const response = await fetch(`${API_BASE_URL}/clientes/delete.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ id }),
  });

  const texto = await response.text();

  if (!response.ok) throw new Error(`Erro ao excluir cliente: ${texto}`);
  return JSON.parse(texto);
}