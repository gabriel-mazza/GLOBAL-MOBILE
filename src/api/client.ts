import {
  AlertaAtivo,
  Equipamento,
  Estacao,
  Linha,
  Modal,
  Perfil,
  Severidade,
  TIPOS_RELATO,
  TipoRelato,
} from '../types';
import { MOCK_LINHAS } from './mock';
import { lotacaoDe, montarLinha } from './montar';

const BASE = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, '');

export const usandoApi = BASE.length > 0;

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 7000);
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}



const lista = (d: any): any[] => (Array.isArray(d) ? d : d?.items ?? d?.dados ?? []);

function indice(valor: any, nomes: string[]): number {
  if (typeof valor === 'number') return valor;
  return nomes.indexOf(String(valor).toLowerCase());
}

const MODAL_API: Modal[] = ['metro', 'trem', 'onibus']; // TipoTransporte
const SEVERIDADES: Severidade[] = ['baixa', 'media', 'alta', 'critica']; // Severidade 1..4

function severidade(valor: any): Severidade {
  if (typeof valor === 'number') return SEVERIDADES[Math.min(Math.max(valor, 1), 4) - 1];
  const i = SEVERIDADES.indexOf(String(valor).toLowerCase() as Severidade);
  return SEVERIDADES[i >= 0 ? i : 0];
}

function equipamento(q: any): Equipamento {
  const tipo = indice(q.tipo, ['elevador', 'escadarolante']) === 1 ? 'escada_rolante' : 'elevador';
  const s = indice(q.status, ['operante', 'inoperante', 'emmanutencao']);
  const status = s === 1 ? 'inoperante' : s === 2 ? 'manutencao' : 'operante';
  return { id: q.id, tipo, identificador: q.identificador, status, operando: status === 'operante' };
}

function alerta(a: any): AlertaAtivo {
  return { id: a.id, severidade: severidade(a.severidade), mensagem: a.mensagem };
}

const CORES_LINHA: [string, string][] = [
  ['azul', '#1F5FBF'],
  ['vermelha', '#D32F2F'],
  ['verde', '#2E8B57'],
  ['amarela', '#E6B800'],
  ['lilás', '#7B3FA0'],
  ['lilas', '#7B3FA0'],
  ['prata', '#8A9BA8'],
  ['rubi', '#B0123F'],
  ['diamante', '#7D6B7D'],
  ['esmeralda', '#00A19A'],
  ['turquesa', '#10A5B5'],
  ['coral', '#F26B50'],
  ['safira', '#1E3A8A'],
  ['jade', '#3AA675'],
];
const COR_MODAL: Record<Modal, string> = { metro: '#1F5FBF', trem: '#7D6B7D', onibus: '#F5A300' };

function corDaLinha(nome: string, modal: Modal): string {
  const n = nome.toLowerCase();
  return CORES_LINHA.find(([k]) => n.includes(k))?.[1] ?? COR_MODAL[modal];
}

export interface ResultadoLinhas {
  linhas: Linha[];
  origem: 'api' | 'mock';
}


async function linhasDaApi(): Promise<Linha[]> {
  const [estacoesRaw, equipamentosRaw, alertasRaw] = await Promise.all([
    http<any>('/api/estacoes'),
    http<any>('/api/equipamentos'),
    http<any>('/api/alertas'),
  ]);
  const estacoes = lista(estacoesRaw);

  
  const detalhes = await Promise.all(
    estacoes.map((e) => http<any>(`/api/estacoes/${e.id}`).catch(() => null))
  );

  const equipPorEstacao = new Map<number, Equipamento[]>();
  for (const q of lista(equipamentosRaw)) {
    const arr = equipPorEstacao.get(q.estacaoId) ?? [];
    arr.push(equipamento(q));
    equipPorEstacao.set(q.estacaoId, arr);
  }
  const alertasPorEstacao = new Map<number, AlertaAtivo[]>();
  for (const a of lista(alertasRaw)) {
    const arr = alertasPorEstacao.get(a.estacaoId) ?? [];
    arr.push(alerta(a));
    alertasPorEstacao.set(a.estacaoId, arr);
  }

  const grupos = new Map<string, { nome: string; modal: Modal; estacoes: Estacao[] }>();
  estacoes.forEach((e, i) => {
    const d = detalhes[i];
    const modal = MODAL_API[indice(e.tipo, MODAL_API)] ?? 'metro';
    const ocupacao: number | null = d?.ocupacaoAtualPercentual ?? null;
    const estacao: Estacao = {
      id: e.id,
      nome: e.nome,
      ocupacaoPercentual: ocupacao,
      lotacao: lotacaoDe(ocupacao),
      temperaturaC: d?.temperaturaAtualC ?? null,
      acessivelPcd: d?.acessivelParaPcd ?? true,
      equipamentos: equipPorEstacao.get(e.id) ?? [],
      alertas: alertasPorEstacao.get(e.id) ?? [],
    };
    const chave = `${modal}:${e.linha}`;
    const g: { nome: string; modal: Modal; estacoes: Estacao[] } = grupos.get(chave) ?? {
      nome: e.linha,
      modal,
      estacoes: [],
    };
    g.estacoes.push(estacao);
    grupos.set(chave, g);
  });

  return [...grupos.entries()]
    .map(([id, g]) => montarLinha(id, g.nome, g.modal, corDaLinha(g.nome, g.modal), g.estacoes))
    .sort((a, b) => a.modal.localeCompare(b.modal) || a.nome.localeCompare(b.nome));
}

export async function getLinhas(): Promise<ResultadoLinhas> {
  if (usandoApi) {
    try {
      return { linhas: await linhasDaApi(), origem: 'api' };
    } catch {
      
    }
  }
  await new Promise((r) => setTimeout(r, 350));
  return { linhas: MOCK_LINHAS, origem: 'mock' };
}


const TIPO_RELATO_API: Record<TipoRelato, number> = { lotacao: 0, calor: 1, elevador: 2, escada_rolante: 2 };

const PERFIL_API: Record<Perfil, number> = { idoso: 1, pcd: 2, estudante: 3, trabalhador: 4 };


function descricaoParaApi(tipo: TipoRelato, texto: string): string {
  const rotulo = TIPOS_RELATO.find((t) => t.id === tipo)?.label ?? 'Relato';
  const extra = texto.trim();
  return (extra ? `${rotulo}: ${extra}` : `${rotulo} relatado pelo app.`).slice(0, 280);
}


export async function enviarRelato(
  r: { estacaoId: number; tipo: TipoRelato; descricao: string },
  perfil: Perfil
): Promise<boolean> {
  if (!usandoApi) return false;
  try {
    await http('/api/relatos', {
      method: 'POST',
      body: JSON.stringify({
        estacaoId: r.estacaoId,
        tipo: TIPO_RELATO_API[r.tipo],
        perfilRelator: PERFIL_API[perfil],
        descricao: descricaoParaApi(r.tipo, r.descricao),
      }),
    });
    return true;
  } catch {
    return false;
  }
}
