export function splitIntoTwoEqualPhases(total: number) {
  const cents = Math.round((Number.isFinite(total) ? total : 0) * 100);
  const phase1Cents = Math.round(cents / 2);
  const phase2Cents = cents - phase1Cents;
  return { phase1: phase1Cents / 100, phase2: phase2Cents / 100 };
}

