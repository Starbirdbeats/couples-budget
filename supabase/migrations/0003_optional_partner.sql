-- Couples Budget — make the partner optional at onboarding
-- A user can start solo ("Just me for now"); the partner member row is only
-- created when a name is supplied. Everything else is unchanged from 0001.

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
  -- Only create the partner placeholder when a name was actually given.
  if coalesce(btrim(p_partner_name), '') <> '' then
    insert into household_members (household_id, user_id, name, color, role)
      values (v_household, null, p_partner_name, p_partner_color, 'member');
  end if;

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
