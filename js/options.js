const trigger = document.querySelector('#switchToDefaults');

const overlay = document.querySelector('#overlay');
const okBtn = document.querySelector('#modal__ok');
const cancelBtn = document.querySelector('#modal__cancel');
const exitBtn = document.querySelector('#modal__exit');

function showModal() {
  overlay.style.top = `${window.scrollY}px`;
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function hideModal() {
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

trigger.addEventListener('click', showModal);

okBtn.addEventListener('click', () => {
  // JSON.stringify
  hideModal();
});

cancelBtn.addEventListener('click', hideModal);

exitBtn.addEventListener('click', hideModal);

document.addEventListener('keydown', (e) => {
  if (e.key == "Escape")
    hideModal();
})

