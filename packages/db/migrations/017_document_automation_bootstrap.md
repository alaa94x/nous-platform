# Document automation bootstrap

`017_document_automation_foundation.sql` creates profiles for existing Supabase
users, but intentionally grants no role automatically. This prevents an
unexpected authenticated account from becoming a finance administrator.

After applying the migration, assign the first trusted administrator in the
Supabase SQL editor:

```sql
INSERT INTO public.user_roles (user_id, role_id, granted_by)
SELECT
  u.id,
  r.id,
  u.id
FROM auth.users u
CROSS JOIN public.roles r
WHERE lower(u.email) = lower('REPLACE_WITH_ADMIN_EMAIL')
  AND r.key = 'super_admin'
ON CONFLICT (user_id, role_id) DO NOTHING;
```

Verify the assignment:

```sql
SELECT ap.display_name, r.key AS role
FROM public.admin_profiles ap
JOIN public.user_roles ur ON ur.user_id = ap.id
JOIN public.roles r ON r.id = ur.role_id;
```

## Migration source of truth

Until the older `supabase/migrations` directory is fully reconciled, new
application migrations continue in `packages/db/migrations`, which contains the
complete current schema history used by this repository. Do not copy only this
migration into a blank database; apply the preceding migrations in order.

For production, apply the migration in a staging Supabase project first. Test
login, role assignment, RLS and document numbering before applying it to the
production project.
