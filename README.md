# Deslocai — App mobile (CitizenTech)

App em **React Native + TypeScript + Expo Router** para o cidadão acompanhar a situação do transporte público (metrô, trem e ônibus) e **relatar problemas** como superlotação, calor extremo e elevadores ou escadas rolantes quebrados.

> Global Solution FIAP 2026.2 · Mobile Development & IoT

## Ficha da CitizenTech



| Campo | Conteúdo |
|---|---|
| Nome | Deslocai |
| Problema | Deslocamento diário em transporte público com lotação, calor e equipamentos de acessibilidade fora de serviço, sem informação confiável antes de sair de casa. |
| Quem sofre o problema | Trabalhadores, estudantes, pessoas idosas e pessoas com deficiência que dependem de metrô, trem e ônibus. |
| Jornada principal | 1. Abrir o app e ver a situação das linhas. 2. Entrar numa linha e conferir estações, lotação, temperatura e equipamentos. 3. Relatar um problema. 4. Acompanhar os próprios relatos. |
| Solução | App que mostra o estado da rede e permite ao cidadão contribuir com relatos, que também ficam salvos offline. |
| Integrantes | Jefferson Junior Alvarez Urbina RM558497 - Gabriel Barros Mazzariol RM555410 |

## Funcionalidades

- **Linhas**: lista com lotação, temperatura e equipamentos fora de serviço, filtro por modal (metrô, trem, ônibus) e favoritas no topo.
- **Detalhe da linha**: estações, lotação, temperatura e status de cada elevador e escada rolante.
- **Relatar**: formulário em poucos toques (problema, linha, estação, observação).
- **Meus relatos**: histórico local, status Enviado/Pendente, reenvio dos pendentes e exclusão.
- **Ajustes**: texto grande, alto contraste e perfil do usuário (ex.: pessoa com deficiência ou idosa recebe destaque nos alertas de acessibilidade).

## Como cada critério é atendido

| Critério | Onde está |
|---|---|
| Telas e navegação | Expo Router: 4 abas (`app/(tabs)`) + tela de detalhe (`app/linha/[id].tsx`) |
| Consumo de dados | `src/api/client.ts` consome as rotas de estações, equipamentos, alertas e relatos do backend C#; sem URL configurada ou sem rede, usa `src/api/mock.ts` |
| Banco de dados | SQLite (`expo-sqlite`) em `src/db/database.ts`: tabelas `relatos`, `favoritos` e `config` |
| Acessibilidade | Rótulos para leitor de tela, alvos de toque de 44 a 52 px, texto grande, alto contraste, status nunca só por cor (ícone + texto) |
| Aderência ao problema | Foco em lotação, calor e equipamentos de acessibilidade |
| Documentação | Este README |

## Como rodar (Windows / PowerShell)

Pré-requisitos: Node.js 20+ e o app **Expo Go** no celular (ou um emulador Android).

```powershell
git clone <https://github.com/gabriel-mazza/GLOBAL-MOBILE.git>
cd deslocai-app
npm install
npx expo install --fix
npx expo start
```

Escaneie o QR Code com o Expo Go. Por padrão o app usa **dados mock**.

### Usando o backend C#

REPOSITORIO API:https://github.com/gabriel-mazza/GS-CSHARP.git

1. Suba a API (`dotnet run`) e anote a porta.
2. Copie `.env.example` para `.env` e preencha:
   - celular físico (mesma rede Wi-Fi): `EXPO_PUBLIC_API_URL=http://IP_DO_SEU_PC:5080`
   - emulador Android: `EXPO_PUBLIC_API_URL=http://10.0.2.2:5080`
3. Reinicie com `npx expo start -c`.

Rotas do backend usadas pelo app:

```
GET  /api/estacoes        lista de estações (nome, linha, tipo de transporte)
GET  /api/estacoes/{id}   ocupação atual, temperatura atual e acessibilidade PCD
GET  /api/equipamentos    elevadores e escadas rolantes com status
GET  /api/alertas         alertas ativos
POST /api/relatos         { estacaoId, tipo, perfilRelator, descricao }
```

O backend organiza os dados por estação. O app agrupa as estações pelo campo `linha` para montar a lista de linhas.
A lotação da linha é a pior entre as suas estações (ocupação abaixo de 50% = tranquila, até 80% = movimentada, acima = lotada).
Os enums do C# (tipo de transporte, status, severidade etc.) são aceitos como número ou como texto.

## Estrutura

```
app/            telas (Expo Router)
src/api/        cliente HTTP + mock
src/db/         SQLite
src/settings    preferências de acessibilidade (persistidas no SQLite)
src/ui.tsx      componentes reutilizáveis
```

## Prints das telas

> Adicione em `docs/` e referencie aqui.

| Linhas | Detalhe | Relatar | Meus relatos | Ajustes |

(<img width="400" height="800" alt="image" src="https://github.com/user-attachments/assets/9bcaefe3-04e5-40ce-9b6d-1ef55f596fb9" />
(<img width="400" height="800" alt="image" src="https://github.com/user-attachments/assets/5176bec9-a2a5-46a3-aa93-7a20ae4e434f" />
(<img width="400" height="800" alt="image" src="https://github.com/user-attachments/assets/3dbd3ec7-40f2-44dd-b087-92440ea9dc0c" />
(<img width="400" height="800" alt="image" src="https://github.com/user-attachments/assets/cbea6098-01dc-4aa9-a130-9e4e8d947f4d" />
(<img width="400" height="800" alt="image" src="https://github.com/user-attachments/assets/ce59a521-1279-4576-a9fd-51cc23d9db31" />


## Vídeo de demonstração

(https://youtu.be/2lagER4WI9U)
