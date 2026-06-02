-- MASSA DE DADOS EMPRESAS
INSERT INTO empresas (
firebase_uid,
cnpj,
perfil,
tipo_usuario,
role,
telefone,
email_acesso,
nome_responsavel,
cpf_responsavel,
cargo,
razao_social,
categoria_empresa,
tipo_empresa,
descricao,
site,
data_cadastro
)
VALUES

-- VENDEDORES

('UID001','52.284.577/0001-76','vendedor','vendedor','usuario-comum',
'11997655612','acessifycom@acessify.com',
'Antonio da Silva','217.832.160-77','Diretor Comercial',
'Acessify Soluções em Acessibilidade',
'Digital','Consultoria',
'Soluções tecnológicas para acessibilidade digital e inclusão corporativa.',
'https://www.acessify.com.br',
'2025-01-15 09:15:00'),

('UID002','11.458.962/0001-30','vendedor','vendedor','usuario-comum',
'11988112233','contato@mobilitybrasil.com',
'Marcos Pereira','315.227.410-98','Gerente Comercial',
'Mobility Brasil',
'Mobilidade','Equipamentos',
'Fornecedor de equipamentos de mobilidade e reabilitação.',
'https://www.mobilitybrasil.com.br',
'2025-01-22 14:30:00'),

('UID003','24.675.841/0001-19','vendedor','vendedor','usuario-comum',
'11977665544','vendas@pisoseguro.com',
'Fernanda Costa','142.663.980-02','Sócia Administradora',
'Piso Seguro',
'Arquitetonica','Infraestrutura',
'Especializada em pisos táteis e sinalização acessível.',
'https://www.pisoseguro.com.br',
'2025-02-03 11:20:00'),

('UID004','17.358.741/0001-91','vendedor','vendedor','usuario-comum',
'11988445566','contato@audiotech.com',
'Carlos Henrique','326.881.540-60','Diretor',
'Audiotech Inclusiva',
'Auditiva','Tecnologia Assistiva',
'Soluções voltadas para acessibilidade auditiva.',
'https://www.audiotechinclusiva.com.br',
'2025-02-18 15:10:00'),

('UID005','38.254.968/0001-55','vendedor','vendedor','usuario-comum',
'11999887766','contato@visaolivre.com',
'Luciana Almeida','273.611.290-40','CEO',
'Visão Livre Tecnologia',
'Visual','Tecnologia',
'Tecnologias assistivas para pessoas com deficiência visual.',
'https://www.visaolivre.com.br',
'2025-03-01 10:00:00'),

('UID006','43.228.711/0001-07','vendedor','vendedor','usuario-comum',
'11977112288','contato@rampup.com',
'Ricardo Gomes','402.177.930-52','Engenheiro',
'RampUp Engenharia',
'Arquitetonica','Engenharia',
'Projetos e adaptações para acessibilidade arquitetônica.',
'https://www.rampupengenharia.com.br',
'2025-03-15 16:20:00'),

('UID007','64.338.955/0001-12','vendedor','vendedor','usuario-comum',
'11977445522','contato@librasconnect.com',
'Juliana Rocha','392.541.120-11','Diretora',
'Libras Connect',
'Comunicacao','Serviços',
'Soluções de comunicação acessível e tradução em Libras.',
'https://www.librasconnect.com.br',
'2025-04-05 09:40:00'),

('UID008','81.557.446/0001-39','vendedor','vendedor','usuario-comum',
'11999224455','contato@smartinclusion.com',
'Eduardo Martins','521.667.810-03','Fundador',
'Smart Inclusion',
'Tecnologia Assistiva','Tecnologia',
'Desenvolvimento de soluções inovadoras para inclusão.',
'https://www.smartinclusion.com.br',
'2025-04-18 13:25:00'),

('UID009','22.985.447/0001-85','vendedor','vendedor','usuario-comum',
'11988771122','contato@wayaccess.com',
'Patricia Souza','331.208.760-18','Gerente',
'WayAccess',
'Arquitetonica','Infraestrutura',
'Sinalização acessível e orientação inclusiva.',
'https://www.wayaccess.com.br',
'2025-05-06 11:50:00'),

('UID010','35.124.777/0001-42','vendedor','vendedor','usuario-comum',
'11988553377','contato@ergocare.com',
'Roberto Nunes','278.996.310-27','Diretor',
'ErgoCare Equipamentos',
'Ergonomia','Equipamentos',
'Equipamentos ergonômicos e estações de trabalho acessíveis.',
'https://www.ergocare.com.br',
'2025-05-21 08:15:00'),

-- COMPRADORES

