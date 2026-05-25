const redondear = (n) => Math.round(n * 100) / 100;

const calcularSimulacion = ({
  precio_usd,
  volumen,
  costo_produccion,
  comisiones,
  tipo_cambio,
  tasa_arancelaria,
  costo_logistico,
  tc_base,
}) => {
  const ingreso_mxn     = redondear(precio_usd * volumen * tipo_cambio);
  const arancel_mxn     = redondear(ingreso_mxn * tasa_arancelaria);
  const costo_total_mxn = redondear(costo_produccion + costo_logistico + comisiones + arancel_mxn);
  const utilidad_mxn    = redondear(ingreso_mxn - costo_total_mxn);
  const variacion_tc_pct = redondear((tipo_cambio - tc_base) / tc_base * 100);

  return { ingreso_mxn, arancel_mxn, costo_total_mxn, utilidad_mxn, variacion_tc_pct };
};

module.exports = { calcularSimulacion };
