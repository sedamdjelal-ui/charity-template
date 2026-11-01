-- =====================================================
-- سكربت إعداد قاعدة بيانات موقع الجمعية
-- Djellal Design Studio — charity-template
--
-- يُنفَّذ مرة واحدة فقط في مشروع Supabase جديد:
-- SQL Editor ← New query ← الصق الملف كاملاً ← Run
-- =====================================================


-- =====================================================
-- 0. صلاحيات المفتاح السري (service_role)
-- =====================================================
grant usage on schema public to service_role;

alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
alter default privileges in schema public grant execute on functions to service_role;


-- =====================================================
-- 1. الأعضاء ودوال التحقق
-- =====================================================
create table public.members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  full_name text not null check (char_length(full_name) between 3 and 100),
  role text not null default 'member' check (role in ('president', 'member')),
  active boolean not null default true
);

alter table public.members enable row level security;
grant select on public.members to authenticated;

create or replace function public.is_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.members
    where user_id = auth.uid() and active = true
  );
$$;

create or replace function public.is_president()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.members
    where user_id = auth.uid() and active = true and role = 'president'
  );
$$;

revoke execute on function public.is_member() from anon, public;
revoke execute on function public.is_president() from anon, public;
grant execute on function public.is_member() to authenticated;
grant execute on function public.is_president() to authenticated;

create policy "Members see themselves, president sees all"
  on public.members for select to authenticated
  using (user_id = auth.uid() or public.is_president());


-- =====================================================
-- 2. طلبات المساعدة
-- =====================================================
create table public.help_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null check (char_length(full_name) between 3 and 100),
  phone text not null check (phone ~ '^0[0-9]{8,9}$'),
  wilaya text not null,
  daira text not null,
  commune text not null,
  street text check (char_length(street) <= 200),
  family_size int check (family_size between 1 and 30),
  need_type text not null,
  description text check (char_length(description) <= 1000),
  status text not null default 'new'
    check (status in ('new', 'reviewing', 'accepted', 'served', 'rejected'))
);

alter table public.help_requests enable row level security;
grant insert on public.help_requests to anon, authenticated;
grant select, update on public.help_requests to authenticated;

create policy "Visitors can submit help requests"
  on public.help_requests for insert to anon, authenticated
  with check (status = 'new');

create policy "Members can read help requests"
  on public.help_requests for select to authenticated
  using (public.is_member());

create policy "Members can update help requests"
  on public.help_requests for update to authenticated
  using (public.is_member()) with check (public.is_member());


-- =====================================================
-- 3. المتطوعون
-- =====================================================
create table public.volunteers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null check (char_length(full_name) between 3 and 100),
  phone text not null check (phone ~ '^0[0-9]{8,9}$'),
  wilaya text not null,
  daira text not null,
  commune text not null,
  skills text check (char_length(skills) <= 500),
  availability text check (char_length(availability) <= 200),
  status text not null default 'new'
    check (status in ('new', 'contacted', 'active', 'inactive'))
);

alter table public.volunteers enable row level security;
grant insert on public.volunteers to anon, authenticated;
grant select, update on public.volunteers to authenticated;

create policy "Visitors can register as volunteers"
  on public.volunteers for insert to anon, authenticated
  with check (status = 'new');

create policy "Members can read volunteers"
  on public.volunteers for select to authenticated
  using (public.is_member());

create policy "Members can update volunteers"
  on public.volunteers for update to authenticated
  using (public.is_member()) with check (public.is_member());


-- =====================================================
-- 4. الحملات
-- =====================================================
create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null check (char_length(title) between 3 and 120),
  description text check (char_length(description) <= 500),
  goal bigint not null check (goal > 0),
  raised bigint not null default 0 check (raised >= 0),
  enabled boolean not null default true,
  sort_order int not null default 0
);

alter table public.campaigns enable row level security;
grant select on public.campaigns to anon, authenticated;
grant insert, update, delete on public.campaigns to authenticated;

