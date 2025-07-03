import React, { useState } from 'react';
import { Node } from 'reactflow';
import { InputNodeData } from './InputNode';
import { OutputNodeData } from './OutputNode';
import { ImageNodeData } from './ImageNode';

export interface NodeDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  node: Node | null;
}

export default function NodeDetailPanel({ isOpen, onClose, node }: NodeDetailPanelProps) {
  const [copySuccess, setCopySuccess] = useState<string>('');

  if (!isOpen || !node) return null;

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(`${label} 복사됨!`);
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      setCopySuccess('복사 실패');
      setTimeout(() => setCopySuccess(''), 2000);
    }
  };

  const detailItemStyle: React.CSSProperties = {
    marginBottom: '16px',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontWeight: 600,
    marginBottom: '8px',
    color: '#343a40',
  };

  const contentWithCopyStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-start',
  };

  const statusStyle = (isLoading: boolean, error: string | null, content: string) => ({
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 500,
    background: isLoading ? '#e3f2fd' : error ? '#ffebee' : content ? '#e8f5e8' : '#f5f5f5',
    color: isLoading ? '#1976d2' : error ? '#d32f2f' : content ? '#2e7d32' : '#666',
  });

  const imagePreviewStyle: React.CSSProperties = {
    border: '1px solid #dee2e6',
    borderRadius: '6px',
    padding: '12px',
    background: '#f8f9fa',
    textAlign: 'center',
  };

  const renderNodeContent = () => {
    switch (node.type) {
      case 'inputNode':
        const inputData = node.data as InputNodeData;
        return (
          <div>
            <div>
              <h3 style={{ margin: '0 0 16px 0', color: '#495057', fontSize: '18px' }}>📝 텍스트 입력 노드</h3>
              <div style={detailItemStyle}>
                <label style={labelStyle}>노드 이름:</label>
                <div style={contentWithCopyStyle}>
                  <span>{inputData.label}</span>
                  <button 
                    style={copyBtnStyle}
                    onClick={() => copyToClipboard(inputData.label, '노드 이름')}
                  >
                    📋
                  </button>
                </div>
              </div>
              
              <div style={detailItemStyle}>
                <label style={labelStyle}>내용 ({inputData.content?.length || 0}자):</label>
                <div style={contentWithCopyStyle}>
                  <textarea 
                    value={inputData.content || ''}
                    readOnly
                    rows={6}
                    style={readonlyTextareaStyle}
                  />
                  <button 
                    style={{
                      ...copyBtnStyle,
                      background: !inputData.content ? '#6c757d' : '#007bff',
                      cursor: !inputData.content ? 'not-allowed' : 'pointer',
                    }}
                    onClick={() => copyToClipboard(inputData.content || '', '내용')}
                    disabled={!inputData.content}
                  >
                    📋
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'outputNode':
        const outputData = node.data as OutputNodeData;
        return (
          <div>
            <div>
              <h3 style={{ margin: '0 0 16px 0', color: '#495057', fontSize: '18px' }}>📤 출력 노드</h3>
              <div style={detailItemStyle}>
                <label style={labelStyle}>노드 이름:</label>
                <div style={contentWithCopyStyle}>
                  <span>{outputData.label}</span>
                  <button 
                    style={copyBtnStyle}
                    onClick={() => copyToClipboard(outputData.label, '노드 이름')}
                  >
                    📋
                  </button>
                </div>
              </div>

              <div style={detailItemStyle}>
                <label style={labelStyle}>상태:</label>
                <span style={statusStyle(outputData.isLoading || false, outputData.error || null, outputData.content || '')}>
                  {outputData.isLoading ? '⏳ 로딩 중...' : 
                   outputData.error ? `❌ 오류: ${outputData.error}` : 
                   outputData.content ? '✅ 완료' : '⚪ 대기 중'}
                </span>
              </div>
              
              {outputData.content && (
                <div style={detailItemStyle}>
                  <label style={labelStyle}>AI 응답 ({outputData.content.length}자):</label>
                  <div style={contentWithCopyStyle}>
                    <textarea 
                      value={outputData.content}
                      readOnly
                      rows={8}
                      style={readonlyTextareaStyle}
                    />
                    <button 
                      style={copyBtnStyle}
                      onClick={() => copyToClipboard(outputData.content, 'AI 응답')}
                    >
                      📋
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'imageNode':
        const imageData = node.data as ImageNodeData;
        return (
          <div>
            <div>
              <h3 style={{ margin: '0 0 16px 0', color: '#495057', fontSize: '18px' }}>🖼️ 이미지 노드</h3>
              <div style={detailItemStyle}>
                <label style={labelStyle}>노드 이름:</label>
                <div style={contentWithCopyStyle}>
                  <span>{imageData.label}</span>
                  <button 
                    style={copyBtnStyle}
                    onClick={() => copyToClipboard(imageData.label, '노드 이름')}
                  >
                    📋
                  </button>
                </div>
              </div>

              {imageData.fileName && (
                <div style={detailItemStyle}>
                  <label style={labelStyle}>파일 정보:</label>
                  <div>
                    <div>파일명: {imageData.fileName}</div>
                  </div>
                </div>
              )}

              {(imageData.imageBase64 || imageData.imageUrl) && (
                <div style={detailItemStyle}>
                  <label style={labelStyle}>이미지 미리보기:</label>
                  <div style={imagePreviewStyle}>
                    <img 
                      src={imageData.imageBase64 || imageData.imageUrl} 
                      alt="업로드된 이미지"
                      style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                    />
                  </div>
                </div>
              )}
              
              <div style={detailItemStyle}>
                <label style={labelStyle}>설명:</label>
                <div style={contentWithCopyStyle}>
                  <textarea 
                    value={imageData.description || ''}
                    readOnly
                    rows={4}
                    style={readonlyTextareaStyle}
                    placeholder="설명 없음"
                  />
                  <button 
                    style={{
                      ...copyBtnStyle,
                      background: !imageData.description ? '#6c757d' : '#007bff',
                      cursor: !imageData.description ? 'not-allowed' : 'pointer',
                    }}
                    onClick={() => copyToClipboard(imageData.description || '', '설명')}
                    disabled={!imageData.description}
                  >
                    📋
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>알 수 없는 노드 타입</div>;
    }
  };

  const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
  };

  const modalContentStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: '12px',
    padding: 0,
    maxWidth: '600px',
    maxHeight: '80vh',
    width: '90%',
    overflow: 'hidden',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
  };

  const modalHeaderStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    background: '#f8f9fa',
    borderBottom: '1px solid #e9ecef',
  };

  const modalBodyStyle: React.CSSProperties = {
    padding: '20px',
    maxHeight: '400px',
    overflowY: 'auto',
  };

  const modalFooterStyle: React.CSSProperties = {
    padding: '16px 20px',
    background: '#f8f9fa',
    borderTop: '1px solid #e9ecef',
  };

  const copyBtnStyle: React.CSSProperties = {
    background: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background 0.2s',
    flexShrink: 0,
  };

  const readonlyTextareaStyle: React.CSSProperties = {
    flex: 1,
    padding: '12px',
    border: '1px solid #ced4da',
    borderRadius: '6px',
    background: '#f8f9fa',
    fontFamily: 'inherit',
    fontSize: '14px',
    lineHeight: 1.4,
    resize: 'vertical',
    minHeight: '80px',
  };

  const copySuccessStyle: React.CSSProperties = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    background: '#d4edda',
    color: '#155724',
    padding: '12px 16px',
    borderRadius: '6px',
    border: '1px solid #c3e6cb',
    fontWeight: 500,
    zIndex: 10001,
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeaderStyle}>
          <h2 style={{ margin: 0, color: '#343a40' }}>노드 상세 정보</h2>
          <button 
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6c757d',
              padding: 0,
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={onClose}
          >
            ×
          </button>
        </div>
        
        <div style={modalBodyStyle}>
          <div style={{ marginBottom: '16px' }}>
            {renderNodeContent()}
          </div>
          
          {copySuccess && (
            <div style={copySuccessStyle}>
              ✅ {copySuccess}
            </div>
          )}
        </div>
        
        <div style={modalFooterStyle}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#6c757d',
          }}>
            <small>노드 ID: {node.id}</small>
            <small>위치: ({Math.round(node.position.x)}, {Math.round(node.position.y)})</small>
          </div>
        </div>
      </div>
    </div>
  );
} 