import { API_BASE_URL } from './api';

export async function listarCategorias() {
  const response = await fetch(`${API_BASE_URL}/categorias/index.php`);
  if (!response.ok) throw new Error('Erro ao listar categorias');
  return response.json();
}