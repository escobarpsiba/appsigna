const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function heal() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log("🚀 Iniciando Reconstrução do Ambiente Signa...");

  // 1. Garantir que existe pelo menos uma Clínica
  let { data: tenant } = await supabase.from('tenants').select('*').limit(1).single();
  
  if (!tenant) {
    console.log("- Criando Clínica principal...");
    const { data: newTenant, error: tError } = await supabase
      .from('tenants')
      .insert([{ name: 'Clínica Principal Signa', status: 'active' }])
      .select()
      .single();
    
    if (tError) {
      console.error("❌ Erro ao criar clínica:", tError.message);
      return;
    }
    tenant = newTenant;
  }
  console.log(`✅ Clínica confirmada: ${tenant.name} (${tenant.id})`);

  // 2. Garantir que o usuário principal tem perfil e é admin
  const email = 'escobarpsiba@gmail.com';
  console.log(`- Configurando usuário: ${email}`);
  
  const { data: users } = await supabase.auth.admin.listUsers();
  const user = users.users.find(u => u.email === email);

  if (!user) {
    console.error(`❌ Usuário ${email} não encontrado no Auth do Supabase.`);
    return;
  }

  const { data: profile, error: pError } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      email: user.email,
      role: 'admin',
      tenant_id: tenant.id,
      name: 'Lúcio Escobar'
    }, { onConflict: 'id' })
    .select()
    .single();

  if (pError) {
    console.error("❌ Erro ao configurar perfil:", pError.message);
  } else {
    console.log(`✅ Perfil configurado: Role Admin, Vinculado à Clínica ${tenant.name}`);
  }

  console.log("\n✨ Reconstrução concluída! Reinicie sua aplicação e tudo deve estar visível agora.");
}

heal();
