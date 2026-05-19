// ─── Size Charts ─────────────────────────────────────────────────────────────

type TallaKey = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'

interface Rango {
  min: number
  max: number
}

const TOP_CHART: Record<TallaKey, Rango> = {
  XS:  { min: 86, max: 91 },
  S:   { min: 92, max: 97 },
  M:   { min: 98, max: 103 },
  L:   { min: 104, max: 109 },
  XL:  { min: 110, max: 115 },
  XXL: { min: 116, max: 121 },
}

const PANT_CHART: Record<Exclude<TallaKey, 'XXL'>, { cintura: Rango; cadera: Rango }> = {
  XS: { cintura: { min: 71, max: 76 },  cadera: { min: 86, max: 91 } },
  S:  { cintura: { min: 77, max: 82 },  cadera: { min: 92, max: 97 } },
  M:  { cintura: { min: 83, max: 88 },  cadera: { min: 98, max: 103 } },
  L:  { cintura: { min: 89, max: 94 },  cadera: { min: 104, max: 109 } },
  XL: { cintura: { min: 95, max: 100 }, cadera: { min: 110, max: 115 } },
}

type Fit = 'ajustado' | 'regular' | 'oversize'
type Confianza = 'alta' | 'media' | 'baja'

export interface TallaResultado {
  talla: string
  confianza: Confianza
  mensaje: string
  alternativa?: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TALLA_ORDER: TallaKey[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

function findTallaInChart(medida: number, chart: Record<string, Rango>): TallaKey | null {
  for (const [talla, rango] of Object.entries(chart)) {
    if (medida >= rango.min && medida <= rango.max) {
      return talla as TallaKey
    }
  }
  // Below or above chart — find closest
  const entries = Object.entries(chart) as [TallaKey, Rango][]
  if (medida < entries[0][1].min) return entries[0][0]
  return entries[entries.length - 1][0]
}

function shiftTalla(talla: TallaKey, offset: number, maxTallas: TallaKey[]): TallaKey {
  const idx = maxTallas.indexOf(talla)
  const newIdx = Math.max(0, Math.min(maxTallas.length - 1, idx + offset))
  return maxTallas[newIdx]
}

export function calcularConfianza(medida: number, rango: Rango): Confianza {
  const center = (rango.min + rango.max) / 2
  const distance = Math.abs(medida - center)
  const halfRange = (rango.max - rango.min) / 2
  const ratio = distance / halfRange

  if (ratio < 0.5) return 'alta'
  if (ratio < 0.85) return 'media'
  return 'baja'
}

// ─── Top Calculator ──────────────────────────────────────────────────────────

export function calcularTallaTop(pecho: number, fit: Fit): TallaResultado {
  const baseTalla = findTallaInChart(pecho, TOP_CHART)
  if (!baseTalla) {
    return { talla: 'M', confianza: 'baja', mensaje: 'No pudimos determinar tu talla con certeza.' }
  }

  let finalTalla = baseTalla
  const rango = TOP_CHART[baseTalla]

  if (fit === 'oversize') {
    finalTalla = shiftTalla(baseTalla, 1, TALLA_ORDER)
  } else if (fit === 'regular') {
    // If in the top 20% of range, suggest going up
    const threshold = rango.min + (rango.max - rango.min) * 0.8
    if (pecho > threshold) {
      finalTalla = shiftTalla(baseTalla, 1, TALLA_ORDER)
    }
  }
  // 'ajustado' — exact match

  const finalRango = TOP_CHART[finalTalla]
  const confianza = calcularConfianza(pecho, rango)

  let mensaje = ''
  if (fit === 'oversize') {
    mensaje = `Esta talla te queda cómoda para un fit oversize.`
  } else if (confianza === 'media') {
    const prev = shiftTalla(finalTalla, -1, TALLA_ORDER)
    const next = shiftTalla(finalTalla, 1, TALLA_ORDER)
    if (pecho > (finalRango.min + finalRango.max) / 2) {
      mensaje = `Estás entre ${finalTalla} y ${next}. Si te gustan las prendas más holgadas, andá por ${next}.`
    } else {
      mensaje = `Estás entre ${prev} y ${finalTalla}. Si te gustan ajustadas, podés ir por ${prev}.`
    }
  } else if (confianza === 'alta') {
    mensaje = `Tu medida de pecho cae perfecto en talla ${finalTalla}.`
  } else {
    mensaje = `Tu medida está en el límite. Considerá probarte la prenda.`
  }

  return { talla: finalTalla, confianza, mensaje }
}

// ─── Pant Calculator ─────────────────────────────────────────────────────────

export function calcularTallaPant(cintura: number, cadera: number, fit: Fit): TallaResultado {
  const pantTallas = ['XS', 'S', 'M', 'L', 'XL'] as const
  type PantTalla = (typeof pantTallas)[number]

  const cinturaChart: Record<string, Rango> = {}
  const caderaChart: Record<string, Rango> = {}
  for (const t of pantTallas) {
    cinturaChart[t] = PANT_CHART[t].cintura
    caderaChart[t] = PANT_CHART[t].cadera
  }

  const tallaCintura = findTallaInChart(cintura, cinturaChart) as PantTalla
  const tallaCadera = findTallaInChart(cadera, caderaChart) as PantTalla

  // Choose the larger one (easier to adjust down with a belt)
  const idxCintura = pantTallas.indexOf(tallaCintura)
  const idxCadera = pantTallas.indexOf(tallaCadera)
  let baseTalla = idxCadera >= idxCintura ? tallaCadera : tallaCintura

  let finalTalla: string = baseTalla
  if (fit === 'oversize') {
    finalTalla = shiftTalla(baseTalla, 1, [...pantTallas])
  } else if (fit === 'regular') {
    const rango = PANT_CHART[baseTalla].cintura
    const threshold = rango.min + (rango.max - rango.min) * 0.8
    if (cintura > threshold) {
      finalTalla = shiftTalla(baseTalla, 1, [...pantTallas])
    }
  }

  const confianzaCintura = calcularConfianza(cintura, PANT_CHART[baseTalla].cintura)
  const confianzaCadera = calcularConfianza(cadera, PANT_CHART[baseTalla].cadera)
  const confianza: Confianza =
    confianzaCintura === 'alta' && confianzaCadera === 'alta'
      ? 'alta'
      : confianzaCintura === 'baja' || confianzaCadera === 'baja'
        ? 'baja'
        : 'media'

  let mensaje = ''
  if (tallaCintura !== tallaCadera) {
    mensaje = `Tu cintura es ${tallaCintura} y tu cadera es ${tallaCadera}. Recomendamos ${finalTalla} — es más fácil ajustar con cinturón.`
  } else if (confianza === 'alta') {
    mensaje = `Tus medidas caen perfecto en talla ${finalTalla}.`
  } else {
    mensaje = `Tu medida está en el borde. Considerá probarte la prenda.`
  }

  return {
    talla: finalTalla,
    confianza,
    mensaje,
    alternativa: tallaCintura !== tallaCadera ? tallaCintura : undefined,
  }
}

// ─── Exports for the table ───────────────────────────────────────────────────

export function getTopChart() {
  return Object.entries(TOP_CHART).map(([talla, rango]) => ({
    talla,
    pecho: `${rango.min}–${rango.max} cm`,
  }))
}

export function getPantChart() {
  return Object.entries(PANT_CHART).map(([talla, { cintura, cadera }]) => ({
    talla,
    cintura: `${cintura.min}–${cintura.max} cm`,
    cadera: `${cadera.min}–${cadera.max} cm`,
  }))
}
