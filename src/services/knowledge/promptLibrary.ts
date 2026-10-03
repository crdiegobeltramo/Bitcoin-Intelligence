import { PromptTemplate } from '../../types';

export const PROMPT_LIBRARY: PromptTemplate[] = [
  {
    id: 'prompt-arch-dex',
    title: 'Arquitectura Integral de DEX AMM con Fee Dinámico',
    category: 'DeFi & DEX',
    targetRole: 'DEX Architect / Senior Solidity Dev',
    description: 'Genera la arquitectura completa de contratos inteligentes para un exchange descentralizado con curvas de liquidez y oráculos TWAP.',
    promptText: `Actúa como Senior DEX Architect. Diseña la arquitectura técnica completa para un exchange descentralizado (DEX) en EVM que implemente:
1. Modelo de liquidez basado en Constant Product (x * y = k) con soporte opcional de tarifas dinámicas según volatilidad.
2. Contrato Factory, Pair/Pool y Router con enrutamiento multicamino.
3. Protección contra ataques de Sandwich y MEV (límites de slippage forzosos y deadline de transacción).
4. Oráculo TWAP acumulador de precio acumulado (cumulative price).
5. Desglose detallado de eventos, errores personalizados (custom errors) y suites de prueba en Foundry.`,
  },
  {
    id: 'prompt-audit-reentrancy',
    title: 'Auditoría Exhaustiva de Invariantes y Reentrancia',
    category: 'Security Audit',
    targetRole: 'Smart Contract Auditor',
    description: 'Prompt para analizar contratos Solidity frente a reentrancia de lectura cruzada (read-only reentrancy), CEI y flash loans.',
    promptText: `Actúa como Smart Contract Security Auditor de nivel Tier 1. Audita el siguiente contrato inteligente en Solidity analizando:
1. Patrón Checks-Effects-Interactions (CEI) en todas las funciones externas y públicas.
2. Reentrancia de solo lectura (Read-Only Reentrancy) en funciones de consulta utilizadas por otros protocolos.
3. Vulnerabilidad ante manipulación de oráculos con préstamos relámpago (Flash Loans).
4. Replay de firmas digitales EIP-712 y control de nonces.
Devuelve el reporte con la severidad (Critical, High, Medium, Low, Info), escenario de ataque paso a paso (PoC) y código corregido exacto.`,
  },
  {
    id: 'prompt-solidity-permit',
    title: 'Generador de Token ERC-20 con EIP-2612 y Control de Emisión',
    category: 'Solidity',
    targetRole: 'Solidity Senior Developer',
    description: 'Diseña un token ERC-20 seguro con approvals sin gas mediante firmas criptográficas y límite de emisión inmutable.',
    promptText: `Actúa como Desarrollador Senior de Solidity. Escribe un contrato inteligente ERC-20 en Solidity ^0.8.24 que cumpla con los estándares más estrictos de seguridad de OpenZeppelin:
- Implementación de ERC20Permit (EIP-2612) para aprobaciones gasless con firma fuera de cadena.
- Cap de emisión inmutable inmodificable tras el despliegue.
- Control de acceso con Ownable2Step para evitar transferencias erróneas de propiedad.
- Eventos de auditoría completos y tests unitarios en Hardhat/Chai con cobertura del 100%.`,
  },
  {
    id: 'prompt-btc-core-pr',
    title: 'Análisis de Impacto Técnico de Pull Request en Bitcoin Core',
    category: 'Bitcoin Core',
    targetRole: 'Bitcoin Core Contributor',
    description: 'Analiza cambios de código en C++ en el repositorio de Bitcoin Core evaluando invariantes de consenso y memoria.',
    promptText: `Actúa como desarrollador del protocolo Bitcoin Core. Analiza la propuesta técnica o diff de código evaluando:
1. Impacto en los invariantes de consenso y validación de bloques.
2. Comportamiento en la capa P2P y consumo de ancho de banda del relay de transacciones.
3. Implicancias en las políticas del mempool (RBF, CPFP, linealización de clusters).
4. Compatibilidad con clientes ligeros (SPV / BIP 157) y Lightning Network.
Estructura la respuesta delimitando Hechos verificados de Consecuencias hipotéticas.`,
  },
  {
    id: 'prompt-onchain-mvrv',
    title: 'Interpretación Cuantitativa de MVRV y Distribución de UTXOs',
    category: 'On-Chain Analytics',
    targetRole: 'On-Chain Analyst',
    description: 'Evalúa la rentabilidad agregada del mercado mediante la relación entre Market Cap y Realized Cap.',
    promptText: `Actúa como Analista On-Chain Senior. Elabora un análisis cuantitativo de la estructura del mercado de Bitcoin cruzando:
1. Ratio MVRV (Market Value to Realized Value) y su Z-Score histórico.
2. Comportamiento de Long-Term Holders (LTH) vs Short-Term Holders (STH).
3. Métrica de Coin Days Destroyed (CDD) y Dormancy Flow.
4. Reservas de BTC en exchanges centralizados.
Proporciona conclusiones estructurales sin emitir consejos financieros ni predicciones deterministas de precio.`,
  },
  {
    id: 'prompt-accounting-ifrs',
    title: 'Dictamen Contable IFRS / NIC 38 de Tenencias de Bitcoin',
    category: 'Testing & Formal Verification',
    targetRole: 'Contador Público / Asesor de Capitales',
    description: 'Estructura el memorándum contable bajo NIC 38 y NIIF 13 para tenencias corporativas de tesorería en Bitcoin.',
    promptText: `Actúa como Contador Público y Asesor Financiero en Mercados de Capitales. Redacta un dictamen técnico contable sobre el tratamiento de Bitcoin en los estados financieros de una empresa:
1. Justificación de la clasificación bajo NIC 38 (Activos Intangibles) vs NIC 2 (Inventarios).
2. Elección entre Modelo del Costo y Modelo de Revaluación según NIIF 13 (existencia de mercado activo).
3. Procedimiento para el test de deterioro (NIC 36) y documentación de evidencia de auditoría (verificación on-chain de UTXOs).
4. Tratamiento impositivo en Argentina (Ganancias y Bienes Personales) y régimen informativo RG 4614.`,
  },
];
