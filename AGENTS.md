# Voltinha do Trendices

## Regra De Governança Para Mudanças

Nenhum próximo passo que envolva programação, alteração de arquivos, mudanças
na planilha, Apps Script, JSON, arquitetura, automações ou publicação deve ser
executado imediatamente.

Antes de qualquer implementação, o agente deve:

1. inspecionar o estado atual;
2. apresentar o diagnóstico e a mudança proposta;
3. explicar impacto, limites e riscos;
4. conversar com o usuário sobre as alternativas;
5. esperar uma aprovação prévia, explícita e inequívoca.

Uma sugestão, uma pergunta exploratória ou a discussão de um próximo passo não
constituem autorização para programar. A implementação só começa depois de o
usuário aprovar claramente a proposta discutida. Essa regra também vale para
ajustes considerados pequenos, correções, refatorações, novos campos, gatilhos,
deploys e alterações de documentação que façam parte de uma mudança técnica.

## Objetivo

Manter um pipeline semanal para transformar e-mails das labels `trendices` e
`alanferreiras.com` em uma edição estruturada da Voltinha do Trendices, exibida
na plataforma.

O fluxo substitui o antigo envio de JSON por e-mail. A planilha passa a ser a
base de controle operacional e a fonte canônica da plataforma.

## Fluxo Atual

```text
Gmail labels
  -> Curador de Evidências
  -> Google Sheets: Evidências
  -> Analista Editorial
  -> Exportador/Validador
  -> Google Sheets: Exports JSON
  -> Apps Script
  -> Plataforma/Front
```

## Planilha De Controle

Nome: `Voltinha do Trendices - Base de Controle`

Spreadsheet ID:

```text
1fFYxbJ_Es20tEpu-OcvOVOu81OiPELcPMPbUpkOOhgg
```

Abas:

- `Instruções`: visão geral do uso da planilha.
- `Evidências`: registros extraídos do Gmail antes da análise editorial.
- `Exports JSON`: payload final para o Apps Script.
- `Listas`: valores permitidos para validação.
- `Controle Semanal`: checkpoint operacional da automação recorrente.

### Aba Controle Semanal

Campos:

```text
week_start
week_end
curador_status
analista_status
exportador_status
apps_script_status
next_step
last_update
notes
```

Valores operacionais usados em `next_step`:

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

Esta aba evita que a automação precise ficar esperando um especialista terminar
no mesmo heartbeat. Cada execução lê o estado atual e continua a próxima etapa
pendente.

### Aba Evidências

Campos:

```text
week_start
week_end
source_name
source_type
email_subject
email_date
email_url
classification
evidence_excerpt
relevant_links
curator_note
status
```

Valores permitidos para `classification`:

```text
sinal
material_para_aprofundar
referencia_repertorio
contexto_agenda
ruido
```

Valores permitidos para `status`:

```text
novo
usado_na_edicao
descartado
revisar
```

### Aba Exports JSON

O Apps Script lê a partir da linha 5.

Campos:

```text
edition_number
week_start
week_end
status
json
checklist
```

Valores permitidos para `status`:

```text
Pronto
Processado
Erro
```

## Agentes

Os threads do projeto ficam fixados no Codex com o prefixo `Voltinha /`.

Thread principal:

```text
Voltinha / 00 Principal + Coordenador
019f2457-627c-7d63-ba8c-8b1d0b9a8b4f
```

Observação: neste ambiente não há um projeto salvo disponível para agrupar
threads em uma pasta visual. A organização do projeto é feita por:

- nomes padronizados com prefixo `Voltinha /`;
- threads fixados na lateral do Codex;
- documentação em `AGENTS.md`;
- backlog em `BACKLOG.md`;
- artefatos em `outputs/`.

### Operação Semanal Atual

O desenho operacional aprovado em 2026-08-10 combina Google Apps Script e uma
única tarefa semanal em nuvem:

```text
Apps Script / Curador
  -> Google Sheets / Evidências
  -> tarefa cloud / Analista Editorial + geração do JSON
  -> Google Sheets / Exports JSON com status Pronto
  -> Apps Script / validação e Web App
  -> plataforma
  -> camada isolada de tradução, reações e famílias
```

A tarefa cloud ativa chama-se:

