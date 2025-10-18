-- Minimal SQL for Password Recovery Feature
-- Only add what's needed for the backend service role to access user data

-- Ensure the service role can access user_auth table for password recovery
grant select on public.user_auth to service_role;
grant select on public.owners to service_role;
grant select on public.agents to service_role;

-- Create a simple function to help with password recovery (admin access)
create or replace function public.get_user_profile_data(user_email text)
returns table (
  user_id uuid,
  full_name text,
  phone text,
  user_type text
)
language plpgsql
security definer
as $$
begin
  return query
  select 
    ua.id as user_id,
    case 
      when ua.owner_id is not null then o.full_name
      when ua.agent_id is not null then a.full_name
      else null
    end as full_name,
    case 
      when ua.owner_id is not null then o.phone
      when ua.agent_id is not null then a.phone
      else null
    end as phone,
    case 
      when ua.owner_id is not null then 'owner'
      when ua.agent_id is not null then 'agent'
      else 'unknown'
    end as user_type
  from public.user_auth ua
  left join public.owners o on ua.owner_id = o.id
  left join public.agents a on ua.agent_id = a.id
  join auth.users au on ua.id = au.id
  where au.email = user_email;
end;
$$;

-- Grant execute permission on the function to service_role
grant execute on function public.get_user_profile_data(text) to service_role;
