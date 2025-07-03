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
  useReactFlow,
  MarkerType,
} from 'reactflow';

import InputNode, { InputNodeData } from './components/InputNode';
import OutputNode, { OutputNodeData } from './components/OutputNode';
import ImageNode, { ImageNodeData } from './components/ImageNode';
import CustomEdge, { PromptEdgeData } from './components/CustomEdge';
import SettingsPanel, { SettingsData } from './components/SettingsPanel';
import PromptPreviewPanel, { PromptPreviewData } from './components/PromptPreviewPanel';
import NodeDetailPanel from './components/NodeDetailPanel';
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

// 초기 노드 정의 (분기 처리 예시 + 연속 연결 예시)
const initialNodes: Node[] = [
  // 분기 예시 (왼쪽 위) - 하나의 입력에서 여러 출력으로
  {
    id: 'input-1',
    type: 'inputNode',
    data: { 
      label: '원본 텍스트', 
      content: 'React는 사용자 인터페이스를 구축하기 위한 JavaScript 라이브러리입니다. 컴포넌트 기반 아키텍처를 사용하여 재사용 가능한 UI 요소를 만들 수 있습니다. Virtual DOM을 통해 효율적인 렌더링을 제공하고, 단방향 데이터 플로우로 예측 가능한 상태 관리를 지원합니다.' 
    } as InputNodeData,
    position: { x: 50, y: 200 },
  },
  {
    id: 'output-1',
    type: 'outputNode',
    data: { 
      label: '📝 요약하기', 
      content: '',
      isLoading: false 
    } as OutputNodeData,
    position: { x: 550, y: 50 },
  },
  {
    id: 'output-2',
    type: 'outputNode',
    data: { 
      label: '🌍 영어 번역', 
      content: '',
      isLoading: false 
    } as OutputNodeData,
    position: { x: 550, y: 200 },
  },
  {
    id: 'output-3',
    type: 'outputNode',
    data: { 
      label: '🔑 키워드 추출', 
      content: '',
      isLoading: false 
    } as OutputNodeData,
    position: { x: 550, y: 350 },
  },
  
  // 연속 연결 예시 (오른쪽) - 체인 형태
  {
    id: 'input-2',
    type: 'inputNode',
    data: { 
      label: '회사 소개서', 
      content: '우리 회사는 2015년에 설립된 핀테크 스타트업입니다. 모바일 결제 솔루션을 개발하여 현재 10만 명의 사용자를 보유하고 있습니다. 주요 제품은 QR코드 결제 시스템과 가맹점 관리 플랫폼입니다. 지난해 매출은 50억 원을 기록했습니다.' 
    } as InputNodeData,
    position: { x: 50, y: 600 },
  },
  {
    id: 'output-4',
    type: 'outputNode',
    data: { 
      label: '🎯 핵심 정보 추출', 
      content: '',
      isLoading: false 
    } as OutputNodeData,
    position: { x: 550, y: 600 },
  },
  {
    id: 'output-5',
    type: 'outputNode',
    data: { 
      label: '📊 SWOT 분석', 
      content: '',
      isLoading: false 
    } as OutputNodeData,
    position: { x: 1050, y: 600 },
  },
  {
    id: 'output-6',
    type: 'outputNode',
    data: { 
      label: '💡 개선 제안', 
      content: '',
      isLoading: false 
    } as OutputNodeData,
    position: { x: 1550, y: 600 },
  },
  
  // 이미지 처리 예시
  {
    id: 'image-1',
    type: 'imageNode',
    data: { 
      label: '이미지 분석', 
      imageFile: null,
      base64Image: null,
      description: '이미지를 업로드하여 분석해보세요'
    } as ImageNodeData,
    position: { x: 50, y: 900 },
  },
  {
    id: 'output-7',
    type: 'outputNode',
    data: { 
      label: '🖼️ 이미지 설명', 
      content: '',
      isLoading: false 
    } as OutputNodeData,
    position: { x: 550, y: 900 },
  },
];

