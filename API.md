# API.md — CAPA DE DATOS Y CONECTORES MCP

## 1. Data Provider Abstraction Layer
La capa de proveedores define interfaces uniformes para el consumo de datos:
- `MarketDataProvider`: Precios spot BTC/USD, BTC/ARS y USD/ARS con fallback y sello temporal.
- `OnChainDataProvider`: Mempool, hashrate, dificultad y tarifas sat/vB mediante endpoints oficiales de `mempool.space`.
- `BitcoinCoreProvider`: Catálogo estructurado de propuestas BIP y cambios de código.
- `RegulatoryProvider`: Repositorio normativo argentino e internacional.
- `AccountingProvider`: Normas contables IFRS / NIIF y resoluciones técnicas.

## 2. Preparación para Model Context Protocol (MCP)
Diseñado para la integración de servidores MCP:
- Bitcoin Core RPC MCP
- Binance MCP (Paper Trading / Solo Lectura)
- IOL (InvertirOnline) MCP
- GitHub Core MCP
