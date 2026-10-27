import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Heart,
  House,
  CookingPot,
  Wine,
  X,
  Share2,
  ArrowRight,
} from "lucide-react";
import {
  menus,
  LUNCH_FILTERS,
  DINNER_FILTERS,
  DRINK_FILTERS,
  normalizeMenuId,
} from "./data/menu";
import { makeMenuLink } from "./lib/kakao";
import "./random-menu.css";

const asset = (path) => `${import.meta.env.BASE_URL}${path}`;
const FAV_KEY = "hari-chef-favorites-v3";
const favoritesInitial = () => {
  try {
    const value = JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
    return Array.isArray(value)
      ? [...new Set(value.map(normalizeMenuId))].filter((id) =>
          menus.some((menu) => menu.id === id),
        )
      : [];
  } catch {
    return [];
  }
};
const featured = ["1", "2", "3", "4"];

function orderMessage(menu, selectedDrink) {
  // 저녁/술안주 모두 drinks가 있으므로 카테고리와 관계없이 술을 선택해요.
  const drink = menu.drinks?.includes(selectedDrink)
    ? selectedDrink
    : menu.drinks?.[0];
  return [
    "💗 하리씨의 명예요리사 준호에게 💗",
    "",
    `준호야, 나 ${menu.name} 먹고 싶어! 🥹💕`,
    "맛있게 만들어 줄 거지? ♡",
    drink ? `🍷 같이 마실 술: ${drink}` : "",
    "",
    `🍽️ 메뉴 구경하기: ${makeMenuLink(menu)}`,
  ]
    .filter((line) => line !== null)
    .join("\n");
}

// 레시피 전체를 공유할 수 있도록 재료와 조리 순서를 메시지로 구성해요.
// 요리사의 한마디(menu.note)는 포함하지 않습니다.
function recipeMessage(menu) {
  const steps = menu.steps || [];
  return [
    `🍳 ${menu.name}`,
    "",
    menu.description || "",
    "",
    "🛒 재료",
    ...(menu.ingredients || []).map((item) => `• ${item}`),
    "",
    ...(menu.drinks?.length
      ? [`🍷 어울리는 술: ${menu.drinks.join(", ")}`, ""]
      : []),
    "👩🏻‍🍳 만드는 방법",
    ...(steps.length
      ? steps.map((step, index) => `${index + 1}. ${step}`)
      : ["레시피 준비 중이에요."]),
    "",
    `🔗 레시피 보기: ${makeMenuLink(menu)}`,
  ].join("\n");
}

function BentoDrawing() {
  return (
    <svg
      viewBox="0 0 150 125"
      className="category-drawing"
      role="img"
      aria-label="귀여운 도시락 그림"
    >
      <g
        transform="translate(15,10) rotate(-12 60 52)"
        stroke="#442c30"
        strokeWidth="3"
        strokeLinejoin="round"
      >
        <rect x="4" y="27" width="128" height="77" rx="24" fill="#ffb06e" />
        <rect x="11" y="19" width="120" height="70" rx="21" fill="#f3b868" />
        <rect x="17" y="25" width="108" height="57" rx="16" fill="#fdf1d4" />
        <path d="M49 26v56M85 27v54" stroke="#af8057" strokeWidth="2" />
        <ellipse cx="35" cy="54" rx="15" ry="20" fill="#fffaf3" />
        <circle cx="35" cy="54" r="9" fill="#ffc954" strokeWidth="1.5" />
        <path
          d="M58 45q9-15 16 0t-3 17q-20 8-20-7"
          fill="#fff"
          strokeWidth="1.4"
        />
        <path d="M61 50l8 5M58 59l10-2" stroke="#f5b3b7" strokeWidth="2" />
        <path
          d="M90 44q8-18 17-5q16-8 13 8q5 14-12 15q-8 16-20 1q-9-10 2-19"
          fill="#72a75d"
          strokeWidth="2"
        />
        <path
          d="M86 66q10-5 18 4q9-9 17-2"
          stroke="#e88050"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <circle cx="51" cy="35" r="4" fill="#fb939e" stroke="none" />
      </g>
    </svg>
  );
}

