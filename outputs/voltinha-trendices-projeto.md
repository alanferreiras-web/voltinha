# Voltinha do Trendices - Documento Mestre

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
  -> Curador de Evidencias
  -> Google Sheets / Evidencias
  -> Analista Editorial
  -> Exportador/Validador
  -> Google Sheets / Exports JSON
  -> Apps Script Web App
  -> Plataforma
```

O Supabase ficou legado/opcional. A fonte principal da plataforma agora e a
planilha, servida por um Web App do Apps Script.

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

### Disparo Semanal

Roda toda segunda-feira as 9h.

Funcao:

- calcular a semana anterior completa;
- criar a linha em `Controle Semanal`, se ainda nao existir;
- acionar o Curador quando o proximo passo for `acionar_curador`;
- garantir que o acompanhamento de edicao aberta esteja ativo.

### Acompanhamento De Edicao Aberta

Roda de hora em hora apenas enquanto houver uma edicao aberta.

Funcao:

- ler a aba `Controle Semanal`;
- verificar se algum agente concluiu sua etapa;
- atualizar o proximo passo;
- acionar Analista ou Exportador quando for o momento;
- verificar se o Apps Script validou o export;
- pausar a si mesmo quando nao houver edicao em andamento.

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

- le o JSON publicado pelo Apps Script;
- exibe a edicao da semana;
- permite navegar por edicoes anteriores;
- mostra fontes, trechos, materiais e leitura Brasil;
- tem botao `Gostei` para sinalizar assuntos de interesse;
- tem botao `Atualizar teste` para recarregar dados publicados sem rodar o
  pipeline.

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
Update Voltinha Sheets app flow
```

## Situacao Atual

O projeto ja tem:

- pipeline documentado;
- planilha de controle operacional;
- front lendo Apps Script / Google Sheets;
- botao de like;
- botao de atualizacao de teste;
- Temperatura do Mes baseada em `macro_themes`;
- automacao semanal;
- acompanhamento horario condicional para edicoes abertas;
- versao atual publicada no GitHub.

## Cuidados A Partir Daqui

- Nao voltar a depender do Supabase como caminho principal sem decisao explicita.
- Nao deixar o heartbeat rodando a cada 30 minutos para sempre.
- Manter a planilha como fonte de verdade.
- Evitar que o front resolva problemas editoriais que deveriam vir do Analista.
- Evitar que o Exportador invente conteudo quando a analise estiver incompleta.
- Usar `macro_themes` com parcimonia para a Temperatura do Mes continuar limpa.

