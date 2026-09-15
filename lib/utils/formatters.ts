/**
 * Formatea consumos energéticos expresados en kWh con dos decimales.
 */
export function formatKwh(value: number): string {
  return `${value.toFixed(2)} kWh`;
}

/**
 * Formatea potencia eléctrica en watts.
 */
export function formatWatts(watts: number): string {
  return `${watts.toFixed(0)} W`;
}

/**
 * Formatea energía expresada en Wh.
 * Convierte automáticamente a kWh cuando alcanza 1000 Wh.
 */
export function formatEnergy(wh: number): string {
  if (wh >= 1000) {
    return `${(wh / 1000).toFixed(2)} kWh`;
  }

  return `${wh.toFixed(0)} Wh`;
}
