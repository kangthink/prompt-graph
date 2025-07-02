import React, { useState } from 'react';
import { 
  EdgeProps, 
  getBezierPath, 
  EdgeLabelRenderer,
  BaseEdge 
} from 'reactflow';

export interface PromptEdgeData {
  prompt: string;
  isEditing?: boolean;
}

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps<PromptEdgeData>) {
  const [isEditing, setIsEditing] = useState(false);
  const [prompt, setPrompt] = useState(data?.prompt || '프롬프트를 입력하세요');

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const handleSave = () => {
    if (data) {
      data.prompt = prompt;
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setPrompt(data?.prompt || '프롬프트를 입력하세요');
    setIsEditing(false);
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          {isEditing ? (
            <div className="edge-editor">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="프롬프트를 입력하세요..."
                rows={3}
                cols={40}
                style={{
                  fontSize: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '8px',
                  resize: 'none',
                  fontFamily: 'inherit'
                }}
              />
              <div className="editor-buttons">
                <button 
                  onClick={handleSave}
                  style={{
                    background: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    marginRight: '4px'
                  }}
                >
                  저장
                </button>
                <button 
                  onClick={handleCancel}
                  style={{
                    background: '#f44336',
                    color: 'white',
                    border: 'none',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <div 
              className="edge-label"
              onClick={() => setIsEditing(true)}
              style={{
                background: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '4px',
                padding: '6px 12px',
                cursor: 'pointer',
                maxWidth: '200px',
                wordWrap: 'break-word',
                textAlign: 'center',
                fontSize: '11px',
                lineHeight: '1.3',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                fontWeight: '500'
              }}
            >
              {prompt.length > 50 ? `${prompt.substring(0, 50)}...` : prompt}
              <div style={{ 
                fontSize: '10px', 
                color: '#666', 
                marginTop: '2px' 
              }}>
                클릭 편집 | 더블클릭 미리보기
              </div>
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
} 