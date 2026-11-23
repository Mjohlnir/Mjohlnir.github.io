# ATLAS — ENTREGA MESTRA: RESTAURAR O SITE PYTHON NO SITE ONLINE

## Objetivo inegociável
O PRODUTO é https://mjohlnir.github.io/ e seu repositório `Mjohlnir/Mjohlnir.github.io`. A versão Python do dia anterior, preservada no repositório `Mjohlnir/Atlas` na branch `atlas-web-v22`, especialmente `legacy/index.html` e `legacy/servidor.py`, é a REFERÊNCIA FUNCIONAL E VISUAL. O objetivo desta execução é recuperar no site online, com fidelidade, todas as telas, gráficos, informações e interações já existentes no legado, preservando melhorias recentes e o Itamae funcional. NÃO iniciar novo produto, framework ou infraestrutura; NÃO substituir o site por um protótipo.

## Trabalho concreto, não planejamento
Leia integralmente os arquivos do site publicado e os arquivos legados; use `docs/V22_PARITY_AUDIT.md` do PR #5 como checklist, mas não encerre após inventário. Identifique a versão mais rica e recente do legado, incluindo mudanças eventualmente distribuídas entre branches. Compare interface e funcionalidades tela a tela, com código e screenshots, e implemente o que falta no repositório do site. Faça uma entrega grande e integrada, com testes e PR real. Não solicite autorização para decisões rotineiras.

## Entrega prioritária 1 — perfil e painéis estatísticos
Recuperar o layout do perfil com cabeçalho e KPIs, três colunas responsivas, painéis laterais e central, gêneros favoritos com barras, leituras recentes com capas, listagem de obras e controles, títulos longos/leituras longas, histórico de atividades, mapa de calor, distribuição por dia da semana, distribuição por hora, distribuição das notas, barras de progresso e estatísticas por status. Reaproveitar CSS/JS e regras de cálculo do legado (classes como `profile-layout`, `profile-kpis`, `activity-heatmap`, `weekday-bars`, `hour-bars`, `grade-bars`). Conferir com dados de teste conhecidos e evitar gráficos vazios ou números inventados. Preservar aparência, interatividade, responsividade e densidade de informações da versão Python.

## Entrega prioritária 2 — biblioteca de mangás e navegação
Recuperar a biblioteca completa além de 240 itens, filtros combináveis e avançados, ordenação, aliases/títulos preferidos, busca, paginação/infinite scroll consistente, modos de visualização (grade normal, grande, compacta e lista), capas, metadados, progresso, notas e navegação para detalhes. Reutilizar regras e estilos legados `catalog-large`, `catalog-compact`, `catalog-list`, `extra-filters` quando pertinentes. Garantir que busca e filtros funcionem sobre toda a coleção e não só a primeira página.

## Entrega prioritária 3 — dossiês e avaliações
Restaurar páginas de detalhes ricas com sinopse, metadados, equipe, personagens, relações, adaptações, recomendações, estatísticas AniList, distribuições, trailers quando disponíveis, links externos e falhas de API tratadas. Reaproveitar o código de consultas e cache do `servidor.py`, adaptando apenas o que for necessário para o ambiente estático/API existente. Recuperar avaliações pessoais multidimensionais, seus pesos/regras reais, edição, salvamento, restauração e backup; não simplificar para nota única. Preservar dados de preferências e aliases.

## Entrega prioritária 4 — atividades, capítulos e anime
Restaurar feed de atividades AniList, histórico de progresso e painéis correlatos. Recuperar acompanhamento de capítulos com distinção entre referência oficial/original, traduzida, progresso individual, fonte e data; preservar dados legados e não substituir a função `atlas-chapters` ativa. Integrar biblioteca de animes com temporadas, episódios, progresso e histórico. Não inventar metadados e não fundir séries por nomes parecidos.

## Itamae — NÃO REGREDIR
O usuário confirmou o fluxo funcional de captura e envio pelo Itamae 0.1.10, com 3.180 reproduções recebidas na interface. Preservar exatamente o fluxo que funciona; não reescrever a ponte sem necessidade. Identificar código local e branches que contêm a versão funcional; se não estiver no repositório, registrar dependência específica, não alegar que o arquivo existe. Separar captura/recebimento de persistência no Supabase: não declarar gravação remota sem evidência. Não apagar histórico do navegador, não mudar userscript ativo, não interferir na sincronização existente. Integrar a visualização de dados quando a fonte persistente estiver disponível, com estados claros.

## Dados e arquitetura mínima
O site publicado é GitHub Pages; mantenha essa arquitetura. Use Supabase existente apenas conforme configuração e autorizações atuais. Não exigir WSL, Docker Desktop ou Supabase CLI no computador do usuário. Não criar banco novo nem modificar produção. Se alguma operação antes feita pelo Python requer backend, adapte usando APIs seguras, funções já existentes ou mocks APENAS em testes; apresente bloqueio específico para eventual função que necessite aprovação. Não exponha service_role, tokens ou dados pessoais. Mantenha isolamento entre usuários.

