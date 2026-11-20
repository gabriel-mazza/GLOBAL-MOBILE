import { AlertaAtivo, Equipamento, Estacao, Linha, StatusEquip } from '../types';
import { lotacaoDe, montarLinha } from './montar';

let seq = 1;

const eq = (
  tipo: Equipamento['tipo'],
  identificador: string,
  status: StatusEquip = 'operante'
): Equipamento => ({ id: seq++, tipo, identificador, status, operando: status === 'operante' });

const est = (
  nome: string,
  ocupacao: number | null,
  temp: number | null,
  equipamentos: Equipamento[],
  alertas: AlertaAtivo[] = []
): Estacao => {
  const elevadores = equipamentos.filter((q) => q.tipo === 'elevador');
  return {
    id: seq++,
    nome,
    ocupacaoPercentual: ocupacao,
    lotacao: lotacaoDe(ocupacao),
    temperaturaC: temp,
    acessivelPcd: elevadores.length === 0 || elevadores.some((q) => q.operando),
    equipamentos,
    alertas,
  };
};

const alerta = (severidade: AlertaAtivo['severidade'], mensagem: string): AlertaAtivo => ({
  id: seq++,
  severidade,
  mensagem,
});

export const MOCK_LINHAS: Linha[] = [
  montarLinha('metro:Linha 1-Azul', 'Linha 1-Azul', 'metro', '#1F5FBF', [
    est('Sé', 92, 32, [eq('elevador', 'ELEV-SE-01', 'inoperante'), eq('escada_rolante', 'ESC-SE-02')], [
      alerta('alta', 'Superlotação na plataforma'),
      alerta('critica', 'Elevador ELEV-SE-01 inoperante'),
    ]),
    est('Paraíso', 65, 29, [eq('elevador', 'ELEV-PAR-01')]),
    est('Tatuapé', 85, 30, [eq('escada_rolante', 'ESC-TAT-01', 'manutencao')]),
  ]),
  montarLinha('metro:Linha 3-Vermelha', 'Linha 3-Vermelha', 'metro', '#D32F2F', [
    est('República', 88, 33, [eq('elevador', 'ELEV-REP-01')], [alerta('alta', 'Calor extremo na plataforma')]),
    est('Brás', 90, 34, [eq('elevador', 'ELEV-BRA-01', 'inoperante')]),
  ]),
  montarLinha('trem:Linha 8-Diamante', 'Linha 8-Diamante', 'trem', '#7D6B7D', [
    est('Osasco', 72, 31, [eq('elevador', 'ELEV-OSA-01'), eq('escada_rolante', 'ESC-OSA-01', 'inoperante')]),
    est('Barra Funda', 60, 29, [eq('elevador', 'ELEV-BAF-01')]),
  ]),
  montarLinha('trem:Linha 9-Esmeralda', 'Linha 9-Esmeralda', 'trem', '#00A19A', [
    est('Pinheiros', 30, 27, [eq('elevador', 'ELEV-PIN-01')]),
  ]),
  montarLinha('onibus:875C-10', '875C-10', 'onibus', '#F5A300', [
    est('Terminal Princesa Isabel', 55, 32, []),
    est('Terminal Santo Amaro', null, null, []),
  ]),
];
