export interface McpToolDefinition {
  name: string;
  description: string;
  readOnly: boolean;
  requiresAuthorization: boolean;
  inputSchema: Record<string, any>;
  exampleOutput: Record<string, any>;
}

export const MCP_DEFI_TOOLS: McpToolDefinition[] = [
  {
    name: 'defi.get_market_prices',
    description: 'Obtiene cotizaciones spot y reservas en vivo entre DEXs (PancakeSwap, Uniswap, BiSwap).',
    readOnly: true,
    requiresAuthorization: false,
    inputSchema: { chainId: 'number', tokenA: 'string', tokenB: 'string' },
    exampleOutput: { price: 620.45, spreadBps: 28, timestamp: 1718000000 },
  },
  {
    name: 'defi.scan_arbitrage_routes',
    description: 'Escanea ineficiencias de precios, arbitraje directo y triangular compatibles con flash loans.',
    readOnly: true,
    requiresAuthorization: false,
    inputSchema: { chainId: 'number', minProfitUsd: 'number', maxHops: 'number' },
    exampleOutput: { opportunitiesFound: 3, topNetProfitUsd: 46.20 },
  },
  {
    name: 'defi.get_flash_loan_terms',
    description: 'Consulta comisiones, interfaces de callback y disponibilidad de liquidez del proveedor.',
    readOnly: true,
    requiresAuthorization: false,
    inputSchema: { provider: 'string', tokenAddress: 'string', amount: 'number' },
    exampleOutput: { feePercent: 0.05, repaymentAmount: 100050, interface: 'IPool' },
  },
  {
    name: 'defi.estimate_gas',
    description: 'Estima unidades de cómputo y costo en divisa nativa para la ruta multicall.',
    readOnly: true,
    requiresAuthorization: false,
    inputSchema: { chainId: 'number', routeHops: 'array' },
    exampleOutput: { gasUnits: 245000, gasCostUsd: 0.38 },
  },
  {
    name: 'defi.simulate_transaction',
    description: 'Ejecuta simulación dry-run atómica (eth_call) validando repago e invariantes.',
    readOnly: true,
    requiresAuthorization: false,
    inputSchema: { opportunityId: 'string', simulationMode: 'string' },
    exampleOutput: { success: true, repaymentVerified: true, simulatedProfitUsd: 46.20 },
  },
  {
    name: 'defi.analyze_contract_risk',
    description: 'Verifica seguridad de tokens (honeypots, transfer taxes, funciones pausables).',
    readOnly: true,
    requiresAuthorization: false,
    inputSchema: { tokenAddress: 'string', chainId: 'number' },
    exampleOutput: { isSafe: true, hasTransferTax: false, honeypotScore: 0 },
  },
  {
    name: 'wallet.get_balances',
    description: 'Consulta balances de activos y saldo nativo en la Wallet 3.0 activa.',
    readOnly: true,
    requiresAuthorization: false,
    inputSchema: { address: 'string', chainId: 'number' },
    exampleOutput: { nativeBalance: '0.85 BNB', usdt: '12,500.00' },
  },
  {
    name: 'wallet.get_allowances',
    description: 'Comprueba permisos concedidos a contratos de arbitraje.',
    readOnly: true,
    requiresAuthorization: false,
    inputSchema: { owner: 'string', spender: 'string', token: 'string' },
    exampleOutput: { allowance: '100,000.00', isRevocable: true },
  },
  {
    name: 'execution.submit_authorized_transaction',
    description: 'Envía transacción a mempool tras superar las 14 reglas del Autonomous Policy Engine.',
    readOnly: false,
    requiresAuthorization: true,
    inputSchema: { opportunityId: 'string', policyValidationSignature: 'string' },
    exampleOutput: { txHash: '0x3a9...4f2', status: 'SUBMITTED' },
  },
  {
    name: 'execution.emergency_stop',
    description: 'Activa el KILL SWITCH de emergencia y congela inmediatamente toda actividad.',
    readOnly: false,
    requiresAuthorization: true,
    inputSchema: { reason: 'string' },
    exampleOutput: { killSwitchActive: true, status: 'FROZEN' },
  },
];

export interface A2AMessage {
  protocol: 'A2A-v1.0';
  senderAgent: string;
  recipientAgent: string;
  messageType: 'OPPORTUNITY_BROADCAST' | 'RISK_VALIDATION_REQ' | 'EXECUTION_INTENT' | 'AUDIT_CONFIRM';
  timestamp: string;
  payload: Record<string, any>;
  signature: string;
}

export class McpDeFiGateway {
  public static listTools(): McpToolDefinition[] {
    return MCP_DEFI_TOOLS;
  }

  public static createA2AMessage(
    recipient: string,
    messageType: A2AMessage['messageType'],
    payload: Record<string, any>
  ): A2AMessage {
    return {
      protocol: 'A2A-v1.0',
      senderAgent: 'DeFi Flash Loan Intelligence Agent',
      recipientAgent: recipient,
      messageType,
      timestamp: new Date().toISOString(),
      payload,
      signature: `a2a_sig_${Math.random().toString(36).slice(2, 10)}`,
    };
  }
}
