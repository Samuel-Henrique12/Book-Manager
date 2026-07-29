# 🚀 Guia de Deploy (100% gratuito)

Este guia publica o Book Manager ao vivo **de graça e sem cartão de crédito**, com **auto-deploy a cada `git push`**.

| Camada | Serviço | Por quê |
|---|---|---|
| Frontend (Next.js) | **Vercel** | Grátis, build nativo de Next, auto-deploy via GitHub |
| API (Spring Boot / Docker) | **Render** | Grátis (750h/mês), roda o `Dockerfile`, auto-deploy via GitHub |
| Banco (PostgreSQL) | **Neon** | Grátis **permanente** (o Postgres grátis do Render expira em 30 dias) |

> **Cold start:** no plano gratuito a API "dorme" após 15 min sem uso e o banco escala a zero. A **primeira requisição** após ociosidade pode levar ~30–60s. Normal para demo/portfólio.

Todos os três serviços fazem login **com a conta do GitHub** — não precisa criar senha nova.

**A ordem importa.** O cadastro de usuário exige confirmação por e-mail, então o envio (passo 5) precisa estar de pé **antes** de você tentar criar a primeira conta (passo 7). Seguir o guia fora de ordem trava na tela de "confirme seu e-mail".

---

## 0. Pré-requisito: código no GitHub

Os serviços fazem deploy a partir do repositório:

```bash
git push origin main
```

> O `render.yaml` fixa `branch: main`. Se quiser usar outra branch, ajuste o Blueprint ou troque depois em _Settings → Branch_ no Render.

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

Guarde também o acesso ao **SQL Editor** do Neon: ele será necessário no passo 7 para criar o primeiro administrador.

---

## 2. API — Render

O repositório já traz um **`render.yaml`** (Blueprint) que configura o serviço automaticamente — incluindo `healthCheckPath: /actuator/health` (o Render só considera o deploy pronto quando a API responde ali) e um `buildFilter` que evita rebuild quando o push só mexeu no frontend.

1. Acesse **https://render.com** → entre com o GitHub.
2. **New → Blueprint** → conecte este repositório → o Render lê o `render.yaml` e cria o serviço `book-manager-api`.
   - _(Alternativa manual: **New → Web Service** → repositório → **Runtime** = Docker → **Dockerfile Path** = `backend/Dockerfile` → **Docker Build Context Directory** = `backend`.)_
3. Em **Environment**, preencha as variáveis marcadas como `sync: false`:
   - `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` → valores do Neon (passo 1)
   - `CORS_ORIGENS` → deixe `http://localhost:3000` **por enquanto** (ajustamos no passo 4)
   - `MAIL_API_KEY`, `MAIL_FROM`, `APP_URL_BASE` → passo 5
   - `GOOGLE_BOOKS_API_KEY` → passo 6
   - `JWT_SECRET` já é gerado automaticamente; `JWT_EXPIRACAO` (`PT8H`), `EMAIL_PROVEDOR` (`brevo`), os defaults do Google Books e o `JAVA_TOOL_OPTIONS` já vêm definidos no Blueprint.
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

## 5. Envio de e-mail (obrigatório antes de criar a primeira conta)

