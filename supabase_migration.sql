-- Supabase Migration SQL
-- Run this in your Supabase SQL Editor

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha TEXT NOT NULL,
  perfil TEXT NOT NULL,
  escola TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS skills (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  codigo TEXT UNIQUE NOT NULL,
  descricao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plans (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  habilidade_codigo TEXT NOT NULL,
  ano_escolar TEXT,
  eixo TEXT,
  fase_zero TEXT,
  plano_01 TEXT,
  plano_02 TEXT,
  plano_03 TEXT,
  plano_04 TEXT,
  plano_05 TEXT,
  plano_atual INTEGER DEFAULT 0,
  concluido BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
  id BIGINT PRIMARY KEY DEFAULT 1,
  secretaria_nome TEXT DEFAULT 'Secretaria Municipal de Educação',
  municipio_nome TEXT DEFAULT 'Nome do Município',
  estado_nome TEXT DEFAULT 'Estado',
  logo_prefeitura TEXT,
  logo_secretaria TEXT,
  nome_secretario TEXT,
  assinatura_digital TEXT,
  config_exportacao TEXT DEFAULT '{"include_fase_zero": true, "include_planos": true, "resumida": false}',
  CONSTRAINT single_row CHECK (id = 1)
);

-- 2. Initial Data
INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- 3. Enable Row Level Security (Optional, but recommended for production)
-- For this app, we'll assume the server handles auth, so we'll use the service_role key.
-- If you want to use Supabase Auth directly, you'll need to adjust these tables.
