<?php

require_once __DIR__ . '/../config/database.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'erro' => 'Método não permitido.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$dados = json_decode(file_get_contents('php://input'), true);

$nome = trim($dados['nome'] ?? '');
$descricao = trim($dados['descricao'] ?? '');
$categoria_id = $dados['categoria_id'] ?? null;
$fornecedor_id = $dados['fornecedor_id'] ?? null;
$quantidade = $dados['quantidade'] ?? 0;
$quantidade_minima = $dados['quantidade_minima'] ?? 0;
$preco_custo = $dados['preco_custo'] ?? null;
$preco_venda = $dados['preco_venda'] ?? null;
$imagem = trim($dados['imagem'] ?? '');
$ativo = isset($dados['ativo']) ? (int) $dados['ativo'] : 1;

if ($nome === '') {
    http_response_code(400);
    echo json_encode([
        'erro' => 'O nome do produto é obrigatório.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!$categoria_id) {
    http_response_code(400);
    echo json_encode([
        'erro' => 'A categoria é obrigatória.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!$fornecedor_id) {
    http_response_code(400);
    echo json_encode([
        'erro' => 'O fornecedor é obrigatório.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($preco_custo === null || $preco_venda === null) {
    http_response_code(400);
    echo json_encode([
        'erro' => 'Preço de custo e preço de venda são obrigatórios.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $stmt = $pdo->prepare("
        INSERT INTO produtos (
            nome,
            descricao,
            categoria_id,
            fornecedor_id,
            quantidade,
            quantidade_minima,
            preco_custo,
            preco_venda,
            imagem,
            ativo
        ) VALUES (
            :nome,
            :descricao,
            :categoria_id,
            :fornecedor_id,
            :quantidade,
            :quantidade_minima,
            :preco_custo,
            :preco_venda,
            :imagem,
            :ativo
        )
    ");

    $stmt->execute([
        ':nome' => $nome,
        ':descricao' => $descricao !== '' ? $descricao : null,
        ':categoria_id' => $categoria_id,
        ':fornecedor_id' => $fornecedor_id,
        ':quantidade' => (int) $quantidade,
        ':quantidade_minima' => (int) $quantidade_minima,
        ':preco_custo' => $preco_custo,
        ':preco_venda' => $preco_venda,
        ':imagem' => $imagem !== '' ? $imagem : null,
        ':ativo' => $ativo
    ]);

    http_response_code(201);
    echo json_encode([
        'mensagem' => 'Produto cadastrado com sucesso.',
        'id' => $pdo->lastInsertId()
    ], JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'erro' => 'Erro ao cadastrar produto',
        'detalhes' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}