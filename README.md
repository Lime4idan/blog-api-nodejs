# Entrelinhas — blog de Alicia Borges

Um blog editorial e comunitário para publicar notas sobre código, arte, design e processos criativos. Além do espaço autoral de Alicia Borges, leitores podem criar uma conta, escrever em Markdown e enviar textos para moderação.

![Prévia da página inicial do Entrelinhas](docs/entrelinhas-preview.png)

## O que já funciona

- página inicial responsiva com busca e filtros por categoria;
- páginas individuais com conteúdo em Markdown;
- cadastro e login de membros com Supabase Auth;
- área pessoal para escrever, editar e acompanhar envios;
- fila de moderação: colaboradores não publicam diretamente;
- painel administrativo para revisar, aprovar, rejeitar e editar textos;
- rascunhos, destaque e pré-visualização;
- upload de capas pelo Supabase Storage;
- API pública de leitura em `/api/posts` e `/api/posts/[slug]`;
- perfis com papéis `member` e `admin`;
- Row Level Security para isolar rascunhos, proteger a moderação e impedir autopublicação;
- modo de demonstração local quando o Supabase ainda não está conectado.

## Stack

- Next.js 16 com App Router
- TypeScript
- Supabase Auth, Postgres e Storage
- React Markdown
- CSS autoral, sem biblioteca visual pronta

## Rodando localmente

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). Sem variáveis de ambiente, o site usa três textos de demonstração e mantém o painel bloqueado.

## Conectando o Supabase

1. Crie um projeto no Supabase.
2. Abra o SQL Editor e execute [`supabase/schema.sql`](supabase/schema.sql).
3. Em Authentication, crie a conta administradora usando `admin@entrelinhas.local`, ou ajuste o e-mail marcado como administrador no final do SQL.
4. Copie a URL e a publishable key para `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=SUA_CHAVE_PUBLICA
```

5. Em **Authentication → URL Configuration**, adicione `http://localhost:3000/auth/callback` e a URL pública do projeto como destinos permitidos.
6. Reinicie o servidor. A autora entra por `/admin/login`; membros usam `/community/login`.

Se o banco já existia antes da área comunitária, execute apenas a migração [`supabase/migrations/20260930_community.sql`](supabase/migrations/20260930_community.sql).

Nunca coloque uma secret key ou service role key no navegador. As permissões públicas são limitadas pelas políticas RLS do banco.

## Scripts

```bash
npm run dev        # desenvolvimento
npm run typecheck  # validação TypeScript
npm run lint       # análise estática
npm run build      # build de produção
```

## Estrutura principal

```text
app/                 rotas públicas, admin e API
components/          componentes de interface e editor
lib/                 consultas, tipos e clientes Supabase
supabase/             schema, migrações, storage e políticas RLS
```

Projeto de [Alicia Borges](https://github.com/Lime4idan).
