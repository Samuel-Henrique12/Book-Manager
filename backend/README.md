# Book Manager — API

API REST em Spring Boot 3.4.7 sobre Java 21 e PostgreSQL 16. Este documento é para quem vai **ler ou mexer no código Java**. Para rodar o projeto inteiro, endpoints e visão geral, veja o [README da raiz](../README.md).

---

## Rodar

```bash
# banco e caixa de e-mail (na raiz do repositório)
docker compose up -d db mail

# API com hot reload
cd backend
./mvnw spring-boot:run
```

A API sobe em http://localhost:8080 · Swagger em `/swagger-ui.html` · health em `/actuator/health`.

Só compilar, sem empacotar: `./mvnw -q test-compile`.

---

## Organização — package-by-feature

Cada domínio reúne controller, service, repository, entidade e DTOs no **mesmo pacote**. Não existem pastas `controllers/`, `services/` e `models/` no topo: a camada é um papel dentro da feature, não um diretório do projeto.

```
com/bookmanager/
├── BookManagerApplication.java
├── autenticacao/          # 21 arquivos
│   ├── AutenticacaoController · AutenticacaoService
│   ├── dto/               # registro, login, token, sessão, mensagem
│   ├── seguranca/         # chain, filtro JWT, UserDetailsService, entry point 401
│   └── verificacao/       # tokens de confirmação e redefinição
├── usuario/               # conta própria (/minha-conta) e painel (/usuarios)
├── livro/                 # CRUD, busca, ordenação, enriquecimento da listagem
├── categoria/             # gêneros, slug, tradução PT-BR
├── estante/               # vaga do leitor: status, favorito, progresso
├── avaliacao/             # nota, resenha, distribuição
├── comentario/            # conversa por livro, moderação de spoiler
├── atividade/             # feed da comunidade
├── integracao/            # Google Books: porta, adapter, conversor, importação
└── comum/                 # transversal: auditoria, exceções, e-mail, config, paginação
```

O que mora em `comum/`:

| Pacote | Conteúdo |
|---|---|
| `auditoria/` | `EntidadeAuditavel` (`@MappedSuperclass` com soft delete e datas), `AuditorAwareImpl`, configuração do JPA Auditing |
| `excecao/` | `ManipuladorGlobalDeExcecoes` e as 8 exceções de domínio |
| `email/` | Porta `ServicoEmail` e as duas implementações (SMTP e Brevo), modelo HTML |
| `config/` | OpenAPI, CORS, `ValidadorDeSegredos` |
| `paginacao/` | `RespostaPaginadaDTO`, o envelope de listagem |

---

## O caminho de uma requisição autenticada

`GET /books?title=1984` com `Authorization: Bearer <token>`:

1. **`FiltroAutenticacaoJwt`** (`OncePerRequestFilter`) lê o header, valida assinatura, emissor e expiração em `ServicoTokenJwt`, carrega o usuário por e-mail via `DetalhesUsuarioService` e popula o `SecurityContext`. Token válido de conta removida segue sem autenticar — o soft delete faz o usuário desaparecer da busca.
2. **`ConfiguracaoSeguranca`** aplica `anyRequest().authenticated()`. Sem contexto, o `PontoDeEntradaNaoAutorizado` devolve 401 em `application/problem+json` — mesmo formato dos outros erros.
3. **`LivroController`** recebe `Pageable` e o `UserDetails` por `@AuthenticationPrincipal`. Não tem lógica: valida com `@Valid`, chama o serviço, devolve `ResponseEntity`.
4. **`LivroService`** consulta o repositório e **enriquece a página inteira com duas consultas agregadas** — a marcação de estante de quem consulta e a nota da comunidade. Nunca uma consulta por item.
5. **`LivroMapper`** (MapStruct) converte entidade → DTO. A entidade JPA não sai daqui.

Quando algo falha, ninguém captura no controller: a exceção de domínio sobe até o `@RestControllerAdvice`, que a traduz em `ProblemDetail` com o status certo.

---

## Convenções

**Nomenclatura** — domínio em português, termo de framework em inglês. `LivroService`, não `ServicoLivro`; `EstanteController`, `UsuarioRepository`, `AvaliacaoRequestDTO`. Mensagens de erro, log e comentários em PT-BR.

**Injeção de dependência** — sempre por construtor: `@RequiredArgsConstructor` com campos `private final`. Nunca `@Autowired` em campo.

**DTOs** — `record` imutável. Entrada com Bean Validation (`@NotBlank`, `@Size`…) e `@Valid` no controller; saída sempre um DTO próprio. A entidade não carrega constraint de validação — só as de banco (`@Column(nullable, length)`).

**Entidades** — `@Getter`/`@Setter` e `@EqualsAndHashCode(onlyExplicitlyIncluded = true)` pelo ID. **Nunca `@Data`**, que geraria `toString`/`equals` disparando lazy loading e recursão pelas relações.

**Controllers finos** — orquestram e nada mais. Sem regra de negócio, sem `try/catch` para montar resposta de erro.

**Services** — `@Transactional` na escrita, `@Transactional(readOnly = true)` na leitura. Busca com `orElseThrow(() -> new RecursoNaoEncontradoException(...))`.

