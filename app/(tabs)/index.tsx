import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, View } from 'react-native';
import { listarFavoritos } from '../../src/db/database';
import { useSettings } from '../../src/settings';
import { Linha, MODAIS, Modal } from '../../src/types';
import { usandoApi } from '../../src/api/client';
import { Card, Chip, fmtTemp, LOTACAO_INFO, SeloLotacao, Texto, Vazio } from '../../src/ui';
import { useLinhas } from '../../src/useLinhas';

export default function Linhas() {
  const router = useRouter();
  const { t, fs, perfil } = useSettings();
  const { linhas, origem, carregando, erro, recarregar } = useLinhas();
  const [modal, setModal] = useState<Modal | 'todos'>('todos');
  const [favoritos, setFavoritos] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      listarFavoritos().then(setFavoritos);
    }, [])
  );

  const foraDeServico = useMemo(
    () =>
      linhas.reduce(
        (n, l) => n + l.estacoes.reduce((m, e) => m + e.equipamentos.filter((q) => !q.operando).length, 0),
        0
      ),
    [linhas]
  );

  const visiveis = useMemo(() => {
    const filtradas = linhas.filter((l) => modal === 'todos' || l.modal === modal);
    return [...filtradas].sort(
      (a, b) => Number(favoritos.includes(b.id)) - Number(favoritos.includes(a.id))
    );
  }, [linhas, modal, favoritos]);

  const enfatizaAcesso = perfil === 'pcd' || perfil === 'idoso';

  const renderLinha = ({ item }: { item: Linha }) => {
    const fav = favoritos.includes(item.id);
    const quebrados = item.estacoes.reduce(
      (n, e) => n + e.equipamentos.filter((q) => !q.operando).length,
      0
    );
    return (
      <Card
        onPress={() => router.push(`/linha/${item.id}`)}
        label={`${item.nome}. ${LOTACAO_INFO[item.lotacao].label}. ${item.temperaturaC == null ? 'Sem leitura de temperatura' : item.temperaturaC + ' graus'}. ${quebrados} equipamentos fora de serviço.${fav ? ' Favorita.' : ''}`}
        style={{ marginBottom: 10 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 8, alignSelf: 'stretch', borderRadius: 4, backgroundColor: item.cor }} />
          <View style={{ flex: 1, gap: 4 }}>
            <Texto size={18} bold>
              {item.nome}
            </Texto>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <SeloLotacao lotacao={item.lotacao} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="thermometer" size={fs(16)} color={t.muted} />
                <Texto size={14} muted>
                  {fmtTemp(item.temperaturaC)}
                </Texto>
              </View>
              {quebrados > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="construct" size={fs(16)} color={t.danger} />
                  <Texto size={14} color={t.danger} bold>
                    {quebrados} fora de serviço
                  </Texto>
                </View>
              )}
            </View>
          </View>
          {fav && <Ionicons name="star" size={fs(22)} color={t.warn} />}
          <Ionicons name="chevron-forward" size={fs(20)} color={t.muted} />
        </View>
      </Card>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <FlatList
        data={visiveis}
        keyExtractor={(l) => l.id}
        renderItem={renderLinha}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={carregando} onRefresh={recarregar} tintColor={t.text} />}
        ListHeaderComponent={
          <View style={{ gap: 12, marginBottom: 12 }}>
            <Texto size={22} bold accessibilityRole="header">
              Como está o seu trajeto?
            </Texto>
            {foraDeServico > 0 && (
              <Card
                style={{ borderColor: t.danger, borderWidth: 2 }}
                label={`${foraDeServico} elevadores e escadas rolantes fora de serviço agora`}
              >
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                  <Ionicons name="accessibility" size={fs(26)} color={t.danger} />
                  <View style={{ flex: 1 }}>
                    <Texto bold size={enfatizaAcesso ? 18 : 16}>
                      {foraDeServico} equipamentos fora de serviço
                    </Texto>
                    <Texto size={14} muted>
                      {enfatizaAcesso
                        ? 'Confira o acesso da estação antes de sair de casa.'
                        : 'Elevadores e escadas rolantes em toda a rede.'}
                    </Texto>
                  </View>
                </View>
              </Card>
            )}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {MODAIS.map((m) => (
                <Chip key={m.id} titulo={m.label} ativo={modal === m.id} onPress={() => setModal(m.id)} />
              ))}
            </ScrollView>
            {origem === 'mock' && !carregando && (
              <Texto size={13} muted>
                {usandoApi
                  ? 'Sem conexão com a API. Mostrando dados de exemplo.'
                  : 'Mostrando dados de exemplo. Configure a URL da API para ver dados reais.'}
              </Texto>
            )}
            {erro && <Texto color={t.danger}>{erro}</Texto>}
          </View>
        }
        ListEmptyComponent={
          carregando ? (
            <ActivityIndicator size="large" color={t.text} accessibilityLabel="Carregando linhas" />
          ) : (
            <Vazio icon="subway" titulo="Nenhuma linha encontrada" texto="Troque o filtro de modal para ver outras linhas." />
          )
        }
      />
    </View>
  );
}
