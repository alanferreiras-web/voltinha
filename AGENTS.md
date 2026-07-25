# Voltinha do Trendices

## Objetivo

Manter um pipeline semanal para transformar e-mails das labels `trendices` e
`alanferreiras.com` em uma edição estruturada da Voltinha do Trendices, exibida
na plataforma.

O fluxo substitui o antigo envio de JSON por e-mail. A planilha passa a ser a
base de controle operacional antes do envio ao Supabase.

## Fluxo Atual

```text
Gmail labels
  -> Curador de Evidências
  -> Google Sheets: Evidências
  -> Analista Editorial
  -> Exportador/Validador
  -> Google Sheets: Exports JSON
  -> Apps Script
  -> Supabase
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

### Coordenador Semanal

Tipo: automação semanal no Codex.

Agenda: segunda-feira de manhã.

Responsabilidade:

- Acionar os especialistas em sequência.
- Não fazer curadoria, análise ou exportação por conta própria.
- Só passar para a próxima etapa quando o especialista anterior declarar a
  saída como concluída.
- Produzir um resumo final da execução.

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
- Enviar o JSON ao endpoint Supabase.
- Marcar como `Processado` em sucesso.
- Marcar como `Erro` em falha.

Importante:

O Apps Script deve validar `payload.edition.edition_number`,
`payload.edition.week_start` e `payload.edition.week_end`, não campos soltos no
topo do JSON.

## Supabase E Front

Tabelas usadas pelo front:

```text
weekly_editions
signals
library_items
sources
```

O front lê edições com:

```text
status = published
```

## Checklist Semanal

1. Coordenador aciona Curador.
2. Curador registra evidências.
3. Coordenador verifica se o Curador declarou evidências analisáveis.
4. Coordenador aciona Analista.
5. Analista declara signals rastreáveis ou encerra sem export.
6. Coordenador aciona Exportador.
7. Exportador grava linha `Pronto`.
8. Apps Script processa linha `Pronto`.
9. Plataforma é atualizada.
10. Resultado visual é conferido no site.

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
