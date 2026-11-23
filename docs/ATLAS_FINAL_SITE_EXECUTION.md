# ATLAS — PROMPT MESTRE DE ENTREGA FINAL DO SITE (23/11/2026)

## MISSÃO
Você é o responsável pela implementação integral do Atlas online em https://mjohlnir.github.io/, repositório Mjohlnir/Mjohlnir.github.io. NÃO crie um site novo. Continue do estado atual da main, incluindo os PRs #2, #3 e #4 já integrados. O objetivo prioritário é recuperar, com fidelidade visual e funcional, o site Python mais completo que construímos ontem. Só depois de atingir a paridade devem começar novas funcionalidades. O Itamae e a importação já corrigidos são ativos a preservar.

## FONTES DE VERDADE E INVESTIGAÇÃO MÍNIMA
Leia o código completo do site atual, a versão Python legada em Mjohlnir/Atlas branch atlas-web-v22, especialmente legacy/index.html e legacy/servidor.py, e a matriz de paridade docs/V22_PARITY_AUDIT.md do PR #5. Inspecione outros commits/branches legados somente se necessário para localizar recursos aprovados. Compare os componentes visualmente e por comportamento, usando código, dados e capturas reais; não substitua evidência por suposição. O arquivo docs/ATLAS_SITE_PARITY_MASTER.md do site contém requisitos adicionais e deve ser seguido em conjunto com este. Divergências: priorize funcionalidades comprovadas no legado, preservando melhorias recentes aprovadas.

## ORDEM OBRIGATÓRIA DE EXECUÇÃO
P0 — recuperar dashboards e GRÁFICOS do Python (prioridade máxima).
P1 — recuperar biblioteca de mangás, controles, dossiês e avaliações.
P2 — padronizar e completar biblioteca de animes, preservando particularidades.
P3 — recuperar atividades, capítulos, preferências, backups e integrações.
P4 — testar, corrigir, otimizar, validar paridade e preparar publicação.
Não gastar a execução com planos, instalações ou auditorias sem alterações no código.

## P0 — RESTAURAÇÃO VISUAL DO PYTHON
Recupere o perfil completo com layout rico e responsivo, três colunas quando apropriado, KPIs, cartões e hierarquia visual, estatísticas por status, gráficos de distribuição de notas, gêneros favoritos, histórico e frequência de leitura, gráfico por dia da semana, gráfico por horário, mapa de calor de atividades, leituras recentes, barras de progresso, rankings e outras visualizações comprovadas no legado. Localize e reaproveite os estilos e funções originais (por exemplo profile-layout, profile-kpis, activity-heatmap, weekday-bars, hour-bars, grade-bars) em vez de redesenhar tudo com gráficos genéricos. Restaure legendas, tooltips, rótulos, filtros, interações e responsividade. Os gráficos devem usar dados reais do usuário, com estados vazios/erro honestos; nunca fabricar métricas. Diferencie explicitamente dados de leitura AniList de eventos de reprodução Crunchyroll. Compare screenshots reais do legado e do novo site para garantir densidade informativa, aparência e usabilidade. Não considerar P0 concluído com cards estáticos ou placeholders.

## P1 — MANGÁS
Biblioteca integral, sem corte em 240 itens, paginação/scroll estável, busca em títulos/aliases/autores, filtros combinados por formato/status/ano/autor/nota/gêneros quando disponíveis, ordenação, modos grade/lista/compacto, títulos preferidos, datas, capas, notas e metadados. Dossiês completos: sinopse, autores, artistas, personagens, relações, adaptações, recomendações, links e estatísticas da fonte. Restaurar avaliações multidimensionais com todas as dimensões, regras, pesos, edição, salvamento e exportação/importação/backup compatíveis com a v21. Não substituir avaliação multidimensional por nota única.

Corrigir definitivamente progresso: capítulo lido/total publicado confirmado, sem percentual falso quando total é desconhecido. Tratar obras concluídas, planejadas, em leitura, denominadores zero/nulos, referências atrasadas e leitura maior que referência. Exibir claramente contagem absoluta e origem da referência; respeitar capítulos originais versus traduções. Conferir os exemplos Berserk, Fullmetal Alchemist, Goodnight Punpun e Kingdom contra os dados atuais.