// 초기 엣지 정의 (분기 연결 + 연속 연결)
const initialEdges: Edge[] = [
  // 분기 연결 (input-1에서 여러 출력으로)
  {
    id: 'prompt-edge-1',
    source: 'input-1',
    target: 'output-1',
    type: 'promptEdge',
    data: { prompt: '다음 텍스트를 3문장으로 요약해주세요: {입력}' } as PromptEdgeData,
    animated: true,
  },
  {
    id: 'prompt-edge-2',
    source: 'input-1',
    target: 'output-2',
    type: 'promptEdge',
    data: { prompt: '다음 한국어 텍스트를 자연스러운 영어로 번역해주세요: {입력}' } as PromptEdgeData,
    animated: true,
  },
  {
    id: 'prompt-edge-3',
    source: 'input-1',
    target: 'output-3',
    type: 'promptEdge',
    data: { prompt: '다음 텍스트에서 중요한 키워드 5개를 추출해주세요: {입력}' } as PromptEdgeData,
    animated: true,
  },
  
  // 연속 연결 (체인 형태)
  {
    id: 'prompt-edge-4',
    source: 'input-2',
    target: 'output-4',
    type: 'promptEdge',
    data: { prompt: '다음 회사 소개서에서 설립년도, 업종, 사용자 수, 주요 제품, 매출 등 핵심 정보를 정리해주세요: {입력}' } as PromptEdgeData,
    animated: true,
  },
  {
    id: 'prompt-edge-5',
    source: 'output-4',
    target: 'output-5',
    type: 'promptEdge',
    data: { prompt: '다음 회사 정보를 바탕으로 SWOT 분석을 해주세요 (강점, 약점, 기회, 위협 요소 각각 3개씩): {입력}' } as PromptEdgeData,
    animated: true,
  },
  {
    id: 'prompt-edge-6',
    source: 'output-5',
    target: 'output-6',
    type: 'promptEdge',
    data: { prompt: '다음 SWOT 분석 결과를 바탕으로 회사의 성장을 위한 구체적인 개선 제안 5가지를 작성해주세요: {입력}' } as PromptEdgeData,
    animated: true,
  },
  
  // 이미지 처리 연결
  {
    id: 'prompt-edge-7',
    source: 'image-1',
    target: 'output-7',
    type: 'promptEdge',
    data: { prompt: '이미지를 자세히 분석하여 다음과 같이 설명해주세요: 1) 주요 객체나 사람 2) 색상과 분위기 3) 배경 환경 4) 전체적인 느낌이나 메시지: {입력}' } as PromptEdgeData,
    animated: true,
  },
];

