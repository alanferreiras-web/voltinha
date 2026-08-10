# Voltinha do Trendices - Documento Mestre

## Versao Atual

```text
Versao: v2.1.0
Status: estavel e publicada
Publicacao: 10 de agosto de 2026
Site: https://alanferreiras-web.github.io/voltinha/
Commit: 256d34e48097e770dc5efe5b3fdde057de519e39
Proxima versao incremental: v2.2
```

`v2.1.0` e a referencia atual do produto. Ajustes pequenos e evolucoes
compativeis entram em `v2.2`. O nome `v3.0` fica reservado para uma mudanca
estrutural de arquitetura, dados, acesso ou fluxo editorial.

## Governanca De Proximos Passos

Qualquer proximo passo que envolva programacao deve ser conversado antes de ser
executado. O agente deve inspecionar o estado atual, apresentar diagnostico,
proposta, impactos e alternativas, e esperar aprovacao previa e explicita do
usuario.

Discutir uma ideia, pedir uma recomendacao ou escolher uma direcao nao autoriza
automaticamente a implementacao. Nenhum codigo, planilha, Apps Script, JSON,
automacao, arquitetura ou publicacao deve ser alterado sem debate e aprovacao
inequivoca, inclusive em ajustes pequenos.

Todos os proximos passos registrados neste documento existem somente para
orientar conversas futuras. Eles nunca devem ser executados sem uma nova
aprovacao previa, explicita e inequivoca do usuario.

## O Que E

A Voltinha do Trendices e um sistema pessoal para transformar os e-mails e
referencias recebidos durante a semana em uma leitura editorial estruturada para
ajudar na escrita da newsletter Trendices.

Ela nao e apenas um arquivo de links. A proposta e separar evidencias, detectar
sinais, organizar repertorio e mostrar uma leitura visual da semana na
plataforma.

## Para Que Serve

- Acompanhar semanalmente temas, sinais e referencias que chegaram por e-mail.
- Evitar que boas conversas se percam na caixa de entrada.
- Criar uma base rastreavel para escrever a newsletter.
- Mostrar uma visao de leitura editorial: sinais da semana, materiais para
  aprofundar e temperatura de macrotemas.
- Reduzir dependencias externas, usando Google Sheets e Apps Script como base
  principal.

## Fluxo Atual

```text
Gmail
  -> Curador de Evidencias no Apps Script
  -> Google Sheets / Evidencias
  -> tarefa cloud / Analista Editorial + geracao do JSON
  -> Google Sheets / Exports JSON
  -> Apps Script / validacao + Web App canonico
  -> Plataforma

Apps Script Web App canonico
  -> sincronizacao diaria da camada de tendencias
  -> Google Sheets / Tendencias Citadas
  -> Apps Script Web App isolado
  -> enriquecimento opcional do scroll 3
```

O Supabase ficou legado/opcional. A fonte principal da plataforma agora e a
planilha, servida por um Web App do Apps Script.

Analista Editorial e geracao do JSON continuam como responsabilidades logicas
distintas, mas rodam numa unica tarefa cloud semanal para reduzir consumo e
eliminar a dependencia do computador ligado. Essa decisao operacional nao muda
o contrato do JSON e pode ser revista numa futura migracao para Apps Script.

## Base De Controle

Planilha:

```text
Voltinha do Trendices - Base de Controle
```

Spreadsheet ID:

```text
1fFYxbJ_Es20tEpu-OcvOVOu81OiPELcPMPbUpkOOhgg
```

Abas principais:

- `Controle Semanal`: estado de cada semana e proximo passo.
- `Evidencias`: itens filtrados do Gmail antes da analise.
- `Exports JSON`: payloads finais usados pela plataforma.
- `Listas`: valores permitidos.
- `Instrucoes`: guia da planilha.
- `Tendencias Citadas`: camada isolada de traducoes, reacoes e familias usada
  pelo scroll 3. Nao substitui nem altera as abas canonicas.

## Agentes

### Coordenador / Thread Principal

Responsavel por manter a visao do projeto, acompanhar estados e orquestrar os
especialistas.

Thread:

```text
019f2457-627c-7d63-ba8c-8b1d0b9a8b4f
```

### Curador de Evidencias