## P2 — ANIMES E PARIDADE ENTRE ABAS
Reutilize componentes e tokens de design de mangás para animes: busca, filtros, ordenação, modos de exibição, cartões/linhas, datas, notas, status, progresso, dossiês e estados de erro. Preserve campos únicos: mangás têm capítulos/volumes/fontes; animes têm episódios/temporadas/duração/reproduções. Barra de progresso dos animes = episódios únicos efetivamente concluídos/total confirmado, por série ou temporada claramente delimitada. Evento de reprodução não equivale automaticamente a episódio concluído; não duplicar episódios nem misturar temporadas. Para total desconhecido, apresentar contagem e barra indeterminada. Preservar e completar coleção AniList adicionada no PR #4, com paginação e status, além de histórico Crunchyroll/Itamae. Separar biblioteca AniList de histórico de reprodução, vinculando séries somente com identificação confiável. Os gráficos relevantes também devem ter tratamento equivalente entre as mídias, sem apagar as diferenças aprovadas.

## P3 — DADOS, ATIVIDADES E INTEGRAÇÕES
Restaurar feed de atividades, gráficos históricos, favoritos de gêneros, preferências, aliases, progresso e referências de capítulos, links e banners. Preservar funções e dados já operantes do Supabase, sem reescrever Itamae. O usuário confirmou 3.180 reproduções recebidas na interface; não confundir isso com persistência permanente comprovada. Testar e indicar se estão no banco e associadas à conta, após reload e em outra sessão. Se uma RPC/migração faltar, preparar mudança separada e teste isolado, sem aplicar no banco ativo sem aprovação. Preservar segurança RLS e isolamento entre contas. Nunca incluir service_role ou segredos no frontend. Não apagar dados locais nem alterar script Itamae funcional sem motivo e testes de regressão.

## EXPERIÊNCIA E QUALIDADE
O Atlas deve parecer um produto coeso, não telas de gerações diferentes. Recuperar os componentes visuais aprovados do Python, manter tema, tipografia, densidade, cores, navegação, responsividade desktop/mobile, acessibilidade, estados de loading/vazio/erro, desempenho em bibliotecas grandes e gráficos com dados incompletos. Sem regressões de login, sincronização, filtros ou progresso.

## AUTONOMIA E FLUXO DE TRABALHO
Não peça aprovação para decisões técnicas rotineiras, correções, commits, branches, testes, componentes, CSS, organização do código ou PRs. Faça ciclos longos de implementação → testes → correções → novos testes. Não pare após a primeira entrega pequena; continue até cobrir as prioridades. Abra um PR grande e revisável com código real, ou poucos PRs encadeados quando tecnicamente indispensável. Não abra PR apenas com documentação. Registre checkpoints para continuar caso haja limite de sessão. Não exija Docker, WSL, Supabase local nem outra infraestrutura no computador do proprietário. Use ambiente de teste isolado quando necessário.

Aprovação explícita é necessária APENAS para merge/publicação, alterações no banco ativo ou dados reais, credenciais, custos e ações destrutivas. Não publique o site sem aprovação. Não use dados pessoais reais em capturas públicas.

## TESTES E CRITÉRIOS DE ACEITAÇÃO
Execute testes unitários e de integração para cálculos e componentes; testes em navegador real (Playwright ou equivalente) com capturas desktop/mobile de todas as telas; casos vazios, incompletos, grandes, offline e API indisponível; regressões de login, AniList e Itamae. Compare cada painel e gráfico do legado Python com o equivalente atual. Verifique que os filtros funcionam sobre a coleção inteira, que as barras não exibem percentuais inventados e que avaliações persistem. Não declarar sucesso baseado apenas em mocks. Documentar separadamente teste sintético, teste real e teste ainda pendente.

## DEFINIÇÃO DE PRONTO
Não encerrar como concluído enquanto os gráficos e painéis Python não estiverem restaurados, os dossiês e avaliações não tiverem paridade, as duas bibliotecas não forem coerentes e os testes não tiverem evidência. Se algum bloqueio externo persistir, conclua todo o restante, identifique precisamente a pendência e entregue o código funcional disponível. A próxima fase de melhorias novas só começa após aprovação da paridade.

## ENTREGA AO PROPRIETÁRIO (EM PORTUGUÊS)
Forneça links dos PRs de código, lista de telas e gráficos restaurados, capturas reais antes/depois, testes executados com resultados, itens ainda não equivalentes, riscos, mudanças que precisam de aprovação e passos mínimos para publicar. Não faça afirmações de que a versão pública mudou sem merge/deploy confirmado. O proprietário não é programador: entregue resultado verificável e poucas decisões, sem ciclos de perguntas.
