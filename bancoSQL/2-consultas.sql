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

#CONSULTA 2 - Mesma consulta da anterior, mas exibindo apenas o telefone
#Justificativa: Validar os JOINS da consulta anterior
SELECT 
	e.razao_social, e.perfil, en.cidade, en.cep, en.estado, c.tipo_contato, c.contato
FROM empresas e
INNER JOIN enderecos en
    ON e.id_empresa = en.fk_empresa
INNER JOIN contatos c
    ON e.id_empresa = c.fk_empresa
WHERE c.tipo_contato = 'Telefone'
ORDER BY e.razao_social;

#CONSULTA 3 - JOIN - Mostrar as empresas e seus produtos cadastrados
#USO: catálogo interno de produto por fornecedor
SELECT
	e.razao_social, p.nome_produto, p.preco_unitario, p.estoque_atual
FROM empresas e
INNER JOIN produtos p
    ON e.id_empresa = p.fk_vendedor
WHERE e.perfil = 'vendedor'
ORDER BY e.razao_social;

#CONSULTA 4 - GROUP BY+HAVING - Exibe as empresas com faturamento maior que a média
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

#CONSULTA 5 - Filtro por intervalo - Exibe a receita do último ano
#USO: Relatórios Financeiros
SELECT
    DATE(data_emissao) AS data_venda,
    SUM(total_estimado) AS receita
FROM pedidos
WHERE data_emissao BETWEEN '2025-01-01' AND '2025-12-31'
GROUP BY DATE(data_emissao)
ORDER BY data_venda;

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
