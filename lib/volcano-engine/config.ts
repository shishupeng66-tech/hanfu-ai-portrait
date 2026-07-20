import { VolcanoEngineConfig } from './types';

export type ImageProvider = 'volcengine' | 'byteplus';

export const DEFAULT_VOLC_IMAGE_MODEL = 'doubao-seedream-4-5-251128';
export const DEFAULT_BYTEPLUS_IMAGE_MODEL = 'seedream-5-0-260128';

const DEFAULT_VOLC_API_URL = 'https://ark.cn-beijing.volces.com/api/v3';
const DEFAULT_BYTEPLUS_API_URL = 'https://ark.ap-southeast.bytepluses.com/api/v3';

// volcengine 不需要强制模型映射，只有明确的旧 lite 别名需要归一化
const VOLC_LEGACY_ALIASES = new Set([
  'doubao-seedream-5-0-lite',
  'seedream-5-0-lite',
]);

// byteplus ：所有国内模型名都映射到海外版 seedream-5-0-260128
const BYTEPLUS_NORMALIZE_MODELS = new Set([
  'doubao-seedream-4-5-251128',
  'doubao-seedream-5-0-lite',
  'doubao-seedream-5-0-260128',
  'doubao-seedream-5-0-pro-260628',
  'seedream-5-0-lite',
  'seedream-5-0-pro-260628',
]);

/** 解析当前启用的 image provider */
export function getImageProvider(): ImageProvider {
  const raw = process.env.IMAGE_PROVIDER?.trim().toLowerCase();
  if (raw === 'byteplus') return 'byteplus';
  return 'volcengine';
}

/**
 * 根据 provider 解析模型。
 * - volcengine: 别名替换为国内默认模型，其他模型透传
 * - byteplus: 所有国内模型名都映射到海外版 seedream-5-0-260128
 */
export function resolveImageModel(
  model?: string | null,
  provider = getImageProvider(),
): string {
  const trimmed = model?.trim();

  if (!trimmed) {
    return provider === 'byteplus'
      ? DEFAULT_BYTEPLUS_IMAGE_MODEL
      : DEFAULT_VOLC_IMAGE_MODEL;
  }

  if (provider === 'byteplus' && BYTEPLUS_NORMALIZE_MODELS.has(trimmed)) {
    return DEFAULT_BYTEPLUS_IMAGE_MODEL;
  }

  if (provider === 'volcengine' && VOLC_LEGACY_ALIASES.has(trimmed)) {
    return DEFAULT_VOLC_IMAGE_MODEL;
  }

  return trimmed;
}

function getApiKey(provider: ImageProvider): string {
  if (provider === 'byteplus') {
    return process.env.BYTEPLUS_API_KEY
      || process.env.VOLCANO_ENGINE_API_KEY
      || process.env.ARK_API_KEY
      || '';
  }

  return process.env.VOLCANO_ENGINE_API_KEY
    || process.env.ARK_API_KEY
    || process.env.BYTEPLUS_API_KEY
    || '';
}

function getApiUrl(provider: ImageProvider): string {
  if (provider === 'byteplus') {
    return process.env.BYTEPLUS_API_ENDPOINT
      || process.env.VOLCANO_ENGINE_API_URL
      || process.env.ARK_API_ENDPOINT
      || DEFAULT_BYTEPLUS_API_URL;
  }

  return process.env.VOLCANO_ENGINE_API_URL
    || process.env.ARK_API_ENDPOINT
    || process.env.BYTEPLUS_API_ENDPOINT
    || DEFAULT_VOLC_API_URL;
}

function buildConfig(): VolcanoEngineConfig {
  const provider = getImageProvider();
  const apiKey = getApiKey(provider);
  const apiUrl = getApiUrl(provider);
  const imageModelEnv = provider === 'byteplus'
    ? process.env.BYTEPLUS_IMAGE_MODEL
    : process.env.VOLCANO_ENGINE_IMAGE_MODEL || process.env.ARK_IMAGE_MODEL;
  const imageModel = resolveImageModel(imageModelEnv, provider);

  return {
    provider,
    apiKey,
    apiUrl,
    textModel: 'doubao-1-5-thinking-pro-250415',
    imageModel,
    videoModel: 'doubao-seedance-1-0-pro-250528',
  };
}

export const volcanoEngineConfig = buildConfig();

export function validateConfig(): void {
  if (!volcanoEngineConfig.apiKey) {
    throw new Error('Image generation API key not configured');
  }
  if (!volcanoEngineConfig.apiUrl) {
    throw new Error('Image generation API endpoint not configured');
  }
}

export function getModelConfig() {
  return {
    provider: volcanoEngineConfig.provider,
    text: volcanoEngineConfig.textModel,
    image: volcanoEngineConfig.imageModel,
    video: volcanoEngineConfig.videoModel,
  };
}

export function getHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${volcanoEngineConfig.apiKey}`,
  };
}