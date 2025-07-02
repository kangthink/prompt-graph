import React, { useState } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from 'reactflow';

export interface OutputNodeData {
  label: string;
  content: string;
  isLoading?: boolean;
  error?: string;
}

export default function OutputNode({ data, id }: NodeProps<OutputNodeData>) {
  const { deleteElements } = useReactFlow();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteElements({ nodes: [{ id }] });
  };

  const nodeStyle = {
    background: '#f0fff0',
    border: '2px solid #32cd32',
    borderRadius: '8px',
    padding: '12px',
    minWidth: '200px',
    maxWidth: '300px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  };

  const buttonGroupStyle = {
    display: 'flex',
    gap: '4px',
    alignItems: 'center'
  };

  const labelStyle = {
    fontWeight: 'bold',
    color: '#2c3e50',
    fontSize: '14px'
  };

  const expandBtnStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '12px',
    padding: '2px'
  };

  const deleteBtnStyle = {
    background: '#ff4757',
    border: 'none',
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    cursor: 'pointer',
    fontSize: '10px',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0'
  };

  const loadingStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    color: '#666',
    fontSize: '12px'
  };

  const spinnerStyle = {
    width: '16px',
    height: '16px',
    border: '2px solid #f3f3f3',
    borderTop: '2px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  };

  const errorStyle = {
    background: '#ffebee',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #f44336',
    fontSize: '12px',
    color: '#c62828'
  };

  const contentStyle = {
    background: 'white',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '12px',
    lineHeight: '1.4',
    maxHeight: isExpanded ? '300px' : '100px',
    overflowY: 'auto' as const
  };

  const placeholderStyle = {
    background: '#f9f9f9',
    padding: '12px',
    borderRadius: '4px',
    border: '1px dashed #ccc',
    fontSize: '12px',
    color: '#666',
    textAlign: 'center' as const,
    fontStyle: 'italic'
  };

  return (
    <div style={nodeStyle}>
      <div style={headerStyle}>
        <span style={labelStyle}>{data.label}</span>
        <div style={buttonGroupStyle}>
          {data.content && (
            <button 
              style={expandBtnStyle}
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? '접기' : '펼치기'}
            >
              {isExpanded ? '🔼' : '🔽'}
            </button>
          )}
          <button 
            style={deleteBtnStyle}
            onClick={handleDelete}
            title="삭제"
          >
            ×
          </button>
        </div>
      </div>
      
      <div>
        {data.isLoading ? (
          <div style={loadingStyle}>
            <div style={spinnerStyle}></div>
            <span>생성 중...</span>
          </div>
        ) : data.error ? (
          <div style={errorStyle}>
            <span>❌ 오류: {data.error}</span>
          </div>
        ) : data.content ? (
          <div style={contentStyle}>
            {isExpanded ? data.content : 
              data.content.length > 100 
                ? `${data.content.substring(0, 100)}...`
                : data.content
            }
          </div>
        ) : (
          <div style={placeholderStyle}>
            입력과 프롬프트를 연결하면 결과가 여기에 표시됩니다
          </div>
        )}
      </div>
      
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        style={{ background: '#555' }}
      />
      
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        style={{ background: '#555' }}
      />
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
} 