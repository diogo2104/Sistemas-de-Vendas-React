import { API_BASE_URL } from './api';

export async function buscarResumoDashboard() {
  const response = await fetch(`${API_BASE_URL}/dashboard/resumo.php`);
  if (!response.ok) throw new Error('Erro ao buscar resumo do dashboard');
  return response.json();
}

export async function buscarVendasRecentes() {
  const response = await fetch(`${API_BASE_URL}/dashboard/vendas-recentes.php`);
  if (!response.ok) throw new Error('Erro ao buscar vendas recentes');
  return response.json();
}

export async function buscarEstoqueBaixo() {
  const response = await fetch(`${API_BASE_URL}/dashboard/estoque-baixo.php`);
  if (!response.ok) throw new Error('Erro ao buscar estoque baixo');
  return response.json();
}

export async function buscarTotalReceber() {
  const response = await fetch(`${API_BASE_URL}/dashboard/total-receber.php`);
  if (!response.ok) throw new Error('Erro ao buscar contas a receber');
  return response.json();
}