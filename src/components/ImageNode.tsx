import React, { useState, useRef } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from 'reactflow';

export interface ImageNodeData {
  label: string;
  imageUrl?: string;
  imageBase64?: string;
  fileName?: string;
  description?: string;
}

export default function ImageNode({ data, id }: NodeProps<ImageNodeData>) {
  const { deleteElements } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(data.description || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        data.imageBase64 = base64;
        data.imageUrl = base64;
        data.fileName = file.name;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDescriptionSave = () => {
    data.description = description;
    setIsEditing(false);
  };

  const handleDescriptionCancel = () => {
    setDescription(data.description || '');
    setIsEditing(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteElements({ nodes: [{ id }] });
  };

  const nodeStyle = {
    background: '#fff5f5',
    border: '2px solid #ff6b6b',
    borderRadius: '8px',
    padding: '12px',
    minWidth: '250px',
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
    gap: '4px'
  };

  const labelStyle = {
    fontWeight: 'bold',
    color: '#2c3e50',
    fontSize: '14px'
  };

  const buttonStyle = {
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

  const uploadButtonStyle = {
    padding: '8px 12px',
    background: '#ff6b6b',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    marginBottom: '8px',
    width: '100%'
  };

  const imageContainerStyle = {
    marginBottom: '8px',
    textAlign: 'center' as const
  };

  const imageStyle = {
    maxWidth: '100%',
    maxHeight: '150px',
    borderRadius: '4px',
    border: '1px solid #ddd'
  };

  const placeholderStyle = {
    background: '#f9f9f9',
    padding: '20px',
    borderRadius: '4px',
    border: '2px dashed #ccc',
    fontSize: '12px',
    color: '#666',
    textAlign: 'center' as const
  };

  const descriptionStyle = {
    background: 'white',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '12px',
    lineHeight: '1.4',
    marginBottom: '8px'
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

  const fileNameStyle = {
    fontSize: '11px',
    color: '#666',
    marginTop: '4px',
    fontStyle: 'italic'
  };

  return (
    <div style={nodeStyle}>
      <div style={headerStyle}>
        <span style={labelStyle}>{data.label}</span>
        <div style={buttonGroupStyle}>
          <button 
            style={buttonStyle}
            onClick={() => setIsEditing(!isEditing)}
            title="설명 편집"
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
      
      <button 
        style={uploadButtonStyle}
        onClick={() => fileInputRef.current?.click()}
      >
        📷 이미지 업로드
      </button>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />
      
      <div style={imageContainerStyle}>
        {data.imageUrl ? (
          <div>
            <img src={data.imageUrl} alt="업로드된 이미지" style={imageStyle} />
            {data.fileName && (
              <div style={fileNameStyle}>{data.fileName}</div>
            )}
          </div>
        ) : (
          <div style={placeholderStyle}>
            이미지를 업로드하면 여기에 미리보기가 표시됩니다
          </div>
        )}
      </div>

      {isEditing ? (
        <div>
          <textarea
            style={textareaStyle}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="이미지에 대한 설명을 입력하세요..."
            rows={3}
          />
          <div style={buttonContainerStyle}>
            <button style={saveButtonStyle} onClick={handleDescriptionSave}>저장</button>
            <button style={cancelButtonStyle} onClick={handleDescriptionCancel}>취소</button>
          </div>
        </div>
      ) : data.description ? (
        <div style={descriptionStyle}>
          {data.description.length > 100 
            ? `${data.description.substring(0, 100)}...` 
            : data.description}
        </div>
      ) : (
        <div style={{ fontSize: '11px', color: '#999', textAlign: 'center' as const }}>
          클릭하여 이미지 설명 추가
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