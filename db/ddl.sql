-- DDL scaffold generated from CDM (simplified)

CREATE TABLE loai_dung_cu (
  id_loai_dung_cu VARCHAR(50) PRIMARY KEY,
  ten_loai_dung_cu VARCHAR(255) NOT NULL
);

CREATE TABLE dung_cu (
  id_dung_cu VARCHAR(50) PRIMARY KEY,
  ten_dung_cu VARCHAR(255) NOT NULL,
  brand VARCHAR(100),
  gia_ban DECIMAL(12,2),
  id_nsx VARCHAR(50),
  id_loai_dung_cu VARCHAR(50),
  FOREIGN KEY (id_loai_dung_cu) REFERENCES loai_dung_cu(id_loai_dung_cu)
);

-- Note: adjust types and constraints to match your DB platform and CDM details.
