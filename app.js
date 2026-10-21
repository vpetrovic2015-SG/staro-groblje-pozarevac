// Структура интерфејса — за сада без повезивања базе и правих функција.
document.addEventListener('DOMContentLoaded', () => {
  const menuButton = document.querySelector('.mobile-menu');
  const nav = document.querySelector('.main-nav');
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => nav.classList.toggle('open'));
  }

  // Избор језичког писма је визуелни костур. Право пресловљавање додајемо
  // након што повежемо каталог и проверимо сва текстуална поља.
  document.querySelectorAll('.lang').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.lang').forEach(item => item.classList.remove('active'));
      button.classList.add('active');
    });
  });

  // Табови и контроле су намерно само визуелни у овој фази.
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(item => item.classList.remove('active'));
      tab.classList.add('active');
    });
  });
});
