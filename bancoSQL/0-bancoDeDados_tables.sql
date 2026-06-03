DROP DATABASE IF EXISTS PJ_Extensao;
CREATE DATABASE PJ_Extensao;
USE PJ_Extensao;

CREATE TABLE empresas (
id_empresa INT AUTO_INCREMENT PRIMARY KEY,
cnpj CHAR(14) NOT NULL UNIQUE,
perfil ENUM('Comprador', 'Vendedor') NOT NULL,
razao_social VARCHAR(150) NOT NULL,
nome_fantasia VARCHAR(150) NOT NULL,
inscricao_estadual VARCHAR(20) UNIQUE,
email_acesso VARCHAR(100) NOT NULL UNIQUE,
senha VARCHAR(255) NOT NULL,
status_conta ENUM(
'Ativo',
'Bloqueado',
'Aguardando Aprovação'
) DEFAULT 'Aguardando Aprovação',
categoria_empresa VARCHAR(50),
tipo_empresa VARCHAR(50),
descricao TEXT,
site VARCHAR(255),
data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
nome_responsavel VARCHAR(150),
cpf_responsavel CHAR(11),
cargo VARCHAR(100)
);

CREATE TABLE enderecos (
id_endereco INT AUTO_INCREMENT PRIMARY KEY,
fk_empresa INT NOT NULL,
complemento VARCHAR(100),
logradouro VARCHAR(150) NOT NULL,
numero VARCHAR(10),
bairro VARCHAR(50),
cidade VARCHAR(50) NOT NULL,
estado CHAR(2) NOT NULL,
cep CHAR(8) NOT NULL,
tipo_endereco ENUM(
'Sede',
'Entrega',
'Faturamento'
) DEFAULT 'Sede',
FOREIGN KEY (fk_empresa)
    REFERENCES empresas(id_empresa)
    ON DELETE CASCADE
);

CREATE TABLE contatos (
id_contato INT AUTO_INCREMENT PRIMARY KEY,
fk_empresa INT NOT NULL,
contato VARCHAR(100) NOT NULL,
tipo_contato ENUM(
'Telefone',
'Email',
'WhatsApp'
) NOT NULL,
FOREIGN KEY (fk_empresa)
    REFERENCES empresas(id_empresa)
    ON DELETE CASCADE
);

CREATE TABLE categorias (
id_categoria INT AUTO_INCREMENT PRIMARY KEY,
nome_categoria VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE produtos (
id_produto INT AUTO_INCREMENT PRIMARY KEY,
fk_vendedor INT NOT NULL,
fk_categoria INT NOT NULL,
nome_produto VARCHAR(150) NOT NULL,
descricao TEXT,
preco_unitario DECIMAL(12,2) NOT NULL
    CHECK (preco_unitario > 0),

estoque_minimo INT,
estoque_atual INT NOT NULL DEFAULT 0,

ativo BOOLEAN DEFAULT TRUE,

criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,

atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
ON UPDATE CURRENT_TIMESTAMP,

purchase_mode VARCHAR(50),

FOREIGN KEY (fk_vendedor)
    REFERENCES empresas(id_empresa),

FOREIGN KEY (fk_categoria)
    REFERENCES categorias(id_categoria)
);

CREATE TABLE pedidos (
id_pedido INT AUTO_INCREMENT PRIMARY KEY,
fk_comprador INT NOT NULL,
fk_endereco INT NOT NULL,

data_emissao DATETIME DEFAULT CURRENT_TIMESTAMP,

status_pedido ENUM(
    'Aberto',
    'Pago',
    'Cancelado',
    'Enviado'
) DEFAULT 'Aberto',

metodo_pagamento ENUM(
    'Pix',
    'Débito',
    'Crédito'
),

parcelamento INT,

observacoes TEXT,

total_estimado DECIMAL(12,2),

possui_itens_sob_consulta BOOLEAN DEFAULT FALSE,

FOREIGN KEY (fk_comprador)
    REFERENCES empresas(id_empresa),

FOREIGN KEY (fk_endereco)
    REFERENCES enderecos(id_endereco)

);

CREATE TABLE itens_pedido (
fk_pedido INT NOT NULL,
fk_produto INT NOT NULL,
quantidade INT NOT NULL
    CHECK (quantidade > 0),

preco_venda DECIMAL(12,2) NOT NULL,

subtotal DECIMAL(12,2),

PRIMARY KEY (fk_pedido, fk_produto),

FOREIGN KEY (fk_pedido)
    REFERENCES pedidos(id_pedido)
    ON DELETE CASCADE,

FOREIGN KEY (fk_produto)
    REFERENCES produtos(id_produto)

);

CREATE TABLE favoritos (
fk_empresa INT NOT NULL,
fk_produto INT NOT NULL,
criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,

PRIMARY KEY (
    fk_empresa,
    fk_produto
),

FOREIGN KEY (fk_empresa)
    REFERENCES empresas(id_empresa)
    ON DELETE CASCADE,

FOREIGN KEY (fk_produto)
    REFERENCES produtos(id_produto)
    ON DELETE CASCADE

);

CREATE TABLE carrinhos (
id_carrinho INT AUTO_INCREMENT PRIMARY KEY,

fk_empresa INT NOT NULL,

criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,

subtotal DECIMAL(12,2) DEFAULT 0.00,

FOREIGN KEY (fk_empresa)
    REFERENCES empresas(id_empresa)
    ON DELETE CASCADE
);

CREATE TABLE produtos_carrinho (
fk_carrinho INT NOT NULL,
fk_produto INT NOT NULL,

quantidade INT NOT NULL
    CHECK (quantidade > 0),

PRIMARY KEY (
    fk_carrinho,
    fk_produto
),

FOREIGN KEY (fk_carrinho)
    REFERENCES carrinhos(id_carrinho)
    ON DELETE CASCADE,

FOREIGN KEY (fk_produto)
    REFERENCES produtos(id_produto)
);
