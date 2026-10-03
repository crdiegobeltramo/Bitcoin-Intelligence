/**
 * BITCOIN INTELLIGENCE & BLOCKCHAIN DEVELOPMENT OS
 * Type definitions for the complete platform architecture
 * Inspired by "Claude para el Desarrollo Blockchain" by Diego Eduardo Beltramo
 */

export type NavigationSection =
  | 'landing'
  // Sistema A: Bitcoin Intelligence
  | 'dashboard'
  | 'daily-intelligence'
  | 'trading-view'
  | 'onchain-analytics'
  | 'core-watch'
  | 'bip-watch'
  | 'mining-intelligence'
  | 'wallet-custody'
  | 'quantum-radar'
  | 'protocol-explorer'
  | 'cryptography-lab'
  | 'lightning-lab'
  | 'regulatory-intelligence'
  | 'accounting-tax'
  | 'timeline'
  // Sistema B: Blockchain Development Copilot
  | 'copilot-wizard'
  | 'smart-contract-lab'
  | 'openzeppelin'
  | 'security-auditor'
  | 'code-workspace'
  | 'prompt-library'
  | 'learning-mode'
  // Sistema C: DeFi & DEX Lab
  | 'dex-lab'
  | 'defi-intelligence'
  | 'risk-engine'
  // Intelligence, Agents & Research
  | 'agent-orchestrator'
  | 'portfolio-lab'
  | 'research-lab'
  | 'subscriptions'
  | 'docs'
  // Portal de Administración Soberana (Acceso Restringido Diego Beltramo)
  | 'admin';

export type DataSourceMode = 'LIVE' | 'DEMO';

export type PreferredDataProvider =
  | 'cryptoquant'
  | 'nodecharts'
  | 'lookintobitcoin'
  | 'glassnode'
  | 'coingecko'
  | 'mempool';

export interface DataProviderInfo {
  id: PreferredDataProvider;
  name: string;
  shortName: string;
  tagline: string;
  badge: string;
  sourceUrl: string;
  category: string;
  color: string;
}

export interface DataAttribution {
  source: string;
  sourceUrl?: string;
  timestamp: string;
  isSimulated: boolean;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'VERIFIED';
}

export interface BitcoinMarketData {
  btcUsd: number;
  btcArs: number;
  usdArs: number;
  change24h: number;
  change7d: number;
  change30d: number;
  marketCap: number;
  volume24h: number;
  dominance: number;
  ath: number;
  distanceToAth: number; // percentage
  attribution: DataAttribution;
}

export interface BitcoinNetworkData {
  hashrateEh: number; // EH/s
  difficultyTrillion: number; // T
  difficultyAdjustmentDays: number;
  estimatedNextDiffChange: number; // percentage
  blockHeight: number;
  blockTimeMinutes: number;
  mempoolVsizeMb: number;
  mempoolTxCount: number;
  fastestFeeSatVb: number;
  halfHourFeeSatVb: number;
  hourFeeSatVb: number;
  minimumFeeSatVb: number;
  minerRevenueDailyUsd: number;
  feesRewardPercentage: number;
  halvingEstimatedDate: string;
  halvingBlocksRemaining: number;
  attribution: DataAttribution;
}

export interface OnChainMetrics {
  mvrvRatio: number | null;
  sopr: number | null;
  nupl: number | null;
  realizedCapUsd: number | null;
  realizedPriceUsd: number | null;
  exchangeBalanceBtc: number | null;
  longTermHolderSupplyRatio: number | null;
  shortTermHolderSupplyRatio: number | null;
  dormancyFlow: number | null;
  coinDaysDestroyed90d: number | null;
  activeAddresses24h: number | null;
  attribution: DataAttribution;
}

export interface BisScoreFactor {
  factor: string;
  weight: number;
  intensity: number; // 0-100
  description: string;
}

export interface BitcoinIntelligenceScore {
  score: number; // 0-100
  label: 'Baja Intensidad Informativa' | 'Intensidad Moderada' | 'Alta Intensidad Informativa' | 'Intensidad Crítica';
  summary: string;
  breakdown: BisScoreFactor[];
  lastCalculated: string;
}

