/**
 * BITCOIN INHERITANCE — SECURITY AUDITOR ENGINE
 * 12-rule cryptographic, game-theoretic, and operational audit for Bitcoin inheritance plans.
 */

import { InheritancePlan, SecurityAuditReport, SecurityAuditFinding } from './types';
import { verifyCovenantConsensusCompliance } from './covenantsKnowledge';

export function auditInheritancePlan(plan: InheritancePlan): SecurityAuditReport {
  const findings: SecurityAuditFinding[] = [];

  // Regla 1: Vía de revocación incondicional para el titular
  const hasOwnerInstantPath = plan.policy.spendingPaths.some(
    (p) => p.type === 'PRIMARY_OWNER' && (p.relativeDelayDays === 0 || !p.relativeDelayDays)
  );
  findings.push({
    id: 'SEC-01',
    ruleCode: 'OWNER_INSTANT_RECOVERY',
    severity: 'CRITICAL',
    category: 'KEY_MANAGEMENT',
    title: 'Vía de Control Incondicional del Titular',
    description:
      'El titular debe conservar en todo momento una vía de gasto instantánea (pk_owner sin timelock) para revocar el plan o rescatar fondos si es necesario.',
    recommendation:
      'Mantener la rama pk(owner) prioritaria activa en la política Miniscript.',
    passed: hasOwnerInstantPath,
  });

  // Regla 2: Riesgo de fondos bloqueados para siempre (Deadlock / Irreversible lock)
  const allPathsHaveKeys = plan.policy.spendingPaths.every(
    (p) => p.requiredSigners.length > 0 && p.requiredSigners.every((k) => k.length >= 64)
  );
  findings.push({
    id: 'SEC-02',
    ruleCode: 'NO_PERMANENT_DEADLOCK',
    severity: 'CRITICAL',
    category: 'KEY_MANAGEMENT',
    title: 'Ausencia de Bloqueo Criptográfico Permanente (Deadlock)',
    description:
      'Todas las ramas del script deben contar con claves públicas válidas y alcanzables. Si una rama requiere una clave no respaldada, los fondos quedarían inaccesibles.',
    recommendation:
      'Verificar que cada clave pública o xpub tenga su respaldo mnemónico físico en frío correspondiente.',
    passed: allPathsHaveKeys,
  });

  // Regla 3: Timelock alcanzable y coherente
  const timelockValid =
    (plan.timelock.timelockType === 'ABSOLUTE_TIMESTAMP' && plan.timelock.nLockTimeValue > 500000000) ||
    (plan.timelock.timelockType === 'RELATIVE_BLOCKS' && plan.timelock.relativeBlocksCount > 0 && plan.timelock.relativeBlocksCount <= 65535) ||
    (plan.timelock.timelockType === 'ABSOLUTE_HEIGHT' && plan.timelock.targetBlockHeight > 890000);
  findings.push({
    id: 'SEC-03',
    ruleCode: 'TIMELOCK_REACHABILITY',
    severity: 'HIGH',
    category: 'TIMELOCK',
    title: 'Verificación de Límites y Sintaxis de Timelock (BIP 65 / BIP 112)',
    description:
      'Los timelocks absolutos (CLTV / nLockTime) y relativos (CSV / nSequence) deben respetar los umbrales de consenso (500M segundos o 65535 bloques máx en 16 bits).',
    recommendation:
      'Asegurar que el retardo relativo no exceda 65535 bloques (~455 días) por script leaf en BIP 68.',
    passed: timelockValid,
  });

  // Regla 4: Amortiguador MTP (Median Time Past)
  const hasMtpBuffer = plan.timelock.mtpBufferHours >= 2 || plan.timelock.timelockType === 'RELATIVE_BLOCKS';
  findings.push({
    id: 'SEC-04',
    ruleCode: 'MTP_CONSENSUS_BUFFER',
    severity: 'MEDIUM',
    category: 'TIMELOCK',
    title: 'Margen de Tolerancia de Consenso MTP (+11 Bloques)',
    description:
      'Bitcoin evalúa nLockTime contra el Median Time Past (MTP) de los 11 bloques anteriores. Esto retrasa la elegibilidad efectiva aproximadamente 1 a 2 horas tras la hora civil fijada.',
    recommendation:
      'Informar al beneficiario que el timelock no se abrirá con precisión de cronómetro civil.',
    passed: hasMtpBuffer,
  });

  // Regla 5: Descriptores con Checksum BIP 380
  const hasChecksum = plan.policy.descriptorWsh.includes('#');
  findings.push({
    id: 'SEC-05',
    ruleCode: 'BIP380_DESCRIPTOR_INTEGRITY',
    severity: 'HIGH',
    category: 'DESCRIPTOR',
    title: 'Integridad del Output Descriptor (BIP 380 Checksum)',
    description:
      'El descriptor debe contener el checksum canónico de 8 caracteres alfanuméricos para evitar errores tipográficos al ser importado en billeteras de hardware.',
    recommendation:
      'Utilizar descriptores con formato estricto wsh(...)#checksum o tr(...)#checksum.',
    passed: hasChecksum,
  });

  // Regla 6: Verificación de Covenants en Mainnet (Bloqueo de opcodes no activados)
  const covenantCheck = verifyCovenantConsensusCompliance(plan.policy.scriptOpcodes);
  findings.push({
    id: 'SEC-06',
    ruleCode: 'MAINNET_COVENANT_SAFETY',
    severity: 'CRITICAL',
    category: 'COVENANT',
    title: 'Cumplimiento de Consenso Activo (Gating de Covenants No Aprobados)',
    description:
      'Ninguna política sucesoria en mainnet debe utilizar opcodes experimentales o propuestas no activadas (OP_CTV, OP_VAULT, OP_CAT).',
    recommendation:
      'Mantenerse estrictamente dentro de Miniscript, P2WSH y Taproot estándar.',
    passed: covenantCheck.isConsensusCompliant,
  });

  // Regla 7: Prevención de Fee Sniping y RBF (Replace-by-Fee)
  const isRbfProtected = plan.timelock.nSequenceValue <= 0xfffffffd;
  findings.push({
    id: 'SEC-07',
    ruleCode: 'FEE_SNIPING_AND_RBF',
    severity: 'MEDIUM',
    category: 'FEE_RISK',
    title: 'Soporte de Reemplazo por Comisión (RBF) y Protección Fee Sniping',
    description:
      'Las transacciones programadas deben admitir BIP 125 (RBF) para poder aumentar comisiones si las tarifas de la red se disparan antes de la transmisión.',
    recommendation:
      'Fijar nSequence <= 0xfffffffd en los inputs de la transacción sucesoria.',
    passed: isRbfProtected,
  });

  // Regla 8: Existencia de UTXOs suficientes y comisiones mineras razonables
  const hasUtxos = plan.utxos.length > 0 && plan.totalSatoshis > 50000;
  findings.push({
    id: 'SEC-08',
    ruleCode: 'DUST_AND_LIQUIDITY_LIMIT',
    severity: 'HIGH',
    category: 'OPERATIONAL',
    title: 'Suficiencia de Fondos y Prevención de Dust Outputs',
    description:
      'El plan debe estar respaldado por UTXOs reales y un saldo superior a 50,000 satoshis para absorber holgadamente las comisiones de minería estimadas.',
    recommendation:
      'Consolidar UTXOs en un monto significativo antes de activar el descriptor de herencia.',
    passed: hasUtxos,
  });

  // Regla 9: Asignación explícita del Operador de Broadcast
  const hasBroadcaster =
    plan.broadcaster.operatorType !== undefined &&
    Boolean(plan.broadcaster.mempoolApiEndpoint);
  findings.push({
    id: 'SEC-09',
    ruleCode: 'BROADCASTER_OPERATOR_ASSIGNED',
    severity: 'HIGH',
    category: 'OPERATIONAL',
    title: 'Responsable Designado para la Transmisión (Broadcaster)',
    description:
      'Una transacción con timelock no se transmite sola. Debe existir un operador (el propio heredero, un daemon de monitoreo o un nodo completo) con el PSBT resguardado.',
    recommendation:
      'Documentar claramente quién y cómo inyectará la transacción a la red en la fecha prevista.',
    passed: hasBroadcaster,
  });

  // Regla 10: Invalidez por movimiento de UTXO (Advertencia sobre reutilización)
  findings.push({
    id: 'SEC-10',
    ruleCode: 'UTXO_INVALIDATION_AWARENESS',
    severity: 'INFO',
    category: 'OPERATIONAL',
    title: 'Sensibilidad al Gasto Previo del UTXO de Entrada',
    description:
      'Si el titular gasta o consolida el UTXO comprometido, cualquier PSBT prefirmado que apunte a ese input quedará INMEDIATAMENTE INVALIDADO.',
    recommendation:
      'Si mueve fondos, recuerde regenerar y refirmar el nuevo PSBT con el nuevo outpoint.',
    passed: true,
  });

  // Regla 11: Beneficiario documentado con Pubkey/Xpub y Cuota
  const hasValidBeneficiaries =
    plan.beneficiaries.length > 0 &&
    plan.beneficiaries.every((b) => b.pubkeyOrXpub.length >= 32);
  findings.push({
    id: 'SEC-11',
    ruleCode: 'BENEFICIARY_REGISTRATION',
    severity: 'HIGH',
    category: 'KEY_MANAGEMENT',
    title: 'Registro Criptográfico de Beneficiarios',
    description:
      'Cada heredero debe contar con su clave pública secp256k1 o xpub validada en el plan, sin intermediarios custodios.',
    recommendation:
      'Obtener la clave pública directamente desde la hardware wallet del beneficiario.',
    passed: hasValidBeneficiaries,
  });

  // Regla 12: Procedimiento de Emergencia y Respaldo Fuera de Línea
  const hasEmergencyPlan = Boolean(plan.emergencySweepAddress);
  findings.push({
    id: 'SEC-12',
    ruleCode: 'EMERGENCY_SWEEP_CONFIGURED',
    severity: 'MEDIUM',
    category: 'KEY_MANAGEMENT',
    title: 'Dirección de Barrido de Emergencia (Panic Sweep Address)',
    description:
      'El titular debe tener una dirección fría externa preconfigurada para evacuar el 100% de los fondos en caso de compromiso o desacuerdo.',
    recommendation:
      'Configurar una dirección de barrido en frío de máxima seguridad para ejecución rápida.',
    passed: hasEmergencyPlan,
  });

  const criticalCount = findings.filter((f) => !f.passed && f.severity === 'CRITICAL').length;
  const highCount = findings.filter((f) => !f.passed && f.severity === 'HIGH').length;
  const mediumCount = findings.filter((f) => !f.passed && f.severity === 'MEDIUM').length;
  const passedRulesCount = findings.filter((f) => f.passed).length;
  const totalRulesEvaluated = findings.length;

  let score = Math.round((passedRulesCount / totalRulesEvaluated) * 100);
  if (criticalCount > 0) score = Math.min(score, 45);

  let status: SecurityAuditReport['status'] = 'OPTIMAL';
  if (criticalCount > 0) status = 'DANGEROUS';
  else if (highCount > 0) status = 'WARNING';
  else if (mediumCount > 0) status = 'ACCEPTABLE';

  return {
    score,
    status,
    evaluatedAt: new Date().toISOString(),
    findings,
    criticalCount,
    highCount,
    mediumCount,
    passedRulesCount,
    totalRulesEvaluated,
  };
}
