import type { Category, Post } from "@/lib/types";

export const demoCategories: Category[] = [
  { id: "cat-process", name: "Processo", slug: "processo", color: "#E8C7D2" },
  { id: "cat-code", name: "Código", slug: "codigo", color: "#B5D6E0" },
  { id: "cat-art", name: "Arte", slug: "arte", color: "#D8CFEA" }
];

export const demoPosts: Post[] = [
  {
    id: "demo-soulscapes",
    title: "Construindo Soulscapes entre desenho e código",
    slug: "construindo-soulscapes",
    excerpt: "O que mudou quando parei de separar concept art, narrativa e desenvolvimento do jogo.",
    content: `Soulscapes começou no papel, muito antes de existir uma tela jogável. Eu desenhava personagens, anotava nomes nas margens e tentava entender como aquele mundo deveria se comportar.

## Um projeto que atravessa linguagens

Quando comecei a programar, percebi que o código não precisava apagar a parte artesanal do processo. Pelo contrário: as regras do jogo poderiam nascer das mesmas perguntas que apareciam nos desenhos.

- Como cada povo ocupa o espaço?
- O que a silhueta de um personagem conta antes do diálogo?
- Como transformar atmosfera em interação?

Hoje o projeto cresce como uma conversa entre ilustração, escrita e sistemas. Ainda há muito por fazer, mas essa mistura é justamente o que mantém Soulscapes vivo.`,
    cover_url: null,
    status: "published",
    featured: true,
    category_id: "cat-process",
    category: demoCategories[0],
    created_at: "2026-09-20T12:00:00.000Z",
    updated_at: "2026-09-20T12:00:00.000Z",
    published_at: "2026-09-20T12:00:00.000Z"
  },
  {
    id: "demo-accessibility",
    title: "Acessibilidade não é o último checklist",
    slug: "acessibilidade-nao-e-checklist",
    excerpt: "Algumas decisões simples que estou aprendendo a tomar antes da interface ficar pronta.",
    content: `Existe uma diferença enorme entre corrigir uma interface e pensar nela de forma acessível desde o início.

## Começar pelo básico funciona

Contraste legível, navegação por teclado, textos objetivos e áreas de toque confortáveis não são detalhes decorativos. Eles mudam quem consegue usar o projeto.

Tenho tentado levar essas decisões para meus trabalhos desde o primeiro rascunho. Nem sempre acerto de primeira, mas testar cedo deixa o processo mais honesto — e o resultado, melhor para todo mundo.`,
    cover_url: null,
    status: "published",
    featured: false,
    category_id: "cat-code",
    category: demoCategories[1],
    created_at: "2026-09-14T12:00:00.000Z",
    updated_at: "2026-09-14T12:00:00.000Z",
    published_at: "2026-09-14T12:00:00.000Z"
  },
  {
    id: "demo-sketchbook",
    title: "O caderno também faz parte da interface",
    slug: "caderno-e-interface",
    excerpt: "Rascunhos, setas tortas e anotações viram decisões visuais mais claras no computador.",
    content: `Antes de abrir o editor, eu gosto de rabiscar. O papel tira a pressão de acertar e deixa ideias diferentes convivendo por alguns minutos.

## Do gesto para a tela

Nem tudo vai para o projeto final. Às vezes sobra apenas um ritmo, uma borda ou a ordem em que as informações aparecem. Ainda assim, o desenho cumpriu seu papel: ajudou a encontrar uma intenção antes de escolher componentes.

Meu objetivo não é fazer o digital parecer papel. É conservar no resultado final um pouco da curiosidade que existia no primeiro esboço.`,
    cover_url: null,
    status: "published",
    featured: false,
    category_id: "cat-art",
    category: demoCategories[2],
    created_at: "2026-09-06T12:00:00.000Z",
    updated_at: "2026-09-06T12:00:00.000Z",
    published_at: "2026-09-06T12:00:00.000Z"
  }
];
