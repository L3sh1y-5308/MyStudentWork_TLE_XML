import { menuButton } from "./elements.js";

const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

function openMenu() {
  if (!sidebar || !overlay) return;
  sidebar.classList.add("open");
  overlay.classList.add("show");
  overlay.hidden = false;
  sidebar.setAttribute("aria-hidden", "false");
  menuButton.setAttribute("aria-expanded", "true");
  menuButton.classList.add("change");
  document.body.classList.add("menu-open");
  document.body.style.overflow = "hidden";
  sidebar.focus();
}

function closeMenu() {
  if (!sidebar || !overlay) return;
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
  sidebar.setAttribute("aria-hidden", "true");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.classList.remove("change");
  document.body.classList.remove("menu-open");
  document.body.style.overflow = "";
  menuButton.focus();
  setTimeout(() => { overlay.hidden = true; }, 200);
}

function toggleMenu() {
  if (!sidebar || !overlay) {
    menuButton.classList.toggle("change");
    document.body.classList.toggle("menu-open");
    return;
  }

  const isOpen = sidebar.classList.contains("open");
  if (isOpen) {
    closeMenu();
  } else {
    openMenu();
  }
}

export function initMenuToggle() {
  menuButton.addEventListener("click", toggleMenu);
  if (overlay) {
    overlay.addEventListener("click", closeMenu);
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
}
