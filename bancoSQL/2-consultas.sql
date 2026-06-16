# Consultas (Inserts e massa de dados)

#CONSULTA 1 - Join entre 3 tabelas - Exibe as empresas, seus endereços e múltiplas opções de contatos
#USO: Relatórios administrativos
SELECT 
	e.razao_social, e.perfil, en.cidade, en.cep, en.estado, c.tipo_contato, c.contato
FROM empresas e
INNER JOIN enderecos en
    ON e.id_empresa = en.fk_empresa
INNER JOIN contatos c
    ON e.id_empresa = c.fk_empresa
ORDER BY e.razao_social;

#CONSULTA 2 - JOIN - Mostrar as empresas ATIVAS e seus produtos cadastrados ativos
#USO: catálogo interno de produto por fornecedor
SELECT
	e.razao_social, p.nome_produto, p.preco_unitario, p.estoque_atual
FROM empresas e
INNER JOIN produtos p
    ON e.id_empresa = p.fk_vendedor
WHERE e.perfil = 'vendedor' AND
e.status_conta = 'Ativo' AND
p.ativo = TRUE
ORDER BY e.razao_social;

#CONSULTA 3 - GROUP BY+HAVING - Exibe as empresas com faturamento maior que a média
#USO: Identificar fornecedores com melhor desempenho comercial
SELECT
    e.razao_social,
    SUM(ip.subtotal) AS faturamento
FROM itens_pedido ip
INNER JOIN produtos p
    ON ip.fk_produto = p.id_produto
INNER JOIN empresas e
    ON p.fk_vendedor = e.id_empresa
GROUP BY e.id_empresa
HAVING SUM(ip.subtotal) >
(
    SELECT AVG(faturamento)
    FROM
    (
        SELECT SUM(ip2.subtotal) AS faturamento
        FROM itens_pedido ip2
        INNER JOIN produtos p2
            ON ip2.fk_produto = p2.id_produto
        GROUP BY p2.fk_vendedor
    ) media_vendedores
)
ORDER BY faturamento DESC;

#CONSULTA 4 - Filtro por intervalo - Exibe a receita do último mês
#USO: Relatórios Financeiros
SELECT
    month(DATE(data_emissao)) AS mes_venda,
    SUM(total_estimado) AS receita
FROM pedidos
WHERE data_emissao BETWEEN CURRENT_DATE - INTERVAL 12 MONTH AND CURRENT_TIMESTAMP
GROUP BY mes_venda
ORDER BY mes_venda;

#CONSULTA 5 - Categorias com mais produtos
#USO: Relatório de produtos e categorias e índices de venda
SELECT
	c.nome_categoria,
    COUNT(*)
FROM categorias c
INNER JOIN produtos p ON p.fk_categoria = c.id_categoria
GROUP BY c.id_categoria
ORDER BY c.nome_categoria;

#CONSULTA 6 - SUBCONSULTA NOT EXISTS - Exibe empresas que nunca compraram
#USO: Ações de reativação
SELECT
    e.razao_social
FROM empresas e
WHERE e.perfil = 'comprador'
AND NOT EXISTS
(
    SELECT *
    FROM pedidos p
    WHERE p.fk_comprador = e.id_empresa
);

#CONSULTA 7 - AGREGAÇÃO + ORDENAÇÃO - Exibe os produtos mais vendidos
#USO: Verificar tendências de compra
SELECT
    p.nome_produto,
    SUM(ip.quantidade) AS total_vendido
FROM itens_pedido ip
INNER JOIN produtos p ON p.id_produto = ip.fk_produto
GROUP BY p.id_produto
ORDER BY total_vendido DESC;
