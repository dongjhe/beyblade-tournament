(() => {
  const style = document.createElement('style');
  style.textContent = `
    .battle-side .launch-fail-btn {
      background: linear-gradient(135deg,#373b86,#5651a6) !important;
      border: 2px solid #8b72ff !important;
      color: #fff !important;
      -webkit-text-fill-color: #fff !important;
      box-shadow: 0 0 12px rgba(139,114,255,.30) !important;
    }
    .battle-side .launch-fail-btn:hover {
      background: linear-gradient(135deg,#45499a,#665fc0) !important;
      border-color: #a18cff !important;
    }
    .battle-side .launch-fail-btn.has-fail {
      background: linear-gradient(135deg,#4d45a3,#7060cf) !important;
      border-color: #b09cff !important;
      box-shadow: 0 0 15px rgba(155,128,255,.48) !important;
    }
    .battle-side .launch-fail-btn .fail-marks i {
      border-color: #cbd9e3 !important;
      background: transparent !important;
    }
    .battle-side .launch-fail-btn .fail-marks i.on {
      border-color: #d8ccff !important;
      background: #d8ccff !important;
      box-shadow: 0 0 8px rgba(216,204,255,.75) !important;
    }
  `;
  document.head.appendChild(style);
})();
