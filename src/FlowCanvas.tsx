import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  Connection,
  Edge,
  Node,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  useNodesState,
  useEdgesState,
} from 'reactflow';

import InputNode, { InputNodeData } from './components/InputNode';
import OutputNode, { OutputNodeData } from './components/OutputNode';
import ImageNode, { ImageNodeData } from './components/ImageNode';
import CustomEdge, { PromptEdgeData } from './components/CustomEdge';
import SettingsPanel, { SettingsData } from './components/SettingsPanel';
import PromptPreviewPanel, { PromptPreviewData } from './components/PromptPreviewPanel';
import { LLMService, MultimodalInput } from './services/llmService';

// 노드 타입 정의
const nodeTypes = {
  inputNode: InputNode,
  outputNode: OutputNode,
  imageNode: ImageNode,
};

// 엣지 타입 정의
const edgeTypes = {
  promptEdge: CustomEdge,
};

// 초기 노드 정의
const initialNodes: Node[] = [
  {
    id: 'input-1',
    type: 'inputNode',
    data: { 
      label: '텍스트 입력', 
      content: '안녕하세요! 저는 AI 어시스턴트입니다.' 
    } as InputNodeData,
    position: { x: 100, y: 100 },
  },
  {
    id: 'image-1',
    type: 'imageNode',
    data: { 
      label: '이미지 입력',
      description: '이미지를 업로드해주세요'
    } as ImageNodeData,
    position: { x: 100, y: 300 },
  },
  {
    id: 'output-1',
    type: 'outputNode',
    data: { 
      label: '출력 노드', 
      content: '',
      isLoading: false 
    } as OutputNodeData,
    position: { x: 500, y: 200 },
  },
];

// 초기 엣지 정의
const initialEdges: Edge[] = [
  {
    id: 'prompt-edge-1',
    source: 'input-1',
    target: 'output-1',
    type: 'promptEdge',
    data: { prompt: '다음 텍스트를 친근하고 유익한 톤으로 다시 써주세요' } as PromptEdgeData,
    animated: true,
  },
  {
    id: 'prompt-edge-2',
    source: 'image-1',
    target: 'output-1',
    type: 'promptEdge',
    data: { prompt: '이 이미지를 자세히 분석하고 설명해주세요' } as PromptEdgeData,
    animated: true,
  },
];

