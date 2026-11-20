import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, View } from 'react-native';
import { enviarRelato } from '../../src/api/client';
import { listarRelatos, marcarSincronizado, removerRelato } from '../../src/db/database';
import { useSettings } from '../../src/settings';
import { Relato, TIPOS_RELATO } from '../../src/types';
import { Botao, Card, Texto, Vazio } from '../../src/ui';

export default function Historico() {
  const { t, fs, perfil } = useSettings();
  const [relatos, setRelatos] = useState<Relato[]>([]);
  const [sincronizando, setSincronizando] = useState(false);

  const carregar = useCallback(() => listarRelatos().then(setRelatos), []);
  useFocusEffect(useCallback(() => void carregar(), [carregar]));

  const pendentes = relatos.filter((r) => !r.sincronizado);

  async function sincronizar() {
    setSincronizando(true);
    let enviados = 0;
    for (const r of pendentes) {
      const ok = await enviarRelato({ estacaoId: r.estacaoId, tipo: r.tipo, descricao: r.descricao }, perfil);
      if (ok) {
        await marcarSincronizado(r.id);
        enviados++;
      }
    }
    await carregar();
    setSincronizando(false);
    Alert.alert(
      enviados > 0 ? 'Relatos enviados' : 'Não foi possível enviar',
      enviados > 0
        ? `${enviados} relato(s) enviado(s).`
        : 'Verifique a conexão e a URL da API, depois tente de novo.'
    );
  }

  function apagar(r: Relato) {
    Alert.alert('Apagar relato?', 'Ele será removido deste celular.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Apagar',
        style: 'destructive',
        onPress: async () => {
          await removerRelato(r.id);
          carregar();
        },
      },
    ]);
  }

  return (
    <FlatList
      style={{ backgroundColor: t.bg }}
      data={relatos}
      keyExtractor={(r) => String(r.id)}
      contentContainerStyle={{ padding: 16, gap: 10, flexGrow: 1 }}
      ListHeaderComponent={
        pendentes.length > 0 ? (
          <View style={{ marginBottom: 6 }}>
            <Botao
              titulo={sincronizando ? 'Enviando…' : `Enviar ${pendentes.length} pendente(s)`}
              icon="cloud-upload"
              desabilitado={sincronizando}
              onPress={sincronizar}
            />
          </View>
        ) : null
      }
      ListEmptyComponent={
        <Vazio
          icon="megaphone-outline"
          titulo="Você ainda não fez nenhum relato"
          texto="Na aba Relatar, conte o que viu no seu trajeto. Os relatos ficam guardados aqui."
        />
      }
      renderItem={({ item }) => {
        const tipo = TIPOS_RELATO.find((x) => x.id === item.tipo);
        const data = new Date(item.criadoEm).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
        return (
          <Card
            label={`${tipo?.label}, ${item.linhaNome}, ${item.estacao}, ${data}. ${item.sincronizado ? 'Enviado' : 'Pendente de envio'}`}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Ionicons name={(tipo?.icon ?? 'alert') as any} size={fs(24)} color={t.text} />
              <View style={{ flex: 1, gap: 2 }}>
                <Texto bold>{tipo?.label}</Texto>
                <Texto size={14} muted>
                  {item.linhaNome} · {item.estacao}
                </Texto>
                {item.descricao ? <Texto size={14}>{item.descricao}</Texto> : null}
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 4, alignItems: 'center' }}>
                  <Texto size={12} muted>
                    {data}
                  </Texto>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons
                      name={item.sincronizado ? 'cloud-done' : 'cloud-offline'}
                      size={fs(14)}
                      color={item.sincronizado ? t.ok : t.warn}
                    />
                    <Texto size={12} bold color={item.sincronizado ? t.ok : t.warn}>
                      {item.sincronizado ? 'Enviado' : 'Pendente'}
                    </Texto>
                  </View>
                </View>
              </View>
              <Ionicons
                name="trash"
                size={fs(22)}
                color={t.danger}
                onPress={() => apagar(item)}
                accessibilityRole="button"
                accessibilityLabel="Apagar relato"
                style={{ padding: 10 }}
              />
            </View>
          </Card>
        );
      }}
    />
  );
}
