import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import dotenv from "dotenv";
import puppeteer from "puppeteer";
import QRCode from "qrcode";
import crypto from "crypto";
import { marked } from "marked";
import JSZip from "jszip";
import HTMLtoDOCX from 'html-to-docx';
import fs from "fs";

dotenv.config();

// Configure marked for PDF rendering
marked.setOptions({
  gfm: true,
  breaks: true,
});

const db = new Database("database.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    perfil TEXT NOT NULL,
    escola TEXT
  );

  CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT UNIQUE NOT NULL,
    descricao TEXT
  );

  CREATE TABLE IF NOT EXISTS plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    guest_id TEXT,
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    secretaria_nome TEXT DEFAULT 'Secretaria Municipal de Educação',
    municipio_nome TEXT DEFAULT 'Nome do Município',
    estado_nome TEXT DEFAULT 'Estado',
    logo_prefeitura TEXT,
    logo_secretaria TEXT,
    nome_secretario TEXT,
    assinatura_digital TEXT,
    config_exportacao TEXT DEFAULT '{"include_fase_zero": true, "include_planos": true, "resumida": false}'
  );

  INSERT OR IGNORE INTO settings (id) VALUES (1);
`);

// Migrations for users
try {
  const columns = db.prepare("PRAGMA table_info(users)").all();
  const hasEscola = columns.some((col: any) => col.name === 'escola');
  if (!hasEscola) {
    db.prepare("ALTER TABLE users ADD COLUMN escola TEXT").run();
    console.log("Column 'escola' added to 'users' table.");
  }
} catch (err) {
  console.error("Migration error (users):", err);
}

// Migrations for plans
try {
  const columns = db.prepare("PRAGMA table_info(plans)").all();
  const hasEixo = columns.some((col: any) => col.name === 'eixo');
  if (!hasEixo) {
    db.prepare("ALTER TABLE plans ADD COLUMN eixo TEXT").run();
  }
  const hasGuestId = columns.some((col: any) => col.name === 'guest_id');
  if (!hasGuestId) {
    db.prepare("ALTER TABLE plans ADD COLUMN guest_id TEXT").run();
  }
  const hasCreatedAt = columns.some((col: any) => col.name === 'created_at');
  if (!hasCreatedAt) {
    db.prepare("ALTER TABLE plans ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP").run();
  }
} catch (err) {
  console.error("Migration error (plans):", err);
}

// Seed function for requested user
async function seedUser() {
  const email = "genesonallves@gmail.com";
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user) {
    const hashedPassword = await bcrypt.hash("Livie2019", 10);
    db.prepare("INSERT INTO users (nome, email, senha, perfil) VALUES (?, ?, ?, ?)")
      .run("Geneson Alves", email, hashedPassword, "Gestor");
    console.log("User genesonallves@gmail.com seeded successfully.");
  }
}

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "bncc-ia-secret-key";

app.use(express.json());

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Auth Routes
app.post("/api/auth/register", async (req, res) => {
  const { nome, email, senha, perfil, escola } = req.body;
  const hashedPassword = await bcrypt.hash(senha, 10);
  
  try {
    const stmt = db.prepare("INSERT INTO users (nome, email, senha, perfil, escola) VALUES (?, ?, ?, ?, ?)");
    const info = stmt.run(nome, email, hashedPassword, perfil, escola || null);
    res.status(201).json({ id: info.lastInsertRowid });
  } catch (error) {
    res.status(400).json({ error: "Email já cadastrado" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, senha } = req.body;
  const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

  if (user && await bcrypt.compare(senha, user.senha)) {
    const token = jwt.sign({ id: user.id, nome: user.nome, perfil: user.perfil }, JWT_SECRET);
    res.json({ token, user: { id: user.id, nome: user.nome, perfil: user.perfil } });
  } else {
    res.status(401).json({ error: "Credenciais inválidas" });
  }
});

// Plan Routes
app.get("/api/plans", authenticateToken, (req: any, res) => {
  const plans = db.prepare("SELECT * FROM plans WHERE user_id = ? ORDER BY id DESC").all(req.user.id);
  res.json(plans);
});

app.post("/api/plans/start", authenticateToken, (req: any, res) => {
  const { habilidade_codigo, ano_escolar, eixo } = req.body;
  const stmt = db.prepare("INSERT INTO plans (user_id, habilidade_codigo, ano_escolar, eixo, plano_atual) VALUES (?, ?, ?, ?, 0)");
  const info = stmt.run(req.user.id, habilidade_codigo, ano_escolar, eixo);
  res.json({ id: info.lastInsertRowid });
});

app.post("/api/plans/update", authenticateToken, (req: any, res) => {
  const { id, field, content, next_plano } = req.body;
  
  const allowedFields = ['fase_zero', 'plano_01', 'plano_02', 'plano_03', 'plano_04', 'plano_05', 'concluido'];
  if (!allowedFields.includes(field)) {
    return res.status(400).json({ error: "Campo inválido" });
  }

  try {
    const stmt = db.prepare(`UPDATE plans SET ${field} = ?, plano_atual = ? WHERE id = ? AND user_id = ?`);
    stmt.run(content, next_plano, id, req.user.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar plano" });
  }
});

app.get("/api/plans/:id", authenticateToken, (req: any, res) => {
  const plan = db.prepare("SELECT * FROM plans WHERE id = ? AND user_id = ?").get(req.params.id, req.user.id);
  res.json(plan);
});

app.post("/api/plans/delete", authenticateToken, (req: any, res) => {
  const { ids, all } = req.body;
  const userId = req.user.id;
  
  try {
    if (all) {
      const result = db.prepare("DELETE FROM plans WHERE user_id = ?").run(userId);
      return res.json({ success: true, deleted: result.changes });
    } 
    
    if (Array.isArray(ids) && ids.length > 0) {
      const numericIds = ids.map(id => Number(id)).filter(id => !isNaN(id));
      if (numericIds.length > 0) {
        const placeholders = numericIds.map(() => "?").join(",");
        const result = db.prepare(`DELETE FROM plans WHERE user_id = ? AND id IN (${placeholders})`).run(userId, ...numericIds);
        return res.json({ success: true, deleted: result.changes });
      }
    }
    
    res.status(400).json({ error: "Nenhum ID válido fornecido para exclusão" });
  } catch (err) {
    console.error('Error deleting plans:', err);
    res.status(500).json({ error: "Erro interno ao excluir planejamentos" });
  }
});

// Guest Plan Routes
app.post("/api/guest/plans/start", (req, res) => {
  const { habilidade_codigo, ano_escolar, eixo, guest_id } = req.body;
  
  if (!guest_id) return res.status(400).json({ error: "Guest ID is required" });

  // Check limit
  const count = db.prepare("SELECT COUNT(*) as count FROM plans WHERE guest_id = ?").get(guest_id) as any;
  if (count.count >= 2) {
    return res.status(403).json({ error: "Limite de 2 planos para teste atingido. Cadastre-se para continuar!" });
  }

  const stmt = db.prepare("INSERT INTO plans (guest_id, habilidade_codigo, ano_escolar, eixo, plano_atual) VALUES (?, ?, ?, ?, 0)");
  const info = stmt.run(guest_id, habilidade_codigo, ano_escolar, eixo);
  res.json({ id: info.lastInsertRowid });
});

app.get("/api/guest/plans/:id", (req, res) => {
  const { guest_id } = req.query;
  const plan = db.prepare("SELECT * FROM plans WHERE id = ? AND guest_id = ?").get(req.params.id, guest_id);
  if (!plan) return res.status(404).json({ error: "Plano não encontrado" });
  res.json(plan);
});

app.post("/api/guest/plans/update", (req, res) => {
  const { id, field, content, next_plano, guest_id } = req.body;
  
  const allowedFields = ['fase_zero', 'plano_01', 'plano_02', 'plano_03', 'plano_04', 'plano_05', 'concluido'];
  if (!allowedFields.includes(field)) {
    return res.status(400).json({ error: "Campo inválido" });
  }

  try {
    const stmt = db.prepare(`UPDATE plans SET ${field} = ?, plano_atual = ? WHERE id = ? AND guest_id = ?`);
    const result = stmt.run(content, next_plano, id, guest_id);
    if (result.changes === 0) return res.status(404).json({ error: "Plano não encontrado ou guest_id inválido" });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar plano" });
  }
});

// Project Download Route
app.get("/api/admin/download-project", authenticateToken, async (req: any, res) => {
  if (req.user.perfil !== 'Gestor') {
    return res.status(403).json({ error: "Apenas gestores podem baixar o código do projeto" });
  }

  const zip = new JSZip();
  
  const foldersToInclude = ['src', 'public'];
  const filesToInclude = ['server.ts', 'package.json', 'tsconfig.json', 'vite.config.ts', 'database.db', '.env.example', 'metadata.json'];

  function addDirectoryToZip(dirPath: string, zipFolder: JSZip) {
    const items = fs.readdirSync(dirPath);
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        if (item === 'node_modules' || item === 'dist' || item === '.next' || item === '.git') continue;
        const newZipFolder = zipFolder.folder(item);
        if (newZipFolder) addDirectoryToZip(fullPath, newZipFolder);
      } else {
        const content = fs.readFileSync(fullPath);
        zipFolder.file(item, content);
      }
    }
  }

  try {
    // Add specific files
    for (const file of filesToInclude) {
      const fullPath = path.join(process.cwd(), file);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath);
        zip.file(file, content);
      }
    }

    // Add folders
    for (const folder of foldersToInclude) {
      const fullPath = path.join(process.cwd(), folder);
      if (fs.existsSync(fullPath)) {
        const zipFolder = zip.folder(folder);
        if (zipFolder) addDirectoryToZip(fullPath, zipFolder);
      }
    }

    const content = await zip.generateAsync({ type: "nodebuffer" });
    
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename=teacher-digital-ia-full.zip',
      'Content-Length': content.length
    });
    
    res.send(content);
  } catch (err) {
    console.error("Error generating project ZIP:", err);
    res.status(500).json({ error: "Erro ao gerar arquivo ZIP do projeto" });
  }
});

// Settings Routes
app.get("/api/settings", authenticateToken, (req: any, res) => {
  const settings = db.prepare("SELECT * FROM settings WHERE id = 1").get();
  let users: any[] = [];
  if (req.user.perfil === 'Gestor') {
    users = db.prepare("SELECT id, nome, email, perfil, escola FROM users ORDER BY nome ASC").all();
  }
  res.json({ ...settings, users });
});

app.post("/api/settings", authenticateToken, (req: any, res) => {
  if (req.user.perfil !== 'Gestor') {
    return res.status(403).json({ error: "Apenas gestores podem alterar configurações" });
  }
  const { 
    secretaria_nome, municipio_nome, estado_nome, 
    logo_prefeitura, logo_secretaria, nome_secretario, 
    assinatura_digital, config_exportacao 
  } = req.body;

  const stmt = db.prepare(`
    UPDATE settings SET 
      secretaria_nome = ?, municipio_nome = ?, estado_nome = ?, 
      logo_prefeitura = ?, logo_secretaria = ?, nome_secretario = ?, 
      assinatura_digital = ?, config_exportacao = ?
    WHERE id = 1
  `);
  stmt.run(
    secretaria_nome, municipio_nome, estado_nome, 
    logo_prefeitura, logo_secretaria, nome_secretario, 
    assinatura_digital, config_exportacao,
  );
  res.json({ success: true });
});

// PDF Generation Helper
async function generatePlanHTML(plan: any, settings: any, user: any) {
  if (!settings) {
    settings = {
      secretaria_nome: 'Secretaria Municipal de Educação',
      municipio_nome: 'Município',
      estado_nome: 'Estado',
      config_exportacao: '{"include_fase_zero": true, "include_planos": true}'
    };
  }
  if (!user) {
    user = { nome: 'Professor' };
  }

  let config;
  try {
    config = JSON.parse(settings.config_exportacao || '{}');
  } catch (e) {
    config = { include_fase_zero: true, include_planos: true };
  }
  
  const validationCode = crypto.createHash('sha256').update(`${plan.id}-${plan.user_id}`).digest('hex').substring(0, 12).toUpperCase();
  
  let qrCodeDataUrl = '';
  try {
    qrCodeDataUrl = await QRCode.toDataURL(`https://bncc-ia.app/validar/${validationCode}`);
  } catch (e) {
    console.error("QR Code generation failed", e);
  }

  const sections = [];
  
  if (config.include_fase_zero && plan.fase_zero) {
    sections.push({ 
      title: "Fundamentação Teórica", 
      type: 'foundation',
      content: plan.fase_zero 
    });
  }

  if (config.include_planos) {
    [1, 2, 3, 4, 5].forEach(num => {
      const content = plan[`plano_0${num}`];
      if (content) {
        sections.push({ 
          title: `PLANO DE AULA 0${num}`, 
          type: 'lesson-plan',
          content 
        });
      }
    });
  }

  // References section
  sections.push({
    title: "Referências",
    type: 'standard',
    content: `
- BRASIL. Ministério da Educação. Base Nacional Comum Curricular. Brasília, 2018.
- BRASIL. Complemento à BNCC: Computação. Brasília, 2022.
- WING, J. M. Computational Thinking. Communications of the ACM, 2006.
- SBC. Referenciais de Formação em Computação da Educação Básica. 2017.
    `
  });

  // Pre-parse markdown for all sections
  for (const section of sections) {
    section.parsedContent = await marked.parse(section.content || '');
  }

  const toc = sections.map((s, i) => `
    <li class="toc-item">
      <span class="toc-title">${s.title}</span>
      <span class="toc-dots"></span>
      <span class="toc-page">${i + 4}</span>
    </li>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Planejamento Pedagógico - ${plan.habilidade_codigo}</title>
      <style>
        :root {
          --primary: #1e1b4b;
          --accent: #4f46e5;
          --secondary: #f1f5f9;
          --text: #0f172a;
          --text-muted: #64748b;
          --border: #e2e8f0;
          --white: #ffffff;
        }

        @page {
          size: A4;
          margin: 25mm 20mm 25mm 20mm;
        }

        body { 
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
          line-height: 1.5; 
          color: var(--text); 
          margin: 0; 
          padding: 0; 
          font-size: 12pt; 
          background: white;
          -webkit-print-color-adjust: exact;
        }

        @media print {
          @page {
            margin: 25mm 20mm 25mm 20mm;
          }
          .no-print { display: none !important; }
          body { background: white !important; }
          .content-page { padding: 0 !important; margin-bottom: 2cm !important; }
        }

        .page-break { page-break-after: always; clear: both; }
        
        /* CAPA INSTITUCIONAL */
        .capa { 
          height: 29.7cm;
          width: 21cm;
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          justify-content: space-between; 
          text-align: center; 
          padding: 2cm 0;
          position: relative;
          background: var(--white);
          box-sizing: border-box;
        }
        
        .capa-border {
          position: absolute;
          top: 1cm;
          left: 1cm;
          right: 1cm;
          bottom: 1cm;
          border: 1px solid var(--border);
          pointer-events: none;
        }

        .capa-header { 
          margin-top: 1cm; 
          width: 80%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .capa-logos { 
          display: flex; 
          justify-content: center; 
          align-items: center;
          gap: 40px; 
          margin-bottom: 0.8cm; 
          height: 80px;
        }
        .capa-logos img { height: 70px; max-width: 220px; object-fit: contain; }
        
        .inst-info {
          border-top: 1px solid var(--border);
          padding-top: 0.5cm;
          width: 100%;
        }
        .inst-info p { margin: 2px 0; font-size: 10pt; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }

        .capa-main { flex: 1; display: flex; flex-direction: column; justify-content: center; width: 85%; }
        .capa-title { 
          font-family: 'Playfair Display', serif;
          font-size: 34pt; 
          color: var(--primary); 
          margin: 0; 
          line-height: 1.1;
          font-weight: 900;
        }
        .capa-subtitle { 
          font-size: 16pt; 
          color: var(--accent); 
          margin-top: 15px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 3px;
        }
        .capa-divider {
          width: 100px;
          height: 4px;
          background: var(--accent);
          margin: 1.5cm auto;
        }
        .capa-desc {
          font-size: 13pt;
          color: var(--text-muted);
          max-width: 80%;
          margin: 0 auto;
          line-height: 1.5;
        }

        .capa-footer { 
          width: 80%;
          margin-bottom: 1.5cm;
          text-align: left;
          background: var(--secondary);
          padding: 1cm;
          border-radius: 12px;
        }
        .capa-footer p { margin: 8px 0; font-size: 10.5pt; color: var(--text); border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 4px; }
        .capa-footer strong { color: var(--primary); width: 140px; display: inline-block; }

        /* FOLHA DE ROSTO */
        .folha-rosto {
          height: 29.7cm;
          padding: 3cm 2.5cm;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }
        .rosto-header { border-bottom: 2px solid var(--primary); padding-bottom: 10px; margin-bottom: 2cm; }
        .rosto-title { font-size: 22pt; font-weight: 900; color: var(--primary); margin: 0; }
        .rosto-desc { font-size: 12pt; margin-bottom: 2cm; line-height: 1.8; text-align: justify; }
        .rosto-obj { background: var(--secondary); padding: 1.5cm; border-radius: 15px; border-left: 8px solid var(--primary); }
        .rosto-obj h3 { margin-top: 0; color: var(--primary); font-size: 14pt; text-transform: uppercase; }
        .rosto-obj p { margin-bottom: 0; font-style: italic; color: var(--text); }

        /* SUMÁRIO */
        .toc { padding: 3cm 2.5cm; height: 29.7cm; box-sizing: border-box; }
        .toc h2 { 
          font-family: 'Playfair Display', serif;
          font-size: 26pt; 
          color: var(--primary); 
          margin-bottom: 2cm;
          text-align: center;
        }
        .toc-list { list-style: none; padding: 0; }
        .toc-item { 
          display: flex; 
          align-items: baseline; 
          margin-bottom: 18px;
          font-size: 12pt;
        }
        .toc-title { flex-shrink: 0; font-weight: 600; color: var(--text); }
        .toc-dots { flex-grow: 1; border-bottom: 1px dotted var(--border); margin: 0 10px; }
        .toc-page { flex-shrink: 0; font-weight: 700; color: var(--primary); }

        /* INTERNAL PAGES */
        .content-page { 
          padding: 2.5cm; 
          min-height: 29.7cm;
          box-sizing: border-box;
          position: relative;
        }
        .internal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border);
          padding-bottom: 10px;
          margin-bottom: 1.5cm;
          font-size: 8.5pt;
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .chapter-title {
          margin-bottom: 1cm;
          padding: 0.8cm;
          background: var(--secondary);
          border-radius: 12px;
        }
        .chapter-label {
          font-size: 12pt;
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 3px;
          display: block;
          margin-bottom: 10px;
          font-weight: 700;
        }
        .chapter-main-title {
          font-family: 'Playfair Display', serif;
          font-size: 24pt;
          color: var(--primary);
          margin: 0;
          line-height: 1.2;
        }

        .lesson-plan-title {
          font-size: 18pt;
          font-weight: 900;
          color: var(--primary);
          margin-bottom: 0.8cm;
          text-transform: uppercase;
          display: inline-block;
          padding-bottom: 5px;
        }

        .section-content {
          text-align: justify;
          line-height: 1.5;
          font-size: 12pt;
        }
        .section-content p {
          margin-bottom: 1em;
        }
        .section-content h1 { font-size: 14pt; color: var(--primary); margin-top: 1cm; margin-bottom: 0.4cm; font-weight: 700; }
        .section-content h2 { font-size: 13pt; color: var(--primary); margin-top: 1cm; margin-bottom: 0.4cm; font-weight: 700; padding-left: 0; }
        .section-content h3 { font-size: 12pt; color: var(--accent); text-transform: uppercase; margin-top: 1cm; margin-bottom: 0.4cm; font-weight: 700; }
        
        .section-content ul, .section-content ol {
          margin-bottom: 1em;
          padding-left: 1.2cm;
        }
        .section-content li {
          margin-bottom: 0.4em;
        }

        /* TABLES */
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 1cm 0; 
          font-size: 9.5pt;
          background: white;
        }
        th { 
          background-color: var(--primary); 
          color: white;
          border: 1px solid var(--primary); 
          padding: 12px; 
          text-align: left; 
          text-transform: uppercase;
          font-weight: 700;
        }
        td { border: 1px solid var(--border); padding: 10px; vertical-align: top; }
        tr:nth-child(even) { background-color: var(--secondary); }
        
        img { max-width: 100%; height: auto; border-radius: 8px; }

        /* FINAL PAGE */
        .final-page {
          min-height: 29.7cm;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 3cm;
          box-sizing: border-box;
        }
        .final-title { font-family: 'Playfair Display', serif; font-size: 26pt; color: var(--primary); margin-bottom: 1.5cm; }
        .final-content { font-size: 12pt; line-height: 1.8; margin-bottom: 3cm; color: var(--text-muted); }
        
        .signature-area { width: 350px; display: flex; flex-direction: column; align-items: center; }
        .signature-line { width: 100%; border-top: 2px solid var(--primary); margin-bottom: 10px; }
        .signature-name { font-weight: 700; font-size: 12pt; color: var(--primary); margin: 0; }
        .signature-label { font-size: 10pt; color: var(--text-muted); margin: 0; text-transform: uppercase; letter-spacing: 1px; }
        
        .validation-footer {
          margin-top: auto;
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          font-size: 8.5pt;
          color: var(--text-muted);
          border-top: 1px solid var(--border);
          padding-top: 25px;
        }
      </style>
    </head>
    <body>
      <!-- CAPA -->
      <div class="capa">
        <div class="capa-border"></div>
        <div class="capa-header">
          <div class="capa-logos">
            ${settings.logo_prefeitura ? `<img src="${settings.logo_prefeitura}" alt="Logo Prefeitura" />` : ''}
            ${settings.logo_secretaria ? `<img src="${settings.logo_secretaria}" alt="Logo Secretaria" />` : ''}
          </div>
          <div class="inst-info">
            <p>${settings.secretaria_nome || 'Secretaria Municipal de Educação'}</p>
            <p>${settings.municipio_nome || 'Município'} – ${settings.estado_nome || 'Estado'}</p>
          </div>
        </div>
        
        <div class="capa-main">
          <h1 class="capa-title">PLANEJAMENTO PEDAGÓGICO</h1>
          <h2 class="capa-subtitle">BNCC – COMPUTAÇÃO</h2>
          <div class="capa-divider"></div>
          <p class="capa-desc">Desenvolvimento de Habilidades em Pensamento Computacional e Cultura Digital</p>
        </div>

        <div class="capa-footer">
          <p><strong>Habilidade:</strong> ${plan.habilidade_codigo}</p>
          <p><strong>Eixo:</strong> ${plan.eixo || 'Não informado'}</p>
          <p><strong>Professor(a):</strong> ${user.nome}</p>
          <p><strong>Escola:</strong> ${user.escola || 'Não informada'}</p>
          <p><strong>Ano Escolar:</strong> ${plan.ano_escolar || 'Não informado'}</p>
          <p><strong>Data de Emissão:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
        </div>
      </div>
      <div class="page-break"></div>

      <!-- FOLHA DE ROSTO -->
      <div class="folha-rosto">
        <div class="rosto-header">
          <h2 class="rosto-title">Relatório de Planejamento Estruturado</h2>
        </div>
        <p class="rosto-desc">
          Este documento apresenta uma proposta pedagógica completa e detalhada, rigorosamente alinhada às competências e habilidades da Base Nacional Comum Curricular (BNCC), com ênfase no Complemento à BNCC: Computação.
        </p>
        <p class="rosto-desc">
          O planejamento aqui contido visa instrumentalizar o docente com metodologias ativas, recursos tecnológicos e estratégias de avaliação processual, garantindo uma aprendizagem significativa e contextualizada para os estudantes do ${plan.ano_escolar || 'ano escolar informado'}.
        </p>
        <div class="rosto-obj">
          <h3>Diretriz Pedagógica</h3>
          <p>
            "A computação na educação básica deve ser compreendida como um conjunto de conhecimentos que permite ao estudante entender, analisar e intervir no mundo digital de forma crítica, ética e criativa."
          </p>
        </div>
      </div>
      <div class="page-break"></div>

      <!-- SUMÁRIO -->
      <div class="toc">
        <h2>SUMÁRIO</h2>
        <ul class="toc-list">${toc}</ul>
      </div>
      <div class="page-break"></div>

      <!-- CONTEÚDO -->
      ${sections.map((s, i) => `
        <div class="content-page">
          <div class="internal-header">
            <span>Planejamento Pedagógico Institucional</span>
            <span>Habilidade ${plan.habilidade_codigo}</span>
          </div>

          ${s.type === 'chapter' || s.type === 'foundation' ? `
            <div class="chapter-title">
              <h1 class="chapter-main-title">${s.title}</h1>
            </div>
          ` : s.type === 'lesson-plan' ? `
            <h1 class="lesson-plan-title">${s.title}</h1>
          ` : `
            <h1 style="color: var(--primary); padding-bottom: 10px; margin-bottom: 1cm; font-family: 'Playfair Display', serif;">${s.title}</h1>
          `}

          <div class="section-content">
            ${s.parsedContent}
          </div>
        </div>
        <div class="page-break"></div>
      `).join('')}

      <!-- PÁGINA FINAL -->
      <div class="final-page">
        <h2 class="final-title">Validação e Encerramento</h2>
        <p class="final-content">
          Documento gerado eletronicamente através da plataforma BNCC IA. 
          A implementação deste planejamento deve considerar as especificidades do contexto escolar e as necessidades individuais dos estudantes.
        </p>
        
        <div class="signature-area">
          ${settings.assinatura_digital ? `<img src="${settings.assinatura_digital}" style="height: 80px; margin-bottom: 10px;" alt="Assinatura" />` : ''}
          <div class="signature-line"></div>
          <p class="signature-name">${user.nome}</p>
          <p class="signature-label">Docente Responsável</p>
        </div>

        <div class="validation-footer">
          <div style="text-align: left;">
            <p style="margin: 0;">Autenticidade: <strong>${validationCode}</strong></p>
            <p style="margin: 0;">Emitido em: ${new Date().toLocaleString('pt-BR')}</p>
          </div>
          ${qrCodeDataUrl ? `<img src="${qrCodeDataUrl}" style="height: 80px;" alt="QR Code" />` : ''}
        </div>
      </div>
    </body>
    </html>
  `;
}

