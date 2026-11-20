export type Modal = 'metro' | 'trem' | 'onibus';
export type Lotacao = 'sem_dados' | 'baixa' | 'media' | 'alta';
export type TipoRelato = 'lotacao' | 'calor' | 'elevador' | 'escada_rolante';
export type Perfil = 'trabalhador' | 'estudante' | 'idoso' | 'pcd';
export type StatusEquip = 'operante' | 'inoperante' | 'manutencao';
export type Severidade = 'baixa' | 'media' | 'alta' | 'critica';

export interface Equipamento {
  id: number;
  tipo: 'elevador' | 'escada_rolante';
  identificador: string;
  status: StatusEquip;
  operando: boolean;
}

export interface AlertaAtivo {
  id: number;
  severidade: Severidade;
  mensagem: string;
}

export interface Estacao {
  id: number;
  nome: string;
  lotacao: Lotacao;
  ocupacaoPercentual: number | null;
  temperaturaC: number | null;
  acessivelPcd: boolean;
  equipamentos: Equipamento[];
  alertas: AlertaAtivo[];
}

export interface Linha {
  id: string;
  nome: string;
  modal: Modal;
  cor: string;
  lotacao: Lotacao;
  temperaturaC: number | null;
  estacoes: Estacao[];
}

export interface Relato {
  id: number;
  tipo: TipoRelato;
  linhaId: string;
  linhaNome: string;
  estacaoId: number;
  estacao: string;
  descricao: string;
  criadoEm: string;
  sincronizado: boolean;
}

export type NovoRelato = Omit<Relato, 'id' | 'criadoEm' | 'sincronizado'>;

export const TIPOS_RELATO: { id: TipoRelato; label: string; icon: string }[] = [
  { id: 'lotacao', label: 'Superlotação', icon: 'people' },
  { id: 'calor', label: 'Calor extremo', icon: 'thermometer' },
  { id: 'elevador', label: 'Elevador quebrado', icon: 'arrow-up-circle' },
  { id: 'escada_rolante', label: 'Escada rolante quebrada', icon: 'trending-up' },
];

export const MODAIS: { id: Modal | 'todos'; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'metro', label: 'Metrô' },
  { id: 'trem', label: 'Trem' },
  { id: 'onibus', label: 'Ônibus' },
];

export const PERFIS: { id: Perfil; label: string }[] = [
  { id: 'trabalhador', label: 'Trabalhador(a)' },
  { id: 'estudante', label: 'Estudante' },
  { id: 'idoso', label: 'Pessoa idosa' },
  { id: 'pcd', label: 'Pessoa com deficiência' },
];