export default function FlowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<Edge[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPromptPreviewOpen, setIsPromptPreviewOpen] = useState(false);
  const [promptPreviewData, setPromptPreviewData] = useState<PromptPreviewData | null>(null);
  const [settings, setSettings] = useState<SettingsData>({
    apiKey: '',
    model: 'gpt-4-turbo',
    baseUrl: ''
  });

  // 선택된 요소들 추적
  const onSelectionChange = useCallback(({ nodes, edges }: { nodes: Node[], edges: Edge[] }) => {
    setSelectedNodes(nodes);
    setSelectedEdges(edges);
  }, []);

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge = {
        ...connection,
        id: `prompt-edge-${Date.now()}`,
        type: 'promptEdge',
        data: { prompt: '새로운 프롬프트를 입력하세요' } as PromptEdgeData,
        animated: true,
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    []
  );

  // 새 텍스트 입력 노드 추가
  const addInputNode = useCallback(() => {
    const newNode: Node = {
      id: `input-${Date.now()}`,
      type: 'inputNode',
      data: { label: '새 텍스트 입력', content: '' } as InputNodeData,
      position: { x: Math.random() * 500, y: Math.random() * 300 },
    };
    setNodes((nds) => [...nds, newNode]);
  }, []);

  // 새 이미지 입력 노드 추가
  const addImageNode = useCallback(() => {
    const newNode: Node = {
      id: `image-${Date.now()}`,
      type: 'imageNode',
      data: { label: '새 이미지 입력' } as ImageNodeData,
      position: { x: Math.random() * 500, y: Math.random() * 300 },
    };
    setNodes((nds) => [...nds, newNode]);
  }, []);

  // 새 출력 노드 추가
  const addOutputNode = useCallback(() => {
    const newNode: Node = {
      id: `output-${Date.now()}`,
      type: 'outputNode',
      data: { label: '새 출력 노드', content: '', isLoading: false } as OutputNodeData,
      position: { x: Math.random() * 500 + 300, y: Math.random() * 300 },
    };
    setNodes((nds) => [...nds, newNode]);
  }, []);

  // LLM API 호출 함수
  const callLLMAPI = async (input: string | MultimodalInput, prompt: string, targetNodeId: string) => {
    if (!settings.apiKey || !settings.model) {
      alert('API 키와 모델을 설정해주세요.');
      return;
    }

    // 출력 노드를 로딩 상태로 변경
    setNodes((nds) => 
      nds.map(node => 
        node.id === targetNodeId 
          ? { ...node, data: { ...node.data, isLoading: true, error: undefined } }
          : node
      )
    );

    try {
      const llmService = new LLMService(settings);
      
      // 멀티모달 입력인 경우 모델 지원 여부 확인
      if (typeof input !== 'string' && !llmService.isMultimodalSupported()) {
        throw new Error('현재 선택된 모델은 멀티모달을 지원하지 않습니다. GPT-4V, GPT-4 Turbo, 또는 Claude 3 모델을 선택해주세요.');
      }
      
      const result = await llmService.callAPI(input, prompt);

      // 결과로 출력 노드 업데이트
      setNodes((nds) => 
        nds.map(node => 
          node.id === targetNodeId 
            ? { ...node, data: { ...node.data, content: result, isLoading: false } }
            : node
        )
      );

    } catch (error) {
      console.error('LLM API 호출 오류:', error);
      setNodes((nds) => 
        nds.map(node => 
          node.id === targetNodeId 
            ? { 
                ...node, 
                data: { 
                  ...node.data, 
                  isLoading: false, 
                  error: error instanceof Error ? error.message : '알 수 없는 오류' 
                } 
              }
            : node
        )
      );
    }
  };

  // 노드 데이터에서 입력 내용 추출
  const getInputFromNode = (node: Node): string | MultimodalInput => {
    if (node.type === 'inputNode') {
      return (node.data as InputNodeData).content || '';
    } else if (node.type === 'imageNode') {
      const imageData = node.data as ImageNodeData;
      return {
        imageBase64: imageData.imageBase64,
        imageUrl: imageData.imageUrl,
        description: imageData.description,
        text: imageData.description
      } as MultimodalInput;
    }
    return '';
  };

  // 선택된 요소들 삭제
  const deleteSelected = useCallback(() => {
    if (selectedNodes.length > 0 || selectedEdges.length > 0) {
      const nodeIds = selectedNodes.map(node => node.id);
      const edgeIds = selectedEdges.map(edge => edge.id);
      
      setNodes(nds => nds.filter(node => !nodeIds.includes(node.id)));
      setEdges(eds => eds.filter(edge => !edgeIds.includes(edge.id)));
      
      setSelectedNodes([]);
      setSelectedEdges([]);
    }
  }, [selectedNodes, selectedEdges, setNodes, setEdges]);

  // 프롬프트 미리보기 표시
  const showPromptPreview = useCallback((sourceNode: Node, targetNode: Node, prompt: string) => {
    const inputContent = getInputFromNode(sourceNode);
    
    setPromptPreviewData({
      sourceNodeId: sourceNode.id,
      targetNodeId: targetNode.id,
      sourceLabel: sourceNode.data.label || sourceNode.type || 'Unknown',
      targetLabel: targetNode.data.label || targetNode.type || 'Unknown',
      input: inputContent,
      prompt: prompt,
      model: settings.model
    });
    setIsPromptPreviewOpen(true);
  }, [settings.model]);

  // 미리보기에서 실행
  const executeFromPreview = useCallback(() => {
    if (promptPreviewData) {
      callLLMAPI(
        promptPreviewData.input, 
        promptPreviewData.prompt, 
        promptPreviewData.targetNodeId
      );
      setIsPromptPreviewOpen(false);
      setPromptPreviewData(null);
    }
  }, [promptPreviewData]);

  // 개별 연결 실행 (프롬프트 미리보기 포함)
  const executeConnection = useCallback((sourceNode: Node, targetNode: Node, prompt: string, withPreview: boolean = true) => {
    if (withPreview) {
      showPromptPreview(sourceNode, targetNode, prompt);
    } else {
      const inputContent = getInputFromNode(sourceNode);
      if (inputContent && prompt) {
        callLLMAPI(inputContent, prompt, targetNode.id);
      }
    }
  }, [showPromptPreview]);

  // 모든 연결된 노드들 실행
  const executeAll = useCallback(() => {
    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode && edge.data) {
        const inputContent = getInputFromNode(sourceNode);
        const prompt = (edge.data as PromptEdgeData).prompt;
        
        if (inputContent && prompt) {
          callLLMAPI(inputContent, prompt, targetNode.id);
        }
      }
    });
  }, [nodes, edges, settings]);

  // 프롬프트 미리보기로 모든 연결 확인
  const previewAll = useCallback(() => {
    const connections = edges.map(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      return { sourceNode, targetNode, edge };
    }).filter(conn => conn.sourceNode && conn.targetNode);

    if (connections.length === 0) {
      alert('실행할 연결이 없습니다.');
      return;
    }

    // 첫 번째 연결의 미리보기를 표시
    const firstConnection = connections[0];
    if (firstConnection.sourceNode && firstConnection.targetNode && firstConnection.edge.data) {
      showPromptPreview(
        firstConnection.sourceNode, 
        firstConnection.targetNode, 
        (firstConnection.edge.data as PromptEdgeData).prompt
      );
         }
   }, [nodes, edges, showPromptPreview]);

  // 엣지 더블클릭 시 프롬프트 미리보기 표시
  const onEdgeDoubleClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.stopPropagation();
    
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    
    if (sourceNode && targetNode && edge.data) {
      const prompt = (edge.data as PromptEdgeData).prompt;
      showPromptPreview(sourceNode, targetNode, prompt);
    }
  }, [nodes, showPromptPreview]);

  const toolbarStyle = {
    position: 'absolute' as const,
    top: '10px',
    left: '10px',
    zIndex: 10,
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap' as const,
    maxWidth: '350px'
  };

  const buttonStyle = {
    padding: '8px 16px',
    background: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  };

  const imageButtonStyle = {
    ...buttonStyle,
    background: '#ff6b6b'
  };

  const executeButtonStyle = {
    ...buttonStyle,
    background: '#e74c3c'
  };

  const settingsButtonStyle = {
    ...buttonStyle,
    background: '#9b59b6'
  };

  const deleteButtonStyle = {
    ...buttonStyle,
    background: '#e74c3c',
    opacity: selectedNodes.length > 0 || selectedEdges.length > 0 ? 1 : 0.5,
    cursor: selectedNodes.length > 0 || selectedEdges.length > 0 ? 'pointer' : 'not-allowed'
  };

  const previewButtonStyle = {
    ...buttonStyle,
    background: '#f39c12'
  };

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      {/* 툴바 */}
      <div style={toolbarStyle}>
        <button 
          style={buttonStyle}
          onClick={addInputNode}
        >
          📝 텍스트 노드
        </button>
        <button 
          style={imageButtonStyle}
          onClick={addImageNode}
        >
          🖼️ 이미지 노드
        </button>
        <button 
          style={buttonStyle}
          onClick={addOutputNode}
        >
          📤 출력 노드
        </button>
        <button 
          style={previewButtonStyle}
          onClick={previewAll}
        >
          👁️ 미리보기
        </button>
        <button 
          style={executeButtonStyle}
          onClick={executeAll}
        >
          🚀 모두 실행
        </button>
        <button 
          style={deleteButtonStyle}
          onClick={deleteSelected}
          disabled={selectedNodes.length === 0 && selectedEdges.length === 0}
          title={`선택된 항목 삭제 (${selectedNodes.length + selectedEdges.length}개)`}
        >
          🗑️ 삭제 {selectedNodes.length + selectedEdges.length > 0 && `(${selectedNodes.length + selectedEdges.length})`}
        </button>
        <button 
          style={settingsButtonStyle}
          onClick={() => setIsSettingsOpen(true)}
        >
          ⚙️ 설정
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        onEdgeDoubleClick={onEdgeDoubleClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        deleteKeyCode="Delete"
        multiSelectionKeyCode="Ctrl"
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>

      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={setSettings}
      />

      <PromptPreviewPanel
        isOpen={isPromptPreviewOpen}
        onClose={() => {
          setIsPromptPreviewOpen(false);
          setPromptPreviewData(null);
        }}
        onExecute={executeFromPreview}
        previewData={promptPreviewData}
      />
    </div>
  );
} 