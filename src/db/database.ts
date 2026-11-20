import * as SQLite from 'expo-sqlite';
import { NovoRelato, Relato } from '../types';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDb() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('deslocai.db').then(async (db) => {
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS relatos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          tipo TEXT NOT NULL,
          linha_id TEXT NOT NULL,
          linha_nome TEXT NOT NULL,
          estacao_id INTEGER NOT NULL DEFAULT 0,
          estacao TEXT NOT NULL,
          descricao TEXT NOT NULL DEFAULT '',
          criado_em TEXT NOT NULL,
          sincronizado INTEGER NOT NULL DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS favoritos (
          linha_id TEXT PRIMARY KEY NOT NULL,
          nome TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS config (
          chave TEXT PRIMARY KEY NOT NULL,
          valor TEXT NOT NULL
        );
      `);
      
      const colunas = await db.getAllAsync<{ name: string }>('PRAGMA table_info(relatos)');
      if (!colunas.some((c) => c.name === 'estacao_id')) {
        await db.execAsync('ALTER TABLE relatos ADD COLUMN estacao_id INTEGER NOT NULL DEFAULT 0');
      }
      return db;
    });
  }
  return dbPromise;
}

const toRelato = (r: any): Relato => ({
  id: r.id,
  tipo: r.tipo,
  linhaId: r.linha_id,
  linhaNome: r.linha_nome,
  estacaoId: r.estacao_id,
  estacao: r.estacao,
  descricao: r.descricao,
  criadoEm: r.criado_em,
  sincronizado: r.sincronizado === 1,
});

export async function inserirRelato(r: NovoRelato): Promise<Relato> {
  const db = await getDb();
  const criadoEm = new Date().toISOString();
  const res = await db.runAsync(
    'INSERT INTO relatos (tipo, linha_id, linha_nome, estacao_id, estacao, descricao, criado_em) VALUES (?, ?, ?, ?, ?, ?, ?)',
    r.tipo, r.linhaId, r.linhaNome, r.estacaoId, r.estacao, r.descricao, criadoEm
  );
  return { ...r, id: res.lastInsertRowId, criadoEm, sincronizado: false };
}

export async function listarRelatos(): Promise<Relato[]> {
  const db = await getDb();
  const rows = await db.getAllAsync('SELECT * FROM relatos ORDER BY id DESC');
  return rows.map(toRelato);
}

export async function marcarSincronizado(id: number) {
  const db = await getDb();
  await db.runAsync('UPDATE relatos SET sincronizado = 1 WHERE id = ?', id);
}

export async function removerRelato(id: number) {
  const db = await getDb();
  await db.runAsync('DELETE FROM relatos WHERE id = ?', id);
}

export async function listarFavoritos(): Promise<string[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ linha_id: string }>('SELECT linha_id FROM favoritos');
  return rows.map((r) => r.linha_id);
}

export async function alternarFavorito(linhaId: string, nome: string): Promise<boolean> {
  const db = await getDb();
  const ja = await db.getFirstAsync('SELECT 1 FROM favoritos WHERE linha_id = ?', linhaId);
  if (ja) {
    await db.runAsync('DELETE FROM favoritos WHERE linha_id = ?', linhaId);
    return false;
  }
  await db.runAsync('INSERT INTO favoritos (linha_id, nome) VALUES (?, ?)', linhaId, nome);
  return true;
}

export async function getConfig(chave: string): Promise<string | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ valor: string }>('SELECT valor FROM config WHERE chave = ?', chave);
  return row?.valor ?? null;
}

export async function setConfig(chave: string, valor: string) {
  const db = await getDb();
  await db.runAsync('INSERT OR REPLACE INTO config (chave, valor) VALUES (?, ?)', chave, valor);
}
