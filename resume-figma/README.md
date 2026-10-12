# 이력서 템플릿 (Figma용)

원본 PDF(8페이지, 960×1356)의 레이아웃을 재현한 템플릿입니다. 내용은 모두 플레이스홀더입니다.

| 파일 | 용도 |
|---|---|
| `svg/page-01~08.svg` | Figma에 드래그해서 넣는 파일 (텍스트는 `<text>` 요소, 레이어 이름 포함) |
| `index.html` | 8페이지 HTML (html.to.design 업로드 또는 Figma MCP 캡처용) |
| `png/` · `resume.pdf` | 미리보기 / PDF 출력본 |
| `content.json` | 모든 문구 (여기만 고치면 됨) |
| `build.mjs` | `content.json` → HTML·SVG·PNG·PDF 재생성 |

## Figma로 가져오기 (택1)

1. **SVG 드래그** — Figma 캔버스에 `svg/` 안의 파일 8개를 한 번에 드래그.
   텍스트가 편집 가능한 텍스트 레이어로 들어오는지는 Figma 공식 문서에 명시돼 있지 않음. 글자가 벡터로 쪼개지면 2번 방법 사용.
2. **html.to.design 플러그인** — Figma → Plugins → html.to.design → 파일 업로드 탭에서 `index.html` 업로드.
   편집 가능한 텍스트 레이어 + 컬러/텍스트 스타일이 자동 생성됨. 무료 플랜은 월 가져오기 횟수 제한 있음.
3. **Figma MCP (Claude Code 로컬, 베타)** — Claude Code에 Figma 플러그인 설치 후, 로컬에서 `index.html`을 띄우고 Figma 파일로 캡처 요청 (`generate_figma_design`).

**폰트:** [Pretendard](https://github.com/orioncactus/pretendard) (OFL)를 PC에 설치해야 원본과 같은 모양이 나옵니다. Figma 웹을 쓴다면 Figma 폰트 설치 프로그램도 필요합니다.

## 내용 수정 후 다시 만들기

```bash
npm i playwright && npx playwright install chromium
node build.mjs            # HTML + SVG + PNG + PDF
node build.mjs --html-only
```

- 다른 폴더의 내용 파일로 만들기: `node build.mjs /경로/content.json` → 결과물은 그 파일과 같은 폴더에 생성
- `content.json`에서 `**문구**` → 굵게 표시
- 로고: `{"type":"building"}` (기본 건물 아이콘) 또는 `{"type":"text","text":"ABC","bg":"#111111","color":"#FFFFFF","scale":0.2}` (`scale`: 글자 크기, 원 지름 대비)
- 섹션 이름 바꾸기: `"labels": {"career":"경력","education":"교육 · 자격","strengths":"강점","careerDetail":"경력","project":"프로젝트"}`
- 3페이지 경력 상세에 부서·직함 줄 추가: `careerDetail[].role`
- 교육·자격 칸은 내용이 길면 자동으로 여러 줄로 늘어남
- SVG 좌표는 실제 렌더링 결과에서 추출하므로, 문구 길이가 바뀌어도 줄바꿈·위치가 자동 반영됩니다. (Pretendard가 설치된 환경에서 실행)

## 원본 대비 변경점

- 원본 인물 정보·사진·회사 로고 제거 → 플레이스홀더로 대체
- 1페이지 경력 첫 행에 `직무 / 직책` 줄 추가 (원본은 없음)
- 프로젝트 4 페이지의 들여쓰기(원본 x=110) → 다른 페이지와 같은 x=80으로 통일
- 얇은 구분선 0.5px `#BBBBBB` → 1px `#E1E1E1` (Figma에서 다루기 쉽게)

## 스타일 요약

| 요소 | 크기 / 굵기 / 색 |
|---|---|
| 이름 | 60 / Bold / #222 |
| 헤드라인 | 24 / SemiBold / #111 |
| 섹션 제목 (경력·강점 등) | 22 / Bold / #111, 아래 2px #222 선 |
| 소개문 | 18 / Light / #222, 행간 28, 자간 -3% |
| 회사명 (1p) | 20 / SemiBold / #222 |
| 기간 | 17 / Regular / #666 |
| 프로젝트 소제목 | 20 / Bold / #111 |
| 프로젝트 본문·불릿 | 18 / Light / #333, 행간 23~27 |
| 여백 | 좌우 80, 본문 폭 800 |
