import { API_BASE_URL } from './api';

export async function listarProdutos() {
  const response = await fetch(`${API_BASE_URL}/produtos/index.php`);
  if (!response.ok) throw new Error('Erro ao listar produtos');
  return response.json();
}

export async function buscarProduto(id: number) {
  const response = await fetch(`${API_BASE_URL}/produtos/show.php?id=${id}`);
  if (!response.ok) throw new Error('Erro ao buscar produto');
  return response.json();
}

export async function criarProduto(dados: any) {
  const response = await fetch(`${API_BASE_URL}/produtos/store.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });

  if (!response.ok) throw new Error('Erro ao criar produto');
  return response.json();
}

export async function atualizarProduto(dados: any) {
  const response = await fetch(`${API_BASE_URL}/produtos/update.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });

  if (!response.ok) throw new Error('Erro ao atualizar produto');
  return response.json();
}

export async function excluirProduto(id: number) {
  const response = await fetch(`${API_BASE_URL}/produtos/delete.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });

  if (!response.ok) throw new Error('Erro ao excluir produto');
  return response.json();
}