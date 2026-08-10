# Projeto Futuro: Interações E Traduções De Tendências

Status: implementação concluída e validada localmente no branch
`codex/interacoes-traducao`; publicação do front ainda pendente.

Web App isolado:

```text
https://script.google.com/macros/s/AKfycby2xfCe4Gupe1oFNE2dyiXoJo1Z_cgsdEC19wdNPGTyt_YjoHET53NV3O_wRBnFmsBDuA/exec
```

Sincronização automática: diariamente, entre 11h e 12h, no fuso
`America/Sao_Paulo`.

## Objetivo

Adicionar ao scroll 3 uma camada persistente de reações editoriais e traduções,
sem alterar nenhuma aba existente, o JSON canônico, o Apps Script atual ou os
checkpoints do pipeline semanal.

## Escopo Proposto

- Usar a nova aba `Tendências Citadas`, criada sem alterar as abas existentes.
- Preservar todas as abas atuais sem mudanças de colunas, validações ou conteúdo.
- Registrar termos e ocorrências com identificadores determinísticos.
- Permitir as marcações `acompanhar` e `não é tendência`.
- Guardar a tradução do trecho sem substituir o original; o termo permanece no
  idioma em que foi citado.
- Traduzir dentro do Apps Script isolado, depois da sincronização da edição.
- Criar um Web App isolado para ler e gravar exclusivamente a nova aba.
- Fazer o front combinar a edição canônica com essa camada opcional.

## Modelo Da Nova Aba

Campos em uso:

```text
record_id
record_type
edition_number
term_key
term_original
source_name
email_subject
source_date
source_url
excerpt_original
excerpt_pt
reaction_status
family_id
family_name
translation_status
translated_by
translated_at
created_at
updated_at
```

`record_type`:

```text
term
occurrence
family
```

Valores iniciais:

```text
reaction_status: sem_marcacao | acompanhar | nao_e_tendencia
translation_status: pendente | traduzido | revisar | nao_necessaria
```

## Tradução Isolada

Funcionamento:

1. Rodar depois de a edição estar publicada no Web App canônico.
2. Ler somente o payload publicado em `?edition=NUMERO`.
3. Traduzir apenas `excerpt_original` das ocorrências de `named_trends`.
4. Preservar nomes próprios, marcas, siglas e o texto original.
5. Escrever somente na nova aba.
6. Nunca modificar `Evidências`, `Exports JSON`, `Controle Semanal`, `Listas` ou
   `Instruções`.
7. Não bloquear nem reiniciar o pipeline semanal.
8. Marcar como `revisar` qualquer falha de tradução.
9. Não expor a função de tradução no endpoint público.

## Garantias De Isolamento

- A edição continua funcionando quando a camada de anotações estiver vazia ou
  indisponível.
- O front usa o conteúdo original como fallback.
- Nenhum campo traduzido substitui o original.
- Reações e traduções são enriquecimentos posteriores à publicação.
- O Apps Script atual permanece intocado.
- Qualquer endpoint de anotações será um Web App separado e limitado à nova aba.

## Decisões Fechadas

1. As reações são estados exclusivos.
2. Um termo pertence inicialmente a no máximo uma família.
3. Famílias são criadas manualmente; o sistema não agrupa termos sozinho.
4. O Web App começa público e poderá mudar para token sem migração de dados.
5. O front usa o original como fallback quando a tradução não estiver pronta.

## Estado Validado

- Edição 5: 27 termos e 27 ocorrências, sem duplicatas.
- 24 traduções concluídas e 3 trechos marcados como `nao_necessaria`.
- Nenhuma tradução pendente.
- Leitura pública, reação editorial e restauração do estado testadas no Web App.
- O scroll 3 combina os dados canônicos com traduções, reações e famílias.
- Em telas menores, selecionar um termo leva diretamente ao box de detalhes.
- Se o Web App isolado falhar, o front mantém os termos canônicos como fallback.
