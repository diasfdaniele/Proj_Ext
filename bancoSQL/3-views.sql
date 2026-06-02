#Views (1,0 pt)

#View 1 - Relatório dos produtos de empresas ativas
#USO: Simplificar JOIN
CREATE OR REPLACE VIEW vw_produtos_categorias AS
SELECT
    p.id_produto, p.nome_produto, c.nome_categoria, p.preco_unitario, p.estoque_atual
FROM produtos p
INNER JOIN categorias c
    ON p.fk_categoria = c.id_categoria;
    
#Verificação
SELECT * FROM vw_produtos_categorias;

#View 2: Relatório de faturamento por empresa vendedora
#USO: Relatórios e dashboards
CREATE OR REPLACE VIEW vw_faturamento_vendedor AS
SELECT
    e.razao_social,
    SUM(ip.subtotal) AS faturamento
FROM empresas e
INNER JOIN produtos p
    ON e.id_empresa = p.fk_vendedor
INNER JOIN itens_pedido ip
    ON p.id_produto = ip.fk_produto
GROUP BY e.id_empresa;

#Verificação
SELECT * FROM vw_faturamento_vendedor;

#VIEW 3 - Exibição de dados seguros para os usuários
#USO: útil em exibições públicas, pois protege os dados pessoais
CREATE VIEW vw_empresas_publicas AS
SELECT
    e.razao_social, e.site, en.cidade, en.estado,
    GROUP_CONCAT(c.contato SEPARATOR ' | ') AS contatos
FROM empresas e
LEFT JOIN enderecos en
    ON e.id_empresa = en.fk_empresa
LEFT JOIN contatos c
    ON e.id_empresa = c.fk_empresa
GROUP BY
    e.id_empresa, e.razao_social, e.site, en.cidade, en.estado;

#Verificação
SELECT * FROM vw_empresas_publicas;

#VIEW 4 - Parametrizavel
#USO: Facilita pesquisas com filtros comuns
CREATE VIEW vw_catalogo_produtos AS
SELECT
    p.id_produto, p.nome_produto, p.preco_unitario, c.nome_categoria, e.razao_social
FROM produtos p
INNER JOIN categorias c
    ON p.fk_categoria = c.id_categoria
INNER JOIN empresas e
    ON p.fk_vendedor = e.id_empresa;
    
#Verificação
SELECT *
FROM vw_catalogo_produtos
WHERE nome_categoria = 'Mobilidade';

