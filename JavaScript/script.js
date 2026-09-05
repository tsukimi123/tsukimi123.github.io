const root = document.documentElement;
root.classList.add("has-js");

const header = document.querySelector("[data-header]");
const menuButton = document.querySelector(".menu-toggle");
const menuLabel = menuButton?.querySelector(".sr-only");
const navLinks = document.querySelectorAll(".site-nav a");

function setMenu(open) {
  if (!header || !menuButton) return;
  header.classList.toggle("is-open", open);
  if (open) header.classList.remove("is-hidden");
  menuButton.setAttribute("aria-expanded", String(open));
  if (menuLabel) menuLabel.textContent = open ? "關閉導覽選單" : "開啟導覽選單";
}

menuButton?.addEventListener("click", () => {
  setMenu(menuButton.getAttribute("aria-expanded") !== "true");
});

navLinks.forEach((link) => link.addEventListener("click", () => setMenu(false)));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuButton?.getAttribute("aria-expanded") === "true") {
    setMenu(false);
    menuButton.focus();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 760) setMenu(false);
  header?.classList.remove("is-hidden");
});

function updateScrollProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
  root.style.setProperty("--scroll-progress", Math.min(Math.max(progress, 0), 1));
}

let lastHeaderScrollY = window.scrollY;

function updateHeaderVisibility() {
  if (!header) return;

  const currentScrollY = Math.max(window.scrollY, 0);
  const delta = currentScrollY - lastHeaderScrollY;
  const menuOpen = header.classList.contains("is-open");

  if (currentScrollY <= 96 || menuOpen) {
    header.classList.remove("is-hidden");
    lastHeaderScrollY = currentScrollY;
    return;
  }

  if (delta > 8) {
    header.classList.add("is-hidden");
    lastHeaderScrollY = currentScrollY;
  } else if (delta < -8) {
    header.classList.remove("is-hidden");
    lastHeaderScrollY = currentScrollY;
  }
}

updateScrollProgress();
updateHeaderVisibility();
window.addEventListener("scroll", () => {
  updateScrollProgress();
  updateHeaderVisibility();
}, { passive: true });
window.addEventListener("resize", updateScrollProgress);

const ambientVideos = [...document.querySelectorAll("[data-ambient-video]")];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let ambientVideoObserver;

function pauseAmbientVideos(reset = false) {
  ambientVideos.forEach((video) => {
    video.pause();
    if (reset) video.currentTime = 0;
  });
}

function syncAmbientVideos() {
  ambientVideoObserver?.disconnect();
  pauseAmbientVideos(reducedMotion.matches);

  if (reducedMotion.matches || document.hidden) return;

  ambientVideoObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.play().catch(() => {});
      } else {
        entry.target.pause();
      }
    });
  }, { threshold: 0.2 });

  ambientVideos.forEach((video) => ambientVideoObserver.observe(video));
}

syncAmbientVideos();
reducedMotion.addEventListener("change", syncAmbientVideos);
document.addEventListener("visibilitychange", syncAmbientVideos);

document.querySelectorAll("[data-atlas-workbench]").forEach((atlas) => {
  const tabs = [...atlas.querySelectorAll("[data-atlas-tab]")];
  const panels = [...atlas.querySelectorAll("[data-atlas-panel]")];

  function selectAtlasPanel(selectedTab) {
    const key = selectedTab.dataset.atlasTab;

    tabs.forEach((tab) => {
      tab.setAttribute("aria-pressed", String(tab === selectedTab));
    });

    panels.forEach((panel) => {
      const active = panel.dataset.atlasPanel === key;
      panel.classList.toggle("is-active", active);
      panel.setAttribute("aria-hidden", String(!active));
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener("focus", () => selectAtlasPanel(tab));
    tab.addEventListener("click", () => selectAtlasPanel(tab));
  });
});

const workbench = document.querySelector("[data-code-workbench]");

if (workbench) {
  const tabs = [...workbench.querySelectorAll("[data-code-tab]")];
  const panels = [...workbench.querySelectorAll("[data-code-panel]")];

  function selectTab(selectedTab, moveFocus = false) {
    const key = selectedTab.dataset.codeTab;

    tabs.forEach((tab) => {
      const active = tab === selectedTab;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });

    panels.forEach((panel) => {
      panel.hidden = panel.dataset.codePanel !== key;
    });

    if (moveFocus) selectedTab.focus();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectTab(tab));
    tab.addEventListener("keydown", (event) => {
      let nextIndex = null;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = tabs.length - 1;
      if (nextIndex === null) return;
      event.preventDefault();
      selectTab(tabs[nextIndex], true);
    });
  });
}