Le os e-mails nas labels `trendices` e `alanferreiras.com`, deduplica, remove
ruido e registra evidencias na aba `Evidencias`.

Thread:

```text
019f24b0-2f6a-7063-84f5-1c6e8cb0f4e1
```

### Analista Editorial

Le apenas a aba `Evidencias`, interpreta os itens uteis e propoe temas, sinais
rastreaveis, leitura Brasil e materiais de repertorio.

Thread:

```text
019f24b0-54fa-74d2-99d4-9eaddcbcff45
```

### Exportador / Validador

Transforma a analise editorial em JSON valido, valida o schema e grava uma
linha `Pronto` na aba `Exports JSON`.

Thread:

```text
019f24b0-8b4f-7813-b7af-f43b480f6980
```

### Plataforma / Front

Evolui o site, a experiencia visual e a leitura dos dados publicados.

Thread:

```text
019f24d6-f78f-7be0-835e-bbeadd043ef2
```

## Automacoes

### Analista Editorial + JSON Em Nuvem

Nome:

```text
Voltinha — Análise editorial + JSON
```

Agenda configurada: segunda-feira as 12h30.

Thread cloud:

```text
Previa Trendices Semanal
6a7a22e0-1884-83e9-8920-afe648a21664
```

Funcao:

- calcular a semana anterior completa;
- verificar se o periodo ja possui export `Pronto` ou `Processado`;
- ler somente as evidencias seguras do periodo;
- executar a analise editorial sem Gmail, internet ou conhecimento externo;
- montar e validar o JSON completo;
- gravar uma unica linha `Pronto` em `Exports JSON`;
- atualizar o checkpoint para `aguardando_apps_script`.

Estado:

- ativa;
- independente do computador local;
- ainda nao validada numa execucao semanal completa;
- deve ser observada durante as duas primeiras rodadas.

### Automacoes Locais Legadas

Permanecem pausadas:

```text
voltinha-do-trendices-disparo-semanal
voltinha-do-trendices-coordenador-semanal
```

Elas representam o desenho antigo, com Curador no Codex e acompanhamento
horario. Nao devem ser reativadas sem novo diagnostico, conversa e aprovacao.

### Acionadores Do Apps Script

Confirmado:

- sincronizacao e traducao da camada isolada de tendencias diariamente entre
  11h e 12h, em `America/Sao_Paulo`.

Ainda precisa ser conferido:

- acionador de `executarPipelineCompleto` no projeto principal do Curador;
- conta Google proprietaria desse acionador;
- acionador e janela de `processTrendicesExports`;
- horario ideal da traducao depois do primeiro ciclo cloud completo.

## Estados Da Semana

O campo mais importante da aba `Controle Semanal` e `next_step`.

Estados principais:

```text
acionar_curador
aguardando_curador
acionar_analista
aguardando_analista
acionar_exportador
aguardando_exportador
aguardando_apps_script
concluido
concluido_sem_export
revisar_exportador
revisar_apps_script
```

A planilha e o checkpoint do sistema. O fluxo nao depende de um agente ficar
esperando outro em tempo real.

## Plataforma

Arquivos principais:

```text
index.html
site/index.html
```

A plataforma:

- le o JSON publicado pelo Apps Script canonico;
- exibe a edicao da semana;
- permite navegar por edicoes anteriores;
- organiza a edicao em quatro capitulos progressivos: curadoria, sinais,
  tendencias citadas e leituras;
- mostra ate oito sinais com suas evidencias e fontes rastreaveis;
- apresenta os termos citados literalmente, sem confundi-los com sinais;
- combina o scroll 3 com uma camada opcional de traducoes, reacoes e familias;
- mantem o texto original e exibe a traducao como apoio no box lateral;
- permite marcar um termo como `acompanhar` ou `nao_e_tendencia`;
- permite relacionar termos manualmente em uma familia;
- mantem o conteudo canonico visivel se a camada isolada estiver indisponivel;
- reune newsletters e materiais com links para leitura na origem.

### Camada Isolada De Tendencias Citadas

Web App:

```text
https://script.google.com/macros/s/AKfycby2xfCe4Gupe1oFNE2dyiXoJo1Z_cgsdEC19wdNPGTyt_YjoHET53NV3O_wRBnFmsBDuA/exec
```

Funcionamento:

