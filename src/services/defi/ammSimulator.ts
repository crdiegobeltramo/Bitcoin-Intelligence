import { DexSimulationInput, DexSimulationOutput } from '../../types';

export class AmmSimulator {
  /**
   * Simulates a Constant Product Automated Market Maker (x * y = k) trade.
   * Model: Uniswap v2 invariant with fees deducted before constant product constraint.
   */
  public static simulateTrade(input: DexSimulationInput): DexSimulationOutput {
    const { reserveA, reserveB, tradeSize, isTokenAToB, feePercentage } = input;

    if (reserveA <= 0 || reserveB <= 0 || tradeSize <= 0) {
      return {
        initialPrice: 0,
        executionPrice: 0,
        amountReceived: 0,
        feePaid: 0,
        priceImpact: 0,
        slippage: 0,
        newReserveA: reserveA,
        newReserveB: reserveB,
        constantProductBefore: reserveA * reserveB,
        constantProductAfter: reserveA * reserveB,
        impermanentLossPercent: 0,
      };
    }

    const feeMultiplier = (100 - feePercentage) / 100;
    const initialPrice = isTokenAToB ? reserveB / reserveA : reserveA / reserveB;
    const initialK = reserveA * reserveB;

    let amountReceived = 0;
    let newReserveA = reserveA;
    let newReserveB = reserveB;
    let feePaid = 0;

    if (isTokenAToB) {
      // Selling Token A to buy Token B
      const amountInWithFee = tradeSize * feeMultiplier;
      feePaid = tradeSize * (feePercentage / 100);
      // Formula: delta_y = (y * delta_x_with_fee) / (x + delta_x_with_fee)
      amountReceived = (reserveB * amountInWithFee) / (reserveA + amountInWithFee);
      newReserveA = reserveA + tradeSize;
      newReserveB = Math.max(0, reserveB - amountReceived);
    } else {
      // Selling Token B to buy Token A
      const amountInWithFee = tradeSize * feeMultiplier;
      feePaid = tradeSize * (feePercentage / 100);
      // Formula: delta_x = (x * delta_y_with_fee) / (y + delta_y_with_fee)
      amountReceived = (reserveA * amountInWithFee) / (reserveB + amountInWithFee);
      newReserveB = reserveB + tradeSize;
      newReserveA = Math.max(0, reserveA - amountReceived);
    }

    const executionPrice = tradeSize > 0 ? amountReceived / tradeSize : 0;
    const newK = newReserveA * newReserveB;

    // Price Impact: difference between initial marginal price and effective trade price
    const theoreticalOutputAtSpot = tradeSize * initialPrice;
    const priceImpact = theoreticalOutputAtSpot > 0
      ? Math.max(0, ((theoreticalOutputAtSpot - amountReceived) / theoreticalOutputAtSpot) * 100)
      : 0;

    // Slippage percentage
    const slippage = initialPrice > 0 ? Math.abs((initialPrice - executionPrice) / initialPrice) * 100 : 0;

    // Impermanent Loss estimation for a price ratio r = P_new / P_old
    // Formula: IL(r) = (2 * sqrt(r) / (1 + r)) - 1
    const finalMarginalPrice = isTokenAToB ? newReserveB / newReserveA : newReserveA / newReserveB;
    const priceRatio = initialPrice > 0 ? finalMarginalPrice / initialPrice : 1;
    const impermanentLossDecimal = priceRatio > 0
      ? (2 * Math.sqrt(priceRatio)) / (1 + priceRatio) - 1
      : 0;
    const impermanentLossPercent = Math.abs(impermanentLossDecimal * 100);

    return {
      initialPrice: Number(initialPrice.toFixed(6)),
      executionPrice: Number(executionPrice.toFixed(6)),
      amountReceived: Number(amountReceived.toFixed(6)),
      feePaid: Number(feePaid.toFixed(6)),
      priceImpact: Number(priceImpact.toFixed(2)),
      slippage: Number(slippage.toFixed(2)),
      newReserveA: Number(newReserveA.toFixed(2)),
      newReserveB: Number(newReserveB.toFixed(2)),
      constantProductBefore: Number(initialK.toFixed(0)),
      constantProductAfter: Number(newK.toFixed(0)),
      impermanentLossPercent: Number(impermanentLossPercent.toFixed(4)),
    };
  }
}
