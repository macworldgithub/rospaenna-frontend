import rules from "@/config/demo-booking-rules.json";

export { rules as demoBookingRules };

export function minimumDemoRounds(nights: number): number | null {
  return rules.minimumRounds.find(rule => nights >= rule.minimumNights && nights <= rule.maximumNights)?.rounds ?? null;
}

// These are demo estimates only. Real golf options come from the BRS backend.
export function demoPaymentSplit(total: number) {
  const deposit = Math.round(total * rules.payment.depositPercent) / 100;
  return { deposit, balance: Math.round((total - deposit) * 100) / 100 };
}
