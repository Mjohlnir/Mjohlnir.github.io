# Verificação da restauração do Atlas

A comparação usa a main `f95844f` e o frontend de `legacy/` da branch `atlas-web-v22` do repositório Atlas. Os testes visuais usam dados sintéticos e o navegador Chrome.

| Recurso | Implementação | Verificação |
| --- | --- | --- |
| Perfil de mangás | KPIs, gêneros e distribuição por status, leituras recentes, leituras mais longas e notas. Reexibe os painéis ocultos pelo CSS. | Chrome com três colunas no desktop e uma no celular. |
| Atividade de mangás | Calendário de 91 dias, semana e horários com eventos do AniList. O limite de 400 eventos é sinalizado quando o período fica parcialmente coberto. | Células e contagens em unidade, interação e falha de serviço no Chrome. |
| Atividade de animes | Calendário, semana e horários a partir do histórico Crunchyroll. Datas sem horário continuam válidas para semana e calendário. | Chrome, com mesmos componentes visuais e outra fonte. Carga de 3.180 eventos em unidade. |
| Biblioteca de mangás | Pesquisa em sinônimos, filtro por autor e filtros combináveis. Mantém os três modos, dossiê e barras de progresso. | Filtro, ordenação, modos e referências de capítulos no Chrome. |
| Animes | Busca, filtro por status e ordenação da coleção AniList. Dossiê mostra recomendações para correspondências confirmadas. Mantém histórico e modos Crunchyroll. | Progresso, busca e separação de fontes no Chrome. Dossiê com dados reais pendente. |
| Avaliações | Mantém as nove dimensões e o formato de backup v21. Valida o arquivo e atualiza a tela após confirmação do salvamento. | Backup válido e inválido em unidade. Persistência autenticada e recarga em outra sessão pendentes. |
| Integrações | Preserva o Itamae e as integrações de leitura e gravação existentes. | Foram usadas respostas simuladas. A condição dos registros reais e o isolamento entre contas no Supabase ativo ainda requerem homologação. |

O artefato `atlas-paridade-capturas` do GitHub Actions reúne as capturas do teste. O comparativo da versão Python pode ser feito executando o frontend legado com os mesmos dados de teste. A homologação deve usar uma conta de teste autorizada e confirmar a consulta do feed, a gravação de uma avaliação, a recarga em outra sessão e a contagem de eventos persistidos do Itamae.
