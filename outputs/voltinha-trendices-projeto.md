# Voltinha do Trendices - Projeto

Este documento consolida o projeto no Codex.

## Estrutura

- Conversa principal: direção, decisões e coordenação com você.
- Coordenador Semanal: automação que roda às segundas.
- Curador de Evidências: lê Gmail e preenche `Evidências`.
- Analista Editorial: interpreta evidências e propõe sinais.
- Exportador/Validador: gera JSON e preenche `Exports JSON`.
- Plataforma/Front: evolui o site e a experiência de leitura.

## Base De Controle

Planilha:

https://docs.google.com/spreadsheets/d/1fFYxbJ_Es20tEpu-OcvOVOu81OiPELcPMPbUpkOOhgg/edit

## Agentes

Curador de Evidências:

```text
019f24b0-2f6a-7063-84f5-1c6e8cb0f4e1
```

Analista Editorial:

```text
019f24b0-54fa-74d2-99d4-9eaddcbcff45
```

Exportador/Validador:

```text
019f24b0-8b4f-7813-b7af-f43b480f6980
```

Plataforma/Front:

```text
019f24d6-f78f-7be0-835e-bbeadd043ef2
```

## Pipeline

```text
Gmail
  -> Curador de Evidências
  -> Google Sheets / Evidências
  -> Analista Editorial
  -> Exportador/Validador
  -> Google Sheets / Exports JSON
  -> Apps Script
  -> Supabase
  -> Plataforma
```

## Primeiro Teste Completo

Período:

```text
2026-06-22 a 2026-06-28
```

Resultado:

- 20 mensagens deduplicadas.
- 17 evidências analisáveis.
- 3 ruídos.
- 4 sinais exportados.
- 7 materiais para ler.
- Apps Script processou a edição com sucesso.
- Plataforma exibiu `Voltinha #1`.

## Próximos Ajustes

- Encurtar o resumo da semana para o front.
- Preservar acentos nos textos finais.
- Melhorar titles de `relevant_links`.
- Revisar a seção `Para ler` para distinguir material central de repertório.
- Acionar o agente Plataforma/Front para diagnóstico visual.

## Arquivo Técnico

O arquivo técnico principal do projeto é:

```text
AGENTS.md
```

Ele fica na raiz do workspace e documenta responsabilidades, contratos, schema,
agentes, checklist semanal e aprendizados do primeiro teste.

