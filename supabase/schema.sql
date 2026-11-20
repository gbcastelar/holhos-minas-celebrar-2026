-- H.Olhos Minas | Celebrar 2026
-- Execute no SQL Editor do Supabase.
create extension if not exists pgcrypto;

create table if not exists public.celebrar_confirmations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 120),
  phone text not null check (char_length(regexp_replace(phone, '\D', '', 'g')) between 10 and 13),
  attendance text not null check (attendance in ('yes','no')),
  companions integer not null default 0 check (companions = 0),
  consent boolean not null default false check (consent = true),
  source text not null default 'website',
  created_at timestamptz not null default now()
);

alter table public.celebrar_confirmations enable row level security;

-- O visitante pode inserir sua própria resposta; não pode consultar a lista.
drop policy if exists "Public can submit confirmation" on public.celebrar_confirmations;
create policy "Public can submit confirmation"
on public.celebrar_confirmations
for insert
to anon, authenticated
with check (
  attendance in ('yes','no')
  and companions = 0
  and consent = true
  and char_length(trim(name)) between 2 and 120
);

-- Somente usuários autenticados podem ler os registros do painel.
drop policy if exists "Authenticated admins can read confirmations" on public.celebrar_confirmations;
create policy "Authenticated admins can read confirmations"
on public.celebrar_confirmations
for select
to authenticated
using (true);

-- Para simplificar o primeiro piloto, não há políticas públicas de update/delete.
-- Não conceda acesso administrativo a contas não autorizadas.

grant usage on schema public to anon, authenticated;
grant insert on public.celebrar_confirmations to anon, authenticated;
grant select on public.celebrar_confirmations to authenticated;

-- Crie o usuário administrador em Authentication > Users no painel Supabase.
-- Depois configure URL e chave anon/publishable em ../js/config.js.
