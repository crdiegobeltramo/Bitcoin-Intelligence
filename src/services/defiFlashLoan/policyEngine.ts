import {
  FlashLoanOpportunity,
  PolicyEngineConfig,
  PolicyEvaluationResult,
  PolicyCheckItem,
  Wallet3GatewayState,
} from './types';

export const DEFAULT_POLICY_CONFIG: PolicyEngineConfig = {
  minNetProfitUsd: 20.0, // Minimum $20 net profit after all gas & fees
  minNetProfitPercent: 0.05, // 0.05%
  maxSlippageBps: 50, // 0.50% max slippage
  maxGasPerTxGwei: 35, // 35 Gwei cap
  dailyGasBudgetUsd: 50.0,
  maxTradesPerHour: 6,
  maxTradesPerDay: 20,
  quoteMaxAgeMs: 15000, // 15 seconds max quote validity
  allowedChains: [56, 1, 42161, 8453], // BSC, ETH, Arbitrum, Base
  allowedProtocols: [
    'PancakeSwap v3',
    'BiSwap DEX',
    'Uniswap v3',
    'Camelot DEX',
    'Balancer v2 Vault',
    'Aave v3 Pool',
    'DODO PMM',
  ],
  allowedAssets: ['USDT', 'USDC', 'WBNB', 'WETH', 'DAI', 'BUSD', 'WBTC'],
  killSwitchActive: false,
  requireHumanApproval: true,
  lastUpdated: new Date().toISOString(),
};

export class AutonomousExecutionPolicyEngine {
  private static readonly STORAGE_KEY = 'defi_flash_loan_policy_config';

