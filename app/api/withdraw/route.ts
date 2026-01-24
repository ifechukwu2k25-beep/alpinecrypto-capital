import { createClient } from '../../../lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { amount, planId, walletAddress, currency, network } = await request.json();

    // 1. Authenticate User
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let finalAmount = Number(amount);
    const withdrawalFee = finalAmount * 0.10; // 10% Fee logic implemented

    // 2. Logic: If withdrawing from a specific investment plan
    if (planId) {
      const { data: userPlan, error: planError } = await (supabase
        .from('user_plans') as any)
        .select('*, investment_plans(*)')
        .eq('id', planId)
        .eq('user_id', user.id)
        .single();

      if (planError || !userPlan) {
        return NextResponse.json({ error: 'Investment plan not found' }, { status: 404 });
      }

      // Calculate if the lock period has passed
      const createdAt = new Date(userPlan.created_at).getTime();
      const lockHours = userPlan.investment_plans?.lock_period_hours || 0;
      const unlockTime = createdAt + (lockHours * 60 * 60 * 1000);

      if (Date.now() < unlockTime && userPlan.investment_plans?.withdrawal_type === 'full') {
        const remainingHours = Math.ceil((unlockTime - Date.now()) / (1000 * 60 * 60));
        return NextResponse.json({ 
          error: `Capital is locked. Remaining time: ${remainingHours} hours.` 
        }, { status: 400 });
      }

      // Check available amount (Capital + Accumulated ROI)
      const available = Number(userPlan.amount) + Number(userPlan.accumulated_roi || 0);
      if (finalAmount > available) {
        return NextResponse.json({ error: 'Insufficient plan balance' }, { status: 400 });
      }

    } else {
      // 3. Logic: If withdrawing from main balance
      const { data: profile } = await (supabase
        .from('profiles') as any)
        .select('balance')
        .eq('id', user.id)
        .single();

      if (!profile || Number(profile.balance) < finalAmount) {
        return NextResponse.json({ error: 'Insufficient main balance' }, { status: 400 });
      }
    }

    // 4. Create Withdrawal Request (Status: Pending)
    const { error: withdrawError } = await (supabase
      .from('withdrawals') as any)
      .insert({
        user_id: user.id,
        amount: finalAmount,
        currency: currency,
        wallet_address: walletAddress,
        network: network,
        fee: withdrawalFee,
        status: 'pending'
      });

    if (withdrawError) throw withdrawError;

    // 5. Deduct from Balance (If not from plan, deduct from main profile)
    if (!planId) {
       await (supabase.from('profiles') as any)
        .update({ balance: (await (supabase.from('profiles') as any).select('balance').eq('id', user.id).single()).data.balance - finalAmount })
        .eq('id', user.id);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Withdrawal request submitted for admin approval.' 
    });

  } catch (err: any) {
    console.error("Withdrawal Error:", err.message);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}