async function generateYearlyPlanHTML(plans: any[], settings: any, user: any, year: string) {
  if (!settings) {
    settings = {
      secretaria_nome: 'Secretaria Municipal de Educação',
      municipio_nome: 'Município',
      estado_nome: 'Estado',
      config_exportacao: '{"include_fase_zero": true, "include_planos": true}'
    };
  }
  
  const validationCode = crypto.createHash('sha256').update(`${year}-${user.id}`).digest('hex').substring(0, 12).toUpperCase();
  
  let qrCodeDataUrl = '';
  // Disable QR code for batch generation to save time and memory
  /*
  try {
    qrCodeDataUrl = await QRCode.toDataURL(`https://bncc-ia.app/validar/${validationCode}`);
  } catch (e) {
    console.error("QR Code generation failed", e);
  }
  */

  const allSections: any[] = [];
  plans.forEach((plan) => {
    allSections.push({ 
      title: `Habilidade ${plan.habilidade_codigo}`, 
      type: 'skill-header', 
      content: `## Planejamento para a Habilidade ${plan.habilidade_codigo}\n\n**Eixo:** ${plan.eixo || 'Não informado'}\n**Ano Escolar:** ${plan.ano_escolar || 'Não informado'}` 
    });
    
    if (plan.fase_zero) {
      allSections.push({ 
        title: `Fundamentação Teórica`, 
        type: 'foundation', 
        content: plan.fase_zero 
      });
    }
    
    for (let i = 1; i <= 5; i++) {
      const content = plan[`plano_0${i}`];
      if (content) {
        allSections.push({ 
          title: `Plano 0${i} (${plan.habilidade_codigo})`, 
          type: 'lesson-plan', 
          content 
        });
      }
    }
  });

  // Add References at the end
  allSections.push({
    title: "Referências Bibliográficas",
    type: 'standard',
    content: `
- BRASIL. Ministério da Educação. Base Nacional Comum Curricular. Brasília, 2018.
- BRASIL. Complemento à BNCC: Computação. Brasília, 2022.
- WING, J. M. Computational Thinking. Communications of the ACM, 2006.
- SBC. Referenciais de Formação em Computação da Educação Básica. 2017.
    `
  });

  console.log(`Total sections in yearly plan: ${allSections.length}`);

  // Parallelize markdown parsing with a concurrency limit to avoid CPU spikes
  const concurrencyLimit = 10;
  for (let i = 0; i < allSections.length; i += concurrencyLimit) {
    const chunk = allSections.slice(i, i + concurrencyLimit);
    await Promise.all(chunk.map(async (section) => {
      try {
        section.parsedContent = await marked.parse(section.content || '');
      } catch (e) {
        console.error(`Error parsing markdown for section ${section.title}:`, e);
        section.parsedContent = section.content || '';
      }
    }));
  }

  const toc = allSections.map((s, i) => `
    <li class="toc-item">
      <span class="toc-title">${s.title}</span>
      <span class="toc-dots"></span>
      <span class="toc-page">${i + 4}</span>
    </li>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Currículo Anual - ${year}</title>
      <style>
        :root { --primary: #1e1b4b; --accent: #4f46e5; --secondary: #f1f5f9; --text: #0f172a; --text-muted: #64748b; --border: #e2e8f0; --white: #ffffff; }
        @page { size: A4; margin: 25mm 20mm; }
        body { font-family: -apple-system, sans-serif; line-height: 1.5; color: var(--text); margin: 0; padding: 0; font-size: 12pt; background: white; -webkit-print-color-adjust: exact; }
        @media print { .no-print { display: none !important; } .content-page { padding: 0 !important; margin-bottom: 2cm !important; } }
        .page-break { page-break-after: always; clear: both; }
        .capa { height: 29.7cm; width: 21cm; display: flex; flex-direction: column; align-items: center; justify-content: space-between; text-align: center; padding: 2cm 0; position: relative; background: var(--white); box-sizing: border-box; }
        .capa-border { position: absolute; top: 1cm; left: 1cm; right: 1cm; bottom: 1cm; border: 1px solid var(--border); pointer-events: none; }
        .capa-header { margin-top: 1cm; width: 80%; display: flex; flex-direction: column; align-items: center; }
        .capa-logos { display: flex; justify-content: center; align-items: center; gap: 40px; margin-bottom: 0.8cm; height: 80px; }
        .capa-logos img { height: 70px; max-width: 220px; object-fit: contain; }
        .inst-info { border-top: 1px solid var(--border); padding-top: 0.5cm; width: 100%; }
        .inst-info p { margin: 2px 0; font-size: 10pt; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
        .capa-main { flex: 1; display: flex; flex-direction: column; justify-content: center; width: 85%; }
        .capa-title { font-size: 34pt; color: var(--primary); margin: 0; line-height: 1.1; font-weight: 900; }
        .capa-subtitle { font-size: 16pt; color: var(--accent); margin-top: 15px; font-weight: 600; text-transform: uppercase; letter-spacing: 3px; }
        .capa-divider { width: 100px; height: 4px; background: var(--accent); margin: 1.5cm auto; }
        .capa-desc { font-size: 13pt; color: var(--text-muted); max-width: 80%; margin: 0 auto; line-height: 1.5; }
        .capa-footer { width: 80%; margin-bottom: 1.5cm; text-align: left; background: var(--secondary); padding: 1cm; border-radius: 12px; }
        .capa-footer p { margin: 8px 0; font-size: 10.5pt; color: var(--text); border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 4px; }
        .capa-footer strong { color: var(--primary); width: 140px; display: inline-block; }
        .toc { padding: 3cm 2.5cm; min-height: 29.7cm; box-sizing: border-box; }
        .toc h2 { font-size: 26pt; color: var(--primary); margin-bottom: 2cm; text-align: center; }
        .toc-list { list-style: none; padding: 0; }
        .toc-item { display: flex; align-items: baseline; margin-bottom: 18px; font-size: 12pt; }
        .toc-title { flex-shrink: 0; font-weight: 600; color: var(--text); }
        .toc-dots { flex-grow: 1; border-bottom: 1px dotted var(--border); margin: 0 10px; }
        .toc-page { flex-shrink: 0; font-weight: 700; color: var(--primary); }
        .content-page { padding: 2.5cm; min-height: 29.7cm; box-sizing: border-box; position: relative; }
        .internal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 10px; margin-bottom: 1.5cm; font-size: 8.5pt; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
        .chapter-title { margin-bottom: 1cm; padding: 0.8cm; background: var(--secondary); border-radius: 12px; }
        .chapter-main-title { font-size: 24pt; color: var(--primary); margin: 0; line-height: 1.2; }
        .skill-header-box { background: var(--primary); color: white; padding: 1cm; border-radius: 12px; margin-bottom: 1cm; }
        .skill-header-box h2 { margin: 0; font-size: 20pt; }
        .lesson-plan-title { font-size: 18pt; font-weight: 900; color: var(--primary); margin-bottom: 0.8cm; text-transform: uppercase; display: inline-block; padding-bottom: 5px; }
        .section-content { text-align: justify; line-height: 1.5; font-size: 12pt; }
        .section-content p { margin-bottom: 1em; }
        .section-content h1 { font-size: 14pt; color: var(--primary); margin-top: 1cm; margin-bottom: 0.4cm; font-weight: 700; }
        .section-content h2 { font-size: 13pt; color: var(--primary); margin-top: 1cm; margin-bottom: 0.4cm; font-weight: 700; }
        .section-content h3 { font-size: 12pt; color: var(--accent); text-transform: uppercase; margin-top: 1cm; margin-bottom: 0.4cm; font-weight: 700; }
        .section-content ul, .section-content ol { margin-bottom: 1em; padding-left: 1.2cm; }
        .section-content li { margin-bottom: 0.4em; }
        table { width: 100%; border-collapse: collapse; margin: 1cm 0; font-size: 9.5pt; background: white; }
        th { background-color: var(--primary); color: white; border: 1px solid var(--primary); padding: 12px; text-align: left; text-transform: uppercase; font-weight: 700; }
        td { border: 1px solid var(--border); padding: 10px; vertical-align: top; }
        tr:nth-child(even) { background-color: var(--secondary); }
        img { max-width: 100%; height: auto; border-radius: 8px; }
        .final-page { min-height: 29.7cm; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 3cm; box-sizing: border-box; }
        .final-title { font-size: 26pt; color: var(--primary); margin-bottom: 1.5cm; }
        .final-content { font-size: 12pt; line-height: 1.8; margin-bottom: 3cm; color: var(--text-muted); }
        .signature-area { width: 350px; display: flex; flex-direction: column; align-items: center; }
        .signature-line { width: 100%; border-top: 2px solid var(--primary); margin-bottom: 10px; }
        .signature-name { font-weight: 700; font-size: 12pt; color: var(--primary); margin: 0; }
        .signature-label { font-size: 10pt; color: var(--text-muted); margin: 0; text-transform: uppercase; letter-spacing: 1px; }
        .validation-footer { margin-top: auto; width: 100%; display: flex; justify-content: space-between; align-items: flex-end; font-size: 8.5pt; color: var(--text-muted); border-top: 1px solid var(--border); padding-top: 25px; }
      </style>
    </head>
    <body>
      <!-- CAPA -->
      <div class="capa">
        <div class="capa-border"></div>
        <div class="capa-header">
          <div class="capa-logos">
            ${settings.logo_prefeitura ? `<img src="${settings.logo_prefeitura}" alt="Logo Prefeitura" />` : ''}
            ${settings.logo_secretaria ? `<img src="${settings.logo_secretaria}" alt="Logo Secretaria" />` : ''}
          </div>
          <div class="inst-info">
            <p>${settings.secretaria_nome || 'Secretaria Municipal de Educação'}</p>
            <p>${settings.municipio_nome || 'Município'} – ${settings.estado_nome || 'Estado'}</p>
          </div>
        </div>
        
        <div class="capa-main">
          <h1 class="capa-title">CURRÍCULO ANUAL ESTRUTURADO</h1>
          <h2 class="capa-subtitle">BNCC – COMPUTAÇÃO</h2>
          <div class="capa-divider"></div>
          <p class="capa-desc">Compilado Integral de Planejamentos Pedagógicos para o Ano Letivo de ${year}</p>
        </div>

        <div class="capa-footer">
          <p><strong>Instituição:</strong> ${settings.secretaria_nome}</p>
          <p><strong>Ano de Referência:</strong> ${year}</p>
          <p><strong>Professor Responsável:</strong> ${user.nome}</p>
          <p><strong>Total de Habilidades:</strong> ${plans.length}</p>
          <p><strong>Data de Emissão:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
        </div>
      </div>
      <div class="page-break"></div>
 
      <!-- FOLHA DE ROSTO -->
      <div class="folha-rosto">
        <div class="rosto-header">
          <h2 class="rosto-title">Currículo Anual de Computação</h2>
        </div>
        <p class="rosto-desc">
          Este documento consolida o planejamento pedagógico anual para o componente de Computação, abrangendo todas as habilidades previstas na BNCC para o ${year}.
        </p>
        <p class="rosto-desc">
          A organização aqui apresentada segue uma progressão lógica de competências, integrando o Pensamento Computacional, o Mundo Digital e a Cultura Digital de forma transversal e significativa.
        </p>
        <div class="rosto-obj">
          <h3>Diretriz Curricular</h3>
          <p>
            "A integração da computação no currículo escolar visa preparar os estudantes para compreenderem e transformarem a realidade digital, desenvolvendo autonomia e criticidade."
          </p>
        </div>
      </div>
      <div class="page-break"></div>

      <div class="toc">
        <h2>SUMÁRIO DO ANO</h2>
        <ul class="toc-list">${toc}</ul>
      </div>
      <div class="page-break"></div>

      ${allSections.map((s, i) => `
        <div class="content-page">
          <div class="internal-header">
            <span>Currículo Anual – ${year}</span>
            <span>BNCC IA</span>
          </div>

          ${s.type === 'skill-header' ? `
            <div class="skill-header-box">
              <h2>${s.title}</h2>
            </div>
          ` : s.type === 'chapter' || s.type === 'foundation' ? `
            <div class="chapter-title">
              <h1 class="chapter-main-title">${s.title}</h1>
            </div>
          ` : s.type === 'lesson-plan' ? `
            <h1 class="lesson-plan-title">${s.title}</h1>
          ` : `
            <h1 style="color: var(--primary); padding-bottom: 10px; margin-bottom: 1cm; font-family: 'Playfair Display', serif;">${s.title}</h1>
          `}

          <div class="section-content">
            ${s.parsedContent}
          </div>
        </div>
        <div class="page-break"></div>
      `).join('')}

      <div class="final-page">
        <div>
          <h2 style="color: var(--primary);">Considerações Finais</h2>
          <p>Este currículo anual foi organizado de forma progressiva para garantir a construção contínua do conhecimento.</p>
        </div>
        
        <div class="signature-area">
          ${settings.assinatura_digital ? `<img src="${settings.assinatura_digital}" style="height: 80px; margin-bottom: 10px;" alt="Assinatura" />` : ''}
          <div class="signature-line"></div>
          <p style="font-weight: bold; margin: 0;">${user.nome}</p>
          <p style="font-size: 10pt; color: #666;">Professor(a) Responsável</p>
        </div>

        <div class="validation-footer">
          <div style="text-align: left;">
            <p>Código de Autenticidade: <strong>${validationCode}</strong></p>
            <p>Verifique em: bncc-ia.app/validar</p>
          </div>
          ${qrCodeDataUrl ? `<img src="${qrCodeDataUrl}" style="height: 70px;" alt="QR Code" />` : ''}
        </div>
      </div>
    </body>
    </html>
  `;
}

app.get("/api/plans/batch-pdf", authenticateToken, async (req: any, res) => {
  // Disable timeouts for this long-running request
  req.setTimeout(0);
  res.setTimeout(0);
  
  const { year: yearRaw } = req.query;
  const year = Array.isArray(yearRaw) ? String(yearRaw[0]) : String(yearRaw || '');
  
  console.log(`Batch PDF request received for year: "${year}" for user ID: ${req.user.id}, Name: ${req.user.nome}`);
  
  if (!year || year === 'undefined') return res.status(400).json({ error: "Ano não especificado" });

  try {
    // Use LIKE for more flexible matching (e.g. "1º Ano" vs "1º ano")
    // Handle "Outros" case where ano_escolar is null
    let plans;
    if (year === 'Outros') {
      plans = db.prepare("SELECT * FROM plans WHERE user_id = ? AND (ano_escolar IS NULL OR ano_escolar = '' OR TRIM(ano_escolar) = '') ORDER BY habilidade_codigo ASC").all(req.user.id);
    } else {
      // Use LOWER and TRIM for maximum compatibility, plus partial LIKE as fallback
      plans = db.prepare("SELECT * FROM plans WHERE user_id = ? AND (LOWER(TRIM(ano_escolar)) = LOWER(TRIM(?)) OR ano_escolar LIKE ?) ORDER BY habilidade_codigo ASC").all(req.user.id, year, `%${year}%`);
    }
    
    console.log(`Found ${plans.length} plans for year "${year}"`);
    
    if (plans.length === 0) {
      return res.status(404).json({ error: `Nenhum planejamento encontrado para "${year}".` });
    }

    const totalContentLength = plans.reduce((acc: number, p: any) => acc + (p.fase_zero?.length || 0) + (p.plano_01?.length || 0) + (p.plano_02?.length || 0) + (p.plano_03?.length || 0) + (p.plano_04?.length || 0) + (p.plano_05?.length || 0), 0);
    console.log(`Total content length across all plans: ${totalContentLength} characters`);

    const settings = db.prepare("SELECT * FROM settings WHERE id = 1").get();
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);

    console.time(`PDF_Generation_${year}`);
    let html: string | null = await generateYearlyPlanHTML(plans, settings, user, year as string);
    console.log(`HTML generated for yearly plan. Length: ${html.length} characters.`);

    let browser;
    try {
      browser = await puppeteer.launch({
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox', 
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-zygote',
          '--single-process',
          '--disable-extensions',
          '--disable-background-networking',
          '--disable-default-apps',
          '--disable-sync',
          '--disable-translate',
          '--metrics-recording-only',
          '--safebrowsing-disable-auto-update',
          '--js-flags="--max-old-space-size=4096"'
        ],
        headless: true,
        timeout: 600000
      });
      const page = await browser.newPage();
      
      // Block ALL external requests to maximize speed and minimize memory
      await page.setRequestInterception(true);
      page.on('request', (request) => {
        request.abort();
      });
      
      // Log console messages from the page
      page.on('console', msg => console.log('PAGE LOG:', msg.text()));
      page.on('pageerror', (err: any) => console.error('PAGE ERROR:', err.message || err));

      await page.setViewport({ width: 1200, height: 1600 });
      await page.emulateMediaType('print');

      console.log(`Generating batch PDF for year ${year}... Plans count: ${plans.length}`);
      
      // Use setContent with a longer timeout and 'domcontentloaded' for faster start
      await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 600000 });
      
      // Clear HTML string from memory as it's now in Puppeteer
      html = null;

      console.log(`Starting PDF export for year ${year}...`);
      
      let pdf: Uint8Array | null = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: '2.5cm', bottom: '2.5cm', left: '2cm', right: '2cm' },
        displayHeaderFooter: true,
        headerTemplate: '<div style="font-size: 7px; width: 100%; text-align: center; color: #bbb; font-family: Arial; margin: 10px auto;">CURRÍCULO ANUAL PROGRESSIVO – TEACHER DIGITAL IA</div>',
        footerTemplate: `
          <div style="font-size: 8px; width: 100%; display: flex; justify-content: space-between; padding: 0 20px; color: #999; font-family: Arial;">
            <span>Teacher Digital IA - ${year}</span>
            <span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
          </div>
        `,
        timeout: 600000
      });

      console.log(`PDF export finished for year ${year}. Size: ${pdf?.length || 0} bytes.`);

      await browser.close();
      browser = null;
      
      if (!pdf || pdf.length === 0) {
        console.error("Puppeteer returned an empty PDF result");
        throw new Error("PDF gerado está vazio");
      }

      const pdfBuffer = Buffer.from(pdf);
      pdf = null; // Clear Uint8Array
      console.log(`Batch PDF buffer created successfully. Size: ${pdfBuffer.length} bytes`);
      
      const safeYear = (year as string).replace(/[^a-z0-9]/gi, '_');
      
      res.status(200)
         .attachment(`Curriculo_Anual_${safeYear}.pdf`)
         .set({
           'Content-Type': 'application/pdf',
           'Content-Length': pdfBuffer.length,
           'Cache-Control': 'no-cache, no-store, must-revalidate',
           'Pragma': 'no-cache',
           'Expires': '0'
         })
         .send(pdfBuffer);
         
      console.log(`Batch PDF sent to client for year: ${year}`);
    } catch (err) {
      console.error("Puppeteer error during batch PDF generation:", err);
      if (browser) {
        try {
          await (browser as any).close();
        } catch (e) {}
      }
      if (!res.headersSent) {
        res.status(500).json({ error: "Erro técnico ao gerar o PDF. O documento pode ser muito grande ou houve falha no motor de impressão. Tente gerar por partes se possível." });
      }
    }
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Erro ao gerar PDF em lote" });
    }
  }
});

