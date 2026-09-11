-- MIGRAÇÃO v2 — execute este arquivo INTEIRO de uma vez no Supabase:
-- SQL Editor > New query > cole tudo > Run.
--
-- É seguro executar mesmo que supabase_migration_TUDO_PENDENTE.sql já tenha
-- rodado antes (todo comando aqui é idempotente: pode ser reexecutado sem erro
-- e sem duplicar nada). Cobre:
--   1) Base: garante níveis de acesso, código de barras e RLS por nível
--      (repete o conteúdo de supabase_migration_TUDO_PENDENTE.sql).
--   2) Estoque: novas colunas (unidade, estoque mínimo, categoria) para
--      acomodar os dados da planilha Controle_de_Estoque.xlsx, e validade
--      passa a ser opcional (nem todo material odontológico tem validade
--      controlada, como instrumental).
--   3) Segurança de usuários: fecha uma falha real encontrada no código —
--      até aqui, um usuário autenticado podia, chamando a API diretamente
--      (fora da tela do sistema), definir sua PRÓPRIA role como 'admin' no
--      cadastro ou na edição. Agora isso é bloqueado no próprio banco,
--      então não depende só do JavaScript da tela para ser seguro.

-- ============================================================
-- 1) BASE: níveis de acesso, código de barras, RLS por nível
-- ============================================================
alter table usuarios drop constraint if exists usuarios_role_check;
alter table usuarios add constraint usuarios_role_check
  check (role in ('admin', 'estoquista', 'vendedor', 'dentista'));
alter table usuarios alter column role set default 'vendedor';

alter table produtos add column if not exists codigo_barras text unique;

create or replace function public.get_my_role()
returns text language sql security definer set search_path = public as $$
  select role from usuarios where id = auth.uid();
$$;

drop policy if exists "produtos_all" on produtos;
drop policy if exists "produtos_select" on produtos;
drop policy if exists "produtos_insert" on produtos;
drop policy if exists "produtos_update" on produtos;
drop policy if exists "produtos_delete" on produtos;
create policy "produtos_select" on produtos for select to authenticated using (true);
create policy "produtos_insert" on produtos for insert to authenticated
  with check (public.get_my_role() in ('admin', 'estoquista'));
create policy "produtos_update" on produtos for update to authenticated
  using (public.get_my_role() in ('admin', 'estoquista'));
create policy "produtos_delete" on produtos for delete to authenticated
  using (public.get_my_role() in ('admin', 'estoquista'));

drop policy if exists "entradas_all" on entradas_produtos;
drop policy if exists "entradas_select" on entradas_produtos;
drop policy if exists "entradas_insert" on entradas_produtos;
create policy "entradas_select" on entradas_produtos for select to authenticated using (true);
create policy "entradas_insert" on entradas_produtos for insert to authenticated
  with check (public.get_my_role() in ('admin', 'estoquista'));

drop policy if exists "saidas_all" on saidas_produtos;
drop policy if exists "saidas_select" on saidas_produtos;
drop policy if exists "saidas_insert" on saidas_produtos;
create policy "saidas_select" on saidas_produtos for select to authenticated using (true);
create policy "saidas_insert" on saidas_produtos for insert to authenticated
  with check (public.get_my_role() in ('admin', 'estoquista', 'vendedor'));

drop policy if exists "historico_all" on historico;
drop policy if exists "historico_select" on historico;
drop policy if exists "historico_insert" on historico;
create policy "historico_select" on historico for select to authenticated using (true);
create policy "historico_insert" on historico for insert to authenticated with check (true);

-- ============================================================
-- 2) ESTOQUE: colunas novas para acomodar a planilha de controle
-- ============================================================
alter table produtos add column if not exists unidade text;
alter table produtos add column if not exists estoque_minimo integer not null default 5;
alter table produtos add column if not exists categoria text;
alter table produtos alter column validade drop not null;

-- ============================================================
-- 3) SEGURANÇA DE USUÁRIOS: impede auto-promoção a admin
-- ============================================================

-- 3.1) Cadastro (INSERT): um admin pode criar qualquer perfil; alguém se
-- autocadastrando só pode virar 'admin' se for o primeiro usuário do
-- sistema (bootstrap) — caso contrário, o perfil nasce sempre 'vendedor',
-- mesmo que o JavaScript da tela tente enviar outra role.
drop policy if exists "usuarios_insert_self_or_admin" on usuarios;
drop policy if exists "usuarios_insert_admin" on usuarios;
drop policy if exists "usuarios_insert_self" on usuarios;
create policy "usuarios_insert_admin" on usuarios for insert to authenticated
  with check (public.is_admin());
create policy "usuarios_insert_self" on usuarios for insert to authenticated
  with check (
    auth.uid() = id
    and (
      (role = 'admin' and not exists (select 1 from usuarios)) or role = 'vendedor'
    )
  );

-- 3.2) Edição (UPDATE): só um admin pode alterar role/ativo de um usuário
-- (o próprio ou de terceiros); um usuário comum ainda pode editar seus
-- próprios dados (ex.: nome), mas não seu nível de acesso nem reativar a
-- própria conta.
create or replace function public.prevent_role_escalation()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    if new.role is distinct from old.role or new.ativo is distinct from old.ativo then
      raise exception 'Apenas administradores podem alterar o nível de acesso ou o status de um usuário.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_role_escalation on usuarios;
create trigger trg_prevent_role_escalation
  before update on usuarios
  for each row execute function public.prevent_role_escalation();

-- 3.3) Trava de segurança operacional: impede remover/desativar/rebaixar
-- o ÚLTIMO administrador ativo do sistema (evita perder o acesso de
-- administração por acidente).
create or replace function public.prevent_last_admin_removal()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (TG_OP = 'DELETE' and OLD.role = 'admin' and OLD.ativo)
     or (TG_OP = 'UPDATE' and OLD.role = 'admin' and OLD.ativo and (NEW.role <> 'admin' or NEW.ativo = false)) then
    if (select count(*) from usuarios where role = 'admin' and ativo = true and id <> OLD.id) = 0 then
      raise exception 'Não é possível remover, desativar ou rebaixar o último administrador do sistema.';
    end if;
  end if;
  if TG_OP = 'DELETE' then return OLD; else return NEW; end if;
end;
$$;

drop trigger if exists trg_prevent_last_admin_removal_upd on usuarios;
create trigger trg_prevent_last_admin_removal_upd
  before update on usuarios
  for each row execute function public.prevent_last_admin_removal();

drop trigger if exists trg_prevent_last_admin_removal_del on usuarios;
create trigger trg_prevent_last_admin_removal_del
  before delete on usuarios
  for each row execute function public.prevent_last_admin_removal();