function DrinksDrawing() {
  return (
    <svg
      viewBox="0 0 150 125"
      className="category-drawing"
      role="img"
      aria-label="와인과 맥주 그림"
    >
      <g
        stroke="#4c3036"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        <path d="M24 26h46v30q-1 24-23 24T24 56Z" fill="#fff5f6" />
        <path
          d="M28 43h38v14q-2 19-19 19T28 57Z"
          fill="#db3f65"
          stroke="none"
        />
        <path d="M47 79v22M30 104h34" fill="none" />
        <path d="M86 33h42v61q-15 12-42 0Z" fill="#ffc64f" />
        <path
          d="M128 50h10q16 1 10 24q-4 13-20 12"
          fill="none"
          strokeWidth="7"
        />
        <path
          d="M89 30q-6-13 6-18q8-13 20-3q14-6 19 7q13 13-2 18z"
          fill="#fffdf9"
        />
        <path
          d="M93 48v35M111 43v40"
          fill="none"
          stroke="#ffe99b"
          strokeWidth="5"
        />
      </g>
    </svg>
  );
}

function HeartButton({ active, toggle, name }) {
  return (
    <button
      className={`heart-button ${active ? "is-liked" : ""}`}
      onClick={(e) => {
        e.stopPropagation();
        toggle();
      }}
      title={active ? "찜 해제" : "찜하기"}
      aria-label={`${name} ${active ? "찜 해제" : "찜하기"}`}
      aria-pressed={active}
    >
      <Heart
        size={23}
        strokeWidth={2.2}
        fill={active ? "currentColor" : "none"}
      />
    </button>
  );
}

function FoodPhoto({ menu, className = "" }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [menu.id, menu.image]);
  return (
    <div
      className={`food-photo ${className}`}
      style={{ backgroundColor: menu.tint || "#ffebea" }}
    >
      {!failed && menu.image ? (
        <img
          src={asset(menu.image)}
          alt={menu.name}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="photo-emoji">{menu.emoji || "🍽️"}</span>
      )}
    </div>
  );
}

function FoodCard({ menu, open, liked, toggle }) {
  return (
    <article className="food-card">
      <button
        className="card-open"
        onClick={() => open(menu)}
        aria-label={`${menu.name} 레시피 보기`}
      >
        <FoodPhoto menu={menu} />
        <div className="food-caption">
          <strong>{menu.name}</strong>
          <span className="food-kind">
            {menu.category === "snack"
              ? "술안주"
              : menu.category === "lunch"
                ? "도시락"
                : menu.cuisine || "저녁"}
          </span>
          {menu.drinks?.length > 0 && (
            <span
              className="food-drinks"
              title={`어울리는 술: ${menu.drinks.join(" · ")}`}
            >
              🍷 {menu.drinks.join(" · ")}
            </span>
          )}
        </div>
      </button>
      <div className="food-card-heart">
        <HeartButton
          name={menu.name}
          active={liked}
          toggle={() => toggle(menu.id)}
        />
      </div>
    </article>
  );
}

