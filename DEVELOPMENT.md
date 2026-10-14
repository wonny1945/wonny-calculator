# 첫 단계 개발 기록

## 범위

`wonny-calculator` 폴더 이름을 바탕으로 기본 계산기를 첫 후보로 구현했습니다. 앱 종류에 대한 사용자의 응답은 아직 대기 중이며, 첫 시안 피드백 후 다음 단계를 정합니다.

## TDD 증거

1. `tests/calculator.test.js` 작성 후 `npm test` 실행.
2. 계산 구현 모듈이 없어 `ERR_MODULE_NOT_FOUND`로 실패 확인 (Red).
3. 순수 상태 전이 로직 구현 후 초기 테스트 15개 통과 (Green).
4. 키보드 매핑과 상태 불변성 테스트 추가. 최종 17개 통과.

계산 기록, 연속 연산, 연산자 교체, 소수점, 0으로 나누기와 오류 복구 등을 검증했습니다. UI와 계산 로직을 분리해 버튼과 키보드가 같은 동작을 사용하도록 구성했습니다.

## 확인 결과

- `npm test`: 17개 통과.
- `npm run check`: Svelte 오류 0, 경고 0.
- `npm run build`: 통과.
- `cargo check --offline --manifest-path src-tauri/Cargo.toml`: 통과.
- `npm run preview:export`: 독립 HTML 시안 생성 완료.

이는 타입·계산 로직·컴파일 검증입니다. 실제 네이티브 실행, UI 클릭, 시각적 검증, DMG 패키징은 아직 확인하지 않았습니다.

## 첫 실행 당시 환경 제약

- npm과 GitHub 도메인 DNS 요청 실패. npm 설치와 공개 업로드는 미완료.
- 기존 `Planning-Poker/node_modules`의 Svelte 도구에 로컬 심볼릭 링크를 만들어 오프라인 검증. 이 경로는 소스나 배포 결과에서 참조하지 않습니다. 일반 환경에서는 `npm install`로 의존성을 설치합니다.
- `npm run dev`: `127.0.0.1:1420` 포트 바인딩이 `EPERM`으로 거절됨.
- 브라우저 인벤토리에 연결된 브라우저 없음. 실제 화면 동작을 검증하지 못함.
- `git init -b main`: 작업 폴더의 `.git` 쓰기가 `Operation not permitted`로 거절됨. 로컬 커밋 미생성.
- `gh auth status`: 두 계정 인증 검사가 실패. 네트워크가 막혀 있으므로 실제 토큰 상태는 네트워크 복구 후 다시 확인해야 함.
- 내장 이미지 생성 도구 없음. API CLI 대안은 사용자 선택 대기. 생성 이미지 대신 CSS UI와 코드로 만든 임시 아이콘 사용.

## 공개 저장소

희망 저장소: `wonny1945/wonny-calculator`, 공개, MIT.

설명: `A tactile Tauri + Svelte macOS calculator. A developer experienced with Claude Code benchmarks Codex through incremental TDD.`

후속 작업에서 환경 권한이 변경되고 `gh auth switch`로 `wonny1945` 계정이 활성화되어 GitHub 인증과 네트워크 연결을 다시 확인했습니다. 위 제약은 첫 실행 당시의 기록입니다.

후속 검증에서 독립적인 `npm install`과 잠금 파일 생성을 완료했습니다. Svelte 5.57.2와 Vite 7.3.7로 수정 버전을 적용했고 npm audit 결과 취약점은 0개입니다. 기본 계산 테스트 17개, Svelte 타입 검사와 프로덕션 빌드도 다시 통과했습니다.

사용자 피드백에 따라 소개 영역·헤더·푸터·본체 기울기를 제거하고 계산기 본체만 표시하도록 수정했습니다. 기본 창 장식을 제거하고 상단에 닫기, 최소화, 일반/큰 크기 전환과 창 이동 영역을 구현했습니다.

추가 피드백에서 내부 레이아웃의 최소 높이 때문에 스크롤이 발생함을 확인했습니다. `100vh` 최소 높이를 제거하고 창 높이를 기준으로 키패드가 남은 공간을 나누도록 변경했습니다. 투명 macOS 창과 28px 본체 반경을 적용하고, 산업 디자인 방향으로 글자·키·표시창을 정리했습니다. 드롭다운 대신 3개의 작은 선택 스위치로 테마를 바꾸며 localStorage에 저장합니다.

최종 `npm run tauri build -- --debug --bundles app` 성공. 생성한 `Wonny Calculator.app`을 `open`으로 실행했습니다. Computer Use 도구는 이 앱에 대한 사용이 승인되지 않았다고 응답했으므로 실제 화면 관찰·클릭·테마 유지·스크롤 여부 검증은 미완료입니다. 컴파일 성공과 실제 UI 검증을 구분합니다.

저장소: https://github.com/wonny1945/wonny-calculator
