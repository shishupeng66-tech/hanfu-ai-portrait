export interface VolcanoEngineConfig {
  apiKey: string;
  apiUrl: string;
  textModel?: string;
  imageModel?: string;
  videoModel?: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
}

export interface ChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ChatStreamResponseChunk {
  choices?: Array<{
    delta?: {
      content?: string;
    };
  }>;
}

export interface ChatStreamDoneChunk {
  done: true;
}

export interface ImageGenerationRequest {
  model: string;
  prompt: string;
  image?: string[];  // Optional input images for image-to-image generation
  response_format?: 'url' | 'b64_json';
  size?: 'adaptive' | '1K' | '2K' | '4K';
  width?: number;  // 输出宽度（如 2048）
  height?: number; // 输出高度（如 2048）
  seed?: number;
  steps?: number;  // 采样步数，越高越精细（推荐 30，默认 20）
  guidance_scale?: number;
  cfg_scale?: number;  // 提示词遵循度（推荐 8，默认 5）
  image_guidance_scale?: number;  // 人像参考图相似度（推荐 1.2）
  face_enhance?: boolean;  // 人脸修复增强
  optimize_prompt_options?: {  // 提示词自动增强（对齐豆包 APP）
    mode: 'standard';  // standard 模式，质量更高（耗时增加约 20%）
  };
  watermark?: boolean;
}

export interface ImageGenerationResponse {
  created: number;
  data: {
    url: string;
    revised_prompt?: string;
  }[];
}

export interface VideoGenerationRequest {
  model: string;
  content: Array<{
    type: 'text' | 'image_url';
    text?: string;
    image_url?: {
      url: string;
    };
  }>;
}

export type VolcanoEngineTaskStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'SUCCESS'
  | 'ERROR'
  | string;

export interface VolcanoEngineTaskResult {
  video_url?: string;
  url?: string;
  cover_image_url?: string;
  error?: string;
  video?: Array<{
    url?: string;
  }>;
  videos?: Array<{
    url?: string;
  }>;
  output?: {
    video_url?: string;
    url?: string;
    error?: string;
  };
  contents?: Array<{
    type?: string;
    url?: string;
  }>;
  [key: string]: unknown;
}

export interface VolcanoEngineTaskData {
  task_id: string;
  task_status: VolcanoEngineTaskStatus;
  task_status_text?: string;
  result?: VolcanoEngineTaskResult;
  error?: string;
  [key: string]: unknown;
}

export interface VideoGenerationResponse {
  code?: number;
  message?: string;
  request_id?: string;
  id?: string;
  status?: VolcanoEngineTaskStatus;
  error?: string;
  data?: VolcanoEngineTaskData;
  content?: {
    video_url?: string;
  };
  output?: {
    video_url?: string;
    url?: string;
    error?: string;
  };
  url?: string;
  [key: string]: unknown;
}

export interface VideoStatusRequest {
  task_id: string;
}

export interface VolcanoEngineError {
  error: {
    message: string;
    type: string;
    code: string;
  };
}

export interface GenerationHistory {
  id: string;
  userId: string;
  type: 'image' | 'video';
  prompt: string;
  result: string; // URL
  status: 'pending' | 'processing' | 'completed' | 'failed';
  creditsUsed: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
