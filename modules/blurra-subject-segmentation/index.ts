// Re-export the native module. On web, it will be resolved to BlurraSubjectSegmentationModule.web.ts
// and on native platforms to BlurraSubjectSegmentationModule.ts
export { default } from './src/BlurraSubjectSegmentationModule';
export * from './src/BlurraSubjectSegmentation.types';
