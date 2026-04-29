"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function createTenant(formData: FormData) {
  const supabase = await createAdminClient()
  const name = formData.get("name") as string
  const slug = name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "")

  if (!name) return { error: "O nome da clínica é obrigatório." }

  const { data, error } = await supabase
    .from("tenants")
    .insert([{ name, slug, status: "active" }])
    .select()

  if (error) {
    console.error("Erro ao criar clínica:", error.message)
    return { error: "Não foi possível criar a clínica." }
  }

  revalidatePath("/admin/tenants")
  return { success: true }
}

export async function updateTenantSlug(tenantId: string, name: string) {
  const supabase = await createAdminClient()
  const slug = name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "")

  const { error } = await supabase
    .from("tenants")
    .update({ slug })
    .eq("id", tenantId)

  if (error) return { error: "Erro ao gerar link." }

  revalidatePath("/admin/tenants")
  return { success: true }
}
