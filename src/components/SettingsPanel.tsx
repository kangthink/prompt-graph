import React, { useState, useEffect } from 'react';

export interface SettingsData {
  apiKey: string;
  model: string;
  baseUrl?: string;
}

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SettingsData;
  onSave: (settings: SettingsData) => void;
}

const AVAILABLE_MODELS = [
  // OpenAI 모델
  { value: 'gpt-4o', label: 'GPT-4o (멀티모달)', multimodal: true },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini (멀티모달)', multimodal: true },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo (멀티모달)', multimodal: true },
  { value: 'gpt-4', label: 'GPT-4', multimodal: false },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', multimodal: false },
  
  // Anthropic Claude 모델
  { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet (최신, 멀티모달)', multimodal: true },
  { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus (멀티모달)', multimodal: true },
  { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet (멀티모달)', multimodal: true },
  { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku (멀티모달)', multimodal: true },
  
  // Google Gemini 모델
  { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (멀티모달)', multimodal: true },
  { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (멀티모달)', multimodal: true },
  { value: 'gemini-pro', label: 'Gemini Pro', multimodal: false },
  { value: 'gemini-pro-vision', label: 'Gemini Pro Vision (멀티모달)', multimodal: true },
  
  // Ollama 로컬 모델 (인기 모델들)
  { value: 'ollama:llama3.2', label: 'Ollama: Llama 3.2 (로컬)', multimodal: false },
  { value: 'ollama:llama3.1', label: 'Ollama: Llama 3.1 (로컬)', multimodal: false },
  { value: 'ollama:llama3', label: 'Ollama: Llama 3 (로컬)', multimodal: false },
  { value: 'ollama:llama2', label: 'Ollama: Llama 2 (로컬)', multimodal: false },
  { value: 'ollama:mistral', label: 'Ollama: Mistral (로컬)', multimodal: false },
  { value: 'ollama:codellama', label: 'Ollama: CodeLlama (로컬)', multimodal: false },
  { value: 'ollama:llava', label: 'Ollama: LLaVA (로컬, 멀티모달)', multimodal: true },
  { value: 'ollama:bakllava', label: 'Ollama: BakLLaVA (로컬, 멀티모달)', multimodal: true },
  { value: 'ollama:gemma2', label: 'Ollama: Gemma 2 (로컬)', multimodal: false },
  { value: 'ollama:qwen2.5', label: 'Ollama: Qwen 2.5 (로컬)', multimodal: false },
];

export default function SettingsPanel({ 
  isOpen, 
  onClose, 
  settings, 
  onSave 
}: SettingsPanelProps) {
  const [formData, setFormData] = useState<SettingsData>(settings);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const handleInputChange = (field: keyof SettingsData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const selectedModel = AVAILABLE_MODELS.find(m => m.value === formData.model);
  const isMultimodalModel = selectedModel?.multimodal || false;

  if (!isOpen) return null;

  const overlayStyle = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  };

  const panelStyle = {
    background: 'white',
    borderRadius: '8px',
    width: '500px',
    maxWidth: '90vw',
    maxHeight: '90vh',
    overflowY: 'auto' as const,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #eee'
  };

  const titleStyle = {
    margin: '0',
    color: '#2c3e50'
  };

  const closeBtnStyle = {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#666'
  };

  const contentStyle = {
    padding: '20px'
  };

  const formGroupStyle = {
    marginBottom: '20px'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500',
    color: '#2c3e50'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box' as const
  };

  const smallStyle = {
    display: 'block',
    marginTop: '4px',
    color: '#666',
    fontSize: '12px'
  };

  const infoBoxStyle = {
    background: isMultimodalModel ? '#e8f5e8' : '#fff3cd',
    border: `1px solid ${isMultimodalModel ? '#4caf50' : '#ffc107'}`,
    borderRadius: '4px',
    padding: '12px',
    marginTop: '8px',
    fontSize: '12px'
  };

  const footerStyle = {
    display: 'flex',
    gap: '12px',
    padding: '20px',
    borderTop: '1px solid #eee',
    justifyContent: 'flex-end'
  };

  const cancelBtnStyle = {
    padding: '10px 20px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    background: 'white',
    color: '#666'
  };

  const saveBtnStyle = {
    padding: '10px 20px',
    border: '1px solid #3498db',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    background: '#3498db',
    color: 'white'
  };

  return (
    <div style={overlayStyle}>
      <div style={panelStyle}>
        <div style={headerStyle}>
          <h3 style={titleStyle}>설정</h3>
          <button style={closeBtnStyle} onClick={onClose}>✕</button>
        </div>
        
        <div style={contentStyle}>
          <div style={formGroupStyle}>
            <label style={labelStyle} htmlFor="apiKey">API 키 * (필수)</label>
            <input
              style={{
                ...inputStyle,
                borderColor: !formData.apiKey ? '#e74c3c' : '#ddd'
              }}
              id="apiKey"
              type="password"
              value={formData.apiKey}
              onChange={(e) => handleInputChange('apiKey', e.target.value)}
              placeholder="API 키를 입력하세요 (OpenAI/Anthropic/Gemini)"
            />
            <small style={smallStyle}>
              • OpenAI: sk-로 시작하는 키 (https://platform.openai.com/api-keys)<br/>
              • Anthropic: 일반 문자열 키 (https://console.anthropic.com/)<br/>
              • Gemini: Google AI Studio에서 발급 (https://makersuite.google.com/app/apikey)<br/>
              • Ollama: 로컬 모델의 경우 임의 문자열 입력 (예: "local")
            </small>
            {!formData.apiKey && (
              <div style={{
                fontSize: '12px',
                color: '#e74c3c',
                marginTop: '4px'
              }}>
                ⚠️ API 키가 없으면 프롬프트를 실행할 수 없습니다
              </div>
            )}
          </div>
          
          <div style={formGroupStyle}>
            <label style={labelStyle} htmlFor="model">모델</label>
            <select
              style={inputStyle}
              id="model"
              value={formData.model}
              onChange={(e) => handleInputChange('model', e.target.value)}
            >
              <option value="">모델을 선택하세요</option>
              {AVAILABLE_MODELS.map(model => (
                <option key={model.value} value={model.value}>
                  {model.label}
                </option>
              ))}
            </select>
            
            {selectedModel && (
              <div style={infoBoxStyle}>
                {isMultimodalModel ? (
                  <>
                    <strong>✅ 멀티모달 지원</strong><br />
                    이 모델은 텍스트와 이미지를 모두 처리할 수 있습니다. 
                    이미지 노드를 사용하여 시각적 콘텐츠를 분석할 수 있습니다.
                  </>
                ) : (
                  <>
                    <strong>📝 텍스트 전용</strong><br />
                    이 모델은 텍스트만 처리할 수 있습니다. 
                    이미지 노드를 사용하려면 멀티모달 모델을 선택해주세요.
                  </>
                )}
              </div>
            )}
          </div>
          
          <div style={formGroupStyle}>
            <label style={labelStyle} htmlFor="baseUrl">Base URL (선택사항)</label>
            <input
              style={inputStyle}
              id="baseUrl"
              type="text"
              value={formData.baseUrl || ''}
              onChange={(e) => handleInputChange('baseUrl', e.target.value)}
              placeholder="https://api.openai.com/v1 (또는 http://localhost:11434 for Ollama)"
            />
            <small style={smallStyle}>
              • 기본값: OpenAI(https://api.openai.com/v1), Claude(https://api.anthropic.com/v1), Gemini(자동)<br/>
              • Ollama: http://localhost:11434 (기본 포트)<br/>
              • 프록시나 커스텀 엔드포인트를 사용하는 경우에만 변경
            </small>
          </div>
        </div>
        
        <div style={footerStyle}>
          <button style={cancelBtnStyle} onClick={onClose}>
            취소
          </button>
          <button 
            style={{
              ...saveBtnStyle,
              opacity: !formData.apiKey || !formData.model ? 0.5 : 1,
              cursor: !formData.apiKey || !formData.model ? 'not-allowed' : 'pointer'
            }} 
            onClick={handleSave}
            disabled={!formData.apiKey || !formData.model}
            title={!formData.apiKey || !formData.model ? 'API 키와 모델을 모두 설정해주세요' : ''}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
} 