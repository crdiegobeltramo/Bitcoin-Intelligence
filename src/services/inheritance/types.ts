/**
 * BITCOIN INHERITANCE & TIMELOCK PLANNER
 * Types and interfaces for non-custodial cryptographic succession planning
 */

export type InheritanceModality =
  | 'MODALITY_A_TIMELOCK' // Herencia con timelock: Vía titular prioritaria + Vía beneficiario condicionada por tiempo
  | 'MODALITY_B_SCHEDULED' // Transferencia programada: Tx prefirmada para fecha futura con nLockTime
  | 'MODALITY_C_INACTIVITY'; // Plan de recuperación por inactividad: Heartbeat relativo (CSV / older)

export type TimelockType =
  | 'ABSOLUTE_TIMESTAMP' // CLTV / nLockTime con epoch timestamp (>= 500,000,000)
  | 'ABSOLUTE_HEIGHT' // CLTV / nLockTime con altura de bloque (< 500,000,000)
  | 'RELATIVE_BLOCKS' // CSV / nSequence con número de bloques (144 bloques ~ 1 día)
  | 'RELATIVE_TIME_512S'; // CSV / nSequence con unidades de 512 segundos (flag bit 22 activado)

export type BitcoinNetwork = 'mainnet' | 'testnet4' | 'signet' | 'regtest';

export type WalletType =
  | 'sparrow'
  | 'bitcoincore'
  | 'coldcard'
  | 'jade'
  | 'keystone'
  | 'specter'
  | 'electrum'
  | 'incompatible_evm';

export interface WalletCompatibility {
  id: WalletType;
  name: string;
  isCompatible: boolean;
  supportsMiniscript: boolean;
  supportsDescriptors: boolean;
  supportsPSBT: boolean;
  supportsTaproot: boolean;
  warningNote?: string;
  recommendedFirmware?: string;
}

export interface Beneficiary {
  id: string;
  alias: string;
  relation: string;
  pubkeyOrXpub: string;
  sharePercentage: number;
  deliveryMethod: 'DIRECT_DESCRIPTOR' | 'NOTARIZED_ENVELOPE' | 'SPLIT_SEED_SECRET' | 'COORDINATED_MULTISIG';
  emailOrContact?: string;
  status: 'PENDING_PUBKEY' | 'PUBKEY_VERIFIED' | 'DESCRIPTOR_DELIVERED';
  roleInMultisig?: 'PRIMARY_SIGNER' | 'BACKUP_SIGNER' | 'TRUSTEE';
}

export interface UTXOEntry {
  txid: string;
  vout: number;
  amountSat: number;
  scriptType: 'P2WSH' | 'P2TR_TAPROOT' | 'P2WPKH';
  address: string;
  confirmed: boolean;
  confirmations: number;
  blockHeight?: number;
}

export type PsbtLifecycleStatus =
  | 'DESIGNED' // Diseñada (parámetros fijados, sin firmas)
  | 'PARTIALLY_SIGNED' // Parcialmente firmada (faltan firmas de quorum o titular)
  | 'FULLY_SIGNED' // Completamente firmada
  | 'VALID_LOCKED' // Válida y completa, pero bloqueada en consenso (timelock no cumplido)
  | 'READY_FOR_BROADCAST' // Lista para transmisión (timelock alcanzado / MTP cumplido)
  | 'BROADCASTED' // Transmitida al mempool de la red
  | 'CONFIRMED'; // Confirmada en bloque

export interface SpendingPath {
  id: string;
  name: string;
  description: string;
  type: 'PRIMARY_OWNER' | 'BENEFICIARY_TIMELOCK' | 'EMERGENCY_RECOVERY' | 'MUTUAL_CANCELLATION';
  requiredSigners: string[];
  quorumRequired: number;
  timelockCondition?: string;
  miniscriptSnippet: string;
  vbytesEstimate: number;
  relativeDelayDays?: number;
}

export interface MiniscriptPolicy {
  policyRaw: string;
  miniscriptExpression: string;
  descriptorWsh: string;
  descriptorTaproot?: string;
  isValid: boolean;
  validationError?: string;
  spendingPaths: SpendingPath[];
  estimatedVbytes: number;
  scriptOpcodes: string[];
  safeForProduction: boolean;
}

export interface TimelockConfig {
  modality: InheritanceModality;
  timelockType: TimelockType;
  targetDateUtc: string; // ISO 8601
  targetTimezone: string; // e.g. "America/Argentina/Buenos_Aires"
  targetBlockHeight: number;
  relativePeriodDays: number;
  relativeBlocksCount: number;
  nLockTimeValue: number;
  nSequenceValue: number;
  mtpBufferHours: number; // MTP +11 blocks margin
  estimatedEligibilityDate: string;
  isAbsolute: boolean;
  clockAccuracyWarning: string;
}

export interface SecurityAuditFinding {
  id: string;
  ruleCode: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  category: 'TIMELOCK' | 'KEY_MANAGEMENT' | 'DESCRIPTOR' | 'FEE_RISK' | 'OPERATIONAL' | 'COVENANT';
  title: string;
  description: string;
  recommendation: string;
  passed: boolean;
}

export interface SecurityAuditReport {
  score: number; // 0 - 100
  status: 'OPTIMAL' | 'ACCEPTABLE' | 'WARNING' | 'DANGEROUS';
  evaluatedAt: string;
  findings: SecurityAuditFinding[];
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  passedRulesCount: number;
  totalRulesEvaluated: number;
}

export interface BroadcasterConfig {
  operatorType: 'MANUAL_HEIR' | 'AUTOMATED_DAEMON' | 'WATCHTOWER_NODE' | 'FEDERATED_ESCROW';
  targetNetwork: BitcoinNetwork;
  nodeRpcUrl?: string;
  mempoolApiEndpoint: string;
  rbfEnabled: boolean;
  autoFeeBump: boolean;
  maxFeeSatVb: number;
  lastHealthCheck?: string;
}

export interface InheritancePlan {
  id: string;
  title: string;
  description: string;
  modality: InheritanceModality;
  network: BitcoinNetwork;
  createdAt: string;
  updatedAt: string;
  ownerPubkey: string;
  ownerXpubFingerprint?: string;
  beneficiaries: Beneficiary[];
  timelock: TimelockConfig;
  policy: MiniscriptPolicy;
  utxos: UTXOEntry[];
  totalSatoshis: number;
  feeRateSatVb: number;
  psbtStatus: PsbtLifecycleStatus;
  psbtBase64?: string;
  broadcaster: BroadcasterConfig;
  lastHeartbeatDate?: string;
  heartbeatIntervalDays?: number;
  isRevoked: boolean;
  emergencySweepAddress?: string;
}

export interface CovenantEvaluation {
  proposalName: string;
  bipNumber: string;
  status: 'NOT_IN_CONSENSUS' | 'TESTNET_INQUISITION' | 'DRAFT_BIP' | 'RESEARCH_ONLY';
  mechanism: string;
  inheritanceUsefulness: string;
  mainnetRisk: string;
  isMainnetSafe: boolean;
  alternativeCompatibleDesign: string;
}
