# ARCHITECTURE.md — ARQUITECTURA DEL SISTEMA

## 1. Visión Arquitectónica por Capas

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                       PRESENTATION LAYER                    │
│  React 19 + Tailwind CSS + Vite + Cabinet Grotesk / Mono    │
│  Navigation: Sidebar, Command Palette (Ctrl+K), Header      │
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

## 2. Componentes Principales
- **Desacoplamiento Estricto**: Todo acceso a datos de red y mercado se realiza a través de la capa `services/dataProviders`, permitiendo reemplazar fuentes o añadir proxies sin tocar la vista.
- **Rigor Matemático**: Modelado analítico para cálculos de AMM ($x \cdot y = k$), pérdidas impermanentes, fórmulas de volatilidad y Value at Risk.
- **Trazabilidad en Agentes**: Cada ejecución multi-agente registra la traza de razonamiento y el conjunto de herramientas utilizadas.
