create extension if not exists "pgcrypto";
create extension if not exists "vector";

create type public.account_type as enum ('company', 'user');
create type public.resource_type as enum ('pdf', 'document', 'image', 'video', 'external_link', 'youtube');
create type public.assistant_role as enum ('user', 'assistant');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  company_name text,
  account_type public.account_type not null default 'user',
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  category text not null,
  manufacturer text not null,
  short_description text not null,
  detailed_description text not null,
  tags text[] not null default '{}',
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  public_url text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.product_resources (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  company_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  resource_type public.resource_type not null,
  storage_path text,
  public_url text,
  external_url text,
  description text,
  created_at timestamptz not null default now(),
  constraint resource_has_file_or_link check (
    storage_path is not null or external_url is not null
  )
);

create table public.product_resource_chunks (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  resource_id uuid references public.product_resources(id) on delete cascade,
  chunk_text text not null,
  source_title text not null,
  source_type text not null,
  chunk_index integer not null default 0,
  embedding vector(1536) not null,
  created_at timestamptz not null default now()
);

create table public.assistant_conversations (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default 'Product chat',
  created_at timestamptz not null default now()
);

create table public.assistant_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.assistant_conversations(id) on delete cascade,
  role public.assistant_role not null,
  content text not null,
  created_at timestamptz not null default now()
);

create index products_company_id_idx on public.products(company_id);
create index products_category_idx on public.products(category);
create index products_search_idx on public.products using gin (
  to_tsvector('english', name || ' ' || category || ' ' || manufacturer || ' ' || short_description)
);
create index product_images_product_id_idx on public.product_images(product_id);
create index product_resources_product_id_idx on public.product_resources(product_id);
create index product_resource_chunks_product_id_idx on public.product_resource_chunks(product_id);
create index product_resource_chunks_embedding_idx on public.product_resource_chunks
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);
create index assistant_conversations_product_user_idx on public.assistant_conversations(product_id, user_id);
create index assistant_messages_conversation_idx on public.assistant_messages(conversation_id, created_at);

create or replace function public.match_product_chunks(
  query_embedding vector(1536),
  match_product_id uuid,
  match_count int default 6,
  match_threshold float default 0.2
)
returns table (
  id uuid,
  product_id uuid,
  resource_id uuid,
  chunk_text text,
  source_title text,
  source_type text,
  similarity float
)
language sql
stable
as $$
  select
    product_resource_chunks.id,
    product_resource_chunks.product_id,
    product_resource_chunks.resource_id,
    product_resource_chunks.chunk_text,
    product_resource_chunks.source_title,
    product_resource_chunks.source_type,
    1 - (product_resource_chunks.embedding <=> query_embedding) as similarity
  from public.product_resource_chunks
  where product_resource_chunks.product_id = match_product_id
    and 1 - (product_resource_chunks.embedding <=> query_embedding) > match_threshold
  order by product_resource_chunks.embedding <=> query_embedding
  limit match_count;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, company_name, account_type)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'company_name',
    coalesce((new.raw_user_meta_data->>'account_type')::public.account_type, 'user')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_resources enable row level security;
alter table public.product_resource_chunks enable row level security;
alter table public.assistant_conversations enable row level security;
alter table public.assistant_messages enable row level security;

create policy "Profiles are readable by authenticated users"
on public.profiles for select
to authenticated
using (true);

create policy "Users can update their profile"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Products are publicly readable"
on public.products for select
to anon, authenticated
using (true);

create policy "Companies can create products"
on public.products for insert
to authenticated
with check (
  auth.uid() = company_id
  and exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.account_type = 'company'
  )
);

create policy "Companies manage their products"
on public.products for update
to authenticated
using (auth.uid() = company_id)
with check (auth.uid() = company_id);

create policy "Companies delete their products"
on public.products for delete
to authenticated
using (auth.uid() = company_id);

create policy "Product images are publicly readable"
on public.product_images for select
to anon, authenticated
using (true);

create policy "Companies manage product images"
on public.product_images for all
to authenticated
using (
  exists (
    select 1 from public.products
    where products.id = product_images.product_id
    and products.company_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.products
    where products.id = product_images.product_id
    and products.company_id = auth.uid()
  )
);

create policy "Resources are publicly readable"
on public.product_resources for select
to anon, authenticated
using (true);

create policy "Companies manage resources"
on public.product_resources for all
to authenticated
using (auth.uid() = company_id)
with check (auth.uid() = company_id);

create policy "Resource chunks are readable by authenticated users"
on public.product_resource_chunks for select
to authenticated
using (true);

create policy "Companies manage product chunks"
on public.product_resource_chunks for all
to authenticated
using (
  exists (
    select 1 from public.products
    where products.id = product_resource_chunks.product_id
    and products.company_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.products
    where products.id = product_resource_chunks.product_id
    and products.company_id = auth.uid()
  )
);

create policy "Users read their conversations"
on public.assistant_conversations for select
to authenticated
using (auth.uid() = user_id);

create policy "Users create conversations"
on public.assistant_conversations for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users manage their conversations"
on public.assistant_conversations for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users delete their conversations"
on public.assistant_conversations for delete
to authenticated
using (auth.uid() = user_id);

create policy "Users read their messages"
on public.assistant_messages for select
to authenticated
using (
  exists (
    select 1 from public.assistant_conversations
    where assistant_conversations.id = assistant_messages.conversation_id
    and assistant_conversations.user_id = auth.uid()
  )
);

create policy "Users create their messages"
on public.assistant_messages for insert
to authenticated
with check (
  exists (
    select 1 from public.assistant_conversations
    where assistant_conversations.id = assistant_messages.conversation_id
    and assistant_conversations.user_id = auth.uid()
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true, 10485760, array['image/png', 'image/jpeg', 'image/webp', 'image/gif']),
  ('product-resources', 'product-resources', true, 104857600, array['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'])
on conflict (id) do nothing;

create policy "Public product image access"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'product-images');

create policy "Public resource access"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'product-resources');

create policy "Authenticated users upload product images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'product-images' and owner = auth.uid());

create policy "Authenticated users update product images"
on storage.objects for update
to authenticated
using (bucket_id = 'product-images' and owner = auth.uid())
with check (bucket_id = 'product-images' and owner = auth.uid());

create policy "Authenticated users delete product images"
on storage.objects for delete
to authenticated
using (bucket_id = 'product-images' and owner = auth.uid());

create policy "Authenticated users upload resources"
on storage.objects for insert
to authenticated
with check (bucket_id = 'product-resources' and owner = auth.uid());

create policy "Authenticated users update resources"
on storage.objects for update
to authenticated
using (bucket_id = 'product-resources' and owner = auth.uid())
with check (bucket_id = 'product-resources' and owner = auth.uid());

create policy "Authenticated users delete resources"
on storage.objects for delete
to authenticated
using (bucket_id = 'product-resources' and owner = auth.uid());
