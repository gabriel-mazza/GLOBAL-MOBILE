import React from 'react';
import { ScrollView, Switch, View } from 'react-native';
import { usandoApi } from '../../src/api/client';
import { useSettings } from '../../src/settings';
import { PERFIS } from '../../src/types';
import { Card, Chip, Texto } from '../../src/ui';

export default function Ajustes() {
  const { t, perfil, setPerfil, textoGrande, setTextoGrande, altoContraste, setAltoContraste } = useSettings();

  const linhaSwitch = (titulo: string, desc: string, valor: boolean, set: (v: boolean) => void) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56 }}>
      <View style={{ flex: 1 }}>
        <Texto bold>{titulo}</Texto>
        <Texto size={13} muted>
          {desc}
        </Texto>
      </View>
      <Switch
        value={valor}
        onValueChange={set}
        accessibilityLabel={titulo}
        trackColor={{ true: t.primary, false: t.border }}
        thumbColor={t.card}
      />
    </View>
  );

  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={{ padding: 16, gap: 14 }}>
      <Texto size={22} bold accessibilityRole="header">
        Acessibilidade
      </Texto>
      <Card style={{ gap: 6 }}>
        {linhaSwitch('Texto grande', 'Aumenta as letras em todo o app.', textoGrande, setTextoGrande)}
        {linhaSwitch('Alto contraste', 'Fundo preto com cores fortes.', altoContraste, setAltoContraste)}
      </Card>

      <Texto size={18} bold accessibilityRole="header">
        Quem é você no trajeto?
      </Texto>
      <Texto size={14} muted>
        Usamos isso para destacar o que mais importa para você, como elevadores fora de serviço.
      </Texto>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {PERFIS.map((p) => (
          <Chip key={p.id} titulo={p.label} ativo={perfil === p.id} onPress={() => setPerfil(p.id)} />
        ))}
      </View>

      <Texto size={18} bold accessibilityRole="header" style={{ marginTop: 8 }}>
        Sobre
      </Texto>
      <Card style={{ gap: 4 }}>
        <Texto bold>Deslocai · CitizenTech</Texto>
        <Texto size={14} muted>
          Fonte dos dados: {usandoApi ? 'API do backend C#/.NET' : 'dados de exemplo (mock)'}.
        </Texto>
        <Texto size={14} muted>
          Seus relatos e ajustes ficam salvos no celular (SQLite).
        </Texto>
      </Card>
    </ScrollView>
  );
}
