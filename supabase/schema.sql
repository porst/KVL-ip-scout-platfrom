-- IP Scout — Week 1 資料庫初始化
-- Supabase 專案：pwglvzxhgazmpiujmoza
-- 執行位置：Supabase Dashboard → SQL Editor → New query → 貼上整份 → Run
-- 注意：目前不啟用 Row Level Security（內部團隊用 publishable key 直接讀寫）。

create extension if not exists pgcrypto;

-- ── candidates ────────────────────────────────────────────────────────
create table if not exists candidates (
  id uuid primary key default gen_random_uuid(),

  -- 識別 / 聯絡資訊
  handle_ig text unique not null,
  handle_behance text,
  handle_etsy text,
  name text,
  website text,
  country text,
  contact_email text,

  -- IP 錨點與創作輪廓
  ip_anchor_type text check (ip_anchor_type in ('character', 'style', 'service', 'incubation', 'unknown')),
  style_tags text[],
  motifs text[],
  matched_vectors text[],
  palette text,
  sample_work_description text,
  has_character_world boolean,

  -- 商業與權利狀態
  agency_status text,
  existing_licenses text[],
  merch_saturation text check (merch_saturation in ('none', 'minimal', 'low', 'medium', 'high')),
  asia_presence text check (asia_presence in ('none', 'minimal', 'established')),
  commercial_awareness text check (commercial_awareness in ('none', 'low', 'medium', 'high')),
  followers_ig integer,
  engagement_rate decimal(5, 2),
  ownership_clarity text check (ownership_clarity in ('clear', 'uncertain', 'complex')),

  -- Red flags
  red_flag_triggered boolean not null default false,
  red_flags text[],

  -- 八維度評分（1–5 分制）與附註
  d1_style_fit integer check (d1_style_fit between 1 and 5),
  d2_market_whitespace integer check (d2_market_whitespace between 1 and 5),
  d3_brand_extension integer check (d3_brand_extension between 1 and 5),
  d3_incubation_note text,
  d4_approachability integer check (d4_approachability between 1 and 5),
  d4_batna_assessment text,
  d5_audience integer check (d5_audience between 1 and 5),
  d6_rights integer check (d6_rights between 1 and 5),
  d7_production integer check (d7_production between 1 and 5),
  d7_embroidery_notes text,
  d8_rough_diamond integer check (d8_rough_diamond between 1 and 5),

  -- 綜合評估
  composite_score decimal(5, 1),
  rating text check (rating in ('PRIORITY', 'QUALIFIED', 'WATCH', 'PASS', 'DISQUALIFIED')),
  team_brief text,
  suggested_next_action text,

  -- 團隊決策與狀態
  status text not null default 'pending_review' check (
    status in (
      'pending_review', 'scoring', 'shortlisted', 'in_negotiation',
      'contracted', 'incubating', 'watching', 'passed', 'disqualified'
    )
  ),
  decision_note text,
  decided_by text,
  decided_at timestamptz,

  -- 中繼資料
  source text,
  added_by text not null default 'system',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at 自動更新
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_candidates_updated_at on candidates;
create trigger trg_candidates_updated_at
before update on candidates
for each row
execute function set_updated_at();

-- ── scout_logs ────────────────────────────────────────────────────────
create table if not exists scout_logs (
  id uuid primary key default gen_random_uuid(),
  run_date date not null,
  source text not null,
  total_scraped integer,
  new_added integer,
  priority_new integer,
  created_at timestamptz not null default now()
);
