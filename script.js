const letter = document.getElementById("letter");

const envelope = document.getElementById("envelope");

const readButton = document.getElementById("readButton");
const message = document.getElementById("message");

let busy = false;
let coinFound = false;

/* ПЕРВЫЙ ЭКРАН: ЛИСТАЙ ВНИЗ */

const scrollHint = document.getElementById("scrollHint");

function onScrollReveal() {
    if (window.scrollY > window.innerHeight * 0.2) {
        letter.classList.add("show");
    }
    if (scrollHint) {
        scrollHint.classList.toggle("gone", window.scrollY > 60);
    }
}

window.addEventListener("scroll", onScrollReveal, { passive: true });
onScrollReveal();

if (scrollHint) {
    scrollHint.addEventListener("click", () => {
        letter.classList.add("show");
        letter.scrollIntoView({ behavior: "smooth", block: "center" });
    });
}




/* КОНВЕРТ */

envelope.addEventListener("click", (event) => {

    if (event.target.closest("#readButton")) return;
    if (busy) return;

    busy = true;

    const opening = !envelope.classList.contains("open");
    envelope.classList.toggle("open");

    setTimeout(() => {
        busy = false;
    }, opening ? 2600 : 2800);

});


/* ЧИТАТЬ ПИСЬМО */

function closeMessage() {
    message.classList.remove("show");
    letter.classList.remove("reading");
    document.documentElement.style.overflow = "";
}

if (readButton && message) {

    readButton.addEventListener("click", (event) => {

        event.stopPropagation();

        letter.classList.add("reading");
        message.classList.add("show");

        document.documentElement.style.overflow = "hidden";

    });

    /* клик мимо карточки или Esc возвращает конверт */

   message.addEventListener("click", (event) => {
    if (!event.target.closest(".message-box")) {
        closeMessage();
    }
});



}
/* ПЕРЕХОД К ВЫБОРУ ТЕМ */

const nextButton = document.getElementById("nextButton");
const hub = document.getElementById("hub");
const topic = document.getElementById("topic");
const backButton = document.getElementById("backButton");
const finalCard = document.getElementById("finalCard");


const opened = new Set();
let unlocked = false;

nextButton.addEventListener("click", () => {
    message.classList.add("leaving");

    setTimeout(() => {
        hub.classList.add("show");
    }, 800);
});


/* ОТКРЫТИЕ ТЕМЫ */

document.querySelectorAll(".topic-card").forEach((card) => {

    card.addEventListener("click", () => {

        const name = card.dataset.topic;

        if (name === "final" && !unlocked) {
            card.classList.remove("shake");
            void card.offsetWidth;
            card.classList.add("shake");
            return;
        }

        document.querySelectorAll(".topic-page").forEach((p) => {
            p.classList.remove("active");
        });

        document.getElementById("page-" + name).classList.add("active");
        topic.scrollTop = 0;
        topic.classList.add("show");

        card.classList.add("visited");
        opened.add(name);
    });

});


/* НАЗАД И РАЗБЛОКИРОВКА ФИНАЛА */

backButton.addEventListener("click", () => {

    topic.classList.remove("show");

    if (!unlocked && opened.has("why") && opened.has("how")) {

        unlocked = true;

        setTimeout(() => {
    finalCard.classList.add("reveal");
}, 1000);
    }
});
document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    if (topic.classList.contains("show")) {
        backButton.click();
    } else if (!hub.classList.contains("show")) {
        closeMessage();
    }
});

/* ШЛЕЙФ ИЗ СЕРДЕЧЕК */

let lastTrail = 0;

document.addEventListener("mousemove", (event) => {

    const now = Date.now();
    if (now - lastTrail < 70) return;
    lastTrail = now;

    const heart = document.createElement("span");
    heart.className = "trail-heart";
    heart.textContent = "♡";
    heart.style.left = event.clientX + "px";
    heart.style.top = event.clientY + "px";

    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 1000);
});
/* РАЗВОРАЧИВАЮЩИЕСЯ ПРИЧИНЫ */

const reasonsList = document.getElementById("reasons");
const reasonItems = [...reasonsList.querySelectorAll(".reason")];

let typingTimer = null;
let resetTimer = null;

const STRIP = 8;    /* толщина полоски, px */
const GAP = 6;      /* расстояние между полосками, px */

/* обёртка, которая держит размер плашки неизменным */

const clip = document.createElement("div");
clip.className = "reasons-clip";
reasonsList.parentNode.insertBefore(clip, reasonsList);
clip.appendChild(reasonsList);

/* текст: напечатанная часть + невидимая оставшаяся */

reasonsList.querySelectorAll(".reason-text").forEach((el) => {
    el.innerHTML = '<span class="typed"></span><span class="rest"></span>';
    el.querySelector(".rest").textContent = el.dataset.text;
});

function setProgress(el, count) {
    const text = el.dataset.text;
    el.querySelector(".typed").textContent = text.slice(0, count);
    el.querySelector(".rest").textContent = text.slice(count);
}

function typeText(el) {

    clearTimeout(typingTimer);

    const text = el.dataset.text;
    const typed = el.querySelector(".typed");

    setProgress(el, 0);
    typed.classList.add("typing");

    let i = 0;

    function step() {

        if (i >= text.length) {
            typed.classList.remove("typing");
            return;
        }

        const char = text[i];
        i++;
        setProgress(el, i);

        let delay = 38;

        if (char === "," || char === ";") delay = 260;
        else if (char === "." || char === "!" || char === "?") delay = 480;

        typingTimer = setTimeout(step, delay);
    }

    typingTimer = setTimeout(step, 700);
}

/* запоминаем размеры закрытого списка (один раз) */

function lockSizes() {

    if (clip.style.height) return;

    clip.style.height = reasonsList.offsetHeight + "px";

    reasonItems.forEach((li) => {
        li._h = li.offsetHeight;
        li.style.height = li._h + "px";
    });

    reasonsList.classList.add("ready");
    void reasonsList.offsetHeight;
}

function openReason(active) {

    clearTimeout(resetTimer);
    lockSizes();

    const total = clip.offsetHeight;
    const openHeight = total - (reasonItems.length - 1) * (STRIP + GAP) - GAP;

    reasonItems.forEach((li) => {

        li.style.marginTop = GAP + "px";

        if (li === active) {
            li.classList.remove("squeezed");
            li.classList.add("open");
            li.style.height = openHeight + "px";
        } else {
            if (li.classList.contains("open")) {
                const el = li.querySelector(".reason-text");
                el.querySelector(".typed").classList.remove("typing");
                setTimeout(() => setProgress(el, 0), 800);
            }
            li.classList.remove("open");
            li.classList.add("squeezed");
            li.style.height = STRIP + "px";
        }
    });

    typeText(active.querySelector(".reason-text"));
}

function closeAll() {

    clearTimeout(typingTimer);

    reasonItems.forEach((li) => {

        if (li.classList.contains("open")) {
            const el = li.querySelector(".reason-text");
            el.querySelector(".typed").classList.remove("typing");
            setProgress(el, el.dataset.text.length);
        }

        li.classList.remove("open", "squeezed");
        li.style.marginTop = "";
        if (li._h) li.style.height = li._h + "px";
    });

    resetTimer = setTimeout(() => {
        reasonItems.forEach((li) => {
            li.style.height = "";
            setProgress(li.querySelector(".reason-text"), 0);
        });
        clip.style.height = "";
    }, 1000);
}

reasonItems.forEach((li) => {

    li.querySelector(".reason-head").addEventListener("click", () => {
        if (li.classList.contains("open")) {
            closeAll();
        } else {
            openReason(li);
        }
    });

    li.addEventListener("click", () => {
        if (li.classList.contains("squeezed")) {
            openReason(li);
        }
    });
});

backButton.addEventListener("click", () => {
    closeAll();

    /* только при выходе из темы список снова готов к красивому появлению */
    setTimeout(() => {
        reasonsList.classList.remove("ready");
    }, 1200);
});
/* СТИРАШКА */

const scratchStage = document.getElementById("scratchStage");
const scratchCard = document.getElementById("scratchCard");
const scratchCanvas = document.getElementById("scratchCanvas");
const scratchProgress = document.getElementById("scratchProgress");
const finalContent = document.getElementById("finalContent");
const ctx = scratchCanvas.getContext("2d", { willReadFrequently: true });

