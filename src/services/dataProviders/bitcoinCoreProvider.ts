import { BipEntry, BitcoinCoreChange } from '../../types';

export const BIP_REGISTRY: BipEntry[] = [
  {
    number: 340,
    title: 'Schnorr Signatures for secp256k1',
    author: 'Pieter Wuille, Jonas Nick, Tim Ruffing',
    status: 'Final',
    type: 'Standards Track',
    date: '2020-01-19',
    summary: 'Especifica la construcción de firmas Schnorr de 64 bytes sobre la curva secp256k1 con propiedades de linealidad, permitiendo agregación de firmas y batches.',
    technicalImpact: 'Reduce tamaño de firmas de 71-73 bytes a 64 bytes fijos. Permite agregación MuSig2 y firmas multi-party indiscernibles de single-sig.',
    dependencies: 'Ninguna (Base matemática)',
    githubUrl: 'https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki',
    layer: 'Consensus',
  },
  {
    number: 341,
    title: 'Taproot: SegWit version 1 spending rules',
    author: 'Pieter Wuille, Jonas Nick, Anthony Towns',
    status: 'Final',
    type: 'Standards Track',
    date: '2020-01-19',
    summary: 'Define SegWit v1 (Taproot), combinando Schnorr signatures con árboles de sintaxis abstracta de scripts (MAST), ocultando scripts no ejecutados.',
    technicalImpact: 'Privacidad total en gastado cooperativo (se ve idéntico a single-key), reduce drásticamente el espacio en bloque al ejecutar scripts complejos.',
    dependencies: 'BIP 340, BIP 342',
    githubUrl: 'https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki',
    layer: 'Consensus',
  },
  {
    number: 342,
    title: 'Validation of Taproot Scripts (Tapscript)',
    author: 'Pieter Wuille, Jonas Nick, Anthony Towns',
    status: 'Final',
    type: 'Standards Track',
    date: '2020-01-19',
    summary: 'Modifica y actualiza la semántica de evaluación de scripts bajo Taproot (OP_CHECKSIGADD, eliminación del límite MAX_OPS_PER_SCRIPT de 201).',
    technicalImpact: 'Permite firmas con batches de opcodes y simplifica el soft-fork upgradeability vía OP_SUCCESSx.',
    dependencies: 'BIP 340, BIP 341',
    githubUrl: 'https://github.com/bitcoin/bips/blob/master/bip-0342.mediawiki',
    layer: 'Consensus',
  },
  {
    number: 119,
    title: 'CheckTemplateVerify (OP_CTV / Covenants)',
    author: 'Jeremy Rubin',
    status: 'Proposed',
    type: 'Standards Track',
    date: '2020-01-06',
    summary: 'Propone OP_CHECKTEMPLATEVERIFY (OP_NOP4 redefinido) para permitir covenants no recursivos basados en un hash predeterminado de outputs de la transacción.',
    technicalImpact: 'Permite congestión controlada de transacciones, vaults de autocustodia no interactivos, canales payment-pool y payment trees para escalabilidad masiva.',
    dependencies: 'BIP 341',
    githubUrl: 'https://github.com/bitcoin/bips/blob/master/bip-0119.mediawiki',
    layer: 'Consensus',
  },
  {
    number: 324,
    title: 'v2 Encrypted P2P Transport Protocol',
    author: 'Wladimir J. van der Laan, Pieter Wuille, Tim Ruffing',
    status: 'Final',
    type: 'Standards Track',
    date: '2023-08-10',
    summary: 'Implementa cifrado punto a punto en la capa de red de Bitcoin Core utilizando ChaCha20-Poly1305 y ElligatorSwift para indistinguibilidad.',
    technicalImpact: 'Previene espionaje masivo de nodos, fingerprinting por ISP y manipulación intermedia de transacciones transmitidas en claro.',
    dependencies: 'Ninguna',
    githubUrl: 'https://github.com/bitcoin/bips/blob/master/bip-0324.mediawiki',
    layer: 'Peer-to-Peer',
  },
  {
    number: 360,
    title: 'Post-Quantum Resilient Signatures Migration Framework',
    author: 'Investigación Criptográfica Comunitaria',
    status: 'Draft',
    type: 'Standards Track',
    date: '2024-11-15',
    summary: 'Marco de trabajo teórico para la transición progresiva hacia firmas post-cuánticas (ej. Falcon o ML-DSA/Dilithium) en Bitcoin via nuevo Witness Version.',
    technicalImpact: 'Analiza el impacto del aumento de tamaño de firma (1-3 KB vs 64 bytes) y mecanismos de soft-fork para proteger UTXOs vulnerables.',
    dependencies: 'BIP 341, NIST FIPS 204/205',
    githubUrl: 'https://github.com/bitcoin/bips',
    layer: 'Consensus',
  },
  {
    number: 431,
    title: 'Topology-Agnostic Top-Order Replace-by-Fee (TRUC / v3 Transactions)',
    author: 'Gloria Zhao',
    status: 'Proposed',
    type: 'Standards Track',
    date: '2023-09-22',
    summary: 'Reglas de mempool para transacciones versión 3 diseñadas para resistir pin-attacks en Lightning Network y protocolos L2 multi-party.',
    technicalImpact: 'Elimina vectores de denegación de servicio por transacciones ancestro pesadas en el mempool, robusteciendo settlement de Lightning.',
    dependencies: 'BIP 125',
    githubUrl: 'https://github.com/bitcoin/bips/blob/master/bip-0431.mediawiki',
    layer: 'Applications',
  },
];

