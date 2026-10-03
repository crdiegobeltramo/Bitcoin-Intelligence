import { OpenZeppelinWizardConfig } from '../../types';

export class OpenZeppelinWizard {
  /**
   * Generates production-grade OpenZeppelin Contracts v5.0 code dynamically
   */
  public static generateContract(config: OpenZeppelinWizardConfig): {
    solidityCode: string;
    imports: string[];
    features: string[];
    securityAuditNotes: string[];
  } {
    const {
      standard,
      name,
      symbol,
      premint,
      baseUri,
      accessControl,
      pausable,
      burnable,
      mintable,
      permit,
      votes,
      flashMint,
      enumerable,
      uriStorage,
      upgradeability,
    } = config;

    const imports: string[] = [];
    const inheritances: string[] = [];
    const features: string[] = [];
    const securityAuditNotes: string[] = [];

    const isUpgrade = upgradeability !== 'none';
    const ozBase = isUpgrade ? '@openzeppelin/contracts-upgradeable' : '@openzeppelin/contracts';

    if (standard === 'ERC20') {
      if (!isUpgrade) {
        imports.push(`${ozBase}/token/ERC20/ERC20.sol`);
        inheritances.push(`ERC20("${name}", "${symbol}")`);
      } else {
        imports.push(`${ozBase}/token/ERC20/ERC20Upgradeable.sol`);
        inheritances.push('ERC20Upgradeable');
      }
      features.push(`Estándar Fungible ERC-20: ${name} (${symbol})`);

      if (burnable) {
        imports.push(`${ozBase}/token/ERC20/extensions/ERC20Burnable${isUpgrade ? 'Upgradeable' : ''}.sol`);
        inheritances.push(`ERC20Burnable${isUpgrade ? 'Upgradeable' : ''}`);
        features.push('Quema de tokens (Burnable)');
      }

      if (pausable) {
        imports.push(`${ozBase}/utils/Pausable${isUpgrade ? 'Upgradeable' : ''}.sol`);
        inheritances.push(`Pausable${isUpgrade ? 'Upgradeable' : ''}`);
        features.push('Pausa de emergencia (Pausable)');
        securityAuditNotes.push('Permite detener transferencias en caso de incidente de seguridad o exploit.');
      }

      if (permit) {
        imports.push(`${ozBase}/token/ERC20/extensions/ERC20Permit${isUpgrade ? 'Upgradeable' : ''}.sol`);
        inheritances.push(`ERC20Permit${isUpgrade ? 'Upgradeable' : ''}("${name}")`);
        features.push('Aprobaciones sin gas EIP-2612 (Permit)');
        securityAuditNotes.push('Protegido frente a replay attacks mediante DOMAIN_SEPARATOR y nonces deterministas.');
      }

      if (votes) {
        imports.push(`${ozBase}/token/ERC20/extensions/ERC20Votes${isUpgrade ? 'Upgradeable' : ''}.sol`);
        inheritances.push(`ERC20Votes${isUpgrade ? 'Upgradeable' : ''}`);
        features.push('Gobernanza on-chain con checkpoints de voto (Votes)');
      }

      if (flashMint) {
        imports.push(`${ozBase}/token/ERC20/extensions/ERC20FlashMint${isUpgrade ? 'Upgradeable' : ''}.sol`);
        inheritances.push(`ERC20FlashMint${isUpgrade ? 'Upgradeable' : ''}`);
        features.push('Préstamos relámpago nativos EIP-3156 (FlashMint)');
      }
    } else if (standard === 'ERC721') {
      if (!isUpgrade) {
        imports.push(`${ozBase}/token/ERC721/ERC721.sol`);
        inheritances.push(`ERC721("${name}", "${symbol}")`);
      } else {
        imports.push(`${ozBase}/token/ERC721/ERC721Upgradeable.sol`);
        inheritances.push('ERC721Upgradeable');
      }
      features.push(`Estándar NFT No Fungible ERC-721: ${name} (${symbol})`);

      if (enumerable) {
        imports.push(`${ozBase}/token/ERC721/extensions/ERC721Enumerable${isUpgrade ? 'Upgradeable' : ''}.sol`);
        inheritances.push(`ERC721Enumerable${isUpgrade ? 'Upgradeable' : ''}`);
        features.push('Enumeración on-chain (Enumerable)');
        securityAuditNotes.push('Aumenta el consumo de gas en acuñación y transferencias por mantenimiento de índices.');
      }

      if (uriStorage) {
        imports.push(`${ozBase}/token/ERC721/extensions/ERC721URIStorage${isUpgrade ? 'Upgradeable' : ''}.sol`);
        inheritances.push(`ERC721URIStorage${isUpgrade ? 'Upgradeable' : ''}`);
        features.push('Metadatos individuales por token (URIStorage)');
      }

      if (pausable) {
        imports.push(`${ozBase}/utils/Pausable${isUpgrade ? 'Upgradeable' : ''}.sol`);
        inheritances.push(`Pausable${isUpgrade ? 'Upgradeable' : ''}`);
        features.push('Pausa de emergencia (Pausable)');
      }

      if (burnable) {
        imports.push(`${ozBase}/token/ERC721/extensions/ERC721Burnable${isUpgrade ? 'Upgradeable' : ''}.sol`);
        inheritances.push(`ERC721Burnable${isUpgrade ? 'Upgradeable' : ''}`);
        features.push('Quema de NFTs (Burnable)');
      }
    } else if (standard === 'ERC1155') {
      imports.push(`${ozBase}/token/ERC1155/ERC1155.sol`);
      inheritances.push(`ERC1155("${baseUri || 'https://api.domain.com/metadata/{id}.json'}")`);
      features.push(`Estándar Multi-Token Semi-Fungible ERC-1155: ${name}`);

      if (pausable) {
        imports.push(`${ozBase}/utils/Pausable.sol`);
        inheritances.push('Pausable');
        features.push('Pausa de emergencia (Pausable)');
      }
      if (burnable) {
        imports.push(`${ozBase}/token/ERC1155/extensions/ERC1155Burnable.sol`);
        inheritances.push('ERC1155Burnable');
        features.push('Quema multi-token (Burnable)');
      }
    }

    // Access control
    if (accessControl === 'ownable') {
      imports.push(`${ozBase}/access/Ownable2Step.sol`);
      inheritances.push('Ownable2Step');
      features.push('Control de Acceso en 2 Pasos (Ownable2Step)');
      securityAuditNotes.push('Mitiga pérdida de gobernanza exigiendo aceptación explícita del nuevo propietario.');
    } else if (accessControl === 'roles') {
      imports.push(`${ozBase}/access/AccessControl.sol`);
      inheritances.push('AccessControl');
      features.push('Control de Acceso Basado en Roles (RBAC AccessControl)');
      securityAuditNotes.push('Permite separar el rol de acuñador (MINTER_ROLE) del rol administrador (DEFAULT_ADMIN_ROLE).');
    }

    // Always recommend ReentrancyGuard for complex flows
    imports.push(`${ozBase}/utils/ReentrancyGuard.sol`);
    inheritances.push('ReentrancyGuard');

    // Upgradeability UUPS
    if (upgradeability === 'uups') {
      imports.push(`${ozBase}/proxy/utils/UUPSUpgradeable.sol`);
      inheritances.push('UUPSUpgradeable');
      features.push('Proxy Actualizable ERC-1967 (UUPS Upgradeable)');
      securityAuditNotes.push('Función _authorizeUpgrade estrictamente protegida por control de acceso.');
    }

    // Clean contract name
    const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '') || 'CustomToken';