const REVEAL_AT = 0.55;     /* сколько нужно стереть: 55% */
const BRUSH = 38;           /* размер "ластика" */

let scratchDone = false;
let scratching = false;
let lastPoint = null;
let lastCheck = 0;
/* ===== РЕАЛИСТИЧНАЯ СТИРАШКА ===== */

const PAD = 90;   /* запас вокруг карточки для разлетающихся крошек */

const pCanvas = document.createElement("canvas");
pCanvas.className = "scratch-particles";
scratchCard.appendChild(pCanvas);
const pctx = pCanvas.getContext("2d");

let crumbs = [];
let crumbsRunning = false;

const CRUMB_COLORS = ["#e9b3c4", "#c9768f", "#f3cdd8", "#b9556f", "#d99ab0"];


/* ФОЛЬГА */

function drawCover() {

    const dpr = window.devicePixelRatio || 1;
    const w = scratchCard.offsetWidth;
    const h = scratchCard.offsetHeight;

    scratchCanvas.width = w * dpr;
    scratchCanvas.height = h * dpr;

    /* холст для крошек: карточка + поля */

    pCanvas.width = (w + PAD * 2) * dpr;
    pCanvas.height = (h + PAD * 2) * dpr;
    pCanvas.style.width = (w + PAD * 2) + "px";
    pCanvas.style.height = (h + PAD * 2) + "px";
    pCanvas.style.left = -PAD + "px";
    pCanvas.style.top = -PAD + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";

    /* металлический розовый градиент */

    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#e9b3c4");
    g.addColorStop(0.25, "#c9768f");
    g.addColorStop(0.5, "#f3cdd8");
    g.addColorStop(0.75, "#b9556f");
    g.addColorStop(1, "#d99ab0");

    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    /* блики */

    ctx.save();
    ctx.rotate(-0.5);
    for (let i = -2; i < 8; i++) {
        ctx.fillStyle = "rgba(255,255,255,0.10)";
        ctx.fillRect(i * 60, -100, 18, h + 300);
    }
    ctx.restore();

    /* тонкие горизонтальные «царапинки» фольги */

    for (let y = 0; y < h; y += 2) {
        ctx.fillStyle = Math.random() > 0.5
            ? "rgba(255,255,255," + (Math.random() * 0.07) + ")"
            : "rgba(90,20,40," + (Math.random() * 0.06) + ")";
        ctx.fillRect(0, y, w, 1);
    }

    /* зерно */

    const img = ctx.getImageData(0, 0, scratchCanvas.width, scratchCanvas.height);
    const d = img.data;

    for (let i = 0; i < d.length; i += 4) {
        const n = (Math.random() - 0.5) * 40;
        d[i] += n;
        d[i + 1] += n;
        d[i + 2] += n;
    }

    ctx.putImageData(img, 0, 0);

    /* узор из сердечек */

    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.font = "22px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let y = 18; y < h; y += 38) {
        for (let x = (y / 38) % 2 ? 18 : 38; x < w; x += 40) {
            ctx.fillText("♡", x, y);
        }
    }

    /* вдавленная надпись: тёмная тень + светлый контур */

    ctx.font = "italic 22px 'Playfair Display', serif";
    ctx.fillStyle = "rgba(90,15,40,0.55)";
    ctx.fillText("сотри меня", w / 2 + 1, h / 2 + 1);
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillText("сотри меня", w / 2, h / 2);

    /* рамка-обводка как у билета */

    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 2;
    ctx.strokeRect(6, 6, w - 12, h - 12);

    scratchProgress.textContent = "0%";

    crumbs = [];
}


/* СТИРАНИЕ: рваный край вместо гладкой линии */

