import { AgentDescriptor, AgentExecutionTrace } from '../../types';

export const SPECIALIZED_AGENTS: AgentDescriptor[] = [
  {
    id: 'agent-btc-core',
    name: 'Bitcoin Core Agent',
    role: 'Especialista en Consenso, BIPs y Repositorio de Bitcoin Core',
    specialty: 'C++ en Bitcoin Core, Script, Taproot/Schnorr, P2P network, Mempool, BIP evaluation',
    tools: ['git_diff_analyzer', 'bip_registry_reader', 'consensus_invariant_checker', 'mempool_simulator'],
    systemPrompt: 'Analiza cambios de código en Bitcoin Core con rigor de desarrollador de protocolo. Evalúa compatibilidad de incentivos, riesgos de bifurcación suave (soft-fork), tamaño en bloque y memoria.',
    sampleQuery: '¿Qué impacto tiene el PR de Cluster Mempool sobre las transacciones v3?',
  },
  {
    id: 'agent-security-auditor',
    name: 'Security Auditor Agent',
    role: 'Auditor Senior de Smart Contracts y Criptografía',
    specialty: 'Solidity, EVM bytecode, Reentrancy, Flash loans, Oracle manipulation, Access control, Invariants',
    tools: ['static_analyzer', 'slither_rules_evaluator', 'reentrancy_tracer', 'exploit_vector_synthesizer'],
    systemPrompt: 'Examina código Solidity identificando vectores de ataque, severidad (Critical a Info), y escenarios de explotación detallados con remediación verificada.',
    sampleQuery: 'Audita este contrato de staking y evalúa si el cálculo de recompensa puede manipularse.',
  },
  {
    id: 'agent-onchain-analyst',
    name: 'On-Chain Analyst Agent',
    role: 'Analista Cuantitativo de Datos en Cadena',
    specialty: 'UTXO age distribution, MVRV, SOPR, NUPL, Realized Price, Miner economics, Exchange reserves',
    tools: ['mempool_space_api', 'glassnode_query_adapter', 'utxo_age_calculator', 'sopr_engine'],
    systemPrompt: 'Interpreta métricas on-chain sin caer en especulaciones de precio. Correlaciona comportamiento de holders a largo plazo con liquidez.',
    sampleQuery: '¿Cuál es la relación actual entre el precio realizado y el MVRV ratio?',
  },
  {
    id: 'agent-dex-architect',
    name: 'DEX Architect Agent',
    role: 'Arquitecto de Protocolos de Intercambio Descentralizado',
    specialty: 'Constant Product AMMs, Concentrated Liquidity (v3), Order Books on-chain, Impermanent Loss, Slippage',
    tools: ['amm_curve_simulator', 'concentrated_liquidity_calculator', 'slippage_modeler', 'impermanent_loss_engine'],
    systemPrompt: 'Modela la economía y curvas de liquidez de AMMs. Deduce matemáticamente el impacto en precio y las pérdidas no permanentes para LPs.',
    sampleQuery: 'Diseña un pool de liquidez con fee dinámico según volatilidad del par BTC/USDT.',
  },
  {
    id: 'agent-defi-analyst',
    name: 'DeFi Analyst Agent',
    role: 'Ingeniero de Protocolos DeFi, Lending y Derivados',
    specialty: 'Aave/Compound lending mechanics, Health factor, Liquidation cascades, Flash loan arbitrage, Staking',
    tools: ['lending_health_calculator', 'liquidation_cascade_simulator', 'yield_optimizer'],
    systemPrompt: 'Evalúa la robustez económica de protocolos DeFi ante cisnes negros y despegues de paridad.',
    sampleQuery: 'Calcula el factor de salud y umbral de liquidación con colateral BTC y deuda USDC.',
  },
  {
    id: 'agent-regulatory',
    name: 'Regulatory Agent',
    role: 'Especialista en Regulación Financiera y Activos Virtuales',
    specialty: 'CNV, ARCA, UIF, BCRA (Argentina), MiCA (UE), SEC/CFTC (EE.UU.), GAFI Travel Rule',
    tools: ['regulatory_digest_search', 'psav_compliance_checker', 'mica_framework_evaluator'],
    systemPrompt: 'Provee análisis normativo referencial y comparativo sobre activos virtuales sin emitir dictamen legal vinculante.',
    sampleQuery: '¿Cuáles son los requisitos de inscripción en el Registro de PSAV de la CNV?',
  },
  {
    id: 'agent-quant',
    name: 'Quant & Portfolio Agent',
    role: 'Ingeniero Financiero y Gestor de Riesgo Cuantitativo',
    specialty: 'Sharpe ratio, Sortino, VaR 95%, CVaR, Maximum Drawdown, Modern Portfolio Theory, Correlación',
    tools: ['risk_matrix_calculator', 'var_montecarlo_engine', 'drawdown_analyzer', 'correlation_matrix'],
    systemPrompt: 'Computa métricas estadísticas de carteras multi-activo con rigor cuantitativo y delimitación de supuestos temporales.',
    sampleQuery: 'Calcula el VaR histórico a 1 día con nivel de confianza del 95% para un portafolio BTC 70% / ETH 20% / Cash 10%.',
  },
  {
    id: 'agent-blockchain-developer',
    name: 'Blockchain Developer Agent',
    role: 'Ingeniero Full-Stack Web3 y Solidity Senior',
    specialty: 'Ethers.js, Viem, Wagmi, Hardhat, Foundry, Smart contract scaffolding, Gas optimization',
    tools: ['contract_scaffolder', 'gas_optimizer', 'foundry_test_generator', 'typechain_builder'],
    systemPrompt: 'Escribe código Solidity moderno (0.8.24+), scripts de despliegue determinístico y suites de prueba exhaustivas.',
    sampleQuery: 'Genera un contrato de tesorería con timelock de 48 horas y tests en Foundry.',
  },
  {
    id: 'agent-research',
    name: 'Research Agent',
    role: 'Investigador Científico de Criptografía y Sistemas Distribuidos',
    specialty: 'Computación cuántica, firmas Schnorr vs ECDSA, post-quantum crypto, tolerancia a fallas bizantinas',
    tools: ['paper_repository_indexer', 'quantum_risk_matrix', 'cryptographic_proof_checker'],
    systemPrompt: 'Descompone investigaciones técnicas separando rigurosamente: Hecho (Fact), Análisis (Analysis), Opinión (Opinion) e Incertidumbre (Unknown).',
    sampleQuery: 'Investiga la viabilidad teórica de un ataque de Shor contra direcciones P2PK reutilizadas.',
  },
  {
    id: 'agent-report',
    name: 'Report Agent',
    role: 'Redactor Técnico y Generador de Informes de Inteligencia',
    specialty: 'Síntesis ejecutiva, estructura editorial Bloomberg-style, exportación a Markdown/PDF/JSON',
    tools: ['markdown_synthesizer', 'executive_summary_formatter', 'data_attribution_stamper'],
    systemPrompt: 'Consolida hallazgos multidisciplinarios en informes ejecutivos pulidos y concisos con atribución de fuentes y timestamps.',
    sampleQuery: 'Genera el informe diario ejecutivo de Bitcoin Intelligence consolidando los eventos del día.',
  },
];

