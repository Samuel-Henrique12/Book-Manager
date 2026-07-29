# Book Manager — Web

Interface em Next.js 16 (App Router), React 19 e TypeScript, com Tailwind v4. Este documento é para quem vai **mexer no código do frontend**. Para rodar o projeto inteiro, veja o [README da raiz](../README.md).

---

## Rodar

```bash
npm install
npm run dev          # http://localhost:3000
```

Precisa da API no ar (`docker compose up -d` na raiz sobe banco, e-mail e API). A URL da API vem de `NEXT_PUBLIC_API_URL`, com default `http://localhost:8080`.

Antes de commitar: `npx tsc --noEmit && npm run build`. Não há suíte de testes no frontend — o `build` é a rede de segurança.

---

## Rotas

Dois grupos: `(app)` exige sessão, `(auth)` é público. O grupo não aparece na URL — serve para dar um layout diferente a cada um.

**`(app)`** — shell com sidebar fixa no desktop e barra superior com gaveta no mobile:

| Rota | O que é |
|---|---|
| `/` | Home: saudação por horário, números da estante, "continue lendo", vitrines de recentes e destaques, feed da comunidade e portas de entrada por categoria |
| `/books` | Acervo. Busca com debounce, filtro por categoria, ordenação, alternância grade/lista e paginação — tudo espelhado na query string |
| `/books/new` | Cadastro de livro com pré-visualização ao vivo do cartão |
| `/books/[id]` | Detalhe: ficha técnica, sinopse, ações de estante, avaliações e conversa |
| `/books/[id]/edit` | Edição (só administrador; a tela mostra painel de acesso restrito para os demais) |
| `/estante` | Prateleira pessoal com paginômetro e filtros por status e favoritos |
| `/conta` | Dados, troca de senha e exclusão da própria conta |
| `/admin/usuarios` | Painel de usuários e importação do Google Books (só administrador) |

**`(auth)`** — split screen com painel decorativo à direita: `/login` (com o registro no mesmo arquivo, alternado por estado), `/confirmar-email`, `/esqueci-senha`, `/redefinir-senha`.

**`proxy.ts`** (o antigo `middleware.ts`, renomeado pela convenção do Next 16) redireciona por presença do cookie de token: sem token fora das rotas públicas vai para `/login`; com token nas públicas vai para `/`. É conveniência de navegação — **quem autoriza de verdade é a API**, e a tela de edição confere o perfil por conta própria.

---

## `lib/` — a camada que fala com a API

Um módulo por domínio, mais quatro de infraestrutura.

**`api.ts`** é o ponto único de saída. Injeta o `Bearer`, define o `Content-Type`, trata `204` como `undefined`, converte a resposta de erro em `ApiError` carregando o `ProblemDetail` — e, se um **401 vier de fora de `/auth`**, entende como sessão expirada: limpa os cookies e manda para `/login`.

**`auth.ts`** guarda a sessão em cookie (`bm_token`, `bm_nome`) via `js-cookie`. "Lembrar-me" define se o cookie dura um dia ou só a sessão do navegador. `obterEmail()` decodifica o payload do JWT para ler o `sub`.

**`alerta.tsx`** — `ProvedorAlerta` + `useAlerta()`. Os alertas são **modais que devolvem `Promise`**, resolvida quando o usuário fecha. Isso permite encadear navegação depois da confirmação, coisa que um toast não daria.

**`erros.ts`** — `useAplicarErro()` transforma o mapa `campos` do `ProblemDetail` em erro por input do React Hook Form; o que não for de campo vira modal.

Os módulos de domínio (`livros`, `estante`, `avaliacoes`, `usuarios`, `contas`, `categorias`, `atividade`, `integracao`) só montam a URL e chamam `apiFetch`. `tipos.ts` concentra os contratos — **no formato em que a API responde**, ou seja, em inglês (`title`, `shelfStatus`, `pagesRead`), enquanto o resto do código é PT-BR. `conta.ts` expõe o hook `useConta()`, fonte única de `podeAdministrar`.

Ainda em `lib/`: `rotulos.ts` (traduções de enum e cores das fitas de status), `spines.ts` (cor e iniciais para capas e avatares sem imagem) e `saudacao.ts` (a frase da home conforme o horário).

---

## Padrões

**Estado de servidor é do TanStack Query.** Nada de `useEffect` + `useState` para buscar dados. A query key é sempre um array com os parâmetros que afetam o resultado, o que faz o cache se separar sozinho quando o filtro muda:

```tsx
useQuery({
  queryKey: ["livros", { titulo, categoria, ordenacao, pagina }],
  queryFn: () => listarLivros({ titulo, categoria, ordenacao, pagina }),
});
```

Depois de uma mutação, invalide as chaves afetadas em vez de recarregar a página.

**Formulários** são React Hook Form + Zod. O schema valida no cliente para dar retorno imediato; o servidor valida de novo e devolve os erros por campo, aplicados pelo `useAplicarErro`. As duas validações existem de propósito — a do cliente é experiência, a do servidor é a que vale.

**`"use client"` só quando precisa.** A maioria das telas é client component porque depende de Query e de interação, mas componente que só recebe props e renderiza não precisa da diretiva.

**Estado na URL.** No acervo, busca, categoria, ordenação, página e layout vivem na query string via `router.replace`. Qualquer visão vira link compartilhável e o botão voltar funciona.

**Nomenclatura** — componentes, funções e variáveis em PT-BR (`CartaoLivro`, `listarLivros`, `aoEnviar`); só os contratos da API ficam em inglês, porque é o que o servidor devolve.

---

## Componentes

`components/ui/` guarda os blocos genéricos, e é o primeiro lugar a olhar antes de criar algo novo: `Painel` (estado vazio, erro e aviso, mais o `TituloSecao`), `Chip`, `Metrica`, `BotaoAcao`, `EstrelasNota`, `BarraProgresso`, `TrilhoRolavel` (rolagem lateral sem barra, com desvanecimento nas bordas), `ModalAlerta`, `Aviso` e `TextoComSpoiler`.

Os demais são por domínio: `livro/` (cartão, lista, filtro de categorias, painel de estante, avaliações, conversa), `home/` (resumo, continue lendo, feed), `conta/`, `admin/` e `login/`. Na raiz de `components/` ficam os de aplicação: `Sidebar`, `BarraTopoMovel`, `LivroForm`, `CampoFormulario`, `Paginacao`, `ModalConfirmacao` e `Skeletons`.

---

## Tema

O visual é definido por tokens em `app/globals.css`, no `@theme` do Tailwind v4 — não há `tailwind.config.js`. Use os tokens semânticos (`bg-superficie`, `text-tinta`, `border-borda`, `text-terracota`) em vez de cores literais: mudar a paleta deve ser uma edição num arquivo só.

As fontes vêm por `next/font` no layout raiz: Instrument Sans (texto), Newsreader (títulos) e Space Grotesk (números).