export interface IntelligenceItem {
  id: string;
  title: string;
  category:
    | 'Protocolo'
    | 'Mercado'
    | 'Regulación'
    | 'Seguridad'
    | 'Minería'
    | 'IA & Quantum'
    | 'Geopolítica'
    | 'DeFi & DEX';
  source: string;
  sourceUrl: string;
  date: string;
  impact: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  summary: string;
  evidence: string;
  isPrimarySource: boolean;
}

export interface DailyReport {
  date: string;
  updatedAt: string;
  bis: BitcoinIntelligenceScore;
  top5Events: IntelligenceItem[];
  topTechnical: IntelligenceItem;
  topMarket: IntelligenceItem;
  topRegulatory: IntelligenceItem;
  topSecurity: IntelligenceItem;
  topGeopolitical: IntelligenceItem;
  topMining: IntelligenceItem;
  topAiQuantum: IntelligenceItem;
  conclusion: string;
}

export interface BipEntry {
  number: number;
  title: string;
  author: string;
  status: 'Draft' | 'Proposed' | 'Active' | 'Final' | 'Deferred' | 'Withdrawn' | 'Rejected' | 'Superseded';
  type: 'Standards Track' | 'Informational' | 'Process';
  date: string;
  summary: string;
  technicalImpact: string;
  dependencies: string;
  githubUrl: string;
  layer: 'Consensus' | 'Peer-to-Peer' | 'API/RPC' | 'Applications';
}

export interface BitcoinCoreChange {
  id: string;
  type: 'PR' | 'Release' | 'Security Advisory' | 'Commit';
  subsystem: 'Consensus' | 'P2P' | 'Mempool' | 'Validation' | 'Wallet' | 'RPC' | 'Mining' | 'Security';
  title: string;
  prNumber?: number;
  author: string;
  date: string;
  githubUrl: string;
  diffSnippet: string;
  impactSummary: string;
  hasSecurityImplications: boolean;
}

export interface RegulatoryItem {
  id: string;
  jurisdiction: 'Argentina' | 'Estados Unidos' | 'Unión Europea' | 'Reino Unido' | 'Suiza' | 'Singapur' | 'Hong Kong' | 'El Salvador' | 'Brasil';
  agency: string;
  date: string;
  normReference: string;
  status: 'Vigente' | 'En Consulta' | 'Proyecto de Ley' | 'Guía Administrativa' | 'Sancionada';
  summary: string;
  primarySourceUrl: string;
  affectedParties: string;
  disclaimer: string;
}

export interface AccountingFramework {
  standard: 'NIC 38' | 'NIC 2' | 'NIC 36' | 'NIIF 13' | 'NIC 12' | 'ARCA RG' | 'FACPCE RT';
  jurisdiction: 'NIIF / IFRS' | 'Argentina (FACPCE / ARCA)';
  title: string;
  scope: string;
  measurementModel: 'Costo menos amortización/deterioro' | 'Modelo de revaluación' | 'Valor razonable con cambios en resultados' | 'Inventario para brokers/traders';
  taxImplications: string;
  auditEvidenceRequired: string[];
  officialSource: string;
}

export interface QuantumThreatAssessment {
  algorithm: 'ECDSA (secp256k1)' | 'Schnorr (BIP 340)' | 'SHA-256' | 'P2PK (Reused addresses)' | 'P2PKH / P2WPKH / P2TR (Script/PubKeyHash)';
  threatVector: string;
  quantumAlgorithm: 'Shor (SVP/DLP)' | 'Grover (Collision / Pre-image)';
  estimatedRiskHorizon: 'Largo plazo (> 10-15 años)' | 'Medio plazo (5-10 años)' | 'Bajo / Teórico';
  mitigations: string[];
  bipProposals: string;
  scientificConfidence: string;
}

export interface AuditFinding {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  location: string;
  explanation: string;
  attackScenario: string;
  remediation: string;
  fixedCodeSnippet: string;
}

export interface DexSimulationInput {
  tokenAName: string;
  tokenBName: string;
  reserveA: number;
  reserveB: number;
  tradeSize: number;
  isTokenAToB: boolean;
  feePercentage: number;
}

