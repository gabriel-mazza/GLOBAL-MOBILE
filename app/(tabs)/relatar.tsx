import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from 'react-native';
import { enviarRelato, usandoApi } from '../../src/api/client';
import { inserirRelato, marcarSincronizado } from '../../src/db/database';
import { useSettings } from '../../src/settings';
import { TIPOS_RELATO, TipoRelato } from '../../src/types';
import { Botao, Chip, Texto } from '../../src/ui';
import { useLinhas } from '../../src/useLinhas';

export default function Relatar() {
  const { linhaId: linhaParam } = useLocalSearchParams<{ linhaId?: string }>();
  const router = useRouter();
  const { t, fs, altoContraste, perfil } = useSettings();
  const { linhas } = useLinhas();

  const [tipo, setTipo] = useState<TipoRelato | null>(null);
  const [linhaId, setLinhaId] = useState<string | null>(null);
  const [estacaoId, setEstacaoId] = useState<number | null>(null);
  const [descricao, setDescricao] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (linhaParam) {
      setLinhaId(linhaParam);
      setEstacaoId(null);
    }
  }, [linhaParam]);

  const linha = linhas.find((l) => l.id === linhaId);
  const estacao = linha?.estacoes.find((e) => e.id === estacaoId);
  const pronto = !!tipo && !!linha && !!estacao;

  async function enviar() {
    if (!tipo || !linha || !estacao) return;
    setSalvando(true);
    try {
      const novo = {
        tipo,
        linhaId: linha.id,
        linhaNome: linha.nome,
        estacaoId: estacao.id,
        estacao: estacao.nome,
        descricao: descricao.trim(),
      };
      const salvo = await inserirRelato(novo);
      const ok = await enviarRelato({ estacaoId: novo.estacaoId, tipo: novo.tipo, descricao: novo.descricao }, perfil);
      if (ok) await marcarSincronizado(salvo.id);
      setTipo(null);
      setLinhaId(null);
      setEstacaoId(null);
      setDescricao('');
      Alert.alert(
        'Relato salvo',
        ok
          ? 'Enviamos o seu relato. Obrigado por ajudar quem usa a mesma linha.'
          : usandoApi
          ? 'Não conseguimos falar com o servidor. Guardamos no celular e você pode enviar depois em "Meus relatos".'
          : 'Guardamos o relato no seu celular. Veja em "Meus relatos".',
        [{ text: 'Ver meus relatos', onPress: () => router.push('/historico') }, { text: 'Ok' }]
      );
    } catch {
      Alert.alert('Não foi possível salvar', 'Tente novamente em instantes.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: t.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }} keyboardShouldPersistTaps="handled">
        <Texto size={22} bold accessibilityRole="header">
          O que está acontecendo?
        </Texto>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {TIPOS_RELATO.map((r) => (
            <Chip key={r.id} titulo={r.label} icon={r.icon} ativo={tipo === r.id} onPress={() => setTipo(r.id)} />
          ))}
        </View>

        <Texto size={18} bold accessibilityRole="header">
          Em qual linha?
        </Texto>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {linhas.map((l) => (
            <Chip
              key={l.id}
              titulo={l.nome}
              ativo={linhaId === l.id}
              onPress={() => {
                setLinhaId(l.id);
                setEstacaoId(null);
              }}
            />
          ))}
        </View>

        {linha && (
          <>
            <Texto size={18} bold accessibilityRole="header">
              Em qual estação ou parada?
            </Texto>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {linha.estacoes.map((e) => (
                <Chip key={e.id} titulo={e.nome} ativo={estacaoId === e.id} onPress={() => setEstacaoId(e.id)} />
              ))}
            </View>
          </>
        )}

        <Texto size={18} bold accessibilityRole="header">
          Quer contar mais? (opcional)
        </Texto>
        <TextInput
          value={descricao}
          onChangeText={setDescricao}
          multiline
          maxLength={250}
          placeholder="Ex.: plataforma sentido centro, sem ventilação"
          placeholderTextColor={t.muted}
          accessibilityLabel="Descrição do problema, opcional"
          style={{
            minHeight: 96,
            textAlignVertical: 'top',
            borderWidth: altoContraste ? 2 : 1.5,
            borderColor: t.border,
            borderRadius: 12,
            padding: 12,
            fontSize: fs(16),
            color: t.text,
            backgroundColor: t.card,
          }}
        />
        <Texto size={13} muted>
          {descricao.length}/250 · não escreva dados pessoais
        </Texto>

        <Botao
          titulo={salvando ? 'Salvando…' : 'Enviar relato'}
          icon="send"
          desabilitado={!pronto || salvando}
          onPress={enviar}
        />
        {!pronto && (
          <Texto size={13} muted>
            Escolha o problema, a linha e a estação para enviar.
          </Texto>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
