# ATLAS — CONTEXTO MESTRE PARA CONTINUIDADE POR QUALQUER IA
**Data-base:** 23/11/2026. **Idioma de trabalho:** português brasileiro. **Tipo:** visão de produto, histórico, arquitetura, decisões, estado conhecido, qualidade e próximos passos. **Não confundir este documento com uma prova de implantação.**

## 1. Identidade, propósito e visão
Atlas é uma plataforma pessoal de acompanhamento, organização e análise de **mangás e animes**, concebida pelo proprietário para reunir numa interface visual rica a biblioteca, leitura, avaliações, progresso, hábitos, informações editoriais, relações entre obras e histórico de reprodução. Evolui de um sistema Python local para um site acessível no navegador, inicialmente para **até cinco usuários**, com possibilidade de chegar a cerca de dez, cada um com conta e dados próprios. Não é uma rede social genérica, um catálogo vazio, uma simples interface para importar JSON ou um projeto de infraestrutura por si só.

**O produto é o site em https://mjohlnir.github.io/**, publicado via GitHub Pages pelo repositório `Mjohlnir/Mjohlnir.github.io`. O repositório `Mjohlnir/Atlas` contém histórico, legado Python, integrações, branches de migração, SQL, testes e documentação. Não confundir repositório de desenvolvimento com repositório de publicação. Não criar outro site, não substituir o site existente por um protótipo e não perder melhorias já integradas.

A experiência desejada é uma biblioteca pessoal com forte densidade de informações, dashboards visualmente elegantes, gráficos realmente úteis, descoberta de obras, dossiês completos e indicadores coerentes. **Recuperar a paridade com o site Python aprovado é a prioridade anterior a qualquer melhoria nova.**

## 2. Evolução histórica
**Origem / v21 Python:** aplicação local em Python 3.9+ com `servidor.py` e `index.html`, APIs locais, cache JSON e integração com AniList, MangaDex e fontes de capítulos. Não era apenas uma prova de conceito: já tinha uma interface rica com perfil, gráficos, biblioteca, filtros, avaliações, dossiês, títulos preferidos, atividades, progresso e animes. Os arquivos foram preservados em `Mjohlnir/Atlas`, branch `atlas-web-v22`, pasta `legacy/`. Conferir também commits/branches mais recentes para não tomar uma cópia incompleta como definitiva. O Python usava arquivos como `biblioteca_atualizada.json`, `avaliacoes_pessoais.json`, `titulos_preferidos.json`, `capitulos_referencia.json`, `anime_atualizado.json`, `atividade_anilist.json` e caches. Esses arquivos são referências de formato, não autorização para expor dados reais.

**Migração v22:** objetivo de tornar o Atlas web multiusuário com Supabase Auth, PostgreSQL/RLS e sincronização individual. O PR #1 de `Mjohlnir/Atlas` introduziu uma v22 parcial. A auditoria PR #5 (`docs/V22_PARITY_AUDIT.md`) documentou perda de paridade: v22 básica tinha catálogo/busca, mas faltavam dossiês, perfil rico, filtros, avaliações editáveis, aliases, gráficos, feed e compatibilidade de capítulos. O PR #3 estabeleceu regras de governança. O PR #4 tratou a ponte Itamae, ainda com dependências e validações pendentes na data da auditoria.

