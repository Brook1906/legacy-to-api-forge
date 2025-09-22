-- File history table for uploads/downloads
create table if not exists file_history (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  action text not null check (action in ('upload', 'download')),
  created_at timestamp with time zone default now(),
  user_id uuid references auth.users(id)
);

create index if not exists idx_file_history_created_at on file_history(created_at desc);
create index if not exists idx_file_history_user_id on file_history(user_id);