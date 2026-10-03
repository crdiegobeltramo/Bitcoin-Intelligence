import { LearningModule } from '../../types';

export const LEARNING_MODULES: LearningModule[] = [
  {
    id: 'mod-01-foundations',
    level: 'BEGINNER',
    chapter: 'Capítulo 1: Fundamentos Criptográficos y Modelo UTXO',
    title: 'De Cuentas a UTXOs: La Arquitectura de Estado de Bitcoin',
    concept: 'A diferencia de los sistemas bancarios tradicionales y de Ethereum (modelo basado en cuentas con balances globales), Bitcoin utiliza el modelo UTXO (Unspent Transaction Output). Cada transacción consume monedas completas generadas en el pasado y crea nuevos outputs no gastados bloqueados bajo un script de bloqueo (scriptPubKey).',
    practicalExample: 'Si tienes un UTXO de 1.0 BTC y deseas enviar 0.2 BTC, debes consumir el billete completo de 1.0 BTC como input y generar dos outputs: 0.2 BTC para el destinatario y 0.7999 BTC devueltos a una dirección de cambio tuya (la diferencia de 0.0001 BTC se asigna al minero en concepto de tarifa).',
    codeSnippet: `// Representación conceptual de transacción UTXO
struct TxIn {
    uint256 prevTxHash;
    uint32 outputIndex;
    bytes scriptSig; // o witness en SegWit
}
struct TxOut {
    uint64 valueInSatoshis;
    bytes scriptPubKey; // Condiciones de desbloqueo
}`,
    quiz: {
      question: '¿Por qué el modelo UTXO permite mayor paralelismo en la validación que el modelo basado en cuentas?',
      options: [
        'Porque las transacciones independientes que gastan UTXOs distintos pueden validarse simultáneamente sin acceder a un estado mutable global compartido.',
        'Porque en Bitcoin no existen tarifas de transacción.',
        'Porque los bloques se generan cada 10 segundos.',
        'Porque todos los nodos ejecutan la máquina virtual EVM.'
      ],
      correctAnswerIndex: 0,
      explanation: 'En el modelo UTXO, como cada output es independiente e inmutable hasta que se gasta, las transacciones que no compiten por los mismos inputs pueden procesarse y verificarse en hilos concurrentes sin conflictos de lectura/escritura sobre un saldo compartido.',
    },
  },
  {
    id: 'mod-02-segwit-taproot',
    level: 'INTERMEDIATE',
    chapter: 'Capítulo 3: La Evolución del Protocolo: SegWit, Schnorr y Taproot',
    title: 'BIP 340, 341 y 342: Criptografía Schnorr y Tapscript',
    concept: 'Taproot (activado en 2021) reemplazó las firmas ECDSA por firmas Schnorr (BIP 340) y combinó árboles MAST con Merkle Trees de scripts. Gracias a la linealidad de Schnorr, una firma agregada de múltiples participantes (MuSig2) luce idéntica en la cadena a una firma de clave única simple, otorgando indistinguibilidad y ahorro masivo de espacio.',
    practicalExample: 'En una billetera multifirma tradicional 3-de-3 (P2SH), debían revelarse todas las claves públicas y las 3 firmas en la cadena. Con Taproot, los tres participantes cooperan fuera de cadena para sintetizar una única clave agregada y una sola firma Schnorr de 64 bytes. La red solo observa un gasto ordinario de clave única.',
    codeSnippet: `// Taproot Output Key Tweaking (BIP 341)
// Q = P + int(hash_TapTweak(bytes(P) || merkle_root)) * G
// Si no hay scripts ocultos (key-path spending):
// Q = P + int(hash_TapTweak(bytes(P))) * G`,
    quiz: {
      question: '¿Cuál es la principal ventaja de privacidad que introduce Taproot en el gasto cooperativo por key-path?',
      options: [
        'Los mineros no pueden conocer el saldo total de la billetera.',
        'El gasto cooperativo es criptográficamente indistinguible en la blockchain de una transacción de clave única simple.',
        'Oculta completamente el monto enviado en satoshis.',
        'Elimina la necesidad de conexión a internet para firmar.'
      ],
      correctAnswerIndex: 1,
      explanation: 'Al usar key-path spending en Taproot, sólo se publica una clave pública ajustada y una firma Schnorr. Un observador externo no puede distinguir si el UTXO pertenecía a un usuario individual o a un contrato multifirma complejo.',
    },
  },
  {
    id: 'mod-03-smart-contracts',
    level: 'ADVANCED',
    chapter: 'Capítulo 5: Seguridad en Smart Contracts y Patrones EVM',
    title: 'Checks-Effects-Interactions, ReentrancyGuard y Invariantes',
    concept: 'La reentrancia ocurre cuando un contrato transfiere el control de ejecución a un contrato externo no confiable (mediante una llamada con valor o hook de token ERC-777/ERC-1155) antes de actualizar su propio estado interno. La violación del patrón CEI ha sido la causa de pérdidas multimillonarias en la historia de Ethereum.',
    practicalExample: 'El ataque DAO original de 2016 explotó precisamente este orden: el contrato enviaba ETH mediante call y luego deducía el saldo. La función de recepción del atacante volvía a llamar a withdraw repetidamente en la misma transacción hasta vaciar el contrato.',
    codeSnippet: `// Implementación Correcta (CEI + ReentrancyGuard)
function withdraw(uint256 amount) external nonReentrant {
    // 1. Checks
    require(balances[msg.sender] >= amount, "Saldo insuficiente");
    // 2. Effects (Estado actualizado antes del llamado externo)
    balances[msg.sender] -= amount;
    // 3. Interactions
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success, "Fallo transferencia");
}`,
    quiz: {
      question: '¿Por qué transfer() y send() se consideran obsoletos frente a call{value: ...}() a pesar de que limitaban el gas a 2300?',
      options: [
        'Porque call consume menos memoria física en la máquina del minero.',
        'Porque los costos de gas de los opcodes (ej. SLOAD) pueden cambiar en hard forks de la EVM (como EIP-1884), rompiendo contratos que dependían de los 2300 de gas fijos.',
        'Porque Solidity prohibió las funciones payable.',
        'Porque transfer() solo funciona en testnet.'
      ],
      correctAnswerIndex: 1,
      explanation: 'Hard forks como Istanbul cambiaron los costos de gas de lectura de almacenamiento, provocando que 2300 gas fijos ya no fueran suficientes para que el receptor emitiera un evento o ejecutara lógica simple. La recomendación actual es usar call con CEI y ReentrancyGuard.',
    },
  },
  {
    id: 'mod-04-defi-impermanent-loss',
    level: 'EXPERT',
    chapter: 'Capítulo 8: Matemáticas de AMMs y Pérdida Impermanente en DEXs',
    title: 'Deducción Formal de Pérdida Impermanente en Pools x * y = k',
    concept: 'La pérdida impermanente (IL) cuantifica el costo de oportunidad que asume un proveedor de liquidez (LP) frente a la estrategia pasiva de simplemente conservar (HODL) los mismos activos fuera del pool. Si el precio relativo entre el par de tokens cambia en un factor r = P_final / P_inicial, el cociente entre el valor del pool y el valor de la cartera HODL es exactamente: V_LP / V_HODL = (2 * sqrt(r)) / (1 + r).',
    practicalExample: 'Si un token se duplica de precio respecto a la stablecoin del par (r = 2), la razón es (2 * sqrt(2)) / (1 + 2) = 2.8284 / 3 = 0.9428. El LP retiene un 5.72% menos de valor que si hubiera mantenido los tokens intactos en su billetera, déficit que debe compensarse mediante las tarifas de comisión (swap fees) recolectadas.',
    codeSnippet: `// Fórmula analítica de Impermanent Loss
function calculateIL(double priceRatio) returns double {
    return (2.0 * Math.sqrt(priceRatio) / (1.0 + priceRatio)) - 1.0;
}`,
    quiz: {
      question: 'Si el precio relativo de un activo en un pool se multiplica por 5 (r = 5), ¿cuál es aproximadamente la pérdida impermanente teórica para el proveedor de liquidez?',
      options: [
        'Aproximadamente 25.5%',
        'Exactamente 0%',
        '50.0%',
        '100%'
      ],
      correctAnswerIndex: 0,
      explanation: 'Calculando: (2 * sqrt(5)) / (1 + 5) = (2 * 2.236) / 6 = 4.472 / 6 = 0.7453. La pérdida frente a HODL es 1 - 0.7453 = 25.47%.',
    },
  },
];
