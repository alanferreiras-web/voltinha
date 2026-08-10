# Voltinha do Trendices - Backlog

## Regra De Entrada

Itens neste backlog representam possibilidades, não autorização para executar.
Antes de qualquer programação, cada item deve ser diagnosticado, debatido e
aprovado explicitamente pelo usuário.

Todos os próximos passos abaixo existem somente para orientar conversas futuras.
Nenhum item deve ser executado, programado, configurado ou publicado sem uma
nova aprovação prévia, explícita e inequívoca.

## Próxima Versão Possível: v2.2

- [ ] Avaliar proteção de escrita para o Web App de tendências citadas.
- [ ] Avaliar refinamentos da experiência de famílias depois do uso real.
- [ ] Observar a sincronização diária das 11h nas próximas edições.
- [ ] Reunir feedback de uso antes de propor novos controles no scroll 3.

## Agora

- [ ] Auditar semanas em que a Voltinha não funcionou corretamente, separando
      falhas por etapa: curadoria, análise, exportação, Apps Script ou front.
- [x] Migrar a plataforma para usar Google Sheets + Apps Script como fonte
      principal, reduzindo dependência de Supabase para projetos pessoais.
- [ ] Ajustar o prompt do Analista para gerar `summary` mais curto e mais visual.
- [ ] Preservar acentos e caracteres em português no texto final.
- [ ] Melhorar `relevant_links.title` para nomes editoriais mais claros.
- [ ] Revisar `edition.content.topics` para ficar mais sintético no front.

## Plataforma / Front

- [ ] Pedir diagnóstico inicial ao agente `Voltinha / 04 Plataforma Front`.
- [x] Trocar leitura do front de Supabase REST para endpoint JSON do Apps Script.
- [ ] Criar endpoint público/seguro no Apps Script para servir edições
      processadas a partir da aba `Exports JSON`.
- [x] Criar botão de like nas conversas/itens para sinalizar assuntos de
      interesse editorial futuro.
- [ ] Usar likes como insumo para agentes aprofundarem buscas sobre temas com
      potencial de virar texto na newsletter Trendices.
- [x] Criar botão admin/dev de atualização instantânea para testes visuais,
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

- [x] Criar uma única tarefa cloud semanal para executar Analista Editorial e
      geração do JSON às segundas-feiras, 12h30, sem depender do computador.
- [ ] Observar as duas primeiras execuções da tarefa cloud antes de considerá-la
      estável.
- [ ] Confirmar que a tarefa cloud acessa a planilha correta pelo conector do
      Google Drive e nunca duplica uma semana já exportada.
- [ ] Confirmar o fuso horário efetivo da agenda cloud.
- [x] Atualizar contrato operacional: `Exports JSON` passa a ser a fonte
      canônica para o front; Supabase fica legado/opcional.
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
- [x] Adicionar `macro_themes` opcional aos signals para alimentar a
      Temperatura do Mês sem alterar a leitura dos sinais da semana.

## Operação

- [ ] Confirmar o acionador de `executarPipelineCompleto` no Apps Script do
      Curador e a conta Google que o criou.
- [ ] Confirmar o acionador de `processTrendicesExports` e sua janela semanal.
- [ ] Revisar o horário da tradução somente depois de observar um ciclo completo
      com a nova edição cloud.
- [ ] Discutir um push para o Terrário quando a Voltinha semanal estiver pronta,
      definindo destino, formato, autenticação, conteúdo e tratamento de falhas
      antes de qualquer implementação.
- [ ] Criar um registro de incidentes por semana com período, sintoma, etapa
      provável, correção aplicada e prevenção para a próxima rodada.
- [ ] Conferir se a automação semanal roda na próxima segunda.
- [ ] Confirmar se o Apps Script deve continuar manual ou ganhar gatilho próprio.
- [ ] Criar uma rotina de pós-rodada: conferir planilha, Apps Script e site.
- [ ] Definir quando arquivar/limpar threads de teste antigos, se necessário.
