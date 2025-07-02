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

  async callAPI(input: string | MultimodalInput, prompt: string): Promise<string> {
    if (!this.settings.apiKey || !this.settings.model) {
      throw new Error('API 키와 모델을 설정해주세요.');
    }

    const isOpenAI = this.settings.model.startsWith('gpt');
    const isClaude = this.settings.model.startsWith('claude');

    if (isOpenAI) {
      return this.callOpenAI(input, prompt);
    } else if (isClaude) {
      return this.callClaude(input, prompt);
    } else {
      throw new Error('지원되지 않는 모델입니다.');
    }
  }

  private async callOpenAI(input: string | MultimodalInput, prompt: string): Promise<string> {
    const url = this.settings.baseUrl || 'https://api.openai.com/v1/chat/completions';
    
    const userMessage: LLMMessage = this.createUserMessage(input);
    
    const request: LLMRequest = {
      model: this.settings.model,
      messages: [
        { role: 'system', content: prompt },
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

  private async callClaude(input: string | MultimodalInput, prompt: string): Promise<string> {
    const url = this.settings.baseUrl || 'https://api.anthropic.com/v1/messages';
    
    const userContent = this.createClaudeContent(input);
    
    const request = {
      model: this.settings.model,
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            ...userContent
          ]
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

  // 모델이 멀티모달을 지원하는지 확인
  isMultimodalSupported(): boolean {
    const multimodalModels = [
      'gpt-4-vision-preview',
      'gpt-4-turbo',
      'gpt-4o',
      'claude-3-opus',
      'claude-3-sonnet',
      'claude-3-haiku'
    ];
    
    return multimodalModels.some(model => this.settings.model.includes(model));
  }
} 