// Elemen utama
const wrapper  = document.querySelector(".wrapper");
const yesBtn   = document.querySelector(".yes-btn");
const noBtn    = document.querySelector(".no-btn");
const question = document.querySelector(".question");
const gif      = document.querySelector(".gif");

let step = 0;

// ===== Inject CSS minimal untuk shake + highlight agar self-contained =====
(function injectAuxStyles() {
  const css = `
    @keyframes js-shake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-4px); }
      40%, 80% { transform: translateX(4px); }
    }
    .js-shake { animation: js-shake 0.4s; }
    .js-active {
      box-shadow: 0 0 14px rgba(255,255,255,0.85), 0 0 24px rgba(233,77,88,0.6) !important;
      transform: translateY(-1px) scale(1.05);
    }
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);
})();

// ===== Util: transisi GIF halus (fade out -> ganti -> fade in) =====
function changeGifWithTransition(newSrc) {
  const prevTransition = gif.style.transition;
  gif.style.transition = "opacity 0.35s ease";
  gif.style.opacity = "0";
  const swap = () => {
    gif.removeEventListener("transitionend", swap);
    const onLoad = () => {
      gif.removeEventListener("load", onLoad);
      requestAnimationFrame(() => {
        gif.style.opacity = "1";
        // reset transition setelah selesai
        setTimeout(() => { gif.style.transition = prevTransition || ""; }, 400);
      });
    };
    gif.addEventListener("load", onLoad);
    gif.src = newSrc;
  };
  gif.addEventListener("transitionend", swap);
}

// ===== Util: efek getar singkat =====
function shakeElement(el) {
  el.classList.add("js-shake");
  el.addEventListener("animationend", () => el.classList.remove("js-shake"), { once: true });
}

// ===== Highlight tombol aktif via JS (hover/focus) =====
function enableActiveHighlight(btn) {
  btn.addEventListener("mouseenter", () => btn.classList.add("js-active"));
  btn.addEventListener("mouseleave", () => btn.classList.remove("js-active"));
  btn.addEventListener("focus",     () => btn.classList.add("js-active"));
  btn.addEventListener("blur",      () => btn.classList.remove("js-active"));
}
enableActiveHighlight(yesBtn);
enableActiveHighlight(noBtn);

// ===== Logika tombol Y (step-based) + animasi =====
yesBtn.addEventListener("click", () => {
  shakeElement(yesBtn);
  if (step === 0) {
    question.innerHTML = "Maapin ga siii";
    changeGifWithTransition("https://www.bing.com/th/id/OGC.1bc5898975dd3d9c557c4b9813fd2adb?pid=1.7&rurl=https%3a%2f%2fi.pinimg.com%2foriginals%2f1b%2fc5%2f89%2f1bc5898975dd3d9c557c4b9813fd2adb.gif&ehk=TeY72nXKGYu8Zfy6zG2oS7kf4Lg6b86pWI6dyrlWljQ%3d");
    step++;
  } else if (step === 1) {
    question.innerHTML = "✨ Gacorr :D ✨";
    changeGifWithTransition("https://media1.giphy.com/media/iCVzZwwE6QNAV2tEE0/giphy.gif");
    yesBtn.style.display = "none";
    noBtn.style.display = "none";
    step++;
  }
});

// ===== Promosikan G ke absolute sekali agar bisa bebas di wrapper =====
function promoteNoBtnToAbsoluteIfNeeded() {
  if (noBtn.classList.contains("moving")) return;
  const wRect = wrapper.getBoundingClientRect();
  const bRect = noBtn.getBoundingClientRect();
  const left = bRect.left - wRect.left;
  const top  = bRect.top  - wRect.top;
  noBtn.classList.add("moving");
  noBtn.style.right  = "auto";
  noBtn.style.bottom = "auto";
  noBtn.style.left   = `${left}px`;
  noBtn.style.top    = `${top}px`;
}

// ===== Helper: cek overlap dua rect =====
function overlaps(ax, ay, aw, ah, bx, by, bw, bh) {
  return !(ax + aw < bx || ax > bx + bw || ay + ah < by || ay > by + bh);
}

// ===== Helper: clamp =====
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

// ===== G kabur saat di-hover, hindari GIF & Y =====
noBtn.addEventListener("mouseover", () => {
  shakeElement(noBtn);
  promoteNoBtnToAbsoluteIfNeeded();

  const padding = 12; // jarak aman dari tepi
  const w = wrapper.clientWidth;
  const h = wrapper.clientHeight;
  const bw = noBtn.offsetWidth;
  const bh = noBtn.offsetHeight;

  const wRect = wrapper.getBoundingClientRect();

  // Rect Y relatif wrapper
  const yRectAbs = yesBtn.getBoundingClientRect();
  const yRect = {
    x: yRectAbs.left - wRect.left,
    y: yRectAbs.top  - wRect.top,
    w: yRectAbs.width,
    h: yRectAbs.height
  };

  // Rect GIF relatif wrapper
  const gRectAbs = gif.getBoundingClientRect();
  const gifRect = {
    x: gRectAbs.left - wRect.left,
    y: gRectAbs.top  - wRect.top,
    w: gRectAbs.width,
    h: gRectAbs.height
  };

  // Perluas sedikit zona terlarang agar tidak "mepet"
  const inflate = 6;
  const yX = yRect.x - inflate,           yY = yRect.y - inflate,
        yW = yRect.w + inflate * 2,      yH = yRect.h + inflate * 2;
  const gifX = gifRect.x - inflate,       gifY = gifRect.y - inflate,
        gifW = gifRect.w + inflate * 2,  gifH = gifRect.h + inflate * 2;

  const minX = padding;
  const minY = padding;
  const maxX = w - bw - padding;
  const maxY = h - bh - padding;

  let x, y;
  let safe = false;
  let attempts = 80;

  while (attempts-- > 0 && !safe) {
    x = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
    y = Math.floor(Math.random() * (maxY - minY + 1)) + minY;

    const hitY   = overlaps(x, y, bw, bh, yX,  yY,  yW,  yH);
    const hitGIF = overlaps(x, y, bw, bh, gifX, gifY, gifW, gifH);

    safe = !(hitY || hitGIF);
  }

  // Fallback: jika belum dapat posisi aman, "dorong" menjauh dari area konflik
  if (!safe) {
    // Ambil posisi sekarang sebagai basis
    const curLeft = parseFloat(noBtn.style.left) || 0;
    const curTop  = parseFloat(noBtn.style.top)  || 0;
    x = curLeft;
    y = curTop;

    // Jika nabrak GIF, dorong ke sisi terdekat yang aman
    if (overlaps(x, y, bw, bh, gifX, gifY, gifW, gifH)) {
      const centerBtnX = x + bw / 2;
      const centerBtnY = y + bh / 2;
      const centerGifX = gifX + gifW / 2;
      const centerGifY = gifY + gifH / 2;

      if (Math.abs(centerBtnX - centerGifX) > Math.abs(centerBtnY - centerGifY)) {
        // Dorong horizontal
        x = centerBtnX < centerGifX ? gifX - bw - padding : gifX + gifW + padding;
      } else {
        // Dorong vertikal
        y = centerBtnY < centerGifY ? gifY - bh - padding : gifY + gifH + padding;
      }
    }

    // Jika nabrak Y, dorong juga
    if (overlaps(x, y, bw, bh, yX, yY, yW, yH)) {
      const centerBtnX = x + bw / 2;
      const centerBtnY = y + bh / 2;
      const centerYX   = yX + yW / 2;
      const centerYY   = yY + yH / 2;

      if (Math.abs(centerBtnX - centerYX) > Math.abs(centerBtnY - centerYY)) {
        x = centerBtnX < centerYX ? yX - bw - padding : yX + yW + padding;
      } else {
        y = centerBtnY < centerYY ? yY - bh - padding : yY + yH + padding;
      }
    }

    // Clamp ke batas arena
    x = clamp(x, minX, maxX);
    y = clamp(y, minY, maxY);
  }

  noBtn.style.left = `${x}px`;
  noBtn.style.top  = `${y}px`;
});

// Opsional: klik G juga getar
noBtn.addEventListener("click", () => shakeElement(noBtn));
