import { FlashLoanOpportunity, RouteHop, FlashLoanProviderId } from './types';
import { FlashLoanProviderAdapter } from './flashLoanProviderAdapters';
import { DeFiMarketIntelligence } from './defiMarketIntelligence';

export class ArbitrageRouteOptimizer {
  /**
   * Computes the complete quantitative profit breakdown for an arbitrage opportunity
   */
  public static calculateNetProfitability(params: {
    loanAmount: number;
    tokenPriceUsd: number;
    providerId: FlashLoanProviderId;
    route: RouteHop[];
    gasUnitsEstimated: number;
    gasPriceGwei: number;
    nativePriceUsd: number;
  }): {
    grossRevenueUsd: number;
    flashLoanFeeAmount: number;
    flashLoanFeeUsd: number;
    dexFeesUsd: number;
    gasCostUsd: number;
    totalCostUsd: number;
    netProfitUsd: number;
    netProfitPercent: number;
    isProfitable: boolean;
  } {
    const {
      loanAmount,
      tokenPriceUsd,
      providerId,
      route,
      gasUnitsEstimated,
      gasPriceGwei,
      nativePriceUsd,
    } = params;

    // 1. Final token amount after all route hops
    const finalAmountOut = route.length > 0 ? route[route.length - 1].expectedAmountOut : 0;

    // 2. Flash loan repayment calculation
    const repayment = FlashLoanProviderAdapter.calculateRepaymentCost(providerId, loanAmount);
    const flashLoanFeeAmount = repayment.feeAmount;
    const flashLoanFeeUsd = flashLoanFeeAmount * tokenPriceUsd;

    // 3. Gross revenue: delta between output and the principal borrowed
    // Gross revenue = (finalAmountOut - loanAmount) * tokenPriceUsd
    const rawProfitTokens = finalAmountOut - loanAmount;
    const grossRevenueUsd = Number((rawProfitTokens * tokenPriceUsd).toFixed(2));

    // 4. Cumulative DEX fees along the path
    let dexFeesUsd = 0;
    route.forEach((hop) => {
      const hopFeeUsd = hop.amountIn * (hop.poolFeePercent / 100) * tokenPriceUsd;
      dexFeesUsd += hopFeeUsd;
    });
    dexFeesUsd = Number(dexFeesUsd.toFixed(2));

    // 5. Gas cost calculation: gasUnits * gasPriceGwei * 1e-9 * nativePriceUsd
    const gasEth = (gasUnitsEstimated * gasPriceGwei) / 1e9;
    const gasCostUsd = Number((gasEth * nativePriceUsd).toFixed(2));

    // 6. Total costs: Flash loan premium + DEX trading fees + On-chain gas fee
    const totalCostUsd = Number((flashLoanFeeUsd + dexFeesUsd + gasCostUsd).toFixed(2));

    // 7. Net Profit:
    // Net profit = Gross Revenue - Flash Loan Fee - Gas Cost
    // (Note: DEX fees are already reflected in finalAmountOut via constant product pool deductions,
    // but we record them transparently for auditing).
    const netProfitUsd = Number((grossRevenueUsd - flashLoanFeeUsd - gasCostUsd).toFixed(2));

    // Net profit as percentage of borrowed capital
    const principalValueUsd = loanAmount * tokenPriceUsd;
    const netProfitPercent = principalValueUsd > 0
      ? Number(((netProfitUsd / principalValueUsd) * 100).toFixed(3))
      : 0;

    return {
      grossRevenueUsd,
      flashLoanFeeAmount,
      flashLoanFeeUsd,
      dexFeesUsd,
      gasCostUsd,
      totalCostUsd,
      netProfitUsd,
      netProfitPercent,
      isProfitable: netProfitUsd > 0,
    };
  }

  /**
   * Optimizes loan amount sizing to maximize net profit considering price impact
   */
  public static findOptimalLoanSize(
    baseLoanAmount: number,
    poolA: { reserveIn: number; reserveOut: number; feePercent: number },
    poolB: { reserveIn: number; reserveOut: number; feePercent: number }
  ): number {
    // Discrete sizing search around base loan amount
    const multipliers = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    let bestSize = baseLoanAmount;
    let maxSpreadDelta = -Infinity;

    for (const m of multipliers) {
      const candidateSize = baseLoanAmount * m;
      const hop1 = DeFiMarketIntelligence.calculateTradeHop(
        candidateSize,
        poolA.reserveIn,
        poolA.reserveOut,
        poolA.feePercent
      );
      const hop2 = DeFiMarketIntelligence.calculateTradeHop(
        hop1.amountOut,
        poolB.reserveIn,
        poolB.reserveOut,
        poolB.feePercent
      );

      const delta = hop2.amountOut - candidateSize;
      if (delta > maxSpreadDelta) {
        maxSpreadDelta = delta;
        bestSize = candidateSize;
      }
    }

    return Math.round(bestSize);
  }
}
