import React, { useState } from 'react';
import { FileText, BookOpen, Shield, Code, Server, Bot, Terminal, Layers } from 'lucide-react';

export const DocsView: React.FC = () => {
  const [activeDoc, setActiveDoc] = useState<'README' | 'ARCHITECTURE' | 'SECURITY' | 'API' | 'AGENTS' | 'DATA_SOURCES' | 'DEVELOPMENT' | 'DEPLOYMENT'>('ARCHITECTURE');

  const docs = {
    README: {
      title: 'README.md — Visión General del Sistema',
      icon: BookOpen,
      content: `# BITCOIN INTELLIGENCE & BLOCKCHAIN DEVELOPMENT OS

**Blockchain Intelligence & Development Operating System**

Inspirado en el marco editorial y técnico de **"Claude para el Desarrollo Blockchain"** por **Diego Eduardo Beltramo** (Contador Público, Asesor Idóneo en el Mercado de Capitales, Desarrollador Web Full Stack).

---

## 1. Principio Fundamental
«"La inteligencia artificial no reemplaza al desarrollador ni al analista. Amplifica su capacidad de investigar, construir, verificar y tomar decisiones informadas."»

- No inventar datos.
- No inventar APIs ni métricas.
- Separar datos reales de simulaciones.
- Separar análisis técnico de hechos demostrables.
- No custodiar claves privadas ni solicitar frases semilla.

---

## 2. Los Tres Grandes Sistemas
- **Sistema A — Bitcoin Intelligence**: Terminal en tiempo real, BIS Score, TradingView, Bitcoin Core Watch, BIP Watch, Minería y Halving, Billeteras y Custodia, Radar Cuántico, Explorador de Protocolo y Regulación.
- **Sistema B — Blockchain Development Copilot**: Asistente de arquitectura integral de 14 pilares, Smart Contract Lab con plantillas Solidity, Auditor de Seguridad estático y heurístico, Web3 Code Workspace y Prompt Engineering Lab.
- **Sistema C — DeFi & DEX Lab**: Simulador analítico AMM Constant Product (x * y = k), slippage, pérdidas impermanentes (IL), factor de salud en lending y Motor de Riesgo DeFi de 8 pilares.`,
    },
    ARCHITECTURE: {
      title: 'ARCHITECTURE.md — Arquitectura de Software y Capas',
      icon: Layers,
      content: `# ARQUITECTURA DEL SISTEMA BITCOIN INTELLIGENCE OS

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                       PRESENTATION LAYER                    │
│  React 19 + Tailwind CSS + Vite + Cabinet Grotesk / Mono    │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                       APPLICATION LAYER                     │
│  ├── AI Multi-Agent Orchestrator (10 Especialistas)         │
│  ├── Bitcoin Intelligence Engine (BIS Score & Daily Report) │
│  ├── DeFi & DEX Math Engine (Constant Product AMM & IL)     │
│  ├── Smart Contract Static Security Engine                  │
│  └── Quantitative Portfolio Risk Engine (Sharpe / VaR 95%)  │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                      DATA PROVIDER LAYER                    │
│  ├── MarketDataProvider (CoinGecko / Fallback con Timestamp)│
│  ├── OnChainDataProvider (mempool.space API & Glassnode)    │
│  ├── BitcoinCoreProvider (GitHub PRs, Releases, BIPs)       │
│  ├── RegulatoryProvider (Argentina CNV/ARCA + MiCA/SEC)     │
│  └── AccountingProvider (IFRS / NIC 38, NIC 2, NIIF 13)     │
└─────────────────────────────────────────────────────────────┘
\`\`\`

### Principios Arquitectónicos
1. **Desacoplamiento Estricto**: Ningún componente de interfaz interactúa con APIs externas directamente sin pasar por los adapters de la capa Data Provider.
2. **Resiliencia Operativa**: Ante caídas de red o restricciones de sandbox, el sistema conmuta sin fisuras a datasets de demostración verificados etiquetados con transparencia.
3. **Modelado Matemático Determinista**: Las fórmulas financieras de AMM, LTV, VaR y Sharpe se computan analíticamente sin cajas negras.`,
    },
    SECURITY: {
      title: 'SECURITY.md — Política de Seguridad y Cero Custodia',
      icon: Shield,
      content: `# SECURITY.md — SECURITY BY DESIGN & ZERO CUSTODY

## 1. Principio de Cero Custodia de Claves
Esta aplicación se rige por la regla inviolable de **NUNCA** solicitar, almacenar, procesar ni transmitir:
- Claves privadas (Private Keys).
- Semillas mnemónicas (Seed phrases / BIP 39).
- Secretos de APIs privadas ni contraseñas bancarias.

Toda interacción de firma se concibe para ejecutarse fuera de la aplicación en dispositivos de hardware dedicados (Hardware Wallets) o extensiones Web3 del usuario mediante transacciones parcialmente firmadas (PSBT / EIP-712).

## 2. Auditoría de Smart Contracts
El módulo **AI Smart Contract Auditor** opera como un *Preliminary AI Security Review*. Analiza:
- Reentrancy (violación de patrón Checks-Effects-Interactions).
- Control de acceso y uso erróneo de tx.origin.
- Manipulación de oráculos de reservas mediante Flash Loans.
- Incompatibilidades de retornos de transferencias ERC-20 (SafeERC20).
- Desbordamientos y subdesbordamientos aritméticos.

*Aviso*: Ninguna herramienta de IA reemplaza una auditoría formal realizada por auditores humanos certificados.`,
    },
    API: {
      title: 'API.md — Capa de Proveedores y Conectores MCP',
      icon: Code,
      content: `# API.md — DATA PROVIDERS & MCP READINESS

La aplicación implementa una capa de abstracción de datos para desacoplar el frontend de proveedores concretos.

## Adapters Implementados:
- \`MarketDataProvider\`: Consulta spot BTC/USD, BTC/ARS y USD/ARS con fallback y sello temporal.
- \`OnChainDataProvider\`: Conexión con los endpoints públicos de mempool.space:
  - \`/api/v1/fees/recommended\` (Tarifas de mempool por sat/vB)
  - \`/api/blocks/tip/height\` (Altura actual de bloque)
  - \`/api/mempool\` (Volumen en MB y transacciones pendientes)
  - \`/api/v1/difficulty-adjustment\` (Días y porcentaje de próximo ajuste)
- \`BitcoinCoreProvider\`: Catálogo estructurado de propuestas BIP (340, 341, 119, 360, etc.) y cambios de código.

## Arquitectura Preparada para Model Context Protocol (MCP):
Diseñado para admitir conectores MCP en futuras versiones:
- Bitcoin Core RPC MCP
- Binance MCP (Paper Trading / Read-Only)
- IOL (InvertirOnline) MCP para mercado de capitales
- GitHub Core MCP para diffs en vivo`,
    },
    AGENTS: {
      title: 'AGENTS.md — Catálogo del Swarm de Agentes',
      icon: Bot,
      content: `# AGENTS.md — CATÁLOGO DE AGENTES ESPECIALIZADOS

1. **Bitcoin Core Agent**: Especialista en C++, Script, consenso e invariantes de validación de bloques.
2. **Security Auditor Agent**: Auditor de smart contracts Solidity, EVM bytecode y vectores de exploit.
3. **On-Chain Analyst Agent**: Analista de métricas on-chain (MVRV, SOPR, NUPL, Realized Price, UTXO age).
4. **DEX Architect Agent**: Modelado analítico de curvas de liquidez, slippage e impermanent loss.
5. **DeFi Analyst Agent**: Mecánicas de lending, factor de salud y liquidaciones en cascada.
6. **Regulatory Agent**: Supervisión de marcos normativos en Argentina (CNV, ARCA, UIF) e internacional (MiCA, SEC).
7. **Quant & Portfolio Agent**: Ingeniería financiera cuantitativa (Sharpe, Sortino, VaR 95%, Max Drawdown).
8. **Blockchain Developer Agent**: Desarrollo de contratos Solidity modernos (^0.8.24) y suites de prueba.
9. **Research Agent**: Investigación académica rigurosa delimitando Hechos, Análisis, Opiniones e Incertidumbres.
10. **Report Agent**: Redactor técnico que consolida informes ejecutivos diarios y de auditoría.`,
    },
    DATA_SOURCES: {
      title: 'DATA_SOURCES.md — Fuentes Primarias y Calidad de Datos',
      icon: Server,
      content: `# DATA_SOURCES.md — FUENTES PRIMARIAS DE INFORMACIÓN

La plataforma prioriza exclusivamente fuentes primarias comprobables:

- **Bitcoin Core Repository**: Repositorio oficial \`bitcoin/bitcoin\` en GitHub.
- **Bitcoin BIPs**: Repositorio canónico \`bitcoin/bips\` para especificaciones de mejora.
- **mempool.space**: Explorador de mempool y telemetría de red open-source.
- **CoinGecko**: Precios de referencia de mercado spot.
- **Glassnode / CryptoQuant**: Benchmarks analíticos on-chain consolidados.
- **Diario Oficial de la UE (EUR-Lex)**: Reglamento MiCA (UE) 2023/1114.
- **CNV / ARCA / UIF (Argentina)**: Resoluciones Generales oficiales publicadas en el Boletín Oficial.
- **IFRS Foundation / IASB**: Normas Internacionales de Contabilidad (NIC 38, NIC 2, NIIF 13).`,
    },
    DEVELOPMENT: {
      title: 'DEVELOPMENT.md — Guía para Desarrolladores',
      icon: Terminal,
      content: `# DEVELOPMENT.md — GUÍA DE DESARROLLO

## Entorno Local
\`\`\`bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo en puerto 3000
npm run dev

# Ejecutar comprobación de tipos y linting
npm run lint

# Compilar para producción
npm run build
\`\`\`

## Convenciones de Código
- TypeScript en modo estricto.
- Componentes funcionales en React 19 con hooks.
- Clases de Tailwind CSS v4 para estilizado sobrio y de alto contraste fintech.
- Respeto a la Constitución de Diseño Frontend (Zero-pill discipline, 60-30-10 color budget, top bar contract).`,
    },
    DEPLOYMENT: {
      title: 'DEPLOYMENT.md — Despliegue y Operación',
      icon: FileText,
      content: `# DEPLOYMENT.md — DESPLIEGUE EN PRODUCCIÓN

## Requisitos de Entorno
- Node.js 20+ / 22+
- Servidor HTTP sirviendo los activos estáticos compilados en \`dist/\` o contenedor Docker con Vite preview en puerto 3000.

## Seguridad en Despliegue
- Las claves opcionales de APIs se gestionan a través de variables de entorno en el servidor o mediante el panel de Secrets de Google AI Studio.
- Se implementan cabeceras seguras CSP (Content Security Policy) para prevenir ataques XSS e inyecciones de scripts no autorizados.`,
    },
  };

  const current = docs[activeDoc];
  const Icon = current.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#F7931A]">
            <BookOpen className="w-3.5 h-3.5" />
            <span>TECHNICAL SPECIFICATIONS & ARCHITECTURAL MANIFESTOS</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">DOCUMENTACIÓN DEL SISTEMA</h1>
          <p className="text-xs text-slate-400">
            Manuales de arquitectura, especificaciones de seguridad, catálogo de agentes y fuentes primarias.
          </p>
        </div>
      </div>

      {/* Doc Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
        {(Object.keys(docs) as Array<keyof typeof docs>).map((key) => (
          <button
            key={key}
            onClick={() => setActiveDoc(key)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeDoc === key
                ? 'bg-[#1E293B] text-[#F7931A] font-semibold border border-slate-700'
                : 'text-slate-400 hover:text-white bg-[#0A0E17] border border-[#1E293B]'
            }`}
          >
            {key}.md
          </button>
        ))}
      </div>

      {/* Document Content Viewer */}
      <div className="p-6 sm:p-8 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-4">
        <div className="flex items-center gap-2 border-b border-[#1E293B] pb-3 text-sm font-bold text-white">
          <Icon className="w-4 h-4 text-[#F7931A]" />
          <span>{current.title}</span>
        </div>

        <div className="bg-[#05080E] p-6 rounded-lg border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans overflow-x-auto max-h-[550px] overflow-y-auto">
          <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed">{current.content}</pre>
        </div>
      </div>
    </div>
  );
};
