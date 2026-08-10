# Changelog

Este arquivo registra versões estáveis da Voltinha do Trendices.

Itens futuros não autorizam implementação. Qualquer nova programação deve ser
precedida por diagnóstico, debate e aprovação explícita do usuário.

## v2.1.0 — 2026-08-10

Status: estável e publicada.

Referência:

```text
Site: https://alanferreiras-web.github.io/voltinha/
Commit: 256d34e48097e770dc5efe5b3fdde057de519e39
```

### Produto

- Front editorial organizado em quatro capítulos progressivos.
- Até oito sinais apresentados com evidências e fontes rastreáveis.
- Tendências e comportamentos citados separados dos sinais editoriais.
- Newsletters e materiais reunidos para leitura na origem.

### Tendências Citadas

- Nova aba isolada `Tendências Citadas`, sem alteração das abas canônicas.
- Termos preservados no idioma original.
- Tradução de apoio exibida abaixo do trecho original no box lateral.
- Reações exclusivas `acompanhar` e `nao_e_tendencia`.
- Famílias de termos criadas e mantidas manualmente.
- Web App isolado para leitura e gravação dessa camada.
- Sincronização e tradução automáticas diariamente entre 11h e 12h, no fuso de
  São Paulo.
- Fallback para os termos canônicos quando o serviço isolado estiver
  indisponível.

### Validação De Referência

- Edição 5 com 27 termos e 27 ocorrências.
- 24 traduções concluídas.
- 3 ocorrências sem necessidade de tradução.
- Nenhuma tradução pendente.
- Leitura pública e gravação reversível de reação verificadas.
- Layout desktop e móvel verificados.

### Limites Conhecidos

- O endpoint de escrita permanece público nesta versão.
- Famílias dependem de organização manual.
- A camada de tendências enriquece o front, mas não altera o JSON canônico nem
  o pipeline editorial.

## Próximas Versões

- `v2.2`: melhorias incrementais aprovadas após uso real.
- `v3.0`: reservada para mudanças estruturais de arquitetura, dados, acesso ou
  fluxo editorial.