function scratchTo(p) {

    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "#000";

    const dx = p.x - lastPoint.x;
    const dy = p.y - lastPoint.y;
    const dist = Math.hypot(dx, dy);
    const steps = Math.max(1, Math.ceil(dist / 3));

    for (let s = 1; s <= steps; s++) {

        const x = lastPoint.x + dx * s / steps;
        const y = lastPoint.y + dy * s / steps;

        /* ядро */

        ctx.beginPath();
        ctx.arc(x, y, BRUSH * 0.32, 0, Math.PI * 2);
        ctx.fill();

        /* россыпь мелких кружков вокруг даёт неровный край */

        for (let k = 0; k < 7; k++) {

            const a = Math.random() * Math.PI * 2;
            const r = BRUSH * (0.25 + Math.random() * 0.3);
            const size = 2 + Math.random() * BRUSH * 0.2;

            ctx.beginPath();
            ctx.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /* крошки фольги отлетают от места стирания */

    spawnCrumbs(p, Math.min(4, 1 + Math.floor(dist / 6)));

    lastPoint = p;
}


/* КРОШКИ */

function spawnCrumbs(p, count) {

    for (let i = 0; i < count; i++) {
        crumbs.push({
            x: p.x + (Math.random() - 0.5) * BRUSH * 0.6,
            y: p.y + (Math.random() - 0.5) * BRUSH * 0.6,
            vx: (Math.random() - 0.5) * 2.6,
            vy: -Math.random() * 2.2 - 0.3,
            size: 1.5 + Math.random() * 3,
            rot: Math.random() * Math.PI,
            vr: (Math.random() - 0.5) * 0.4,
            life: 0,
            max: 40 + Math.random() * 30,
            color: CRUMB_COLORS[Math.floor(Math.random() * CRUMB_COLORS.length)]
        });
    }

    if (crumbs.length > 140) crumbs.splice(0, crumbs.length - 140);

    if (!crumbsRunning) {
        crumbsRunning = true;
        requestAnimationFrame(animateCrumbs);
    }
}

function animateCrumbs() {

    const dpr = window.devicePixelRatio || 1;

    pctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    pctx.clearRect(0, 0, pCanvas.width, pCanvas.height);

    crumbs = crumbs.filter((c) => c.life < c.max);

    crumbs.forEach((c) => {

        c.life++;
        c.vy += 0.2;               /* гравитация */
        c.x += c.vx;
        c.y += c.vy;
        c.rot += c.vr;

        pctx.save();
        pctx.translate(c.x + PAD, c.y + PAD);
        pctx.rotate(c.rot);
        pctx.globalAlpha = 1 - c.life / c.max;
        pctx.fillStyle = c.color;
        pctx.fillRect(-c.size, -c.size / 2, c.size * 2, c.size);
        pctx.restore();
    });

    if (crumbs.length) {
        requestAnimationFrame(animateCrumbs);
    } else {
        crumbsRunning = false;
        pctx.clearRect(0, 0, pCanvas.width, pCanvas.height);
    }
}

function initScratch() {

    if (scratchDone) {
        scratchStage.classList.add("hide");
        finalContent.classList.add("show");
        return;
    }

    scratchStage.classList.remove("hide");
    finalContent.classList.remove("show");
    scratchCanvas.classList.remove("gone");

    drawCover();
}

/* координаты с учётом масштаба карточки */

function getPoint(event) {

    const rect = scratchCanvas.getBoundingClientRect();

    return {
        x: (event.clientX - rect.left) * (scratchCard.offsetWidth / rect.width),
        y: (event.clientY - rect.top) * (scratchCard.offsetHeight / rect.height)
    };
}



function checkProgress() {

    const data = ctx.getImageData(0, 0, scratchCanvas.width, scratchCanvas.height).data;

    let cleared = 0;
    let total = 0;

    for (let i = 3; i < data.length; i += 16) {   /* каждый 4-й пиксель */
        total++;
        if (data[i] < 128) cleared++;
    }

    const part = cleared / total;

    scratchProgress.textContent = Math.min(100, Math.round(part / REVEAL_AT * 100)) + "%";

    if (part >= REVEAL_AT) revealGift();
}

function revealGift() {

    if (scratchDone) return;
    scratchDone = true;
    scratching = false;

    scratchCanvas.classList.add("gone");

    const flash = document.createElement("div");
    flash.className = "scratch-flash";
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 1400);

    /* на пике вспышки меняем содержимое */

    setTimeout(() => {
        scratchStage.classList.add("hide");
        finalContent.classList.add("show");
        topic.scrollTop = 0;
    }, 700);
}

scratchCanvas.addEventListener("pointerdown", (event) => {

    if (scratchDone || !coinFound) return;

    scratching = true;
    scratchCanvas.setPointerCapture(event.pointerId);

    lastPoint = getPoint(event);
    scratchTo(lastPoint);
});

scratchCanvas.addEventListener("pointermove", (event) => {

    if (!scratching) return;

    scratchTo(getPoint(event));

    const now = Date.now();
    if (now - lastCheck > 120) {
        lastCheck = now;
        checkProgress();
    }
});

function stopScratch() {
    if (!scratching) return;
    scratching = false;
    checkProgress();
}

scratchCanvas.addEventListener("pointerup", stopScratch);
scratchCanvas.addEventListener("pointercancel", stopScratch);

/* запуск при открытии карточки подарка */

finalCard.addEventListener("click", initScratch);
/* СЕРЕБРЯНАЯ МОНЕТКА */

const COIN_SIZE = 64;

const COIN_SVG = `
<svg viewBox="0 0 100 100" width="${COIN_SIZE}" height="${COIN_SIZE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="cFace" cx="35%" cy="30%" r="80%">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset=".35" stop-color="#e3e5ea"/>
      <stop offset=".7" stop-color="#b4b8c1"/>
      <stop offset="1" stop-color="#868a95"/>
    </radialGradient>

    <linearGradient id="cRim" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fbfbfd"/>
      <stop offset=".5" stop-color="#7f838d"/>
      <stop offset="1" stop-color="#eceef2"/>
    </linearGradient>

    <linearGradient id="cV" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset=".55" stop-color="#c9ccd3"/>
      <stop offset="1" stop-color="#7b7f89"/>
    </linearGradient>

    <radialGradient id="cGloss" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#fff" stop-opacity=".8"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>

    <clipPath id="cClip"><circle cx="50" cy="50" r="46"/></clipPath>

    <g id="cPetal">
      <path d="M50 16 C53.5 20 53.5 24 50 27.5 C46.5 24 46.5 20 50 16Z"
            fill="none" stroke="#6d717b" stroke-width=".9"/>
      <circle cx="50" cy="21.5" r=".9" fill="#6d717b"/>
    </g>

    <circle id="cDot" cx="50" cy="19" r="1.1" fill="#6d717b"/>
  </defs>

  <!-- ободок -->
  <circle cx="50" cy="50" r="48.5" fill="url(#cRim)" stroke="#5d616a" stroke-width="1"/>

  <!-- рифлёный гурт -->
  <circle cx="50" cy="50" r="46.6" fill="none" stroke="#4f535c"
          stroke-width="2.6" stroke-dasharray="1.1 1.5" opacity=".6"/>

  <!-- поле монеты -->
  <circle cx="50" cy="50" r="43" fill="url(#cFace)" stroke="#8a8e98" stroke-width=".8"/>
  <circle cx="50" cy="50" r="40.5" fill="none" stroke="#6d717b" stroke-width=".8"/>
  <circle cx="50" cy="50" r="39.2" fill="none" stroke="#fff" stroke-width=".5" opacity=".7"/>

  <!-- бусины по кругу -->
  <circle cx="50" cy="50" r="37" fill="none" stroke="#5f636c" stroke-width="1.7"
          stroke-linecap="round" stroke-dasharray="0.1 3.18"/>

  <!-- лепестки и точки между ними -->
  <use href="#cPetal"/>
  <use href="#cPetal" transform="rotate(30 50 50)"/>
  <use href="#cPetal" transform="rotate(60 50 50)"/>
  <use href="#cPetal" transform="rotate(90 50 50)"/>
  <use href="#cPetal" transform="rotate(120 50 50)"/>
  <use href="#cPetal" transform="rotate(150 50 50)"/>
  <use href="#cPetal" transform="rotate(180 50 50)"/>
  <use href="#cPetal" transform="rotate(210 50 50)"/>
  <use href="#cPetal" transform="rotate(240 50 50)"/>
  <use href="#cPetal" transform="rotate(270 50 50)"/>
  <use href="#cPetal" transform="rotate(300 50 50)"/>
  <use href="#cPetal" transform="rotate(330 50 50)"/>

  <use href="#cDot" transform="rotate(15 50 50)"/>
  <use href="#cDot" transform="rotate(45 50 50)"/>
  <use href="#cDot" transform="rotate(75 50 50)"/>
  <use href="#cDot" transform="rotate(105 50 50)"/>
  <use href="#cDot" transform="rotate(135 50 50)"/>
  <use href="#cDot" transform="rotate(165 50 50)"/>
  <use href="#cDot" transform="rotate(195 50 50)"/>
  <use href="#cDot" transform="rotate(225 50 50)"/>
  <use href="#cDot" transform="rotate(255 50 50)"/>
  <use href="#cDot" transform="rotate(285 50 50)"/>
  <use href="#cDot" transform="rotate(315 50 50)"/>
  <use href="#cDot" transform="rotate(345 50 50)"/>

  <!-- центральный медальон -->
  <circle cx="50" cy="50" r="24.8" fill="none" stroke="#5f636c" stroke-width="1.2"
          stroke-linecap="round" stroke-dasharray="0.1 2.6"/>
  <circle cx="50" cy="50" r="22" fill="url(#cFace)" stroke="#767a84" stroke-width="1"/>
  <circle cx="50" cy="50" r="19.8" fill="none" stroke="#fff" stroke-width=".6" opacity=".7"/>

  <!-- буква V: тень, подсветка, основной слой -->
  <g font-family="'Playfair Display', Georgia, serif" font-weight="700"
     font-size="35" text-anchor="middle">
    <text x="50.9" y="62.9" fill="#4b4f58" opacity=".75">V</text>
    <text x="49.3" y="61.2" fill="#ffffff" opacity=".95">V</text>
    <text x="50" y="62" fill="url(#cV)" stroke="#6a6e78" stroke-width=".5">V</text>
  </g>

  <!-- блик -->
  <g clip-path="url(#cClip)">
    <ellipse cx="36" cy="28" rx="26" ry="15" fill="url(#cGloss)"
             transform="rotate(-28 36 28)"/>
  </g>
</svg>`;

const coin = document.createElement("div");
coin.className = "coin";
coin.innerHTML = COIN_SVG;
scratchCard.appendChild(coin);

let coinX = null;
let coinTilt = -12;

function moveCoin(event, pressed) {

    if (scratchDone || !coinFound) {
        coin.classList.remove("visible");
        return;
    }

    const p = getPoint(event);

    /* наклон зависит от движения вправо и влево */

    if (coinX !== null) {
        const target = -12 + (p.x - coinX) * 1.4;
        coinTilt += (Math.max(-35, Math.min(15, target)) - coinTilt) * 0.35;
    }

    coinX = p.x;

    coin.style.left = p.x + "px";
    coin.style.top = p.y + "px";
    coin.style.transform =
        "translate(-50%, -50%) rotate(" + coinTilt.toFixed(1) + "deg) scale(" +
        (pressed ? 0.94 : 1.06) + ")";

    coin.classList.add("visible");
    coin.classList.toggle("down", pressed);
}

scratchCanvas.addEventListener("pointerenter", (e) => moveCoin(e, false));
scratchCanvas.addEventListener("pointermove",  (e) => moveCoin(e, scratching));
scratchCanvas.addEventListener("pointerdown",  (e) => moveCoin(e, true));
scratchCanvas.addEventListener("pointerup",    (e) => moveCoin(e, false));

scratchCanvas.addEventListener("pointerleave", () => {
    coin.classList.remove("visible", "down");
    coinX = null;
});

scratchCanvas.addEventListener("pointercancel", () => {
    coin.classList.remove("visible", "down");
    coinX = null;
});

/* ЦВЕТКИ ПОД КНОПКАМИ */

function buildFlower(n, w) {

    /* округлый лепесток: w задаёт ширину */
    const d =
        "M100 100 C" + (100 - w) + " 92 " + (96 - w) + " 58 100 34 " +
        "C" + (104 + w) + " 58 " + (100 + w) + " 92 100 100Z";

    let petals = "";

    /* три слоя: большие, средние со сдвигом, маленькие */
    const layers = [
        { off: 0,   s: 1,    k: 0 },
        { off: 0.5, s: 0.72, k: 2 },
        { off: 0,   s: 0.44, k: 4 }
    ];

    layers.forEach((layer) => {
        for (let i = 0; i < n; i++) {
            const a = (360 / n) * (i + layer.off);
            petals += '<path class="petal" style="--a:' + a + 'deg;--i:' +
                      (i + layer.k) + ';--s:' + layer.s + '" d="' + d + '"/>';
        }
    });

    /* тычинки вокруг сердцевины */
    let dots = "";
    for (let i = 0; i < 10; i++) {
        const a = (Math.PI * 2 / 10) * i;
        dots += '<circle class="stamen" cx="' + (100 + Math.cos(a) * 13).toFixed(1) +
                '" cy="' + (100 + Math.sin(a) * 13).toFixed(1) + '" r="1.6"/>';
    }

    /* абстрактные дуги вокруг цветка */
    let lines = "";
    let k = 0;

    for (let r = 0; r < 360; r += 72) {
        lines += '<path pathLength="1" style="--i:' + (k++) + '" transform="rotate(' + r +
                 ' 100 100)" d="M100 20 A80 80 0 0 1 146 32"/>';
    }

    for (let r = 36; r < 360; r += 72) {
        lines += '<path pathLength="1" style="--i:' + (k++) + '" transform="rotate(' + r +
                 ' 100 100)" d="M100 8 A92 92 0 0 1 134 14"/>';
    }

    return (
        '<svg class="card-flower" viewBox="0 0 200 200" aria-hidden="true">' +
            '<g class="flower-lines">' + lines + '</g>' +
            petals +
            '<circle class="core" cx="100" cy="100" r="9"/>' +
            '<g class="stamens">' + dots + '</g>' +
        '</svg>'
    );
}

const flowerSettings = {
    why:   [8, 17],    /* 8 округлых лепестков */
    how:   [6, 26],    /* 6 широких, как у мака */
    final: [12, 12]    /* 12 узких, как у хризантемы */
};

document.querySelectorAll(".topic-card").forEach((card) => {

    const s = flowerSettings[card.dataset.topic] || [8, 16];

    card.insertAdjacentHTML("afterbegin", buildFlower(s[0], s[1]));
});
/* ЦВЕТОК, ЛИНИИ И ЛИНИИ ПОД ПИСЬМОМ: серебро, заострённые концы */

(function () {

    document.querySelectorAll(".bg-flower, .read-lines").forEach(function (e) { e.remove(); });

    var NS = "http://www.w3.org/2000/svg";
    var envelopeEl = document.getElementById("envelope");
    var messageEl  = document.getElementById("message");

    /* подпись в конце письма */

    var heartEl = document.querySelector(".message-box .message-heart");
    if (heartEl) heartEl.textContent = "Твой Тимоша";


    /* ---------- помощники ---------- */

    function mk(tag, attrs) {
        var el = document.createElementNS(NS, tag);
        for (var k in attrs) el.setAttribute(k, attrs[k]);
        return el;
    }

    function rng(seed) {
        return function () {
            seed |= 0;
            seed = (seed + 0x6D2B79F5) | 0;
            var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    function clamp(x, a, b) { return Math.min(b, Math.max(a, x)); }

    function bez(a, b, c, d, t) {
        var u = 1 - t;
        return [
            u*u*u*a[0] + 3*u*u*t*b[0] + 3*u*t*t*c[0] + t*t*t*d[0],
            u*u*u*a[1] + 3*u*u*t*b[1] + 3*u*t*t*c[1] + t*t*t*d[1]
        ];
    }

    function grad(id, attrs, stops) {
        var g = mk("linearGradient", attrs);
        g.setAttribute("id", id);
        stops.forEach(function (s) {
            g.appendChild(mk("stop", {
                offset: s[0],
                "stop-color": s[1],
                "stop-opacity": s[2] === undefined ? 1 : s[2]
            }));
        });
        return g;
    }

    /* линия-«игла»: тонкая у корня, самая широкая ближе к началу и
       плавно заостряется к кончику; s = какая часть кривой уже выросла */

    function taper(P0, P1, P2, P3, s, W, N) {

        if (s < 0.004) return "";

        var pts = [], i;
        for (i = 0; i <= N; i++) pts.push(bez(P0, P1, P2, P3, s * i / N));

        var L = [], R = [];

        for (i = 0; i <= N; i++) {

            var a = pts[i > 0 ? i - 1 : 0];
            var b = pts[i < N ? i + 1 : N];
            var dx = b[0] - a[0], dy = b[1] - a[1];
            var len = Math.hypot(dx, dy) || 1;

            var u = i / N;
            var w = W * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.65)), 0.9) / 2;

            var nx = -dy / len * w, ny = dx / len * w;

            L.push((pts[i][0] + nx).toFixed(1) + " " + (pts[i][1] + ny).toFixed(1));
            R.push((pts[i][0] - nx).toFixed(1) + " " + (pts[i][1] - ny).toFixed(1));
        }

        return "M" + L.join("L") + "L" + R.reverse().join("L") + "Z";
    }

    /* полосы серебра: блик, тень, блик, тень */

    var SILVER = [
        [0,    "#ffffff"],
        [0.22, "#b9bec9"],
        [0.45, "#f4f5f8"],
        [0.7,  "#858a96"],
        [1,    "#e6e8ed"]
    ];

    function silverGrad(id) {
        return grad(id, {
            gradientUnits: "userSpaceOnUse",
            x1: 0, y1: 0, x2: 360, y2: 0,
            spreadMethod: "reflect"
        }, SILVER);
    }


    /* ---------- каркас: линии ПОД цветком ---------- */

    var root = document.createElement("div");
    root.className = "bg-flower";
    root.style.cssText =
        "position:fixed;left:0;top:0;width:100%;height:100%;" +
        "z-index:-1;pointer-events:none;overflow:hidden;";

    var linesSvg = mk("svg", {});
    linesSvg.style.cssText = "position:absolute;left:0;top:0;z-index:1;overflow:visible;";

    var lineGrad = silverGrad("bgfLine");
    var linesDefs = mk("defs", {});
    linesDefs.appendChild(lineGrad);
    linesSvg.appendChild(linesDefs);

    var bloom = document.createElement("div");
    bloom.style.cssText = "position:absolute;z-index:2;";

    root.appendChild(linesSvg);
    root.appendChild(bloom);
    document.body.appendChild(root);


    /* ---------- цветок (серебро) ---------- */

    var bloomSvg = mk("svg", { viewBox: "0 0 300 300" });
    bloomSvg.style.cssText = "width:100%;height:100%;overflow:visible;";

    var bDefs = mk("defs", {});

    bDefs.appendChild(grad("bgfFill",
        { gradientUnits: "userSpaceOnUse", x1: 0, y1: 0, x2: 300, y2: 300 },
        [
            [0,    "#ffffff", 0.40],
            [0.3,  "#a9afbb", 0.20],
            [0.55, "#ffffff", 0.44],
            [0.8,  "#7a7f8b", 0.22],
            [1,    "#e4e7ee", 0.34]
        ]));

    bDefs.appendChild(grad("bgfStroke",
        { gradientUnits: "userSpaceOnUse", x1: 0, y1: 0, x2: 300, y2: 300 },
        [
            [0,    "#ffffff"],
            [0.3,  "#9ba0ac"],
            [0.55, "#ffffff"],
            [0.8,  "#7a7f8b"],
            [1,    "#eceef2"]
        ]));

    var coreGrad = mk("radialGradient", { id: "bgfCore", cx: "35%", cy: "30%", r: "75%" });
    [[0, "#ffffff"], [0.5, "#d4d7de"], [1, "#8c909c"]].forEach(function (s) {
        coreGrad.appendChild(mk("stop", { offset: s[0], "stop-color": s[1] }));
    });
    bDefs.appendChild(coreGrad);

    bloomSvg.appendChild(bDefs);

    var spin = mk("g", {});
    bloomSvg.appendChild(spin);
    bloom.appendChild(bloomSvg);

    var D = "M150 150 C128 138 124 84 150 40 C176 84 172 138 150 150Z";

    function petal(width) {
        return mk("path", {
            d: D,
            fill: "url(#bgfFill)",
            stroke: "url(#bgfStroke)",
            "stroke-width": width,
            "stroke-opacity": 0.9
        });
    }

    /* крупные лепестки: появляются при открытии конверта, лежат позади основных */

    var bigLayers = [
        { n: 12, off: 0.25, s: 1.65 },
        { n: 12, off: 0.75, s: 1.35 }
    ];

    var bigPetals = [];

    bigLayers.forEach(function (layer) {
        for (var i = 0; i < layer.n; i++) {
            var el = petal(1);
            el.style.visibility = "hidden";
            spin.appendChild(el);
            bigPetals.push({ el: el, a: (360 / layer.n) * (i + layer.off), s: layer.s });
        }
    });

    /* основные лепестки: раскрываются от прокрутки */

    var layers = [
        { n: 12, off: 0,   s: 1    },
        { n: 12, off: 0.5, s: 0.78 },
        { n: 12, off: 0,   s: 0.55 },
        { n: 12, off: 0.5, s: 0.32 }
    ];

    var petals = [];

    layers.forEach(function (layer) {
        for (var i = 0; i < layer.n; i++) {
            var el = petal(0.9);
            spin.appendChild(el);
            petals.push({ el: el, a: (360 / layer.n) * (i + layer.off), s: layer.s });
        }
    });

    var core = mk("circle", {
        cx: 150, cy: 150, r: 8,
        fill: "url(#bgfCore)",
        stroke: "#f2f3f6", "stroke-width": 0.8
    });
    spin.appendChild(core);

    var boost = 0;
    var petalBoost = 0;
    var boostTarget = 0;
    var angle = 0;

    function ease(x) { return x * x * (3 - 2 * x); }

    function setBloom(p) {

        var k = 0.2 + 0.8 * p;   /* круглый бутон 20% -> полный цветок */

        petals.forEach(function (pt) {
            pt.el.setAttribute(
                "transform",
                "rotate(" + pt.a.toFixed(2) + " 150 150) " +
                "translate(150 150) scale(" + (pt.s * k).toFixed(3) + ") translate(-150 -150)"
            );
        });

        var g = ease(Math.min(1, petalBoost));

        bigPetals.forEach(function (pt) {
            pt.el.setAttribute(
                "transform",
                "rotate(" + pt.a.toFixed(2) + " 150 150) " +
                "translate(150 150) scale(" + (pt.s * k * (0.15 + 0.85 * g)).toFixed(3) + ") translate(-150 -150)"
            );
            pt.el.style.opacity = g.toFixed(3);
            pt.el.style.visibility = g > 0.01 ? "visible" : "hidden";
        });

        spin.setAttribute("transform", "rotate(" + angle.toFixed(2) + " 150 150)");

        core.setAttribute("r", (7 + 9 * p).toFixed(2));

        bloom.style.opacity = (0.22 + p * 0.22 + boost * 0.16).toFixed(3);
        bloom.style.transform = "scale(" + (1 + boost * 0.07).toFixed(4) + ")";
        bloom.style.filter = boost < 0.01
            ? "none"
            : "drop-shadow(0 0 " + (boost * 26).toFixed(1) +
              "px rgba(228,233,248," + (boost * 0.85).toFixed(2) + "))";
    }


    /* ---------- линии на весь экран из центра цветка ---------- */

    var lineData = [];

    function layout() {

        var W = window.innerWidth;
        var H = window.innerHeight;
        var mobile = W <= 480;

        var S = mobile ? Math.max(520, H * 0.75) : Math.max(760, Math.min(1100, H * 1.15));
        var cx = S * 0.2;
        var cy = H / 2;

        bloom.style.width = S + "px";
        bloom.style.height = S + "px";
        bloom.style.left = (cx - S / 2) + "px";
        bloom.style.top = (cy - S / 2) + "px";

        linesSvg.setAttribute("width", W);
        linesSvg.setAttribute("height", H);
        linesSvg.setAttribute("viewBox", "0 0 " + W + " " + H);

        lineData.forEach(function (l) { l.el.remove(); });
        lineData = [];

        var rand = rng(20260);
        var Lmax = Math.hypot(W, H);
        var COUNT = mobile ? 22 : 30;

        for (var i = 0; i < COUNT; i++) {

            var a = rand() < 0.8
                ? (rand() - 0.5) * Math.PI * 1.7
                : rand() * Math.PI * 2;

            var L = Lmax * (0.55 + rand() * 0.6);
            var bend = (rand() - 0.5) * 1.5;

            var pt = function (k, ang) {
                return [cx + Math.cos(ang) * L * k, cy + Math.sin(ang) * L * k];
            };

            var path = mk("path", { fill: "url(#bgfLine)" });
            path.style.visibility = "hidden";
            path.style.opacity = (0.4 + rand() * 0.45).toFixed(2);
            linesSvg.appendChild(path);

            lineData.push({
                el: path,
                P0: [cx, cy],
                P1: pt(0.3, a - bend),
                P2: pt(0.7, a + bend),
                P3: pt(1, a + bend * 0.5),
                W: 1.5 + rand() * 1.9,
                delay: rand() * 0.45,
                s: -1
            });
        }
    }


    /* ---------- линии из-под письма: чем дольше чтение, тем дальше ---------- */

    var rdSvg = null;
    var rdGrad = null;
    var rdLines = [];
    var readT = 0;
    var wasReading = false;

        function buildRead() {

        if (!messageEl) return;

        if (rdSvg) rdSvg.remove();
        rdLines = [];

        var W = window.innerWidth;
        var H = window.innerHeight;

        rdSvg = mk("svg", { "class": "read-lines", width: W, height: H, viewBox: "0 0 " + W + " " + H });
        rdSvg.style.cssText =
            "position:fixed;left:0;top:0;width:" + W + "px;height:" + H + "px;" +
            "pointer-events:none;z-index:0;overflow:visible;";

        rdGrad = silverGrad("rdLine");
        var defs = mk("defs", {});
        defs.appendChild(rdGrad);
        rdSvg.appendChild(defs);

        messageEl.insertBefore(rdSvg, messageEl.firstChild);

        var box = messageEl.querySelector(".message-box");
        var bw = box ? box.offsetWidth : Math.min(700, W - 40);
        var bh = box ? box.offsetHeight : 420;

        var cx = W / 2, cy = H / 2;
        var rand = rng(777);
        var COUNT = W <= 480 ? 20 : 28;

        for (var i = 0; i < COUNT; i++) {

            var a = ((i + (rand() - 0.5) * 0.7) / COUNT) * Math.PI * 2;
            var ca = Math.cos(a), sa = Math.sin(a);

            /* расстояние от центра до края письма и до края экрана по этому направлению */

            var edge = Math.min(
                bw / 2 / Math.max(0.001, Math.abs(ca)),
                bh / 2 / Math.max(0.001, Math.abs(sa))
            );
            var toScreen = Math.min(
                W / 2 / Math.max(0.001, Math.abs(ca)),
                H / 2 / Math.max(0.001, Math.abs(sa))
            );

            edge = Math.min(edge, toScreen * 0.85);

            /* длина линии: дорастает до края экрана */
            var L = Math.max(toScreen * 1.1, edge * 1.5);

            /* все линии начинаются точно в центре письма */
            var P0 = [cx, cy];
            var nx = -sa, ny = ca;

            /* изгибы сильнее, чем раньше */
            var b1 = (rand() - 0.5) * 0.50;
            var b2 = (rand() - 0.5) * 0.62;
            var b3 = (rand() - 0.5) * 0.52;

            var path = mk("path", { fill: "url(#rdLine)" });
            path.style.opacity = (0.32 + rand() * 0.38).toFixed(2);   /* еле заметные */
            rdSvg.appendChild(path);

            rdLines.push({
                el: path,
                P0: P0,
                P1: [cx + ca * L * 0.33 + nx * L * b1, cy + sa * L * 0.33 + ny * L * b1],
                P2: [cx + ca * L * 0.66 + nx * L * b2, cy + sa * L * 0.66 + ny * L * b2],
                P3: [cx + ca * L        + nx * L * b3, cy + sa * L        + ny * L * b3],
                L: L,
                e: edge,
                W: 1.4 + rand() * 1.6,
                delay: rand() * 2,
                speed: 0.75 + rand() * 0.6,
                g: -1
            });
        }
    }

    function updateRead() {

        rdLines.forEach(function (l) {

            var t = readT - l.delay;

            /* кончик линии: стартует у самого края письма и дальше ползёт всё медленнее,
               но не останавливается (чем дольше чтение, тем дальше) */

            var x = t > 0 ? t / (20 / l.speed) : 0;
            var f = Math.sqrt(x / (1 + x));

            var d0 = l.e * 0.78;
            var g = (d0 + (l.L * 0.96 - d0) * f) / l.L;

            if (Math.abs(g - l.g) < 0.0007) return;
            l.g = g;

            l.el.setAttribute("d", taper(l.P0, l.P1, l.P2, l.P3, g, l.W, 28));
        });
    }


    /* ---------- прогресс по прокрутке ---------- */

    var target = 0;
    var now = 0;
    var shimmer = 0;
    var lastTs = 0;

    function readScroll() {

        var se = document.scrollingElement || document.documentElement;
        var y = Math.max(window.pageYOffset || 0, se.scrollTop || 0, document.body.scrollTop || 0);

        var full = Math.max(se.scrollHeight || 0, document.body.scrollHeight || 0);
        var max = full - window.innerHeight;

        /* полностью раскрыт на 70% страницы */
        target = max > 0 ? Math.min(1, Math.max(0, y / (max * 0.7))) : 0;
    }

    function frame(ts) {

        var dt = lastTs ? clamp((ts - lastTs) / 1000, 0, 0.25) : 0;
        lastTs = ts;

        readScroll();

        boostTarget = envelopeEl && envelopeEl.classList.contains("open") ? 1 : 0;

        now += (target - now) * 0.07;
        boost += (boostTarget - boost) * 0.04;
        var K = 0.8;
        petalBoost += (boostTarget - petalBoost) * (1 - Math.exp(-dt * K));
        angle += 0.03;

        /* блики на серебре медленно бегут по линиям */

        shimmer += dt * 16;
        var gt = "rotate(35) translate(" + shimmer.toFixed(1) + " 0)";
        lineGrad.setAttribute("gradientTransform", gt);
        if (rdGrad) rdGrad.setAttribute("gradientTransform", gt);

        setBloom(now);

        linesSvg.style.opacity = (0.85 + boost * 0.15).toFixed(3);
        linesSvg.style.filter = boost < 0.01
            ? "none"
            : "drop-shadow(0 0 " + (boost * 6).toFixed(1) +
              "px rgba(228,233,248," + (boost * 0.9).toFixed(2) + "))";

        lineData.forEach(function (l) {

            var s = clamp((now - l.delay) / 0.55, 0, 1);

            if (Math.abs(s - l.s) < 0.0015) return;
            l.s = s;

            if (s < 0.004) {
                l.el.style.visibility = "hidden";
            } else {
                l.el.setAttribute("d", taper(l.P0, l.P1, l.P2, l.P3, s, l.W, 32));
                l.el.style.visibility = "visible";
            }
        });

        /* чтение: пока открыто письмо, копим время */

        var reading = !!messageEl &&
            messageEl.classList.contains("show") &&
            !messageEl.classList.contains("leaving");

        if (reading && !wasReading) buildRead();   /* размеры письма уже известны */
        wasReading = reading;

        if (reading) readT += dt;
        updateRead();

        requestAnimationFrame(frame);
    }

    window.addEventListener("resize", function () {
        layout();
        if (rdSvg) buildRead();
    });

    layout();
    buildRead();
    setBloom(0);
    requestAnimationFrame(frame);

})();
/* ПЕЧАТЬ СНИМАЕТСЯ С ПИСЬМА + ВОЗВРАТ НАЗАД ПО ШАГАМ */