create policy "Visitors can read enabled campaigns"
  on public.campaigns for select to anon
  using (enabled = true);

create policy "Members can read all campaigns"
  on public.campaigns for select to authenticated
  using (public.is_member());

create policy "Members can add campaigns"
  on public.campaigns for insert to authenticated
  with check (public.is_member());

create policy "Members can update campaigns"
  on public.campaigns for update to authenticated
  using (public.is_member()) with check (public.is_member());

create policy "Members can delete campaigns"
  on public.campaigns for delete to authenticated
  using (public.is_member());


-- =====================================================
-- 5. الأخبار
-- =====================================================
create table public.news (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null check (char_length(title) between 3 and 150),
  excerpt text check (char_length(excerpt) <= 600),
  published_at date not null default current_date,
  published boolean not null default true
);

alter table public.news enable row level security;
grant select on public.news to anon, authenticated;
grant insert, update, delete on public.news to authenticated;

create policy "Visitors can read published news"
  on public.news for select to anon
  using (published = true);

create policy "Members can read all news"
  on public.news for select to authenticated
  using (public.is_member());

create policy "Members can add news"
  on public.news for insert to authenticated
  with check (public.is_member());

create policy "Members can update news"
  on public.news for update to authenticated
  using (public.is_member()) with check (public.is_member());

create policy "Members can delete news"
  on public.news for delete to authenticated
  using (public.is_member());


-- =====================================================
-- 6. النشاطات
-- =====================================================
create table public.activities (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,40}$'),
  title text not null check (char_length(title) between 2 and 80),
  description text check (char_length(description) <= 400),
  enabled boolean not null default true,
  sort_order int not null default 0
);

alter table public.activities enable row level security;
grant select on public.activities to anon, authenticated;
grant insert, update, delete on public.activities to authenticated;

create policy "Visitors can read enabled activities"
  on public.activities for select to anon
  using (enabled = true);

create policy "Members can read all activities"
  on public.activities for select to authenticated
  using (public.is_member());

create policy "Members can add activities"
  on public.activities for insert to authenticated
  with check (public.is_member());

create policy "Members can update activities"
  on public.activities for update to authenticated
  using (public.is_member()) with check (public.is_member());

create policy "Members can delete activities"
  on public.activities for delete to authenticated
  using (public.is_member());


-- =====================================================
-- 7. الإعدادات العامة (سطر واحد)
-- =====================================================
create table public.site_settings (
  id int primary key default 1 check (id = 1),
  updated_at timestamptz not null default now(),
  data jsonb not null
);

alter table public.site_settings enable row level security;
grant select on public.site_settings to anon, authenticated;
grant update on public.site_settings to authenticated;

create policy "Anyone can read settings"
  on public.site_settings for select to anon, authenticated
  using (true);

create policy "President can update settings"
  on public.site_settings for update to authenticated
  using (public.is_president()) with check (public.is_president());


-- =====================================================
-- 8. المستفيدون وسجل المساعدات
-- =====================================================
create table public.beneficiaries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  head_name text not null check (char_length(head_name) between 3 and 100),
  national_id text unique check (national_id ~ '^[0-9]{18}$'),
  phone text not null check (phone ~ '^0[0-9]{8,9}$'),
  wilaya text not null,
  daira text not null,
  commune text not null,
  street text check (char_length(street) <= 200),
  family_size int check (family_size between 1 and 30),
  situation text check (char_length(situation) <= 200),
  notes text check (char_length(notes) <= 1000),
  status text not null default 'active'
    check (status in ('active', 'inactive')),
  help_request_id uuid unique
    references public.help_requests(id) on delete set null
);

create index beneficiaries_phone_idx on public.beneficiaries (phone);

