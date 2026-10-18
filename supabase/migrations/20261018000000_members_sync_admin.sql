-- 好食光 v0.20.0：會員、雲端同步、管理後台（已套用到 Supabase 專案 mealwise / 東京）
-- 這份是紀錄用，內容和線上資料庫一致。

-- 會員資料
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  last_seen_at timestamptz
);
alter table public.profiles enable row level security;

-- 註冊時自動成為管理員的 Email（沒有任何規則＝前端讀不到）
create table public.admin_emails (email text primary key);
alter table public.admin_emails enable row level security;
insert into public.admin_emails values ('hikari5014@gmail.com');

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
$$;
revoke execute on function public.is_admin() from anon;

create policy "profiles: read own or admin" on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));
create policy "profiles: update own" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
revoke update on public.profiles from authenticated;
grant update (display_name, last_seen_at) on public.profiles to authenticated;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, display_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    case when exists (select 1 from public.admin_emails a where lower(a.email) = lower(new.email)) then 'admin' else 'user' end
  );
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := clock_timestamp();
  return new;
end $$;

-- 同步資料：每筆 = 表名＋鑰匙＋JSON
create table public.user_records (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  tbl text not null,
  key text not null,
  data jsonb,
  deleted boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, tbl, key)
);
create index user_records_user_updated on public.user_records (user_id, updated_at);
alter table public.user_records enable row level security;
create trigger user_records_touch before insert or update on public.user_records
  for each row execute function public.touch_updated_at();
create policy "records: own select" on public.user_records for select to authenticated using (user_id = (select auth.uid()));
create policy "records: own insert" on public.user_records for insert to authenticated with check (user_id = (select auth.uid()));
create policy "records: own update" on public.user_records for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "records: own delete" on public.user_records for delete to authenticated using (user_id = (select auth.uid()));

-- 公告
create table public.announcements (
  id bigint generated always as identity primary key,
  title text not null,
  body text not null default '',
  level text not null default 'info' check (level in ('info', 'success', 'warning')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid default auth.uid() references auth.users(id) on delete set null
);
alter table public.announcements enable row level security;
create policy "announcements: anon read active" on public.announcements for select to anon using (active);
create policy "announcements: read active" on public.announcements for select to authenticated using (active or (select public.is_admin()));
create policy "announcements: admin insert" on public.announcements for insert to authenticated with check ((select public.is_admin()));
create policy "announcements: admin update" on public.announcements for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "announcements: admin delete" on public.announcements for delete to authenticated using ((select public.is_admin()));

-- 共享食譜
create table public.shared_recipes (
  id text primary key,
  data jsonb not null,
  published boolean not null default true,
  updated_at timestamptz not null default now(),
  created_by uuid default auth.uid() references auth.users(id) on delete set null
);
alter table public.shared_recipes enable row level security;
create trigger shared_recipes_touch before update on public.shared_recipes
  for each row execute function public.touch_updated_at();
create policy "shared recipes: anon read published" on public.shared_recipes for select to anon using (published);
create policy "shared recipes: read published" on public.shared_recipes for select to authenticated using (published or (select public.is_admin()));
create policy "shared recipes: admin insert" on public.shared_recipes for insert to authenticated with check ((select public.is_admin()));
create policy "shared recipes: admin update" on public.shared_recipes for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "shared recipes: admin delete" on public.shared_recipes for delete to authenticated using ((select public.is_admin()));

-- 小工具函式
create or replace function public.touch_last_seen() returns void
language sql security definer set search_path = '' as $$
  update public.profiles set last_seen_at = now() where id = auth.uid()
$$;

create or replace function public.admin_overview() returns json
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'admin only'; end if;
  return json_build_object(
    'members', (select count(*) from public.profiles),
    'active7', (select count(*) from public.profiles where last_seen_at > now() - interval '7 days'),
    'new7', (select count(*) from public.profiles where created_at > now() - interval '7 days'),
    'records', (select count(*) from public.user_records where not deleted),
    'announcements', (select count(*) from public.announcements where active),
    'sharedRecipes', (select count(*) from public.shared_recipes where published)
  );
end $$;

create or replace function public.admin_members()
returns table(id uuid, email text, display_name text, role text, created_at timestamptz, last_seen_at timestamptz, records bigint, banned boolean, provider text)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'admin only'; end if;
  return query
    select p.id, p.email, p.display_name, p.role, p.created_at, p.last_seen_at,
      (select count(*) from public.user_records r where r.user_id = p.id and not r.deleted),
      coalesce(u.banned_until > now(), false),
      u.raw_app_meta_data ->> 'provider'
    from public.profiles p join auth.users u on u.id = p.id
    order by p.created_at desc;
end $$;

create or replace function public.admin_set_role(target uuid, new_role text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'admin only'; end if;
  if target = auth.uid() and new_role <> 'admin' then raise exception 'cannot remove your own admin role'; end if;
  update public.profiles set role = new_role where id = target;
end $$;

revoke execute on function public.touch_last_seen(), public.admin_overview(), public.admin_members(), public.admin_set_role(uuid, text) from anon, public;
grant execute on function public.touch_last_seen(), public.admin_overview(), public.admin_members(), public.admin_set_role(uuid, text) to authenticated;

-- 刪除帳號、停用會員：放在 Edge Function「account」（supabase/functions/account），用官方帳號管理 API
