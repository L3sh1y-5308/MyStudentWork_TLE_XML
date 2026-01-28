const menuBtn = document.getElementById('menuButton');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const subsToggle = document.getElementById('subsToggle');
const subsMore = document.getElementById('subsMore');

function openMenu() {
  sidebar.classList.add('open');
  overlay.classList.add('show');
  overlay.hidden = false;
  sidebar.setAttribute('aria-hidden', 'false');
  menuBtn.setAttribute('aria-expanded', 'true');
  // Блокируем прокрутку страницы
  document.body.style.overflow = 'hidden';
  // Переносим фокус в меню
  sidebar.focus();
}

function closeMenu() {
  sidebar.classList.remove('open');
  overlay.classList.remove('show');
  // Возвращаем атрибуты
  sidebar.setAttribute('aria-hidden', 'true');
  menuBtn.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
  // Возвращаем фокус на кнопку
  menuBtn.focus();
  // Прячем overlay после анимации
  setTimeout(() => { overlay.hidden = true; }, 200);
}

function toggleMenu() {
  const isOpen = sidebar.classList.contains('open');
  if (isOpen) closeMenu();
  else openMenu();
}

menuBtn.addEventListener('click', toggleMenu);
overlay.addEventListener('click', closeMenu);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMenu();
});

// Disclosure: показать/скрыть дополнительный список
subsToggle.addEventListener('click', () => {
  const expanded = subsToggle.getAttribute('aria-expanded') === 'true';
  subsToggle.setAttribute('aria-expanded', String(!expanded));
  subsMore.hidden = expanded; // если было раскрыто — скрыть
});