import { Estacao, Linha, Lotacao, Modal } from '../types';

const ORDEM: Lotacao[] = ['sem_dados', 'baixa', 'media', 'alta'];


export function lotacaoDe(percentual: number | null): Lotacao {
  if (percentual == null) return 'sem_dados';
  if (percentual < 50) return 'baixa';
  if (percentual < 80) return 'media';
  return 'alta';
}


export function montarLinha(id: string, nome: string, modal: Modal, cor: string, estacoes: Estacao[]): Linha {
  const lotacao = estacoes.reduce<Lotacao>(
    (pior, e) => (ORDEM.indexOf(e.lotacao) > ORDEM.indexOf(pior) ? e.lotacao : pior),
    'sem_dados'
  );
  const temps = estacoes.map((e) => e.temperaturaC).filter((v): v is number => v != null);
  const temperaturaC = temps.length ? Math.round(temps.reduce((a, b) => a + b, 0) / temps.length) : null;
  return { id, nome, modal, cor, lotacao, temperaturaC, estacoes };
}
