-- ============================================================
-- Simulador Web de Negocios Internacionales -- Schema
-- Ejecutar en el editor SQL de Supabase
-- ============================================================

CREATE TABLE usuarios (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre        VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol           VARCHAR(20)  NOT NULL DEFAULT 'estudiante'
                CHECK (rol IN ('estudiante', 'admin')),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE escenarios (
  id                SERIAL PRIMARY KEY,
  nombre            VARCHAR(100)   NOT NULL,
  descripcion       TEXT,
  tipo_cambio       DECIMAL(10,4)  NOT NULL,
  tasa_arancelaria  DECIMAL(5,4)   NOT NULL,
  costo_logistico   DECIMAL(10,2)  NOT NULL,
  activo            BOOLEAN        NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE simulaciones (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id           UUID         NOT NULL REFERENCES usuarios(id),
  escenario_id         INTEGER      NOT NULL REFERENCES escenarios(id),

  -- Snapshot: valores del escenario congelados en el momento de la simulación
  snap_nombre_escenario VARCHAR(100) NOT NULL,
  snap_tipo_cambio      DECIMAL(10,4) NOT NULL,
  snap_tasa_arancelaria DECIMAL(5,4)  NOT NULL,
  snap_costo_logistico  DECIMAL(10,2) NOT NULL,
  snap_tc_base          DECIMAL(10,4) NOT NULL,

  -- Inputs del estudiante
  precio_usd       DECIMAL(10,2) NOT NULL,
  volumen          INTEGER       NOT NULL,
  costo_produccion DECIMAL(10,2) NOT NULL,
  comisiones       DECIMAL(10,2) NOT NULL DEFAULT 0,

  -- Resultados calculados
  ingreso_mxn      DECIMAL(12,2) NOT NULL,
  arancel_mxn      DECIMAL(12,2) NOT NULL,
  costo_total_mxn  DECIMAL(12,2) NOT NULL,
  utilidad_mxn     DECIMAL(12,2) NOT NULL,
  variacion_tc_pct DECIMAL(8,2)  NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_simulaciones_usuario_id  ON simulaciones(usuario_id);
CREATE INDEX idx_simulaciones_escenario_id ON simulaciones(escenario_id);

CREATE TABLE configuracion (
  clave      VARCHAR(100) PRIMARY KEY,
  valor      TEXT         NOT NULL,
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
