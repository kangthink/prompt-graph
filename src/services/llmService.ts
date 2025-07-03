interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{
    type: 'text' | 'image_url';
    text?: string;
    image_url?: {
      url: string;
      detail?: 'low' | 'high' | 'auto';
    };
  }>;
}

interface LLMRequest {
  model: string;
  messages: LLMMessage[];
  max_tokens?: number;
  temperature?: number;
}

interface LLMResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

// Gemini API 인터페이스
interface GeminiRequest {
  contents: Array<{
    parts: Array<{
      text?: string;
      inline_data?: {
        mime_type: string;
        data: string;
      };
    }>;
  }>;
  generationConfig?: {
    maxOutputTokens?: number;
    temperature?: number;
  };
  systemInstruction?: {
    parts: Array<{
      text: string;
    }>;
  };
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

// Ollama API 인터페이스
interface OllamaRequest {
  model: string;
  prompt: string;
  stream: boolean;
  images?: string[];
}

interface OllamaResponse {
  response: string;
  done: boolean;
}

export interface LLMSettings {
  apiKey: string;
  model: string;
  baseUrl?: string;
}

export interface MultimodalInput {
  text?: string;
  imageBase64?: string;
  imageUrl?: string;
  description?: string;
}

export class LLMService {
  private settings: LLMSettings;

  constructor(settings: LLMSettings) {
    this.settings = settings;
  }

  async callAPI(input: string | MultimodalInput, systemPrompt: string): Promise<string> {
    if (!this.settings.apiKey || !this.settings.model) {
      throw new Error('API 키와 모델을 설정해주세요.');
    }

    const isOpenAI = this.settings.model.startsWith('gpt');
    const isClaude = this.settings.model.startsWith('claude');
    const isGemini = this.settings.model.startsWith('gemini');
    const isOllama = this.settings.model.startsWith('ollama:');

    if (isOpenAI) {
      return this.callOpenAI(input, systemPrompt);
    } else if (isClaude) {
      return this.callClaude(input, systemPrompt);
    } else if (isGemini) {
      return this.callGemini(input, systemPrompt);
    } else if (isOllama) {
      return this.callOllama(input, systemPrompt);
    } else {
      throw new Error('지원되지 않는 모델입니다.');
    }
  }