O cadastro exige confirmação por e-mail e existe fluxo de redefinição de senha. Em desenvolvimento isso roda no **Mailpit** (SMTP falso no `docker-compose`), mas **em produção o SMTP não funciona**: o plano *free* do Render [bloqueia tráfego de saída nas portas 25, 465 e 587](https://render.com/changelog/free-web-services-will-no-longer-allow-outbound-traffic-to-smtp-ports).

Por isso a aplicação tem dois adaptadores, escolhidos por `EMAIL_PROVEDOR`:

| Valor | Implementação | Onde |
|---|---|---|
| `smtp` (padrão) | `ServicoEmailSmtp` — Mailpit | Local |
| `brevo` | `ServicoEmailBrevo` — API HTTP em `api.brevo.com` (porta 443, não bloqueada) | Render |

Com `SPRING_PROFILES_ACTIVE=prod`, a aplicação **se recusa a subir** com `EMAIL_PROVEDOR=smtp` — justamente para não ir ao ar com um envio que nunca funcionaria.

### Passo a passo (Brevo — 300 e-mails/dia, grátis, sem cartão)

1. Criar conta em **[brevo.com](https://www.brevo.com/)** e confirmar o e-mail de cadastro.
2. **Verificar um remetente**: _Senders, Domains & Dedicated IPs → Senders → Add a sender_. Informe um e-mail seu; a Brevo manda um código de validação. Sem remetente verificado, todo envio é recusado.
3. **Gerar a chave**: _menu do perfil → SMTP & API → API Keys → Generate a new API key_. Copie na hora — ela não é exibida de novo.
4. No Render, em _Environment_, preencher:
   - `MAIL_API_KEY` = a chave gerada
   - `MAIL_FROM` = o e-mail verificado no passo 2
   - `APP_URL_BASE` = a URL da Vercel, **sem barra no final**
5. Redeploy. No log deve aparecer `E-mail 'Confirme seu e-mail — Book Manager' enviado pela Brevo`.

> **`APP_URL_BASE` é o detalhe que mais quebra.** É ele que monta os links dentro do e-mail. Se ficar no padrão, toda mensagem enviada em produção aponta para `http://localhost:3000` e ninguém consegue confirmar a conta.

> Trocar de provedor depois é barato: `ServicoEmail` é uma interface, e só o adaptador muda.

### Se o envio falhar com 503

A API devolve sempre a mesma mensagem genérica; o motivo real fica no log do Render. Procure por `Brevo`:

```
Brevo recusou o envio de '...' — HTTP 401 — remetente '...' — resposta: {"message":"...","code":"..."}
```

| Resposta da Brevo | Causa e correção |
|---|---|
| `unrecognised IP address` | A conta está com **Authorised IPs** ativo. O plano free do Render usa [faixas de saída compartilhadas](https://render.com/docs/outbound-ip-addresses), não IP fixo — liberar um IP só funciona até ele mudar. Desative a restrição em [app.brevo.com/security/authorised_ips](https://app.brevo.com/security/authorised_ips). |
| `Key not found` / `unauthorized` | Chave errada, cortada ou com espaço. Deve começar com `xkeysib-` e ser uma **API key**, não uma chave SMTP (são listas diferentes em *SMTP & API*). |
| Mensagem citando `sender` | `MAIL_FROM` não bate exatamente com um remetente verificado. |

> Remetente em domínio freemail (`@gmail.com`) gera aviso no painel mas **não** bloqueia: a Brevo substitui o endereço por um compatível. É questão de entregabilidade, não de erro.

---

## 6. Chave do Google Books (recomendado)

O acervo é populado pela Google Books API. **Sem chave a importação ainda funciona**, mas com a cota anônima por IP — que, num IP compartilhado como o do plano gratuito do Render, se esgota rápido e devolve 429.

1. Acesse o **[Google Cloud Console](https://console.cloud.google.com/)** → crie um projeto (ou use um existente).
2. _APIs e serviços → Biblioteca_ → busque **Books API** → **Ativar**.
3. _APIs e serviços → Credenciais_ → **Criar credenciais → Chave de API** → copie.
4. Recomendado: em **Restringir chave**, limite a *Books API*. A cota gratuita é de mil requisições por dia.
5. No Render, preencha `GOOGLE_BOOKS_API_KEY`.

Os outros parâmetros já vêm no Blueprint e podem ser ajustados: `GOOGLE_BOOKS_IDIOMA` (`pt`), `GOOGLE_BOOKS_MAX_POR_TEMA` (`200`) e, se quiser escolher os assuntos, `GOOGLE_BOOKS_TEMAS` com uma lista separada por vírgulas (vazio usa os 20 temas padrão).

---

## 7. Primeira conta, primeiro administrador e verificação

1. Abra a URL da Vercel e **crie sua conta**.
2. **Confirme pelo e-mail** que chegou (é o passo 5 em ação). O link já abre a sessão.
3. **Promova a conta a administrador.** O primeiro `ADMIN` não existe por padrão — sem ele o painel de usuários, a importação do catálogo e a moderação de spoiler ficam inacessíveis. No **SQL Editor do Neon**:

   ```sql
   UPDATE usuario SET perfil = 'ADMIN' WHERE email = 'seu@email.com';
   ```

   Saia e entre de novo para o token refletir o novo perfil. Daí em diante você promove outras contas pela própria tela `/admin/usuarios`.
4. **Popule o acervo:** em `/admin/usuarios`, dispare a importação do Google Books e acompanhe o progresso na tela. Ela roda em segundo plano.
5. Confira o resto: buscar no acervo, abrir um livro, marcar na estante, avaliar e comentar.

> Se a primeira ação demorar, é o cold start (API e banco acordando) — repita após alguns segundos.

---

## 8. Auto-deploy (a cada push)

Ao conectar o repositório, Vercel e Render instalam o **GitHub App** (o equivalente moderno da _deploy key_). A partir daí:

- **`git push`** na branch conectada → **Vercel** e **Render** detectam e **redeploiam automaticamente**.
- Não é preciso configurar chave SSH manual; a autorização é feita pelo GitHub App na hora de conectar.

Para trocar a branch que dispara o deploy: Render → _Settings → Branch_; Vercel → _Settings → Git → Production Branch_.

---

## Resumo das variáveis de ambiente

**Render (API):**
| Variável | Exemplo | Origem |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | `prod` | Blueprint |
| `DB_URL` | `jdbc:postgresql://ep-xxx.neon.tech/neondb?sslmode=require` | Neon (passo 1) |
| `DB_USERNAME` | `neondb_owner` | Neon |
| `DB_PASSWORD` | `••••••` | Neon |
| `JWT_SECRET` | _(gerado pelo Render)_ | Blueprint |
| `JWT_EXPIRACAO` | `PT8H` | Blueprint |
| `CORS_ORIGENS` | `https://book-manager.vercel.app` | Vercel (passo 4) |
| `EMAIL_PROVEDOR` | `brevo` | Blueprint |
| `MAIL_API_KEY` | `xkeysib-••••••` | Brevo (passo 5) |
| `MAIL_FROM` | `seu-remetente-verificado@gmail.com` | Brevo |
| `MAIL_FROM_NOME` | `Book Manager` | Blueprint |
| `APP_URL_BASE` | `https://book-manager.vercel.app` | Vercel (passo 5) |
| `GOOGLE_BOOKS_API_KEY` | `AIza••••••` | Google Cloud (passo 6) |
| `GOOGLE_BOOKS_IDIOMA` | `pt` | Blueprint |
| `GOOGLE_BOOKS_MAX_POR_TEMA` | `200` | Blueprint |
| `JAVA_TOOL_OPTIONS` | `-XX:MaxRAMPercentage=70.0 -XX:+UseSerialGC -Xss512k -XX:TieredStopAtLevel=1` | Blueprint |

> Com `SPRING_PROFILES_ACTIVE=prod`, a aplicação **se recusa a iniciar** se `JWT_SECRET` estiver ausente, curto demais ou com o valor de exemplo do repositório. É proposital: subir com o segredo padrão permitiria a qualquer pessoa forjar um token válido.

> `JAVA_TOOL_OPTIONS` ajusta a JVM ao container gratuito (512 MB / 0.1 CPU): heap em 70% da RAM (o padrão é 25%), GC serial e JIT só em C1 — evita `OutOfMemoryError` e acelera o boot. Já vem no `render.yaml`.

**Vercel (frontend):**
| Variável | Exemplo |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://book-manager-api.onrender.com` |
