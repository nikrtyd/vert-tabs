const openDlgBtn = document.getElementById('switchToDefaults');
const dlg = document.getElementById('switchToDefaultsDlg');
const outputBox = document.querySelector('output');
const confirmBtn = dlg.querySelector('#confirmBtn');

// If a browser doesn't support the dialog, then hide the
// dialog contents by default.
if (typeof dlg.showModal !== 'function') {
  dlg.hidden = true;
  /* a fallback script to allow this dialog/form to function
     for legacy browsers that do not support <dialog>
     could be provided here.
  */
}
// "Update details" button opens the <dialog> modally
openDlgBtn.addEventListener('click', function onOpen() {
  if (typeof dlg.showModal === "function") {
    dlg.showModal();
  } else {
    outputBox.value = "Sorry, the <dialog> API is not supported by this browser.";
  }
});
// "Confirm" button of form triggers "close" on dialog because of [method="dialog"]
dlg.addEventListener('close', function onClose() {
  outputBox.value = dlg.returnValue + " button clicked - " + (new Date()).toString();
});