  private async callOpenAI(input: string | MultimodalInput, systemPrompt: string): Promise<string> {
    const url = this.settings.baseUrl || 'https://api.openai.com/v1/chat/completions';
    
    const userMessage: LLMMessage = this.createUserMessage(input);
    
    // 시스템 프롬프트에서 {입력} 템플릿 처리
    const inputText = typeof input === 'string' ? input : input.text || input.description || '';
    const processedSystemPrompt = systemPrompt.replace(/\{입력\}/g, inputText);

    const request: LLMRequest = {
      model: this.settings.model,
      messages: [
        { role: 'system', content: processedSystemPrompt },
        userMessage
      ],
      max_tokens: 1000,
      temperature: 0.7,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.settings.apiKey}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API 호출 실패: ${response.status} - ${error}`);
    }

    const data: LLMResponse = await response.json();
    return data.choices[0]?.message?.content || '응답을 받을 수 없습니다.';
  }

  private async callClaude(input: string | MultimodalInput, systemPrompt: string): Promise<string> {
    const url = this.settings.baseUrl || 'https://api.anthropic.com/v1/messages';
    
    const userContent = this.createClaudeContent(input);
    
    // 시스템 프롬프트에서 {입력} 템플릿 처리
    const inputText = typeof input === 'string' ? input : input.text || input.description || '';
    const processedSystemPrompt = systemPrompt.replace(/\{입력\}/g, inputText);

    const request = {
      model: this.settings.model,
      max_tokens: 1000,
      system: processedSystemPrompt,
      messages: [
        {
          role: 'user',
          content: userContent
        }
      ]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.settings.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API 호출 실패: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.content[0]?.text || '응답을 받을 수 없습니다.';
  }

  private async callGemini(input: string | MultimodalInput, systemPrompt: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.settings.model}:generateContent?key=${this.settings.apiKey}`;
    
    // 시스템 프롬프트에서 {입력} 템플릿 처리
    const inputText = typeof input === 'string' ? input : input.text || input.description || '';
    const processedSystemPrompt = systemPrompt.replace(/\{입력\}/g, inputText);

    const contents = this.createGeminiContent(input);
    
    const request: GeminiRequest = {
      contents,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
      systemInstruction: {
        parts: [{ text: processedSystemPrompt }]
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API 호출 실패: ${response.status} - ${error}`);
    }

    const data: GeminiResponse = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || '응답을 받을 수 없습니다.';
  }

  private async callOllama(input: string | MultimodalInput, systemPrompt: string): Promise<string> {
    const baseUrl = this.settings.baseUrl || 'http://localhost:11434';
    const modelName = this.settings.model.replace('ollama:', '');

    // Ollama 서버 상태 확인
    try {
      await this.checkOllamaServer(baseUrl);
    } catch (error) {
      throw new Error('Ollama 서버에 연결할 수 없습니다. Ollama가 설치되고 실행 중인지 확인해주세요.');
    }

    // 모델 존재 여부 확인 및 다운로드
    try {
      await this.ensureOllamaModel(baseUrl, modelName);
    } catch (error) {
      throw new Error(`모델 ${modelName} 다운로드 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }

    // 시스템 프롬프트에서 {입력} 템플릿 처리
    const inputText = typeof input === 'string' ? input : input.text || input.description || '';
    const processedSystemPrompt = systemPrompt.replace(/\{입력\}/g, inputText);

    // 프롬프트 구성
    const fullPrompt = `${processedSystemPrompt}\n\n${inputText}`;

    const request: OllamaRequest = {
      model: modelName,
      prompt: fullPrompt,
      stream: false,
    };

    // 이미지가 있는 경우 추가
    if (typeof input !== 'string' && input.imageBase64) {
      // data:image/jpeg;base64, 부분을 제거
      const base64Data = input.imageBase64.replace(/^data:image\/[a-zA-Z]*;base64,/, '');
      request.images = [base64Data];
    }

    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ollama API 호출 실패: ${response.status} - ${error}`);
    }

    const data: OllamaResponse = await response.json();
    return data.response || '응답을 받을 수 없습니다.';
  }

  // Ollama 서버 상태 확인
  private async checkOllamaServer(baseUrl: string): Promise<void> {
    const response = await fetch(`${baseUrl}/api/tags`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error('Ollama 서버 연결 실패');
    }
  }

  // Ollama 모델 존재 여부 확인 및 다운로드
  private async ensureOllamaModel(baseUrl: string, modelName: string): Promise<void> {
    // 설치된 모델 목록 확인
    const tagsResponse = await fetch(`${baseUrl}/api/tags`);
    if (!tagsResponse.ok) {
      throw new Error('모델 목록을 가져올 수 없습니다.');
    }

    const tagsData = await tagsResponse.json();
    const installedModels = tagsData.models || [];
    const isModelInstalled = installedModels.some((model: any) => model.name.includes(modelName));

    if (!isModelInstalled) {
      // 모델 다운로드
      console.log(`모델 ${modelName}을 다운로드 중입니다...`);
      
      const pullResponse = await fetch(`${baseUrl}/api/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: modelName,
          stream: false,
        }),
      });

      if (!pullResponse.ok) {
        throw new Error(`모델 다운로드 실패: ${pullResponse.status}`);
      }

      console.log(`모델 ${modelName} 다운로드 완료`);
    }
  }

  private createUserMessage(input: string | MultimodalInput): LLMMessage {
    if (typeof input === 'string') {
      return {
        role: 'user',
        content: input
      };
    }

    // 멀티모달 입력 처리
    const content: Array<{
      type: 'text' | 'image_url';
      text?: string;
      image_url?: { url: string; detail?: 'low' | 'high' | 'auto' };
    }> = [];

    // 텍스트 또는 설명 추가
    const textContent = input.text || input.description || '';
    if (textContent) {
      content.push({
        type: 'text',
        text: textContent
      });
    }

    // 이미지 추가
    if (input.imageBase64) {
      content.push({
        type: 'image_url',
        image_url: {
          url: input.imageBase64,
          detail: 'high'
        }
      });
    } else if (input.imageUrl) {
      content.push({
        type: 'image_url',
        image_url: {
          url: input.imageUrl,
          detail: 'high'
        }
      });
    }

    return {
      role: 'user',
      content: content
    };
  }

  private createClaudeContent(input: string | MultimodalInput): Array<any> {
    if (typeof input === 'string') {
      return [{ type: 'text', text: input }];
    }

    const content: Array<any> = [];

    // 텍스트 또는 설명 추가
    const textContent = input.text || input.description || '';
    if (textContent) {
      content.push({
        type: 'text',
        text: textContent
      });
    }

    // 이미지 추가 (Claude는 base64 형식을 요구)
    if (input.imageBase64) {
      // data:image/jpeg;base64, 부분을 제거하고 미디어 타입 추출
      const matches = input.imageBase64.match(/^data:image\/([a-zA-Z]*);base64,(.+)$/);
      if (matches) {
        const mediaType = matches[1];
        const base64Data = matches[2];
        
        content.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: `image/${mediaType}`,
            data: base64Data
          }
        });
      }
    }

    return content;
  }

  // Gemini 컨텐츠 생성
  private createGeminiContent(input: string | MultimodalInput): Array<any> {
    if (typeof input === 'string') {
      return [{
        parts: [{ text: input }]
      }];
    }

    const parts: Array<any> = [];

    // 텍스트 또는 설명 추가
    const textContent = input.text || input.description || '';
    if (textContent) {
      parts.push({ text: textContent });
    }

    // 이미지 추가 (Gemini는 inline_data 형식)
    if (input.imageBase64) {
      const matches = input.imageBase64.match(/^data:image\/([a-zA-Z]*);base64,(.+)$/);
      if (matches) {
        const mediaType = matches[1];
        const base64Data = matches[2];
        
        parts.push({
          inline_data: {
            mime_type: `image/${mediaType}`,
            data: base64Data
          }
        });
      }
    }

    return [{ parts }];
  }

  // 모델이 멀티모달을 지원하는지 확인
  isMultimodalSupported(): boolean {
    const multimodalModels = [
      'gpt-4-vision-preview',
      'gpt-4-turbo',
      'gpt-4o',
      'claude-3-opus',
      'claude-3-sonnet',
      'claude-3-haiku',
      'claude-3-5-sonnet',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-pro-vision',
      'ollama:llava',
      'ollama:llava:7b',
      'ollama:llava:13b',
      'ollama:llava:34b',
      'ollama:bakllava'
    ];
    
    return multimodalModels.some(model => this.settings.model.includes(model));
  }
} 