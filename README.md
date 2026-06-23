# e-comerce

Aplicação de exemplo de e-commerce com backend em Node.js/Express e frontend estático (HTML/CSS/JS). A API usa MySQL para persistência e autenticação via JWT.

## Estrutura do repositório

- backend/ — API em Node.js (Express). Entrada: `src/server.js`.
- frontend/ — HTML/CSS/JS estático (páginas do cliente).

## Tecnologias

- Node.js (recomenda-se v18+)
- Express
- MySQL
- JWT, bcrypt, axios, cors, dotenv

## Pré-requisitos

- Node.js e npm
- MySQL

## Executando a aplicação (backend)

1. Acessar a pasta do backend:

   cd backend

2. Instalar dependências:

   npm install

3. Configurar variáveis de ambiente: crie um arquivo `.env` na pasta `backend/` (ex.: copie o `.env` existente e edite conforme necessário).

4. Iniciar em modo desenvolvimento:

   npm run dev

O servidor ouve por padrão na porta definida em `PORT` (padrão: 3003).

## Variáveis de ambiente (exemplo `.env`)

- DB_HOST (ex: localhost)
- DB_USER (ex: root)
- DB_PASSWORD
- DB_NAME (ex: ecommerce)
- DB_PORT (ex: 3306)
- PORT (ex: 3003)
- JWT_SECRET
- JWT_EXPIRES (ex: 31d)

O repositório já contém um arquivo `backend/.env` de exemplo com valores básicos.

## Frontend

O frontend é composto por arquivos estáticos em `frontend/`.

- Para desenvolvimento rápido, abra `frontend/index.html` no navegador.
- Ou sirva a pasta com um servidor estático (ex: `npx http-server frontend -p 8080` ou `python -m http.server 8080 --directory frontend`).

OBS: O frontend usa `http://localhost:3003` como URL da API por padrão. Para trocar, edite `frontend/src/js/*` onde `API_URL` é definido.

## Banco de dados

Crie o banco de dados definido em `DB_NAME` e as tabelas necessárias. Exemplo mínimo (MySQL):

```sql
CREATE DATABASE ecommerce;
USE ecommerce;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_owner INT,
  store_name VARCHAR(255),
  slug VARCHAR(255),
  niche VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_store INT,
  name VARCHAR(255),
  description TEXT,
  price DECIMAL(10,2),
  stock INT DEFAULT 0,
  image VARCHAR(512),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_store) REFERENCES stores(id) ON DELETE SET NULL
);

CREATE TABLE purchase (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_user INT,
  status VARCHAR(50) DEFAULT 'aberto',
  all_price DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_product INT,
  id_purchase INT,
  quantity INT,
  unit_value DECIMAL(10,2),
  FOREIGN KEY (id_product) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (id_purchase) REFERENCES purchase(id) ON DELETE CASCADE
);

CREATE TABLE user_addresses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  street VARCHAR(255),
  number VARCHAR(50),
  complement VARCHAR(255),
  neighborhood VARCHAR(255),
  city VARCHAR(255),
  state VARCHAR(255),
  cep VARCHAR(20),
  full_name VARCHAR(255),
  phone_number VARCHAR(50)
);

CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT,
  user_id INT,
  payment_method_id INT,
  amount DECIMAL(10,2),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Ajuste tipos, índices e chaves estrangeiras conforme necessário.

## Rotas principais (API)

- /product
- /auth
- /user
- /address
- /store
- /purchase
- /item

Consulte os controladores em `backend/src/controllers/` para detalhes de cada rota.

## Contribuição

1. Fork e clone o repositório.
2. Crie uma branch: `git checkout -b feature/minha-feature`.
3. Abra um PR descrevendo as mudanças.

## Licença

Licença: ISC (ver `backend/package.json`).

## Autor

Geve — https://github.com/geve-dev/e-comerce


--
README gerado automaticamente.
