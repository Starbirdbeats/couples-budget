-- Couples Budget — realtime sync + account deletion
-- Adds: (1) the household tables to the supabase_realtime publication so a
-- second device receives postgres-changes; (2) a security-definer RPC that lets
-- an owner delete their whole household (cascades to every child table).

-- ---------------------------------------------------------------------------
-- Realtime: stream changes for the household tables. RLS still applies — a
-- subscriber only receives rows in households they belong to.
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'households', 'household_members', 'categories',
    'transactions', 'budgets', 'funds', 'contributions'
  ] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Account / data deletion (GDPR). Deletes every household the caller owns;
-- on delete cascade removes members, categories, transactions, budgets, funds
-- and contributions. A non-owner member is detached by the FK's set-null.
-- ---------------------------------------------------------------------------
create or replace function delete_my_household()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  delete from households
  where id in (
    select household_id from household_members
    where user_id = v_uid and role = 'owner'
  );
end;
$$;