('UID011','45.914.373/0001-06','comprador','comprador','usuario-comum',
'1132558877','compras@jsodonto.com',
'Jose Silva','145.227.900-33','Administrador',
'JS Clínicas Odontológicas',
'Saúde','Clínica',
'Rede de clínicas odontológicas.',
'https://www.jsodonto.com.br',
'2025-06-10 09:00:00'),

('UID012','18.884.511/0001-43','comprador','comprador','usuario-comum',
'1133889900','compras@hospitalsantahelena.com',
'Mariana Ribeiro','253.112.670-49','Gerente Administrativa',
'Hospital Santa Helena',
'Saúde','Hospital',
'Hospital geral com atendimento de alta complexidade.',
'https://www.hospitalsantahelena.com.br',
'2025-06-18 14:00:00'),

('UID013','57.444.123/0001-91','comprador','comprador','usuario-comum',
'1133112200','contato@centromedicovida.com',
'André Lopes','389.664.250-55','Coordenador',
'Centro Médico Vida',
'Saúde','Clínica',
'Centro médico especializado.',
'https://www.centromedicovida.com.br',
'2025-07-02 10:45:00'),

('UID014','74.111.265/0001-02','comprador','comprador','usuario-comum',
'1133774411','contato@reabilitar.com',
'Vanessa Costa','407.125.990-30','Diretora',
'Clínica Reabilitar',
'Saúde','Clínica',
'Centro de fisioterapia e reabilitação.',
'https://www.reabilitar.com.br',
'2025-07-20 15:30:00'),

('UID015','33.278.551/0001-14','comprador','comprador','usuario-comum',
'1144221100','compras@horizonte.com',
'Leonardo Prado','212.765.310-88','Gerente de Obras',
'Construtora Horizonte',
'Construção','Construtora',
'Construção de empreendimentos comerciais.',
'https://www.construtorahorizonte.com.br',
'2025-08-05 09:20:00'),

('UID016','41.663.288/0001-77','comprador','comprador','usuario-comum',
'1144332200','contato@construtoraalfa.com',
'Rodrigo Freitas','362.114.500-20','Diretor',
'Construtora Alfa',
'Construção','Construtora',
'Projetos residenciais e corporativos.',
'https://www.construtoraalfa.com.br',
'2025-08-21 11:15:00'),

('UID017','20.445.511/0001-33','comprador','comprador','usuario-comum',
'1135002200','compras@unimetro.edu.br',
'Cristina Ramos','308.744.100-76','Pró-Reitora',
'Universidade Metropolitana',
'Educação','Universidade',
'Instituição de ensino superior.',
'https://www.unimetro.edu.br',
'2025-09-03 16:40:00'),

('UID018','50.226.984/0001-18','comprador','comprador','usuario-comum',
'1135113300','contato@institutosaber.org',
'Felipe Rocha','155.882.440-12','Coordenador',
'Instituto Saber Mais',
'Educação','Instituto',
'Instituição de apoio educacional.',
'https://www.institutosaber.org.br',
'2025-09-19 10:10:00'),

('UID019','72.889.411/0001-21','comprador','comprador','usuario-comum',
'1135224400','contato@escolacrescer.com',
'Paula Mendes','420.177.830-40','Diretora',
'Escola Crescer',
'Educação','Escola',
'Escola de ensino fundamental.',
'https://www.escolacrescer.com.br',
'2025-10-04 08:40:00'),

('UID020','61.477.123/0001-65','comprador','comprador','usuario-comum',
'1135335500','compras@serraazul.com',
'Gustavo Neri','287.654.110-37','Gerente Geral',
'Hotel Serra Azul',
'Hotelaria','Hotel',
'Hotel voltado ao turismo corporativo.',
'https://www.hotelserraazul.com.br',
'2025-10-20 14:25:00'),

('UID021','37.522.800/0001-10','comprador','comprador','usuario-comum',
'1135446600','compras@redesol.com',
'Priscila Lima','199.552.980-91','Supervisora',
'Rede Hoteleira Sol',
'Hotelaria','Hotel',
'Rede nacional de hotéis.',
'https://www.redesolhoteis.com.br',
'2025-11-05 09:35:00'),

('UID022','49.224.811/0001-25','comprador','comprador','usuario-comum',
'1135557700','compras@centralplaza.com',
'Daniel Moreira','321.441.600-48','Administrador',
'Shopping Central Plaza',
'Comércio','Shopping',
'Centro comercial com grande circulação.',
'https://www.centralplaza.com.br',
'2025-11-21 15:20:00'),

('UID023','58.774.910/0001-87','comprador','comprador','usuario-comum',
'1135668800','compras@novacidade.com',
'Fernanda Lima','144.227.330-99','Gerente',
'Shopping Nova Cidade',
'Comércio','Shopping',
'Empreendimento comercial urbano.',
'https://www.shoppingnovacidade.com.br',
'2025-12-03 11:10:00'),

