import React, { useState, useEffect, useMemo, useRef } from 'react';
import { DEFAULT_PORTFOLIO_ASSETS, PortfolioRiskEngine } from '../../services/portfolio/portfolioRiskEngine';
import {
  PortfolioPriceService,
  AssetSearchResult,
  POPULAR_FINANCIAL_ASSETS
} from '../../services/portfolio/portfolioPriceService';
import { PortfolioAsset } from '../../types';
import {
  PieChart as PieChartIcon,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  RefreshCw,
  BarChart2,
  Plus,
  Trash2,
  Search,
  Check,
  ExternalLink,
  DollarSign,
  Activity,
  Layers,
  ArrowUpRight,
  Info,
  Sparkles,
  Sliders,
  RotateCcw
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
} from 'recharts';

const CATEGORY_COLORS: Record<string, string> = {
  crypto: '#F7931A',
  etf: '#06B6D4',
  equity: '#8B5CF6',
  commodity: '#EAB308',
  stablecoin: '#10B981',
  bond: '#3B82F6',
};

const CATEGORY_LABELS: Record<string, string> = {
  crypto: 'Cripto',
  etf: 'ETF',
  equity: 'Acción',
  commodity: 'Commodity',
  stablecoin: 'Stablecoin',
  bond: 'Bono',
};

const ASSET_PIE_COLORS = [
  '#F7931A', // BTC Orange
  '#06B6D4', // Cyan
  '#10B981', // Emerald
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#3B82F6', // Blue
  '#14B8A6', // Teal
  '#6366F1', // Indigo
  '#F43F5E', // Rose
  '#84CC16', // Lime
];