export default function FlowCanvas() {
  const { deleteElements } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<Edge[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPromptPreviewOpen, setIsPromptPreviewOpen] = useState(false);
  const [promptPreviewData, setPromptPreviewData] = useState<PromptPreviewData | null>(null);
  const [isNodeDetailOpen, setIsNodeDetailOpen] = useState(false);
  const [selectedNodeForDetail, setSelectedNodeForDetail] = useState<Node | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionStatus, setExecutionStatus] = useState<string>('');
  const [executingEdges, setExecutingEdges] = useState<Set<string>>(new Set());
  const [settings, setSettings] = useState<SettingsData>({
    apiKey: '',
    model: 'gpt-4-turbo',
    baseUrl: ''
  });

  // 실행 상태에 따른 엣지 스타일 업데이트
  const styledEdges = useMemo(() => {
    return edges.map(edge => ({
      ...edge,
      animated: executingEdges.has(edge.id) ? true : edge.animated,
      style: executingEdges.has(edge.id) ? {
        strokeWidth: 3,
        stroke: '#f39c12', // 주황색으로 실행 중 표시
        strokeDasharray: '5 5', // 점선으로 표시
      } : edge.style,
      markerEnd: executingEdges.has(edge.id) ? {
        type: MarkerType.ArrowClosed,
        color: '#f39c12',
        width: 20,
        height: 20,
      } : edge.markerEnd,
    }));
  }, [edges, executingEdges]);

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
        data: { prompt: '다음 입력을 처리해주세요: {입력}' } as PromptEdgeData,
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



  // 프롬프트 템플릿으로 분기 추가
  const addTemplatedBranch = useCallback((templateName: string) => {
    if (selectedNodes.length !== 1) {
      alert('분기를 만들 노드를 하나만 선택해주세요.');
      return;
    }

    const sourceNode = selectedNodes[0];
    let branchTemplates: Array<{label: string, prompt: string}> = [];

    switch (templateName) {
      case 'content':
        branchTemplates = [
          { label: '📝 요약', prompt: '다음 내용을 3문장으로 요약해주세요: {입력}' },
          { label: '🌍 번역', prompt: '다음 한국어 내용을 영어로 번역해주세요: {입력}' },
          { label: '🔑 키워드', prompt: '다음 내용에서 중요한 키워드 5개를 추출해주세요: {입력}' },
          { label: '❓ Q&A', prompt: '다음 내용을 바탕으로 FAQ 3개를 만들어주세요: {입력}' },
        ];
        break;
      case 'creative':
        branchTemplates = [
          { label: '🎨 창의적 표현', prompt: '다음 내용을 창의적으로 다시 표현해주세요: {입력}' },
          { label: '📖 스토리텔링', prompt: '다음 내용을 스토리 형태로 재구성해주세요: {입력}' },
          { label: '🎭 다른 관점', prompt: '다음 내용을 반대 입장에서 설명해주세요: {입력}' },
          { label: '💡 아이디어 확장', prompt: '다음 내용을 바탕으로 새로운 아이디어를 제안해주세요: {입력}' },
        ];
        break;
      default:
        alert('알 수 없는 템플릿입니다.');
        return;
    }

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    branchTemplates.forEach((template, index) => {
      const nodeId = `output-${templateName}-${Date.now()}-${index}`;
      const edgeId = `edge-${templateName}-${Date.now()}-${index}`;

      newNodes.push({
        id: nodeId,
        type: 'outputNode',
        data: { 
          label: template.label, 
          content: '', 
          isLoading: false 
        } as OutputNodeData,
        position: { 
          x: sourceNode.position.x + 400, 
          y: sourceNode.position.y + (index - 1.5) * 100 
        },
      });

      newEdges.push({
        id: edgeId,
        source: sourceNode.id,
        target: nodeId,
        type: 'promptEdge',
        data: { prompt: template.prompt } as PromptEdgeData,
        animated: true,
      });
    });

    setNodes((nds) => [...nds, ...newNodes]);
    setEdges((eds) => [...eds, ...newEdges]);
    
    alert(`${sourceNode.data.label}에서 "${templateName}" 템플릿으로 ${branchTemplates.length}개의 분기를 추가했습니다!`);
  }, [selectedNodes, setNodes, setEdges]);

  // LLM API 호출 함수
  const callLLMAPI = async (input: string | MultimodalInput, prompt: string, targetNodeId: string): Promise<void> => {
    if (!settings.apiKey || !settings.model) {
      const error = new Error('API 키와 모델이 설정되지 않았습니다.');
      console.error('API 설정 오류:', error);
      throw error;
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
    } else if (node.type === 'outputNode') {
      // 출력 노드의 결과를 다른 노드의 입력으로 사용
      const outputData = node.data as OutputNodeData;
      // 로딩 중이거나 에러가 있거나 내용이 없으면 빈 문자열 반환
      if (outputData.isLoading || outputData.error || !outputData.content) {
        return '';
      }
      return outputData.content;
    }
    return '';
  };

  // 선택된 요소들 삭제
  const deleteSelected = useCallback(() => {
    if (selectedNodes.length > 0 || selectedEdges.length > 0) {
      deleteElements({ nodes: selectedNodes, edges: selectedEdges });
      setSelectedNodes([]);
      setSelectedEdges([]);
    }
  }, [selectedNodes, selectedEdges, deleteElements]);

  // Export 기능: 현재 상태를 JSON 파일로 다운로드
  const exportFlow = useCallback(() => {
    const exportData = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      nodes: nodes,
      edges: edges,
      settings: settings,
      metadata: {
        nodeCount: nodes.length,
        edgeCount: edges.length,
        description: "Prompt Graph Export"
      }
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `prompt-graph-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [nodes, edges, settings]);

  // Import 기능: JSON 파일을 업로드하여 상태 복원
  const importFlow = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target?.result as string);
          
          // 데이터 유효성 검증
          if (!importData.nodes || !Array.isArray(importData.nodes) || 
              !importData.edges || !Array.isArray(importData.edges)) {
            alert('유효하지 않은 파일 형식입니다.');
            return;
          }
          
          // 전체 가져오기 확인
          const confirmImport = confirm(
            `다음 데이터를 불러오시겠습니까?\n\n` +
            `• 노드: ${importData.nodes.length}개\n` +
            `• 엣지: ${importData.edges.length}개\n` +
            `• 설정: ${importData.settings ? '포함됨' : '없음'}\n\n` +
            `현재 작업 중인 내용은 대체됩니다.`
          );
          
          if (!confirmImport) {
            return; // 전체 가져오기 취소
          }
          
          // 노드와 엣지 복원
          setNodes(importData.nodes);
          setEdges(importData.edges);
          
          // 설정이 있으면 별도로 확인
          let settingsApplied = false;
          if (importData.settings) {
            const confirmSettings = confirm(
              '파일에 저장된 설정(API 키, 모델 등)도 함께 적용하시겠습니까?\n\n' +
              '아니오를 선택하면 현재 설정을 유지합니다.'
            );
            if (confirmSettings) {
              setSettings(importData.settings);
              settingsApplied = true;
            }
          }
          
          // 상태 초기화
          setSelectedNodes([]);
          setSelectedEdges([]);
          setIsPromptPreviewOpen(false);
          setPromptPreviewData(null);
          
          // 성공 메시지
          const settingsMessage = importData.settings ? 
            (settingsApplied ? ' (설정 포함)' : ' (설정 제외)') : '';
          alert(`성공적으로 불러왔습니다!${settingsMessage}\n노드: ${importData.nodes.length}개, 엣지: ${importData.edges.length}개`);
          
        } catch (error) {
          console.error('Import 오류:', error);
          alert('파일을 읽는 중 오류가 발생했습니다. 올바른 JSON 파일인지 확인해주세요.');
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  }, [setNodes, setEdges, setSettings]);

  // 현재 상태 초기화
  const clearAll = useCallback(() => {
    const confirm = window.confirm('모든 노드와 엣지를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.');
    if (confirm) {
      setNodes([]);
      setEdges([]);
      setSelectedNodes([]);
      setSelectedEdges([]);
      setIsPromptPreviewOpen(false);
      setPromptPreviewData(null);
    }
  }, [setNodes, setEdges]);

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
  const executeFromPreview = useCallback(async () => {
    if (!promptPreviewData) return;

    // API 설정 확인
    if (!settings.apiKey || !settings.model) {
      alert('실행하기 전에 API 키와 모델을 설정해주세요.\n⚙️ 설정 버튼을 클릭하여 설정할 수 있습니다.');
      return;
    }

    try {
      await callLLMAPI(
        promptPreviewData.input, 
        promptPreviewData.prompt, 
        promptPreviewData.targetNodeId
      );
      setIsPromptPreviewOpen(false);
      setPromptPreviewData(null);
    } catch (error) {
      console.error('미리보기 실행 오류:', error);
      alert(`실행 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }, [promptPreviewData, settings, callLLMAPI]);

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

  // 실행 파이프라인 계산 (의존성 기반 레벨링)
  const calculateExecutionPipeline = useCallback(() => {
    const outputNodes = nodes.filter(n => n.type === 'outputNode');
    const pipeline: Array<Array<{nodeId: string, edgeId: string, sourceNodeId: string}>> = [];
    const processedNodes = new Set<string>();
    const nodeToLevel = new Map<string, number>();
    
    // 각 출력 노드의 의존성 레벨 계산
    const calculateNodeLevel = (nodeId: string, visited = new Set<string>()): number => {
      if (visited.has(nodeId)) return 0; // 순환 의존성 방지
      if (nodeToLevel.has(nodeId)) return nodeToLevel.get(nodeId)!;
      
      visited.add(nodeId);
      
      const incomingEdges = edges.filter(edge => edge.target === nodeId);
      if (incomingEdges.length === 0) {
        nodeToLevel.set(nodeId, 0);
        return 0;
      }
      
      let maxLevel = 0;
      for (const edge of incomingEdges) {
        const sourceNode = nodes.find(n => n.id === edge.source);
        if (sourceNode) {
          if (sourceNode.type === 'inputNode' || sourceNode.type === 'imageNode') {
            // 입력 노드는 레벨 0
            maxLevel = Math.max(maxLevel, 0);
          } else if (sourceNode.type === 'outputNode') {
            // 출력 노드는 의존성 계산
            maxLevel = Math.max(maxLevel, calculateNodeLevel(sourceNode.id, visited) + 1);
          }
        }
      }
      
      visited.delete(nodeId);
      nodeToLevel.set(nodeId, maxLevel);
      return maxLevel;
    };
    
    // 모든 출력 노드의 레벨 계산
    outputNodes.forEach(node => {
      calculateNodeLevel(node.id);
    });
    
    // 레벨별로 그룹화
    const maxLevel = Math.max(...Array.from(nodeToLevel.values()));
    for (let level = 0; level <= maxLevel; level++) {
      const levelTasks: Array<{nodeId: string, edgeId: string, sourceNodeId: string}> = [];
      
      outputNodes.forEach(node => {
        if (nodeToLevel.get(node.id) === level) {
          // 이 노드로 들어오는 엣지들 찾기
          const incomingEdges = edges.filter(edge => edge.target === node.id);
          incomingEdges.forEach(edge => {
            levelTasks.push({
              nodeId: node.id,
              edgeId: edge.id,
              sourceNodeId: edge.source
            });
          });
        }
      });
      
      if (levelTasks.length > 0) {
        pipeline.push(levelTasks);
      }
    }
    
    return pipeline;
  }, [nodes, edges]);

  // 노드가 실행 준비되었는지 확인 (실시간 상태 기반)
  const isNodeReady = useCallback((targetNodeId: string, completedNodes: Set<string>) => {
    const targetNode = nodes.find(n => n.id === targetNodeId);
    if (!targetNode || targetNode.type !== 'outputNode') return false;
    
    const targetData = targetNode.data as OutputNodeData;
    if (targetData.isLoading || (targetData.content && targetData.content.trim() !== '')) {
      return false; // 이미 실행 중이거나 완료됨
    }
    
    // 이 노드로 들어오는 모든 엣지의 소스 노드들을 확인
    const incomingEdges = edges.filter(edge => edge.target === targetNodeId);
    
    return incomingEdges.every(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      if (!sourceNode) return false;
      
      // 입력 노드나 이미지 노드는 항상 준비됨
      if (sourceNode.type === 'inputNode' || sourceNode.type === 'imageNode') {
        return true;
      }
      
      // 출력 노드는 실제 상태와 completedNodes 모두 확인
      if (sourceNode.type === 'outputNode') {
        const sourceData = sourceNode.data as OutputNodeData;
        const hasContent = sourceData.content && sourceData.content.trim() !== '';
        const notLoading = !sourceData.isLoading;
        const noError = !sourceData.error;
        
        // completedNodes에 있거나 실제로 완료된 상태여야 함
        return completedNodes.has(sourceNode.id) || (hasContent && notLoading && noError);
      }
      
      return false;
    });
  }, [nodes, edges]);

  // 엣지 실행 (개별)
  const executeEdge = useCallback(async (edgeId: string, sourceNodeId: string, targetNodeId: string, completedNodes: Set<string>) => {
    const edge = edges.find(e => e.id === edgeId);
    const sourceNode = nodes.find(n => n.id === sourceNodeId);
    const targetNode = nodes.find(n => n.id === targetNodeId);
    
    if (!edge || !sourceNode || !targetNode || !edge.data) {
      throw new Error('엣지 또는 노드를 찾을 수 없습니다.');
    }
    
    // 엣지를 실행 중 상태로 표시
    setExecutingEdges(prev => new Set([...prev, edgeId]));
    
    try {
      const inputContent = getInputFromNode(sourceNode);
      const prompt = (edge.data as PromptEdgeData).prompt;
      
      if (inputContent && prompt) {
        await callLLMAPI(inputContent, prompt, targetNodeId);
        // API 호출이 성공적으로 완료된 후에만 완료 노드에 추가
        completedNodes.add(targetNodeId);
      }
    } finally {
      // 실행 완료 후 엣지를 실행 중 상태에서 제거
      setExecutingEdges(prev => {
        const newSet = new Set(prev);
        newSet.delete(edgeId);
        return newSet;
      });
    }
  }, [nodes, edges, getInputFromNode, callLLMAPI]);

  // 파이프라인 기반 실행
  const executeAll = useCallback(async () => {
    if (isExecuting) {
      alert('이미 실행 중입니다.');
      return;
    }

    // API 설정 확인
    if (!settings.apiKey || !settings.model) {
      alert('실행하기 전에 API 키와 모델을 설정해주세요.\n⚙️ 설정 버튼을 클릭하여 설정할 수 있습니다.');
      return;
    }

    const totalOutputNodes = nodes.filter(n => n.type === 'outputNode').length;
    if (totalOutputNodes === 0) {
      alert('실행할 출력 노드가 없습니다.');
      return;
    }

    setIsExecuting(true);
    setExecutionStatus('실행 파이프라인 계산 중...');
    
    try {
      // 실행 파이프라인 계산
      const pipeline = calculateExecutionPipeline();
      
      if (pipeline.length === 0) {
        alert('실행할 수 있는 연결이 없습니다.');
        return;
      }

      setExecutionStatus(`🔧 파이프라인 준비 완료: ${pipeline.length}단계`);
      console.log('실행 파이프라인:', pipeline);
      
      const completedNodes = new Set<string>();
      
      // 단계별 순차 실행
      for (let step = 0; step < pipeline.length; step++) {
        const stepTasks = pipeline[step];
        
        // 현재 단계에서 실행 가능한 태스크만 필터링
        const readyTasks = stepTasks.filter(task => 
          isNodeReady(task.nodeId, completedNodes)
        );
        
        if (readyTasks.length === 0) {
          console.log(`${step + 1}단계: 실행 가능한 태스크 없음`);
          continue;
        }
        
        const taskNames = readyTasks.map(task => {
          const sourceNode = nodes.find(n => n.id === task.sourceNodeId);
          const targetNode = nodes.find(n => n.id === task.nodeId);
          return `${sourceNode?.data.label} → ${targetNode?.data.label}`;
        });
        
        setExecutionStatus(`⚡ ${step + 1}/${pipeline.length}단계: ${taskNames.join(', ')} 실행 중...`);
        console.log(`${step + 1}단계 실행:`, taskNames);

        // 현재 단계의 모든 태스크를 병렬로 실행
        const promises = readyTasks.map(async (task) => {
          try {
            await executeEdge(task.edgeId, task.sourceNodeId, task.nodeId, completedNodes);
          } catch (error) {
            console.error(`태스크 ${task.nodeId} 실행 중 오류:`, error);
            throw error;
          }
        });

        // 현재 단계의 모든 작업 완료 대기
        await Promise.all(promises);
        
        setExecutionStatus(`✅ ${step + 1}단계 완료 (${completedNodes.size}/${totalOutputNodes}개 노드 완료)`);
        console.log(`${step + 1}단계 완료. 완료된 노드 수: ${completedNodes.size}/${totalOutputNodes}`);
        
        // 다음 단계 준비
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setExecutionStatus('🎉 파이프라인 실행 완료! 모든 노드 처리됨');
      console.log('파이프라인 실행 완료');
      
      // 성공 메시지 3초 후 제거
      setTimeout(() => {
        setExecutionStatus('');
      }, 3000);

    } catch (error) {
      console.error('실행 중 오류:', error);
      setExecutionStatus(`실행 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      
      // 에러 메시지 5초 후 제거
      setTimeout(() => {
        setExecutionStatus('');
      }, 5000);
    } finally {
      setIsExecuting(false);
      setExecutingEdges(new Set()); // 모든 실행 중 엣지 초기화
    }
  }, [nodes, calculateExecutionPipeline, isNodeReady, executeEdge, isExecuting, settings]);

  // 프롬프트 미리보기로 모든 연결 확인
  const previewAll = useCallback(() => {
    // 파이프라인 계산하여 첫 번째 실행 가능한 연결 찾기
    const pipeline = calculateExecutionPipeline();
    
    if (pipeline.length === 0) {
      alert('현재 실행할 수 있는 연결이 없습니다.');
      return;
    }

    // 첫 번째 레벨의 첫 번째 태스크 미리보기
    const firstTask = pipeline[0][0];
    if (firstTask) {
      const sourceNode = nodes.find(n => n.id === firstTask.sourceNodeId);
      const targetNode = nodes.find(n => n.id === firstTask.nodeId);
      const edge = edges.find(e => e.id === firstTask.edgeId);
      
      if (sourceNode && targetNode && edge?.data) {
        showPromptPreview(
          sourceNode, 
          targetNode, 
          (edge.data as PromptEdgeData).prompt
        );
      }
    }
  }, [calculateExecutionPipeline, nodes, edges, showPromptPreview]);

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

  // 노드 더블클릭 시 상세 정보 표시
  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    event.stopPropagation();
    setSelectedNodeForDetail(node);
    setIsNodeDetailOpen(true);
  }, []);

  const toolbarStyle = {
    position: 'absolute' as const,
    top: '10px',
    left: '10px',
    zIndex: 10,
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap' as const,
    maxWidth: '600px'
  };

  // 디자인 시스템 색상 테마
  const colors = {
    primary: '#3498db',
    secondary: '#95a5a6', 
    success: '#27ae60',
    warning: '#f39c12',
    danger: '#e74c3c',
    info: '#9b59b6',
    disabled: '#bdc3c7'
  };

  const buttonStyle = {
    padding: '6px 12px',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  // 노드 추가 버튼들
  const addNodeButtonStyle = {
    ...buttonStyle,
    background: colors.primary
  };

  // 실행 관련 버튼들  
  const executeButtonStyle = {
    ...buttonStyle,
    background: isExecuting ? colors.secondary : (!settings.apiKey || !settings.model) ? colors.disabled : colors.success,
    cursor: isExecuting ? 'not-allowed' : (!settings.apiKey || !settings.model) ? 'not-allowed' : 'pointer',
    opacity: isExecuting ? 0.7 : (!settings.apiKey || !settings.model) ? 0.6 : 1
  };

  const previewButtonStyle = {
    ...buttonStyle,
    background: (!settings.apiKey || !settings.model) ? colors.disabled : colors.warning,
    cursor: (!settings.apiKey || !settings.model) ? 'not-allowed' : 'pointer',
    opacity: (!settings.apiKey || !settings.model) ? 0.6 : 1
  };

  // 편집 관련 버튼들
  const deleteButtonStyle = {
    ...buttonStyle,
    background: colors.danger,
    opacity: selectedNodes.length > 0 || selectedEdges.length > 0 ? 1 : 0.5,
    cursor: selectedNodes.length > 0 || selectedEdges.length > 0 ? 'pointer' : 'not-allowed'
  };

  const branchButtonStyle = {
    ...buttonStyle,
    background: selectedNodes.length === 1 ? colors.info : colors.disabled,
    cursor: selectedNodes.length === 1 ? 'pointer' : 'not-allowed',
    opacity: selectedNodes.length === 1 ? 1 : 0.6
  };

  // 파일 관리 버튼들
  const fileButtonStyle = {
    ...buttonStyle,
    background: colors.secondary
  };

  // 설정 버튼
  const settingsButtonStyle = {
    ...buttonStyle,
    background: colors.info
  };

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      {/* 실행 상태 표시 */}
      {(isExecuting || executionStatus) && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: isExecuting ? '#3498db' : executionStatus.includes('오류') ? '#e74c3c' : '#27ae60',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '4px',
          zIndex: 1000,
          fontSize: '12px',
          maxWidth: '300px',
          wordBreak: 'break-word'
        }}>
          {executionStatus}
        </div>
      )}

      {/* 툴바 - 목적별 그룹화 */}
      <div style={toolbarStyle}>
        {/* 1. 노드 추가 */}
        <button 
          style={addNodeButtonStyle}
          onClick={addInputNode}
        >
          📝 텍스트 노드
        </button>
        <button 
          style={addNodeButtonStyle}
          onClick={addImageNode}
        >
          🖼️ 이미지 노드
        </button>
        <button 
          style={addNodeButtonStyle}
          onClick={addOutputNode}
        >
          📤 출력 노드
        </button>
        
        {/* 구분선 */}
        <div style={{ width: '2px', height: '30px', background: colors.disabled, margin: '0 8px' }} />
        
        {/* 2. 실행 관련 */}
        <button 
          style={previewButtonStyle}
          onClick={previewAll}
          disabled={!settings.apiKey || !settings.model}
          title={!settings.apiKey || !settings.model ? 'API 키와 모델을 먼저 설정해주세요' : '파이프라인의 첫 번째 연결 미리보기'}
        >
          👁️ 미리보기
        </button>
        <button 
          style={executeButtonStyle}
          onClick={executeAll}
          disabled={isExecuting || !settings.apiKey || !settings.model}
          title={!settings.apiKey || !settings.model ? 'API 키와 모델을 먼저 설정해주세요' : '전체 파이프라인 실행 (의존성 순서대로)'}
        >
          {isExecuting ? '⏳ 실행 중...' : (!settings.apiKey || !settings.model) ? '⚙️ 설정 필요' : '🚀 파이프라인 실행'}
        </button>
        
        {/* 구분선 */}
        <div style={{ width: '2px', height: '30px', background: colors.disabled, margin: '0 8px' }} />
        
        {/* 3. 편집 관련 */}
        <button 
          style={deleteButtonStyle}
          onClick={deleteSelected}
          disabled={selectedNodes.length === 0 && selectedEdges.length === 0}
          title={`선택된 항목 삭제 (${selectedNodes.length + selectedEdges.length}개)`}
        >
          🗑️ 삭제 {selectedNodes.length + selectedEdges.length > 0 && `(${selectedNodes.length + selectedEdges.length})`}
        </button>
        <button 
          style={branchButtonStyle}
          onClick={() => addTemplatedBranch('content')}
          disabled={selectedNodes.length !== 1}
          title="선택된 노드에서 콘텐츠 템플릿으로 분기 추가"
        >
          📝 콘텐츠 분기
        </button>
        <button 
          style={branchButtonStyle}
          onClick={() => addTemplatedBranch('creative')}
          disabled={selectedNodes.length !== 1}
          title="선택된 노드에서 창의 템플릿으로 분기 추가"
        >
          🎨 창의 분기
        </button>
        
        {/* 구분선 */}
        <div style={{ width: '2px', height: '30px', background: colors.disabled, margin: '0 8px' }} />
        
        {/* 4. 파일 관리 */}
        <button 
          style={fileButtonStyle}
          onClick={exportFlow}
          title="현재 노드와 프롬프트를 JSON 파일로 저장"
        >
          📥 내보내기
        </button>
        <button 
          style={fileButtonStyle}
          onClick={importFlow}
          title="JSON 파일에서 노드와 프롬프트 불러오기"
        >
          📤 가져오기
        </button>
        <button 
          style={{...fileButtonStyle, background: colors.danger}}
          onClick={clearAll}
          title="모든 노드와 엣지 삭제"
        >
          🗑️ 전체 삭제
        </button>
        
        {/* 구분선 */}
        <div style={{ width: '2px', height: '30px', background: colors.disabled, margin: '0 8px' }} />
        
        {/* 5. 설정 */}
        <button 
          style={settingsButtonStyle}
          onClick={() => setIsSettingsOpen(true)}
        >
          ⚙️ 설정
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={styledEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        onEdgeDoubleClick={onEdgeDoubleClick}
        onNodeDoubleClick={onNodeDoubleClick}
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

      <NodeDetailPanel
        isOpen={isNodeDetailOpen}
        onClose={() => {
          setIsNodeDetailOpen(false);
          setSelectedNodeForDetail(null);
        }}
        node={selectedNodeForDetail}
      />
    </div>
  );
} 