**Crunchyroll/Itamae:** um userscript executado pelo Violentmonkey lê o histórico do Crunchyroll e envia lotes ao Atlas. O proprietário relatou captura e recebimento de **3.180 reproduções únicas** no diagnóstico do navegador. A auditoria documenta que a versão 0.1.8 realizou a captura real, 0.1.9 acrescentou checagem final e 0.1.10 local reduziu a espera (esta última não estava integralmente versionada no PR #4 naquele momento). A transmissão local não equivale à persistência comprovada no Supabase. **Preservar o fluxo que funciona; não reescrever por preferência nem apagar o histórico.** Identificar versão efetiva e código atual antes de alterar.

**Site online:** https://mjohlnir.github.io/ é o produto em evolução. No repositório público `Mjohlnir/Mjohlnir.github.io`, os PRs #2, #3 e #4 foram relatados como integrados em 23/11/2026: recuperação inicial de funcionalidades Python, correção de progresso dos mangás e inclusão da coleção AniList na aba Animes. Isso é evidência de mudanças no código, não prova de paridade completa nem de deploy correto. O README pode estar desatualizado: conferir commits, site servido, testes e capturas atuais. Há planos históricos `docs/ATLAS_SITE_PARITY_MASTER.md` e `docs/ATLAS_FINAL_SITE_EXECUTION.md` em branches de documentação; consultar como requisitos, sem tratá-los como funcionalidades implementadas.

## 3. Público, UX e princípios
O proprietário **não é programador** e espera que a IA tome decisões técnicas rotineiras, execute trabalho substancial e apresente resultados visíveis. O Atlas deve servir à navegação diária: consultar biblioteca completa, encontrar obras, avaliar, acompanhar progresso, explorar dossiês e enxergar hábitos em gráficos. A interface deve preservar a identidade visual do Python: tema escuro refinado, contraste e hierarquia adequados, cards ricos, gráficos claros, densidade informativa, boa responsividade e estados vazios honestos. Não trocar componentes ricos por quatro números ou placeholders.

**Mangás e Animes são módulos irmãos:** padronizar busca, filtros, ordenação, cards, layouts, notas, datas, feedback, dossiês e barras de progresso; preservar especificidades de mangás (capítulos, volumes, fontes originais/traduzidas) e animes (temporadas, episódios, duração, eventos Itamae). Usar componentes compartilhados quando viável, sem equivalências semânticas falsas.

## 4. Referência funcional obrigatória — perfil e gráficos
A versão Python incluía um perfil visual rico, com cabeçalho, KPIs, layout de três colunas, painéis laterais e central, gêneros favoritos, leituras recentes, listas de obras, leituras longas, feed de atividades, gráficos e indicadores. Procurar no legado por `profile-layout`, `profile-kpis`, `profile-panel`, `genre-mini`, `recent-strip`, `activity-heatmap`, `weekday-bars`, `hour-bars`, `grade-bars` e suas funções de renderização.

Restaurar **TODOS os gráficos comprovados no legado**, com os cálculos, legendas, interações e aparência correspondente, incluindo:
- mapa de calor de atividades;
- distribuição por dia da semana e por horário;
- distribuição de notas;
- gêneros favoritos e suas barras;
- estatísticas por status e progresso;
- KPIs do perfil, leituras recentes, leituras longas, frequência/atividade e demais painéis do código.
Evitar gráficos fictícios, dados agregados entre usuários ou contagem de eventos Crunchyroll como capítulos lidos. Usar dados reais disponíveis ou estados vazios claros; indicar a fonte e as limitações. Comparar screenshots reais antes/depois. Esta é a **prioridade visual número 1**.

## 5. Biblioteca de mangás
Exibir toda a coleção (sem corte em 240 itens), com paginação/infinite scroll, busca por títulos e aliases/autores, filtros combináveis por status, formato, gênero, origem, publicação, ano, tags e notas quando houver dados; ordenação; layouts em grade normal, grande, compacta e lista, conforme legado; capas, status, progresso, datas, notas, ano, autores e títulos preferidos. Manter a navegação para detalhes.

**Progresso:** se total de capítulos for conhecido e válido, percentual = progresso/total limitado a 0–100%; se total for desconhecido, mostrar contagem absoluta e barra indeterminada, **sem inventar porcentagem**. Não interpretar desconhecido como 0%. Considerar referências originais/traduzidas, total zero/nulo, progresso superior à referência, obras concluídas e planejadas. Exemplos observados: Berserk 364 lidos com total não confirmado; Fullmetal Alchemist 116/116; Goodnight Punpun 0/147; Kingdom 773 lidos com total não confirmado. Conferir números atuais antes de testar.

## 6. Dossiês e avaliações
O dossiê do Python exibia sinopse, metadados editoriais, equipe/autores/artistas, personagens, relações oficiais, adaptações, recomendações, distribuições AniList, links, trailers quando disponíveis, progresso e informações correlatas. Reutilizar consultas e cache do `servidor.py` (AniList GraphQL e fontes externas) de modo seguro para ambiente web; tratar limites e falhas sem quebrar a interface. Não reduzir dossiê a link externo.

Recuperar avaliação **crítica pessoal multidimensional** com dimensões, pesos e regras originais, edição, média, persistência, backup e restauração; manter nota AniList separada. Recuperar aliases/títulos preferidos por usuário, que não podem ser sobrescritos por sincronizações. O painel de **gêneros favoritos** foi comprovado no legado; favoritar obras manualmente NÃO foi comprovado na auditoria, portanto não declarar que existia sem nova evidência.

## 7. Biblioteca de animes
Coleção AniList, séries, temporadas, episódios, capas, progresso, status, notas, datas, dossiês, filtros e ordenação. Progresso = episódios efetivamente concluídos / total confirmado; sem denominador confiável, mostrar contagem e barra indeterminada. **Uma reprodução não prova que o episódio foi concluído**; não confundir eventos repetidos com episódios únicos. Não misturar temporadas, unidades de duração em segundos/milissegundos nem vincular séries por nome ambíguo sem confirmação. Integrar o histórico Itamae com o catálogo AniList quando a identidade for confiável.

## 8. Integrações, armazenamento e segurança
**AniList:** importar biblioteca de mangás/animes, atualizar status, notas e progresso; preservar edições próprias, aliases e avaliações críticas; respeitar limites de API e diferenciar sincronização de leitura de escrita bidirecional. A v21 tinha rotinas periódicas (biblioteca ~6 h, capítulos ~12 h), mas a operação real da v22 deve ser comprovada, não presumida.

**Crunchyroll/Itamae:** fluxo de captura completa → transmissão em lotes → confirmação → armazenamento → exibição. Retry, idempotência, duplicatas legítimas, vínculo à conta e erros claros. A captura dos 3.180 eventos no navegador é evidência histórica, não contagem garantida no banco.

**Supabase:** autenticação individual, dados pessoais isolados por RLS, permissões restritas, sem service_role no frontend. Na auditoria de 23/11/2026, tabelas pessoais existiam com RLS, mas RPC `atlas_import_batch` e outras funções de sincronização não foram encontradas no banco ativo; havia incompatibilidade entre capítulos globais e esquema por usuário da v22. Esse é um **retrato datado**, que precisa ser reconfirmado antes de agir. Não aplicar SQL de migração no banco ativo sem aprovação. Não exigir Docker, WSL ou Supabase local no PC do proprietário apenas para melhorar o site.

**Capítulos:** preservar fontes e URLs de referência original e traduzida, progresso individual, cache, consultas manuais e função `atlas-chapters` existente; migração somente com backup e rollback.

**Backup e recuperação:** preservar e testar restauração de biblioteca, notas, aliases, progresso, preferências e histórico. Nunca tratar exportação sem teste de restauração como backup validado.

## 9. Qualidade: equipe multidisciplinar
Para cada entrega relevante, trabalhar como equipe de:
1. **Product owner/analista de requisitos:** fidelidade ao objetivo e decisões aprovadas, sem scope creep.
2. **Arquiteto de software sênior:** reaproveitamento, simplicidade, modularidade e compatibilidade.
3. **Engenheiro frontend/UX/UI:** fidelidade visual ao Python, responsividade, acessibilidade e consistência.
4. **Engenheiro backend e integrações:** APIs, AniList, Itamae, cache, autenticação e falhas.
5. **Especialista em dados/PostgreSQL/Supabase:** integridade, consultas, migrações, RLS e isolamento.
6. **Especialista em segurança:** segredos, autenticação, autorização, injeções, exposição de dados e revisão de dependências.
7. **QA/engenheiro de testes:** casos extremos, testes unitários, integração, navegador, regressão, evidência reproduzível.
8. **DevOps/SRE:** deploy proporcional ao tamanho do projeto, logs, rollback e custo/benefício.
9. **Auditor independente:** confrontar declarações com código, testes, dados e capturas; identificar inconsistências.

Os papéis são **perspectivas de revisão**, não alegação de que pessoas reais foram contratadas. Aplicar padrão de excelência solicitado pelo proprietário: pesquisa e fontes verificáveis quando externas; zero afirmações inventadas; auditoria de consistência; foco em custo/benefício e ganhos perceptíveis; testes reais e reprodutíveis; preservar decisões já aprovadas; documentação objetiva; comunicar limitações com clareza.

## 10. Indicadores de qualidade e definição de pronto
Medir e reportar, com evidência:
- **Paridade funcional v21→web:** funcionalidades comprovadas recuperadas / total identificado, com exceções explicitadas.
- **Paridade visual:** comparação de screenshots reais do Python e do site para perfil, gráficos, biblioteca, dossiês e animes; sem substituir avaliação por impressão subjetiva.
- **Cobertura dos gráficos:** cada gráfico do legado implementado com cálculo e estados de erro testados.
- **Integridade dos dados:** contagens reconciliadas, sem perda ou duplicação indevida, avaliações/aliases preservados.
- **Progresso correto:** totais conhecidos/desconhecidos e casos extremos testados em mangás e animes.
- **Segurança:** testes com duas contas, RLS, acesso anônimo, sessão expirada, permissões e segredos.
- **Confiabilidade:** reload, falhas de rede/API, retry, persistência, backup/restore e rollback.
- **Usabilidade:** desktop/mobile, teclado, feedback, navegação, busca/filtros na coleção inteira.
- **Qualidade de entrega:** PRs com código real, testes executados, screenshots reais, limites e instruções de verificação; não só documentos.
Nunca declarar “concluído” com base em simulação, arquivos existentes ou contadores sem persistência. Se houver bloqueios, informar o que foi efetivamente entregue.

## 11. Método de trabalho e autonomia
**O usuário quer grandes entregas verificáveis, não centenas de perguntas.** Inspecione o estado atual, implemente primeiro o perfil/gráficos, depois bibliotecas/dossiês/avaliações, depois integrações/estabilização, sempre preservando o site online e o Itamae. Trabalhe em ciclos longos de implementação → testes → correção → testes. Não interromper por decisões técnicas rotineiras, CSS, commits, branches, testes ou refatorações locais. Documentar checkpoints no GitHub se houver limite de sessão; não prometer trabalho assíncrono sem execução efetiva.

**Autorizado:** ler repositórios, codificar em branches, testar em ambiente isolado, documentar, abrir PRs. **Exige aprovação explícita:** merge em main, deploy externo, alteração do Supabase ativo, migração/exclusão de dados reais, publicação de dados privados, contratação/custos, ações destrutivas. Não criar infraestrutura excessiva para 5–10 usuários.

## 12. Prioridades e sequência
**P0:** recuperar integralmente perfil, dashboards, gráficos, mapa de calor e identidade visual do Python no site existente.
**P1:** biblioteca completa de mangás, filtros, progresso matematicamente correto, dossiês e avaliações.
**P2:** padronizar biblioteca de animes com mangás, preservar particularidades e Itamae.
**P3:** atividades, capítulos, preferências, integrações, persistência, backup, segurança e homologação.
**P4:** regressão completa, desempenho, acessibilidade, preparação de deploy, publicação aprovada.
**Somente após paridade:** novas melhorias, priorizadas por benefício real e custo de manutenção.

## 13. Onde começar e o que entregar
1. Ler `Mjohlnir/Mjohlnir.github.io` main e PRs recentes, comparar com `Mjohlnir/Atlas` branch `atlas-web-v22` e `legacy/`.
2. Conferir `docs/V22_PARITY_AUDIT.md`, `docs/ATLAS_SITE_PARITY_MASTER.md`, `docs/ATLAS_FINAL_SITE_EXECUTION.md`; verificar se documentos estão em branches não integradas.
3. Construir e testar o **código do site existente**, não outro protótipo. Começar pelos gráficos e painéis que o proprietário considera prioritários.
4. Abrir PR(s) de implementação substancial, sem merge automático.
5. Relatório final em português, simples para não programador: funcionalidades e gráficos restaurados, capturas, testes aprovados/falhos/não executados, links dos PRs, bloqueios concretos e ação mínima do proprietário.

**Regra suprema:** o sucesso do Atlas é medido pelo que o usuário consegue efetivamente utilizar no site, não pela quantidade de planos, PRs documentais, ambientes ou ferramentas instaladas.
