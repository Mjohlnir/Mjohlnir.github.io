# Manga Atlas — decisões de interface

Registro interno de decisões de produto. Este documento **não é renderizado no corpo do site**.

## 2026-11-23 — Navegação e apresentação

- **Tela inicial:** Perfil, após a autenticação e o carregamento dos dados. A tela de importação permanece acessível para contas sem biblioteca configurada.
- **Navegação principal:** Meu perfil, Mangás e Animes; cada seção mantém sua navegação contextual.
- **Largura:** os três módulos compartilham a mesma área de conteúdo (`max-width: 1600px`, com espaçamentos responsivos). A biblioteca de animes não usa mais um `max-width` interno de 1320 px nem padding lateral adicional.
- **Banner da biblioteca de mangás:** transferido do topo para o rodapé da seção de Mangás e reduzido em tamanho; não aparece no Perfil ou em Animes.
- **Cabeçalho:** uma ação principal visível de atualização AniList (ícone com nome acessível e indicador de carregamento) e um ícone de configurações.
- **Configurações:** menu que contém acesso à importação/sincronização de dados, exportação/importação de avaliações, informações sobre as fontes e saída da conta. A página de importação continua disponível pelo menu e mantém as rotinas de integração já existentes.
- **Conteúdo editorial:** textos que descreviam decisões de implementação, origem técnica ou limitações internas foram removidos das telas principais. Informações relevantes sobre interpretação dos dados ficam em *Configurações → Sobre os dados*.
- **Mobile:** as mesmas funções permanecem acessíveis pelo ícone de configurações, sem uma segunda barra de botões.
- **Preservação de dados:** não houve alteração de esquemas, banco Supabase, importações, sincronização, avaliações ou dados de biblioteca. As mudanças foram de HTML, CSS e interação de interface.

## Verificações de regressão

- A barra de atualização deve permanecer visível e com o mesmo ícone durante o carregamento.
- O perfil deve abrir após o login; a biblioteca de Mangás e Animes deve continuar acessível.
- O menu de configurações deve funcionar no desktop e no celular, inclusive por teclado.
- O botão *Importar e gerenciar dados* deve abrir a interface existente de importação, sem solicitar novamente o nome AniList já salvo.
- Ao sair da página de importação por qualquer aba principal, a navegação deve voltar ao conteúdo selecionado.
- Mensagens de sincronização devem ser visíveis também fora da aba Mangás.
