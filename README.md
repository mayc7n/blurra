# Blurra

Editor mobile local-first para aplicar blur e pixelização em fotos.

Blurra combina pincel de precisão, preview acelerado por Skia e uma interface
curta para esconder rostos, detalhes e informações sensíveis sem enviar fotos
para um servidor.

## MVP

- Importação pela galeria e captura pela câmera.
- Editor responsivo com safe areas, zoom e pan.
- Pincel com tamanho, suavidade e intensidade ajustáveis.
- Blur gaussiano e pixelização.
- Undo/redo e comparação antes/depois.
- Presets locais.
- Exportação PNG/JPEG e compartilhamento nativo.
- Tema claro/escuro e controles acessíveis.

## Stack

- Expo SDK 57 + React Native + TypeScript
- Expo Router
- React Native Skia
- Gesture Handler + Reanimated
- Zustand
- SQLite local

## Desenvolvimento

```bash
npm install
npm start
```

Validações:

```bash
npm run typecheck
npm test -- --runInBand
npx expo export --platform web
```

Para testar integrações nativas em Android ou iOS, use um development build.
O ambiente Linux não compila iOS com Xcode; a validação física de iOS deve ser
feita em macOS/Xcode ou por build remoto.

## Privacidade

Fotos e sessões permanecem no dispositivo no MVP. Não há conta, upload,
analytics ou processamento remoto.

## Documentação

- [Arquitetura](docs/architecture.md)
- [Fluxo de navegação](docs/navigation.md)
- [Escopo do MVP](docs/mvp.md)

## Licença

Projeto em desenvolvimento. Licença será definida antes da primeira distribuição
pública nas lojas.