export interface DexSimulationOutput {
  initialPrice: number;
  executionPrice: number;
  amountReceived: number;
  feePaid: number;
  priceImpact: number;
  slippage: number;
  newReserveA: number;
  newReserveB: number;
  constantProductBefore: number;
  constantProductAfter: number;
  impermanentLossPercent: number;
}

export interface PortfolioAsset {
  id: string;
  symbol: string;
  name: string;
  allocationPercent: number;
  currentPrice: number;
  units: number;
  valueUsd: number;
  category?: 'crypto' | 'equity' | 'etf' | 'commodity' | 'stablecoin' | 'bond';
  change24h?: number;
  iconUrl?: string;
  apiSource?: string;
  lastUpdated?: string;
  volatilityEst?: number;
}

export interface PortfolioMetrics {
  totalValueUsd: number;
  cagr: number;
  sharpeRatio: number;
  sortinoRatio: number;
  beta: number;
  var95Percent: number; // Value at Risk 95% 1-day
  cvar: number; // Conditional VaR
  maxDrawdown: number;
  annualizedVolatility: number;
  timeframe: string;
}

export interface AgentDescriptor {
  id: string;
  name: string;
  role: string;
  specialty: string;
  tools: string[];
  systemPrompt: string;
  sampleQuery: string;
}

export interface AgentExecutionTrace {
  id: string;
  query: string;
  dispatchedAgents: string[];
  reasoningStep: string;
  output: string;
  timestamp: string;
}

export interface PromptTemplate {
  id: string;
  title: string;
  category: 'Blockchain Architecture' | 'Solidity' | 'Security Audit' | 'DeFi & DEX' | 'Bitcoin Core' | 'On-Chain Analytics' | 'Testing & Formal Verification';
  description: string;
  promptText: string;
  targetRole: string;
}

export interface LearningModule {
  id: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  title: string;
  chapter: string;
  concept: string;
  practicalExample: string;
  codeSnippet?: string;
  quiz: {
    question: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
  };
}

export type SubscriptionPlanId = 'free' | 'pro' | 'institutional';
export type BillingCycle = 'monthly' | 'annual';
export type PaymentMethodId = 'bitcoin' | 'lightning' | 'solana' | 'bch' | 'ethereum' | 'mercadopago';

export interface SubscriptionTier {
  id: SubscriptionPlanId;
  name: string;
  badge?: string;
  description: string;
  monthlyPriceUsd: number;
  annualPriceUsd: number; // e.g. 2 months free
  features: string[];
  limits: {
    copilotQueriesPerDay: number | 'Unlimited';
    aiSecurityAuditsPerDay: number | 'Unlimited';
    exportReports: boolean;
    multiAgentOrchestrator: boolean;
    institutionalResearch: boolean;
    privateWorkspaceProjects: number;
  };
  isPopular?: boolean;
}

export interface PaymentDetails {
  currencyCode: 'BTC' | 'SATS' | 'SOL' | 'BCH' | 'ETH' | 'ARS';
  currencyName: string;
  networkName: string;
  amountInCurrency: number;
  fiatEquivalentUsd: number;
  recipientAddress: string;
  paymentUri?: string;
  memoOrPreimage?: string;
  qrPayload: string;
  instructions: string;
  confirmationsRequired: number;
}

export interface PaymentReceipt {
  receiptId: string;
  planId: SubscriptionPlanId;
  planName: string;
  billingCycle: BillingCycle;
  amountUsd: number;
  currency: string;
  currencyAmount: number;
  paymentMethod: PaymentMethodId;
  payerEmail: string;
  timestamp: string;
  expiresAt: string;
  status: 'COMPLETED' | 'PENDING' | 'VERIFYING';
  transactionHashOrProof: string;
  fiscalInvoiceId?: string; // Factura ARCA
}

export interface OpenZeppelinWizardConfig {
  standard: 'ERC20' | 'ERC721' | 'ERC1155' | 'Custom';
  name: string;
  symbol: string;
  premint?: string;
  baseUri?: string;
  accessControl: 'ownable' | 'roles' | 'none';
  pausable: boolean;
  burnable: boolean;
  mintable: boolean;
  permit: boolean;
  votes: boolean;
  flashMint: boolean;
  enumerable: boolean;
  uriStorage: boolean;
  upgradeability: 'none' | 'uups' | 'transparent';
}

