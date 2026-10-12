/**
 * BITCOIN INHERITANCE — PLAN STORE & STATE MANAGEMENT
 * Persistent storage in localStorage with presets for Modality A, B, and C.
 */

import { InheritancePlan, InheritanceModality } from './types';
import { createDefaultTimelockConfig } from './timelockCalculator';
import { buildMiniscriptPolicy } from './miniscriptEngine';

const STORAGE_KEY = 'bitcoin_intelligence_inheritance_plans_v1';

export const INITIAL_INHERITANCE_PLANS: InheritancePlan[] = [
  {
    id: 'plan-modality-a-family',
    title: 'Plan Sucesorio Familiar Miniscript (Vía Titular + Vía Beneficiario Timelock)',
    description:
      'Modalidad A: El titular conserva acceso inmediato e incondicional con su Coldcard. Si transcurren 2 años sin actualización o en caso de fallecimiento, el heredero puede acceder a los fondos con su hardware wallet.',
    modality: 'MODALITY_A_TIMELOCK',
    network: 'mainnet',
    createdAt: '2026-03-15T12:00:00Z',
    updatedAt: '2026-10-12T14:30:00Z',
    ownerPubkey: '02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5',
    ownerXpubFingerprint: '73c5da0a',
    beneficiaries: [
      {
        id: 'ben-01',
        alias: 'Valentina Beltramo',
        relation: 'Hija / Heredera Principal',
        pubkeyOrXpub: '02f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9',
        sharePercentage: 100,
        deliveryMethod: 'NOTARIZED_ENVELOPE',
        emailOrContact: 'valentina@beltramo.family',
        status: 'PUBKEY_VERIFIED',
        roleInMultisig: 'PRIMARY_SIGNER',
      },
    ],
    timelock: createDefaultTimelockConfig('MODALITY_A_TIMELOCK'),
    policy: buildMiniscriptPolicy({
      modality: 'MODALITY_A_TIMELOCK',
      ownerPubkey: '02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5',
      heirPubkeys: ['02f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9'],
      timelockBlocksOrTimestamp: 1836000000, // Unix timestamp in ~2028
      timelockType: 'CLTV_AFTER',
    }),
    utxos: [
      {
        txid: '9f8b654c3e21a098d76e54f3b2a10c98e7d6c5b4a39281f0e9d8c7b6a5f4e3d2',
        vout: 0,
        amountSat: 250000000, // 2.5 BTC
        scriptType: 'P2WSH',
        address: 'bc1q9herenciaplanfamiliarminiscript2026xxxxxxxxxxxx',
        confirmed: true,
        confirmations: 4320,
        blockHeight: 892130,
      },
    ],
    totalSatoshis: 250000000,
    feeRateSatVb: 14,
    psbtStatus: 'VALID_LOCKED',
    broadcaster: {
      operatorType: 'MANUAL_HEIR',
      targetNetwork: 'mainnet',
      mempoolApiEndpoint: 'https://mempool.space/api',
      rbfEnabled: true,
      autoFeeBump: true,
      maxFeeSatVb: 85,
      lastHealthCheck: '2026-10-12T07:15:00Z',
    },
    lastHeartbeatDate: '2026-10-10T18:00:00Z',
    isRevoked: false,
    emergencySweepAddress: 'bc1qcldcrdsweepcoldstoragediegobeltramoxxxxxx',
  },
  {
    id: 'plan-modality-b-scheduled',
    title: 'Transferencia Programada 2028 (Donación Sucesoria Anticipada)',
    description:
      'Modalidad B: Transacción con nLockTime prefirmada por el titular para ejecutarse en el año 2028. El titular puede revocarla en cualquier momento simplemente gastando el UTXO de entrada.',
    modality: 'MODALITY_B_SCHEDULED',
    network: 'mainnet',
    createdAt: '2026-04-01T10:00:00Z',
    updatedAt: '2026-10-12T11:00:00Z',
    ownerPubkey: '02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5',
    ownerXpubFingerprint: '73c5da0a',
    beneficiaries: [
      {
        id: 'ben-02',
        alias: 'Mateo Beltramo',
        relation: 'Hijo / Sucesor',
        pubkeyOrXpub: '03a34b99f22c790c4e36b2b3c2c35a36db06226e41c6920f86421306738365399',
        sharePercentage: 100,
        deliveryMethod: 'DIRECT_DESCRIPTOR',
        emailOrContact: 'mateo@beltramo.family',
        status: 'PUBKEY_VERIFIED',
        roleInMultisig: 'PRIMARY_SIGNER',
      },
    ],
    timelock: createDefaultTimelockConfig('MODALITY_B_SCHEDULED'),
    policy: buildMiniscriptPolicy({
      modality: 'MODALITY_B_SCHEDULED',
      ownerPubkey: '02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5',
      heirPubkeys: ['03a34b99f22c790c4e36b2b3c2c35a36db06226e41c6920f86421306738365399'],
      timelockBlocksOrTimestamp: 1845000000,
      timelockType: 'CLTV_AFTER',
    }),
    utxos: [
      {
        txid: '3a4b5c6d7e8f90123456789abcdef0123456789abcdef0123456789abcdef012',
        vout: 1,
        amountSat: 100000000, // 1.0 BTC
        scriptType: 'P2WSH',
        address: 'bc1qmateoprogrammedgift2028transferxxxxxx',
        confirmed: true,
        confirmations: 1250,
        blockHeight: 894500,
      },
    ],
    totalSatoshis: 100000000,
    feeRateSatVb: 16,
    psbtStatus: 'VALID_LOCKED',
    broadcaster: {
      operatorType: 'WATCHTOWER_NODE',
      targetNetwork: 'mainnet',
      mempoolApiEndpoint: 'https://mempool.space/api',
      rbfEnabled: true,
      autoFeeBump: true,
      maxFeeSatVb: 75,
      lastHealthCheck: '2026-10-12T08:00:00Z',
    },
    isRevoked: false,
    emergencySweepAddress: 'bc1qcldcrdsweepcoldstoragediegobeltramoxxxxxx',
  },
  {
    id: 'plan-modality-c-inactivity',
    title: 'Plan de Recuperación por Inactividad (Heartbeat Relativo 180 Días)',
    description:
      'Modalidad C: Política de inactividad relativa con OP_CHECKSEQUENCEVERIFY. Si el titular no realiza transacciones en 180 días (25.920 bloques), se habilita el acceso para la heredera principal. Si tras 360 días tampoco hay reclamo, se habilita el albacea de respaldo.',
    modality: 'MODALITY_C_INACTIVITY',
    network: 'mainnet',
    createdAt: '2026-05-10T09:00:00Z',
    updatedAt: '2026-10-12T13:10:00Z',
    ownerPubkey: '02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5',
    ownerXpubFingerprint: '73c5da0a',
    beneficiaries: [
      {
        id: 'ben-03',
        alias: 'Valentina Beltramo',
        relation: 'Heredera Primaria',
        pubkeyOrXpub: '02f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9',
        sharePercentage: 70,
        deliveryMethod: 'NOTARIZED_ENVELOPE',
        status: 'PUBKEY_VERIFIED',
        roleInMultisig: 'PRIMARY_SIGNER',
      },
      {
        id: 'ben-04',
        alias: 'Estudio Notarial / Fideicomisario',
        relation: 'Albacea Institucional de Respaldo',
        pubkeyOrXpub: '03a34b99f22c790c4e36b2b3c2c35a36db06226e41c6920f86421306738365399',
        sharePercentage: 30,
        deliveryMethod: 'NOTARIZED_ENVELOPE',
        status: 'PUBKEY_VERIFIED',
        roleInMultisig: 'TRUSTEE',
      },
    ],
    timelock: createDefaultTimelockConfig('MODALITY_C_INACTIVITY'),
    policy: buildMiniscriptPolicy({
      modality: 'MODALITY_C_INACTIVITY',
      ownerPubkey: '02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5',
      heirPubkeys: [
        '02f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9',
        '03a34b99f22c790c4e36b2b3c2c35a36db06226e41c6920f86421306738365399',
      ],
      timelockBlocksOrTimestamp: 25920, // 180 days in blocks
      timelockType: 'CSV_OLDER',
    }),
    utxos: [
      {
        txid: '7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d',
        vout: 0,
        amountSat: 420000000, // 4.2 BTC
        scriptType: 'P2WSH',
        address: 'bc1qheartbeatinactivitycascade180daysxxxxxx',
        confirmed: true,
        confirmations: 2880,
        blockHeight: 893570,
      },
    ],
    totalSatoshis: 420000000,
    feeRateSatVb: 15,
    psbtStatus: 'VALID_LOCKED',
    broadcaster: {
      operatorType: 'AUTOMATED_DAEMON',
      targetNetwork: 'mainnet',
      mempoolApiEndpoint: 'https://mempool.space/api',
      rbfEnabled: true,
      autoFeeBump: true,
      maxFeeSatVb: 90,
      lastHealthCheck: '2026-10-12T07:45:00Z',
    },
    lastHeartbeatDate: '2026-09-28T14:00:00Z',
    heartbeatIntervalDays: 180,
    isRevoked: false,
    emergencySweepAddress: 'bc1qcldcrdsweepcoldstoragediegobeltramoxxxxxx',
  },
];