export const PortfolioLabView: React.FC = () => {
  const [assets, setAssets] = useState<PortfolioAsset[]>(() => {
    try {
      const saved = localStorage.getItem('bitcoin_intel_portfolio_assets');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_PORTFOLIO_ASSETS;
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>('En Directo');

  // Search & Add Asset State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AssetSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<AssetSearchResult | null>(null);
  const [inputUnits, setInputUnits] = useState<string>('1');
  const [previewPrice, setPreviewPrice] = useState<number | null>(null);
  const [previewChange24h, setPreviewChange24h] = useState<number | null>(null);
  const [previewSource, setPreviewSource] = useState<string>('');
  const [isFetchingPrice, setIsFetchingPrice] = useState(false);
  const [showAddSuccess, setShowAddSuccess] = useState(false);

  const searchBoxRef = useRef<HTMLDivElement>(null);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('bitcoin_intel_portfolio_assets', JSON.stringify(assets));
    } catch {}
  }, [assets]);

  // Click outside search results listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(POPULAR_FINANCIAL_ASSETS.slice(0, 10));
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await PortfolioPriceService.searchFinancialAssets(searchQuery);
        setSearchResults(results);
      } catch {
        // ignore
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch live price when an asset is selected for addition
  const handleSelectAsset = async (item: AssetSearchResult) => {
    setSelectedResult(item);
    setIsSearchOpen(false);
    setSearchQuery(`${item.symbol} - ${item.name}`);
    setIsFetchingPrice(true);

    try {
      const live = await PortfolioPriceService.fetchAssetLivePrice(item);
      setPreviewPrice(live.price);
      setPreviewChange24h(live.change24h);
      setPreviewSource(live.source);
    } catch {
      setPreviewPrice(item.defaultPrice || 1.0);
      setPreviewChange24h(0);
      setPreviewSource('Precio Estimado');
    } finally {
      setIsFetchingPrice(false);
    }
  };

  // Add Asset to Portfolio
  const handleAddAsset = () => {
    if (!selectedResult || previewPrice === null || previewPrice <= 0) return;

    const unitsNum = parseFloat(inputUnits);
    if (isNaN(unitsNum) || unitsNum <= 0) return;

    const existingIndex = assets.findIndex((a) => a.symbol.toUpperCase() === selectedResult.symbol.toUpperCase());

    if (existingIndex >= 0) {
      // Update existing asset units
      const existing = assets[existingIndex];
      const newUnits = existing.units + unitsNum;
      const updated = [...assets];
      updated[existingIndex] = {
        ...existing,
        units: newUnits,
        currentPrice: previewPrice,
        valueUsd: newUnits * previewPrice,
        change24h: previewChange24h ?? existing.change24h,
        apiSource: previewSource || existing.apiSource,
        lastUpdated: new Date().toLocaleTimeString(),
      };
      setAssets(updated);
    } else {
      // Add new asset
      const newAsset: PortfolioAsset = {
        id: `asset-${selectedResult.symbol.toLowerCase()}-${Date.now()}`,
        symbol: selectedResult.symbol.toUpperCase(),
        name: selectedResult.name,
        allocationPercent: 0,
        currentPrice: previewPrice,
        units: unitsNum,
        valueUsd: unitsNum * previewPrice,
        category: selectedResult.category,
        change24h: previewChange24h ?? 0,
        apiSource: previewSource,
        lastUpdated: new Date().toLocaleTimeString(),
        volatilityEst: selectedResult.volatilityEst,
      };
      setAssets((prev) => [...prev, newAsset]);
    }

    // Reset form
    setSelectedResult(null);
    setSearchQuery('');
    setInputUnits('1');
    setPreviewPrice(null);
    setShowAddSuccess(true);
    setTimeout(() => setShowAddSuccess(false), 2500);
  };

  // Refresh all assets in portfolio via live APIs
  const handleRefreshLivePrices = async () => {
    setIsRefreshing(true);
    try {
      const refreshed = await PortfolioPriceService.refreshPortfolioLivePrices(assets);
      setAssets(refreshed);
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch {
      // ignore
    } finally {
      setIsRefreshing(false);
    }
  };

  // Reset to default benchmark
  const handleResetToDefault = () => {
    if (window.confirm('¿Deseas restablecer la cartera a la asignación institucional predeterminada?')) {
      setAssets(DEFAULT_PORTFOLIO_ASSETS);
      localStorage.removeItem('bitcoin_intel_portfolio_assets');
    }
  };

  // Update units inline
  const updateUnits = (id: string, newUnits: number) => {
    setAssets((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const validUnits = Math.max(0, newUnits);
          return {
            ...a,
            units: validUnits,
            valueUsd: validUnits * a.currentPrice,
          };
        }
        return a;
      })
    );
  };

  // Remove asset
  const handleRemoveAsset = (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
  };

  // Calculate metrics
  const metrics = useMemo(() => {
    return PortfolioRiskEngine.calculatePortfolioMetrics(assets);
  }, [assets]);

  const totalValue = useMemo(() => {
    return assets.reduce((acc, a) => acc + a.valueUsd, 0);
  }, [assets]);

  // Data for Donut Chart
  const pieData = useMemo(() => {
    if (totalValue <= 0) return [];
    return assets
      .filter((a) => a.valueUsd > 0)
      .map((a) => ({
        name: a.symbol,
        value: a.valueUsd,
        percent: Number(((a.valueUsd / totalValue) * 100).toFixed(1)),
      }));
  }, [assets, totalValue]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#F7931A]">
            <PieChartIcon className="w-3.5 h-3.5" />
            <span>QUANTITATIVE RISK & MULTI-ASSET INTELLIGENCE</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">PORTFOLIO LAB</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Laboratorio cuantitativo multi-activo: Incorpora cualquier criptomoneda o activo tradicional con precios reales por API (CoinGecko, Coinbase y feeds globales).
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleRefreshLivePrices}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-mono font-bold text-white bg-[#1E293B] hover:bg-[#283548] border border-slate-700 rounded-lg transition-all disabled:opacity-50 shadow-sm"
            title="Sincronizar precios de todos los activos contra APIs públicas"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Actualizando...' : 'Actualizar Precios en Vivo'}</span>
          </button>

          <button
            onClick={handleResetToDefault}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono text-slate-400 hover:text-white bg-[#0A0E17] border border-slate-800 rounded-lg transition-colors"
            title="Restablecer cartera institucional predeterminada"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Restablecer</span>
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-1">
          <span className="text-[11px] text-slate-400">Valor Total Cartera</span>
          <div className="text-lg font-mono-nums font-bold text-white">
            ${metrics.totalValueUsd.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {assets.length} Activos · USD
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-1">
          <span className="text-[11px] text-slate-400">Sharpe Ratio</span>
          <div className="text-lg font-mono-nums font-bold text-emerald-400">
            {metrics.sharpeRatio}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Retorno / Riesgo</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-1">
          <span className="text-[11px] text-slate-400">Sortino Ratio</span>
          <div className="text-lg font-mono-nums font-bold text-cyan-300">
            {metrics.sortinoRatio}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Downside Vol Ratio</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-1">
          <span className="text-[11px] text-slate-400">VaR 95% (1 Día)</span>
          <div className="text-lg font-mono-nums font-bold text-rose-400">
            -{metrics.var95Percent}%
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Pérdida máx. esperada</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-1">
          <span className="text-[11px] text-slate-400">Max Drawdown</span>
          <div className="text-lg font-mono-nums font-bold text-amber-300">
            {metrics.maxDrawdown}%
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Pico a valle histórico</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-1">
          <span className="text-[11px] text-slate-400">Volatilidad Anual</span>
          <div className="text-lg font-mono-nums font-bold text-slate-200">
            {metrics.annualizedVolatility}%
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Covarianza multi-activo</div>
        </div>
      </div>

      {/* SECTION: AGREGAR CUALQUIER ACTIVO FINANCIERO O CRIPTO (CON PRECIOS REALES POR API) */}
      <div className="p-5 rounded-2xl bg-gradient-to-b from-[#0F172A] to-[#0A0E17] border border-slate-700/80 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#F7931A]/10 border border-[#F7931A]/30 text-[#F7931A]">
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Incorporar Activo Financiero o Criptomoneda
              </h2>
              <p className="text-xs text-slate-400">
                Consulta en vivo precios spot y cotizaciones por API (CoinGecko, Coinbase, ETFs y Acciones).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>APIs en Vivo Conectadas</span>
          </div>
        </div>

        {/* Input Bar and Live Price Preview */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          {/* Search Input Box */}
          <div className="md:col-span-6 relative" ref={searchBoxRef}>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Buscar Cripto o Activo Financiero:
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Ej: Solana, XRP, SUI, IBIT, MSTR, SPY, GLD, NVDA, AAPL, PEPE..."
                className="w-full bg-[#080B10] border border-slate-700 rounded-xl px-3.5 py-2.5 pl-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#F7931A] transition-colors font-mono"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>

            {/* Autocomplete Dropdown */}
            {isSearchOpen && (
              <div className="absolute left-0 right-0 mt-1.5 max-h-72 overflow-y-auto rounded-xl bg-[#090D15] border border-slate-700 shadow-2xl z-50 p-1.5 space-y-1 backdrop-blur-xl">
                <div className="px-2.5 py-1 text-[10px] font-mono text-slate-500 uppercase flex justify-between">
                  <span>{isSearching ? 'Buscando en API...' : 'Resultados sugeridos'}</span>
                  <span>CoinGecko & Mercados</span>
                </div>

                {searchResults.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectAsset(item)}
                    className="w-full p-2 rounded-lg text-left hover:bg-[#1E293B] transition-colors flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {item.thumb ? (
                        <img src={item.thumb} alt={item.symbol} className="w-5 h-5 rounded-full" />
                      ) : (
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                          style={{ backgroundColor: CATEGORY_COLORS[item.category] || '#64748B' }}
                        >
                          {item.symbol.slice(0, 2)}
                        </div>
                      )}
                      <div className="truncate">
                        <span className="font-bold text-white font-mono mr-2">{item.symbol}</span>
                        <span className="text-slate-400 text-[11px] truncate">{item.name}</span>
                      </div>
                    </div>

                    <span
                      className="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase shrink-0"
                      style={{
                        backgroundColor: `${CATEGORY_COLORS[item.category] || '#64748B'}20`,
                        color: CATEGORY_COLORS[item.category] || '#94A3B8',
                      }}
                    >
                      {CATEGORY_LABELS[item.category] || item.category}
                    </span>
                  </button>
                ))}

                {searchResults.length === 0 && !isSearching && (
                  <div className="p-3 text-center text-xs text-slate-500">
                    No se encontraron coincidencias directas. Escribe el símbolo exacto.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Units Input */}
          <div className="md:col-span-3">
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Cantidad de Unidades:
            </label>
            <input
              type="number"
              step="any"
              min="0.00000001"
              value={inputUnits}
              onChange={(e) => setInputUnits(e.target.value)}
              placeholder="1.0"
              className="w-full bg-[#080B10] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#F7931A] font-mono"
            />
          </div>

          {/* Add Button */}
          <div className="md:col-span-3">
            <button
              onClick={handleAddAsset}
              disabled={!selectedResult || previewPrice === null || isFetchingPrice}
              className="w-full py-2.5 px-4 rounded-xl bg-[#F7931A] hover:bg-[#e08213] text-black text-xs font-mono font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:scale-[1.01]"
            >
              {isFetchingPrice ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Obteniendo Precio...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Agregar a Cartera</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Price Quote & Calculated Value Preview Bar */}
        {selectedResult && previewPrice !== null && (
          <div className="p-3.5 rounded-xl bg-[#080B10] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: CATEGORY_COLORS[selectedResult.category] || '#F7931A' }}
              />
              <div>
                <span className="text-slate-400">Activo Seleccionado: </span>
                <span className="text-white font-bold">{selectedResult.name} ({selectedResult.symbol})</span>
                <span className="text-slate-500 ml-2">· Categoría: {CATEGORY_LABELS[selectedResult.category]}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <div>
                <span className="text-slate-400">Precio Spot: </span>
                <span className="text-white font-bold">${previewPrice >= 1 ? previewPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : previewPrice.toFixed(6)}</span>
                {previewChange24h !== null && (
                  <span className={`ml-1.5 font-bold ${previewChange24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ({previewChange24h >= 0 ? '+' : ''}{previewChange24h}%)
                  </span>
                )}
              </div>

              <div>
                <span className="text-slate-400">Valor Estimado: </span>
                <span className="text-[#F7931A] font-bold">
                  ${Math.round((parseFloat(inputUnits) || 0) * previewPrice).toLocaleString()} USD
                </span>
              </div>

              <div className="text-[10px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                {previewSource}
              </div>
            </div>
          </div>
        )}

        {/* Success toast banner */}
        {showAddSuccess && (
          <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-600 text-emerald-300 text-xs font-mono flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>¡Activo incorporado con éxito! Las métricas cuantitativas y la asignación se han recalculado en tiempo real.</span>
          </div>
        )}

        {/* Quick Add Popular Preset Pills */}
        <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
          <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
            Accesos Rápidos a Activos Clave:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { symbol: 'IBIT', name: 'iShares Bitcoin ETF', category: 'etf' as const },
              { symbol: 'MSTR', name: 'MicroStrategy', category: 'equity' as const },
              { symbol: 'SPY', name: 'S&P 500 ETF', category: 'etf' as const },
              { symbol: 'GLD', name: 'Oro Físico (Gold)', category: 'commodity' as const },
              { symbol: 'SOL', name: 'Solana', category: 'crypto' as const, coingeckoId: 'solana' },
              { symbol: 'XRP', name: 'Ripple', category: 'crypto' as const, coingeckoId: 'ripple' },
              { symbol: 'DOGE', name: 'Dogecoin', category: 'crypto' as const, coingeckoId: 'dogecoin' },
              { symbol: 'AVAX', name: 'Avalanche', category: 'crypto' as const, coingeckoId: 'avalanche-2' },
              { symbol: 'SUI', name: 'Sui Network', category: 'crypto' as const, coingeckoId: 'sui' },
              { symbol: 'AAVE', name: 'Aave Protocol', category: 'crypto' as const, coingeckoId: 'aave' },
              { symbol: 'TLT', name: 'Bonos Tesoro 20Y', category: 'bond' as const },
              { symbol: 'AL30', name: 'Bono Soberano AR', category: 'bond' as const },
            ].map((preset) => (
              <button
                key={preset.symbol}
                onClick={() =>
                  handleSelectAsset({
                    id: preset.symbol.toLowerCase(),
                    symbol: preset.symbol,
                    name: preset.name,
                    category: preset.category,
                    coingeckoId: (preset as any).coingeckoId,
                  })
                }
                className="px-2.5 py-1 rounded-lg text-xs font-mono bg-[#080B10] hover:bg-[#1E293B] border border-slate-800 hover:border-slate-600 text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
              >
                <span className="text-[#F7931A] font-bold">+</span>
                <span>{preset.symbol}</span>
                <span className="text-[10px] text-slate-500">({CATEGORY_LABELS[preset.category]})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Workbench: Asset Allocation List & Visual Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: List of Assets with Editable Units & Delete */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-[#0A0E17] border border-[#1E293B] space-y-4">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-[#F7931A]" />
              <span>Composición Actual de la Cartera</span>
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
              <span>Sincronización: {lastRefreshed}</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded text-white font-bold">
                {assets.length} Activos
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {assets.map((asset, idx) => {
              const assetShare = totalValue > 0 ? (asset.valueUsd / totalValue) * 100 : 0;
              const color = ASSET_PIE_COLORS[idx % ASSET_PIE_COLORS.length];

              return (
                <div
                  key={asset.id}
                  className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 hover:border-slate-700 transition-all space-y-2.5 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Symbol & Name & Source */}
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-2.5 h-8 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white bg-[#080B10] px-2 py-0.5 rounded border border-slate-800 text-sm">
                            {asset.symbol}
                          </span>
                          <span className="text-slate-200 font-medium">{asset.name}</span>
                          {asset.category && (
                            <span
                              className="text-[9px] font-mono px-1.5 py-0.2 rounded uppercase font-semibold"
                              style={{
                                backgroundColor: `${CATEGORY_COLORS[asset.category] || '#64748B'}20`,
                                color: CATEGORY_COLORS[asset.category] || '#94A3B8',
                              }}
                            >
                              {CATEGORY_LABELS[asset.category] || asset.category}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono mt-0.5">
                          <span>
                            Precio Spot: ${asset.currentPrice >= 1 ? asset.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : asset.currentPrice.toFixed(5)}
                          </span>
                          {asset.change24h !== undefined && (
                            <span className={asset.change24h >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                              {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                            </span>
                          )}
                          {asset.apiSource && (
                            <span className="text-slate-500 hidden md:inline">· {asset.apiSource}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Units input & Total USD value */}
                    <div className="flex items-center gap-3 sm:gap-4 font-mono-nums self-end sm:self-auto">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 text-[11px]">Unidades:</span>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={asset.units}
                          onChange={(e) => updateUnits(asset.id, parseFloat(e.target.value) || 0)}
                          className="w-24 bg-[#080B10] border border-slate-700 rounded-lg px-2.5 py-1 text-right text-white font-mono focus:outline-none focus:border-[#F7931A]"
                        />
                      </div>

                      <div className="text-right min-w-[100px]">
                        <div className="text-white font-bold text-sm">
                          ${Math.round(asset.valueUsd).toLocaleString()}
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          {assetShare.toFixed(1)}% de la cartera
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveAsset(asset.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-900 transition-colors"
                        title="Eliminar activo de la cartera"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Allocation Visual Bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(0, assetShare))}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}

            {assets.length === 0 && (
              <div className="p-8 text-center rounded-xl bg-[#0F172A] border border-slate-800 text-slate-400 space-y-2">
                <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto" />
                <p className="text-sm font-semibold text-white">La cartera está vacía</p>
                <p className="text-xs">Utiliza el buscador superior para agregar criptomonedas o activos financieros.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Visual Donut Chart Breakdown & Portfolio Insights */}
        <div className="lg:col-span-4 space-y-4">
          {/* Donut Chart with Recharts */}
          <div className="p-5 rounded-2xl bg-[#0A0E17] border border-[#1E293B] space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
                <PieChartIcon className="w-3.5 h-3.5 text-[#F7931A]" />
                <span>Distribución Visual</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                100% Ponderado
              </span>
            </div>

            <div className="h-56 w-full flex items-center justify-center">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {pieData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={ASSET_PIE_COLORS[index % ASSET_PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="p-2.5 rounded-lg bg-[#0A0E17] border border-slate-700 shadow-xl font-mono text-xs">
                              <span className="text-white font-bold">{data.name}: </span>
                              <span className="text-amber-300 font-bold">${Math.round(data.value).toLocaleString()} USD</span>
                              <div className="text-slate-400 text-[10px] mt-0.5">
                                Asignación: {data.percent}%
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-slate-500 font-mono">Sin activos asignados</div>
              )}
            </div>

            {/* Asset Legend Badges */}
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800">
              {pieData.map((item, idx) => (
                <div
                  key={item.name}
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#0F172A] border border-slate-800 text-[11px] font-mono"
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: ASSET_PIE_COLORS[idx % ASSET_PIE_COLORS.length] }}
                  />
                  <span className="text-white font-bold">{item.name}</span>
                  <span className="text-slate-400">{item.percent}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quantitative Methodology & Sovereign Advice Note */}
          <div className="p-4 rounded-xl bg-[#080B10] border border-slate-800 text-xs font-mono space-y-2 text-slate-400">
            <div className="flex items-center gap-2 text-slate-200 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Metodología de Riesgo Cuantitativo</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              El motor calcula matrices de covarianza ponderadas y simula el impacto en el ratio Sharpe (tasa Rf = 4.5%), Sortino (downside semi-variance) y el VaR al 95% para horizontes de 1 día.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
