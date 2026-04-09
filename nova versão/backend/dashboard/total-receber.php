<?php

require_once __DIR__ . '/../config/database.php';

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

try {
    $pendente = $pdo->query("
        SELECT COALESCE(SUM(valor), 0)
        FROM contas_receber
        WHERE status = 'pendente'
    ")->fetchColumn();

    $pago = $pdo->query("
        SELECT COALESCE(SUM(valor), 0)
        FROM contas_receber
        WHERE status = 'pago'
    ")->fetchColumn();

    $atrasado = $pdo->query("
        SELECT COALESCE(SUM(valor), 0)
        FROM contas_receber
        WHERE status = 'atrasado'
    ")->fetchColumn();

    $qtdPendentes = $pdo->query("
        SELECT COUNT(*)
        FROM contas_receber
        WHERE status = 'pendente'
    ")->fetchColumn();

    $qtdPagos = $pdo->query("
        SELECT COUNT(*)
        FROM contas_receber
        WHERE status = 'pago'
    ")->fetchColumn();

    $qtdAtrasados = $pdo->query("
        SELECT COUNT(*)
        FROM contas_receber
        WHERE status = 'atrasado'
    ")->fetchColumn();

    echo json_encode([
        'valor_pendente' => (float) $pendente,
        'valor_pago' => (float) $pago,
        'valor_atrasado' => (float) $atrasado,
        'quantidade_pendentes' => (int) $qtdPendentes,
        'quantidade_pagos' => (int) $qtdPagos,
        'quantidade_atrasados' => (int) $qtdAtrasados
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'erro' => 'Erro ao carregar contas a receber',
        'detalhes' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}