export const CORE_CHANGES: BitcoinCoreChange[] = [
  {
    id: 'pr-29641',
    type: 'PR',
    subsystem: 'Consensus',
    title: 'refactor: Enforce BIP 341/342 verification invariants in script/interpreter.cpp',
    prNumber: 29641,
    author: 'sipa (Pieter Wuille)',
    date: '2025-02-14',
    githubUrl: 'https://github.com/bitcoin/bitcoin/pull/29641',
    diffSnippet: `bool VerifyTaprootCommitment(const std::vector<unsigned char>& control_block,
                             const uint256& script_hash,
                             const XOnlyPubKey& internal_key,
                             const XOnlyPubKey& output_key) {
+    // Strict parity check and branch depth bound <= 128
+    if (control_block.size() < TAPROOT_CONTROL_BASE_SIZE) return false;
+    if ((control_block.size() - TAPROOT_CONTROL_BASE_SIZE) % TAPROOT_CONTROL_NODE_SIZE != 0) return false;
+    const size_t path_len = (control_block.size() - TAPROOT_CONTROL_BASE_SIZE) / TAPROOT_CONTROL_NODE_SIZE;
+    if (path_len > TAPROOT_CONTROL_MAX_NODE_COUNT) return false;
     return output_key.VerifyTapTweak(internal_key, script_hash, (control_block[0] & 1));
 }`,
    impactSummary: 'Refuerza los invariantes en la verificación de ramas Merkle en scripts Taproot, blindando el intérprete frente a potenciales desbordamientos de pila de llamadas en validación.',
    hasSecurityImplications: true,
  },
  {
    id: 'rel-28-1',
    type: 'Release',
    subsystem: 'Security',
    title: 'Bitcoin Core v28.1 Maintenance & P2P Encryption hardening',
    author: 'achow101 / Bitcoin Core Release Team',
    date: '2025-01-20',
    githubUrl: 'https://github.com/bitcoin/bitcoin/releases/tag/v28.1',
    diffSnippet: `// Configuration default for v2 P2P encrypted transport
-ArgsManager::AddArg("-v2transport", "Enables encrypted P2P connections (default: false)");
+ArgsManager::AddArg("-v2transport", "Enables encrypted P2P connections (default: true)");`,
    impactSummary: 'Habilita de forma predeterminada el transporte cifrado v2 (BIP 324) en todas las conexiones P2P salientes, mitigando ataques de observadores de red.',
    hasSecurityImplications: true,
  },
  {
    id: 'pr-30112',
    type: 'PR',
    subsystem: 'Mempool',
    title: 'mempool: Cluster Mempool linearization and incentive compatibility',
    prNumber: 30112,
    author: 'sdaftuar (Suhas Daftuar)',
    date: '2025-02-02',
    githubUrl: 'https://github.com/bitcoin/bitcoin/pull/30112',
    diffSnippet: `+std::vector<ClusterLinearization> LinearizeCluster(const TxGraph& graph) {
+    // Computes fee-rate diagram upper-convex-hull for optimal mining package selection
+    // Guarantees RBF replaces strictly lower-utility clusters without DoS amplification
+    return OptimalChunkLinearization(graph);
+}`,
    impactSummary: 'Reemplaza el algoritmo de selección de mempool ancestral por un algoritmo de clustering linealizado. Garantiza compatibilidad de incentivos económica estricta.',
    hasSecurityImplications: false,
  },
  {
    id: 'pr-28954',
    type: 'PR',
    subsystem: 'P2P',
    title: 'p2p: Erlay (BIP 330) Bandwidth-efficient transaction relay',
    prNumber: 28954,
    author: 'gleb (Gleb Naumenko)',
    date: '2024-12-18',
    githubUrl: 'https://github.com/bitcoin/bitcoin/pull/28954',
    diffSnippet: `+void SendReconciliationRound(Peer& peer) {
+    // Uses Minisketch (BIP 330) to compute pin-point set difference in tx inventory
+    peer.reconciler.BuildSketch(m_local_mempool_short_ids);
+}`,
    impactSummary: 'Reduce el consumo de ancho de banda del relay de transacciones en un 40-70% mediante cálculo eficiente de diferencias de conjuntos con bocetos matemáticos.',
    hasSecurityImplications: false,
  },
];
