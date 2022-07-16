const trigger = document.querySelector('#switchToDefaults');
const overlay = document.querySelector('#overlay');
const svgCloseBtnPath = document.querySelector('#modal__exit path');

const showModal = function () {
  overlay.style.top = `${window.scrollY}px`;
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

const hideModal = function () {
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

trigger.addEventListener('click', showModal);

document.addEventListener('mouseover', (e) => {
  if (e.target.id === 'overlay')
    svgCloseBtnPath.style.fill = 'var(--tab-text)';
  else
    svgCloseBtnPath.style.fill = '';
});

document.addEventListener('click', (e) => {
  if (e.target.id === 'overlay' || e.target.id === 'modal__cancel' || e.target.id === 'modal__exit')
    hideModal();
  if (e.target.id === 'modal__ok')
    // JSON.stringify
    hideModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key == 'Escape')
    hideModal();
});