('UID024','63.995.881/0001-12','comprador','comprador','usuario-comum',
'1135779900','contato@fundacaoinclusao.org',
'Helena Castro','277.511.740-44','Presidente',
'Fundação Inclusão Social',
'Terceiro Setor','ONG',
'Projetos voltados para inclusão social e acessibilidade.',
'https://www.fundacaoinclusao.org.br',
'2026-01-15 13:45:00'),

('UID025','87.225.411/0001-55','comprador','comprador','usuario-comum',
'1135881100','contato@primeempresarial.com',
'Marcelo Faria','316.552.480-70','Síndico',
'Centro Empresarial Prime',
'Corporativo','Centro Empresarial',
'Complexo corporativo com múltiplas empresas.',
'https://www.primeempresarial.com.br',
'2026-02-10 10:30:00');

-- MASSA DE DADOS ENDERECOS 
INSERT INTO enderecos (
fk_empresa,
cep,
logradouro,
numero,
complemento,
bairro,
cidade,
estado,
tipo_endereco
)
VALUES

-- VENDEDORES

(1,'13088-080','Rua das Tecnologias','125','Sala 302','Parque Tecnológico','Campinas','SP','Sede'),

(2,'09550-250','Avenida Mobilidade Urbana','420',NULL,'Centro','São Caetano do Sul','SP','Sede'),

(3,'14020-120','Rua dos Engenheiros','88',NULL,'Jardim América','Ribeirão Preto','SP','Sede'),

(4,'17015-120','Rua da Inclusão','55','Bloco B','Centro','Bauru','SP','Sede'),

(5,'15015-330','Avenida Visão Livre','740','Sala 5','Boa Vista','São José do Rio Preto','SP','Sede'),

(6,'13484-210','Rua das Rampas','310',NULL,'Industrial','Limeira','SP','Sede'),

(7,'18035-500','Avenida Comunicação','145','Andar 2','Campolim','Sorocaba','SP','Sede'),

(8,'12245-610','Rua Inovação Inclusiva','212','Sala 15','Jardim Aquarius','São José dos Campos','SP','Sede'),

(9,'11045-220','Avenida Acessibilidade','901',NULL,'Gonzaga','Santos','SP','Sede'),

(10,'17500-180','Rua Ergonomia Corporativa','77',NULL,'Centro','Marília','SP','Sede'),

-- COMPRADORES

(11,'01001-000','Praça da Sé','50','Lado ímpar','Sé','São Paulo','SP','Sede'),

(12,'01310-100','Avenida Paulista','1800',NULL,'Bela Vista','São Paulo','SP','Sede'),

(13,'13010-100','Rua Barreto Leme','320',NULL,'Centro','Campinas','SP','Sede'),

(14,'14801-180','Rua Reabilitação Humana','90',NULL,'Centro','Araraquara','SP','Sede'),

(15,'17013-280','Avenida Nações Unidas','1200',NULL,'Jardim Panorama','Bauru','SP','Sede'),

(16,'14025-220','Rua dos Construtores','510',NULL,'Nova Ribeirânia','Ribeirão Preto','SP','Sede'),

(17,'05508-220','Avenida Universitária','1000',NULL,'Butantã','São Paulo','SP','Sede'),

(18,'18095-410','Rua do Conhecimento','215',NULL,'Éden','Sorocaba','SP','Sede'),

(19,'12242-280','Rua Educação Inclusiva','145',NULL,'Jardim Satélite','São José dos Campos','SP','Sede'),

(20,'12460-000','Avenida das Araucárias','850',NULL,'Centro','Campos do Jordão','SP','Sede'),

(21,'11680-000','Avenida Atlântica','220',NULL,'Centro','Ubatuba','SP','Sede'),

(22,'11010-000','Avenida Ana Costa','3500',NULL,'Vila Matias','Santos','SP','Sede'),

(23,'17515-420','Avenida Comercial','980',NULL,'Centro','Marília','SP','Sede'),

(24,'13480-000','Rua Solidariedade','65',NULL,'Centro','Limeira','SP','Sede'),

(25,'04538-133','Avenida Brigadeiro Faria Lima','3500','Torre A','Itaim Bibi','São Paulo','SP','Sede');

-- MASSA DE DADOS CONTATOS
INSERT INTO contatos (fk_empresa, tipo_contato, contato)
VALUES

-- Vendedores

(1,'Telefone','11997655612'),
(1,'Email','acessifycom@acessify.com'),
(1,'WhatsApp','11997655612'),

(2,'Telefone','11988112233'),
(2,'Email','contato@mobilitybrasil.com'),

(3,'Telefone','11977665544'),
(3,'Email','vendas@pisoseguro.com'),

