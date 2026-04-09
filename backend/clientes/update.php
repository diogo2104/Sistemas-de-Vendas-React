<?php

require_once __DIR__ . '/../config/database.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dados = json_decode(file_get_contents('php://input'), true);

$id = $dados['id'] ?? null;
$nome = trim($dados['nome'] ?? '');
$cpf = trim($dados['cpf'] ?? '');
$telefone = trim($dados['telefone'] ?? '');
$email = trim($dados['email'] ?? '');
$endereco = trim($dados['endereco'] ?? '');

if (!$id) {
    http_response_code(400);
    echo json_encode([
        'erro' => 'ID do cliente é obrigatório.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($nome === '') {
    http_response_code(400);
    echo json_encode([
        'erro' => 'O campo nome é obrigatório.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $stmt = $pdo->prepare("
        UPDATE clientes
        SET nome = :nome,
            cpf = :cpf,
            telefone = :telefone,
            email = :email,
            endereco = :endereco
        WHERE id = :id
    ");

    $stmt->execute([
        ':id' => $id,
        ':nome' => $nome,
        ':cpf' => $cpf !== '' ? $cpf : null,
        ':telefone' => $telefone !== '' ? $telefone : null,
        ':email' => $email !== '' ? $email : null,
        ':endereco' => $endereco !== '' ? $endereco : null
    ]);

    echo json_encode([
        'mensagem' => 'Cliente atualizado com sucesso.'
    ], JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'erro' => 'Erro ao atualizar cliente',
        'detalhes' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}