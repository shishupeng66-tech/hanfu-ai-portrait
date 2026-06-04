import { volcanoEngineConfig, validateConfig, getHeaders } from './config';
import { 
  ImageGenerationRequest, 
  ImageGenerationResponse,
  VolcanoEngineError 
} from './types';

type ImageGenerationOptions = {
  size?: 'adaptive' | '1K' | '2K' | '4K';
  inputImages?: string[];
  watermark?: boolean;
  /** 开启提示词自动增强，对齐豆包 APP 效果（耗时增加约20%） */
  promptOptimization?: boolean;
  /** 采样步数，默认 30 */
  steps?: number;
  /** 人脸修复增强 */
  faceEnhance?: boolean;
};

export async function generateImage(
  prompt: string,
  options?: ImageGenerationOptions
): Promise<ImageGenerationResponse> {
  validateConfig();

  const model = volcanoEngineConfig.imageModel || 'doubao-seededit-3-0-i2i-250628';

  const size = options?.size || 'adaptive';
  const images = options?.inputImages?.filter(Boolean);
  const enablePromptOptimization = options?.promptOptimization !== false; // 默认开启
  const steps = options?.steps ?? 30;
  const faceEnhance = options?.faceEnhance !== false; // 默认开启

  const request: ImageGenerationRequest = {
    model,
    prompt,
    image: images && images.length > 0 ? images : undefined,
    response_format: 'url',
    size,
    width: 4096,
    height: 4096,
    steps,
    cfg_scale: 8,
    image_guidance_scale: 1.2,
    face_enhance: faceEnhance,
    optimize_prompt_options: enablePromptOptimization
      ? { mode: 'standard' }
      : undefined,
    watermark: options?.watermark !== undefined ? options.watermark : true,
  };

  const response = await fetch(`${volcanoEngineConfig.apiUrl}/images/generations`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error: VolcanoEngineError = await response.json();
    throw new Error(`Volcano Engine API error: ${error.error?.message || 'Unknown error'}`);
  }

  return response.json();
}

export async function generateImageFromText(
  prompt: string
): Promise<{
  url: string;
  revisedPrompt?: string;
}> {
  const response = await generateImage(prompt);
  
  if (!response.data || response.data.length === 0) {
    throw new Error('No image generated');
  }

  return {
    url: response.data[0].url,
    revisedPrompt: response.data[0].revised_prompt,
  };
}