(function () {

    function $(id) { return document.getElementById(id); }

    var envelopeEl = $("envelope");
    var letterEl   = $("letter");
    var messageEl  = $("message");
    var hubEl      = $("hub");
    var topicEl    = $("topic");
    var backBtn    = $("backButton");
    var card       = $("scratchCard");
    var canvasEl   = $("scratchCanvas");
    var stage      = $("scratchStage");
    var finalBtn   = $("finalCard");

    var seal = envelopeEl ? envelopeEl.querySelector(".heart-seal") : null;

    function has(el, cls) { return !!el && el.classList.contains(cls); }


    /* ===== 1. ПЕЧАТЬ = ИНСТРУМЕНТ ДЛЯ СТИРАНИЯ ===== */

    var TOOL_SVG =
        '<svg viewBox="0 0 100 100" width="64" height="64" xmlns="http://www.w3.org/2000/svg">' +
        '<defs>' +
        '<radialGradient id="sealToolGrad" cx="30%" cy="25%" r="85%">' +
        '<stop offset="0" stop-color="#ffffff"/>' +
        '<stop offset=".35" stop-color="#eeeef2"/>' +
        '<stop offset=".68" stop-color="#c8c8d0"/>' +
        '<stop offset="1" stop-color="#9d9da8"/>' +
        '</radialGradient>' +
        '</defs>' +
        '<circle cx="50" cy="50" r="47" fill="url(#sealToolGrad)" stroke="#ffffff" stroke-width="2"/>' +
        '<circle cx="50" cy="50" r="39" fill="none" stroke="#7d7d89" stroke-width="1" opacity=".45"/>' +
        '<path d="M50 71 C22 53 16 36 29 28 C38 23 46 27 50 35 C54 27 62 23 71 28 C84 36 78 53 50 71Z" ' +
        'fill="#8b2945" stroke="#6e1e36" stroke-width="1"/>' +
        '<ellipse cx="37" cy="27" rx="17" ry="9" fill="#ffffff" opacity=".35" transform="rotate(-28 37 27)"/>' +
        '</svg>';

    if (typeof coin !== "undefined" && coin) {
        coin.innerHTML = TOOL_SVG;
    }


    /* ===== 2. ПОДСКАЗКА И ТРЯСКА В СТИРАШКЕ, ЕСЛИ ПЕЧАТЬ НЕ ВЗЯТА ===== */

    var needCoin = document.createElement("p");
    needCoin.className = "need-coin";
    needCoin.textContent = "Нечем стирать... Вернись назад ♡";

    var hint = stage ? stage.querySelector(".scratch-hint") : null;
    if (hint) hint.after(needCoin);

    function syncTool() {
        if (card) card.classList.toggle("has-coin", !!coinFound);
        needCoin.classList.toggle("hidden", !!coinFound);
    }

    syncTool();

    if (finalBtn) finalBtn.addEventListener("click", syncTool);

    if (canvasEl && card) {
        canvasEl.addEventListener("pointerdown", function () {
            if (coinFound) return;
            card.classList.remove("shake");
            void card.offsetWidth;
            card.classList.add("shake");
        });
    }


    /* ===== 3. ПЕЧАТЬ МОЖНО ВЗЯТЬ ===== */

    var taken = false;

    function takeSeal(event) {

        event.stopPropagation();   /* клик по печати не должен закрывать конверт */

        if (taken || !has(envelopeEl, "open")) return;
        taken = true;

        var r = seal.getBoundingClientRect();

        /* печать переезжает в body, чтобы жить на всех экранах */

        document.body.appendChild(seal);

        seal.style.left = (r.left + r.width / 2) + "px";
        seal.style.top  = (r.top + r.height / 2) + "px";
        seal.classList.add("seal-held");

        void seal.offsetWidth;

        /* летит в правый верхний угол */

        seal.style.left = "calc(100% - 38px)";
        seal.style.top  = "38px";
        seal.classList.add("stored");

        coinFound = true;
        syncTool();

        var note = document.createElement("div");
        note.className = "seal-note";
        note.textContent = "печать у тебя ♡";
        document.body.appendChild(note);
        setTimeout(function () { note.remove(); }, 4600);
    }

    if (seal) seal.addEventListener("click", takeSeal);


    /* ===== 4. ВОЗВРАТ НАЗАД ПО ШАГАМ ===== */

    var navBack = document.createElement("button");
    navBack.type = "button";
    navBack.className = "nav-back";
    navBack.setAttribute("aria-label", "Назад");

    var navArrow = document.createElement("span");
    navArrow.textContent = "←";
    var navLabel = document.createElement("em");
    navLabel.textContent = "назад";

    navBack.appendChild(navArrow);
    navBack.appendChild(navLabel);
    document.body.appendChild(navBack);

    /* 0 первый экран, 1 конверт, 2 письмо, 3 выбор тем, 4 страница темы */

    function level() {
        if (has(topicEl, "show")) return 4;
        if (has(hubEl, "show")) return 3;
        if (has(messageEl, "show") && !has(messageEl, "leaving")) return 2;
        var y = window.pageYOffset || document.documentElement.scrollTop || 0;
        return y > 80 ? 1 : 0;
    }

    function update() {
        var l = level();
        navBack.classList.toggle("show", l >= 1 && l <= 3);
        navLabel.textContent = l === 1 ? "наверх" : "назад";
    }

    var locked = false;

    function goBack() {

        if (locked) return;

        var l = level();
        if (l === 0) return;

        /* идёт переход письма к выбору тем */
        if (has(messageEl, "leaving") && !has(hubEl, "show")) return;

        locked = true;
        setTimeout(function () { locked = false; }, 900);

        if (l === 4) {

            /* закрывает тему так же, как кнопка «← Назад» на карточке */
            if (backBtn) backBtn.click();

        } else if (l === 3) {

            /* выбор тем -> письмо */
            hubEl.classList.remove("show");
            messageEl.classList.remove("leaving");

        } else if (l === 2) {

            /* письмо -> конверт */
            messageEl.classList.remove("show");
            if (letterEl) letterEl.classList.remove("reading");
            document.documentElement.style.overflow = "";

        } else {

            /* конверт -> первый экран */
            window.scrollTo({ top: 0, behavior: "smooth" });
        }

        update();
    }

    navBack.addEventListener("click", goBack);

    /* Esc делает то же самое (старый обработчик Esc можно не трогать) */

    document.addEventListener("keydown", function (event) {
        if (event.key !== "Escape") return;
        if (level() < 2) return;
        event.stopImmediatePropagation();
        goBack();
    }, true);

    window.addEventListener("scroll", update, { passive: true });
    setInterval(update, 150);
    update();


})();
/* ===== 2. ЧАСТИЦЫ НА ЭКРАНЕ «ЧТО ТЕБЕ РАССКАЗАТЬ» ===== */

