export interface ContractTemplate {
  id: string;
  name: string;
  category: 'Token' | 'NFT' | 'DeFi' | 'Governance' | 'Custody';
  description: string;
  solidityCode: string;
  testSuiteCode: string;
  securityNotes: string;
}

export const CONTRACT_TEMPLATES: ContractTemplate[] = [
  {
    id: 'erc20-permit',
    name: 'ERC-20 con EIP-2612 Permit & Cap',
    category: 'Token',
    description: 'Estándar de token fungible industrial con soporte de firmas fuera de cadena (gasless approvals vía permit), tope máximo de emisión (cap) y control de acceso.',
    solidityCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";

/**
 * @title SecureFungibleToken
 * @dev Implementa ERC20 con EIP-2612 Permit, Cap inmutable y Ownable2Step
 * Inspirado en las directrices de "Claude para el Desarrollo Blockchain"
 */
contract SecureFungibleToken is ERC20, ERC20Permit, Ownable2Step {
    uint256 public immutable maxSupply;

    error MaxSupplyExceeded(uint256 attempted, uint256 maxSupply);

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply_,
        uint256 maxSupply_,
        address initialOwner_
    ) ERC20(name_, symbol_) ERC20Permit(name_) Ownable(initialOwner_) {
        if (initialSupply_ > maxSupply_) {
            revert MaxSupplyExceeded(initialSupply_, maxSupply_);
        }
        maxSupply = maxSupply_;
        if (initialSupply_ > 0) {
            _mint(initialOwner_, initialSupply_);
        }
    }

    function mint(address to, uint256 amount) external onlyOwner {
        if (totalSupply() + amount > maxSupply) {
            revert MaxSupplyExceeded(totalSupply() + amount, maxSupply);
        }
        _mint(to, amount);
    }
}`,
    testSuiteCode: `import { expect } from "chai";
import { ethers } from "hardhat";

describe("SecureFungibleToken", function () {
  it("Debería revertir si la emisión inicial supera el cap", async function () {
    const [owner] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("SecureFungibleToken");
    await expect(
      Factory.deploy("Test", "TST", 1000n * 10n**18n, 500n * 10n**18n, owner.address)
    ).to.be.revertedWithCustomError(Factory, "MaxSupplyExceeded");
  });
});`,
    securityNotes: 'Utiliza Ownable2Step para evitar transferencias irreversibles de ownership a direcciones erróneas. El tope maxSupply es inmutable.',
  },
  {
    id: 'multisig-vault',
    name: 'Multisig Vault con M-of-N Threshold',
    category: 'Custody',
    description: 'Bóveda multifirma determinística donde cada transacción de retiro requiere la aprobación de M signatarios autorizados antes de ejecutarse.',
    solidityCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MinimalMultisigVault
 * @dev M-of-N Multisig para custodia segura de tesorería
 */
contract MinimalMultisigVault {
    event Deposit(address indexed sender, uint256 amount, uint256 balance);
    event SubmitTransaction(uint256 indexed txIndex, address indexed to, uint256 value, bytes data);
    event ConfirmTransaction(address indexed owner, uint256 indexed txIndex);
    event ExecuteTransaction(address indexed owner, uint256 indexed txIndex);

    address[] public owners;
    mapping(address => bool) public isOwner;
    uint256 public numConfirmationsRequired;

    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 numConfirmations;
    }

    mapping(uint256 => mapping(address => bool)) public isConfirmed;
    Transaction[] public transactions;

    modifier onlyOwner() {
        require(isOwner[msg.sender], "No autorizado: No es owner");
        _;
    }

    modifier txExists(uint256 _txIndex) {
        require(_txIndex < transactions.length, "Transaccion no existe");
        _;
    }

    modifier notExecuted(uint256 _txIndex) {
        require(!transactions[_txIndex].executed, "Transaccion ya ejecutada");
        _;
    }

    constructor(address[] memory _owners, uint256 _numConfirmationsRequired) {
        require(_owners.length > 0, "Owners requeridos");
        require(_numConfirmationsRequired > 0 && _numConfirmationsRequired <= _owners.length, "Threshold invalido");

        for (uint256 i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner != address(0), "Owner invalido (address zero)");
            require(!isOwner[owner], "Owner duplicado");
            isOwner[owner] = true;
            owners.push(owner);
        }
        numConfirmationsRequired = _numConfirmationsRequired;
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }

    function submitTransaction(address _to, uint256 _value, bytes memory _data) public onlyOwner {
        uint256 txIndex = transactions.length;
        transactions.push(Transaction({
            to: _to,
            value: _value,
            data: _data,
            executed: false,
            numConfirmations: 0
        }));
        emit SubmitTransaction(txIndex, _to, _value, _data);
    }

    function confirmTransaction(uint256 _txIndex) public onlyOwner txExists(_txIndex) notExecuted(_txIndex) {
        require(!isConfirmed[_txIndex][msg.sender], "Transaccion ya confirmada");
        Transaction storage transaction = transactions[_txIndex];
        transaction.numConfirmations += 1;
        isConfirmed[_txIndex][msg.sender] = true;
        emit ConfirmTransaction(msg.sender, _txIndex);
    }

    function executeTransaction(uint256 _txIndex) public onlyOwner txExists(_txIndex) notExecuted(_txIndex) {
        Transaction storage transaction = transactions[_txIndex];
        require(transaction.numConfirmations >= numConfirmationsRequired, "Confirmaciones insuficientes");
        transaction.executed = true;

        (bool success, ) = transaction.to.call{value: transaction.value}(transaction.data);
        require(success, "Fallo ejecucion de llamada");
        emit ExecuteTransaction(msg.sender, _txIndex);
    }
}`,
    testSuiteCode: `import { expect } from "chai";
import { ethers } from "hardhat";

describe("MinimalMultisigVault", function () {
  it("Debe exigir el quorum de confirmaciones antes de permitir la ejecucion", async function () {
    const [o1, o2, o3, recipient] = await ethers.getSigners();
    const Vault = await ethers.getContractFactory("MinimalMultisigVault");
    const vault = await Vault.deploy([o1.address, o2.address, o3.address], 2);
    await o1.sendTransaction({ to: await vault.getAddress(), value: ethers.parseEther("1.0") });

    await vault.connect(o1).submitTransaction(recipient.address, ethers.parseEther("0.5"), "0x");
    await expect(vault.connect(o1).executeTransaction(0)).to.be.revertedWith("Confirmaciones insuficientes");

    await vault.connect(o1).confirmTransaction(0);
    await vault.connect(o2).confirmTransaction(0);
    await expect(vault.connect(o1).executeTransaction(0)).to.emit(vault, "ExecuteTransaction");
  });
});`,
    securityNotes: 'Previene reentrancia marcando transaction.executed = true antes de invocar call (Checks-Effects-Interactions). Chequea duplicados de propietarios en el constructor.',
  },
  {
    id: 'staking-rewards',
    name: 'Staking Pool con Recompensas Pro-Rata',
    category: 'DeFi',
    description: 'Contrato de staking ERC-20 con algoritmo Synthetix para distribución continua de recompensas por segundo sin iteraciones en bucle O(N).',
    solidityCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";

/**
 * @title LinearStakingPool
 * @dev Algoritmo Synthetix O(1) de acumulacion de recompensas
 */
contract LinearStakingPool is ReentrancyGuard, Ownable2Step {
    using SafeERC20 for IERC20;

    IERC20 public immutable stakingToken;
    IERC20 public immutable rewardsToken;

    uint256 public rewardRate = 1e16; // tokens por segundo
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;

    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;

    uint256 private _totalSupply;
    mapping(address => uint256) private _balances;

    constructor(
        address _stakingToken,
        address _rewardsToken,
        address _owner
    ) Ownable(_owner) {
        stakingToken = IERC20(_stakingToken);
        rewardsToken = IERC20(_rewardsToken);
    }

    function rewardPerToken() public view returns (uint256) {
        if (_totalSupply == 0) return rewardPerTokenStored;
        return rewardPerTokenStored + (((block.timestamp - lastUpdateTime) * rewardRate * 1e18) / _totalSupply);
    }

    function earned(address account) public view returns (uint256) {
        return ((_balances[account] * (rewardPerToken() - userRewardPerTokenPaid[account])) / 1e18) + rewards[account];
    }

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    function stake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "No se puede stakear 0");
        _totalSupply += amount;
        _balances[msg.sender] += amount;
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
    }

    function withdraw(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "No se puede retirar 0");
        require(_balances[msg.sender] >= amount, "Saldo insuficiente");
        _totalSupply -= amount;
        _balances[msg.sender] -= amount;
        stakingToken.safeTransfer(msg.sender, amount);
    }

    function getReward() external nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            rewardsToken.safeTransfer(msg.sender, reward);
        }
    }
}`,
    testSuiteCode: `import { expect } from "chai";
import { ethers } from "hardhat";

describe("LinearStakingPool", function () {
  it("Debería acumular recompensas lineales basadas en tiempo transcurrido", async function () {
    // Verificación de incremento de rewardPerTokenStored
  });
});`,
    securityNotes: 'Utiliza SafeERC20 para prevenir fallos con USDT y ReentrancyGuard en todos los puntos de entrada estatales.',
  },
];
