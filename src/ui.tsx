import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useSettings } from './settings';
import { Lotacao } from './types';

export const LOTACAO_INFO: Record<Lotacao, { label: string; icon: any }> = {
  baixa: { label: 'Tranquila', icon: 'checkmark-circle' },
  media: { label: 'Movimentada', icon: 'alert-circle' },
  alta: { label: 'Lotada', icon: 'warning' },
  sem_dados: { label: 'Sem leitura', icon: 'help-circle' },
};

export const fmtTemp = (v: number | null) => (v == null ? '—' : `${Math.round(v)}°C`);

export function useCorLotacao() {
  const { t } = useSettings();
  return (l: Lotacao) => (l === 'baixa' ? t.ok : l === 'media' ? t.warn : l === 'alta' ? t.danger : t.muted);
}

export function Texto({
  children,
  size = 16,
  bold,
  muted,
  color,
  style,
  ...rest
}: {
  children: React.ReactNode;
  size?: number;
  bold?: boolean;
  muted?: boolean;
  color?: string;
  style?: any;
  accessibilityRole?: any;
  numberOfLines?: number;
}) {
  const { t, fs } = useSettings();
  return (
    <Text
      {...rest}
      style={[
        { fontSize: fs(size), color: color ?? (muted ? t.muted : t.text), fontWeight: bold ? '700' : '400' },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function Card({
  children,
  style,
  onPress,
  label,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  label?: string;
}) {
  const { t, altoContraste } = useSettings();
  const base: ViewStyle = {
    backgroundColor: t.card,
    borderRadius: 14,
    borderWidth: altoContraste ? 2 : 1,
    borderColor: t.border,
    padding: 14,
  };
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={({ pressed }) => [base, pressed && { opacity: 0.7 }, style]}
      >
        {children}
      </Pressable>
    );
  }
  return (
    <View style={[base, style]} accessible={!!label} accessibilityLabel={label}>
      {children}
    </View>
  );
}

export function Botao({
  titulo,
  onPress,
  icon,
  variante = 'primario',
  desabilitado,
  label,
}: {
  titulo: string;
  onPress: () => void;
  icon?: any;
  variante?: 'primario' | 'secundario' | 'perigo';
  desabilitado?: boolean;
  label?: string;
}) {
  const { t, fs, altoContraste } = useSettings();
  const bg = variante === 'primario' ? t.primary : variante === 'perigo' ? t.danger : t.card;
  const fg = variante === 'secundario' ? t.text : variante === 'perigo' ? '#FFFFFF' : t.onPrimary;
  return (
    <Pressable
      onPress={onPress}
      disabled={desabilitado}
      accessibilityRole="button"
      accessibilityLabel={label ?? titulo}
      accessibilityState={{ disabled: !!desabilitado }}
      style={({ pressed }) => [
        styles.botao,
        {
          backgroundColor: bg,
          borderColor: variante === 'secundario' || altoContraste ? t.border : bg,
          borderWidth: variante === 'secundario' || altoContraste ? 2 : 0,
          opacity: desabilitado ? 0.5 : pressed ? 0.8 : 1,
        },
      ]}
    >
      {icon ? <Ionicons name={icon} size={fs(20)} color={fg} /> : null}
      <Text style={{ color: fg, fontSize: fs(16), fontWeight: '700' }}>{titulo}</Text>
    </Pressable>
  );
}

export function Chip({
  titulo,
  ativo,
  onPress,
  icon,
}: {
  titulo: string;
  ativo: boolean;
  onPress: () => void;
  icon?: any;
}) {
  const { t, fs } = useSettings();
  const fg = ativo ? t.onPrimary : t.text;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={titulo}
      accessibilityState={{ selected: ativo }}
      style={[
        styles.chip,
        { backgroundColor: ativo ? t.primary : t.card, borderColor: ativo ? t.primary : t.border },
      ]}
    >
      {icon ? <Ionicons name={icon} size={fs(18)} color={fg} /> : null}
      <Text style={{ color: fg, fontSize: fs(15), fontWeight: '600' }}>{titulo}</Text>
    </Pressable>
  );
}

export function SeloLotacao({ lotacao }: { lotacao: Lotacao }) {
  const { fs } = useSettings();
  const cor = useCorLotacao()(lotacao);
  const info = LOTACAO_INFO[lotacao];
  return (
    <View style={styles.selo}>
      <Ionicons name={info.icon} size={fs(18)} color={cor} />
      <Texto size={14} bold color={cor}>
        {info.label}
      </Texto>
    </View>
  );
}

export function Vazio({ icon, titulo, texto }: { icon: any; titulo: string; texto: string }) {
  const { t, fs } = useSettings();
  return (
    <View style={styles.vazio} accessible accessibilityLabel={`${titulo}. ${texto}`}>
      <Ionicons name={icon} size={fs(44)} color={t.muted} />
      <Texto size={18} bold style={{ textAlign: 'center' }}>
        {titulo}
      </Texto>
      <Texto muted style={{ textAlign: 'center' }}>
        {texto}
      </Texto>
    </View>
  );
}

const styles = StyleSheet.create({
  botao: {
    minHeight: 52,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  chip: {
    minHeight: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  vazio: { alignItems: 'center', gap: 8, padding: 32 },
});
