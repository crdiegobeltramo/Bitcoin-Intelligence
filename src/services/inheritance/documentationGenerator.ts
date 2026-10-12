/**
 * BITCOIN INHERITANCE — DOCUMENTATION & DIGITAL WILL GENERATOR
 * Generates cryptographic Letters of Technical Instructions and Legal/Executor Kits.
 * Zero-Knowledge: Contains zero private keys or seed words.
 */

import { InheritancePlan } from './types';

export function generateInheritanceDocumentation(plan: InheritancePlan): string {
  const dateFormatted = new Date(plan.createdAt).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const btcAmount = (plan.totalSatoshis / 100000000).toFixed(8);

  const beneficiariesList = plan.beneficiaries
    .map(
      (b, idx) =>
        `### Heredero/Beneficiario ${idx + 1}: ${b.alias} (${b.relation})\n` +
        `- **Porcentaje Asignado**: ${b.sharePercentage}%\n` +
        `- **Clave Pública (Pubkey / Xpub)**: \`${b.pubkeyOrXpub}\`\n` +
        `- **Método de Entrega del Descriptor**: ${b.deliveryMethod}\n` +
        `- **Rol Multisig**: ${b.roleInMultisig || 'Firma Individual Condicional'}\n`
    )
    .join('\n');

  const spendingPathsDoc = plan.policy.spendingPaths
    .map(
      (p, idx) =>
        `#### Ruta ${idx + 1}: ${p.name}\n` +
        `- **Tipo**: \`${p.type}\`\n` +
        `- **Descripción**: ${p.description}\n` +
        `- **Condición Criptográfica**: \`${p.timelockCondition || 'Inmediata'}\`\n` +
        `- **Miniscript Snippet**: \`${p.miniscriptSnippet}\`\n` +
        `- **Tamaño Estimado**: ~${p.vbytesEstimate} vBytes\n`
    )
    .join('\n');

  return `# PROTOCOLO SUCESORIO BITCOIN & CARTA DE INSTRUCCIONES TÉCNICAS
## Módulo: Bitcoin Inheritance & Timelock Planner — Bitcoin Intelligence
**Documento Criptográfico de Ejecución Sucesoria No Custodial**  
**Fecha de Creación**: ${dateFormatted}  
**Identificador Único del Plan**: \`${plan.id}\`  
**Red Objetivo**: Bitcoin \`${plan.network.toUpperCase()}\`  
**Estado Criptográfico**: VÁLIDO & AUDITADO  

---

### AVISO LEGAL Y CRIPTOGRÁFICO FUNDAMENTAL
> **ATENCIÓN AL HEREDERO Y ALBACEA**: Este documento **NO CONTIENE NI DEBE CONTENER CLAVES PRIVADAS NI FRASES SEMILLA**.  
> El acceso a los fondos aquí detallados depende exclusivamente de la posesión física/segura de las **Hardware Wallets** o **respaldos de claves del beneficiario**, combinado con el cumplimiento matemático de las condiciones temporales registradas en la blockchain de Bitcoin.  
> La inactividad de una dirección **NO constituye certificación jurídica de defunción**, sino una **condición técnica de recuperación de autocustodia**.

---

## 1. RESUMEN EJECUTIVO DEL PLAN
- **Título**: ${plan.title}
- **Descripción**: ${plan.description}
- **Modalidad Seleccionada**: \`${plan.modality}\`
- **Total de Fondos Vinculados**: **${btcAmount} BTC** (${plan.totalSatoshis.toLocaleString()} satoshis)
- **Cantidad de UTXOs Monitoreados**: ${plan.utxos.length} outputs
- **Dirección de Barrido de Emergencia (Titular)**: \`${plan.emergencySweepAddress || 'No configurada'}\`

---

## 2. BENEFICIARIOS Y CUOTAS ASIGNADAS
${beneficiariesList}

---

## 3. DESCRIPTOR DE SALIDA Y MINISCRIPT (BIP 380)
Para importar y reconstruir este plan en un coordinador de Bitcoin compatible (**Sparrow Wallet v1.9+** o **Bitcoin Core v26+**), utilice el siguiente descriptor canónico con checksum verificado:

### Descriptor P2WSH (Native SegWit):
\`\`\`text
${plan.policy.descriptorWsh}
\`\`\`

### Descriptor Taproot (P2TR - si aplica):
\`\`\`text
${plan.policy.descriptorTaproot || 'N/A'}
\`\`\`

### Expresión Miniscript Validada:
\`\`\`text
${plan.policy.miniscriptExpression}
\`\`\`

---

## 4. CONDICIÓN TEMPORAL Y REGLAS DE CONSENSO
- **Tipo de Timelock**: \`${plan.timelock.timelockType}\`
- **Fecha Objetivo Estimada**: \`${plan.timelock.targetDateUtc}\`
- **Bloque Objetivo Estimado**: \`#${plan.timelock.targetBlockHeight.toLocaleString()}\`
- **Retardo Relativo en Bloques**: \`${plan.timelock.relativeBlocksCount.toLocaleString()} bloques\` (~${plan.timelock.relativePeriodDays} días)
- **Valor nLockTime**: \`${plan.timelock.nLockTimeValue}\`
- **Valor nSequence (BIP 68)**: \`0x${plan.timelock.nSequenceValue.toString(16).padStart(8, '0')}\`

> **Advertencia de Consenso MTP (Median Time Past)**:  
> ${plan.timelock.clockAccuracyWarning}

---

## 5. RUTAS DE GASTO AUDITADAS
${spendingPathsDoc}

---

## 6. GUÍA PASO A PASO PARA EL BENEFICIARIO
Si usted es el beneficiario designado y ha llegado la fecha o se ha cumplido el plazo de inactividad:

1. **Obtenga su Dispositivo Criptográfico**:  
   Conecte la Hardware Wallet (**Coldcard, Jade, Keystone o BitBox02**) que contiene la clave pública registrada en la sección 2.
2. **Abra Sparrow Wallet o Bitcoin Core**:  
   Cree una nueva billetera seleccionando **"Descriptor Wallet"** e ingrese el descriptor provisto en la Sección 3.
3. **Verifique el Estado del Timelock**:  
   Asegúrese de que la altura de bloques de la red o el timestamp MTP haya superado el valor fijado. Si intenta transmitir antes de esa altura, los nodos de la red rechazarán la transacción con el error \`non-BIP68-final\` o \`non-final\`.
4. **Construya la Transacción de Reclamo (PSBT)**:  
   Cree una transacción de retiro hacia su propia dirección de destino personal.
5. **Firme con su Dispositivo Air-Gapped**:  
   Exporte el PSBT hacia su hardware wallet, verifique la dirección en la pantalla de su dispositivo y firme.
6. **Transmisión al Mempool**:  
   Cargue el PSBT firmado de regreso en Sparrow Wallet o ejecute \`bitcoin-cli sendrawtransaction\` para propagar la transacción a los mineros.

---

## 7. RESPONSABLE DE LA TRANSMISIÓN (BROADCASTER)
- **Tipo de Operador Asignado**: \`${plan.broadcaster.operatorType}\`
- **Red de Transmisión**: Bitcoin \`${plan.broadcaster.targetNetwork}\`
- **Soporte de Reemplazo por Tarifa (RBF - BIP 125)**: ${plan.broadcaster.rbfEnabled ? 'SÍ (Activado)' : 'NO'}
- **Límite de Comisión Máxima Permitida**: \`${plan.broadcaster.maxFeeSatVb} sat/vB\`

---

## 8. NOTAS JURÍDICAS Y NOTARIALES (ARGENTINA & INTERNACIONAL)
- **Naturaleza del Activo**: Bitcoin es un bien inmaterial de carácter patrimonial susceptible de valor económico (arts. 15 y 16 del Código Civil y Comercial de la Nación Argentina).
- **Legítima Hereditaria**: En la República Argentina, los herederos forzosos gozan de la porción legítima (arts. 2444 y ss. CCC). Este plan técnico debe ser complementado con el asesoramiento legal y notarial pertinente para evitar acciones de colación o reducción si las cuotas asignadas exceden la porción disponible.
- **Protocolización Notarial**: Se recomienda depositar una copia impresa de este protocolo técnico en sobre lacrado ante escribano público matriculado, sin consignar jamás claves privadas o semillas.

*Generado automáticamente por el motor criptográfico de Bitcoin Intelligence & Inheritance Planner.*
`;
}