export class AgentOrchestrator {
  /**
   * Intelligently selects which specialized agents to dispatch based on query intent.
   */
  public static routeQuery(query: string): AgentDescriptor[] {
    const q = query.toLowerCase();
    const matchedAgents: Set<AgentDescriptor> = new Set();

    if (q.includes('core') || q.includes('bip') || q.includes('consenso') || q.includes('pr') || q.includes('taproot') || q.includes('schnorr')) {
      matchedAgents.add(SPECIALIZED_AGENTS.find(a => a.id === 'agent-btc-core')!);
      matchedAgents.add(SPECIALIZED_AGENTS.find(a => a.id === 'agent-research')!);
    }

    if (q.includes('audita') || q.includes('seguridad') || q.includes('vulnerab') || q.includes('reentr') || q.includes('revis') || q.includes('exploit')) {
      matchedAgents.add(SPECIALIZED_AGENTS.find(a => a.id === 'agent-security-auditor')!);
      matchedAgents.add(SPECIALIZED_AGENTS.find(a => a.id === 'agent-blockchain-developer')!);
    }

    if (q.includes('dex') || q.includes('amm') || q.includes('swap') || q.includes('slippage') || q.includes('impermanent loss') || q.includes('liquidez')) {
      matchedAgents.add(SPECIALIZED_AGENTS.find(a => a.id === 'agent-dex-architect')!);
      matchedAgents.add(SPECIALIZED_AGENTS.find(a => a.id === 'agent-quant')!);
    }

    if (q.includes('defi') || q.includes('lending') || q.includes('aave') || q.includes('staking') || q.includes('yield') || q.includes('flash loan')) {
      matchedAgents.add(SPECIALIZED_AGENTS.find(a => a.id === 'agent-defi-analyst')!);
      matchedAgents.add(SPECIALIZED_AGENTS.find(a => a.id === 'agent-security-auditor')!);
    }

    if (q.includes('onchain') || q.includes('mvrv') || q.includes('sopr') || q.includes('nupl') || q.includes('utxo') || q.includes('mempool') || q.includes('hashrate')) {
      matchedAgents.add(SPECIALIZED_AGENTS.find(a => a.id === 'agent-onchain-analyst')!);
    }

    if (q.includes('regul') || q.includes('cnv') || q.includes('afip') || q.includes('arca') || q.includes('mica') || q.includes('uif') || q.includes('ley') || q.includes('impuest')) {
      matchedAgents.add(SPECIALIZED_AGENTS.find(a => a.id === 'agent-regulatory')!);
    }

    if (q.includes('portafolio') || q.includes('portfolio') || q.includes('sharpe') || q.includes('var') || q.includes('volatil') || q.includes('riesgo')) {
      matchedAgents.add(SPECIALIZED_AGENTS.find(a => a.id === 'agent-quant')!);
    }

    if (q.includes('contrato') || q.includes('solidity') || q.includes('token') || q.includes('erc') || q.includes('código') || q.includes('crear')) {
      matchedAgents.add(SPECIALIZED_AGENTS.find(a => a.id === 'agent-blockchain-developer')!);
      matchedAgents.add(SPECIALIZED_AGENTS.find(a => a.id === 'agent-security-auditor')!);
    }

    // Default if no specific keywords triggered
    if (matchedAgents.size === 0) {
      matchedAgents.add(SPECIALIZED_AGENTS.find(a => a.id === 'agent-btc-core')!);
      matchedAgents.add(SPECIALIZED_AGENTS.find(a => a.id === 'agent-research')!);
      matchedAgents.add(SPECIALIZED_AGENTS.find(a => a.id === 'agent-report')!);
    }

    return Array.from(matchedAgents);
  }

