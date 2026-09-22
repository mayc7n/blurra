# Setup local

## Requisitos

- Node.js 22 LTS+
- npm 10+
- Android Studio + Android SDK/NDK para development build Android
- macOS + Xcode para build físico iOS

Linux valida TypeScript, lint, Jest e export web. Não compila iOS localmente.

## Criar base Expo

```bash
npx create-expo-app@latest blurra --template blank-typescript
cd blurra
```

Para este repositório, dependências já estão fixadas em `package.json` e
`package-lock.json`. Reprodução limpa:

```bash
npm ci
npm run check
```

## Comandos de desenvolvimento

```bash
npm start
npm run android
npm run ios
npm run web
```

Módulos nativos próprios exigem development build:

```bash
npx expo install expo-dev-client
npx expo run:android
npx expo run:ios
```

## Validação

```bash
npm run typecheck
npm run lint
npm test -- --runInBand
npx expo export --platform web
```

`tsconfig.json` ativa `strict: true`. `eslint.config.mjs` usa ESLint flat
config com `@eslint/js`, `typescript-eslint` e React Hooks. Reanimated shared
values são exceção explícita à regra de imutabilidade do React Compiler, pois
seus worklets precisam atualizar `.value` durante gestos.

## Dependências diretas fixadas

Versões completas estão no `package.json`. Núcleo do POC:

```text
expo 57.0.24
react-native 0.86.3
@shopify/react-native-skia 2.6.2
react-native-gesture-handler 2.32.0
react-native-reanimated 4.5.0
react-native-worklets 0.10.0
zustand 5.0.15
typescript-eslint 8.70.1
eslint 10.11.0
```
