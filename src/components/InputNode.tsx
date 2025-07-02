import React, { useState } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from 'reactflow';

export interface InputNodeData {
  label: string;
  content: string;
  isEditing?: boolean;
}

export default function InputNode({ data, id }: NodeProps<InputNodeData>) {
  const { deleteElements } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(data.content || '');

  const handleSave = () => {
    data.content = content;
    setIsEditing(false);
  };

  const handleCancel = () => {
    setContent(data.content || '');
    setIsEditing(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteElements({ nodes: [{ id }] });
  };

  const nodeStyle = {
    background: '#f0f8ff',
    border: '2px solid #4682b4',
    borderRadius: '8px',
    padding: '12px',
    minWidth: '200px',
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
    gap: '4px'
  };

  const labelStyle = {
    fontWeight: 'bold',
    color: '#2c3e50',
    fontSize: '14px'
  };

  const editBtnStyle = {
    background: 'none',
    border: 'none',
    cursor: isEditing ? 'not-allowed' : 'pointer',
    fontSize: '12px',
    padding: '2px',
    opacity: isEditing ? 0.5 : 1
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

  const contentStyle = {
    marginBottom: '8px'
  };

  const previewStyle = {
    background: 'white',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '12px',
    lineHeight: '1.4'
  };

  const placeholderStyle = {
    background: '#f9f9f9',
    padding: '8px',
    borderRadius: '4px',
    border: '1px dashed #ccc',
    fontSize: '12px',
    color: '#666',
    textAlign: 'center' as const
  };

  const textareaStyle = {
    width: '100%',
    marginBottom: '8px',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '12px',
    fontFamily: 'inherit',
    resize: 'vertical' as const
  };

  const buttonContainerStyle = {
    display: 'flex',
    gap: '8px'
  };

  const saveButtonStyle = {
    padding: '4px 12px',
    border: 'none',
    borderRadius: '4px',
    background: '#4CAF50',
    color: 'white',
    cursor: 'pointer',
    fontSize: '12px'
  };

  const cancelButtonStyle = {
    padding: '4px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    background: 'white',
    cursor: 'pointer',
    fontSize: '12px'
  };

  return (
    <div style={nodeStyle}>
      <div style={headerStyle}>
        <span style={labelStyle}>{data.label}</span>
        <div style={buttonGroupStyle}>
          <button 
            style={editBtnStyle}
            onClick={() => setIsEditing(true)}
            disabled={isEditing}
            title="편집"
          >
            ✏️
          </button>
          <button 
            style={deleteBtnStyle}
            onClick={handleDelete}
            title="삭제"
          >
            ×
          </button>
        </div>
      </div>
      
      {isEditing ? (
        <div>
          <textarea
            style={textareaStyle}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="입력 내용을 작성하세요..."
            rows={4}
          />
          <div style={buttonContainerStyle}>
            <button style={saveButtonStyle} onClick={handleSave}>저장</button>
            <button style={cancelButtonStyle} onClick={handleCancel}>취소</button>
          </div>
        </div>
      ) : (
        <div style={contentStyle}>
          {data.content ? (
            <div style={previewStyle}>
              {data.content.length > 50 
                ? `${data.content.substring(0, 50)}...` 
                : data.content}
            </div>
          ) : (
            <div style={placeholderStyle}>
              클릭하여 입력 내용 작성
            </div>
          )}
        </div>
      )}
      
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        style={{ background: '#555' }}
      />
    </div>
  );
} 