- sincroniza diariamente entre 11h e 12h em `America/Sao_Paulo`;
- le a edicao publicada pelo Web App canonico;
- grava somente na aba `Tendencias Citadas`;
- traduz apenas os trechos das ocorrencias, sem substituir o original;
- persiste reacoes e familias manuais;
- nao expoe sincronizacao nem traducao no endpoint publico;
- comeca com acesso publico e podera receber autenticacao em uma versao futura.

## Temperatura Do Mes

A Temperatura do Mes nao mede profundidade nem importancia absoluta. Ela mede
presenca de macrotemas nos sinais publicados.

Cada signal pode ter:

```json
"macro_themes": ["IA", "Novas midias"]
```

Regras:

- `macro_themes` e opcional.
- Um signal pode ter 0, 1 ou 2 macrotemas.
- Nao e preciso forcar encaixe quando o sinal nao couber bem.
- O front mostra apenas macrotemas recorrentes para evitar poluicao visual.
- Se muitos sinais ficarem sem macrotema pelo mesmo motivo, isso pode indicar
  um macrotema emergente.

Macrotemas iniciais:

```text
IA
Novas midias
Creator economy
Cultura jovem
Consumo e varejo
Marcas e comunidade
Trabalho e organizacoes
Cidades e territorio
Tecnologia e plataformas
Brasil / identidade cultural
```

## Apps Script

O Apps Script nao envia mais dados ao Supabase.

Funcao principal:

```text
processTrendicesExports
```

Responsabilidades:

- ler linhas `Pronto` da aba `Exports JSON`;
- validar o JSON;
- marcar como `Processado` quando estiver valido;
- marcar como `Erro` quando houver falha;
- servir edicoes `Pronto` e `Processado` via Web App JSON.

## GitHub

Repositorio:

```text
https://github.com/alanferreiras-web/voltinha
```

Branch principal:

```text
main
```

Ultimo marco publicado:

```text
v2.1.0 - Add cited trend interactions and translations
Commit 256d34e48097e770dc5efe5b3fdde057de519e39
```

## Situacao Atual

O projeto ja tem:

- pipeline documentado;
- planilha de controle operacional;
- front lendo Apps Script / Google Sheets;
- botao de like;
- botao de atualizacao de teste;
- Temperatura do Mes baseada em `macro_themes`;
- tarefa cloud semanal ativa para Analista Editorial + geracao do JSON;
- automacoes locais antigas pausadas;
- front editorial organizado em quatro capitulos;
- camada isolada de termos citados;
- traducoes de apoio sem substituicao do original;
- reacoes editoriais persistentes;
- familias manuais de termos;
- sincronizacao diaria da camada de tendencias;
- fallback para os dados canonicos;
- versao atual publicada no GitHub.

Validacao de referencia da edicao 5:

```text
27 termos
27 ocorrencias
24 traducoes concluidas
3 trechos sem necessidade de traducao
0 traducoes pendentes
```

## Cuidados A Partir Daqui

- Conversar e obter aprovacao explicita antes de qualquer programacao ou
  alteracao tecnica.

- Nao voltar a depender do Supabase como caminho principal sem decisao explicita.
- Nao deixar o heartbeat rodando a cada 30 minutos para sempre.
- Manter a planilha como fonte de verdade.
- Evitar que o front resolva problemas editoriais que deveriam vir do Analista.
- Evitar que o Exportador invente conteudo quando a analise estiver incompleta.
- Usar `macro_themes` com parcimonia para a Temperatura do Mes continuar limpa.

## Proximos Passos Para Conversa

Os itens abaixo nao autorizam execucao. Cada um exige diagnostico, debate e
nova aprovacao explicita antes de qualquer mudanca.

- Observar as duas primeiras execucoes da tarefa cloud e conferir qualidade,
  duplicidade, fuso horario e acesso a planilha.
- Confirmar os acionadores do Curador e de `processTrendicesExports` no Apps
  Script principal.
- Revisar o horario da traducao somente depois de um ciclo semanal completo.
- Discutir um push para o Terrario quando a edicao semanal ficar pronta,
  definindo destino, formato, conteudo, autenticacao e tratamento de falhas.
- Avaliar a migracao futura do Analista Editorial e da geracao do JSON para Apps
  Script apenas se a operacao cloud deixar de atender ao projeto.

