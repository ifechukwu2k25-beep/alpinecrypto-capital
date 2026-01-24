/**
 * Investment Plan Business Logic
 */

/**
 * Calculate top-up amount required for investment
 * @param userBalance Current user balance
 * @param desiredAmount Desired investment amount
 * @returns Top-up amount needed (0 if sufficient balance)
 */
export function calculateTopUp(userBalance: number, desiredAmount: number): number {
  if (userBalance >= desiredAmount) {
    return 0;
  }
  return desiredAmount - userBalance;
}

/**
 * Calculate upgrade price difference
 * @param currentInvestment Current invested amount
 * @param newPlanMin New plan minimum amount
 * @returns Price difference needed for upgrade
 */
export function calculateUpgradePrice(
  currentInvestment: number,
  newPlanMin: number
): number {
  const difference = newPlanMin - currentInvestment;
  return difference > 0 ? difference : 0;
}

/**
 * Get lock period in days based on plan key
 */
export function getLockPeriod(planKey: string): number {
  const lockPeriods: Record<string, number> = {
    starter: 30,
    growth: 30,
    professional: 7,
    institutional: 1,
    premier: 1,
  };
  return lockPeriods[planKey.toLowerCase()] || 30;
}

/**
 * Check if withdrawal is allowed (lock period check)
 */
export function canWithdraw(
  planKey: string,
  lockUntil: string | null,
  currentDate: Date = new Date()
): { allowed: boolean; reason?: string } {
  if (!lockUntil) {
    return { allowed: true };
  }

  const lockDate = new Date(lockUntil);
  const now = currentDate;

  if (now < lockDate) {
    const daysRemaining = Math.ceil((lockDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return {
      allowed: false,
      reason: `Withdrawal locked for ${daysRemaining} more day(s). Lock expires on ${lockDate.toLocaleDateString()}`,
    };
  }

  return { allowed: true };
}

/**
 * Calculate withdrawal fee (10% of amount)
 */
export function calculateWithdrawalFee(amount: number): number {
  return amount * 0.1; // 10% fee
}

/**
 * Calculate net withdrawal amount after fee
 */
export function calculateNetWithdrawal(amount: number): number {
  return amount - calculateWithdrawalFee(amount);
}

/**
 * Generate random ROI percentage between min and max
 */
export function generateROI(roiMin: number, roiMax: number): number {
  return Math.random() * (roiMax - roiMin) + roiMin;
}

/**
 * Calculate ROI amount based on investment and percentage
 */
export function calculateROIAmount(investedAmount: number, roiPercentage: number): number {
  return (investedAmount * roiPercentage) / 100;
}

/**
 * Check if ROI should be calculated (based on frequency and last calculation)
 */
export function shouldCalculateROI(
  frequency: "daily" | "weekly",
  lastCalculation: string | null,
  currentDate: Date = new Date()
): boolean {
  if (!lastCalculation) {
    return true; // First calculation
  }

  const lastCalc = new Date(lastCalculation);
  const now = currentDate;
  const diffMs = now.getTime() - lastCalc.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (frequency === "daily") {
    return diffHours >= 24;
  } else if (frequency === "weekly") {
    return diffHours >= 168; // 7 days * 24 hours
  }

  return false;
}

/**
 * Calculate next ROI calculation date
 */
export function getNextROIDate(
  frequency: "daily" | "weekly",
  lastCalculation: string | null = null
): Date {
  const baseDate = lastCalculation ? new Date(lastCalculation) : new Date();
  const nextDate = new Date(baseDate);

  if (frequency === "daily") {
    nextDate.setHours(nextDate.getHours() + 24);
  } else if (frequency === "weekly") {
    nextDate.setDate(nextDate.getDate() + 7);
  }

  return nextDate;
}
