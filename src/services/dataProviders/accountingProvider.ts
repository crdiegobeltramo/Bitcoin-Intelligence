import { AccountingFramework } from '../../types';

export const ACCOUNTING_FRAMEWORKS: AccountingFramework[] = [
  {
    standard: 'NIC 38',
    jurisdiction: 'NIIF / IFRS',
    title: 'Activos Intangibles (Decisión de Agenda IFRIC Junio 2019)',
    scope: 'Aplica a criptoactivos (incluido Bitcoin) mantenidos a largo plazo o sin propósito de venta habitual en el curso ordinario del negocio.',
    measurementModel: 'Costo menos amortización/deterioro',
    taxImplications: 'En modelo de revaluación (si existe mercado activo según NIIF 13), los incrementos se imputan al Otro Resultado Integral (ORI/OCI) y no a resultados netos hasta su realización.',
    auditEvidenceRequired: [
      'Titularidad demostrable mediante firma criptográfica de mensaje con clave privada (sin revelar la clave)',
      'Verificación on-chain de UTXOs no gastados a la fecha de cierre de balance',
      'Informes SOC 1 / SOC 2 Tipo II en caso de custodia con terceros calificados',
      'Test de deterioro (Impairment test según NIC 36) si el valor de mercado cae por debajo del costo contable'
    ],
    officialSource: 'IFRS Interpretations Committee Agenda Decision - Holdings of Cryptocurrencies (June 2019)',
  },
  {
    standard: 'NIC 2',
    jurisdiction: 'NIIF / IFRS',
    title: 'Inventarios (Comisionistas e Intermediarios de Criptoactivos / Brokers-Traders)',
    scope: 'Aplica a entidades cuya actividad principal es comprar y vender criptoactivos en el corto plazo generando beneficios por fluctuaciones de cotización o margen de intermediación.',
    measurementModel: 'Inventario para brokers/traders',
    taxImplications: 'Se mide al Valor Razonable menos los costos de venta (Fair Value less costs to sell). Las variaciones se imputan directamente a pérdidas y ganancias en el período en que ocurren.',
    auditEvidenceRequired: [
      'Conciliación de saldos en exchanges y cold storage con libros contables diarios',
      'Cálculo de rotación de inventarios y márgenes de trading',
      'Verificación de corte de operaciones (Cut-off testing) a las 23:59:59 UTC del cierre'
    ],
    officialSource: 'IASB - International Accounting Standard 2: Inventories',
  },
  {
    standard: 'NIC 36',
    jurisdiction: 'NIIF / IFRS',
    title: 'Deterioro del Valor de los Activos',
    scope: 'Obliga a evaluar al final de cada período sobre el que se informa si existen indicios de deterioro en los criptoactivos clasificados bajo NIC 38 modelo del costo.',
    measurementModel: 'Costo menos amortización/deterioro',
    taxImplications: 'Si el importe recuperable es inferior al valor en libros, se reconoce una pérdida por deterioro inmediata en resultados. Bajo NIC 38 (vida útil indefinida), la reversión del deterioro se encuentra sujeta a restricciones.',
    auditEvidenceRequired: [
      'Documentación de cotizaciones oficiales de cierre en mercados primarios de liquidez comprobada',
      'Políticas formales aprobadas por el Directorio sobre reconocimiento de pérdidas por deterioro'
    ],
    officialSource: 'IASB - International Accounting Standard 36: Impairment of Assets',
  },
  {
    standard: 'NIIF 13',
    jurisdiction: 'NIIF / IFRS',
    title: 'Medición del Valor Razonable (Fair Value)',
    scope: 'Jerarquía de valor razonable: Nivel 1 (precios cotizados en mercados activos para activos idénticos como BTC en exchanges de alto volumen).',
    measurementModel: 'Valor razonable con cambios en resultados',
    taxImplications: 'Identificación del mercado principal o más ventajoso. No se ajusta por costos de transacción en la medición del valor razonable.',
    auditEvidenceRequired: [
      'Ponderación de volúmenes de negociación en exchanges representativos',
      'Ausencia de mercados ilíquidos o cotizaciones manipuladas (wash trading)'
    ],
    officialSource: 'IASB - International Financial Reporting Standard 13: Fair Value Measurement',
  },
  {
    standard: 'FACPCE RT',
    jurisdiction: 'Argentina (FACPCE / ARCA)',
    title: 'Resolución Técnica FACPCE / Informe N° 4 CENCYA / Dictamen CPCE Córdoba',
    scope: 'Doctrina contable argentina para entes que emiten estados contables bajo normas contables profesionales argentinas (Resoluciones Técnicas vigentes).',
    measurementModel: 'Valor razonable con cambios en resultados',
    taxImplications: 'Tratamiento en Impuesto a las Ganancias (Ley 20.628 art. 2 inc. 4 y art. 98 - renta de segunda categoría / enajenación de monedas digitales al 15% en moneda extranjera). Impuesto sobre los Bienes Personales: gravados al cierre del 31 de diciembre según cotización oficial.',
    auditEvidenceRequired: [
      'Extracto de tenencias emitido por PSAV inscripto ante CNV o declaración jurada de billetera autohospedada',
      'Comprobantes de compra/venta con liquidación bancaria en cuentas CBU o billeteras CVU',
      'Papeles de trabajo de cálculo de costo fiscal histórico reexpresado conforme normativa tributaria aplicable'
    ],
    officialSource: 'FACPCE - Centro de Estudios Científicos y Técnicos (CENCYA) e Informes Profesionales CPCE',
  },
];