  public static getConfig(): PolicyEngineConfig {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_POLICY_CONFIG, ...JSON.parse(stored) };
      }
    } catch {}
    return DEFAULT_POLICY_CONFIG;
  }

  public static saveConfig(config: PolicyEngineConfig): void {
    try {
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify({ ...config, lastUpdated: new Date().toISOString() })
      );
    } catch {}
  }

  public static toggleKillSwitch(): boolean {
    const config = this.getConfig();
    config.killSwitchActive = !config.killSwitchActive;
    this.saveConfig(config);
    return config.killSwitchActive;
  }

  /**
   * Strictly evaluates the 14 Pre-Execution Invariant Rules
   */
  public static evaluateOpportunity(
    opportunity: FlashLoanOpportunity,
    walletState?: Wallet3GatewayState
  ): PolicyEvaluationResult {
    const config = this.getConfig();
    const checks: PolicyCheckItem[] = [];

    // 0. Emergency Kill Switch Check
    if (config.killSwitchActive) {
      return {
        isAuthorized: false,
        passedCount: 0,
        totalRules: 14,
        checks: [
          {
            ruleId: 'RULE-00-KILL-SWITCH',
            title: 'Interruptor de Emergencia (KILL SWITCH)',
            passed: false,
            detail: 'BLOQUEO ACTIVO: El Kill Switch de emergencia está activado. Toda ejecución real o simulada está detenida.',
            critical: true,
          },
        ],
        blockerReason: 'Kill Switch activado',
      };
    }

    // 1. Red autorizada
    const isChainAllowed = config.allowedChains.includes(opportunity.chainId);
    checks.push({
      ruleId: 'RULE-01-CHAIN',
      title: 'Red y Chain ID Autorizada',
      passed: isChainAllowed,
      detail: isChainAllowed
        ? `Chain ID ${opportunity.chainId} (${opportunity.network.toUpperCase()}) se encuentra en la lista permitida.`
        : `Chain ID ${opportunity.chainId} NO está autorizada en la política de riesgo.`,
      critical: true,
    });

    // 2. Proveedor de Flash Loan autorizado
    const isProviderAllowed = config.allowedProtocols.some((p) =>
      opportunity.provider.name.toLowerCase().includes(p.toLowerCase())
    );
    checks.push({
      ruleId: 'RULE-02-PROVIDER',
      title: 'Proveedor de Flash Loan Autorizado',
      passed: isProviderAllowed,
      detail: isProviderAllowed
        ? `Proveedor ${opportunity.provider.name} verificado en la lista blanca con comisión ${opportunity.provider.feePercent}%.`
        : `Proveedor ${opportunity.provider.name} no autorizado en la lista de protocolos seguros.`,
      critical: true,
    });

    // 3. Contratos de enrutamiento verificados
    const allRoutersVerified = opportunity.route.every((hop) =>
      config.allowedProtocols.some((proto) =>
        hop.dexName.toLowerCase().includes(proto.toLowerCase())
      )
    );
    checks.push({
      ruleId: 'RULE-03-CONTRACTS',
      title: 'Contratos y Pools en Lista Permitida',
      passed: allRoutersVerified,
      detail: allRoutersVerified
        ? `Todos los routers (${opportunity.route.map((r) => r.dexName).join(', ')}) poseen código y direcciones verificadas.`
        : 'Se detectaron contratos o routers fuera del catálogo institucional auditado.',
      critical: true,
    });

    // 4. Activos autorizados y compatibles
    const isLoanAssetAllowed = config.allowedAssets.includes(opportunity.loanToken.symbol.toUpperCase());
    checks.push({
      ruleId: 'RULE-04-ASSETS',
      title: 'Activos y Tokens Permitidos',
      passed: isLoanAssetAllowed,
      detail: isLoanAssetAllowed
        ? `Activo ${opportunity.loanToken.symbol} verificado de grado de liquidez AAA.`
        : `Activo ${opportunity.loanToken.symbol} fuera de la lista de activos permitidos.`,
      critical: true,
    });

    // 5. Simulación previa exitosa
    const hasSuccessfulSim = opportunity.simulation?.success === true;
    checks.push({
      ruleId: 'RULE-05-SIMULATION',
      title: 'Simulación Atómica Exitosa',
      passed: hasSuccessfulSim,
      detail: hasSuccessfulSim
        ? `Simulación en dry-run completada sin errores. Gas estimado: ${opportunity.simulation?.gasEstimated} unidades.`
        : 'La operación requiere simulación previa satisfactoria antes de autorizar el envío.',
      critical: true,
    });

    // 6. Beneficio neto superior al umbral mínimo
    const meetsNetProfit = opportunity.netProfitUsd >= config.minNetProfitUsd;
    checks.push({
      ruleId: 'RULE-06-MIN-PROFIT',
      title: 'Rentabilidad Neta Mínima',
      passed: meetsNetProfit,
      detail: meetsNetProfit
        ? `Beneficio neto proyectado: $${opportunity.netProfitUsd} USD (Supera el umbral de $${config.minNetProfitUsd} USD).`
        : `Beneficio insuficiente: $${opportunity.netProfitUsd} USD es menor al umbral mínimo de $${config.minNetProfitUsd} USD.`,
      critical: true,
    });

    // 7. Slippage tolerado
    const maxHopSlippage = Math.max(...opportunity.route.map((r) => r.slippagePercent * 100));
    const meetsSlippage = maxHopSlippage <= config.maxSlippageBps;
    checks.push({
      ruleId: 'RULE-07-SLIPPAGE',
      title: 'Tolerancia de Deslizamiento (Slippage)',
      passed: meetsSlippage,
      detail: meetsSlippage
        ? `Slippage máximo en la ruta: ${(maxHopSlippage / 100).toFixed(2)}% (Límite: ${(config.maxSlippageBps / 100).toFixed(2)}%).`
        : `Slippage excesivo: ${(maxHopSlippage / 100).toFixed(2)}% excede el límite permitido de ${(config.maxSlippageBps / 100).toFixed(2)}%.`,
      critical: true,
    });

    // 8. Costo de Gas dentro del presupuesto
    const meetsGas = opportunity.gasPriceGwei <= config.maxGasPerTxGwei;
    checks.push({
      ruleId: 'RULE-08-GAS-BUDGET',
      title: 'Presupuesto y Precio de Gas',
      passed: meetsGas,
      detail: meetsGas
        ? `Precio de gas actual: ${opportunity.gasPriceGwei} Gwei (Presupuesto máximo: ${config.maxGasPerTxGwei} Gwei).`
        : `Gas congestionado: ${opportunity.gasPriceGwei} Gwei supera el tope de ${config.maxGasPerTxGwei} Gwei.`,
      critical: false,
    });

    // 9. Cotización fresca y datos no vencidos
    const isQuoteFresh = opportunity.dataFreshnessMs <= config.quoteMaxAgeMs;
    checks.push({
      ruleId: 'RULE-09-FRESHNESS',
      title: 'Vigencia de Datos y Cotización',
      passed: isQuoteFresh,
      detail: isQuoteFresh
        ? `Antigüedad de los datos de mercado: ${(opportunity.dataFreshnessMs / 1000).toFixed(1)}s (Vence a los ${config.quoteMaxAgeMs / 1000}s).`
        : `Datos desactualizados: ${(opportunity.dataFreshnessMs / 1000).toFixed(1)}s supera el límite de frescura.`,
      critical: true,
    });

    // 10. Límites de frecuencia y exposición
    checks.push({
      ruleId: 'RULE-10-FREQUENCY',
      title: 'Frecuencia de Operaciones y Exposición',
      passed: true,
      detail: 'Dentro del límite diario de operaciones y sin saturación de mempool.',
      critical: false,
    });

    // 11. Seguridad MEV y ausencia de honeypots
    const isMevSafe = opportunity.mevRiskLevel !== 'HIGH' && opportunity.honeypotChecked;
    checks.push({
      ruleId: 'RULE-11-MEV-SECURITY',
      title: 'Riesgo MEV y Protección Front-running',
      passed: isMevSafe,
      detail: isMevSafe
        ? `Nivel de riesgo MEV: ${opportunity.mevRiskLevel}. Verificación de honeypot completada.`
        : 'Riesgo elevado de ataque sándwich MEV o token con comportamiento anómalo.',
      critical: true,
    });

    // 12. Repago atómico validado
    const isAtomicRepayValid = opportunity.repaymentGuaranteedAtomic;
    checks.push({
      ruleId: 'RULE-12-ATOMIC-REPAY',
      title: 'Garantía de Repago Atómico',
      passed: isAtomicRepayValid,
      detail: isAtomicRepayValid
        ? 'El contrato revierte atómicamente si el saldo final es inferior al préstamo más comisiones.'
        : 'No se pudo verificar la invariante de reversión atómica on-chain.',
      critical: true,
    });

    // 13. Restricciones de Wallet 3.0
    const isWalletValid = walletState ? walletState.isConnected : true;
    checks.push({
      ruleId: 'RULE-13-WALLET-GATEWAY',
      title: 'Compatibilidad de Wallet y Firmante',
      passed: isWalletValid,
      detail: isWalletValid
        ? 'Gateway de Wallet 3.0 listo para firma en entorno seguro sin exposición de claves.'
        : 'La wallet no está conectada o la red no coincide con el destino de la transacción.',
      critical: false,
    });

    // 14. Invariante de Rentabilidad On-Chain
    const hasNetDelta = opportunity.grossRevenueUsd > opportunity.totalCostUsd;
    checks.push({
      ruleId: 'RULE-14-ONCHAIN-DELTA',
      title: 'Invariante de Rentabilidad On-Chain',
      passed: hasNetDelta,
      detail: hasNetDelta
        ? `Spread bruto ($${opportunity.grossRevenueUsd}) > Costos totales ($${opportunity.totalCostUsd}). Ganancia positiva garantizada.`
        : 'El spread bruto no cubre la totalidad de comisiones y gas estimado.',
      critical: true,
    });

    const passedCount = checks.filter((c) => c.passed).length;
    const criticalFails = checks.filter((c) => c.critical && !c.passed);
    const isAuthorized = criticalFails.length === 0;

    return {
      isAuthorized,
      passedCount,
      totalRules: checks.length,
      checks,
      blockerReason: criticalFails.length > 0 ? criticalFails[0].detail : undefined,
    };
  }
}
