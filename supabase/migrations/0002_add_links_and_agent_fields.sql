-- IP Scout — Migration 0002
-- 補上前端已在使用、但 Week 1 schema 清單漏列的三個欄位：
-- links（其他連結，供 mShots 網站截圖預覽用）、
-- known_agents（已知代理商清單）、agent_negotiation_required（是否需透過代理談判）
-- 執行位置：Supabase Dashboard → SQL Editor → New query → 貼上整份 → Run

alter table candidates add column if not exists links text;
alter table candidates add column if not exists known_agents jsonb;
alter table candidates add column if not exists agent_negotiation_required boolean not null default false;
