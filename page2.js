(function () {
  'use strict';

  const INITIAL_RAM = 16;
  const DAYS_LEFT = 274;
  const DAYS_PASSED = 91;
  const DAYS_PER_YEAR = 365;
  const PRICE_PER_16GB_YEAR = 12000;

  const ramSlider = document.getElementById('ram-upgrade');
  const ramValueEl = document.getElementById('ram-upgrade-value');
  const ramDeltaLabel = document.getElementById('ram-delta-label');
  const ramDeltaValue = document.getElementById('ram-delta-value');
  const btnShowCheckout = document.getElementById('btn-show-checkout');
  const currentRamEl = document.getElementById('current-ram');
  const checkoutModal = document.getElementById('checkout-modal');
  const checkoutDays = document.getElementById('checkout-days');
  const checkoutDaysLabel = document.getElementById('checkout-days-label');
  const tableRamOld = document.getElementById('table-ram-old');
  const tableRamNew = document.getElementById('table-ram-new');
  const eqPriceOption = document.getElementById('eq-price-option');
  const eqPaidRemainder = document.getElementById('eq-paid-remainder');
  const eqRamDesc = document.getElementById('eq-ram-desc');
  const eqDaysUsed = document.getElementById('eq-days-used');
  const checkoutTotalValue = document.getElementById('checkout-total-value');
  const btnCheckoutCancel = document.getElementById('btn-checkout-cancel');
  const btnCheckoutConfirm = document.getElementById('btn-checkout-confirm');

  function formatPrice(x) {
    return Math.round(x).toLocaleString('ru-RU');
  }

  function getDeltaPerYear(newRam) {
    if (newRam <= INITIAL_RAM) return 0;
    return ((newRam - INITIAL_RAM) / 16) * PRICE_PER_16GB_YEAR;
  }

  function getPaidRemainder(newRam) {
    var deltaYear = getDeltaPerYear(newRam);
    return Math.round(deltaYear * (DAYS_PASSED / DAYS_PER_YEAR));
  }

  function getProratedDelta(newRam) {
    var deltaYear = getDeltaPerYear(newRam);
    return Math.round(deltaYear * (DAYS_LEFT / DAYS_PER_YEAR));
  }

  function updateUI() {
    var ram = Number(ramSlider.value);
    ramValueEl.textContent = ram;

    if (ram > INITIAL_RAM) {
      var deltaYear = getDeltaPerYear(ram);
      ramDeltaValue.textContent = '+' + formatPrice(deltaYear);
      ramDeltaLabel.hidden = false;
      btnShowCheckout.disabled = false;
    } else {
      ramDeltaLabel.hidden = true;
      btnShowCheckout.disabled = true;
    }
  }

  function openCheckout() {
    var newRam = Number(ramSlider.value);
    var priceOption = getDeltaPerYear(newRam);
    var paidRem = getPaidRemainder(newRam);
    var prorated = getProratedDelta(newRam);
    var ramDelta = newRam - INITIAL_RAM;

    checkoutDays.textContent = DAYS_LEFT;
    checkoutDaysLabel.textContent = DAYS_LEFT;
    tableRamOld.textContent = INITIAL_RAM;
    tableRamNew.textContent = newRam;
    if (eqRamDesc) eqRamDesc.textContent = '(+' + ramDelta + ' ГБ RAM за год)';
    if (eqPriceOption) eqPriceOption.textContent = formatPrice(priceOption) + ' ₽';
    if (eqPaidRemainder) eqPaidRemainder.textContent = '− ' + formatPrice(paidRem) + ' ₽';
    if (eqDaysUsed) eqDaysUsed.textContent = '(' + DAYS_PASSED + ' дн. уже прошло)';
    checkoutTotalValue.textContent = formatPrice(prorated) + ' ₽';

    checkoutModal.classList.add('is-open');
    checkoutModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeCheckout() {
    checkoutModal.classList.remove('is-open');
    checkoutModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (ramSlider) {
    ramSlider.addEventListener('input', updateUI);
  }

  if (btnShowCheckout) {
    btnShowCheckout.addEventListener('click', openCheckout);
  }

  if (btnCheckoutCancel) {
    btnCheckoutCancel.addEventListener('click', closeCheckout);
  }

  if (btnCheckoutConfirm) {
    btnCheckoutConfirm.addEventListener('click', function () {
      var newRam = Number(ramSlider.value);
      closeCheckout();
      if (currentRamEl) currentRamEl.textContent = newRam;
      alert('Конфигурация применена. Мощность увеличена до ' + newRam + ' ГБ RAM. Дата окончания подписки прежняя.');
    });
  }

  if (checkoutModal) {
    checkoutModal.addEventListener('click', function (e) {
      if (e.target === checkoutModal) closeCheckout();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && checkoutModal && checkoutModal.classList.contains('is-open')) {
      closeCheckout();
    }
  });

  updateUI();
})();