(4,'Telefone','11988445566'),
(4,'Email','contato@audiotech.com'),

(5,'Telefone','11999887766'),
(5,'Email','contato@visaolivre.com'),

(6,'Telefone','11977112288'),
(6,'Email','contato@rampup.com'),

(7,'Telefone','11977445522'),
(7,'Email','contato@librasconnect.com'),

(8,'Telefone','11999224455'),
(8,'Email','contato@smartinclusion.com'),

(9,'Telefone','11988771122'),
(9,'Email','contato@wayaccess.com'),

(10,'Telefone','11988553377'),
(10,'Email','contato@ergocare.com'),

-- Compradores

(11,'Telefone','1132558877'),
(11,'Email','compras@jsodonto.com'),

(12,'Telefone','1133889900'),
(12,'Email','compras@hospitalsantahelena.com'),
(12,'WhatsApp','11988881111'),

(13,'Telefone','1133112200'),
(13,'Email','contato@centromedicovida.com'),

(14,'Telefone','1133774411'),
(14,'Email','contato@reabilitar.com'),

(15,'Telefone','1144221100'),
(15,'Email','compras@horizonte.com'),

(16,'Telefone','1144332200'),
(16,'Email','contato@construtoraalfa.com'),

(17,'Telefone','1135002200'),
(17,'Email','compras@unimetro.edu.br'),
(17,'WhatsApp','11977770001'),

(18,'Telefone','1135113300'),
(18,'Email','contato@institutosaber.org'),

(19,'Telefone','1135224400'),
(19,'Email','contato@escolacrescer.com'),

(20,'Telefone','1135335500'),
(20,'Email','compras@serraazul.com'),

(21,'Telefone','1135446600'),
(21,'Email','compras@redesol.com'),

(22,'Telefone','1135557700'),
(22,'Email','compras@centralplaza.com'),
(22,'WhatsApp','11977770002'),

(23,'Telefone','1135668800'),
(23,'Email','compras@novacidade.com'),

(24,'Telefone','1135779900'),
(24,'Email','contato@fundacaoinclusao.org'),

(25,'Telefone','1135881100'),
(25,'Email','contato@primeempresarial.com'),
(25,'WhatsApp','11977770003');

-- MASSA DE DADOS CATEGORIAS
INSERT INTO categorias (nome_categoria)
VALUES
('Mobilidade'),
('Deficiencia Visual'),
('Deficiencia Auditiva'),
('Acessibilidade Digital'),
('Acessibilidade Arquitetonica'),
('Comunicacao Inclusiva'),
('Ergonomia'),
('Tecnologia Assistiva');

-- MASSA DE DADOS PRODUTOS
INSERT INTO produtos (
product_code,
fk_vendedor,
fk_categoria,
nome_produto,
descricao,
preco_unitario,
estoque_minimo,
estoque_atual,
purchase_mode,
ativo,
criado_em,
atualizado_em
)
VALUES

-- ACESSIFY (1)

('PROD001',1,4,'Plugin de Acessibilidade Web',
'Solução para adequação de websites à LGPD e WCAG.',
890.00,5,80,'consulta',TRUE,'2025-02-01','2026-01-10'),

('PROD002',1,4,'Leitor de Conteúdo Digital',
'Sistema de leitura assistida para portais corporativos.',
1200.00,5,50,'consulta',TRUE,'2025-02-01','2026-01-10'),

('PROD003',1,4,'Auditoria de Acessibilidade',
'Serviço de auditoria técnica para websites.',
3500.00,2,20,'consulta',TRUE,'2025-02-01','2026-01-10'),

('PROD004',1,4,'Widget de Libras',
'Tradutor automático para Libras.',
1800.00,3,40,'consulta',TRUE,'2025-02-01','2026-01-10'),

('PROD005',1,4,'Sistema de Contraste Adaptativo',
'Ajuste automático de contraste.',
990.00,5,60,'consulta',TRUE,'2025-02-01','2026-01-10'),

-- MOBILITY BRASIL (2)

('PROD006',2,1,'Cadeira de Rodas Manual',
'Cadeira de rodas dobrável.',
850.00,10,120,'compra-imediata',TRUE,'2025-02-10','2026-01-15'),

('PROD007',2,1,'Cadeira de Rodas Motorizada',
'Modelo elétrico de alta autonomia.',
7800.00,2,25,'compra-imediata',TRUE,'2025-02-10','2026-01-15'),

('PROD008',2,1,'Andador Articulado',
'Andador em alumínio.',
420.00,10,150,'compra-imediata',TRUE,'2025-02-10','2026-01-15'),

('PROD009',2,1,'Muleta Canadense',
'Par de muletas ajustáveis.',
190.00,20,300,'compra-imediata',TRUE,'2025-02-10','2026-01-15'),

