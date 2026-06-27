import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; // evaluation ID
    const { verdict, conditions, motivations } = await req.json();

    const supabase = await createClient();

    const { error } = await supabase
      .from("evaluations")
      .update({
        dpo_final_verdict: verdict,
        dpo_conditions: conditions,
        dpo_motivations: motivations,
        dpo_reviewed_at: new Date().toISOString(),
        status: verdict === "rejected" ? "rejected" : verdict === "approved" ? "approved" : "approved_with_conditions",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
