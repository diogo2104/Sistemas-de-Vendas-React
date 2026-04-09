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
$cpf = trim($dados['cpf'] ?? '');
$telefone = trim($dados['telefone'] ?? '');
$email = trim($dados['email'] ?? '');
$endereco = trim($dados['endereco'] ?? '');

if ($nome === '') {
    http_response_code(400);
    echo json_encode([
        'erro' => 'O campo nome é obrigatório.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $stmt = $pdo->prepare("
        INSERT INTO clientes (nome, cpf, telefone, email, endereco)
        VALUES (:nome, :cpf, :telefone, :email, :endereco)
    ");

    $stmt->execute([
        ':nome' => $nome,
        ':cpf' => $cpf !== '' ? $cpf : null,
        ':telefone' => $telefone !== '' ? $telefone : null,
        ':email' => $email !== '' ? $email : null,
        ':endereco' => $endereco !== '' ? $endereco : null
    ]);

    http_response_code(201);
    echo json_encode([
        'mensagem' => 'Cliente cadastrado com sucesso.',
        'id' => $pdo->lastInsertId()
    ], JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'erro' => 'Erro ao cadastrar cliente',
        'detalhes' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}