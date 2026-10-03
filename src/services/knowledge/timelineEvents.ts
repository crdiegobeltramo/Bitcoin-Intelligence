export interface TimelineEvent {
  year: string;
  date: string;
  title: string;
  category: 'Genesis' | 'Protocol' | 'Halving' | 'Security' | 'Regulatory' | 'DeFi';
  description: string;
  significance: string;
}

export const BITCOIN_TIMELINE: TimelineEvent[] = [
  {
    year: '2008',
    date: '31 de Octubre, 2008',
    title: 'Publicación del Whitepaper de Bitcoin por Satoshi Nakamoto',
    category: 'Genesis',
    description: 'Se publica "Bitcoin: A Peer-to-Peer Electronic Cash System" en la lista de correo de criptografía de metzdowd.com.',
    significance: 'Resuelve por primera vez en la historia de la computación el problema de los Generales Bizantinos y el doble gasto en un entorno descentralizado sin intermediarios de confianza.',
  },
  {
    year: '2009',
    date: '3 de Enero, 2009',
    title: 'Bloque Génesis (Bloque 0) y Nacimiento de la Red',
    category: 'Genesis',
    description: 'Satoshi Nakamoto mina el Bloque Génesis con 50 BTC de subsidio e incluye en el coinbase el titular: "The Times 03/Jan/2009 Chancellor on brink of second bailout for banks".',
    significance: 'Marca el inicio del ledger inmutable y ancla la motivación fundacional contra la inflación monetaria y el rescate bancario centralizado.',
  },
  {
    year: '2010',
    date: '22 de Mayo, 2010',
    title: 'Bitcoin Pizza Day (Primera Transacción Comercial Real)',
    category: 'Protocol',
    description: 'Laszlo Hanyecz compra dos pizzas de Papa John\'s por 10.000 BTC a través del foro Bitcointalk.',
    significance: 'Primera demostración práctica de Bitcoin como medio de cambio en la economía real con un valor tangible.',
  },
  {
    year: '2012',
    date: '28 de Noviembre, 2012',
    title: 'Primer Halving de Bitcoin (Bloque 210.000)',
    category: 'Halving',
    description: 'El subsidio por bloque de recompensa para mineros se reduce a la mitad: de 50 BTC a 25 BTC por bloque.',
    significance: 'Primera prueba empírica del mecanismo de emisión desinflacionaria programada codificado en el protocolo.',
  },
  {
    year: '2015',
    date: 'Febrero, 2015',
    title: 'Publicación del Whitepaper de Lightning Network',
    category: 'Protocol',
    description: 'Joseph Poon y Thaddeus Dryja publican "The Bitcoin Lightning Network: Scalable Off-Chain Instant Payments".',
    significance: 'Sienta las bases de los canales de pago bidireccionales y contratos HTLC como solución de escalabilidad de capa 2 (L2).',
  },
  {
    year: '2016',
    date: '9 de Julio, 2016',
    title: 'Segundo Halving de Bitcoin (Bloque 420.000)',
    category: 'Halving',
    description: 'El subsidio por bloque minado disminuye de 25 BTC a 12.5 BTC.',
    significance: 'Consolida la dinámica de shock de oferta en mercados globales.',
  },
  {
    year: '2017',
    date: '24 de Agosto, 2017',
    title: 'Activación de SegWit (BIP 141) y Resolución de la "Guerra de Bloques"',
    category: 'Protocol',
    description: 'Segregated Witness separa los datos de firma (witness) del árbol de transacciones base, corrigiendo la maleabilidad de transacciones y habilitando Lightning Network.',
    significance: 'Victoria del consenso descentralizado y de los usuarios de nodos completos (UASF) sobre intereses corporativos mineros centralizados.',
  },
  {
    year: '2020',
    date: '11 de Mayo, 2020',
    title: 'Tercer Halving de Bitcoin (Bloque 630.000)',
    category: 'Halving',
    description: 'La emisión monetaria por bloque desciende de 12.5 BTC a 6.25 BTC en un contexto de expansión cuantitativa global por COVID-19.',
    significance: 'La tasa de inflación anual de Bitcoin se sitúa por debajo de la meta de los principales bancos centrales mundiales (~1.8%).',
  },
  {
    year: '2021',
    date: '7 de Septiembre, 2021',
    title: 'El Salvador adopta Bitcoin como Moneda de Curso Legal',
    category: 'Regulatory',
    description: 'Entra en vigencia la Ley Bitcoin en la República de El Salvador, convirtiéndose en el primer estado soberano del mundo en otorgarle curso legal pleno.',
    significance: 'Hito histórico en la adopción geopolítica de Bitcoin por parte de un estado soberano.',
  },
  {
    year: '2021',
    date: '14 de Noviembre, 2021',
    title: 'Activación del Soft Fork Taproot (BIP 340, 341, 342) en el Bloque 709.632',
    category: 'Protocol',
    description: 'Introduce firmas Schnorr, Tapscript y árboles MAST en la red principal de Bitcoin.',
    significance: 'Mayor actualización de privacidad y eficiencia de contratos inteligentes en Bitcoin desde SegWit.',
  },
  {
    year: '2024',
    date: '10 de Enero, 2024',
    title: 'Aprobación de los primeros ETFs de Bitcoin al Contado en EE.UU. por la SEC',
    category: 'Regulatory',
    description: 'La Securities and Exchange Commission aprueba las solicitudes 19b-4 de 11 emisores institucionales (BlackRock, Fidelity, etc.).',
    significance: 'Integración definitiva de Bitcoin en la infraestructura de los mercados financieros y de capitales de Wall Street.',
  },
  {
    year: '2024',
    date: '20 de Abril, 2024',
    title: 'Cuarto Halving de Bitcoin (Bloque 840.000)',
    category: 'Halving',
    description: 'El subsidio se reduce a 3.125 BTC por bloque (apenas 450 BTC generados al día a nivel mundial).',
    significance: 'La inflación programada de Bitcoin cae por debajo del 0.85% anual, convirtiéndose en el activo monetario más escaso y con mayor stock-to-flow del planeta.',
  },
];