```text
Voltinha — Análise editorial + JSON
```

Agenda configurada: segunda-feira às 12h30.

Thread cloud:

```text
Prévia Trendices Semanal
6a7a22e0-1884-83e9-8920-afe648a21664
```

Responsabilidade da tarefa cloud:

- Calcular a semana anterior completa, de segunda a domingo.
- Ler somente `Evidências`, sem acessar Gmail nem usar conhecimento externo.
- Não criar uma edição quando já existir linha `Pronto` ou `Processado` para o
  mesmo período.
- Usar o export processado mais recente apenas como referência estrutural, sem
  reutilizar conteúdo editorial.
- Executar numa única rodada as etapas lógicas de Analista Editorial e geração
  do JSON.
- Gravar uma única linha `Pronto` em `Exports JSON` somente após validação
  integral.
- Atualizar a linha correspondente em `Controle Semanal` para
  `aguardando_apps_script`.

Estado de validação:

- A automação está ativa, mas ainda não passou por uma execução semanal completa.
- Acesso ao Google Sheets, fuso efetivo e qualidade editorial devem ser
  confirmados nas duas primeiras execuções.
- O acionador do Curador no projeto principal e o acionador de
  `processTrendicesExports` ainda precisam ser conferidos.

As automações locais anteriores permanecem pausadas:

```text
voltinha-do-trendices-disparo-semanal
voltinha-do-trendices-coordenador-semanal
```

Elas não devem ser reativadas sem novo diagnóstico, debate e aprovação, pois
representam a arquitetura antiga com Curador no Codex e acompanhamento horário.

### Curador de Evidências

Nome do thread:

```text
Voltinha / 01 Curador de Evidências
```

Thread ID:

```text
019f24b0-2f6a-7063-84f5-1c6e8cb0f4e1
```

Responsabilidade:

- Ler Gmail nas labels `trendices` e `alanferreiras.com`.
- Deduplicar mensagens.
- Filtrar ruído.
- Registrar evidências na aba `Evidências`.

Limites:

- Não escrever resumo da semana.
- Não fazer leitura Brasil.
- Não gerar JSON final.
- Não enviar e-mail.

### Analista Editorial

Nome do thread:

```text
Voltinha / 02 Analista Editorial
```

Thread ID:

```text
019f24b0-54fa-74d2-99d4-9eaddcbcff45
```

Responsabilidade:

- Ler apenas a aba `Evidências`.
- Interpretar itens úteis.
- Propor temas, sinais, leitura Brasil e materiais de repertório.

Limites:

- Não ler Gmail.
- Não gerar JSON final.
- Não enviar e-mail.

#### Execução Semanal Em Nuvem

Na operação atual, Analista Editorial e geração do JSON continuam sendo etapas
lógicas distintas, mas são executadas na mesma tarefa cloud para reduzir custo,
latência e coordenação. Isso não altera o contrato do JSON nem impede uma futura
migração do Analista para Apps Script.

A tarefa cloud deve tratar a planilha como fonte canônica, impedir duplicidade e
interromper sem escrita parcial quando houver falta de acesso, evidências
insuficientes ou falha de validação.

### Exportador/Validador

Nome do thread:

```text
Voltinha / 03 Exportador Validador
```

Thread ID:

```text
019f24b0-8b4f-7813-b7af-f43b480f6980
```

Responsabilidade:

- Transformar a análise editorial em JSON válido.
- Validar schema e valores permitidos.
- Gravar linha `Pronto` na aba `Exports JSON`.

Limites:

- Não criar conteúdo editorial novo.
- Não ler Gmail.
- Não enviar e-mail.
- Não rodar o Apps Script.

### Plataforma/Front

Nome do thread:

```text
Voltinha / 04 Plataforma Front
```

Thread ID:

```text
019f24d6-f78f-7be0-835e-bbeadd043ef2
```

Responsabilidade:

- Evoluir a plataforma/site.
- Diagnosticar UI, UX, dados e integração Supabase.
- Propor mudanças de schema quando a interface precisar de dados melhores.

Limites:

- Não fazer curadoria.
- Não gerar sinais.
- Não alterar o pipeline editorial sem pedido explícito.

## Contrato Do JSON

Payload esperado pela Edge Function:

