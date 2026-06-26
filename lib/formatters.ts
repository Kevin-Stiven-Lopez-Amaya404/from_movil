export function formatKwh(value: number) {
  return `${value.toFixed(2)} kWh`;
}

export function formatCOP(value: number) {
  return new Intl.NumberFormat("es-CO", {
    currency: "COP",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}