create table public.aid_records (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  beneficiary_id uuid not null
    references public.beneficiaries(id) on delete restrict,
  aid_date date not null default current_date,
  aid_type text not null check (char_length(aid_type) between 1 and 40),
  campaign_id uuid references public.campaigns(id) on delete set null,
  description text check (char_length(description) <= 500),
  amount bigint check (amount >= 0),
  created_by uuid default auth.uid()
    references auth.users(id) on delete set null
);

create index aid_records_beneficiary_idx on public.aid_records (beneficiary_id);
create index aid_records_campaign_idx on public.aid_records (campaign_id);

alter table public.beneficiaries enable row level security;
alter table public.aid_records enable row level security;

grant select, insert, update on public.beneficiaries to authenticated;
grant select, insert, update on public.aid_records to authenticated;

create policy "Members can read beneficiaries"
  on public.beneficiaries for select to authenticated
  using (public.is_member());

create policy "Members can add beneficiaries"
  on public.beneficiaries for insert to authenticated
  with check (public.is_member());

create policy "Members can update beneficiaries"
  on public.beneficiaries for update to authenticated
  using (public.is_member()) with check (public.is_member());

create policy "Members can read aid records"
  on public.aid_records for select to authenticated
  using (public.is_member());

create policy "Members can add aid records"
  on public.aid_records for insert to authenticated
  with check (public.is_member());

create policy "Members can update aid records"
  on public.aid_records for update to authenticated
  using (public.is_member()) with check (public.is_member());


-- =====================================================
-- 9. تأكيد صلاحيات المفتاح السري على كل ما سبق
-- =====================================================
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;


-- =====================================================
-- 10. البيانات الأولية
-- =====================================================
insert into public.activities (slug, title, description, sort_order) values
  ('ramadan', 'قفة رمضان', 'توزيع المواد الغذائية على العائلات المحتاجة خلال شهر رمضان.', 1),
  ('orphans', 'كفالة الأيتام', 'كفالة شهرية للأيتام ومتابعة احتياجاتهم الدراسية والصحية.', 2),
  ('patients', 'مساعدة المرضى', 'المساهمة في شراء الأدوية وتكاليف العمليات والفحوصات.', 3),
  ('school', 'الدخول المدرسي', 'توفير الأدوات المدرسية والملابس للتلاميذ مع بداية كل عام.', 4);

insert into public.site_settings (id, data) values (1, '{
  "name": "اسم الجمعية",
  "type": "جمعية خيرية",
  "fullName": "اسم الجمعية الكامل",
  "tagline": "معاً نصنع الفرق في حياة العائلات المحتاجة",
  "intro": "",
  "logo": null,
  "approval": { "number": "", "authority": "" },
  "address": { "wilaya": "", "daira": "", "commune": "", "street": "" },
  "contact": { "phone": "", "whatsapp": "", "email": "", "facebook": "" },
  "donation": { "ccp": "", "rip": "", "accountName": "" },
  "about": { "story": "", "vision": "", "mission": "", "foundedYear": "" },
  "help": {
    "intro": "إذا كنت أنت أو أحد معارفك في حاجة إلى مساعدة، يمكنك تقديم طلب للجمعية. تتم دراسة كل طلب بسرية تامة.",
    "documents": [
      "نسخة من بطاقة التعريف الوطنية",
      "شهادة عائلية",
      "شهادة الإقامة"
    ]
  },
  "stats": []
}'::jsonb);


-- =====================================================
-- انتهى الإعداد ✓
--
-- الخطوات التالية (يدوياً):
-- 1. Authentication ← Sign In / Providers ← أطفئ "Allow new users to sign up"
-- 2. Authentication ← Users ← Add user ← بريد الرئيس + كلمة سر + Auto Confirm
-- 3. نفّذ هذا بعد وضع بريد الرئيس:
--
--    insert into public.members (user_id, full_name, role)
--    select id, 'اسم الرئيس', 'president'
--    from auth.users where email = 'بريد_الرئيس';
-- =====================================================