    // Build Solidity 0.8.24 source
    let code = `// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0)
pragma solidity ^0.8.24;

`;

    // Deduplicate and append imports
    Array.from(new Set(imports)).forEach((imp) => {
      code += `import "${imp}";\n`;
    });

    code += `\n/**
 * @title ${sanitizedName}
 * @dev Generado con OpenZeppelin Contracts v5.0 Studio en Bitcoin Intelligence OS
 * Características: ${features.join(', ')}
 */\n`;

    code += `contract ${sanitizedName} is ${inheritances.map(i => i.split('(')[0]).join(', ')} {\n`;

    // Roles constants if RBAC
    if (accessControl === 'roles') {
      code += `    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");\n`;
      code += `    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");\n\n`;
    }

    // Constructor
    code += `    constructor(address initialOwner) `;
    if (standard === 'ERC20') {
      code += `ERC20("${name}", "${symbol}") `;
      if (permit) code += `ERC20Permit("${name}") `;
    } else if (standard === 'ERC721') {
      code += `ERC721("${name}", "${symbol}") `;
    } else if (standard === 'ERC1155') {
      code += `ERC1155("${baseUri || 'https://metadata.example/{id}.json'}") `;
    }

    if (accessControl === 'ownable') {
      code += `Ownable(initialOwner) `;
    }
    code += `{\n`;

    if (accessControl === 'roles') {
      code += `        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);\n`;
      code += `        _grantRole(MINTER_ROLE, initialOwner);\n`;
      if (pausable) code += `        _grantRole(PAUSER_ROLE, initialOwner);\n`;
    }

