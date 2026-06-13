-- Couples Budget — initial schema
-- Single-user cloud sync, modeled around a "household" so a real partner can be
-- added later (claim their member row) with zero migration of the data tables.

-- ---------------------------------------------------------------------------
-- Core tables
-- ---------------------------------------------------------------------------

create table households (
  id         uuid primary key default gen_random_uuid(),
  currency   text not null default 'AED',
  created_at timestamptz not null default now()
);

-- A member of a household. user_id is null for a placeholder partner who has
-- not signed up yet; when they join, they claim the row by setting user_id.
create table household_members (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  user_id      uuid references auth.users(id) on delete set null,
  name         text not null,
  color        text not null check (color in ('indigo','rose','green','amber')),
  role         text not null default 'member' check (role in ('owner','member')),
  created_at   timestamptz not null default now()
);
create index household_members_household_idx on household_members(household_id);
create index household_members_user_idx on household_members(user_id);

create table categories (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name         text not null,
  type         text not null check (type in ('expense','income')),
  created_at   timestamptz not null default now()
);
create index categories_household_idx on categories(household_id);

create table transactions (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  type         text not null check (type in ('expense','income')),
  amount       numeric not null check (amount > 0),
  occurred_at  timestamptz not null,
  category_id  uuid references categories(id) on delete set null,
  member_id    uuid references household_members(id) on delete set null,
  scope        text not null check (scope in ('shared','personal')),
  notes        text not null default '',
  created_at   timestamptz not null default now()
);
create index transactions_household_idx on transactions(household_id);

-- One target per (household, category).
create table budgets (
  household_id uuid not null references households(id) on delete cascade,
  category_id  uuid not null references categories(id) on delete cascade,
  amount       numeric not null check (amount > 0),
  primary key (household_id, category_id)
);

-- Balance is intentionally NOT stored: it is derived as the sum of this fund's
-- contributions, so there is a single source of truth and no drift.
create table funds (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name         text not null,
  target       numeric not null default 0,
  created_at   timestamptz not null default now()
);
create index funds_household_idx on funds(household_id);

create table contributions (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  fund_id      uuid not null references funds(id) on delete cascade,
  amount       numeric not null,
  member_id    uuid references household_members(id) on delete set null,
  occurred_at  timestamptz not null default now()
);
create index contributions_household_idx on contributions(household_id);

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------
-- Security-definer helper avoids infinite recursion in the household_members
-- policy (a policy on that table cannot itself SELECT from that table).

create or replace function my_household_ids()
returns setof uuid
language sql
security definer
stable
set search_path = public
as $$
  select household_id from household_members where user_id = auth.uid()
$$;

alter table households         enable row level security;
alter table household_members  enable row level security;
alter table categories         enable row level security;
alter table transactions       enable row level security;
alter table budgets            enable row level security;
alter table funds              enable row level security;
alter table contributions      enable row level security;

create policy household_rw on households
  for all using (id in (select my_household_ids()))
  with check (id in (select my_household_ids()));

create policy members_read on household_members
  for select using (household_id in (select my_household_ids()));
-- A signed-in user may claim a placeholder member row in one of their households.
create policy members_update on household_members
  for update using (household_id in (select my_household_ids()))
  with check (household_id in (select my_household_ids()));

create policy categories_rw on categories
  for all using (household_id in (select my_household_ids()))
  with check (household_id in (select my_household_ids()));

create policy transactions_rw on transactions
  for all using (household_id in (select my_household_ids()))
  with check (household_id in (select my_household_ids()));

create policy budgets_rw on budgets
  for all using (household_id in (select my_household_ids()))
  with check (household_id in (select my_household_ids()));

create policy funds_rw on funds
  for all using (household_id in (select my_household_ids()))
  with check (household_id in (select my_household_ids()));

create policy contributions_rw on contributions
  for all using (household_id in (select my_household_ids()))
  with check (household_id in (select my_household_ids()));

-- ---------------------------------------------------------------------------
-- Bootstrap RPC
-- ---------------------------------------------------------------------------
-- Creating a household and its first member can't go through the table RLS
-- (the user has no household yet), so do it atomically in a security-definer
-- function that pins ownership to the caller. Seeds default categories, the
-- standard funds, and — if requested — suggested budgets. No demo transactions.

create or replace function create_household(
  p_currency       text,
  p_your_name      text,
  p_your_color     text,
  p_partner_name   text,
  p_partner_color  text,
  p_suggested      boolean
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid       uuid := auth.uid();
  v_household uuid;
  c_groceries uuid;
  c_utilities uuid;
  c_transport uuid;
  c_dining    uuid;
  c_health    uuid;
  c_subs      uuid;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  insert into households (currency) values (coalesce(p_currency, 'AED'))
    returning id into v_household;

  insert into household_members (household_id, user_id, name, color, role)
    values (v_household, v_uid, p_your_name, p_your_color, 'owner');
  insert into household_members (household_id, user_id, name, color, role)
    values (v_household, null, p_partner_name, p_partner_color, 'member');

  -- Expense categories (capture ids of the budgeted ones)
  insert into categories (household_id, name, type) values (v_household, 'Groceries', 'expense') returning id into c_groceries;
  insert into categories (household_id, name, type) values (v_household, 'Rent', 'expense');
  insert into categories (household_id, name, type) values (v_household, 'Utilities', 'expense') returning id into c_utilities;
  insert into categories (household_id, name, type) values (v_household, 'Transport', 'expense') returning id into c_transport;
  insert into categories (household_id, name, type) values (v_household, 'Dining', 'expense') returning id into c_dining;
  insert into categories (household_id, name, type) values (v_household, 'Health', 'expense') returning id into c_health;
  insert into categories (household_id, name, type) values (v_household, 'Subscriptions', 'expense') returning id into c_subs;
  insert into categories (household_id, name, type) values (v_household, 'Salary', 'income');
  insert into categories (household_id, name, type) values (v_household, 'Freelance', 'income');
  insert into categories (household_id, name, type) values (v_household, 'Other', 'income');

  if p_suggested then
    insert into budgets (household_id, category_id, amount) values
      (v_household, c_groceries, 1500),
      (v_household, c_utilities, 600),
      (v_household, c_transport, 500),
      (v_household, c_dining, 800),
      (v_household, c_health, 400),
      (v_household, c_subs, 300);
  end if;

  insert into funds (household_id, name, target) values
    (v_household, 'Savings', 20000),
    (v_household, 'Emergency', 15000),
    (v_household, 'Investments', 10000);

  return v_household;
end;
$$;
