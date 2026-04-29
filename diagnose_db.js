const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function diagnose() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log("--- DIAGNÓSTICO SIGNA ---");

  // 1. Verificar Tabelas
  const tables = ['tenants', 'profiles', 'patients', 'appointments', 'payments', 'ai_logs'];
  console.log("\n1. Verificando Tabelas:");
  for (const table of tables) {
    const { error } = await supabase.from(table).select('id').limit(1);
    if (error) {
      console.log(`[ERRO] Tabela '${table}': ${error.message}`);
    } else {
      console.log(`[OK] Tabela '${table}' existe.`);
    }
  }

  // 2. Verificar Usuários e Perfis
  console.log("\n2. Verificando Usuários:");
  const { data: users, error: userError } = await supabase.auth.admin.listUsers();
  if (userError) {
    console.log(`[ERRO] Não foi possível listar usuários: ${userError.message}`);
  } else {
    console.log(`Total de usuários no Auth: ${users.users.length}`);
    for (const user of users.users) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (!profile) {
        console.log(`[ALERTA] Usuário ${user.email} não tem perfil na tabela 'public.profiles'.`);
      } else {
        console.log(`[OK] Usuário ${user.email} tem perfil (Role: ${profile.role}, Tenant: ${profile.tenant_id || 'Nenhum'}).`);
      }
    }
  }

  // 3. Verificar Políticas RLS (via consulta direta ao schema)
  console.log("\n3. Verificando Políticas de Segurança (RLS):");
  const { data: policies, error: polError } = await supabase.rpc('get_policies'); // Tentativa via RPC ou query direta
  
  // Como não temos a função RPC get_policies, vamos tentar ler uma clínica com o Service Role (que pula RLS)
  // e depois testar o acesso do admin
  const { count: tenantCount } = await supabase.from('tenants').select('*', { count: 'exact', head: true });
  console.log(`Total de clínicas no banco: ${tenantCount}`);
}

diagnose();
