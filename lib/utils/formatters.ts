/**
 * Formatea consumos energeticos con dos decimales.
 */
export function formatKwh(value: number) {
  return `${value.toFixed(2)} kWh`;
}

/**
 * Formatea valores monetarios en pesos colombianos.
 *
 * Se usa `Intl.NumberFormat` para respetar separadores y simbolo de moneda.
 */
export function formatCOP(value: number) {
  return new Intl.NumberFormat("es-CO", {
    currency: "COP",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

export const formatWatts = (watts: number): string => {
  return `${watts.toFixed(0)} W`;
};

export const formatEnergy = (wh: number): string => {
  if (wh >= 1000) {
    return `${(wh / 1000).toFixed(2)} kWh`;
  }
  return `${wh.toFixed(0)} Wh`;
};