# Voltinha do Trendices - Backlog

## Agora

- [ ] Ajustar o prompt do Analista para gerar `summary` mais curto e mais visual.
- [ ] Preservar acentos e caracteres em português no texto final.
- [ ] Melhorar `relevant_links.title` para nomes editoriais mais claros.
- [ ] Revisar `edition.content.topics` para ficar mais sintético no front.

## Plataforma / Front

- [ ] Pedir diagnóstico inicial ao agente `Voltinha / 04 Plataforma Front`.
- [ ] Criar botão de like nas conversas/itens para sinalizar assuntos de
      interesse editorial futuro.
- [ ] Usar likes como insumo para agentes aprofundarem buscas sobre temas com
      potencial de virar texto na newsletter Trendices.
- [ ] Criar botão admin/dev de atualização instantânea para testes visuais,
      limitado a buscar/forçar refresh dos dados publicados.
- [ ] Manter ações sensíveis do pipeline, como processar planilha, exportar JSON
      ou publicar edição, coordenadas pelo Codex até haver logs e confirmações
      suficientes no front.
- [ ] Ajustar visual do resumo da semana para textos longos.
- [ ] Melhorar cards de temperatura por tema.
- [ ] Separar melhor `library_items` centrais de repertório auxiliar.
- [ ] Avaliar filtros por fonte, tema, período e tipo de material.
- [ ] Criar estados vazios melhores para semanas sem signals.

## Pipeline

- [ ] Atualizar o Coordenador Semanal com aprendizados do primeiro teste.
- [ ] Garantir que o Curador sempre reporte: total por label, total combinado,
      total deduplicado, total analisável e total ruído.
- [ ] Garantir que o Exportador sempre valide `library_items.status`.
- [ ] Registrar no checklist quando o Apps Script processar com sucesso.

## Dados / Schema

- [ ] Avaliar se `relevance` precisa de escala documentada, por exemplo 1-5.
- [ ] Avaliar se `edition.content` deve ter campos separados além de `topics`.
- [ ] Avaliar campo para `short_summary` usado especificamente pelo front.
- [ ] Avaliar campo para `quote_translation` ou síntese curta das frases.

## Operação

- [ ] Conferir se a automação semanal roda na próxima segunda.
- [ ] Confirmar se o Apps Script deve continuar manual ou ganhar gatilho próprio.
- [ ] Criar uma rotina de pós-rodada: conferir planilha, Apps Script, Supabase e site.
- [ ] Definir quando arquivar/limpar threads de teste antigos, se necessário.