('PROD010',2,1,'Scooter Elétrica Adaptada',
'Veículo de mobilidade individual.',
9200.00,2,15,'consulta',TRUE,'2025-02-10','2026-01-15'),

-- PISO SEGURO (3)

('PROD011',3,5,'Piso Tátil Direcional',
'Piso tátil para orientação.',
65.00,50,2000,'compra-imediata',TRUE,'2025-03-01','2026-01-20'),

('PROD012',3,5,'Piso Tátil Alerta',
'Sinalização tátil de alerta.',
70.00,50,1800,'compra-imediata',TRUE,'2025-03-01','2026-01-20'),

('PROD013',3,5,'Mapa Tátil Corporativo',
'Mapa acessível para ambientes.',
890.00,5,40,'consulta',TRUE,'2025-03-01','2026-01-20'),

('PROD014',3,5,'Faixa Antiderrapante',
'Faixa de segurança para escadas.',
40.00,50,3000,'compra-imediata',TRUE,'2025-03-01','2026-01-20'),

('PROD015',3,5,'Sinalização de Emergência Tátil',
'Placas de evacuação acessíveis.',
120.00,20,400,'compra-imediata',TRUE,'2025-03-01','2026-01-20'),

-- AUDIOTECH (4)

('PROD016',4,3,'Aparelho Auditivo Digital',
'Equipamento auditivo profissional.',
3200.00,5,60,'consulta',TRUE,'2025-03-15','2026-01-25'),

('PROD017',4,3,'Sistema FM Escolar',
'Sistema de amplificação para salas.',
2500.00,3,35,'consulta',TRUE,'2025-03-15','2026-01-25'),

('PROD018',4,3,'Loop Magnético',
'Sistema de indução auditiva.',
1800.00,5,45,'consulta',TRUE,'2025-03-15','2026-01-25'),

('PROD019',4,3,'Amplificador de Voz',
'Equipamento portátil.',
480.00,10,90,'compra-imediata',TRUE,'2025-03-15','2026-01-25'),

('PROD020',4,3,'Telefone Amplificado',
'Telefone para pessoas com deficiência auditiva.',
390.00,10,100,'compra-imediata',TRUE,'2025-03-15','2026-01-25'),

-- VISÃO LIVRE (5)

('PROD021',5,2,'Linha Braille Eletrônica',
'Equipamento para leitura Braille.',
8900.00,2,12,'consulta',TRUE,'2025-04-01','2026-02-01'),

('PROD022',5,2,'Impressora Braille',
'Impressão de materiais acessíveis.',
14500.00,1,8,'consulta',TRUE,'2025-04-01','2026-02-01'),

('PROD023',5,2,'Lupa Eletrônica',
'Ampliação digital portátil.',
1500.00,5,70,'compra-imediata',TRUE,'2025-04-01','2026-02-01'),

('PROD024',5,2,'Scanner Leitor Inteligente',
'Conversão de texto para voz.',
2900.00,5,30,'consulta',TRUE,'2025-04-01','2026-02-01'),

('PROD025',5,2,'Relógio Falante',
'Relógio acessível.',
220.00,20,150,'compra-imediata',TRUE,'2025-04-01','2026-02-01'),

-- RAMPUP (6)

('PROD026',6,5,'Rampa Modular de Alumínio',
'Rampa portátil.',
2200.00,5,40,'compra-imediata',TRUE,'2025-04-15','2026-02-05'),

('PROD027',6,5,'Corrimão Acessível',
'Corrimão em aço inox.',
950.00,10,100,'compra-imediata',TRUE,'2025-04-15','2026-02-05'),

('PROD028',6,5,'Elevador de Acessibilidade',
'Plataforma elevatória.',
42000.00,1,6,'consulta',TRUE,'2025-04-15','2026-02-05'),

('PROD029',6,5,'Plataforma Vertical',
'Equipamento para desníveis.',
18000.00,1,10,'consulta',TRUE,'2025-04-15','2026-02-05'),

('PROD030',6,5,'Porta Automática Acessível',
'Porta com acionamento automático.',
4800.00,3,25,'consulta',TRUE,'2025-04-15','2026-02-05'),

-- LIBRAS CONNECT (7)

('PROD031',7,6,'Totem Digital Libras',
'Terminal de atendimento acessível.',
5800.00,3,20,'consulta',TRUE,'2025-05-01','2026-02-10'),

('PROD032',7,6,'Avatar Libras Corporativo',
'Solução de tradução automática.',
2900.00,5,50,'consulta',TRUE,'2025-05-01','2026-02-10'),

('PROD033',7,6,'Treinamento em Libras',
'Capacitação corporativa.',
1200.00,5,100,'consulta',TRUE,'2025-05-01','2026-02-10'),

