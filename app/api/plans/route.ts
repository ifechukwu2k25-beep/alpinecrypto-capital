import { createClient } from '../../../lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Using 'as any' on the table selection to bypass TypeScript strictness
    const { data: plans, error } = await (supabase.from("investment_plans") as any)
      .select("*")
      .eq("is_active", true)
      .order("min_deposit", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(plans || []);
  } catch (err: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { planId, amount } = await request.json();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Using 'as any' here prevents the 'never' errors on profile and plan
    const [profileRes, planRes] = await Promise.all([
      (supabase.from('profiles') as any).select('balance').eq('id', user.id).single(),
      (supabase.from('investment_plans') as any).select('*').eq('id', planId).single()
    ]);

    const profile = profileRes.data;
    const plan = planRes.data;

    if (!profile || !plan) {
      return NextResponse.json({ error: 'Required data not found' }, { status: 404 });
    }

    if (Number(profile.balance) < Number(amount)) {
      return NextResponse.json({ 
        error: 'Insufficient balance', 
        topUpRequired: true, 
        diff: Number(amount) - Number(profile.balance) 
      }, { status: 400 });
    }

    // Checking the 10-plan limit with bypass
    const { count, error: countError } = await (supabase.from('user_plans') as any)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (countError) throw countError;
    if (count !== null && count >= 10) {
      return NextResponse.json({ error: 'Maximum of 10 active plans reached' }, { status: 400 });
    }

    // UPDATE logic with 'as any' fix
    const { error: deductError } = await (supabase.from('profiles') as any)
      .update({ balance: Number(profile.balance) - Number(amount) })
      .eq('id', user.id);

    if (deductError) throw deductError;

    // INSERT logic with 'as any' fix
    const { error: investError } = await (supabase.from('user_plans') as any)
      .insert({
        user_id: user.id,
        plan_id: planId,
        amount: Number(amount),
        status: 'active'
      });

    if (investError) throw investError;

    return NextResponse.json({ success: true });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}