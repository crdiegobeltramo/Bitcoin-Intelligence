import { FlashLoanProviderId } from './types';

export interface FlashLoanProviderSpec {
  id: FlashLoanProviderId;
  name: string;
  protocolVersion: string;
  feePercent: number; // in percentage, e.g. 0.05 for 0.05%
  repaymentMultiplier: number; // 1 + fee
  supportedChains: number[]; // 56 (BSC), 1 (ETH), 42161 (Arbitrum), 8453 (Base)
  contractAddresses: Record<number, string>;
  interfaceName: string;
  callbackFunction: string;
  requiresCollateral: boolean;
  supportsAtomicRevert: boolean;
  repaymentCheckFormula: string;
}

export const FLASH_LOAN_PROVIDERS: Record<FlashLoanProviderId, FlashLoanProviderSpec> = {
  'balancer-v2': {
    id: 'balancer-v2',
    name: 'Balancer v2 Vault',
    protocolVersion: 'v2.0',
    feePercent: 0.0, // 0% fee on Balancer v2 flash loans
    repaymentMultiplier: 1.0,
    supportedChains: [1, 42161, 8453, 137],
    contractAddresses: {
      1: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
      42161: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
      8453: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
      137: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    },
    interfaceName: 'IVault',
    callbackFunction: 'receiveFlashLoan(IERC20[] tokens, uint256[] amounts, uint256[] feeAmounts, bytes userData)',
    requiresCollateral: false,
    supportsAtomicRevert: true,
    repaymentCheckFormula: 'repaymentAmount == loanAmount (0% premium)',
  },
  'aave-v3': {
    id: 'aave-v3',
    name: 'Aave v3 Pool',
    protocolVersion: 'v3.1',
    feePercent: 0.05, // 0.05% standard fee on Aave v3
    repaymentMultiplier: 1.0005,
    supportedChains: [1, 42161, 8453, 137, 56],
    contractAddresses: {
      1: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
      42161: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
      8453: '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5',
      56: '0x6807dc4362d1369d604c852ac42f8e1da019a864',
    },
    interfaceName: 'IPool',
    callbackFunction: 'executeOperation(address asset, uint256 amount, uint256 premium, address initiator, bytes params)',
    requiresCollateral: false,
    supportsAtomicRevert: true,
    repaymentCheckFormula: 'repaymentAmount == loanAmount + (loanAmount * 5 / 10000)',
  },
  'pancakeswap-v3': {
    id: 'pancakeswap-v3',
    name: 'PancakeSwap v3 Flash Swap',
    protocolVersion: 'v3.0',
    feePercent: 0.01, // 0.01% on ultra-stable or 0.05% standard
    repaymentMultiplier: 1.0001,
    supportedChains: [56, 1, 8453, 42161],
    contractAddresses: {
      56: '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865',
      1: '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865',
    },
    interfaceName: 'IPancakeV3Pool',
    callbackFunction: 'pancakeV3FlashCallback(uint256 fee0, uint256 fee1, bytes data)',
    requiresCollateral: false,
    supportsAtomicRevert: true,
    repaymentCheckFormula: 'repaymentAmount == loanAmount + feeTier',
  },
  'uniswap-v3': {
    id: 'uniswap-v3',
    name: 'Uniswap v3 Flash Swap',
    protocolVersion: 'v3.0',
    feePercent: 0.05,
    repaymentMultiplier: 1.0005,
    supportedChains: [1, 42161, 8453, 137, 56],
    contractAddresses: {
      1: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
      42161: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
      8453: '0x33128a8fC17869897dcE68Ed026d694621f6FDfD',
    },
    interfaceName: 'IUniswapV3Pool',
    callbackFunction: 'uniswapV3FlashCallback(uint256 fee0, uint256 fee1, bytes data)',
    requiresCollateral: false,
    supportsAtomicRevert: true,
    repaymentCheckFormula: 'repaymentAmount == loanAmount + poolFee',
  },
  'dodo': {
    id: 'dodo',
    name: 'DODO PMM Flash Loan',
    protocolVersion: 'v2.0',
    feePercent: 0.0, // 0% fee on DODO private pools
    repaymentMultiplier: 1.0,
    supportedChains: [56, 1, 42161, 137],
    contractAddresses: {
      56: '0x8F8Dd7DB1bDA5eD3da8C9daf3bfa471c12d58486',
      1: '0xa356867fDCE5e7146385691d663fb922F1a03aF0',
    },
    interfaceName: 'IDODOPrivatePool',
    callbackFunction: 'dodoFlashLoan(address assetToBorrow, uint256 amountToBorrow, address target, bytes data)',
    requiresCollateral: false,
    supportsAtomicRevert: true,
    repaymentCheckFormula: 'repaymentAmount == loanAmount (0% premium)',
  },
};

export class FlashLoanProviderAdapter {
  public static getProvider(id: FlashLoanProviderId): FlashLoanProviderSpec {
    return FLASH_LOAN_PROVIDERS[id] || FLASH_LOAN_PROVIDERS['aave-v3'];
  }

  public static calculateRepaymentCost(
    providerId: FlashLoanProviderId,
    amount: number
  ): { feeAmount: number; totalRepayment: number; feePercent: number } {
    const spec = this.getProvider(providerId);
    const feeAmount = Number((amount * (spec.feePercent / 100)).toFixed(6));
    const totalRepayment = Number((amount + feeAmount).toFixed(6));
    return {
      feeAmount,
      totalRepayment,
      feePercent: spec.feePercent,
    };
  }
}