const NAV = [
  { id: "home", label: "홈", Icon: House },
  { id: "lunch", label: "도시락", Icon: CookingPot },
  { id: "dining", label: "저녁", Icon: Wine },
  { id: "favorite", label: "즐겨찾기", Icon: Heart },
];
function BottomNav({ page, change, favorites }) {
  return (
    <nav className="bottom-nav" aria-label="메뉴 이동">
      <div className="bottom-nav-inner">
        {NAV.map(({ id, label, Icon }) => (
          <button
            className={`nav-link ${page === id ? "current" : ""}`}
            key={id}
            onClick={() => change(id)}
            aria-current={page === id ? "page" : undefined}
          >
            <span className="nav-icon">
              <Icon
                size={26}
                strokeWidth={2}
                fill={
                  page === id && (id === "home" || id === "lunch")
                    ? "currentColor"
                    : "none"
                }
              />
              {id === "favorite" && favorites.length > 0 && <i />}
            </span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
function Filters({ heading, values, chosen, pick }) {
  return (
    <section className="filter-set">
      <h3>{heading}</h3>
      <div className="filter-chips">
        {values.map((v) => (
          <button
            key={v}
            className={`filter-chip ${chosen === v ? "active" : ""}`}
            onClick={() => pick(v)}
            aria-pressed={chosen === v}
          >
            {v}
          </button>
        ))}
      </div>
    </section>
  );
}
function SmallBanner({ variant, onRandom }) {
  const isLunch = variant === "lunch";
  return (
    <div className={`banner-row${onRandom ? " banner-with-random" : ""}`}>
      <div className="banner-mascot">
        <img
          src={asset(isLunch ? "art/chef-lunch.png" : "art/chef-wine.png")}
          alt={isLunch ? "도시락 요리사" : "와인을 든 요리사"}
        />
      </div>
      <div className="banner-bubble">
        {isLunch ? (
          <>
            하리씨를 위한
            <br />
            맛있는 도시락 레시피!
            <br />
            <span>오늘도 든든하게 ♡</span>
          </>
        ) : (
          <>
            오늘은 어떤 술과
            <br />
            어떤 안주로?
            <br />
            <span>맛있는 시간 보내자! ♡</span>
          </>
        )}
      </div>
      {onRandom && (
        <button
          type="button"
          className="random-entry banner-random-entry"
          onClick={onRandom}
          aria-label={
            isLunch ? "랜덤 도시락 뽑기" : "랜덤 저녁 및 술안주 메뉴 뽑기"
          }
        >
          <img src={asset("icons/random-dice.svg")} alt="" aria-hidden="true" />
          <span>{isLunch ? "랜덤 도시락" : "랜덤 메뉴"}</span>
        </button>
      )}
      <span className="banner-sparkle" aria-hidden="true">
        ♥
      </span>
    </div>
  );
}
function PageHeader({ title, back }) {
  return (
    <header className="page-header">
      <button onClick={back} aria-label="홈으로 돌아가기" className="back-btn">
        <ArrowLeft size={26} />
      </button>
      <h1>{title}</h1>
      <img
        className="header-mini"
        src={asset("art/chef-hug.png")}
        alt="귀여운 요리사"
      />
    </header>
  );
}
// 랜덤 메뉴 결과는 현재 선택한 요리/술 필터에 해당하는 음식 중에서 고릅니다.
function RandomMenuModal({
  menu,
  roll,
  reroll,
  close,
  viewRecipe,
  type,
  hasMenus,
}) {
  const isLunch = type === "lunch";
  useEffect(() => {
    const onEscape = (event) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [close]);

  return (
    <div
      className="random-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <section
        className={`random-dialog${menu ? " has-result" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="random-title"
      >
        <button
          className="random-close"
          onClick={close}
          aria-label="랜덤 메뉴 닫기"
        >
          <X size={24} />
        </button>
        <span className="random-heart random-heart-a" aria-hidden="true">
          ♥
        </span>
        <span className="random-heart random-heart-b" aria-hidden="true">
          ♥
        </span>
        <div className="random-badge">
          {isLunch
            ? "하리씨를 위한 오늘의 도시락 💗"
            : "하리씨를 위한 오늘의 메뉴 💗"}
        </div>
        <h2 id="random-title">
          {isLunch ? "오늘 도시락은 뭐 먹지? 🎲" : "오늘은 뭐 먹을까? 🎲"}
        </h2>
        <p className="random-subtitle">
          {isLunch
            ? "주사위를 눌러 도시락을 골라봐요!"
            : "주사위를 눌러 맛있는 메뉴를 골라봐요!"}
        </p>

        <button
          type="button"
          className="random-dice"
          onClick={reroll}
          disabled={!hasMenus}
          aria-label={
            menu
              ? "주사위 다시 굴려 다른 메뉴 고르기"
              : "주사위 굴려 메뉴 고르기"
          }
        >
          <img
            key={roll}
            className="random-dice-image"
            src={asset("icons/random-dice.svg")}
            alt=""
            aria-hidden="true"
          />
          <span>
            {!hasMenus
              ? "메뉴 준비 중 ♡"
              : menu
                ? "주사위를 다시 눌러봐 ♡"
                : "주사위를 눌러봐 ♡"}
          </span>
        </button>

        {menu ? (
          <div className="random-result" aria-live="polite" key={menu.id}>
            <div className="random-selected">
              🎉 {isLunch ? "오늘의 랜덤 도시락!" : "오늘의 랜덤 메뉴!"}
            </div>
            <FoodPhoto menu={menu} className="random-food-image" />
            <h3>{menu.name}</h3>
            <span className="random-category">
              {menu.category === "lunch"
                ? "도시락"
                : menu.category === "snack"
                  ? "술안주"
                  : `${menu.cuisine || "저녁"} 요리`}
            </span>
            {menu.drinks?.length > 0 && (
              <p className="random-pairings">🍷 {menu.drinks.join(" · ")}</p>
            )}
            <p className="random-description">{menu.description}</p>
            <div className="random-actions">
              <button
                type="button"
                className="random-view"
                onClick={viewRecipe}
              >
                자세히 보기 <ArrowRight size={19} />
              </button>
            </div>
          </div>
        ) : (
          <div className="random-empty" aria-live="polite">
            <span>{isLunch ? "🍱" : "🍽️"}</span>
            <p>
              {hasMenus
                ? "어떤 메뉴가 나올지 두근두근! ♡"
                : isLunch
                  ? "아직 등록된 도시락이 없어요. 도시락 메뉴를 추가하면 여기서 바로 뽑을 수 있어요!"
                  : "아직 해당 조건의 메뉴가 없어요. 다른 필터를 선택해 주세요!"}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function DetailPage({ menu, back, liked, toggle, shareRecipe, shareOrder }) {
  const steps = menu.steps || [];
  return (
    <main className="recipe-page">
      <div className="recipe-hero">
        <FoodPhoto menu={menu} />
        <button className="detail-back" aria-label="뒤로 가기" onClick={back}>
          <ArrowLeft size={24} />
        </button>
        <div className="detail-heart">
          <HeartButton
            name={menu.name}
            active={liked}
            toggle={() => toggle(menu.id)}
          />
        </div>
      </div>
      <div className="recipe-body">
        <div className="recipe-title">
          <div>
            <h1>{menu.name}</h1>
            <span>
              {menu.category === "lunch"
                ? "도시락"
                : menu.category === "dinner"
                  ? `${menu.cuisine} 요리`
                  : "술안주"}
            </span>
          </div>
          <span className="recipe-doodle">♡</span>
        </div>
        <p className="recipe-desc">{menu.description} ♡</p>
        <div className="ingredients-wrap">
          <div>
            <h2 className="section-pill">🌸 재료</h2>
            <ul className="ingredient-list">
              {menu.ingredients.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
          <FoodPhoto menu={menu} className="ingredient-preview" />
        </div>
        {menu.drinks?.length > 0 && (
          <section
            className="drink-pairings"
            aria-label="어울리는 술"
            style={{ marginTop: 18 }}
          >
            <h2 className="section-pill">🍷 어울리는 술</h2>
            <div className="filter-chips" style={{ marginTop: 12 }}>
              {menu.drinks.map((pairing) => (
                <span className="filter-chip" key={pairing}>
                  {pairing}
                </span>
              ))}
            </div>
          </section>
        )}
        <section className="recipe-method" aria-label="만드는 방법">
          <h2 className="section-pill">🍳 만드는 방법</h2>
          <div className="steps-list">
            <ol>
              {steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>
        </section>
        <div className="detail-actions">
          <button
            className="pink-button recipe-copy"
            onClick={() => shareRecipe(menu)}
          >
            <Share2 size={25} />
            <span>레시피 공유하기</span>
          </button>
          <button className="kakao-button" onClick={() => shareOrder(menu)}>
            <span className="kakao-talk">TALK</span>
            <span>준호한테 해달라고 하기</span>
          </button>
        </div>
      </div>
    </main>
  );
}

export default function App() {
  const [page, setPage] = useState("home");
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [fromPage, setFromPage] = useState("home");
  const [chosen, setChosen] = useState(null);
  const [cuisine, setCuisine] = useState("전체");
  const [lunchCuisine, setLunchCuisine] = useState("전체");
  const menuScrollRef = useRef(null);
  const [drink, setDrink] = useState("전체");
  const [favs, setFavs] = useState(favoritesInitial);
  const [toast, setToast] = useState("");
  const [randomOpen, setRandomOpen] = useState(false);
  const [randomType, setRandomType] = useState("dining");
  const [randomMenu, setRandomMenu] = useState(null);
  const [randomSeen, setRandomSeen] = useState([]);
  const [rollCount, setRollCount] = useState(0);
  useEffect(() => {
    localStorage.setItem(FAV_KEY, JSON.stringify(favs));
  }, [favs]);
  useEffect(() => {
    const id = new URL(window.location.href).searchParams.get("menu");
    const menu = menus.find((m) => m.id === normalizeMenuId(id));
    if (menu) {
      if (id !== menu.id) {
        const url = new URL(window.location.href);
        url.searchParams.set("menu", menu.id);
        window.history.replaceState(null, "", url);
      }
      setChosen(menu);
      setFromPage(menu.category === "lunch" ? "lunch" : "dining");
      setPage("detail");
    }
  }, []);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [page, chosen?.id]);

  // 홈/메뉴 목록에서만 문서 스크롤을 잠가서 상단이 움직이지 않게 합니다.
  // 목록에서는 카드 영역(.menu-scroll-region)만 스크롤 가능합니다.
  useEffect(() => {
    if (page !== "home" && page !== "lunch" && page !== "dining") return;

    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
    };
  }, [page]);
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(""), 4200);
    return () => window.clearTimeout(id);
  }, [toast]);
  const navigate = (next) => {
    setPage(next);
    setChosen(null);
    setRandomOpen(false);
  };
  const open = (menu) => {
    setFromPage(page);
    setChosen(menu);
    setPage("detail");
    history.replaceState(null, "", makeMenuLink(menu));
  };
  const back = () => {
    setPage(fromPage);
    setChosen(null);
    const url = new URL(location.href);
    url.searchParams.delete("menu");
    history.replaceState(null, "", url);
  };
  const toggle = (id) =>
    setFavs((old) =>
      old.includes(id) ? old.filter((x) => x !== id) : [...old, id],
    );
  // 문자/이메일용 자체 팝업 대신 OS의 공유 시트(AirDrop·카카오톡 등)를 엽니다.
  // 브라우저/OS가 지원하지 않으면 공유창을 흉내 내지 않고 안내만 표시해요.
  const openNativeShare = async (payload) => {
    if (typeof navigator.share !== "function") {
      setToast(
        "기본 공유를 지원하지 않는 브라우저예요. 휴대폰 Safari/Chrome에서 열어주세요.",
      );
      return;
    }
    try {
      await navigator.share(payload);
    } catch (error) {
      if (error?.name !== "AbortError") {
        setToast(
          "공유창을 열지 못했어요. 브라우저의 공유 기능을 확인해 주세요.",
        );
      }
    }
  };
  const shareRecipe = (menu) =>
    openNativeShare({
      title: `${menu.name} 레시피 💗`,
      text: recipeMessage(menu),
    });
  const shareOrder = (menu) =>
    openNativeShare({
      title: `준호야, ${menu.name} 해줘 ♡`,
      text: orderMessage(menu, drink),
    });
  const resetMenuScroll = () => {
    if (menuScrollRef.current) menuScrollRef.current.scrollTop = 0;
  };
  const pickLunchCuisine = (value) => {
    setLunchCuisine(value);
    resetMenuScroll();
  };
  const pickCuisine = (value) => {
    resetMenuScroll();
    setCuisine(value);
    // 요리 종류를 선택하면 이전 술 필터를 지워서 결과가 혼동되지 않도록 해요.
    setDrink("전체");
  };
  const pickDrink = (value) => {
    resetMenuScroll();
    setDrink(value);
    // 술 종류를 선택하면 저녁/술안주를 모두 대상으로 검색해요.
    setCuisine("전체");
  };
  const shown = useMemo(() => {
    if (page === "lunch")
      return menus.filter(
        (m) => m.category === "lunch" && (lunchCuisine === "전체" || m.cuisine === lunchCuisine),
      );
    if (page === "favorite")
      return favs.map((id) => menus.find((m) => m.id === id)).filter(Boolean);
    if (page !== "dining") return [];
    if (drink !== "전체")
      return menus.filter(
        (m) => m.category !== "lunch" && m.drinks?.includes(drink),
      );
    if (cuisine === "술안주")
      return menus.filter((m) => m.category === "snack");
    if (cuisine !== "전체")
      return menus.filter(
        (m) => m.category === "dinner" && m.cuisine === cuisine,
      );
    return menus
      .filter((m) => m.category !== "lunch")
      .sort((a, b) => {
        const x = featured.indexOf(a.id),
          y = featured.indexOf(b.id);
        return (x < 0 ? 999 : x) - (y < 0 ? 999 : y);
      });
  }, [page, cuisine, lunchCuisine, drink, favs]);

  const openRandom = (type) => {
    setRandomType(type);
    setRandomMenu(null);
    setRandomSeen([]);
    setRollCount(0);
    setRandomOpen(true);
  };
  const randomCandidates =
    randomType === "lunch"
      ? (page === "lunch" ? shown : menus.filter((item) => item.category === "lunch"))
      : shown.filter(
          (item) => item.category === "dinner" || item.category === "snack",
        );
  const rerollRandom = () => {
    if (randomCandidates.length === 0) return;
    // 도시락과 저녁/술안주는 섞이지 않아요. 바로 직전 메뉴는 가능한 한 피합니다.
    const unseen = randomCandidates.filter(
      (item) => !randomSeen.includes(item.id) && item.id !== randomMenu?.id,
    );
    const candidates = unseen.length
      ? unseen
      : randomCandidates.filter((item) => item.id !== randomMenu?.id);
    const pool = candidates.length ? candidates : randomCandidates;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    setRandomSeen(unseen.length ? [...randomSeen, picked.id] : [picked.id]);
    setRandomMenu(picked);
    setRollCount((count) => count + 1);
  };
  const viewRandomRecipe = () => {
    if (!randomMenu) return;
    setRandomOpen(false);
    open(randomMenu);
  };

  const cards = (
    <div className="food-grid">
      {shown.map((menu) => (
        <FoodCard
          key={menu.id}
          menu={menu}
          open={open}
          liked={favs.includes(menu.id)}
          toggle={toggle}
        />
      ))}
    </div>
  );
  return (
    <div className={`site-shell${page === "home" ? " is-home" : ""}${page === "lunch" || page === "dining" ? " is-listing" : ""}`}>
      <div className="page-content">
        {page === "home" && (
          <main className="home-page">
            <div className="home-hero">
              <span className="decor decor-one">♥</span>
              <span className="decor decor-two">♥</span>
              <span className="decor decor-three">✿</span>
              <div className="home-copy">
                <div className="home-title" aria-label="하리씨의 명예요리사">
                  <span>시켜줘</span>
                  <span>하리씨의</span>
                  <span>
                    명예요리사<span className="title-heart">♥</span>
                  </span>
                </div>
              </div>
              <img
                src={asset("art/chef-home.png")}
                className="home-mascot"
                alt="분홍 요리사 모자를 쓰고 고양이와 함께 웃는 귀여운 요리사"
              />
              <button
                type="button"
                className="home-quote-peek"
                onClick={() => setQuoteOpen(true)}
                aria-label="원하리 명예요리사 그림 크게 보기"
                title="원하리 명예요리사 그림 크게 보기"
              >
                <img
                  src={asset("art/quote-chibi-cutout.png")}
                  alt=""
                  aria-hidden="true"
                />
                <span>원하리 명예요리사</span>
              </button>
            </div>
            <div className="home-categories">
              <button
                className="category-tile"
                onClick={() => navigate("lunch")}
              >
                <BentoDrawing />
                <strong>도시락</strong>
                <span>(하루를 든든하게!)</span>
              </button>
              <button
                className="category-tile"
                onClick={() => navigate("dining")}
              >
                <DrinksDrawing />
                <strong>저녁 &amp; 술안주</strong>
                <span>(오늘도 맛있게!)</span>
              </button>
            </div>
            <p className="home-footer">
              하리씨가 원하는 메뉴로 골라주세요 <span>💕</span>
            </p>
          </main>
        )}
        {page === "lunch" && (
          <main className="listing-page listing-fixed">
            <PageHeader title="도시락" back={() => navigate("home")} />
            <SmallBanner variant="lunch" onRandom={() => openRandom("lunch")} />
            <div className="filter-panel">
              <Filters
                heading="도시락 종류"
                values={LUNCH_FILTERS}
                chosen={lunchCuisine}
                pick={pickLunchCuisine}
              />
            </div>
            <section ref={menuScrollRef} className="menu-scroll-region" aria-label="도시락 메뉴 목록">
              {shown.length ? (
                cards
              ) : (
                <p className="empty-message">
                  {lunchCuisine === "전체"
                    ? "도시락 메뉴를 추가하면 랜덤 도시락도 바로 쓸 수 있어요 ♡"
                    : "아직 이 종류의 도시락이 없어요 ♡"}
                </p>
              )}
            </section>
          </main>
        )}
        {page === "dining" && (
          <main className="listing-page listing-fixed">
            <PageHeader title="저녁 & 술안주" back={() => navigate("home")} />
            <SmallBanner
              variant="dining"
              onRandom={() => openRandom("dining")}
            />
            <div className="filter-panel">
              <Filters
                heading="요리 종류"
                values={DINNER_FILTERS}
                chosen={cuisine}
                pick={pickCuisine}
              />
              <Filters
                heading="술 종류"
                values={DRINK_FILTERS}
                chosen={drink}
                pick={pickDrink}
              />
            </div>
            <section ref={menuScrollRef} className="menu-scroll-region" aria-label="저녁 및 술안주 메뉴 목록">
              {shown.length ? (
                cards
              ) : (
                <p className="empty-message">아직 준비 중인 메뉴예요 ♡</p>
              )}
            </section>
          </main>
        )}
        {page === "favorite" && (
          <main className="listing-page">
            <PageHeader title="즐겨찾기" back={() => navigate("home")} />
            <SmallBanner variant="lunch" />
            {shown.length ? (
              cards
            ) : (
              <div className="empty-favorite">
                <span>♡</span>
                <h2>아직 찜한 메뉴가 없어요!</h2>
                <p>마음에 드는 메뉴의 하트를 눌러주세요 ♡</p>
                <button
                  className="pink-button"
                  onClick={() => navigate("dining")}
                >
                  메뉴 구경하기
                </button>
              </div>
            )}
          </main>
        )}
        {page === "detail" && chosen && (
          <DetailPage
            menu={chosen}
            back={back}
            liked={favs.includes(chosen.id)}
            toggle={toggle}
            shareRecipe={shareRecipe}
            shareOrder={shareOrder}
          />
        )}
      </div>
      {page !== "detail" && (
        <BottomNav page={page} change={navigate} favorites={favs} />
      )}
      {randomOpen && (
        <RandomMenuModal
          menu={randomMenu}
          roll={rollCount}
          type={randomType}
          hasMenus={randomCandidates.length > 0}
          reroll={rerollRandom}
          close={() => setRandomOpen(false)}
          viewRecipe={viewRandomRecipe}
        />
      )}
      {quoteOpen && (
        <div className="quote-overlay" onClick={() => setQuoteOpen(false)}>
          <div
            className="quote-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="원하리 명예요리사"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="닫기"
              onClick={() => setQuoteOpen(false)}
            >
              <X size={22} />
            </button>
            <img
              src={asset("art/quote-wonhari.png")}
              alt="시켜줘 그럼. 원하리 명예요리사."
            />
          </div>
        </div>
      )}
      {toast && (
        <div className="toast" role="status" onClick={() => setToast("")}>
          {toast} <X size={16} />
        </div>
      )}
    </div>
  );
}
