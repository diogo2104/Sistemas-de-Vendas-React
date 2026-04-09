<?php

require_once __DIR__ . '/../config/database.php';

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

try {
    $totalClientes = $pdo->query("SELECT COUNT(*) FROM clientes")->fetchColumn();
    $totalProdutos = $pdo->query("SELECT COUNT(*) FROM produtos")->fetchColumn();
    $totalVendas = $pdo->query("SELECT COUNT(*) FROM vendas")->fetchColumn();
    $valorTotalVendido = $pdo->query("
        SELECT COALESCE(SUM(valor_total), 0)
        FROM vendas
        WHERE status = 'finalizada'
    ")->fetchColumn();
    $estoqueBaixo = $pdo->query("
        SELECT COUNT(*)
        FROM produtos
        WHERE quantidade <= quantidade_minima
    ")->fetchColumn();

    echo json_encode([
        'total_clientes' => (int) $totalClientes,
        'total_produtos' => (int) $totalProdutos,
        'total_vendas' => (int) $totalVendas,
        'valor_total_vendido' => (float) $valorTotalVendido,
        'produtos_estoque_baixo' => (int) $estoqueBaixo
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'erro' => 'Erro ao carregar resumo do dashboard',
        'detalhes' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}