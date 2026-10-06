# PlayEsports
Plataforma web mobile-first para reserva de quadras de futebol em Capão da Canoa/RS.
TCC Projeto Tecnológico – ULBRA Torres – Leonardo Leal da Silva (orientador: Prof. Juliano Ramos Matos).

**Stack:** React + Vite · Supabase (Auth + PostgreSQL + RLS) · n8n/WhatsApp (fase 2)

## Rodar
1. `npm install`
2. Criar `.env` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
3. Rodar `sql/01_schema.sql` (banco novo) ou `sql/02_ajustes_e_dados_exemplo.sql` (banco já criado)
4. `npm run dev`

## Funcionalidades (MVP parte 1)
Cadastro/Login · lista de arenas com filtro por cidade e modalidade · detalhes da arena · reserva com grade de horários (bloqueia horários ocupados) · agenda (Agendados / Finalizados / Cancelados) com cancelamento · detalhe da reserva · perfil/sair.

## Documentação
`docs/diagrama_ER.png` (modelo de dados) · `docs/arquitetura.png`

## Uso de IA
Assistente de IA (Claude) utilizado como apoio de estudo e geração de código, revisado e testado pelo autor.
