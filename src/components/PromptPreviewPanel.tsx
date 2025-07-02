import React from 'react';
import { MultimodalInput } from '../services/llmService';

export interface PromptPreviewData {
  sourceNodeId: string;
  targetNodeId: string;
  sourceLabel: string;
  targetLabel: string;
  input: string | MultimodalInput;
  prompt: string;
  model: string;
}

interface PromptPreviewPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onExecute: () => void;
  previewData: PromptPreviewData | null;
}

export default function PromptPreviewPanel({ 
  isOpen, 
  onClose, 
  onExecute,
  previewData 
}: PromptPreviewPanelProps) {
  if (!isOpen || !previewData) return null;

  const isMultimodal = typeof previewData.input !== 'string';
  
  const formatInput = (input: string | MultimodalInput): string => {
    if (typeof input === 'string') {
      return input;
    }
    
    const parts: string[] = [];
    if (input.description || input.text) {
      parts.push(input.description || input.text || '');
    }
    if (input.imageBase64 || input.imageUrl) {
      parts.push('[이미지 첨부됨]');
    }
    return parts.join('\n');
  };

  const getSystemMessage = () => previewData.prompt;
  const getUserMessage = () => formatInput(previewData.input);
  
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
    width: '700px',
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
    borderBottom: '1px solid #eee',
    background: '#f8f9fa'
  };

  const titleStyle = {
    margin: '0',
    color: '#2c3e50',
    fontSize: '18px'
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

  const sectionStyle = {
    marginBottom: '20px'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 'bold',
    color: '#2c3e50',
    fontSize: '14px'
  };

  const infoBoxStyle = {
    background: '#f8f9fa',
    border: '1px solid #e9ecef',
    borderRadius: '4px',
    padding: '12px',
    fontSize: '12px',
    marginBottom: '12px'
  };

  const messageBoxStyle = {
    background: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    padding: '16px',
    fontSize: '14px',
    lineHeight: '1.5',
    whiteSpace: 'pre-wrap' as const,
    maxHeight: '200px',
    overflowY: 'auto' as const
  };

  const systemMessageStyle = {
    ...messageBoxStyle,
    background: '#fff3cd',
    border: '1px solid #ffeaa7'
  };

  const userMessageStyle = {
    ...messageBoxStyle,
    background: '#e3f2fd',
    border: '1px solid #bbdefb'
  };

  const imagePreviewStyle = {
    maxWidth: '200px',
    maxHeight: '150px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    marginTop: '8px'
  };

  const footerStyle = {
    display: 'flex',
    gap: '12px',
    padding: '20px',
    borderTop: '1px solid #eee',
    justifyContent: 'flex-end',
    background: '#f8f9fa'
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

  const executeBtnStyle = {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    background: '#28a745',
    color: 'white',
    fontWeight: 'bold'
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <h3 style={titleStyle}>프롬프트 미리보기</h3>
          <button style={closeBtnStyle} onClick={onClose}>✕</button>
        </div>
        
        <div style={contentStyle}>
          <div style={infoBoxStyle}>
            <strong>연결:</strong> {previewData.sourceLabel} → {previewData.targetLabel}<br/>
            <strong>모델:</strong> {previewData.model}<br/>
            <strong>타입:</strong> {isMultimodal ? '멀티모달 (텍스트 + 이미지)' : '텍스트 전용'}
          </div>

          <div style={sectionStyle}>
            <label style={labelStyle}>시스템 메시지 (프롬프트)</label>
            <div style={systemMessageStyle}>
              {getSystemMessage() || '(프롬프트가 설정되지 않았습니다)'}
            </div>
          </div>

          <div style={sectionStyle}>
            <label style={labelStyle}>사용자 메시지</label>
            <div style={userMessageStyle}>
              {getUserMessage() || '(입력 내용이 없습니다)'}
            </div>
            
            {isMultimodal && (previewData.input as MultimodalInput).imageBase64 && (
              <div>
                <label style={labelStyle}>첨부된 이미지</label>
                <img 
                  src={(previewData.input as MultimodalInput).imageBase64} 
                  alt="미리보기" 
                  style={imagePreviewStyle}
                />
              </div>
            )}
          </div>

          {!getSystemMessage() && (
            <div style={{
              background: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: '4px',
              padding: '12px',
              fontSize: '12px',
              color: '#856404'
            }}>
              ⚠️ 프롬프트가 설정되지 않았습니다. 엣지를 클릭하여 프롬프트를 입력해주세요.
            </div>
          )}

          {!getUserMessage() && (
            <div style={{
              background: '#f8d7da',
              border: '1px solid #f5c6cb',
              borderRadius: '4px',
              padding: '12px',
              fontSize: '12px',
              color: '#721c24'
            }}>
              ⚠️ 입력 내용이 없습니다. 입력 노드에 내용을 추가해주세요.
            </div>
          )}
        </div>
        
        <div style={footerStyle}>
          <button style={cancelBtnStyle} onClick={onClose}>
            취소
          </button>
          <button 
            style={executeBtnStyle} 
            onClick={onExecute}
            disabled={!getSystemMessage() || !getUserMessage()}
          >
            🚀 실행
          </button>
        </div>
      </div>
    </div>
  );
} 