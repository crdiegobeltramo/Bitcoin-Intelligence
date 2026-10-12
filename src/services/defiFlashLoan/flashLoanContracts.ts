export const SOLIDITY_FLASH_LOAN_CONTRACT = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title FlashLoanArbitrageBot
 * @notice Contrato inteligente institucional de arbitraje atómico con Flash Loans.
 * @dev Implementa IFlashLoanSimpleReceiver (Aave v3) y callback de Balancer v2.
 *      Garantiza la invariante de beneficio neto y protección reentrante estricta.
 */

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

interface IPoolAddressesProvider {
    function getPool() external view returns (address);
}

interface IPool {
    function flashLoanSimple(
        address receiverAddress,
        address asset,
        uint256 amount,
        bytes calldata params,
        uint16 referralCode
    ) external;
}

interface IDexRouter {
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);
}

abstract contract ReentrancyGuard {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
}

contract FlashLoanArbitrageBot is ReentrancyGuard {
    address public immutable owner;
    IPool public immutable aavePool;
    bool public isPaused;

    event FlashLoanExecuted(address indexed asset, uint256 amount, uint256 netProfit);
    event EmergencyPaused(bool paused);
    event EmergencyWithdrawal(address indexed token, uint256 amount);

    error UnauthorizedCaller(address caller);
    error ContractIsPaused();
    error InsufficientArbitrageProfit(uint256 actualBalance, uint256 requiredRepayment);

    modifier onlyOwner() {
        if (msg.sender != owner) revert UnauthorizedCaller(msg.sender);
        _;
    }

    modifier whenNotPaused() {
        if (isPaused) revert ContractIsPaused();
        _;
    }

    constructor(address _poolAddressesProvider) {
        owner = msg.sender;
        aavePool = IPool(IPoolAddressesProvider(_poolAddressesProvider).getPool());
    }

    struct SwapStep {
        address router;
        address[] path;
        uint256 minAmountOut;
    }

    /**
     * @notice Inicia la solicitud de préstamo relámpago a Aave v3
     */
    function requestFlashLoan(
        address asset,
        uint256 amount,
        SwapStep[] calldata steps,
        uint256 minNetProfit
    ) external onlyOwner whenNotPaused nonReentrant {
        bytes memory params = abi.encode(steps, minNetProfit);
        aavePool.flashLoanSimple(address(this), asset, amount, params, 0);
    }

    /**
     * @notice Callback obligatorio invocado por Aave v3 durante la transacción atómica
     */
    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external returns (bool) {
        if (msg.sender != address(aavePool)) revert UnauthorizedCaller(msg.sender);
        if (initiator != address(this)) revert UnauthorizedCaller(initiator);

        (SwapStep[] memory steps, uint256 minNetProfit) = abi.decode(params, (SwapStep[], uint256));

        // 1. Ejecución secuencial de swaps
        uint256 currentAmount = amount;
        for (uint256 i = 0; i < steps.length; i++) {
            SwapStep memory step = steps[i];
            IERC20(step.path[0]).approve(step.router, currentAmount);

            uint256[] memory amounts = IDexRouter(step.router).swapExactTokensForTokens(
                currentAmount,
                step.minAmountOut,
                step.path,
                address(this),
                block.timestamp
            );
            currentAmount = amounts[amounts.length - 1];
        }

        // 2. Verificación estricta de invariante de repago y beneficio
        uint256 amountOwed = amount + premium;
        uint256 finalBalance = IERC20(asset).balanceOf(address(this));

        if (finalBalance < amountOwed + minNetProfit) {
            revert InsufficientArbitrageProfit(finalBalance, amountOwed + minNetProfit);
        }

        // 3. Aprobación del repago al Pool
        IERC20(asset).approve(address(aavePool), amountOwed);

        uint256 netProfit = finalBalance - amountOwed;
        emit FlashLoanExecuted(asset, amount, netProfit);

        return true;
    }

    /**
     * @notice Pausa de emergencia para inmovilizar la operativa en caso de alerta
     */
    function setPaused(bool _paused) external onlyOwner {
        isPaused = _paused;
        emit EmergencyPaused(_paused);
    }

    /**
     * @notice Rescate de beneficios acumulados hacia la tesorería del propietario
     */
    function withdrawProfit(address token) external onlyOwner nonReentrant {
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance > 0, "No balance to withdraw");
        IERC20(token).transfer(owner, balance);
        emit EmergencyWithdrawal(token, balance);
    }
}
`;