('PROD034',7,6,'Videochamada com Interprete',
'Serviço remoto especializado.',
750.00,10,120,'consulta',TRUE,'2025-05-01','2026-02-10'),

-- SMART INCLUSION (8)

('PROD035',8,8,'Mouse Adaptado',
'Mouse para mobilidade reduzida.',
280.00,20,180,'compra-imediata',TRUE,'2025-05-15','2026-02-15'),

('PROD036',8,8,'Teclado Adaptado',
'Teclado com teclas ampliadas.',
420.00,15,140,'compra-imediata',TRUE,'2025-05-15','2026-02-15'),

('PROD037',8,8,'Acionador por Toque',
'Dispositivo assistivo.',
350.00,15,160,'compra-imediata',TRUE,'2025-05-15','2026-02-15'),

('PROD038',8,8,'Controle Ocular',
'Tecnologia para comunicação alternativa.',
18500.00,1,8,'consulta',TRUE,'2025-05-15','2026-02-15'),

('PROD039',8,8,'Comunicador Alternativo',
'Dispositivo de comunicação.',
3200.00,3,25,'consulta',TRUE,'2025-05-15','2026-02-15'),

-- WAYACCESS (9)

('PROD040',9,5,'Placa Braille',
'Sinalização em Braille.',
90.00,50,1000,'compra-imediata',TRUE,'2025-06-01','2026-02-20'),

('PROD041',9,5,'Sinalização de Sanitário Acessível',
'Placa normativa.',
75.00,50,1200,'compra-imediata',TRUE,'2025-06-01','2026-02-20'),

('PROD042',9,5,'Totem de Orientação Tátil',
'Equipamento de orientação.',
3800.00,3,20,'consulta',TRUE,'2025-06-01','2026-02-20'),

('PROD043',9,5,'Mapa Tátil Interativo',
'Solução para grandes ambientes.',
4500.00,2,15,'consulta',TRUE,'2025-06-01','2026-02-20'),

-- ERGOCARE (10)

('PROD044',10,7,'Mesa Regulável Elétrica',
'Estação ergonômica.',
2800.00,5,60,'compra-imediata',TRUE,'2025-06-15','2026-02-25'),

('PROD045',10,7,'Cadeira Ergonômica Adaptada',
'Assento com suporte avançado.',
1650.00,5,75,'compra-imediata',TRUE,'2025-06-15','2026-02-25'),

('PROD046',10,7,'Apoio de Punho Ergonômico',
'Acessório ergonômico.',
90.00,20,250,'compra-imediata',TRUE,'2025-06-15','2026-02-25'),

('PROD047',10,7,'Suporte Ajustável para Monitor',
'Melhora da postura de trabalho.',
220.00,15,180,'compra-imediata',TRUE,'2025-06-15','2026-02-25');

-- MASSA DE DADOS PEDIDOS
INSERT INTO pedidos (
fk_comprador,
fk_endereco,
metodo_pagamento,
parcelamento,
observacoes,
status_pedido,
total_estimado,
possui_itens_sob_consulta,
referencia_pix,
data_emissao
)
VALUES

(11,11,'Boleto','1x','Compra de equipamentos para clínica','Pago',8500.00,FALSE,NULL,'2025-08-10 09:15:00'),

(12,12,'PIX','1x','Adequação hospitalar','Pago',28500.00,FALSE,'PIX001','2025-09-02 10:20:00'),

(13,13,'Cartão','3x','Aquisição de equipamentos visuais','Pago',17900.00,FALSE,NULL,'2025-09-15 14:30:00'),

(14,14,'Boleto','2x','Reabilitação motora','Pago',12400.00,FALSE,NULL,'2025-10-01 08:10:00'),

(15,15,'Boleto','4x','Projeto arquitetônico acessível','Pago',48000.00,TRUE,NULL,'2025-10-18 11:40:00'),

(16,16,'PIX','1x','Obras de acessibilidade','Pago',53000.00,FALSE,'PIX002','2025-11-05 15:00:00'),

(17,17,'Empenho','1x','Equipamentos para universidade','Pago',41200.00,FALSE,NULL,'2025-11-18 13:50:00'),

(18,18,'Boleto','2x','Projeto educacional inclusivo','Pago',9200.00,FALSE,NULL,'2025-12-04 09:20:00'),

(19,19,'PIX','1x','Laboratório acessível','Pago',14300.00,FALSE,'PIX003','2025-12-17 16:10:00'),

(20,20,'Cartão','3x','Adequação hotel','Pago',27000.00,FALSE,NULL,'2026-01-08 10:00:00'),

(21,21,'Cartão','2x','Projeto acessibilidade rede hoteleira','Pago',31800.00,FALSE,NULL,'2026-01-20 15:30:00'),

