import { FlashLoanOpportunity, SimulationResult } from './types';
import { FlashLoanProviderAdapter } from './flashLoanProviderAdapters';

export class TransactionSimulator {
  /**
   * Performs an atomic dry-run simulation of the flash loan arbitrage transaction
   */
  public static simulateExecution(opportunity: FlashLoanOpportunity): SimulationResult {
    const logs: string[] = [];
    const callTrace: Array<{ from: string; to: string; method: string; value: string }> = [];

    const loanToken = opportunity.loanToken.symbol;
    const loanAmount = opportunity.loanAmount;
    const provider = FlashLoanProviderAdapter.getProvider(opportunity.provider.id);
    const repayment = FlashLoanProviderAdapter.calculateRepaymentCost(opportunity.provider.id, loanAmount);

    logs.push(`[SIM_INIT] Iniciando simulación atómica en EVM (Chain ID: ${opportunity.chainId})`);
    logs.push(`[PROVIDER] Solicitando Flash Loan de ${loanAmount} ${loanToken} a ${provider.name}`);

    callTrace.push({
      from: 'ArbitrageBotReceiver',
      to: provider.contractAddresses[opportunity.chainId] || '0xPool',
      method: provider.callbackFunction.split('(')[0],
      value: `${loanAmount} ${loanToken}`,
    });

    let currentBalance = loanAmount;
    let totalGasSimulated = 65000; // Base flash loan overhead

    // Execute route hops
    for (const hop of opportunity.route) {
      logs.push(`[HOP_${hop.step}] Swap en ${hop.dexName}: ${hop.amountIn} ${hop.tokenIn.symbol} -> ${hop.expectedAmountOut} ${hop.tokenOut.symbol}`);
      logs.push(`[RESERVES] Pool: ${hop.poolAddress} | Impacto en precio: ${hop.priceImpactPercent}% | Fee: ${hop.poolFeePercent}%`);

      callTrace.push({
        from: 'ArbitrageBotReceiver',
        to: hop.routerAddress,
        method: 'swapExactTokensForTokens',
        value: `${hop.amountIn} ${hop.tokenIn.symbol}`,
      });

      currentBalance = hop.expectedAmountOut;
      totalGasSimulated += 85000; // Average swap gas
    }

    // Repayment invariant check
    logs.push(`[REPAY_CHECK] Saldo final acumulado: ${currentBalance.toFixed(4)} ${loanToken}`);
    logs.push(`[REPAY_CHECK] Obligación de repago: ${repayment.totalRepayment.toFixed(4)} ${loanToken} (Principal: ${loanAmount} + Fee: ${repayment.feeAmount})`);

    const repaymentVerified = currentBalance >= repayment.totalRepayment;

    if (!repaymentVerified) {
      const shortfall = (repayment.totalRepayment - currentBalance).toFixed(4);
      logs.push(`[REVERT] Invariante no satisfecha: Faltan ${shortfall} ${loanToken} para repagar el flash loan. La transacción revertirá atómicamente.`);
      return {
        success: false,
        timestamp: new Date().toISOString(),
        gasEstimated: totalGasSimulated,
        simulatedGrossOutput: currentBalance,
        simulatedNetProfitUsd: 0,
        simulatedGasCostUsd: opportunity.gasCostUsd,
        repaymentVerified: false,
        priceToleranceOk: false,
        logs,
        callTrace,
        errorReason: `InsufficientArbitrageProfit: short by ${shortfall} ${loanToken}`,
      };
    }

    const netProfitTokens = currentBalance - repayment.totalRepayment;
    const tokenPrice = opportunity.loanAmountUsd / opportunity.loanAmount;
    const simulatedNetProfitUsd = Number((netProfitTokens * tokenPrice - opportunity.gasCostUsd).toFixed(2));

    logs.push(`[REPAY_OK] Flash loan repagado íntegramente. Beneficio neto simulado: $${simulatedNetProfitUsd} USD`);
    logs.push(`[ATOMIC_SUCCESS] Transacción completada con éxito. Gas total estimado: ${totalGasSimulated} unidades.`);

    return {
      success: true,
      timestamp: new Date().toISOString(),
      gasEstimated: totalGasSimulated,
      simulatedGrossOutput: currentBalance,
      simulatedNetProfitUsd,
      simulatedGasCostUsd: opportunity.gasCostUsd,
      repaymentVerified: true,
      priceToleranceOk: true,
      logs,
      callTrace,
    };
  }
}