app.get("/api/plans/:id/pdf", authenticateToken, async (req: any, res) => {
  try {
    const plan = db.prepare("SELECT * FROM plans WHERE id = ? AND user_id = ?").get(req.params.id, req.user.id);
    if (!plan) return res.status(404).json({ error: "Plano não encontrado" });

    const settings = db.prepare("SELECT * FROM settings WHERE id = 1").get();
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);

    const html = await generatePlanHTML(plan, settings, user);

    const browser = await puppeteer.launch({
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-zygote',
        '--disable-extensions',
        '--disable-background-networking',
        '--font-render-hinting=none'
      ],
      headless: true
    });
    const page = await browser.newPage();
    
    // Log console messages from the page
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', (err: any) => console.error('PAGE ERROR:', err.message || err));

    // Set viewport for consistent rendering
    await page.setViewport({ width: 1200, height: 1600 });
    await page.emulateMediaType('print');

    try {
      console.log(`Generating individual PDF for plan ${req.params.id}...`);
      await page.setContent(html, { 
        waitUntil: 'load',
        timeout: 150000 
      });

      // Wait for fonts
      try {
        await page.evaluateHandle('document.fonts.ready');
      } catch (e) {}
      
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: '2.5cm', bottom: '2.5cm', left: '2.5cm', right: '2.5cm' },
        displayHeaderFooter: true,
        headerTemplate: `
          <div style="font-size: 8px; width: 100%; text-align: center; color: #ccc; font-family: Arial; padding-top: 1cm;">
            BNCC IA – PLANEJAMENTO PEDAGÓGICO ESTRUTURADO
          </div>
        `,
        footerTemplate: `
          <div style="font-size: 9px; width: 100%; display: flex; justify-content: space-between; padding: 0 2.5cm; color: #999; font-family: Arial;">
            <span>Gerado em ${new Date().toLocaleDateString('pt-BR')}</span>
            <span class="pageNumber"></span>
          </div>
        `,
        timeout: 150000
      });

      await browser.close();

      if (!pdf || pdf.length === 0) {
        throw new Error("PDF gerado está vazio");
      }

      const pdfBuffer = Buffer.from(pdf);
      console.log(`Individual PDF buffer created. Size: ${pdfBuffer.length} bytes`);
      const safeAno = (plan.ano_escolar || 'Ano').replace(/[^a-z0-9]/gi, '_');
      const safeEixo = (plan.eixo || 'Eixo').replace(/[^a-z0-9]/gi, '_');
      const filename = `Planejamento_${safeAno}_${safeEixo}_${plan.habilidade_codigo}.pdf`;

      res.status(200)
         .attachment(filename)
         .set({
           'Cache-Control': 'no-cache, no-store, must-revalidate',
           'Pragma': 'no-cache',
           'Expires': '0'
         })
         .send(pdfBuffer);
      console.log(`Individual PDF sent to client for plan ${req.params.id}`);
    } catch (pageErr) {
      console.error("Puppeteer page error:", pageErr);
      if (browser) await browser.close();
      if (!res.headersSent) {
        res.status(500).json({ error: "Erro ao processar o PDF individual." });
      }
    }
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Erro ao gerar PDF" });
    }
  }
});

