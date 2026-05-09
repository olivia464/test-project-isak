"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function addTodo(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const dueRaw = String(formData.get("due_date") ?? "").trim();
  const due_date = /^\d{4}-\d{2}-\d{2}$/.test(dueRaw) ? dueRaw : null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("todos")
    .insert({ title, user_id: user.id, due_date });
  revalidatePath("/");
}

export async function toggleTodo(id: string, completed: boolean) {
  const supabase = await createClient();
  await supabase.from("todos").update({ completed }).eq("id", id);
  revalidatePath("/");
}

export async function updateTodo(
  id: string,
  fields: { title?: string; description?: string | null; due_date?: string | null },
) {
  const update: Record<string, unknown> = {};

  if (fields.title !== undefined) {
    const trimmed = fields.title.trim();
    if (!trimmed || trimmed.length > 500) return;
    update.title = trimmed;
  }
  if (fields.description !== undefined) {
    const value =
      typeof fields.description === "string" ? fields.description.trim() : "";
    update.description = value.length === 0 ? null : value.slice(0, 2000);
  }
  if (fields.due_date !== undefined) {
    update.due_date =
      fields.due_date && /^\d{4}-\d{2}-\d{2}$/.test(fields.due_date)
        ? fields.due_date
        : null;
  }

  if (Object.keys(update).length === 0) return;

  const supabase = await createClient();
  await supabase.from("todos").update(update).eq("id", id);
  revalidatePath("/");
}

export async function deleteTodo(id: string) {
  const supabase = await createClient();
  await supabase.from("todos").delete().eq("id", id);
  revalidatePath("/");
}

export async function addSubtasks(titles: string[]) {
  const cleaned = titles
    .map((t) => t.trim())
    .filter((t) => t.length > 0 && t.length <= 500);
  if (cleaned.length === 0) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("todos")
    .insert(cleaned.map((title) => ({ title, user_id: user.id })));
  revalidatePath("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