(function () {

    var hub = document.getElementById("hub");
    if (!hub) return;

    var cv = document.createElement("canvas");
    cv.className = "hub-sparks";
    hub.insertBefore(cv, hub.firstChild);

    var c = cv.getContext("2d");
    var W = 0, H = 0, parts = [];

    function size() {
        var dpr = Math.min(2, window.devicePixelRatio || 1);
        W = window.innerWidth;
        H = window.innerHeight;
        cv.width = W * dpr;
        cv.height = H * dpr;
        cv.style.width = W + "px";
        cv.style.height = H + "px";
        c.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function make(initial) {
        return {
            x: Math.random() * W,
            y: initial ? Math.random() * H : H + 20,
            r: 0.8 + Math.random() * 2.2,
            vy: 0.15 + Math.random() * 0.4,
            sway: Math.random() * 6.28,
            sp: 0.004 + Math.random() * 0.01,
            amp: 10 + Math.random() * 30,
            tw: Math.random() * 6.28,
            petal: Math.random() < 0.25,
            rot: Math.random() * 6.28,
            vr: (Math.random() - 0.5) * 0.012
        };
    }

    size();

    var N = window.innerWidth <= 480 ? 22 : 50;
    for (var i = 0; i < N; i++) parts.push(make(true));

    window.addEventListener("resize", size);

    function frame() {

        requestAnimationFrame(frame);

        if (!hub.classList.contains("show")) return;   /* работает только на этом экране */

        c.clearRect(0, 0, W, H);

        parts.forEach(function (p, idx) {

            p.y -= p.vy;
            p.sway += p.sp;
            p.tw += 0.03;
            p.rot += p.vr;

            if (p.y < -20) {
                parts[idx] = p = make(false);
            }

            var x = p.x + Math.sin(p.sway) * p.amp;
            var fade = Math.max(0, Math.min(1, p.y / (H * 0.2)));
            var a = (0.25 + 0.45 * (0.5 + 0.5 * Math.sin(p.tw))) * fade;

            c.globalAlpha = a;
            c.fillStyle = "#eef0f6";
            c.shadowColor = "rgba(230,235,250,0.9)";
            c.shadowBlur = 7;

            if (p.petal) {
                c.save();
                c.translate(x, p.y);
                c.rotate(p.rot);
                c.scale(1, 0.42);
                c.beginPath();
                c.arc(0, 0, p.r * 2.6, 0, 6.2832);
                c.fill();
                c.restore();
            } else {
                c.beginPath();
                c.arc(x, p.y, p.r, 0, 6.2832);
                c.fill();
            }
        });

        c.globalAlpha = 1;
        c.shadowBlur = 0;
    }

    frame();

})();


/* ===== 3. ОТТИСКИ ПЕЧАТИ НА ПЛАШКАХ ===== */

(function () {

    var back = document.getElementById("backButton");

    var STAMP =
        '<svg viewBox="0 0 100 100" width="44" height="44" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="50" cy="50" r="46" fill="#e6e8ee" stroke="#ffffff" stroke-width="3"/>' +
        '<circle cx="50" cy="50" r="38" fill="none" stroke="#9a9eaa" stroke-width="1.5"/>' +
        '<path d="M50 71 C22 53 16 36 29 28 C38 23 46 27 50 35 C54 27 62 23 71 28 C84 36 78 53 50 71Z" ' +
        'fill="#8b2945" stroke="#6e1e36" stroke-width="1"/>' +
        '</svg>';

    var pending = [];

    document.querySelectorAll(".topic-card").forEach(function (card) {
        card.addEventListener("click", function () {
            if (!card.querySelector(".card-stamp") && pending.indexOf(card) < 0) pending.push(card);
        });
    });

    /* оттиск ставится, когда она вернулась к выбору тем и видит плашки */

    if (back) {
        back.addEventListener("click", function () {
            setTimeout(function () {
                pending.splice(0).forEach(function (card) {
                    if (card.querySelector(".card-stamp")) return;
                    var s = document.createElement("div");
                    s.className = "card-stamp";
                    s.innerHTML = STAMP;
                    card.appendChild(s);
                });
            }, 750);
        });
    }

})();
/* ===== 1. МУЗЫКА ===== */

(function () {

    var MUSIC_URL = "детка.mp3";   /* свой трек: например "music.mp3" (положи рядом с index.html); пусто = мелодия создаётся сама */
    var VOLUME = 0.22;

    var AC = window.AudioContext || window.webkitAudioContext;
    var ctx = null, master = null, audioEl = null;
    var started = false, muted = false, timer = null;

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "music-btn";
    btn.setAttribute("aria-label", "Музыка");
    btn.innerHTML = "<span>♪</span>";
    document.body.appendChild(btn);

    var CHORDS = [
        [110, 164.8, 261.6, 392],
        [87.3, 130.8, 220, 329.6],
        [130.8, 196, 329.6, 493.9],
        [98, 146.8, 246.9, 370]
    ];
    var PENT = [659, 784, 880, 988, 1175, 1318];
    var ci = 0;

    function pad(freq, t0, dur) {
        [-4, 4].forEach(function (det) {
            var o = ctx.createOscillator();
            var g = ctx.createGain();
            o.type = "sine";
            o.frequency.value = freq;
            o.detune.value = det;
            g.gain.setValueAtTime(0, t0);
            g.gain.linearRampToValueAtTime(0.12, t0 + 2.5);
            g.gain.linearRampToValueAtTime(0, t0 + dur);
            o.connect(g);
            g.connect(master);
            o.start(t0);
            o.stop(t0 + dur + 0.1);
        });
    }

    function bell(freq, t0) {
        var o = ctx.createOscillator();
        var g = ctx.createGain();
        o.type = "sine";
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(0.3, t0 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 3.2);
        o.connect(g);
        g.connect(master);
        o.start(t0);
        o.stop(t0 + 3.3);
    }

    function chordLoop() {
        var t = ctx.currentTime + 0.1;
        var ch = CHORDS[ci % CHORDS.length];
        ci++;
        ch.forEach(function (f, i) { pad(f, t + i * 0.15, 9.5); });
        for (var k = 0; k < 3; k++) {
            bell(PENT[Math.floor(Math.random() * PENT.length)], t + 2 + k * 2.2 + Math.random() * 0.8);
        }
        timer = setTimeout(chordLoop, 8000);
    }

    function start() {

        if (started) return;
        started = true;

        btn.classList.add("on");

        if (MUSIC_URL) {
            audioEl = new Audio(MUSIC_URL);
            audioEl.loop = true;
            audioEl.volume = 0;
            audioEl.play().catch(function () {});
            var v = 0;
            var fade = setInterval(function () {
                v = Math.min(VOLUME * 2.2, v + 0.02);
                if (audioEl && !muted) audioEl.volume = v;
                if (v >= VOLUME * 2.2) clearInterval(fade);
            }, 120);
            return;
        }

        if (!AC) return;

        ctx = new AC();
        if (ctx.resume) ctx.resume();

        master = ctx.createGain();
        master.gain.value = 0;

        var lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 1800;

        master.connect(lp);
        lp.connect(ctx.destination);

        master.gain.linearRampToValueAtTime(VOLUME, ctx.currentTime + 4);   /* плавно нарастает */

        chordLoop();
    }

    function toggle() {

        muted = !muted;
        btn.classList.toggle("off", muted);

        if (master) master.gain.setTargetAtTime(muted ? 0 : VOLUME, ctx.currentTime, 0.4);
        if (audioEl) audioEl.volume = muted ? 0 : VOLUME * 2.2;
    }

    btn.addEventListener("click", function () {
        if (!started) { start(); return; }
        toggle();
    });

    /* браузер разрешает звук только после касания: стартуем с первого клика на странице */

    function firstGesture() {
        start();
        ["click", "touchend", "keydown"].forEach(function (n) {
            document.removeEventListener(n, firstGesture, true);
        });
    }

    ["click", "touchend", "keydown"].forEach(function (n) {
        document.addEventListener(n, firstGesture, true);
    });

    /* не играть, когда вкладка скрыта */

    document.addEventListener("visibilitychange", function () {
        if (!ctx) return;
        if (document.hidden) ctx.suspend(); else ctx.resume();
    });

})();
/* ВЕНЗЕЛЯ (серебро) + ТАЙМЕР ДО ДНЯ РОЖДЕНИЯ */

(function () {

    /* общий серебряный градиент для всех вензелей */

    document.body.insertAdjacentHTML("beforeend",
        '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>' +
        '<linearGradient id="ornSilver" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100" y2="100" spreadMethod="reflect">' +
        '<stop offset="0" stop-color="#ffffff"/>' +
        '<stop offset=".3" stop-color="#aeb3be"/>' +
        '<stop offset=".55" stop-color="#f4f5f8"/>' +
        '<stop offset=".8" stop-color="#868b97"/>' +
        '<stop offset="1" stop-color="#e6e8ed"/>' +
        '</linearGradient></defs></svg>');

    var ornGrad = document.getElementById("ornSilver");

    function corner(pos) {
        return '<svg class="orn orn-corner ' + pos + '" viewBox="0 0 100 100" aria-hidden="true">' +
            '<g class="orn-lines" fill="none" stroke="url(#ornSilver)" stroke-width="1.6" stroke-linecap="round">' +
            '<path pathLength="1" d="M6 78 C6 36 36 6 78 6"/>' +
            '<path pathLength="1" d="M16 66 C16 38 38 16 66 16"/>' +
            '<path pathLength="1" d="M78 6 C92 6 96 20 86 24 C78 27 72 19 79 15"/>' +
            '<path pathLength="1" d="M6 78 C6 92 20 96 24 86 C27 78 19 72 15 79"/>' +
            '<path pathLength="1" d="M31 31 C39 21 49 23 47 31 C45 38 37 36 39 30"/>' +
            '</g>' +
            '<g class="orn-fill" fill="url(#ornSilver)">' +
            '<circle cx="9" cy="9" r="3.2"/><circle cx="58" cy="8" r="1.8"/><circle cx="8" cy="58" r="1.8"/>' +
            '</g></svg>';
    }

    function mid(cls) {
        return '<svg class="orn orn-mid ' + cls + '" viewBox="0 0 200 40" aria-hidden="true">' +
            '<g class="orn-lines" fill="none" stroke="url(#ornSilver)" stroke-width="1.5" stroke-linecap="round">' +
            '<path pathLength="1" d="M4 20 C30 20 40 6 62 6 C80 6 84 20 100 20"/>' +
            '<path pathLength="1" d="M196 20 C170 20 160 6 138 6 C120 6 116 20 100 20"/>' +
            '<path pathLength="1" d="M62 6 C54 6 52 16 59 17 C64 17 65 11 61 10"/>' +
            '<path pathLength="1" d="M138 6 C146 6 148 16 141 17 C136 17 135 11 139 10"/>' +
            '</g>' +
            '<g class="orn-fill" fill="url(#ornSilver)">' +
            '<path d="M100 11 L106 20 L100 29 L94 20Z"/><circle cx="12" cy="20" r="2"/><circle cx="188" cy="20" r="2"/>' +
            '</g></svg>';
    }

    function frame(el, withMids) {
        if (!el) return;
        el.insertAdjacentHTML("beforeend",
            corner("tl") + corner("tr") + corner("bl") + corner("br") +
            (withMids ? mid("top") + mid("bottom") : ""));
    }

    /* письмо */
    frame(document.querySelector(".message-box"), true);

    /* плашка «Поздравляю!» на экране тем */
    frame(document.getElementById("finalCard"), true);

    /* торжественная страница поздравления */
    var fc = document.getElementById("finalContent");
    if (fc) {
        frame(fc, false);
        fc.classList.add("grand");
        var h = fc.querySelector("h2");
        if (h) h.insertAdjacentHTML("afterend", mid("inline"));
        fc.insertAdjacentHTML("beforeend", mid("inline"));
    }

    /* блики бегут по серебру */

    var t0 = Date.now();
    function shimmer() {
        var s = ((Date.now() - t0) / 1000) * 10;
        if (ornGrad) ornGrad.setAttribute("gradientTransform", "translate(" + s.toFixed(1) + " " + s.toFixed(1) + ")");
        requestAnimationFrame(shimmer);
    }
    shimmer();


        /* ===== ТАЙМЕР ДО ДНЯ РОЖДЕНИЯ: появляется после стирашки ===== */

    var target = new Date(2026, 9, 12, 0, 0, 0).getTime();   /* месяц считается с нуля: 9 = октябрь */

    if (!fc) return;

    var wrap = document.createElement("div");
    wrap.className = "countdown";
    wrap.innerHTML = '<p class="countdown-title">до твоего дня рождения</p><div class="countdown-row"></div>';

    var warn = fc.querySelector(".warning");
    if (warn) fc.insertBefore(wrap, warn); else fc.appendChild(wrap);

    var row = wrap.querySelector(".countdown-row");
    var title = wrap.querySelector(".countdown-title");

    function plural(n, f) {
        var a = Math.abs(n) % 100, b = a % 10;
        if (a > 10 && a < 20) return f[2];
        if (b > 1 && b < 5) return f[1];
        if (b === 1) return f[0];
        return f[2];
    }

    function pad(n) { return n < 10 ? "0" + n : "" + n; }

    function tick() {

        var left = target - Date.now();

        if (left <= 0) {
            title.textContent = "С днём рождения";
            row.innerHTML = '<span class="cd-final">♡</span>';
            return false;
        }

        var s = Math.floor(left / 1000);
        var d = Math.floor(s / 86400); s -= d * 86400;
        var hh = Math.floor(s / 3600); s -= hh * 3600;
        var m = Math.floor(s / 60); s -= m * 60;

        var parts = [
            [d,  ["день", "дня", "дней"]],
            [hh, ["час", "часа", "часов"]],
            [m,  ["минута", "минуты", "минут"]],
            [s,  ["секунда", "секунды", "секунд"]]
        ];

        row.innerHTML = parts.map(function (p, i) {
            return '<div class="cd-box"><span class="cd-num">' + (i === 0 ? p[0] : pad(p[0])) +
                   '</span><span class="cd-label">' + plural(p[0], p[1]) + '</span></div>';
        }).join("");

        return true;
    }

    if (tick()) {
        var iv = setInterval(function () { if (!tick()) clearInterval(iv); }, 1000);
    }

})();