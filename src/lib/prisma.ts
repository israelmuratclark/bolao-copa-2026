/**
 * Re-exports the Supabase-backed database adapter as `prisma`
 * so all existing imports continue to work without modification.
 */
export { db as prisma } from "@/lib/db";
