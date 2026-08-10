# Tendências Citadas — Apps Script isolado

Camada opcional de tradução, reações e famílias do scroll 3. O projeto acessa
somente a aba `Tendências Citadas` e lê o Web App canônico por HTTP.

## Instalação

1. Criar um projeto Apps Script independente.
2. Copiar `Code.gs` e `appsscript.json` para o projeto.
3. Executar `configureProject()` uma vez.
4. Executar `syncLatestEditionAndTranslate()` para o teste inicial.
5. Executar `installMaintenanceTrigger()` para sincronização diária por volta
   das 11h, no horário de São Paulo.
6. Implantar como Web App executado pelo proprietário e acessível a qualquer pessoa.

## Tradução

`translatePendingOccurrences()` usa `LanguageApp` e traduz apenas
`excerpt_original`. O original nunca é substituído. Se o texto devolvido for
igual ao original, a ocorrência recebe `nao_necessaria`; falhas recebem
`revisar` sem bloquear a sincronização.

A função de tradução não está disponível em `doPost`, evitando que visitantes
do site disparem traduções ou consumo de cota.

## API pública

Leitura: `GET ?edition=5` e `GET ?mode=health`.

Escritas aceitas por `POST`: `set_reaction`, `create_family`, `rename_family`,
`assign_family` e `remove_from_family`.

Não existem ações genéricas de edição, exclusão de linhas, sincronização ou
tradução no endpoint público.

## Fechar o acesso depois

Definir `ACCESS_MODE=token` e `WRITE_TOKEN=<segredo longo>` em Script
Properties. O token passa no corpo da requisição e não exige migração da aba.
