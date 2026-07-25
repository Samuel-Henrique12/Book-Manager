# 🚀 Guia de Deploy (100% gratuito)

Este guia publica o Book Manager ao vivo **de graça e sem cartão de crédito**, com **auto-deploy a cada `git push`**.

| Camada | Serviço | Por quê |
|---|---|---|
| Frontend (Next.js) | **Vercel** | Grátis, build nativo de Next, auto-deploy via GitHub |
| API (Spring Boot / Docker) | **Render** | Grátis (750h/mês), roda o `Dockerfile`, auto-deploy via GitHub |
| Banco (PostgreSQL) | **Neon** | Grátis **permanente** (o Postgres grátis do Render expira em 30 dias) |

> **Cold start:** no plano gratuito a API "dorme" após 15 min sem uso e o banco escala a zero. A **primeira requisição** após ociosidade pode levar ~30–60s. Normal para demo/portfólio.

Todos os três serviços fazem login **com a conta do GitHub** — não precisa criar senha nova.

---

## 0. Pré-requisito: código no GitHub

Os serviços fazem deploy a partir do repositório. Garanta que o código esteja no GitHub:

```bash
git push origin <sua-branch>
```

> Pode ser uma branch dedicada (ex.: `deploy`). A organização/divisão dos commits pode ser feita depois — o deploy só precisa que o código esteja lá.

---

## 1. Banco de dados — Neon

1. Acesse **https://neon.tech** → entre com o GitHub → **Create project** → região **AWS us-east-1 (N. Virginia)** (a mesma da API no Render, para reduzir latência).
2. Copie a **connection string** (algo como `postgresql://usuario:senha@host/dbname?sslmode=require&channel_binding=require`).
3. Converta para JDBC e anote os três valores para usar no Render:

   | Variável | Valor |
   |---|---|
   | `DB_URL` | `jdbc:postgresql://<host>/<dbname>?sslmode=require` |
   | `DB_USERNAME` | `<usuario>` |
   | `DB_PASSWORD` | `<senha>` |

   > **Três detalhes obrigatórios:** prefixo `jdbc:` no início; `?sslmode=require` no final; e **remover o `&channel_binding=require`** que o Neon inclui — é um parâmetro do `libpq` que o driver JDBC não usa. Usuário e senha saem da URL e vão para as variáveis próprias.

---

## 2. API — Render

O repositório já traz um **`render.yaml`** (Blueprint) que configura o serviço automaticamente.

1. Acesse **https://render.com** → entre com o GitHub.
2. **New → Blueprint** → conecte este repositório → o Render lê o `render.yaml` e cria o serviço `book-manager-api`.
   - _(Alternativa manual: **New → Web Service** → repositório → **Runtime** = Docker → **Dockerfile Path** = `backend/Dockerfile` → **Docker Build Context Directory** = `backend`.)_
3. Em **Environment**, preencha as variáveis marcadas como "sync: false":
   - `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` → valores do Neon (passo 1)
   - `CORS_ORIGENS` → deixe `http://localhost:3000` **por enquanto** (ajustamos no passo 4)
   - `JWT_SECRET` já é gerado automaticamente; `JWT_EXPIRACAO` (`PT8H`) e `JAVA_TOOL_OPTIONS` já vêm definidos no Blueprint.
4. **Create** → aguarde o primeiro build (o Render compila o `Dockerfile`; leva alguns minutos).
5. Ao terminar, copie a **URL pública** da API (ex.: `https://book-manager-api.onrender.com`).
   - Teste: abra `https://<sua-api>.onrender.com/swagger-ui.html`.

> No 1º boot, o **Flyway cria as tabelas** no banco Neon automaticamente (é o banco dedicado da aplicação — seguro).

---

## 3. Frontend — Vercel

1. Acesse **https://vercel.com** → entre com o GitHub → **Add New → Project** → importe este repositório.
2. Configure:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Next.js (detectado automaticamente)
   - **Environment Variables:** `NEXT_PUBLIC_API_URL` = a URL da API do Render (passo 2.5)
3. **Deploy** → aguarde e copie a **URL pública** do frontend (ex.: `https://book-manager.vercel.app`).

---

## 4. Conectar frontend ↔ API (CORS)

1. Volte ao **Render** → serviço `book-manager-api` → **Environment**.
2. Ajuste `CORS_ORIGENS` = a URL da Vercel (ex.: `https://book-manager.vercel.app`, **sem barra no final**).
3. Salve → o Render redeploya sozinho.

---

## 5. Verificação

1. Abra a URL da Vercel.
2. Crie uma conta, faça login, cadastre e liste um livro.
3. Se a primeira ação demorar, é o cold start (API/banco acordando) — repita após alguns segundos.

---

## 6. Auto-deploy (a cada push)

Ao conectar o repositório, Vercel e Render instalam o **GitHub App** (o equivalente moderno da _deploy key_). A partir daí:

- **`git push`** na branch conectada → **Vercel** e **Render** detectam e **redeploiam automaticamente**.
- Não é preciso configurar chave SSH manual; a autorização é feita pelo GitHub App na hora de conectar.

Para trocar a branch que dispara o deploy: Render → _Settings → Branch_; Vercel → _Settings → Git → Production Branch_.

---

## Resumo das variáveis de ambiente

**Render (API):**
| Variável | Exemplo |
|---|---|
| `DB_URL` | `jdbc:postgresql://ep-xxx.neon.tech/neondb?sslmode=require` |
| `DB_USERNAME` | `neondb_owner` |
| `DB_PASSWORD` | `••••••` |
| `JWT_SECRET` | _(gerado pelo Render)_ |
| `JWT_EXPIRACAO` | `PT8H` |
| `CORS_ORIGENS` | `https://book-manager.vercel.app` |
| `JAVA_TOOL_OPTIONS` | `-XX:MaxRAMPercentage=70.0 -XX:+UseSerialGC -Xss512k -XX:TieredStopAtLevel=1` |

> `JAVA_TOOL_OPTIONS` ajusta a JVM ao container gratuito (512 MB / 0.1 CPU): heap em 70% da RAM (o padrão é 25%), GC serial e JIT só em C1 — evita `OutOfMemoryError` e acelera o boot. Já vem no `render.yaml`.

**Vercel (frontend):**
| Variável | Exemplo |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://book-manager-api.onrender.com` |
