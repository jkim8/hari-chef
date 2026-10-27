# 💗 하리의 명예요리사

**React + Vite로 만든 반응형 메뉴 웹사이트**입니다. 최초의 파스텔 핑크 6컷 시안을 기준으로, 폰 테두리나 시간/배터리 상태바 없이 제작했습니다.

## VS Code 실행

1. ZIP 압축 해제 후 `hari-chef` 폴더를 VS Code로 엽니다.
2. Node.js 20.19+ 또는 22.12+ 가 설치되어 있어야 합니다.
3. 터미널에 입력합니다.

```bash
npm install
npm run dev
```

4. 주소 `http://localhost:5173`로 접속하세요. Ctrl+C로 중지합니다.

## 메뉴와 이미지 바꾸기

- **메뉴 이름/설명/재료/종류/사진 경로:** `src/data/menu.js`
- **요리 순서:** `src/data/recipes.js`
- **음식 사진:** `public/menu/` (모두 JPG. 동명의 사진을 덮어쓰면 즉시 변경)
- **캐릭터 일러스트:** `public/art/` (`chef-home.png`, `chef-lunch.png`, `chef-wine.png`, `chef-hug.png`)
- **전체 디자인과 색상:** `src/styles.css`
- **React 화면 및 동작:** `src/App.jsx`

메뉴 사진은 모두 **로컬 파일**로 포함되어 있어 인터넷에서 가져오는 이미지가 없습니다. 첫 시안에 나온 음식 사진들을 우선 사용했고, 시안에 없는 메뉴는 비슷한 음식 사진을 *예시로 재사용*했습니다. 새 사진을 같은 파일명으로 교체하면 됩니다. 메뉴에 적힌 이름과 사진이 정확히 일치하게 사용하고 싶으면 새 사진을 넣어 주세요. 카테고리 그림(도시락/와인/맥주)은 선명한 SVG로 그렸습니다. 문자와 버튼은 스크린샷에서 자른 이미지가 아니라 실제 텍스트/컴포넌트입니다.

예시: `public/menu/snack-gambas.jpg`를 원하는 감바스 사진으로 덮어쓰면 카드와 상세페이지가 모두 변경됩니다. 또는 `src/data/menu.js`의 `image`를 다른 파일 경로로 수정해도 됩니다.

## 카카오톡 보내기

상세 화면의 **준호한테 해달라고 하기** 버튼은 다음 순서로 동작합니다.

1. `.env` 파일에 카카오 JavaScript 앱 키가 설정되면, 카카오톡 공식 공유창을 엽니다.
2. 키가 없다면 휴대폰의 기본 공유 기능을 엽니다(카카오톡 선택 가능 여부는 휴대폰/브라우저에 따라 달라짐).
3. 공유 기능이 없다면 **준호에게 보낼 부탁 문구를 복사**합니다.

상대방에게 카카오톡을 **자동 전송하지는 않습니다**. 하리씨가 직접 준호를 선택하고 보내기를 눌러야 합니다.

### 공식 카카오 공유 설정

1. https://developers.kakao.com 에서 앱을 만듭니다.
2. 사이트의 도메인을 카카오 개발자 콘솔에 등록합니다.
3. 프로젝트의 `.env.example` 파일을 `.env`로 복사합니다.
4. 다음과 같이 **JavaScript 키**를 넣습니다. (REST API 키/관리자 키를 넣으면 안 됩니다.)

```env
VITE_KAKAO_JAVASCRIPT_KEY=여기에_카카오_JavaScript_키
```

5. 개발 서버를 재시작합니다. 카카오톡으로 공유한 링크가 준호 휴대폰에서 열리려면 Vercel/Netlify/GitHub Pages 등으로 공개 배포해야 합니다. `localhost` 주소는 준호 휴대폰에서 열 수 없습니다.

공식 가이드: https://developers.kakao.com/docs/ko/kakaotalk-share/js-link

## 파일 구조

```
hari-chef/
├── index.html
├── package.json
├── vite.config.js
├── .env.example
├── README.md
├── original-design.png  # 기준 원본 시안
├── public/
│   ├── art/             # 캐릭터 PNG (개별 교체 가능)
│   ├── menu/            # 모든 음식 JPG (개별 교체 가능)
│   └── favicon.svg
└── src/
    ├── main.jsx
    ├── App.jsx          # 카테고리·필터·찜·레시피·공유
    ├── styles.css       # 반응형 핑크 디자인
    ├── data/
    │   ├── menu.js
    │   └── recipes.js
    └── lib/kakao.js
```

`npm run build`로 배포용 `dist/`를 생성할 수 있습니다.

♡ 하리씨가 고르면, 준호가 만들어 줄게요.
