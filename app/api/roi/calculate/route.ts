import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  shouldCalculateROI,
  generateROI,
  calculateROIAmount,
  getNextROIDate,
} from "@/lib/plans";
import { sendROINotification } from "@/lib/notifications";

/**
 * POST /api/roi/calculate
 * Calculate and apply ROI for eligible user plans
 * This should be called by a cron job or scheduled task
 */
export async function POST(req: Request) {
  try {
    // Verify admin/secret key for security
    const authHeader = req.headers.get("authorization");
    const secretKey = process.env.ROI_SECRET_KEY || "change-me-in-production";

    if (authHeader !== `Bearer ${secretKey}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const now = new Date();

    // Get all active plans that are due for ROI calculation
    const { data: plans, error: plansError } = await (supabase
      .from("user_plans") as any)
      .select(`
        *,
        investment_plans (
          roi_min,
          roi_max,
          roi_frequency
        )
      `)
      .eq("status", "active")
      .lte("next_roi_calculation", now.toISOString());

    if (plansError) {
      return NextResponse.json(
        { error: plansError.message },
        { status: 500 }
      );
    }

    if (!plans || plans.length === 0) {
      return NextResponse.json({ message: "No plans due for ROI calculation" });
    }

    const results = [];

    for (const userPlan of plans) {
      const plan = userPlan.investment_plans as any;
      if (!plan) continue;

      const frequency = plan.roi_frequency || "daily";
      const lastCalc = userPlan.last_roi_calculation;

      if (!shouldCalculateROI(frequency, lastCalc, now)) {
        continue;
      }

      // Generate ROI percentage
      const roiPercentage = generateROI(plan.roi_min, plan.roi_max);
      const roiAmount = calculateROIAmount(
        userPlan.current_balance || userPlan.invested_amount,
        roiPercentage
      );

      const balanceBefore = userPlan.current_balance || userPlan.invested_amount;
      const balanceAfter = balanceBefore + roiAmount;
      const totalEarned = (userPlan.total_earned || 0) + roiAmount;

      // Update user plan
      const { error: updateError } = await (supabase
        .from("user_plans") as any)
        .update({
          current_balance: balanceAfter,
          total_earned: totalEarned,
          last_roi_calculation: now.toISOString(),
          next_roi_calculation: getNextROIDate(frequency, now.toISOString()).toISOString(),
          updated_at: now.toISOString(),
        })
        .eq("id", userPlan.id);

      if (updateError) {
        console.error(`Failed to update plan ${userPlan.id}:`, updateError);
        continue;
      }

      // Record ROI in history
      await (supabase.from("roi_history") as any).insert({
        user_plan_id: userPlan.id,
        user_id: userPlan.user_id,
        roi_amount: roiAmount,
        roi_percentage: roiPercentage,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        calculation_date: now.toISOString(),
      });

      // Create transaction
      await (supabase.from("user_transactions") as any).insert({
        user_id: userPlan.user_id,
        transaction_type: "roi",
        amount: roiAmount,
        status: "completed",
        description: `ROI from ${userPlan.plan_name}`,
        reference_id: userPlan.id,
      });

      // Get user email for notification
      const { data: profile } = await (supabase
        .from("profiles") as any)
        .select("email")
        .eq("id", userPlan.user_id)
        .single();

      if (profile?.email) {
        await sendROINotification(profile.email, userPlan.plan_name, roiAmount);
      }

      results.push({
        planId: userPlan.id,
        roiAmount,
        roiPercentage,
        balanceAfter,
      });
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (error: any) {
    console.error("ROI calculation error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}