export type AuthProviderType = 'google' | 'metamask' | 'trustwallet' | 'phantom';

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  provider: AuthProviderType;
  walletAddress?: string;
  network?: string;
  balance?: string;
  createdAt: string;
  plan: SubscriptionPlanId;
  isAdmin?: boolean;
}

// ============================================================
// PORTAL DE ADMINISTRACIÓN SOVERANA & TESORERÍA (DIEGO BELTRAMO)
// ============================================================

export interface AdminTreasuryConfig {
  bitcoin: string;
  lightningNodePubkey: string;
  lightningAddress: string;
  bch: string;
  solana: string;
  ethereum: string;
  mercadopagoAlias: string;
  mercadopagoCvu: string;
  cuitEmisor: string;
  razonSocial: string;
  titular: string;
  lastUpdated: string;
}

export interface AdminMercadoPagoDevConfig {
  publicKey: string;
  accessToken: string;
  clientId: string;
  clientSecret: string;
  webhookUrl: string;
  integratorId: string;
  sandboxMode: boolean;
  autoReturn: 'approved' | 'all';
  binaryMode: boolean;
  notificationEmail: string;
  lastUpdated: string;
}

export interface TierScopePermissions {
  copilotQueriesPerDay: number | 'Unlimited';
  aiSecurityAuditsPerDay: number | 'Unlimited';
  exportReports: boolean;
  multiAgentOrchestrator: boolean;
  deepResearchLab: boolean;
  portfolioRiskEngine: boolean;
  openZeppelinStudio: boolean;
  dexAmmSimulator: boolean;
  defiLendingAnalysis: boolean;
  privateWorkspaceProjects: number;
  mcpConnectors: boolean;
  fiscalInvoiceArca: boolean;
  directSupport247: boolean;
}

export interface AdminTierItemConfig {
  name: string;
  monthlyPriceUsd: number;
  annualPriceUsd: number;
  permissions: TierScopePermissions;
}

export interface AdminTierScopesConfig {
  free: AdminTierItemConfig;
  pro: AdminTierItemConfig;
  institutional: AdminTierItemConfig;
  lastUpdated: string;
}

export interface AdminAuditLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  adminUser: string;
}

// ============================================================
// ON-CHAIN ANALYTICS & FUENTES PRIMARIAS DE INTELIGENCIA
// ============================================================

export type OnChainSourceCategory =
  | 'On-Chain Valuation & Cycles'
  | 'Exchanges & Flow Metrics'
  | 'Market Data & Explorers'
  | 'Macro, Correlations & AI';

export interface OnChainSourceEntry {
  id: string;
  name: string;
  category: OnChainSourceCategory;
  url: string;
  description: string;
  keyIndicators: string[];
  freeTier: boolean;
  frequency: string;
  apiSupport: boolean;
  methodologyNote: string;
}

export interface OnChainDetailedMetric {
  id: string;
  name: string;
  symbol: string;
  sourceId: string;
  sourceName: string;
  sourceUrl: string;
  currentValue: number;
  formattedValue: string;
  unit?: string;
  change24h?: number;
  historicalRange: {
    min: number;
    max: number;
    mean: number;
  };
  zones: {
    accumulation: { min: number; max: number; label: string };
    neutral: { min: number; max: number; label: string };
    overheated: { min: number; max: number; label: string };
  };
  currentStatus: 'UNDERVALUED' | 'ACCUMULATION' | 'FAIR_VALUE' | 'EUPHORIA' | 'OVERHEATED';
  formula: string;
  interpretation: string;
  importance: 'HIGH' | 'CRITICAL' | 'MEDIUM';
}

export interface CorrelationPairData {
  pair: string;
  assetName: string;
  category: 'Crypto Native' | 'Equities' | 'Commodities' | 'Fiat & Macro';
  corr30d: number;
  corr90d: number;
  corr1y: number;
  historicalTrend: 'POSITIVE' | 'INVERSE' | 'DECOUPLED';
  description: string;
  source: string;
  economicMeaning: string;
}


