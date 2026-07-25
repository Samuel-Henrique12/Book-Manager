# 📘 Book Manager

Aplicação full-stack para gerenciamento de uma biblioteca pessoal de livros, com **autenticação JWT** e **CRUD completo**. Construída com **Spring Boot** (backend) e **Next.js** (frontend), sobre **PostgreSQL**.

> Desafio técnico full-stack. Além dos requisitos, o projeto foi estruturado para crescer (estantes, avaliações, diário de leitura, integração com API de livros) — veja o [roadmap](#-roadmap).

---

## ✨ Funcionalidades

- 🔐 **Autenticação JWT** — cadastro e login; rotas de livros protegidas.
- 📚 **CRUD de livros** — criar, listar, buscar por ID, editar e remover (soft delete).
- 🔎 **Busca por título** e **paginação** no endpoint de listagem.
- 🖥️ **Interface completa** — login/registro, listagem (tabela/cards) com busca e ordenação, formulários com pré-visualização ao vivo, proteção de rotas.
- 📖 **Documentação da API** via Swagger/OpenAPI.
- 🐳 **Dockerizado** — sobe tudo (banco + API + web) com um comando.

---

## 🧱 Stack

| Camada | Tecnologias |
|---|---|
| **Backend** | Java 21, Spring Boot 3.4, Spring Security (JWT), Spring Data JPA, Bean Validation, MapStruct, Flyway, springdoc-openapi |
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, TanStack Query, React Hook Form + Zod |
| **Banco** | PostgreSQL 16 |
| **Infra** | Docker, Docker Compose |
| **Testes** | JUnit 5, Testcontainers, Spring Security Test |

---

## 🚀 Como executar

### Pré-requisitos
- [Docker](https://www.docker.com/) e Docker Compose
- (Para rodar localmente sem Docker) Java 21+ e Node.js 20+

### Opção A — Script `serve.ps1` (Windows/PowerShell, mais fácil)

Sobe **tudo** (banco + API + frontend), aguarda ficar pronto e abre o navegador — só precisa do Docker:

```powershell
.\serve.ps1          # ou: .\serve.ps1 up
```

Outros comandos: `.\serve.ps1 down` (parar) · `reset` (zerar dados) · `logs api|web|db` · `status` · `portas` (quem está ocupando 3000/8080/5432) · `dev` (hot reload) · `help`.

#### Comandos globais (opcional)

Para chamar de qualquer diretório, sem depender do `cd`:

```powershell
.\instalar-comandos.ps1     # registra as funções no perfil do PowerShell
```

Passam a existir `book-manager-up`, `-down`, `-dev`, `-stop`, `-restart`, `-reset`, `-rebuild`, `-logs`, `-status`, `-portas` e a forma genérica `book-manager <comando>`. Abra uma **nova** janela do PowerShell depois de instalar. Para desfazer: `.\instalar-comandos.ps1 -Remover`.

#### Portas

Os padrões são `3000` (web), `8080` (API) e `5432` (banco). Se outro projeto já usar alguma delas, crie um `.env` a partir do `.env.example` e ajuste `WEB_PORT`, `API_PORT`, `DB_PORT` — junto com `NEXT_PUBLIC_API_URL` e `CORS_ORIGENS`.

### Opção B — Docker Compose (qualquer SO)

```bash
# na raiz do projeto
docker compose up --build
```

- Frontend: http://localhost:3000
- API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html

Para parar: `docker compose down` (ou `docker compose down -v` para apagar também os dados).

### Opção C — Ambiente local (desenvolvimento, hot reload)

**1. Banco de dados** (via Docker):
```bash
docker compose up -d db
```

**2. Backend:**
```bash
cd backend
./mvnw spring-boot:run
```

**3. Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Acesse http://localhost:3000.

### Variáveis de ambiente

Backend (valores padrão em `backend/src/main/resources/application.yml`):

| Variável | Descrição | Padrão |
|---|---|---|
| `DB_URL` | URL JDBC do Postgres | `jdbc:postgresql://localhost:5432/bookmanager` |
| `DB_USERNAME` / `DB_PASSWORD` | Credenciais do banco | `bookmanager` / `bookmanager` |
| `JWT_SECRET` | Segredo HMAC do JWT (mín. 32 bytes) | *(dev; **trocar em produção**)* |
| `JWT_EXPIRACAO` | Validade do token (ISO-8601 Duration) | `PT8H` |
| `CORS_ORIGENS` | Origens permitidas (CORS) | `http://localhost:3000` |

Frontend:

| Variável | Descrição | Padrão |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL base da API (lida no browser) | `http://localhost:8080` |

Há um `.env.example` na raiz e em `frontend/`.

---

## 📚 API

Autenticação via `Authorization: Bearer <token>`. Documentação interativa em **`/swagger-ui.html`**.

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| POST | `/auth/register` | Cria usuário e retorna token | ❌ |
| POST | `/auth/login` | Autentica e retorna token | ❌ |
| GET | `/books` | Lista livros (busca `?titulo=`, paginação `?page=&size=&sort=`) | ✅ |
| POST | `/books/create` | Cria livro | ✅ |
| GET | `/books/{id}` | Busca livro por ID | ✅ |
| PUT | `/books/{id}` | Atualiza livro | ✅ |
| DELETE | `/books/{id}` | Remove livro (soft delete) | ✅ |

Erros seguem o padrão **[RFC 9457 `ProblemDetail`](https://www.rfc-editor.org/rfc/rfc9457)**; erros de validação incluem um mapa `campos` com a mensagem por campo.

**Modelo `Livro`:** `titulo` (obrigatório), `autor` (obrigatório), `ano` (opcional), `descricao` (opcional).

---

## 🗄️ Banco de dados

- Estrutura versionada em **[`schema.sql`](./schema.sql)** (raiz) e nas migrations Flyway em `backend/src/main/resources/db/migration/`.
- Em runtime, o **Flyway** cria/evolui o schema; o Hibernate roda com `ddl-auto=validate` (nunca altera a estrutura automaticamente).
- Exclusão é **lógica** (soft delete, coluna `removido`) — registros não são apagados fisicamente.

---

## 🧪 Testes

```bash
cd backend
./mvnw test
```

Testes de integração usam **Testcontainers** (sobem um PostgreSQL real e efêmero), cobrindo o fluxo de autenticação + CRUD ponta a ponta. Requer Docker em execução.

---

## 📁 Estrutura do projeto

```
.
├── backend/          # API Spring Boot (arquitetura package-by-feature)
│   └── src/main/java/com/bookmanager/
│       ├── autenticacao/   # login, registro, JWT, segurança
│       ├── livro/          # CRUD de livros
│       ├── usuario/        # entidade e repositório de usuário
│       └── comum/          # auditoria, exceções, paginação, OpenAPI
├── frontend/         # Next.js (App Router) + TypeScript
│   ├── app/          # rotas: /login, /books, /books/new, /books/[id]/edit
│   ├── components/   # UI (sidebar, tabela, cards, formulário, modal...)
│   └── lib/          # api, auth, chamadas de livros, tipos
├── schema.sql        # estrutura do banco (deliverable)
└── docker-compose.yml
```

---

## 🧭 Decisões de arquitetura

- **Backend package-by-feature** (agrupado por domínio, não por camada técnica).
- **DTOs imutáveis** (`record`) na entrada/saída; entidades JPA nunca são expostas na API. Mapeamento via **MapStruct**.
- **JWT stateless** com um único access token (sem refresh token no escopo atual — decisão consciente para simplicidade; produção usaria refresh + rotação).
- **Tratamento de erro global** com `@RestControllerAdvice` + `ProblemDetail`.
- **Auditoria** automática (`criadoEm`/`atualizadoEm`/`criadoPor`/`atualizadoPor`) e **soft delete** via Hibernate.
- Configuração por **variáveis de ambiente** com defaults seguros para desenvolvimento.

---

## 🌐 Deploy

Deploy **100% gratuito** (sem cartão) com **Vercel** (frontend) + **Render** (API) + **Neon** (banco), com auto-deploy a cada `git push`. Passo a passo completo em **[`DEPLOY.md`](./DEPLOY.md)**.

> _Links do ambiente ao vivo:_
> - **Frontend:** _(Vercel — a preencher)_
> - **API:** _(Render — a preencher)_

> ⏱️ **Primeiro acesso pode demorar ~30–60s.** Nos planos gratuitos a API hiberna após 15 min sem uso e o banco escala a zero; a primeira requisição acorda os dois. Depois disso a navegação é normal.

---

## 🗺️ Roadmap

Funcionalidades planejadas para transformar o gerenciador em uma experiência estilo "estante social":

- [ ] **Categorias/Tags** e filtro por gênero
- [ ] **Estantes por status de leitura** (quero ler, lendo, lido, abandonado, favorito)
- [ ] **Avaliações** (nota + resenha) por livro
- [ ] **Diário de leitura** — progresso por página, % lido e estimativa de tempo restante
- [ ] **Integração com Google Books** — autopreenchimento de dados e capa ao cadastrar