## Execução e verificação
1. Faça um inventário técnico curto INTERNAMENTE, com mapeamento dos componentes da v21 para os arquivos atuais.
2. Implemente os painéis, gráficos e perfil primeiro; depois biblioteca, dossiês, avaliações e demais módulos, mantendo a versão existente funcional.
3. Rode build/lint/testes disponíveis e amplie testes de regressão. Use navegador automatizado para validar fluxos reais, filtros, gráficos, interações, mobile e desktop; faça capturas reais antes/depois.
4. Teste datasets pequenos, vazios, grandes, com dados incompletos e falha de API. Não afirme testes não executados.
5. Abra UM PR substancial (ou poucos PRs dependentes, se tecnicamente necessário) no repositório `Mjohlnir/Mjohlnir.github.io`, com alterações de código de verdade, capturas e checklist de paridade. Não abrir PR apenas de documentação.
6. Não fazer merge nem publicar sem autorização; entregar PR pronto para revisão e instruções mínimas de publicação. Não parar na primeira falha: corrigir e retestar.

## Aceitação
A entrega NÃO está concluída se faltar o painel de perfil e seus gráficos, se a biblioteca perder itens/filtros, se os dossiês e avaliações forem simplificados, ou se a integração funcional Itamae regredir. Antes de iniciar novas funcionalidades, alcançar paridade verificável com o legado Python. Não se distrair com redesign, Docker, ambiente local, roadmap ou documentação extensa.

## Relatório final em português
Link do PR, commits, arquivos de código alterados, telas e gráficos recuperados, comparação objetiva com o legado, testes executados com resultados, screenshots reais, limitações específicas e passo único para revisão/publicação. Se algo depender de autorização externa, avance no restante e registre o impedimento preciso. Não alegue que o site público foi atualizado enquanto o PR não tiver sido aprovado e implantado.


## Requisito obrigatório — paridade Mangás × Animes e barras de progresso (23/11/2026)
O proprietário confirmou que a barra de progresso da coleção de mangás permanece incorreta. A captura da tela mostra linhas como Berserk (364 capítulos lidos; total não confirmado), Fullmetal Alchemist (116/116, concluído), Goodnight Punpun (0/147, planejado) e Kingdom (773 capítulos lidos; total não confirmado). **Corrigir o cálculo e a apresentação, não apenas o CSS.** A porcentagem não pode ser inventada quando o denominador é desconhecido; nesses casos, usar uma barra explicitamente indeterminada/sem porcentagem, com progresso absoluto visível, distinguindo-a de 0%. Para total conhecido e válido, calcular `clamp(progresso/total,0,1)*100`, respeitar zero, progresso completo e casos inconsistentes. Não usar um denominador substituto, nem exibir `364/?` como percentual. A marcação de concluído deve refletir status e dados reais, sem preencher artificialmente lacunas. Testar casos de total nulo, zero, menor que o progresso, status concluído, planejado, em leitura e dados faltantes. Garantir acessibilidade (texto/aria) e barras perceptíveis nos modos de grade, lista e perfil.

**A biblioteca de animes deve ter indicador equivalente de progresso**, usando episódios assistidos / total de episódios quando disponível; caso contrário mostrar contagem assistida com barra indeterminada. O histórico Itamae é fonte de eventos de reprodução, não prova automática de episódio integralmente concluído: respeitar regras existentes para deduplicação e conclusão e não confundir quantidade de reproduções com episódios únicos assistidos. Não inventar totais de temporadas ou séries, e não misturar episódios entre temporadas.

**Padronização obrigatória das duas abas:** reutilizar componentes, tokens visuais, espaçamentos, filtros compartilháveis, busca, ordenação, cards/linhas, feedback, navegação, dossiês e tratamento de estados. Alinhar apresentação de título, capa, status, nota, progresso, datas e atualização quando semanticamente equivalentes. Manter recursos específicos previamente aprovados para mangás (capítulos, volumes, fontes originais/traduzidas) e animes (episódios, temporadas, duração, histórico Crunchyroll/Itamae); não forçar equivalência semântica onde não existe. Preferir componentes e funções reutilizáveis com configurações por tipo de mídia em vez de duplicar código.

**Critérios de aceite adicionais:** demonstrar em capturas reais mangás e animes lado a lado no mesmo padrão; incluir testes automatizados da função de progresso para ambos, com totais conhecidos e desconhecidos, e testes de filtros, ordenação e visualização nos dois módulos. Conferir os quatro exemplos da captura contra os dados efetivos da biblioteca, sem presumir que esses valores permaneçam iguais após sincronização. Não considerar paridade concluída com barras visualmente preenchidas mas matematicamente falsas.
