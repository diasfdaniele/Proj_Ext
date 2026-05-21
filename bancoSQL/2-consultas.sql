# Consultas (Inserts e massa de dados (1,0 pt)) - 1pt

#Mostrar as empresas ativas, seus endereços e contatos
select e.nome_fantasia, en.cep, c.contato from empresas e
inner join enderecos en on e.id_empresa = en.fk_empresa
inner join contatos c on e.id_empresa = c.fk_empresa
where e.status_conta = 'Ativo';

#Mostrar as empresas ativas e seus produtos
select e.nome_fantasia, p.nome_produto, p.preco_unitario from empresas e
inner join produtos p on e.id_empresa = p.fk_vendedor
where e.status_conta = 'Ativo';

#Mostrar as empresas com faturamento maior que a média de outras ativas
select e.nome_fantasia, sum(ip.preco_venda) as 'Faturamento' from itens_pedido ip
inner join produtos p on ip.fk_produto = p.id_produto
inner join empresas e on e.id_empresa = p.fk_vendedor
where e.status_conta = 'Ativo'
group by e.id_empresa
having sum(ip.preco_venda) > (select avg(ip.preco_venda) as 'Faturamento' from itens_pedido ip
inner join produtos p on ip.fk_produto = p.id_produto
inner join empresas e on e.id_empresa = p.fk_vendedor
where e.status_conta = 'Ativo')
order by sum(ip.preco_venda) desc;

#Mostrar o total de receita de 7 dias até hoje
select date(p.data_emissao) as 'data', sum(ip.preco_venda) as 'valor do dia' from itens_pedido ip
inner join pedidos p on p.id_pedido = ip.fk_pedido
group by p.data_emissao
having date(p.data_emissao) between DATE_SUB(CURRENT_DATE(), INTERVAL 1 WEEK) AND CURRENT_DATE();

#Mostrar os produtos e suas categorias das empresas atuais
select p.nome_produto, c.nome_categoria from produtos p
inner join categorias c on p.fk_categoria = c.id_categoria
inner join empresas e on e.id_empresa = p.fk_vendedor
where e.status_conta = 'Ativo'
order by c.nome_categoria, p.nome_produto;

#Mostrar empresas que nunca compraram nada
select e.nome_fantasia from empresas e
where not exists (
    select id_pedido
    from pedidos p
    where p.fk_comprador = e.id_empresa
);