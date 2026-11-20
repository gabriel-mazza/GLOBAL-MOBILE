import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { alternarFavorito, listarFavoritos } from '../../src/db/database';
import { useSettings } from '../../src/settings';
import { StatusEquip } from '../../src/types';
import { Botao, Card, fmtTemp, SeloLotacao, Texto } from '../../src/ui';
import { useLinhas } from '../../src/useLinhas';

const STATUS_LABEL: Record<StatusEquip, string> = {
  operante: 'Funcionando',
  inoperante: 'Fora de serviço',
  manutencao: 'Em manutenção',
};

export default function DetalheLinha() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t, fs } = useSettings();
  const { linhas, carregando } = useLinhas();
  const [fav, setFav] = useState(false);
  const linha = linhas.find((l) => l.id === id);

  useFocusEffect(
    useCallback(() => {
      listarFavoritos().then((f) => setFav(f.includes(String(id))));
    }, [id])
  );

  if (carregando || !linha) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: t.bg }}>
        <ActivityIndicator size="large" color={t.text} accessibilityLabel="Carregando" />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Stack.Screen options={{ title: linha.nome }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{ width: 10, height: fs(36), borderRadius: 5, backgroundColor: linha.cor }} />
        <View style={{ flex: 1 }}>
          <Texto size={22} bold accessibilityRole="header">
            {linha.nome}
          </Texto>
          <View style={{ flexDirection: 'row', gap: 14, marginTop: 2 }}>
            <SeloLotacao lotacao={linha.lotacao} />
            <Texto size={14} muted>
              {fmtTemp(linha.temperaturaC)}
            </Texto>
          </View>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Botao
            titulo={fav ? 'Favorita' : 'Favoritar'}
            icon={fav ? 'star' : 'star-outline'}
            variante="secundario"
            label={fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            onPress={async () => setFav(await alternarFavorito(linha.id, linha.nome))}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Botao
            titulo="Relatar"
            icon="megaphone"
            label={`Relatar problema na ${linha.nome}`}
            onPress={() => router.push({ pathname: '/relatar', params: { linhaId: linha.id } })}
          />
        </View>
      </View>

      <Texto size={18} bold accessibilityRole="header" style={{ marginTop: 6 }}>
        Estações
      </Texto>
      {linha.estacoes.map((e) => (
        <Card key={e.id} style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Texto size={17} bold>
              {e.nome}
            </Texto>
            <Texto size={14} muted>
              {fmtTemp(e.temperaturaC)}
            </Texto>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <SeloLotacao lotacao={e.lotacao} />
            {e.ocupacaoPercentual != null && (
              <Texto size={13} muted>
                {Math.round(e.ocupacaoPercentual)}% da capacidade
              </Texto>
            )}
          </View>

          <View
            accessible
            accessibilityLabel={e.acessivelPcd ? 'Estação acessível para pessoas com deficiência' : 'Sem elevador operante'}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
          >
            <Ionicons
              name={e.acessivelPcd ? 'accessibility' : 'ban'}
              size={fs(18)}
              color={e.acessivelPcd ? t.ok : t.danger}
            />
            <Texto size={14} bold color={e.acessivelPcd ? t.ok : t.danger}>
              {e.acessivelPcd ? 'Acessível para PCD' : 'Sem elevador operante'}
            </Texto>
          </View>

          {e.alertas.map((a) => {
            const cor = a.severidade === 'alta' || a.severidade === 'critica' ? t.danger : t.warn;
            return (
              <View
                key={a.id}
                accessible
                accessibilityLabel={`Alerta ${a.severidade}: ${a.mensagem}`}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
              >
                <Ionicons name="alert-circle" size={fs(18)} color={cor} />
                <View style={{ flex: 1 }}>
                  <Texto size={14} color={cor} bold>
                    {a.mensagem}
                  </Texto>
                </View>
              </View>
            );
          })}

          {e.equipamentos.length === 0 ? (
            <Texto size={14} muted>
              Sem elevadores ou escadas rolantes cadastrados.
            </Texto>
          ) : (
            e.equipamentos.map((q) => {
              const cor = q.status === 'operante' ? t.ok : q.status === 'manutencao' ? t.warn : t.danger;
              return (
                <View
                  key={q.id}
                  accessible
                  accessibilityLabel={`${q.tipo === 'elevador' ? 'Elevador' : 'Escada rolante'} ${q.identificador}, ${STATUS_LABEL[q.status]}`}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
                >
                  <Ionicons
                    name={q.operando ? 'checkmark-circle' : q.status === 'manutencao' ? 'construct' : 'close-circle'}
                    size={fs(20)}
                    color={cor}
                  />
                  <View style={{ flex: 1 }}>
                    <Texto size={15}>
                      {q.tipo === 'elevador' ? 'Elevador' : 'Escada rolante'} · {q.identificador}
                    </Texto>
                  </View>
                  <Texto size={13} bold color={cor}>
                    {STATUS_LABEL[q.status]}
                  </Texto>
                </View>
              );
            })
          )}
        </Card>
      ))}
    </ScrollView>
  );
}
