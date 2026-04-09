<?php

require_once __DIR__ . '/../config/database.php';

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

try {
    $stmt = $pdo->query("SELECT * FROM fornecedores ORDER BY id DESC");
    $fornecedores = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($fornecedores, JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'erro' => 'Erro ao buscar fornecedores',
        'detalhes' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}