app.get("/api/plans/:id/docx", authenticateToken, async (req: any, res) => {
  try {
    const plan = db.prepare("SELECT * FROM plans WHERE id = ? AND user_id = ?").get(req.params.id, req.user.id);
    if (!plan) return res.status(404).json({ error: "Plano não encontrado" });

    const settings = db.prepare("SELECT * FROM settings WHERE id = 1").get();
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);

    const html = await generatePlanHTML(plan, settings, user);
    
    // Simple HTML cleanup for Word
    const cleanHtml = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="UTF-8"></head>
        <body>
          ${html.split('<body>')[1].split('</body>')[0]}
        </body>
      </html>
    `;

    const docx = await HTMLtoDOCX(cleanHtml, null, {
      table: { row: { cantSplit: true } },
      footer: true,
      pageNumber: true,
    });

    const safeAno = (plan.ano_escolar || 'Ano').replace(/[^a-z0-9]/gi, '_');
    const safeEixo = (plan.eixo || 'Eixo').replace(/[^a-z0-9]/gi, '_');
    const filename = `Planejamento_${safeAno}_${safeEixo}_${plan.habilidade_codigo}.docx`;

    const docxBuffer = Buffer.from(docx);
    res.status(200)
       .attachment(filename)
       .set({
         'Cache-Control': 'no-cache, no-store, must-revalidate'
       })
       .send(docxBuffer);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Erro ao gerar Word" });
    }
  }
});

app.get("/api/plans/:id/html", authenticateToken, async (req: any, res) => {
  try {
    const plan = db.prepare("SELECT * FROM plans WHERE id = ? AND user_id = ?").get(req.params.id, req.user.id);
    if (!plan) return res.status(404).json({ error: "Plano não encontrado" });

    const settings = db.prepare("SELECT * FROM settings WHERE id = 1").get();
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);

    const html = await generatePlanHTML(plan, settings, user);
    res.send(html);
  } catch (err) {
    res.status(500).json({ error: "Erro ao gerar HTML" });
  }
});

app.get("/api/admin/batch-export", authenticateToken, async (req: any, res) => {
  if (req.user.perfil !== 'Gestor') {
    return res.status(403).json({ error: "Acesso negado" });
  }

  try {
    const plans = db.prepare(`
      SELECT p.*, u.nome as professor_nome, u.escola 
      FROM plans p 
      JOIN users u ON p.user_id = u.id 
      ORDER BY p.id DESC
    `).all();

    const settings = db.prepare("SELECT * FROM settings WHERE id = 1").get();
    const zip = new JSZip();
    
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--no-zygote', '--single-process'],
      headless: true
    });

    for (const plan of plans) {
      const user = { nome: plan.professor_nome, escola: plan.escola };
      const html = await generatePlanHTML(plan, settings, user);
      
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '2.5cm', bottom: '2.5cm', left: '2.5cm', right: '2.5cm' }
      });
      await page.close();
      
      zip.file(`Planejamento_${plan.professor_nome}_${plan.habilidade_codigo}_${plan.id}.pdf`, pdf);
    }

    await browser.close();
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=Exportacao_Lote_BNCC_IA.zip');
    res.send(zipBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro na exportação em lote" });
  }
});
async function startServer() {
  await seedUser();
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
