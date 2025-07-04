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
- `{입력}` 템플릿을 활용한 프롬프트 작성
- 출력 노드 간 체인 연결로 다단계 처리
- 실시간 결과 확인

### 🖼️ 멀티모달 지원
- 이미지 업로드 및 미리보기
- 이미지 설명 추가 기능
- GPT-4V, Claude 3 등 멀티모달 모델 지원
- 이미지와 텍스트 동시 처리

### 👁️ 프롬프트 미리보기
- 실행 전 최종 프롬프트 확인
- 템플릿 치환 과정 시각화
- 시스템 메시지와 사용자 메시지 구분 표시
- 첨부된 이미지 미리보기

### 📋 노드 상세보기
- 노드 더블클릭으로 상세 정보 모달 열기
- 노드 타입별 정보 표시 (텍스트/출력/이미지)
- 원클릭 텍스트 복사 기능 (📋 버튼)
- 출력 노드 실행 상태 시각화 (로딩/완료/오류/대기)
- 이미지 노드 미리보기 및 파일 정보
- 긴 텍스트 스크롤 지원

### 🤖 AI 모델 지원
- **OpenAI**: GPT-o3, GPT-o4 Mini, GPT-4.1, GPT-4.1 Mini, GPT-4o, GPT-4o Mini, GPT-4 Turbo, GPT-4, GPT-3.5 Turbo
- **Anthropic**: Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Sonnet, Claude 3 Haiku
- **Google**: Gemini 1.5 Pro, Gemini 1.5 Flash, Gemini Pro, Gemini Pro Vision
- **Ollama (로컬)**: Llama 3.2/3.1/3/2, Mistral, CodeLlama, LLaVA, BakLLaVA, Gemma 2, Qwen 2.5
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
   - `{입력}` 템플릿을 사용하여 입력 내용 참조
   - 예: `다음 텍스트를 요약해주세요: {입력}`
3. 👁️ 미리보기 버튼으로 최종 프롬프트 확인
4. 🚀 모두 실행 버튼으로 AI 처리 시작

### 4. 체인 연결
1. 출력 노드의 결과를 다른 노드의 입력으로 연결
2. 다단계 프롬프트 처리로 복잡한 워크플로우 구성
3. 예시: 텍스트 요약 → 요약문 번역 → 번역문 검토

### 5. 멀티모달 사용
1. 이미지 노드에서 📷 이미지 업로드 클릭
2. 이미지 파일 선택 (jpg, png, gif 등)
3. 이미지 설명 추가 (선택사항)
4. 멀티모달 지원 모델과 연결하여 실행

### 6. 노드 상세보기
1. 원하는 노드를 **더블클릭**하여 상세 정보 모달 열기
2. 노드별 정보 확인:
   - **텍스트 노드**: 입력 내용, 글자 수
   - **출력 노드**: AI 응답, 실행 상태, 글자 수  
   - **이미지 노드**: 파일 정보, 이미지 미리보기, 설명
3. 📋 복사 버튼으로 텍스트 원클릭 복사
4. 모달 외부 클릭 또는 ✕ 버튼으로 닫기

## 템플릿 시스템

### 기본 템플릿
- `{입력}`: 연결된 입력 노드의 내용을 삽입

### 사용 예시
```
원본 프롬프트: "다음 텍스트를 영어로 번역해주세요: {입력}"
입력 내용: "안녕하세요, 반갑습니다."

처리된 시스템 메시지: "다음 텍스트를 영어로 번역해주세요: 안녕하세요, 반갑습니다."
사용자 메시지: "안녕하세요, 반갑습니다."
```

## 프로젝트 구조

