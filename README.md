# Prompt Graph

React Flow 기반의 프롬프트 그래프 애플리케이션입니다.

## 기술 스택

- **Bun** - 패키지 매니저 및 런타임
- **React 18** - UI 라이브러리
- **ReactFlow** - 플로우 차트 라이브러리
- **Vite** - 빌드 도구
- **TypeScript** - 타입 안전성

## 설치 및 실행

### 1. 의존성 설치
```bash
bun install
```

### 2. 개발 서버 실행
```bash
bun run dev
```

앱이 http://localhost:3000 에서 실행됩니다.

### 3. 빌드
```bash
bun run build
```

### 4. 빌드된 앱 미리보기
```bash
bun run preview
```

## 기능

### 📝 텍스트 처리
- 텍스트 입력 노드에서 내용 편집
- 다양한 프롬프트로 텍스트 변환
- 실시간 결과 확인

### 🖼️ 멀티모달 지원
- 이미지 업로드 및 미리보기
- 이미지 설명 추가 기능
- GPT-4V, Claude 3 등 멀티모달 모델 지원
- 이미지와 텍스트 동시 처리

### 🤖 AI 모델 지원
- **OpenAI**: GPT-3.5, GPT-4, GPT-4 Turbo, GPT-4o, GPT-4 Vision
- **Anthropic**: Claude 3 Haiku, Sonnet, Opus
- 모델별 텍스트/멀티모달 지원 구분
- 커스텀 API 엔드포인트 지원

### 🔧 사용자 인터페이스
- 드래그 앤 드롭으로 노드 이동
- 노드 간 연결로 워크플로우 생성
- 프롬프트 편집 가능한 엣지
- 실시간 로딩 상태 표시
- 오류 메시지 및 처리

## 사용 방법

### 1. 설정
1. 우상단의 ⚙️ 설정 버튼 클릭
2. OpenAI 또는 Anthropic API 키 입력
3. 사용할 모델 선택 (멀티모달 지원 여부 확인)
4. 설정 저장

### 2. 노드 생성
- **📝 텍스트 노드**: 텍스트 입력용
- **🖼️ 이미지 노드**: 이미지 업로드용  
- **📤 출력 노드**: AI 응답 표시용

### 3. 워크플로우 구성
1. 입력 노드에서 출력 노드로 연결
2. 연결선(엣지) 클릭하여 프롬프트 편집
3. 🚀 모두 실행 버튼으로 AI 처리 시작

### 4. 멀티모달 사용
1. 이미지 노드에서 📷 이미지 업로드 클릭
2. 이미지 파일 선택 (jpg, png, gif 등)
3. 이미지 설명 추가 (선택사항)
4. 멀티모달 모델과 연결하여 실행

## 프로젝트 구조

```
prompt-graph/
├── src/
│   ├── components/           # React 컴포넌트
│   │   ├── InputNode.tsx    # 텍스트 입력 노드
│   │   ├── ImageNode.tsx    # 이미지 입력 노드
│   │   ├── OutputNode.tsx   # 출력 노드
│   │   ├── CustomEdge.tsx   # 프롬프트 엣지
│   │   └── SettingsPanel.tsx # 설정 패널
│   ├── services/            # 비즈니스 로직
│   │   └── llmService.ts    # LLM API 호출 서비스
│   ├── main.tsx            # 앱 엔트리 포인트
│   ├── FlowCanvas.tsx      # 메인 플로우 컴포넌트
│   └── index.css           # 전역 스타일
├── index.html              # HTML 템플릿
├── package.json            # 프로젝트 설정
├── tsconfig.json           # TypeScript 설정
├── vite.config.ts          # Vite 설정
└── README.md              # 이 파일
```

## 지원 모델

### 텍스트 전용 모델
- GPT-3.5 Turbo
- GPT-4

### 멀티모달 모델 (텍스트 + 이미지)
- GPT-4 Turbo
- GPT-4o  
- GPT-4 Vision Preview
- Claude 3 Haiku
- Claude 3 Sonnet
- Claude 3 Opus 