# Contributing to Prompt Graph

🎉 먼저 Prompt Graph에 기여해주셔서 감사합니다! 

## 🚀 빠른 시작

### 개발 환경 설정
1. **저장소 클론**
   ```bash
   git clone https://github.com/kangthink/prompt-graph.git
   cd prompt-graph
   ```

2. **의존성 설치**
   ```bash
   bun install
   ```

3. **개발 서버 실행**
   ```bash
   bun dev
   ```

## 🛠️ 기여 방법

### 🐛 버그 리포트
- **이슈 탭**에서 새 이슈 생성
- 버그 재현 단계 상세히 기술
- 스크린샷이나 로그 첨부 (가능한 경우)
- 브라우저, OS 정보 포함

### ✨ 기능 제안
- **이슈 탭**에서 Feature Request 템플릿 사용
- 제안하는 기능의 목적과 사용 사례 설명
- 가능하면 목업이나 스케치 첨부

### 💻 코드 기여

#### 1. Fork & Branch
```bash
# 1. 저장소 포크 (GitHub에서)
# 2. 로컬에 클론
git clone https://github.com/YOUR_USERNAME/prompt-graph.git
cd prompt-graph

# 3. 새 브랜치 생성
git checkout -b feature/새로운-기능
# 또는
git checkout -b fix/버그-수정
```

#### 2. 개발 가이드라인
- **코드 스타일**: TypeScript + React 베스트 프랙티스 준수
- **컴포넌트**: 재사용 가능한 컴포넌트 작성
- **타입 안전성**: any 타입 사용 최소화
- **성능**: React.memo, useCallback 등 최적화 활용

#### 3. 커밋 메시지 컨벤션
```
type(scope): description

예시:
feat(nodes): 새로운 노드 타입 추가
fix(api): Ollama 연결 오류 수정
docs(readme): 설치 가이드 업데이트
style(ui): 버튼 디자인 개선
refactor(service): LLM 서비스 구조 개선
```

**Type 종류:**
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서화
- `style`: 코드 포맷팅, UI 스타일
- `refactor`: 코드 리팩토링
- `test`: 테스트 추가
- `chore`: 빌드, 설정 등

#### 4. Pull Request
```bash
# 1. 변경사항 커밋
git add .
git commit -m "feat(nodes): 새로운 노드 타입 추가"

# 2. 원격 저장소에 푸시
git push origin feature/새로운-기능

# 3. GitHub에서 Pull Request 생성
```

**PR 체크리스트:**
- [ ] 로컬에서 정상 빌드/실행 확인
- [ ] 새로운 기능에 대한 문서 업데이트
- [ ] 변경사항이 기존 기능에 영향 없음 확인
- [ ] 명확한 PR 제목과 설명 작성

## 🏗️ 프로젝트 구조

```
src/
├── components/          # React 컴포넌트
│   ├── InputNode.tsx   # 입력 노드
│   ├── OutputNode.tsx  # 출력 노드
│   ├── ImageNode.tsx   # 이미지 노드
│   └── ...
├── services/           # 비즈니스 로직
│   └── llmService.ts   # LLM API 서비스
├── FlowCanvas.tsx     # 메인 플로우 컴포넌트
└── main.tsx           # 앱 엔트리 포인트
```

## 🎯 기여 우선순위

### 🔥 High Priority
- 새로운 LLM 모델 지원 추가
- 모바일 반응형 개선
- 성능 최적화

### 📝 Medium Priority  
- 새로운 노드 타입 개발
- UI/UX 개선
- 다국어 지원

### 💡 Ideas Welcome
- 플러그인 시스템
- 템플릿 마켓플레이스
- 협업 기능

## 🤝 커뮤니티

- **이슈 토론**: GitHub Issues에서 활발히 소통
- **질문/도움**: Discussion 탭 활용
- **실시간 채팅**: 향후 Discord 서버 예정

## 📋 Code of Conduct

모든 기여자는 [Code of Conduct](CODE_OF_CONDUCT.md)를 준수해야 합니다.

---

**다시 한번 기여해주셔서 감사합니다! 🙏**
모든 기여는 소중하며, 함께 더 나은 도구를 만들어가요! 