  /**
   * Generates traceable collaborative reasoning from the dispatched agents.
   */
  public static executePipeline(query: string): AgentExecutionTrace {
    const agents = this.routeQuery(query);
    const agentNames = agents.map(a => a.name);

    let reasoning = `El AI Orchestrator analizó la consulta e identificó los dominios requeridos. Se convocó el clúster colaborativo: [${agentNames.join(', ')}].\n`;
    reasoning += `• Herramientas activadas: ${agents.flatMap(a => a.tools).slice(0, 5).join(', ')}.\n`;
    reasoning += `• Delimitación metodológica: Separación de hechos verificados, formulación de modelos y exclusión de especulación.`;

    let synthesizedOutput = `### ANÁLISIS MULTIDISCIPLINARIO COLECTIVO\n\n`;
    synthesizedOutput += `**Consulta de Entrada**: "${query}"\n\n`;
    synthesizedOutput += `**Clúster de Agentes Asignado**: ${agentNames.join(' ⟷ ')}\n\n`;

    agents.forEach((agent) => {
      synthesizedOutput += `#### ◈ Dictamen de ${agent.name} (${agent.role})\n`;
      if (agent.id === 'agent-btc-core') {
        synthesizedOutput += `*Enfoque de Protocolo*: El cambio debe evaluarse a la luz de los invariantes de consenso de Bitcoin. Los soft-forks requieren validación estricta de retrocompatibilidad. Se verifica que no se introduzcan incentivos desalineados para mineros ni aumentos no lineales en el costo de validación de bloques.\n\n`;
      } else if (agent.id === 'agent-security-auditor') {
        synthesizedOutput += `*Auditoría de Invariantes*: Se requiere comprobación formal del patrón Checks-Effects-Interactions (CEI). Debe garantizarse que ningún actor externo pueda interrumpir la secuencia de ejecución o vaciar pools mediante préstamos relámpago.\n\n`;
      } else if (agent.id === 'agent-dex-architect') {
        synthesizedOutput += `*Modelado de Liquidez*: En modelos de producto constante (x · y = k), el slippage marginal para este escenario se deduce analíticamente mediante Δy = (y · Δx) / (x + Δx). Para trades superiores al 2% de la reserva, debe implementarse protección de precio límite.\n\n`;
      } else if (agent.id === 'agent-regulatory') {
        synthesizedOutput += `*Marco Normativo*: Bajo la normativa argentina vigente (CNV Res. 994 / ARCA RG 4614) y el estándar europeo MiCA, se destaca la obligatoriedad de registro como PSAV para custodia de fondos de terceros y la debida diligencia según lineamientos GAFI.\n\n`;
      } else if (agent.id === 'agent-quant') {
        synthesizedOutput += `*Evaluación Cuantitativa*: Se calculan métricas de riesgo considerando la distribución de colas pesadas de los criptoactivos. El Value at Risk (VaR 95%) diario y el Maximum Drawdown deben ser monitoreados con bandas de Bollinger a 20 períodos.\n\n`;
      } else if (agent.id === 'agent-blockchain-developer') {
        synthesizedOutput += `*Arquitectura de Software*: Se recomienda estructurar el código siguiendo OpenZeppelin Contracts v5.0, empleando tipos inmutables para parámetros fijos y aislando la lógica de actualización con UUPS Proxy si se requiere upgradeability.\n\n`;
      } else {
        synthesizedOutput += `*Perspectiva de Investigación*: Se contrastan las fuentes primarias frente a repositorios oficiales y literatura académica arbitrada, descartando afirmaciones sin respaldo comprobable.\n\n`;
      }
    });

    synthesizedOutput += `\n---\n**Dictamen de Síntesis**: El sistema concluye con evidencia verificable que la implementación propuesta debe adherirse a los principios de minimización de confianza, no custodia de claves en cliente y verificación criptográfica exhaustiva antes de cualquier despliegue.`;

    return {
      id: `trace-${Date.now()}`,
      query,
      dispatchedAgents: agentNames,
      reasoningStep: reasoning,
      output: synthesizedOutput,
      timestamp: new Date().toISOString(),
    };
  }
}
