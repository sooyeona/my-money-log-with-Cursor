# my-money-log-with-Cursor

> **Cursor AI와 함께하는 '바이브 코딩' 실습: 데이터 흐름과 사용자 경험에 집중한 개인 가계부 서비스**

---

### Project Overview
- **개발 동기:** Cursor AI의 프롬프트 기능을 활용하여 복잡한 가계부 로직 구현 시간을 단축하고, 퍼블리셔로서의 강점인 UI/UX 설계 및 컴포넌트 구조화에 더 집중하기 위해 시작한 프로젝트입니다.
- **핵심 가치:** 
  - **정확성:** TypeScript 기반의 엄격한 타입 정의(`AppTheme`, `TabKey` 등)로 데이터 무결성 확보
  - **효율성:** `useMemo` 및 `Context API`를 활용한 전역 상태 관리와 렌더링 최적화
  - **유연성:** `UserScopeBar`를 통한 다중 사용자(Multi-user) 대응 및 개별 지출 환경 구축
  - **안정성:** 서버 연결 실패 및 데이터 로딩 상태에 대한 방어적 UI(BootWrap) 구현
- **주요 기능:** 
  - **다각도 데이터 뷰:** 일별(Day), 월별(Month), 연도별(Year), 요약(Summary) 탭 전환 기능
  - **다중 사용자 관리:** 사용자별 독립된 지출 한도 설정 및 실시간 전환
  - **스마트 테마 시스템:** `buildTheme` 유틸리티와 Emotion을 결합한 다크모드/라이트모드 스위칭
  - **데이터 영속성:** REST API(JSON Server) 연동을 통한 실시간 CRUD 처리

---

### Tech Stack & Libraries

| Category | Tech Stack | Details |
| :--- | :--- | :--- |
| **Framework** | **React 18** | Functional Components, `useMemo`, `useState` 최적화 |
| **State** | **Context API** | `LedgerProvider`를 통한 전역 지출 데이터 및 설정 정보 관리 |
| **Language** | **TypeScript** | Interface 기반의 안정적인 테마 및 데이터 구조 설계 |
| **Styling** | **Emotion (Styled)** | CSS-in-JS 기반의 시맨틱 컴포넌트 설계 및 테마 시스템 구현 |
| **Data** | **JSON Server** | Axios 기반 REST API 통신 및 `db.json`을 통한 데이터 유지 |
| **Tools** | **Cursor AI** | AI-Pair Programming을 통한 생산성 극대화 및 바이브 코딩 실천 ||

---

### Update Log (성장 기록)
*프로젝트 보완 사항을 최신순으로 기록합니다.*

*   **2026-05-14:**
    *   `[Fix]` Vite proxy 설정 오류로 발생한 502 Bad Gateway 문제 해결
    *   `[Debug]` Network 탭을 활용해 API 요청 흐름 및 rewrite 경로 추적
    *   `[Learn]` frontend → proxy → backend 구조와 Vite proxy 동작 방식 이해
 
      

//*   **2026-05-14:** 
//    *   `[Feat]` 다크모드 테마 시스템 구축 및 Emotion 전역 스타일 적용
  //  *   `[Fix]` 금액 입력 시 숫자 외 문자 입력 방지 및 자동 콤마(,) 포맷팅 로직 최적화
//*   **2026-05-13:**
  //  *   `[Feat]` JSON Server 연동 완료 (데이터 생성, 조회, 삭제 인터페이스 구축)
    //*   `[Refactor]` Context API를 활용한 전역 지출 상태 관리 최적화

---

//### Troubleshooting & Deep Dive (고민과 해결)
//*단순 구현을 넘어 발생한 문제와 해결 과정을 기록합니다.*

//#### **1. JSON Server의 데이터 비동기 처리 문제**
//- **문제:** 데이터를 Fetch 해오기 전 컴포넌트가 렌더링 되어 `undefined` 에러 발생.
//- **해결:** 커스텀 훅(`useFetch`)을 제작하여 `loading`, `error` 상태를 분기 처리하고, 데이터가 없을 때의 Skeleton UI를 적용하여 사용자 경험 개선.

//#### **2. TypeScript Interface 설계의 확장성**
//- **문제:** 지출 내역과 사용자 정보가 얽혀 있어 타입 정의가 복잡해짐.
//- **해결:** `types/` 폴더를 별도로 분리하고 `IUser`, `ITransaction` 등 도메인별로 인터페이스를 세분화하여 재사용성 높임.

//---



### 개발 노트 (Vibe Coding Philosophy)
본 프로젝트는 **'바이브 코딩'** 스타일을 지향합니다. 도구가 주는 생산성을 극대화하여 개발자가 코드의 '정답'을 찾는 고통에서 벗어나, 서비스의 '가치'와 '심미성'을 고민하는 시간을 더 많이 확보하는 것을 목표로 합니다.

---
© 2026. Sooyeon. All rights reserved.
