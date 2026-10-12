export type AgentExecutionMode = 'OBSERVE' | 'SIMULATE' | 'PAPER_TRADING' | 'LIVE_EXECUTION';

export type OpportunityStrategy = 'DEX_ARBITRAGE' | 'TRIANGULAR' | 'CROSS_POOL';

export type OpportunityStatus =
  | 'DETECTED'
  | 'ANALYZING'
  | 'SIMULATED'
  | 'REJECTED'
  | 'AWAITING_APPROVAL'
  | 'AUTHORIZED'
  | 'SUBMITTED'
  | 'CONFIRMED'
  | 'REVERTED'
  | 'EXPIRED';

export type FlashLoanProviderId = 'aave-v3' | 'balancer-v2' | 'pancakeswap-v3' | 'uniswap-v3' | 'dodo';

export interface RouteHop {
  step: number;
  dexName: string;
  routerAddress: string;
  poolAddress: string;
  tokenIn: { symbol: string; address: string; decimals: number };
  tokenOut: { symbol: string; address: string; decimals: number };
  amountIn: number;
  expectedAmountOut: number;
  poolReserveIn: number;
  poolReserveOut: number;
  poolFeePercent: number;
  slippagePercent: number;
  priceImpactPercent: number;
}

export interface SimulationResult {
  success: boolean;
  timestamp: string;
  gasEstimated: number;
  simulatedGrossOutput: number;
  simulatedNetProfitUsd: number;
  simulatedGasCostUsd: number;
  repaymentVerified: boolean;
  priceToleranceOk: boolean;
  logs: string[];
  callTrace: Array<{ from: string; to: string; method: string; value: string }>;
  errorReason?: string;
}

export interface FlashLoanOpportunity {
  id: string;
  timestamp: string;
  network: 'bsc' | 'ethereum' | 'arbitrum' | 'base' | 'polygon';
  chainId: number;
  strategy: OpportunityStrategy;
  status: OpportunityStatus;
  
  // Flash Loan Parameters
  loanToken: {
    symbol: string;
    address: string;
    decimals: number;
  };
  loanAmount: number;
  loanAmountUsd: number;
  provider: {
    id: FlashLoanProviderId;
    name: string;
    poolAddress: string;
    feePercent: number; // e.g. 0.05% for Aave v3, 0% for Balancer v2
  };
  flashLoanFeeAmount: number;
  flashLoanFeeUsd: number;

  // Execution Route
  route: RouteHop[];
  
  // Quantitative Profitability
  grossRevenueUsd: number;
  dexFeesUsd: number;
  estimatedGasUnits: number;
  gasPriceGwei: number;
  gasCostUsd: number;
  otherCostUsd: number;
  totalCostUsd: number;
  netProfitUsd: number;
  netProfitPercent: number;

  // Risk & Data Integrity
  confidenceScore: number; // 0 - 100
  dataFreshnessMs: number;
  liquidityDepthUsd: number;
  mevRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  honeypotChecked: boolean;
  repaymentGuaranteedAtomic: boolean;

  // Simulation & Execution
  simulation?: SimulationResult;
  execution?: {
    txHash?: string;
    blockNumber?: number;
    submittedAt?: string;
    confirmedAt?: string;
    revertedAt?: string;
    actualGasUsed?: number;
    actualProfitUsd?: number;
    receiptStatus?: 'SUCCESS' | 'REVERTED';
    revertMessage?: string;
  };
  rejectionReason?: string;
}

export interface PolicyEngineConfig {
  minNetProfitUsd: number;
  minNetProfitPercent: number;
  maxSlippageBps: number; // 50 = 0.5%
  maxGasPerTxGwei: number;
  dailyGasBudgetUsd: number;
  maxTradesPerHour: number;
  maxTradesPerDay: number;
  quoteMaxAgeMs: number;
  allowedChains: number[];
  allowedProtocols: string[];
  allowedAssets: string[];
  killSwitchActive: boolean;
  requireHumanApproval: boolean;
  lastUpdated: string;
}

export interface PolicyCheckItem {
  ruleId: string;
  title: string;
  passed: boolean;
  detail: string;
  critical: boolean;
}

export interface PolicyEvaluationResult {
  isAuthorized: boolean;
  passedCount: number;
  totalRules: number;
  checks: PolicyCheckItem[];
  blockerReason?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  opportunityId: string;
  action: 'DETECTED' | 'SIMULATED' | 'POLICY_PASS' | 'POLICY_REJECT' | 'SUBMITTED' | 'CONFIRMED' | 'REVERTED' | 'KILL_SWITCH';
  mode: AgentExecutionMode;
  network: string;
  loanAsset: string;
  loanAmount: number;
  netProfitUsd: number;
  txHash?: string;
  gasCostUsd?: number;
  message: string;
}

export interface AgentPerformanceMetrics {
  totalOpportunitiesDetected: number;
  totalDiscarded: number;
  simulationsSuccess: number;
  simulationsFailed: number;
  
  // Real Execution Metrics
  realTradesSubmitted: number;
  realTradesConfirmed: number;
  realTradesReverted: number;
  realNetProfitUsd: number;
  realGasPaidUsd: number;
  
  // Paper Trading Metrics (Separated)
  paperTradesExecuted: number;
  paperNetProfitUsd: number;
  paperGasSimulatedUsd: number;
  
  historicalSuccessRate: number;
  activeMode: AgentExecutionMode;
  killSwitchEngaged: boolean;
}

export interface Wallet3GatewayState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  networkName: string;
  nativeBalance: string;
  tokenBalances: Array<{ symbol: string; balance: string; address: string; usdValue: number }>;
  allowances: Array<{ token: string; spender: string; spenderName: string; allowance: string }>;
  isCorrectChain: boolean;
}
