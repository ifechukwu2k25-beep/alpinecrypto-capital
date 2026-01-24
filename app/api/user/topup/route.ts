import { NextResponse } from "next/server";
import { getUserFromRequest } from "../../../../lib/supabaseServer";
import { createClient } from "../../../../lib/supabase/server";

/**
 * POST /api/user/topup
 * Manually adds funds to user balance (Admin/System use)
 */
export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { amount } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Get current balance using 'as any' to bypass the 'never' error
    const { data: profile } = await (supabase
      .from("profiles") as any)
      .select("balance")
      .eq("id", user.id)
      .single();

    const currentBalance = Number(profile?.balance || 0);
    const newBalance = currentBalance + Number(amount);

    // 2. Update balance using 'as any'
    const { error: updateError } = await (supabase
      .from("profiles") as any)
      .update({ balance: newBalance })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json({ error: "Failed to update balance" }, { status: 500 });
    }

    // 3. Create transaction record (Using 'type' to match our DB schema)
    const { error: txError } = await (supabase
      .from("user_transactions") as any)
      .insert({
        user_id: user.id,
        type: "deposit",
        amount: Number(amount),
        status: "completed",
        description: "Balance top-up"
      });

    if (txError) {
      console.error("Transaction Log Error:", txError.message);
      // We don't return 500 here because the balance was already updated successfully
    }

    return NextResponse.json({ 
      success: true, 
      newBalance 
    });

  } catch (error: any) {
    console.error("Topup Error:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}