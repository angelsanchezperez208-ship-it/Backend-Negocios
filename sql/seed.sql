-- ============================================================
-- Simulador Web de Negocios Internacionales -- Seed
-- Ejecutar DESPUÉS de schema.sql
-- ============================================================

INSERT INTO escenarios (nombre, descripcion, tipo_cambio, tasa_arancelaria, costo_logistico) VALUES
  ('Estabilidad con TMEC',
   'Tipo de cambio estable y arancel 0% por tratado comercial vigente. Escenario base.',
   18.50, 0.00, 15000.00),

  ('Depreciación del peso',
   'Tipo de cambio alto refleja episodios de volatilidad. El TC favorece al exportador pero hay arancel.',
   21.00, 0.10, 15000.00),

  ('Mercado sin TLC',
   'País destino aplica arancel NMF del 20%. Ilustra el costo de operar sin tratados comerciales.',
   18.50, 0.20, 15000.00),

  ('Crisis logística',
   'Costo de flete aumenta 133% por disrupciones en cadenas de suministro globales.',
   18.50, 0.10, 35000.00);

INSERT INTO configuracion (clave, valor) VALUES
  ('tipo_cambio_base', '18.50'),
  ('volumen_maximo',   '100000'),
  ('precio_usd_maximo','10000');
