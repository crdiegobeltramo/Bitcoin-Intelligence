import React, { useEffect, useRef, useState } from 'react';
import { BitcoinMarketData } from '../../types';
import { Maximize2, Minimize2 } from 'lucide-react';

interface TradingViewWidgetProps {
  marketData: BitcoinMarketData | null;
}

export const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ marketData }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      // @ts-expect-error TradingView global injected by script
      if (typeof window.TradingView !== 'undefined' && containerRef.current) {
        // @ts-expect-error TradingView global constructor
        new window.TradingView.widget({
          autosize: true,
          symbol: 'BINANCE:BTCUSDT',
          interval: 'D',
          timezone: 'Etc/UTC',
          theme: 'dark',
          style: '1', // Candles
          locale: 'es',
          enable_publishing: false,
          allow_symbol_change: true,
          container_id: containerRef.current.id,
          hide_side_toolbar: false,
          studies: ['RSI@tv-basicstudies', 'MASimple@tv-basicstudies'],
          backgroundColor: '#080B10',
          gridColor: '#1E293B',
        });
      }
    };

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [isFullscreen]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      className={`bg-[#0A0E17] border border-[#1E293B] rounded-xl overflow-hidden flex flex-col ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : 'w-full'
      }`}
    >
      {/* Top metrics bar around TradingView chart */}
      <div className="px-4 py-3 bg-[#0C1322] border-b border-[#1E293B] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 flex-wrap font-mono-nums">
          <div>
            <span className="text-slate-500 mr-1.5">PAR:</span>
            <span className="text-white font-bold">BTC / USD (Tether)</span>
          </div>
          {marketData && (
            <>
              <div>
                <span className="text-slate-500 mr-1.5">PRECIO:</span>
                <span className="text-white font-semibold">
                  ${marketData.btcUsd.toLocaleString('en-US')}
                </span>
              </div>
              <div>
                <span className="text-slate-500 mr-1.5">24H:</span>
                <span
                  className={`font-medium ${
                    marketData.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {marketData.change24h >= 0 ? '+' : ''}
                  {marketData.change24h}%
                </span>
              </div>
              <div className="hidden sm:block">
                <span className="text-slate-500 mr-1.5">VOLUMEN 24H:</span>
                <span className="text-slate-300">
                  ${(marketData.volume24h / 1e9).toFixed(2)} B
                </span>
              </div>
              <div className="hidden md:block">
                <span className="text-slate-500 mr-1.5">DOMINANCIA:</span>
                <span className="text-[#F7931A] font-semibold">{marketData.dominance}%</span>
              </div>
              <div className="hidden lg:block">
                <span className="text-slate-500 mr-1.5">MARKET CAP:</span>
                <span className="text-slate-300">
                  ${(marketData.marketCap / 1e12).toFixed(2)} T
                </span>
              </div>
            </>
          )}
        </div>

        <button
          onClick={toggleFullscreen}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-[#1E293B]/60 hover:bg-[#1E293B] transition-colors"
          title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{isFullscreen ? 'Minimizar' : 'Pantalla Completa'}</span>
        </button>
      </div>

      {/* Embedded Chart Canvas */}
      <div className="relative w-full h-[520px] bg-[#080B10]">
        <div id="tradingview_btc_widget" ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  );
};
