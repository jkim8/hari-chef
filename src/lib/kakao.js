/**
 * 카카오톡 공유(무료) 설정:
 * 1) 프로젝트 루트에 .env 파일을 만들고 VITE_KAKAO_JAVASCRIPT_KEY 를 입력합니다.
 * 2) 카카오 디벨로퍼스에서 도메인을 등록합니다.
 * 3) 실제 접속 가능한 HTTPS 사이트에 배포하면 카드 사진과 메뉴 링크가 전달됩니다.
 *    개발용 localhost에서는 이미지 URL이 외부에서 열리지 않아 텍스트 카드로 보냅니다.
 *
 * 공유할 친구는 반드시 사용자가 카카오톡에서 직접 선택해야 합니다.
 */
const KAKAO_KEY = import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY?.trim();

export function makeMenuLink(menu) {
  const url = new URL(window.location.href);
  url.searchParams.set('menu', menu.id);
  return url.toString();
}

export function tryKakaoShare(menu, message) {
  const sdk = window.Kakao;
  if (!KAKAO_KEY || !sdk?.Share?.sendDefault) return false;
  if (!sdk.isInitialized()) sdk.init(KAKAO_KEY);

  const link = makeMenuLink(menu);
  const linkInfo = { mobileWebUrl: link, webUrl: link };
  const isPublic = window.location.protocol === 'https:' &&
    !['localhost', '127.0.0.1'].includes(window.location.hostname);

  if (isPublic && menu.image) {
    sdk.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: `💌 준호야, ${menu.name} 해줘!`,
        description: message.substring(0, 200),
        imageUrl: new URL(`${import.meta.env.BASE_URL}${menu.image}`, window.location.href).href,
        link: linkInfo,
      },
      buttons: [{ title: '하리가 고른 메뉴 보기 ♡', link: linkInfo }],
    });
  } else {
    sdk.Share.sendDefault({ objectType: 'text', text: message, link: linkInfo });
  }
  return true;
}
