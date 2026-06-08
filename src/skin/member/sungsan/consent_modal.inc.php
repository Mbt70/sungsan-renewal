<!-- HTML -->
<?php if (!defined('_GNUBOARD_')) exit; ?>
<dialog id="consentDialog" aria-labelledby="consentDialogTitle" aria-describedby="consentDialogBody">
  <form method="dialog" class="cd-card">
    <header class="cd-head">
      <h3 id="consentDialogTitle" class="cd-title">안내</h3>
    </header>
    <div id="consentDialogBody" class="cd-body"></div>
    <footer class="cd-actions">
      <button type="button" class="cd-agree">동의합니다</button>
      <button value="close" class="cd-close">닫기</button>
    </footer>
  </form>
</dialog>

<!-- JS -->
<script>
(function(){
  const dlg = document.getElementById('consentDialog');
  if (!dlg) return;

  const body   = document.getElementById('consentDialogBody');
  const titleE = document.getElementById('consentDialogTitle');
  let opener   = null;
  const isSafeSelector = (selector, prefix) =>
    typeof selector === 'string'
    && selector.startsWith(prefix)
    && !selector.includes(',')
    && /^[#.][A-Za-z0-9_-]+$/.test(selector);

  const openFrom = (btn) => {
    opener = btn;
    const tplSel = btn.getAttribute('data-template');
    const title  = btn.getAttribute('data-title') || '안내';
    const tpl    = isSafeSelector(tplSel, '#tpl_') ? document.querySelector(tplSel) : null;

    titleE.textContent = title;
    body.innerHTML     = tpl ? tpl.innerHTML : '';

    dlg.dataset.check      = btn.getAttribute('data-check') || '';
    dlg.dataset.checkGroup = btn.getAttribute('data-check-group') || '';

    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open','');
  };

  const closeDialog = () => {
    if (dlg.close) dlg.close(); else dlg.removeAttribute('open');
    if (opener) opener.focus();
  };

  document.addEventListener('click', (e)=>{
    const trigger = e.target.closest('.js-open-consent');
    if (trigger) { openFrom(trigger); return; }

    if (e.target.classList.contains('cd-agree')) {
      const checkSel = isSafeSelector(dlg.dataset.check, '#reg_') ? dlg.dataset.check : '';
      const groupSel = isSafeSelector(dlg.dataset.checkGroup, '.') ? dlg.dataset.checkGroup : '';

      if (groupSel) {
        document.querySelectorAll(groupSel).forEach(cb => {
          cb.checked = true;
          cb.dispatchEvent(new Event('change', {bubbles:true}));
        });
      }
      if (checkSel) {
        const cb = document.querySelector(checkSel);
        if (cb) { cb.checked = true; cb.dispatchEvent(new Event('change', {bubbles:true})); }
      }
      closeDialog();
      e.preventDefault();
      return;
    }
  });

  dlg.addEventListener('cancel', (e)=>{ e.preventDefault(); closeDialog(); });
})();
</script>
