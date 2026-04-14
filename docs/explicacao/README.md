# Resumo da Documentacao

Esta pasta foi reduzida para evitar duplicacao e contradicoes.

Hoje a documentacao util do projeto esta concentrada em poucos arquivos:

- `README.md`
  visao geral, arquitetura, rotas, banco, ambiente e fluxo de desenvolvimento
- `KINGHOST_DEPLOY.md`
  checklist e observacoes de deploy
- `frontend/README.md`
  resumo do frontend
- `frontend/src/pages/Admin/README.md`
  resumo do painel administrativo
- `GEMINI.md`
  guia rapido para agentes de IA

## Por que os outros arquivos sairam

Os arquivos antigos desta pasta repetiam a mesma informacao em varios lugares e parte deles ja estava desatualizada em relacao ao codigo atual.

Em vez de manter varios mapas paralelos, a documentacao agora segue esta regra:

- um `README.md` principal como fonte de verdade
- guias locais somente quando ajudam quem vai mexer direto naquela area
- deploy e IA em arquivos separados porque tem objetivos diferentes

## Ordem recomendada de leitura

1. `README.md`
2. `frontend/README.md`
3. `frontend/src/pages/Admin/README.md`
4. `KINGHOST_DEPLOY.md`, se o foco for publicacao
5. `GEMINI.md`, se o foco for onboarding tecnico de IA
