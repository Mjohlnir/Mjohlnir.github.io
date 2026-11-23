-- Aplicar apenas após aprovação no ambiente de destino.
-- A função existente atlas-chapters lê o catálogo com o papel authenticated.
-- Este catálogo contém referências públicas de publicação, sem registros por usuário.
begin;
grant select on table public.chapter_references to authenticated;
do $$
begin
 if not exists (select 1 from pg_class where oid='public.chapter_references'::regclass and relrowsecurity) then
  raise exception 'RLS deve permanecer ativa no catálogo de capítulos';
 end if;
 if has_table_privilege('anon','public.chapter_references','SELECT') then
  raise exception 'O catálogo não deve ser concedido ao papel anônimo';
 end if;
end $$;
commit;
-- Reversão, se a concessão não existia antes: revoke select on table public.chapter_references from authenticated;
