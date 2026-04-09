import { API_BASE_URL } from './api';

export async function listarVendas() {
  const response = await fetch(`${API_BASE_URL}/vendas/index.php`);
  if (!response.ok) throw new Error('Erro ao listar vendas');
  return response.json();
}

export async function buscarVenda(id: number) {
  const response = await fetch(`${API_BASE_URL}/vendas/show.php?id=${id}`);
  if (!response.ok) throw new Error('Erro ao buscar venda');
  return response.json();
}

export async function criarVenda(dados: any) {
  const response = await fetch(`${API_BASE_URL}/vendas/store.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });

  if (!response.ok) throw new Error('Erro ao criar venda');
  return response.json();
};