/**
 * Calculate netOut based on hybrid-invariant swap formula
 *
 * @param {number} grossInput   - The amount being swapped in (before fees)
 * @param {number} reserveA     - Current reserve of token A (x)
 * @param {number} reserveB     - Current reserve of token B (y)
 * @param {number} weightM      - The weight parameter m (0 < m < 1)
 * @param {number} k            - The hybrid invariant k
 * @param {number} feeRate      - Swap fee rate (e.g. 0.003)
 *
 * @returns {number} netOut     - Final output tokens after fee
 */
export function computeNetOut(
  grossInput: number,
  reserveA: number,
  reserveB: number,
  weightM: number,
  k: number,
  feeRate: number
) {
  // dx = grossInput * (1 - feeRate)
  const dx = grossInput * (1 - feeRate);

  // feeAmt = grossInput * feeRate (only useful if you need it returned too)
  const feeAmt = grossInput * feeRate;

  // x' = reserveA + dx
  const xPrime = reserveA + dx;

  // Terms
  const x = reserveA;
  const y = reserveB;
  const m = weightM;

  // denom = m + (1 - m) * x'
  const denom = m + (1 - m) * xPrime;

  if (denom === 0) {
    throw new Error("Insufficient denominator — denom is zero.");
  }

  // y' = (k - m * x') / denom
  const yPrime = (k - m * xPrime) / denom;

  // grossOut = y - y'
  const grossOut = y - yPrime;

  // netOut = grossOut (no further fee taken from output)
  const netOut = grossOut;

  return netOut;
}