    if (standard === 'ERC20' && premint && Number(premint) > 0) {
      code += `        // Emisión inicial (Premint)\n`;
      code += `        _mint(initialOwner, ${premint} * 10 ** decimals());\n`;
    }

    code += `    }\n\n`;

    // Pausable functions
    if (pausable) {
      code += `    function pause() public ${accessControl === 'ownable' ? 'onlyOwner' : 'onlyRole(PAUSER_ROLE)'} {\n`;
      code += `        _pause();\n`;
      code += `    }\n\n`;
      code += `    function unpause() public ${accessControl === 'ownable' ? 'onlyOwner' : 'onlyRole(PAUSER_ROLE)'} {\n`;
      code += `        _unpause();\n`;
      code += `    }\n\n`;
    }

    // Mint function if mintable
    if (mintable) {
      if (standard === 'ERC20') {
        code += `    function mint(address to, uint256 amount) public ${accessControl === 'ownable' ? 'onlyOwner' : 'onlyRole(MINTER_ROLE)'} {\n`;
        code += `        _mint(to, amount);\n`;
        code += `    }\n\n`;
      } else if (standard === 'ERC721') {
        code += `    function safeMint(address to, uint256 tokenId) public ${accessControl === 'ownable' ? 'onlyOwner' : 'onlyRole(MINTER_ROLE)'} {\n`;
        code += `        _safeMint(to, tokenId);\n`;
        code += `    }\n\n`;
      }
    }

    // Overrides required by Solidity
    if (standard === 'ERC20' && (pausable || votes)) {
      code += `    // The following functions are overrides required by Solidity.\n\n`;
      code += `    function _update(address from, address to, uint256 value)\n`;
      code += `        internal\n`;
      code += `        override(ERC20${pausable ? ', Pausable' : ''}${votes ? ', ERC20Votes' : ''})\n`;
      code += `    {\n`;
      code += `        super._update(from, to, value);\n`;
      code += `    }\n\n`;

      if (votes) {
        code += `    function nonces(address owner)\n`;
        code += `        public\n`;
        code += `        view\n`;
        code += `        override(ERC20Permit, Nonces)\n`;
        code += `        returns (uint256)\n`;
        code += `    {\n`;
        code += `        return super.nonces(owner);\n`;
        code += `    }\n\n`;
      }
    }

    // Overrides for ERC721
    if (standard === 'ERC721' && (enumerable || uriStorage || pausable)) {
      code += `    // Overrides required by Solidity\n\n`;
      code += `    function _update(address to, uint256 tokenId, address auth)\n`;
      code += `        internal\n`;
      code += `        override(ERC721${enumerable ? ', ERC721Enumerable' : ''}${pausable ? ', Pausable' : ''})\n`;
      code += `        returns (address)\n`;
      code += `    {\n`;
      code += `        return super._update(to, tokenId, auth);\n`;
      code += `    }\n\n`;

      if (enumerable) {
        code += `    function _increaseBalance(address account, uint128 value)\n`;
        code += `        internal\n`;
        code += `        override(ERC721, ERC721Enumerable)\n`;
        code += `    {\n`;
        code += `        super._increaseBalance(account, value);\n`;
        code += `    }\n\n`;
      }

      if (uriStorage) {
        code += `    function tokenURI(uint256 tokenId)\n`;
        code += `        public\n`;
        code += `        view\n`;
        code += `        override(ERC721, ERC721URIStorage)\n`;
        code += `        returns (string memory)\n`;
        code += `    {\n`;
        code += `        return super.tokenURI(tokenId);\n`;
        code += `    }\n\n`;
      }

      code += `    function supportsInterface(bytes4 interfaceId)\n`;
      code += `        public\n`;
      code += `        view\n`;
      code += `        override(ERC721${enumerable ? ', ERC721Enumerable' : ''}${uriStorage ? ', ERC721URIStorage' : ''}${accessControl === 'roles' ? ', AccessControl' : ''})\n`;
      code += `        returns (bool)\n`;
      code += `    {\n`;
      code += `        return super.supportsInterface(interfaceId);\n`;
      code += `    }\n\n`;
    }

    // UUPS authorize upgrade
    if (upgradeability === 'uups') {
      code += `    function _authorizeUpgrade(address newImplementation)\n`;
      code += `        internal\n`;
      code += `        override\n`;
      code += `        ${accessControl === 'ownable' ? 'onlyOwner' : 'onlyRole(DEFAULT_ADMIN_ROLE)'}\n`;
      code += `    {}\n\n`;
    }

    code += `}\n`;

    return {
      solidityCode: code,
      imports,
      features,
      securityAuditNotes,
    };
  }
}