```text
edition
sources
signals
library_items
```

### edition

Campos principais:

```text
edition_number
week_start
week_end
summary
content
source_email_count
status
```

`status` deve ser `published` apenas quando houver ao menos um signal
rastreável.

### sources

`source_type` permitido:

```text
editorial
cultural_visual
report_research
brand_market
operational
other
```

### signals

Campos principais:

```text
theme
theme_key
macro_themes
title
synthesis
evidence_excerpt
source_name
source_url
source_date
relevance
brazil_context
brazil_evidence
brazil_hypothesis
brazil_fit
relevant_links
```

`macro_themes` é opcional e alimenta apenas a Temperatura do Mês no front.
Regras:

- Deve ser uma lista.
- Pode ter 0, 1 ou 2 macrotemas por signal.
- Não force encaixe quando o signal não couber bem.
- Se vários signals ficarem sem macrotema pelo mesmo motivo, isso é pista de
  um novo macrotema emergente para discussão posterior.

Macrotemas iniciais:

```text
IA
Novas mídias
Creator economy
Cultura jovem
Consumo e varejo
Marcas e comunidade
Trabalho e organizações
Cidades e território
Tecnologia e plataformas
Brasil / identidade cultural
```

`brazil_fit` permitido:

```text
alta
media
baixa
nao_se_aplica
```

### library_items

`item_type` permitido:

```text
article
report
research
pdf
podcast
video
case
book
newsletter
reference
```

`status` permitido:

```text
to_read
read
archived
```

## Apps Script

Função principal:

```text
processTrendicesExports
```

Responsabilidade:

- Ler linhas com status `Pronto` na aba `Exports JSON`.
- Validar o JSON técnico.
- Marcar como `Processado` quando o payload estiver válido para o front.
- Marcar como `Erro` quando houver falha de validação.
- Servir edições `Pronto` e `Processado` via Web App JSON para a plataforma.

Importante:

O Apps Script deve validar `payload.edition.edition_number`,
`payload.edition.week_start` e `payload.edition.week_end`, não campos soltos no
topo do JSON.

## Fonte Do Front

Fonte principal usada pelo front:

```text
Apps Script Web App -> aba Exports JSON
```

O Supabase fica legado/opcional para este projeto pessoal. A plataforma deve
ler edições publicáveis diretamente dos payloads exportados na planilha:

```text
status = Pronto
status = Processado
```

## Checklist Semanal

1. Apps Script executa o Curador e registra evidências.
2. A tarefa cloud calcula a semana anterior completa.
3. A tarefa cloud verifica se já existe export do período.
4. O Analista cloud produz signals rastreáveis ou encerra sem export.
5. A mesma tarefa valida o payload e grava uma única linha `Pronto`.
6. Apps Script executa `processTrendicesExports` e marca `Processado` ou `Erro`.
7. O Web App disponibiliza a edição para a plataforma.
8. A camada isolada sincroniza e traduz as tendências citadas.
9. O resultado visual e os estados da planilha são conferidos.
10. Depois de a edição estar pronta, avaliar o envio de um push ao Terrário.

O push ao Terrário é apenas um próximo passo para discussão. Antes de qualquer
implementação, devem ser definidos destino, formato, conteúdo, autenticação,
critério de sucesso e comportamento em caso de falha.

Todos os próximos passos deste documento são temas para conversa. Nenhum deles
autoriza programação, alteração de automação, planilha, Apps Script, publicação
ou integração externa sem nova aprovação prévia, explícita e inequívoca.

## Aprendizados Do Primeiro Teste

Período testado:

```text
2026-06-22 a 2026-06-28
```

Resultado:

- 20 mensagens em `trendices`.
- 1 mensagem em `alanferreiras.com`.
- 21 combinadas.
- 20 após deduplicação.
- 17 analisáveis.
- 3 ruídos.
- 4 signals exportados.
- 7 library_items.
- Edição processada com sucesso no Apps Script.
- Plataforma exibiu `Voltinha #1`.

Pontos para calibrar:

- Resumos precisam ser mais curtos para caber melhor no front.
- Preservar acentos no texto final.
- Melhorar titles dos `relevant_links`.
- Evitar que `edition.content.topics` fique longo demais para a UI.