export const InheritancePlanStore = {
  getPlans(): InheritancePlan[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return INITIAL_INHERITANCE_PLANS;
  },

  savePlans(plans: InheritancePlan[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
    } catch (e) {
      console.error('Error saving inheritance plans:', e);
    }
  },

  getPlanById(id: string): InheritancePlan | undefined {
    return this.getPlans().find((p) => p.id === id);
  },

  updatePlan(updatedPlan: InheritancePlan): void {
    const plans = this.getPlans();
    const index = plans.findIndex((p) => p.id === updatedPlan.id);
    if (index >= 0) {
      plans[index] = { ...updatedPlan, updatedAt: new Date().toISOString() };
    } else {
      plans.push(updatedPlan);
    }
    this.savePlans(plans);
  },

  recordHeartbeat(planId: string): InheritancePlan | undefined {
    const plan = this.getPlanById(planId);
    if (!plan) return undefined;
    plan.lastHeartbeatDate = new Date().toISOString();
    plan.updatedAt = new Date().toISOString();
    this.updatePlan(plan);
    return plan;
  },

  triggerEmergencyRevocation(planId: string): InheritancePlan | undefined {
    const plan = this.getPlanById(planId);
    if (!plan) return undefined;
    plan.isRevoked = true;
    plan.psbtStatus = 'DESIGNED';
    plan.updatedAt = new Date().toISOString();
    this.updatePlan(plan);
    return plan;
  },
};