(22,22,'Boleto','5x','Reforma shopping','Pago',68500.00,TRUE,NULL,'2026-02-03 11:00:00'),

(23,23,'PIX','1x','Aquisição de sinalização','Pago',11200.00,FALSE,'PIX004','2026-02-12 14:00:00'),

(25,25,'Boleto','2x','Centro empresarial inclusivo','Pago',35200.00,FALSE,NULL,'2026-03-05 09:40:00'),

-- pedidos extras para gerar mais volume

(12,12,'PIX','1x','Nova aquisição hospitalar','Pago',9500.00,FALSE,'PIX005','2026-03-15 13:10:00'),

(17,17,'Empenho','1x','Ampliação laboratório','Pago',22000.00,FALSE,NULL,'2026-03-20 09:50:00'),

(22,22,'Boleto','3x','Expansão shopping','Aberto',18500.00,FALSE,NULL,'2026-04-01 10:10:00'),

(11,11,'Cartão','2x','Nova compra clínica','Enviado',7200.00,FALSE,NULL,'2026-04-08 15:40:00'),

(20,20,'PIX','1x','Adequação recepção hotel','Pago',6500.00,FALSE,'PIX006','2026-04-15 11:20:00'),

(13,13,'Boleto','2x','Projeto acessibilidade visual','Cancelado',8100.00,FALSE,NULL,'2026-04-22 09:30:00');

-- MASSA DE DADOS ITENS DO PEDIDO
INSERT INTO itens_pedido (
fk_pedido,
fk_produto,
nome_produto,
empresa_vendedora,
categoria,
quantidade,
preco_venda,
subtotal
)
VALUES

-- PEDIDO 1
(1,6,'Cadeira de Rodas Manual','Mobility Brasil','Mobilidade',5,850.00,4250.00),
(1,8,'Andador Articulado','Mobility Brasil','Mobilidade',10,420.00,4200.00),

-- PEDIDO 2
(2,26,'Rampa Modular de Alumínio','RampUp Engenharia','Acessibilidade Arquitetonica',5,2200.00,11000.00),
(2,27,'Corrimão Acessível','RampUp Engenharia','Acessibilidade Arquitetonica',10,950.00,9500.00),
(2,40,'Placa Braille','WayAccess','Acessibilidade Arquitetonica',50,90.00,4500.00),

-- PEDIDO 3
(3,21,'Linha Braille Eletrônica','Visão Livre Tecnologia','Deficiencia Visual',1,8900.00,8900.00),
(3,23,'Lupa Eletrônica','Visão Livre Tecnologia','Deficiencia Visual',6,1500.00,9000.00),

-- PEDIDO 4
(4,6,'Cadeira de Rodas Manual','Mobility Brasil','Mobilidade',4,850.00,3400.00),
(4,7,'Cadeira de Rodas Motorizada','Mobility Brasil','Mobilidade',1,7800.00,7800.00),

-- PEDIDO 5
(5,28,'Elevador de Acessibilidade','RampUp Engenharia','Acessibilidade Arquitetonica',1,42000.00,42000.00),
(5,40,'Placa Braille','WayAccess','Acessibilidade Arquitetonica',20,90.00,1800.00),

-- PEDIDO 6
(6,28,'Elevador de Acessibilidade','RampUp Engenharia','Acessibilidade Arquitetonica',1,42000.00,42000.00),
(6,29,'Plataforma Vertical','RampUp Engenharia','Acessibilidade Arquitetonica',1,18000.00,18000.00),

-- PEDIDO 7
(7,21,'Linha Braille Eletrônica','Visão Livre Tecnologia','Deficiencia Visual',1,8900.00,8900.00),
(7,31,'Totem Digital Libras','Libras Connect','Comunicacao Inclusiva',2,5800.00,11600.00),
(7,38,'Controle Ocular','Smart Inclusion','Tecnologia Assistiva',1,18500.00,18500.00),

-- PEDIDO 8
(8,36,'Teclado Adaptado','Smart Inclusion','Tecnologia Assistiva',10,420.00,4200.00),
(8,35,'Mouse Adaptado','Smart Inclusion','Tecnologia Assistiva',10,280.00,2800.00),

-- PEDIDO 9
(9,22,'Impressora Braille','Visão Livre Tecnologia','Deficiencia Visual',1,14500.00,14500.00),

-- PEDIDO 10
(10,30,'Porta Automática Acessível','RampUp Engenharia','Acessibilidade Arquitetonica',5,4800.00,24000.00),
(10,40,'Placa Braille','WayAccess','Acessibilidade Arquitetonica',30,90.00,2700.00),