**Repositories** — derived query quando dá (`findByEmailIgnoreCase`), `@Query` JPQL quando a consulta é complexa. N+1 se resolve aqui ou na entidade, nunca iterando no serviço.

**Logging** — `@Slf4j`. Nunca `System.out`, nunca senha, token, hash ou dado pessoal no log.

**Comentários** — rótulo curto em Title Case (`// Relacionamento de Categorias`), não parágrafo explicativo. Sem Javadoc.

---

## Erros

O `ManipuladorGlobalDeExcecoes` mapeia exceção de domínio para status HTTP:

| Exceção | Status |
|---|---|
| `RecursoNaoEncontradoException` | 404 |
| `RegraDeNegocioException` | 422 |
| `ConflitoException` | 409 |
| `CredenciaisInvalidasException`, `TokenInvalidoException` | 401 |
| `ContaNaoConfirmadaException`, `AccessDeniedException` | 403 |
| `FalhaNoEnvioDeEmailException`, `IntegracaoIndisponivelException` | 503 |
| `MethodArgumentNotValidException`, `HttpMessageNotReadableException` | 400 |

O handler de validação tem um detalhe que vale conhecer: ele lê a `@JsonProperty` do record por reflection para reportar o campo **com o nome do contrato** (`title`), não com o do atributo Java (`titulo`). Sem isso, o formulário do frontend não conseguiria casar o erro com o input.

Ao criar uma exceção nova, mapeie no advice — não lance `RuntimeException` genérica.

---

## Banco e migrations

Flyway é dono do schema; o Hibernate roda com `ddl-auto: validate` e **quebra o boot** se a entidade divergir das tabelas. Isso é proteção, não obstáculo.

Para mudar o schema:

1. Crie `V6__descricao_curta.sql` em `src/main/resources/db/migration/`. Nunca edite uma migration já aplicada — o Flyway valida o checksum e recusa subir.
2. Ajuste a entidade correspondente.
3. **Atualize o [`schema.sql`](../schema.sql) da raiz**, que é o script consolidado entregue com o desafio. Ele não é gerado automaticamente; se esquecer, os dois divergem em silêncio.
4. Suba a API. Se `validate` passar, entidade e banco estão de acordo.

Índice único em tabela com soft delete **precisa ser parcial**:

```sql
CREATE UNIQUE INDEX ux_usuario_email_ativo ON usuario (LOWER(email)) WHERE removido = FALSE;
```

Sem o `WHERE`, um registro excluído logicamente continuaria ocupando o valor para sempre.

---

## Testes

```bash
./mvnw test                                  # tudo
./mvnw test -Dtest=EstanteServiceTest        # uma classe
./mvnw test -Dtest='*ServiceTest'            # por padrão de nome
```

São **78 testes unitários** de serviço, com Mockito e sem subir o contexto do Spring — rápidos e independentes de Docker. O adapter do Google Books é testado com `MockRestServiceServer`, então nenhum teste sai para a internet.

O teste de integração `BookManagerApplicationTests` usa Testcontainers (Postgres real e efêmero) e **está desatualizado**: foi escrito antes da confirmação de e-mail e da restrição de escrita a administrador, então ainda espera token na resposta do cadastro e `PUT /books/{id}` liberado para leitor comum. Precisa de reescrita, e exige Docker respondendo.

Testar comportamento, não implementação: entrada → saída ou efeito observável.

---

## Configuração

Tudo tipado em `@ConfigurationProperties`, não em `@Value` espalhado:

| Classe | Prefixo | Observação |
|---|---|---|
| `PropriedadesJwt` | `app.jwt` | **Derruba o boot** se o segredo faltar ou tiver menos de 32 bytes |
| `PropriedadesCors` | `app.cors` | Origens permitidas |
| `PropriedadesEmail` | `app.email` | Escolhe SMTP ou Brevo |
| `PropriedadesVerificacao` | `app.verificacao` | Validade dos tokens: 24h para confirmação, 1h para redefinição |
| `PropriedadesGoogleBooks` | `app.integracao.google-books` | Chave, idioma, teto por tema e os 20 temas padrão |

Somando a esses, o `ValidadorDeSegredos` recusa subir com `SPRING_PROFILES_ACTIVE=prod` se o `JWT_SECRET` for um dos placeholders versionados, ou se o provedor de e-mail for SMTP (que não funciona no plano gratuito do Render). Em desenvolvimento, apenas registra um aviso.

---

## Duas armadilhas que o código já contorna

Valem menção porque parecem bug quando se mexe no código sem saber:

**`@ManyToOne` é `EAGER` de propósito.** O Hibernate proíbe `LAZY` quando a entidade alvo usa `@SoftDelete`. Trocar para `LAZY` não compila conceitualmente — falha em runtime. Para performance de listagem, a saída é fetch join, `@BatchSize` ou projeção na consulta, nunca mudar o fetch type.

**`@Async` e `@Transactional` não funcionam em auto-invocação.** Ambos dependem do proxy do Spring, que só existe na chamada *entre* beans. É por isso que a importação está dividida: `ServicoImportacaoLivros.agendar()` é síncrono (para responder 409 se já houver importação em curso) e chama `executar()`, que é `@Async` — e o controller precisa chamar os dois pelo bean, não um pelo outro dentro da mesma instância.
