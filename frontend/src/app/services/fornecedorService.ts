import { API_BASE_URL } from './api';

export async function listarFornecedores() {
  const response = await fetch(`${API_BASE_URL}/fornecedores/index.php`);
  if (!response.ok) throw new Error('Erro ao listar fornecedores');
  return response.json();
}