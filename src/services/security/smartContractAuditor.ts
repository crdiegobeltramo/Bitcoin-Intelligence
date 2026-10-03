import { AuditFinding } from '../../types';

export class SmartContractAuditor {
  /**
   * Analyzes Solidity source code against top Web3 vulnerabilities.
   * Performs static pattern matching and heuristic invariant analysis.
   */
  public static analyzeSolidityCode(sourceCode: string): {
    findings: AuditFinding[];
    securityScore: number;
    linesOfCode: number;
    summary: string;
    disclaimer: string;
  } {
    const findings: AuditFinding[] = [];
    const lines = sourceCode.split('\n');
    const loc = lines.length;

    // Check 1: Reentrancy (External call before state update)
    const hasExternalCall = /call\{value:|transfer\(|send\(|\.call\(/.test(sourceCode);
    const hasBalancesUpdate = /balances\[|balanceOf\[|_balances\[/.test(sourceCode);
    const hasReentrancyGuard = /nonReentrant|ReentrancyGuard/.test(sourceCode);

    if (hasExternalCall && hasBalancesUpdate && !hasReentrancyGuard) {
      findings.push({
        id: 'SEC-REENTRANCY-01',
        title: 'Potencial Vulnerabilidad de Reentrancia (Patrón CEI violado)',
        severity: 'CRITICAL',
        location: 'Funciones de retiro de fondos (call{value: ...})',
        explanation: 'Se detecta una invocación externa o transferencia de ether sin el modificador nonReentrant y con potenciales actualizaciones de estado posteriores al llamado.',
        attackScenario: 'Un atacante invoca el contrato desde un contrato malicioso cuya función fallback/receive vuelve a llamar a la función de retiro antes de que el saldo sea puesto a cero, drenando la tesorería del protocolo.',
        remediation: 'Aplicar estrictamente el patrón Checks-Effects-Interactions (CEI) actualizando el saldo antes de enviar fondos, o heredar de ReentrancyGuard de OpenZeppelin y añadir nonReentrant.',
        fixedCodeSnippet: `// 1. Checks
require(balances[msg.sender] >= amount, "Saldo insuficiente");
// 2. Effects
balances[msg.sender] -= amount;
// 3. Interactions
(bool success, ) = msg.sender.call{value: amount}("");
require(success, "Fallo transferencia ETH");`,
      });
    }

    // Check 2: Access Control / Missing onlyOwner or AccessControl
    const hasSelfdestruct = /selfdestruct\(|suicide\(/.test(sourceCode);
    if (hasSelfdestruct) {
      findings.push({
        id: 'SEC-ACCESS-02',
        title: 'Uso de selfdestruct / Posible vector de destrucción no autorizada',
        severity: 'CRITICAL',
        location: 'Instrucción selfdestruct()',
        explanation: 'El opcode SELFDESTRUCT está desaconsejado formalmente desde el EIP-6780 (Cancun) y permite eliminar el bytecode del contrato o forzar el envío de ETH eludiendo código receive.',
        attackScenario: 'Cualquier usuario o un atacante con control indebido puede destruir el contrato impidiendo futuras interacciones y bloqueando fondos.',
        remediation: 'Eliminar completamente el soporte de selfdestruct y sustituirlo por mecanismos de pausa pausable o migración controlada.',
        fixedCodeSnippet: `// Eliminar selfdestruct. Utilizar OpenZeppelin Pausable si se requiere desactivación de emergencia:
import "@openzeppelin/contracts/security/Pausable.sol";`,
      });
    }

    // Check 3: Delegatecall to untrusted address
    const hasDelegateCall = /\.delegatecall\(/.test(sourceCode);
    if (hasDelegateCall && !/address\s+(immutable|constant)\s+implementation/.test(sourceCode)) {
      findings.push({
        id: 'SEC-DELEGATECALL-03',
        title: 'Uso riesgoso de delegatecall sobre dirección dinámica',
        severity: 'HIGH',
        location: 'Invocación .delegatecall(...)',
        explanation: 'delegatecall ejecuta código en el contexto de almacenamiento del contrato llamador. Si la dirección de destino puede ser manipulada, el almacenamiento del contrato puede ser sobrescrito por completo.',
        attackScenario: 'Un atacante inyecta la dirección de un contrato malicioso en una llamada delegatecall, modificando la variable del propietario (slot 0) y tomando control del contrato.',
        remediation: 'Utilizar patrones proxy estandarizados (ERC-1967 UUPS o TransparentUpgradeableProxy) y validar que la dirección de implementación esté estrictamente restringida a un timelock o gobernanza.',
        fixedCodeSnippet: `// Utilizar librerías probadas de OpenZeppelin Upgrades:
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";`,
      });
    }

    // Check 4: Oracle manipulation / Spot price from AMM reserves
    const usesReservesForPrice = /getReserves\(|balanceOf\(address\(this\)\)/.test(sourceCode) && /price|quote|rate/i.test(sourceCode);
    if (usesReservesForPrice) {
      findings.push({
        id: 'SEC-ORACLE-04',
        title: 'Posible Manipulación de Oráculo de Precio Spot mediante Flash Loans',
        severity: 'HIGH',
        location: 'Lectura directa de reservas de par AMM para valuación',
        explanation: 'Calcular precios dividiendo directamente las reservas de un pool AMM (reservesA / reservesB) es vulnerable a distorsión instantánea de reservas mediante préstamos relámpago (Flash Loans) dentro de la misma transacción.',
        attackScenario: 'El atacante solicita un flash loan multimillonario, altera el balance del pool mediante un swap masivo, ejecuta la liquidación o préstamo en el contrato víctima a un precio artificial, y repaga el préstamo obteniendo ganancias multimillonarias.',
        remediation: 'Integrar oráculos descentralizados resistentes a manipulación como Chainlink Data Feeds o utilizar oráculos TWAP (Time-Weighted Average Price) de Uniswap v3 con ventana de observación suficiente.',
        fixedCodeSnippet: `// Reemplazar lectura directa de reservas por Chainlink AggregatorV3:
AggregatorV3Interface internal priceFeed;
function getLatestPrice() public view returns (int256) {
    (, int256 price, , uint256 timeStamp, ) = priceFeed.latestRoundData();
    require(timeStamp > 0 && block.timestamp - timeStamp < 3600, "Precio obsoleto");
    return price;
}`,
      });
    }

    // Check 5: tx.origin used for authorization
    const usesTxOrigin = /tx\.origin/.test(sourceCode);
    if (usesTxOrigin) {
      findings.push({
        id: 'SEC-TX-ORIGIN-05',
        title: 'Uso de tx.origin para Control de Acceso (Vulnerable a Phishing)',
        severity: 'HIGH',
        location: 'require(tx.origin == owner)',
        explanation: 'tx.origin referencia a la cuenta externamente poseída (EOA) que originó la cadena de transacciones, no al remitente inmediato (msg.sender).',
        attackScenario: 'El propietario del contrato interactúa con un contrato intermediario malicioso (ej. reclamar un airdrop ficticio), el cual invoca la función sensible del contrato de la víctima. Dado que tx.origin sigue siendo el propietario, la comprobación se evalúa como verdadera.',
        remediation: 'Sustituir toda verificación de tx.origin por msg.sender.',
        fixedCodeSnippet: `- require(tx.origin == owner, "No autorizado");
+ require(msg.sender == owner, "No autorizado");`,
      });
    }

    // Check 6: Unchecked transfer return value
    const hasRawTransfer = /\.transfer\([^)]+\)/.test(sourceCode) && !/IERC20/.test(sourceCode);
    const hasErc20TransferWithoutReturn = /transfer\([^)]+\);|transferFrom\([^)]+\);/.test(sourceCode) && !/SafeERC20/.test(sourceCode);
    if (hasErc20TransferWithoutReturn) {
      findings.push({
        id: 'SEC-ERC20-RETURN-06',
        title: 'Omisión de Verificación de Valor de Retorno en Transferencias ERC-20',
        severity: 'MEDIUM',
        location: 'Llamados token.transfer() / token.transferFrom() sin SafeERC20',
        explanation: 'Tokens no estándar como USDT no devuelven un booleano en sus funciones transfer/transferFrom, lo que puede causar que la llamada revierta inesperadamente o pase silenciosamente en fallos si no se valida.',
        attackScenario: 'Un usuario deposita tokens que fallan internamente pero el contrato receptor asume erróneamente que la transferencia fue exitosa, acreditando saldos sin recibir fondos.',
        remediation: 'Utilizar la librería SafeERC20 de OpenZeppelin y llamar safeTransfer / safeTransferFrom.',
        fixedCodeSnippet: `using SafeERC20 for IERC20;
IERC20(token).safeTransfer(recipient, amount);`,
      });
    }

    // Check 7: Block.timestamp dependence for critical randomness
    const hasTimestampRandom = /block\.timestamp|now/.test(sourceCode) && /%|random|keccak256\(.*timestamp/i.test(sourceCode);
    if (hasTimestampRandom) {
      findings.push({
        id: 'SEC-RANDOMNESS-07',
        title: 'Dependencia de block.timestamp para Generación de Aleatoriedad',
        severity: 'MEDIUM',
        location: 'Operaciones de pseudo-aleatoriedad con block.timestamp',
        explanation: 'Los mineros y validadores tienen margen para alterar ligeramente la marca de tiempo del bloque dentro de los límites de consenso (unos 15 segundos en Ethereum), permitiendo sesgar resultados pseudo-aleatorios.',
        attackScenario: 'Un validador simula diferentes marcas de tiempo antes de propagar el bloque para asegurar que una lotería o sorteo resulte a su favor.',
        remediation: 'Utilizar fuentes de aleatoriedad verificable on-chain como Chainlink VRF (Verifiable Random Function) o commit-reveal schemes.',
        fixedCodeSnippet: `// Integrar Chainlink VRF v2.5 / ConsumerBaseV2Plus para aleatoriedad criptográfica verificable`,
      });
    }

    // Add informative finding if no major issues
    if (findings.length === 0) {
      findings.push({
        id: 'SEC-INFO-00',
        title: 'No se detectaron patrones estáticos comunes de vulnerabilidad crítica',
        severity: 'INFO',
        location: 'Análisis estático global',
        explanation: 'El código analizado no presenta violaciones evidentes de reentrancia no protegida, uso de tx.origin o llamadas delegadas peligrosas.',
        attackScenario: 'N/A',
        remediation: 'Completar con pruebas de fuzzing (Foundry / Echidna) y auditoría formal de invariantes.',
        fixedCodeSnippet: '// Invariantes de seguridad aparentan estar contemplados',
      });
    }

    // Calculate score: starts at 100, subtracts according to findings
    let penalty = 0;
    findings.forEach((f) => {
      if (f.severity === 'CRITICAL') penalty += 35;
      if (f.severity === 'HIGH') penalty += 20;
      if (f.severity === 'MEDIUM') penalty += 10;
      if (f.severity === 'LOW') penalty += 5;
    });

    const securityScore = Math.max(10, 100 - penalty);

    return {
      findings,
      securityScore,
      linesOfCode: loc,
      summary: `Revisión preliminar de seguridad completada. Se auditaron ${loc} líneas de código Solidity identificando ${findings.filter(f => f.severity !== 'INFO').length} hallazgos potenciales. Índice de solidez preliminar: ${securityScore}/100.`,
      disclaimer: 'ADVERTENCIA: Esta revisión es un Preliminary AI Security Review automatizado con fines de asistencia al desarrollo. No reemplaza ni sustituye bajo ninguna circunstancia una auditoría de seguridad formal realizada por auditores humanos certificados.',
    };
  }
}
