const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://agoungdzmcrrnzhvnpmr.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnb3VuZ2R6bWNycm56aHZucG1yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzM3NTgyNSwiZXhwIjoyMDkyOTUxODI1fQ.amhdsxQdBZyiAAJtXmj_EV8NTtFPZzdQv4SnNPVll8A';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdmin() {
  const email = 'escobarpsiba@gmail.com';
  const password = 'admin1234';

  console.log(`Tentando criar usuário: ${email}`);

  // 1. Create the user in Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
      console.log('Usuário já existe no Auth.');
    } else {
      console.error('Erro ao criar usuário no Auth:', authError.message);
      return;
    }
  } else {
    console.log('Usuário criado com sucesso no Auth!');
  }

  // Get UID (either from new creation or search)
  let uid;
  if (authData?.user) {
    uid = authData.user.id;
  } else {
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    const user = users.users.find(u => u.email === email);
    if (user) uid = user.id;
  }

  if (!uid) {
    console.error('Não foi possível encontrar o UID do usuário.');
    return;
  }

  console.log(`UID do usuário: ${uid}`);

  // 2. Try to update the profile role to 'admin'
  // Note: This requires the 'profiles' table to exist.
  console.log('Tentando atualizar a role para admin na tabela profiles...');
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', uid);

  if (profileError) {
    console.error('Erro ao atualizar perfil:', profileError.message);
    if (profileError.message.includes('relation "public.profiles" does not exist')) {
      console.log('--- AVISO: A tabela "profiles" ainda não existe. ---');
      console.log('--- Por favor, aplique o arquivo supabase/schema.sql no SQL Editor do Supabase primeiro! ---');
    }
  } else {
    console.log('Role "admin" configurada com sucesso!');
  }
}

createAdmin();