-- PEDIDO 11
(11,30,'Porta Automática Acessível','RampUp Engenharia','Acessibilidade Arquitetonica',5,4800.00,24000.00),
(11,41,'Sinalização de Sanitário Acessível','WayAccess','Acessibilidade Arquitetonica',40,75.00,3000.00),
(11,27,'Corrimão Acessível','RampUp Engenharia','Acessibilidade Arquitetonica',5,950.00,4750.00),

-- PEDIDO 12
(12,28,'Elevador de Acessibilidade','RampUp Engenharia','Acessibilidade Arquitetonica',1,42000.00,42000.00),
(12,42,'Totem de Orientação Tátil','WayAccess','Acessibilidade Arquitetonica',5,3800.00,19000.00),

-- PEDIDO 13
(13,40,'Placa Braille','WayAccess','Acessibilidade Arquitetonica',40,90.00,3600.00),
(13,15,'Sinalização de Emergência Tátil','Piso Seguro','Acessibilidade Arquitetonica',50,120.00,6000.00),

-- PEDIDO 14
(14,31,'Totem Digital Libras','Libras Connect','Comunicacao Inclusiva',3,5800.00,17400.00),
(14,32,'Avatar Libras Corporativo','Libras Connect','Comunicacao Inclusiva',4,2900.00,11600.00),

-- PEDIDO 15
(15,16,'Aparelho Auditivo Digital','Audiotech Inclusiva','Deficiencia Auditiva',3,3200.00,9600.00),

-- PEDIDO 16
(16,38,'Controle Ocular','Smart Inclusion','Tecnologia Assistiva',1,18500.00,18500.00),
(16,39,'Comunicador Alternativo','Smart Inclusion','Tecnologia Assistiva',1,3200.00,3200.00),

-- PEDIDO 17
(17,26,'Rampa Modular de Alumínio','RampUp Engenharia','Acessibilidade Arquitetonica',5,2200.00,11000.00),
(17,27,'Corrimão Acessível','RampUp Engenharia','Acessibilidade Arquitetonica',5,950.00,4750.00),

-- PEDIDO 18
(18,6,'Cadeira de Rodas Manual','Mobility Brasil','Mobilidade',4,850.00,3400.00),
(18,8,'Andador Articulado','Mobility Brasil','Mobilidade',9,420.00,3780.00),

-- PEDIDO 19
(19,44,'Mesa Regulável Elétrica','ErgoCare Equipamentos','Ergonomia',2,2800.00,5600.00),
(19,45,'Cadeira Ergonômica Adaptada','ErgoCare Equipamentos','Ergonomia',4,1650.00,6600.00),

-- PEDIDO 20
(20,23,'Lupa Eletrônica','Visão Livre Tecnologia','Deficiencia Visual',2,1500.00,3000.00),
(20,25,'Relógio Falante','Visão Livre Tecnologia','Deficiencia Visual',10,220.00,2200.00);

-- MASSA DE DADOS FAVORITOS
INSERT INTO favoritos (
fk_empresa,
fk_produto,
criado_em
)
VALUES

-- JS Clínicas Odontológicas
(11,6,'2026-03-01 10:00:00'),
(11,27,'2026-03-02 14:30:00'),

-- Hospital Santa Helena
(12,16,'2026-03-03 09:20:00'),
(12,21,'2026-03-03 09:25:00'),
(12,31,'2026-03-03 09:30:00'),

-- Centro Médico Vida
(13,21,'2026-03-05 11:10:00'),
(13,23,'2026-03-05 11:15:00'),

-- Clínica Reabilitar
(14,6,'2026-03-07 15:40:00'),
(14,7,'2026-03-07 15:45:00'),
(14,26,'2026-03-07 15:50:00'),

-- Construtora Horizonte
(15,28,'2026-03-08 08:20:00'),
(15,30,'2026-03-08 08:25:00'),

-- Construtora Alfa
(16,28,'2026-03-09 10:10:00'),
(16,29,'2026-03-09 10:15:00'),

-- Universidade Metropolitana
(17,31,'2026-03-10 13:00:00'),
(17,38,'2026-03-10 13:05:00'),

-- Instituto Saber Mais
(18,35,'2026-03-11 16:40:00'),
(18,36,'2026-03-11 16:45:00'),

-- Escola Crescer
(19,40,'2026-03-12 09:10:00'),

-- Hotel Serra Azul
(20,30,'2026-03-13 11:30:00'),

-- Rede Hoteleira Sol
(21,30,'2026-03-14 15:50:00'),

-- Shopping Central Plaza
(22,42,'2026-03-15 14:00:00'),
(22,43,'2026-03-15 14:05:00'),

-- Shopping Nova Cidade
(23,40,'2026-03-16 10:20:00'),

-- Centro Empresarial Prime
(25,44,'2026-03-18 08:30:00'),
(25,45,'2026-03-18 08:35:00');