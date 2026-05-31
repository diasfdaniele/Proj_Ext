#Views (1,0 pt)

drop view if exists relatorio_produtos;
#View para relatório dos produtos de empresas ativas
create view relatorio_produtos as
select pr.nome_produto, pr.preco_unitario, e.nome_fantasia from produtos pr
inner join empresas e on pr.fk_vendedor = e.id_empresa
where e.status_conta = 'Ativo';

drop view if exists produtos_pedidos;
#View para simplificar as tabelas pedidos - itens_pedido - produtos - categoria
create view produtos_pedidos as
select ip.fk_pedido, p.data_emissao, p.status_pedido, ip.fk_produto, pr.nome_produto, c.nome_categoria, ip.quantidade from itens_pedido ip
inner join pedidos p on ip.fk_pedido = p.id_pedido
inner join produtos pr on ip.fk_produto = pr.id_produto
inner join categorias c on c.id_categoria = pr.fk_categoria;

drop view if exists empresas_pedidos;
#View genérica que mostra as empresas e os seus pedidos
create view empresas_pedidos as
select e.nome_fantasia, p.id_pedido, p.data_emissao from empresas e
inner join produtos pr on e.id_empresa = pr.fk_vendedor
inner join pedidos p on pr.id_produto = p.fk_comprador;

#View que mostra dados seguros para os usuários
drop view if exists empresa_segura;
create view empresa_segura as
select e.razao_social, e.nome_fantasia, en.cep, en.estado, en.cidade, en.bairro, en.logradouro, en.numero, group_concat(c.contato separator " / ") as contatos from empresas e
left join enderecos en on e.id_empresa = en.fk_empresa
left join contatos c on e.id_empresa = c.fk_empresa
group by e.id_empresa, e.razao_social, en.cep, en.estado, en.cidade, en.bairro, en.logradouro, en.numero
order by e.razao_social;