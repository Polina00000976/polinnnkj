(function () {
  'use strict';

  const DISCOUNT_PERCENT = 0.32;
  const HOURS_PER_YEAR = 8760;
  const baseYearlyFull = 118800;

  const elements = {
    region: document.getElementById('region'),
    tabShared: document.querySelector('[data-tab="shared"]'),
    tabDedicated: document.querySelector('[data-tab="dedicated"]'),
    vcpuOptions: document.getElementById('vcpu-options'),
    vcpuValue: document.getElementById('vcpu-value'),
    ram: document.getElementById('ram'),
    ramValue: document.getElementById('ram-value'),
    diskType: document.getElementById('disk-type'),
    diskSize: document.getElementById('disk-size'),
    diskValue: document.getElementById('disk-value'),
    publicIp: document.getElementById('public-ip'),
    bandwidth: document.getElementById('bandwidth'),
    backups: document.getElementById('backups'),
    ddos: document.getElementById('ddos'),
    billingTabs: document.querySelectorAll('.billing-tab'),
    panelHour: document.getElementById('panel-hour'),
    panelMonth: document.getElementById('panel-month'),
    panelYear: document.getElementById('panel-year'),
    priceMainHourly: document.getElementById('price-main-hourly'),
    priceMainMonthly: document.getElementById('price-main-monthly'),
    btnAmountMonthly: document.getElementById('btn-amount-monthly'),
    priceMainYearly: document.getElementById('price-main-yearly'),
    priceMonthEquivalent: document.getElementById('price-month-equivalent'),
    priceOldYearlyVal: document.getElementById('price-old-yearly-val'),
    priceOldYearly: document.getElementById('price-old-yearly'),
    btnPayAmount: document.getElementById('btn-pay-amount'),
    modalOverlay: document.getElementById('modal-overlay'),
    modalConfig: document.getElementById('modal-config'),
    modalPeriod: document.getElementById('modal-period'),
    modalDiscount: document.getElementById('modal-discount'),
    modalAgree: document.getElementById('modal-agree'),
    btnModalCancel: document.getElementById('btn-modal-cancel'),
    btnModalConfirm: document.getElementById('btn-modal-confirm'),
  };

  let billingPeriod = 'yearly';

  function getConfig() {
    const vcpu = Number(document.querySelector('.option-btn--active[data-value]')?.dataset.value || 8);
    const ram = Number(elements.ram.value);
    const diskSize = Number(elements.diskSize.value);
    const diskType = elements.diskType.value;
    const hasIp = elements.publicIp.checked;
    const hasBackups = elements.backups.checked;
    const hasDdos = elements.ddos.checked;
    const isDedicated = document.querySelector('.tab--active[data-tab="dedicated"]') != null;
    return { vcpu, ram, diskSize, diskType, hasIp, hasBackups, hasDdos, isDedicated };
  }

  function getMultiplier(config) {
    const base = { vcpu: 8, ram: 32, diskSize: 512, diskType: 'nvme' };
    const diskMult = { nvme: 1.2, ssd: 1, hdd: 0.7 };
    let m = 1;
    m *= config.vcpu / base.vcpu;
    m *= config.ram / base.ram;
    m *= config.diskSize / base.diskSize;
    m *= (diskMult[config.diskType] || 1) / diskMult[base.diskType];
    if (config.hasIp) m *= 1.05;
    if (config.hasBackups) m *= 1.08;
    if (config.hasDdos) m *= 1.15;
    if (!config.isDedicated) m *= 0.7;
    return m;
  }

  function formatPrice(x) {
    return Math.round(x).toLocaleString('ru-RU');
  }

  function formatPriceDecimal(x) {
    return x.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  }

  function recalcPrices() {
    const config = getConfig();
    const mult = getMultiplier(config);
    const yearlyFull = Math.round(baseYearlyFull * mult);
    const yearlyDiscounted = Math.round(yearlyFull * (1 - DISCOUNT_PERCENT));
    const monthlyFull = Math.round(yearlyFull / 12);
    const hourly = yearlyFull / HOURS_PER_YEAR;
    const monthEquiv = Math.round(yearlyDiscounted / 12);
    const discountAmount = yearlyFull - yearlyDiscounted;
    return {
      yearlyFull,
      yearlyDiscounted,
      monthlyFull,
      hourly,
      monthEquiv,
      discountAmount,
    };
  }

  function setActivePanel(period) {
    billingPeriod = period;
    [elements.panelHour, elements.panelMonth, elements.panelYear].forEach(function (panel) {
      if (panel) panel.hidden = panel.dataset.period !== period;
    });
    elements.billingTabs.forEach(function (btn) {
      var isActive = btn.dataset.period === period;
      btn.classList.toggle('billing-tab--active', isActive);
      btn.setAttribute('aria-selected', isActive);
    });
  }

  function updateSummary(prices) {
    if (elements.priceMainHourly) elements.priceMainHourly.textContent = formatPriceDecimal(prices.hourly);
    if (elements.priceMainMonthly) elements.priceMainMonthly.textContent = formatPrice(prices.monthlyFull);
    if (elements.btnAmountMonthly) elements.btnAmountMonthly.textContent = formatPrice(prices.monthlyFull);
    if (elements.priceMainYearly) elements.priceMainYearly.textContent = formatPrice(prices.yearlyDiscounted);
    if (elements.priceMonthEquivalent) elements.priceMonthEquivalent.textContent = formatPrice(prices.monthEquiv);
    if (elements.priceOldYearlyVal) elements.priceOldYearlyVal.textContent = formatPrice(prices.yearlyFull);
    if (elements.btnPayAmount) elements.btnPayAmount.textContent = formatPrice(prices.yearlyDiscounted);
  }

  function getConfigName() {
    const c = getConfig();
    return 'Config-1 (' + c.vcpu + ' vCPU, ' + c.ram + ' RAM)';
  }

  function openModal(period) {
    const prices = recalcPrices();
    elements.modalConfig.textContent = getConfigName();
    var discountRow = document.getElementById('modal-discount-row');
    if (period === 'year') {
      elements.modalPeriod.textContent = '12 месяцев';
      elements.modalDiscount.textContent = '-' + formatPrice(prices.discountAmount) + ' ₽';
      if (discountRow) discountRow.hidden = false;
    } else if (period === 'month') {
      elements.modalPeriod.textContent = '1 месяц';
      if (discountRow) discountRow.hidden = true;
    } else {
      elements.modalPeriod.textContent = 'Почасовая оплата';
      if (discountRow) discountRow.hidden = true;
    }
    elements.modalAgree.checked = false;
    elements.btnModalConfirm.disabled = true;
    elements.modalOverlay.classList.add('is-open');
    elements.modalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    elements.modalOverlay.classList.remove('is-open');
    elements.modalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function onConfigChange() {
    updateSummary(recalcPrices());
  }

  if (elements.billingTabs && elements.billingTabs.length) {
    elements.billingTabs.forEach(function (btn) {
      btn.addEventListener('click', function () {
        setActivePanel(btn.dataset.period);
      });
    });
  }

  document.addEventListener('click', function (e) {
    var payBtn = e.target.closest('.btn-pay-action');
    if (!payBtn) return;
    e.preventDefault();
    var period = payBtn.dataset.period;
    openModal(period || 'year');
  });

  if (elements.ram) elements.ram.addEventListener('input', function () {
    elements.ramValue.textContent = elements.ram.value;
    onConfigChange();
  });

  if (elements.diskSize) elements.diskSize.addEventListener('input', function () {
    elements.diskValue.textContent = elements.diskSize.value;
    onConfigChange();
  });

  ['diskType', 'publicIp', 'bandwidth', 'backups', 'ddos'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('change', onConfigChange);
  });

  if (elements.vcpuOptions) elements.vcpuOptions.addEventListener('click', function (e) {
    var btn = e.target.closest('.option-btn[data-value]');
    if (!btn) return;
    elements.vcpuOptions.querySelectorAll('.option-btn').forEach(function (b) {
      b.classList.remove('option-btn--active');
    });
    btn.classList.add('option-btn--active');
    elements.vcpuValue.textContent = btn.dataset.value;
    onConfigChange();
  });

  if (elements.tabShared) elements.tabShared.addEventListener('click', function () {
    elements.tabShared.classList.add('tab--active');
    elements.tabShared.setAttribute('aria-selected', 'true');
    elements.tabDedicated.classList.remove('tab--active');
    elements.tabDedicated.setAttribute('aria-selected', 'false');
    document.querySelector('.tab-desc--shared').hidden = false;
    document.querySelector('.tab-desc--dedicated').hidden = true;
    onConfigChange();
  });

  if (elements.tabDedicated) elements.tabDedicated.addEventListener('click', function () {
    elements.tabDedicated.classList.add('tab--active');
    elements.tabDedicated.setAttribute('aria-selected', 'true');
    elements.tabShared.classList.remove('tab--active');
    elements.tabShared.setAttribute('aria-selected', 'false');
    document.querySelector('.tab-desc--dedicated').hidden = false;
    document.querySelector('.tab-desc--shared').hidden = true;
    onConfigChange();
  });

  if (elements.modalAgree) elements.modalAgree.addEventListener('change', function () {
    elements.btnModalConfirm.disabled = !elements.modalAgree.checked;
  });

  if (elements.btnModalCancel) elements.btnModalCancel.addEventListener('click', closeModal);
  if (elements.btnModalConfirm) elements.btnModalConfirm.addEventListener('click', function () {
    if (elements.modalAgree && elements.modalAgree.checked) {
      closeModal();
      alert('Заказ оформлен (демо).');
    }
  });

  if (elements.modalOverlay) elements.modalOverlay.addEventListener('click', function (e) {
    if (e.target === elements.modalOverlay) closeModal();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && elements.modalOverlay && elements.modalOverlay.classList.contains('is-open')) closeModal();
  });

  setActivePanel('year');
  updateSummary(recalcPrices());
})();