```
prompt-graph/
├── src/
│   ├── components/              # React 컴포넌트
│   │   ├── InputNode.tsx       # 텍스트 입력 노드
│   │   ├── ImageNode.tsx       # 이미지 입력 노드
│   │   ├── OutputNode.tsx      # 출력 노드 (체인 연결 지원)
│   │   ├── CustomEdge.tsx      # 프롬프트 엣지 (템플릿 지원)
│   │   ├── SettingsPanel.tsx   # 설정 패널
│   │   ├── PromptPreviewPanel.tsx # 프롬프트 미리보기 패널
│   │   └── NodeDetailPanel.tsx # 노드 상세보기 패널 (복사 기능)
│   ├── services/               # 비즈니스 로직
│   │   └── llmService.ts       # LLM API 호출 서비스 (템플릿 처리)
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

### 🔥 OpenAI (API 키 필요)
| 모델 | 멀티모달 | 설명 |
|------|----------|------|
| GPT-o3 | ✅ | 차세대 추론 모델, 최고 성능 |
| GPT-o4 Mini | ✅ | 경량화된 o4 모델, 빠른 처리 |
| GPT-4.1 | ✅ | 개선된 GPT-4, 향상된 멀티모달 |
| GPT-4.1 Mini | ✅ | 경량화된 GPT-4.1, 비용 효율적 |
| GPT-4o | ✅ | 최신 멀티모달 모델, 텍스트/이미지 처리 |
| GPT-4o Mini | ✅ | 경량화된 GPT-4o, 비용 효율적 |
| GPT-4 Turbo | ✅ | 향상된 성능, 멀티모달 지원 |
| GPT-4 | ❌ | 고품질 텍스트 생성 |
| GPT-3.5 Turbo | ❌ | 빠르고 비용 효율적 |

### 🧠 Anthropic Claude (API 키 필요)
| 모델 | 멀티모달 | 설명 |
|------|----------|------|
| Claude 3.5 Sonnet | ✅ | 최신 모델, 뛰어난 추론 능력 |
| Claude 3 Opus | ✅ | 가장 강력한 Claude 모델 |
| Claude 3 Sonnet | ✅ | 균형잡힌 성능 |
| Claude 3 Haiku | ✅ | 빠른 응답 속도 |

### 🌟 Google Gemini (API 키 필요)
| 모델 | 멀티모달 | 설명 |
|------|----------|------|
| Gemini 1.5 Pro | ✅ | 대용량 컨텍스트, 멀티모달 |
| Gemini 1.5 Flash | ✅ | 빠른 처리 속도 |
| Gemini Pro Vision | ✅ | 이미지 분석 특화 |
| Gemini Pro | ❌ | 범용 텍스트 처리 |

### 🏠 Ollama (로컬 실행, 무료)
| 모델 | 멀티모달 | 설명 |
|------|----------|------|
| Llama 3.2 | ❌ | Meta의 최신 오픈소스 모델 |
| Llama 3.1 | ❌ | 향상된 Llama 3, 긴 컨텍스트 |
| Llama 3 | ❌ | 뛰어난 성능의 오픈소스 모델 |
| Llama 2 | ❌ | 안정적인 성능 |
| Mistral | ❌ | 유럽의 오픈소스 모델 |
| CodeLlama | ❌ | 코드 생성 특화 |
| LLaVA | ✅ | 오픈소스 멀티모달 모델 |
| BakLLaVA | ✅ | 개선된 LLaVA |
| Gemma 2 | ❌ | Google의 오픈소스 모델 |
| Qwen 2.5 | ❌ | Alibaba의 다국어 모델 |

### 📝 설정 방법
1. **API 키 발급**:
   - OpenAI: https://platform.openai.com/api-keys
   - Anthropic: https://console.anthropic.com/
   - Google: https://makersuite.google.com/app/apikey

2. **Ollama 설치** (로컬 실행):
   ```bash
   # macOS/Linux
   curl -fsSL https://ollama.com/install.sh | sh
   
   # Windows
   # https://ollama.com/download에서 다운로드
   ```

3. **앱에서 설정**:
   - ⚙️ 설정 버튼 클릭
   - API 키 입력 또는 Ollama 로컬 설정
   - 원하는 모델 선택
   - 저장 후 사용 시작 