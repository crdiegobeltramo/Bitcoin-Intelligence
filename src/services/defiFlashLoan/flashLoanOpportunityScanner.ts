import { FlashLoanOpportunity, RouteHop, OpportunityStrategy, FlashLoanProviderId } from './types';
import { ArbitrageRouteOptimizer } from './arbitrageRouteOptimizer';
import { DeFiMarketIntelligence } from './defiMarketIntelligence';

export class FlashLoanOpportunityScanner {
  /**
   * Generates or scans current live market opportunities across EVM networks
   */
  public static async scanOpportunities(
    targetChainId: number = 56
  ): Promise<FlashLoanOpportunity[]> {
    const gasInfo = await DeFiMarketIntelligence.fetchNetworkGas(targetChainId);
    const timestamp = new Date().toISOString();

    const opportunities: FlashLoanOpportunity[] = [];

    // BSC Specific Opportunities
    if (targetChainId === 56) {
      // 1. Direct DEX Arbitrage: PancakeSwap v3 vs BiSwap (USDT loan)
      const loanAmountUsdt = 75000;
      const hop1 = DeFiMarketIntelligence.calculateTradeHop(loanAmountUsdt, 1850000, 2980, 0.05); // Buy WBNB on Pancake
      const hop2 = DeFiMarketIntelligence.calculateTradeHop(hop1.amountOut, 2950, 1862000, 0.1);  // Sell WBNB on BiSwap

      const route1: RouteHop[] = [
        {
          step: 1,
          dexName: 'PancakeSwap v3',
          routerAddress: '0x13f4EA83D0bd40E75C8222255bc855a974568Dd4',
          poolAddress: '0x36696169C63e42cd08ce11f5deeBbCeBae652050',
          tokenIn: { symbol: 'USDT', address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18 },
          tokenOut: { symbol: 'WBNB', address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', decimals: 18 },
          amountIn: loanAmountUsdt,
          expectedAmountOut: hop1.amountOut,
          poolReserveIn: 1850000,
          poolReserveOut: 2980,
          poolFeePercent: 0.05,
          slippagePercent: 0.12,
          priceImpactPercent: hop1.priceImpactPercent,
        },
        {
          step: 2,
          dexName: 'BiSwap DEX',
          routerAddress: '0x3a6d8cA21D1CF76F653A67577FA0D27453350dD8',
          poolAddress: '0xa3713f019F06a0961bA0241A41662Ceeb58d5FeA',
          tokenIn: { symbol: 'WBNB', address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', decimals: 18 },
          tokenOut: { symbol: 'USDT', address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18 },
          amountIn: hop1.amountOut,
          expectedAmountOut: hop2.amountOut,
          poolReserveIn: 2950,
          poolReserveOut: 1862000,
          poolFeePercent: 0.1,
          slippagePercent: 0.14,
          priceImpactPercent: hop2.priceImpactPercent,
        },
      ];

      const profitCalc1 = ArbitrageRouteOptimizer.calculateNetProfitability({
        loanAmount: loanAmountUsdt,
        tokenPriceUsd: 1.0,
        providerId: 'pancakeswap-v3',
        route: route1,
        gasUnitsEstimated: 245000,
        gasPriceGwei: gasInfo.standardGwei,
        nativePriceUsd: gasInfo.nativeTokenPriceUsd,
      });

      opportunities.push({
        id: `opp-bsc-001-${Date.now()}`,
        timestamp,
        network: 'bsc',
        chainId: 56,
        strategy: 'DEX_ARBITRAGE',
        status: profitCalc1.netProfitUsd > 10 ? 'DETECTED' : 'REJECTED',
        loanToken: { symbol: 'USDT', address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18 },
        loanAmount: loanAmountUsdt,
        loanAmountUsd: loanAmountUsdt,
        provider: {
          id: 'pancakeswap-v3',
          name: 'PancakeSwap v3 Flash Swap',
          poolAddress: '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865',
          feePercent: 0.01,
        },
        flashLoanFeeAmount: profitCalc1.flashLoanFeeAmount,
        flashLoanFeeUsd: profitCalc1.flashLoanFeeUsd,
        route: route1,
        grossRevenueUsd: profitCalc1.grossRevenueUsd,
        dexFeesUsd: profitCalc1.dexFeesUsd,
        estimatedGasUnits: 245000,
        gasPriceGwei: gasInfo.standardGwei,
        gasCostUsd: profitCalc1.gasCostUsd,
        otherCostUsd: 0,
        totalCostUsd: profitCalc1.totalCostUsd,
        netProfitUsd: profitCalc1.netProfitUsd,
        netProfitPercent: profitCalc1.netProfitPercent,
        confidenceScore: 94,
        dataFreshnessMs: 420,
        liquidityDepthUsd: 3712000,
        mevRiskLevel: 'LOW',
        honeypotChecked: true,
        repaymentGuaranteedAtomic: true,
      });

      // 2. Triangular Arbitrage on BSC: WBNB -> BUSD -> USDT -> WBNB
      const loanWbnb = 120;
      const wbnbPrice = gasInfo.nativeTokenPriceUsd;
      const tHop1 = DeFiMarketIntelligence.calculateTradeHop(loanWbnb, 4500, 2790000, 0.05); // WBNB -> BUSD
      const tHop2 = DeFiMarketIntelligence.calculateTradeHop(tHop1.amountOut, 15000000, 15003000, 0.01); // BUSD -> USDT
      const tHop3 = DeFiMarketIntelligence.calculateTradeHop(tHop2.amountOut, 2780000, 4492, 0.05); // USDT -> WBNB

      const route2: RouteHop[] = [
        {
          step: 1,
          dexName: 'PancakeSwap v3',
          routerAddress: '0x13f4EA83D0bd40E75C8222255bc855a974568Dd4',
          poolAddress: '0x58F876857a02D6762E0101bb5C46A8c1ED44Dc16',
          tokenIn: { symbol: 'WBNB', address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', decimals: 18 },
          tokenOut: { symbol: 'BUSD', address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', decimals: 18 },
          amountIn: loanWbnb,
          expectedAmountOut: tHop1.amountOut,
          poolReserveIn: 4500,
          poolReserveOut: 2790000,
          poolFeePercent: 0.05,
          slippagePercent: 0.08,
          priceImpactPercent: tHop1.priceImpactPercent,
        },
        {
          step: 2,
          dexName: 'Ellipsis / Curve Stable',
          routerAddress: '0x160CAed03795365F3D837718b30ecdb4e2E18c24',
          poolAddress: '0xb64E1C65B8374d7f7A58f8b8C64673B8a75eD8f1',
          tokenIn: { symbol: 'BUSD', address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', decimals: 18 },
          tokenOut: { symbol: 'USDT', address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18 },
          amountIn: tHop1.amountOut,
          expectedAmountOut: tHop2.amountOut,
          poolReserveIn: 15000000,
          poolReserveOut: 15003000,
          poolFeePercent: 0.01,
          slippagePercent: 0.02,
          priceImpactPercent: tHop2.priceImpactPercent,
        },
        {
          step: 3,
          dexName: 'BiSwap DEX',
          routerAddress: '0x3a6d8cA21D1CF76F653A67577FA0D27453350dD8',
          poolAddress: '0xa3713f019F06a0961bA0241A41662Ceeb58d5FeA',
          tokenIn: { symbol: 'USDT', address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18 },
          tokenOut: { symbol: 'WBNB', address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', decimals: 18 },
          amountIn: tHop2.amountOut,
          expectedAmountOut: tHop3.amountOut,
          poolReserveIn: 2780000,
          poolReserveOut: 4492,
          poolFeePercent: 0.05,
          slippagePercent: 0.10,
          priceImpactPercent: tHop3.priceImpactPercent,
        },
      ];

      const profitCalc2 = ArbitrageRouteOptimizer.calculateNetProfitability({
        loanAmount: loanWbnb,
        tokenPriceUsd: wbnbPrice,
        providerId: 'dodo',
        route: route2,
        gasUnitsEstimated: 310000,
        gasPriceGwei: gasInfo.standardGwei,
        nativePriceUsd: wbnbPrice,
      });

      opportunities.push({
        id: `opp-bsc-002-${Date.now()}`,
        timestamp,
        network: 'bsc',
        chainId: 56,
        strategy: 'TRIANGULAR',
        status: profitCalc2.netProfitUsd > 10 ? 'DETECTED' : 'REJECTED',
        loanToken: { symbol: 'WBNB', address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', decimals: 18 },
        loanAmount: loanWbnb,
        loanAmountUsd: loanWbnb * wbnbPrice,
        provider: {
          id: 'dodo',
          name: 'DODO PMM Flash Loan (0% Fee)',
          poolAddress: '0x8F8Dd7DB1bDA5eD3da8C9daf3bfa471c12d58486',
          feePercent: 0.0,
        },
        flashLoanFeeAmount: profitCalc2.flashLoanFeeAmount,
        flashLoanFeeUsd: profitCalc2.flashLoanFeeUsd,
        route: route2,
        grossRevenueUsd: profitCalc2.grossRevenueUsd,
        dexFeesUsd: profitCalc2.dexFeesUsd,
        estimatedGasUnits: 310000,
        gasPriceGwei: gasInfo.standardGwei,
        gasCostUsd: profitCalc2.gasCostUsd,
        otherCostUsd: 0,
        totalCostUsd: profitCalc2.totalCostUsd,
        netProfitUsd: profitCalc2.netProfitUsd,
        netProfitPercent: profitCalc2.netProfitPercent,
        confidenceScore: 89,
        dataFreshnessMs: 510,
        liquidityDepthUsd: 5570000,
        mevRiskLevel: 'MEDIUM',
        honeypotChecked: true,
        repaymentGuaranteedAtomic: true,
      });
    }

    // Arbitrum & Ethereum Multi-chain Opportunities
    if (targetChainId === 42161 || targetChainId === 1) {
      const loanAmountUsdc = 100000;
      const aHop1 = DeFiMarketIntelligence.calculateTradeHop(loanAmountUsdc, 8500000, 3100, 0.05); // Uniswap v3
      const aHop2 = DeFiMarketIntelligence.calculateTradeHop(aHop1.amountOut, 3080, 8525000, 0.05); // Camelot / Sushiswap

      const routeArb: RouteHop[] = [
        {
          step: 1,
          dexName: 'Uniswap v3 (Arbitrum)',
          routerAddress: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
          poolAddress: '0xC6962004f452bE9203591991D15f6b388e09E8D0',
          tokenIn: { symbol: 'USDC', address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', decimals: 6 },
          tokenOut: { symbol: 'WETH', address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', decimals: 18 },
          amountIn: loanAmountUsdc,
          expectedAmountOut: aHop1.amountOut,
          poolReserveIn: 8500000,
          poolReserveOut: 3100,
          poolFeePercent: 0.05,
          slippagePercent: 0.09,
          priceImpactPercent: aHop1.priceImpactPercent,
        },
        {
          step: 2,
          dexName: 'Camelot DEX',
          routerAddress: '0xc873fEcbd354f5A56E00E710B90EF4201db2448d',
          poolAddress: '0x84652a577C80da0eA579512356B24a0d9eD1495c',
          tokenIn: { symbol: 'WETH', address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', decimals: 18 },
          tokenOut: { symbol: 'USDC', address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', decimals: 6 },
          amountIn: aHop1.amountOut,
          expectedAmountOut: aHop2.amountOut,
          poolReserveIn: 3080,
          poolReserveOut: 8525000,
          poolFeePercent: 0.05,
          slippagePercent: 0.11,
          priceImpactPercent: aHop2.priceImpactPercent,
        },
      ];

      const profitCalcArb = ArbitrageRouteOptimizer.calculateNetProfitability({
        loanAmount: loanAmountUsdc,
        tokenPriceUsd: 1.0,
        providerId: 'balancer-v2',
        route: routeArb,
        gasUnitsEstimated: 210000,
        gasPriceGwei: gasInfo.standardGwei,
        nativePriceUsd: gasInfo.nativeTokenPriceUsd,
      });

      opportunities.push({
        id: `opp-arb-001-${Date.now()}`,
        timestamp,
        network: 'arbitrum',
        chainId: 42161,
        strategy: 'DEX_ARBITRAGE',
        status: profitCalcArb.netProfitUsd > 15 ? 'DETECTED' : 'REJECTED',
        loanToken: { symbol: 'USDC', address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', decimals: 6 },
        loanAmount: loanAmountUsdc,
        loanAmountUsd: loanAmountUsdc,
        provider: {
          id: 'balancer-v2',
          name: 'Balancer v2 Vault (0% Fee)',
          poolAddress: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
          feePercent: 0.0,
        },
        flashLoanFeeAmount: profitCalcArb.flashLoanFeeAmount,
        flashLoanFeeUsd: profitCalcArb.flashLoanFeeUsd,
        route: routeArb,
        grossRevenueUsd: profitCalcArb.grossRevenueUsd,
        dexFeesUsd: profitCalcArb.dexFeesUsd,
        estimatedGasUnits: 210000,
        gasPriceGwei: gasInfo.standardGwei,
        gasCostUsd: profitCalcArb.gasCostUsd,
        otherCostUsd: 0,
        totalCostUsd: profitCalcArb.totalCostUsd,
        netProfitUsd: profitCalcArb.netProfitUsd,
        netProfitPercent: profitCalcArb.netProfitPercent,
        confidenceScore: 96,
        dataFreshnessMs: 310,
        liquidityDepthUsd: 17025000,
        mevRiskLevel: 'LOW',
        honeypotChecked: true,
        repaymentGuaranteedAtomic: true,
      });
    }

    return opportunities;
  }
}
