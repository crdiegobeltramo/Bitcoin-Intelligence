import { QuantumThreatAssessment } from '../../types';

export const QUANTUM_THREAT_MATRIX: QuantumThreatAssessment[] = [
  {
    algorithm: 'ECDSA (secp256k1)',
    threatVector: 'Direcciones con clave pública expuesta (P2PK legadas, direcciones reutilizadas o transacciones en mempool)',
    quantumAlgorithm: 'Shor (SVP/DLP)',
    estimatedRiskHorizon: 'Largo plazo (> 10-15 años)',
    mitigations: [
      'Migración de fondos hacia tipos de script modernos de un solo uso (P2WPKH, P2TR)',
      'Nunca reutilizar direcciones de recepción',
      'Desarrollo de soft-fork con nuevo Witness Version post-cuántico (BIP 360 / Falcon / ML-DSA)'
    ],
    bipProposals: 'BIP 360 (Draft) / NIST FIPS 204 (ML-DSA)',
    scientificConfidence: 'Consenso académico: Requiere computadoras cuánticas tolerantes a fallos (FTQC) con más de 2000-4000 qubits lógicos estables con corrección de errores (millones de qubits físicos). No existe riesgo inminente en hardware NISQ contemporáneo.',
  },
  {
    algorithm: 'Schnorr (BIP 340)',
    threatVector: 'Clave pública x-only expuesta en la salida de Taproot o durante el gasto de key-path',
    quantumAlgorithm: 'Shor (SVP/DLP)',
    estimatedRiskHorizon: 'Largo plazo (> 10-15 años)',
    mitigations: [
      'Gasto de fondos hacia direcciones quantum-resistant antes de la llegada de FTQC',
      'Esquemas de firmas basadas en retículos (Lattice-based cryptography)',
      'Firmas basadas en hash (SPHINCS+ / SLH-DSA)'
    ],
    bipProposals: 'BIP 360, Lamport Signatures via Script',
    scientificConfidence: 'La seguridad matemática de Schnorr se basa en el problema del logaritmo discreto sobre secp256k1, el cual es susceptible al algoritmo de Shor en computadoras cuánticas a gran escala, pero la complejidad física requerida continúa a más de una década de distancia.',
  },
  {
    algorithm: 'SHA-256',
    threatVector: 'Minería Proof-of-Work y funciones hash de bloques/transacciones',
    quantumAlgorithm: 'Grover (Collision / Pre-image)',
    estimatedRiskHorizon: 'Bajo / Teórico',
    mitigations: [
      'Aumento natural del tamaño de digestión a SHA-512 si fuera necesario',
      'El algoritmo de Grover solo ofrece aceleración cuadrática (O(sqrt(N))), reduciendo la seguridad efectiva de 256 bits a 128 bits, cifra que sigue siendo computacionalmente inexpugnable'
    ],
    bipProposals: 'No requiere modificaciones inmediatas de protocolo',
    scientificConfidence: 'Alto consenso científico: SHA-256 es inherentemente resistente a ataques cuánticos prácticos gracias al enorme espacio de búsqueda remanente (2^128 operaciones cuánticas exceden la energía del sistema solar).',
  },
  {
    algorithm: 'P2PKH / P2WPKH / P2TR (Script/PubKeyHash)',
    threatVector: 'Fondos almacenados detrás de un hash HASH160(SHA-256(PubKey))',
    quantumAlgorithm: 'Shor (SVP/DLP)',
    estimatedRiskHorizon: 'Bajo / Teórico',
    mitigations: [
      'La clave pública no es visible en la blockchain hasta que el usuario firma una transacción para gastar los fondos',
      'El atacante cuántico solo dispondría de la ventana de tiempo en que la transacción permanece en el mempool (~10-60 minutos) para resolver el logaritmo discreto y reemplazar la transacción'
    ],
    bipProposals: 'Commit-to-quantum soft fork',
    scientificConfidence: 'Las direcciones no gastadas con hash de clave pública gozan de una doble barrera de protección: el hash criptográfico SHA256+RIPEMD160 oculta la clave pública ante un atacante cuántico pasivo.',
  },
];
