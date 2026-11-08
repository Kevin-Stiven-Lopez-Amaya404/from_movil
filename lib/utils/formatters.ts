/**
 * Formats energy consumption expressed in kWh with two decimals.
 */
export function formatKwh(value: number): string {
  return `${value.toFixed(2)} kWh`;
}

/**
 * Formats electrical power in watts.
 */
export function formatWatts(watts: number): string {
  return `${watts.toFixed(0)} W`;
}

/**
 * Formats energy expressed in Wh.
 * Converts automatically to kWh when it reaches 1000 Wh.
 */
export function formatEnergy(wh: number): string {
  if (wh >= 1000) {
    return `${(wh / 1000).toFixed(2)} kWh`;
  }

  return `${wh.toFixed(0)} Wh`;
}
