<?php

require_once __DIR__ . '/../config/database.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dados = json_decode(file_get_contents('php://input'), true);
$id = $dados['id'] ?? null;

if (!$id) {
    http_response_code(400);
    echo json_encode([
        'erro' => 'ID da venda é obrigatório.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $pdo->beginTransaction();

    $stmtVenda = $pdo->prepare("SELECT * FROM vendas WHERE id = :id LIMIT 1");
    $stmtVenda->execute([':id' => $id]);
    $venda = $stmtVenda->fetch(PDO::FETCH_ASSOC);

    if (!$venda) {
        throw new Exception('Venda não encontrada.');
    }

    $stmtItens = $pdo->prepare("SELECT * FROM itens_venda WHERE venda_id = :venda_id");
    $stmtItens->execute([':venda_id' => $id]);
    $itens = $stmtItens->fetchAll(PDO::FETCH_ASSOC);

    foreach ($itens as $item) {
        $produto_id = $item['produto_id'];
        $quantidade = (int)$item['quantidade'];

        $stmtProduto = $pdo->prepare("SELECT * FROM produtos WHERE id = :id LIMIT 1");
        $stmtProduto->execute([':id' => $produto_id]);
        $produto = $stmtProduto->fetch(PDO::FETCH_ASSOC);

        if ($produto) {
            $nova_quantidade = (int)$produto['quantidade'] + $quantidade;

            $stmtUpdateProduto = $pdo->prepare("
                UPDATE produtos
                SET quantidade = :quantidade
                WHERE id = :id
            ");

            $stmtUpdateProduto->execute([
                ':quantidade' => $nova_quantidade,
                ':id' => $produto_id
            ]);

            $stmtMovimentacao = $pdo->prepare("
                INSERT INTO movimentacoes_estoque (
                    produto_id,
                    tipo,
                    quantidade,
                    observacao
                ) VALUES (
                    :produto_id,
                    'entrada',
                    :quantidade,
                    :observacao
                )
            ");

            $stmtMovimentacao->execute([
                ':produto_id' => $produto_id,
                ':quantidade' => $quantidade,
                ':observacao' => "Estorno da venda #{$id}"
            ]);
        }
    }

    $stmtConta = $pdo->prepare("DELETE FROM contas_receber WHERE venda_id = :venda_id");
    $stmtConta->execute([':venda_id' => $id]);

    $stmtDeleteItens = $pdo->prepare("DELETE FROM itens_venda WHERE venda_id = :venda_id");
    $stmtDeleteItens->execute([':venda_id' => $id]);

    $stmtDeleteVenda = $pdo->prepare("DELETE FROM vendas WHERE id = :id");
    $stmtDeleteVenda->execute([':id' => $id]);

    $pdo->commit();

    echo json_encode([
        'mensagem' => 'Venda excluída e estoque reprocessado com sucesso.'
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);
    echo json_encode([
        'erro' => 'Erro ao excluir venda',
        'detalhes' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}