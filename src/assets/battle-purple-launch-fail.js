(() => {
  const style = document.createElement('style');
  style.textContent = `
    .battle-side.player-a .launch-fail-btn { background: linear-gradient(135deg,#092544,#0d4a78) !important; border-color: #20caff !important; }
    .battle-side.player-b .launch-fail-btn { background: linear-gradient(135deg,#32101d,#761d35) !important; border-color: #ff3c5c !important; }
    .battle-side.player-b .battle-name { background: linear-gradient(180deg,#f8fbfd,#d7e0e7) !important; color: #071421 !important; -webkit-text-fill-color: #071421 !important; border-color: #ff3658 !important; border-bottom-color: #ff3658 !important; text-shadow: 0 1px 0 #fff !important; }
    .battle-side .launch-fail-btn .fail-marks i {
      border-color: #cbd9e3 !important;
      background: transparent !important;
    }
    .battle-side .launch-fail-btn .fail-marks i.on {
      border-color: #fff0c2 !important;
      background: #ff9d00 !important;
      box-shadow: 0 0 8px rgba(255,157,0,.95), 0 0 18px rgba(255,157,0,.75) !important;
    }
    .battle-toolbar { grid-template-columns: minmax(0,1fr) minmax(0,1.25fr) minmax(0,1fr) !important; }
    .battle-toolbar-actions { grid-column: 3 !important; display: grid !important; grid-template-columns: minmax(0,1fr) 48px; gap: 10px; min-width: 0; }
    .toolbar-countdown { grid-column: 2 !important; }
    .swap-side-btn { grid-column: 1 !important; }
    .battle-toolbar-actions button { grid-column: auto !important; }
    .battle-side, .battle-side *, .score-versus, .score-versus * { direction: ltr !important; }
    .battle-side .battle-name, .battle-side .finish-btn, .score-versus .big-score, .score-versus small { transform: none !important; }
    .battle-side .finish-btn { direction: ltr !important; }
    .battle-side .finish-btn > span { order: 1 !important; }
    .battle-side .finish-btn > strong { order: 2 !important; }
    .battle-side.visual-right .finish-btn > span { order: 2 !important; text-align: right !important; align-items: flex-end !important; }
    .battle-side.visual-right .finish-btn > strong { order: 1 !important; }
    .draw-btn, .reset-btn { min-height: 58px !important; padding: 10px 16px !important; font-size: 18px !important; line-height: 1.2 !important; }
    .reset-btn { min-height: 58px !important; padding: 10px 16px !important; border: 0 !important; border-radius: 0 !important; background: linear-gradient(180deg,#ffc21a,#f07800) !important; color: #fff !important; -webkit-text-fill-color: #fff !important; box-shadow: inset 0 0 14px rgba(255,255,255,.35), 0 5px 14px rgba(0,0,0,.5), 0 0 16px rgba(255,166,0,.45) !important; clip-path: polygon(8% 0,92% 0,100% 50%,92% 100%,8% 100%,0 50%) !important; font-weight: 950 !important; }
    @media (max-width:760px) and (orientation:portrait) {
      .battle-toolbar { grid-template-columns: minmax(0,1fr) minmax(0,1.2fr) minmax(0,1fr) !important; }
      .battle-toolbar-actions { grid-column: 3 !important; grid-template-columns: minmax(0,1fr) 42px; gap: 6px; }
    }
    @media (orientation:landscape) and (max-height:700px) {
      .battle-toolbar { grid-template-columns: minmax(0,1fr) minmax(0,1.25fr) minmax(0,1fr) !important; }
      .battle-toolbar-actions { grid-column: 3 !important; grid-template-columns: minmax(0,1fr) 46px; }
      .battle-arena > .battle-toolbar { grid-template-columns: minmax(0,1fr) minmax(0,1.25fr) minmax(0,1fr) !important; }
      .battle-arena > .battle-toolbar .battle-toolbar-actions { grid-column: 3 !important; grid-template-columns: minmax(0,1fr) 46px; }
      .battle-center .battle-sub { display: none !important; }
      .battle-center .reset-btn { min-height: 36px !important; padding: 6px 12px !important; }
      .battle-arena { padding: 10px 16px 12px !important; row-gap: 8px !important; }
      .battle-side { gap: 5px !important; }
      .battle-name { min-height: 0 !important; font-size: 18px !important; padding: 7px 5px !important; }
      .finish-btn { min-height: 52px !important; padding: 6px 10px !important; }
      .finish-btn b, .finish-btn.xtreme b { font-size: 16px !important; }
      .finish-btn small { font-size: 9px !important; }
      .finish-btn strong { font-size: 20px !important; }
      .battle-side .launch-fail-btn { min-height: 48px !important; }
      .battle-round { font-size: 30px !important; }
      .big-score { height: 72px !important; font-size: 42px !important; }
      .score-versus { margin: 5px 0 !important; }
      .draw-btn, .reset-btn { min-height: 36px !important; padding: 6px 12px !important; font-size: 13px !important; line-height: 1.2 !important; }
      .battle-footer { min-height: 52px !important; padding: 7px 16px !important; }
    }
    @media (min-width:900px) and (orientation:landscape) {
      .battle-center .battle-sub { position: absolute !important; top: 18px !important; left: calc(50% + 40px) !important; margin: 0 !important; transform: none !important; }
    }
  `;
  document.head.appendChild(style);

  function groupToolbarActions() {
    document.querySelectorAll('.battle-toolbar').forEach(bar => {
      if (bar.querySelector('.battle-toolbar-actions')) return;
      const pause = bar.querySelector('.video-pause-btn');
      const close = bar.querySelector('.toolbar-close-btn');
      if (!pause || !close) return;
      const actions = document.createElement('div');
      actions.className = 'battle-toolbar-actions';
      actions.append(pause, close);
      bar.appendChild(actions);
    });
  }

  groupToolbarActions();
  new MutationObserver(groupToolbarActions).observe(document.body, { childList: true, subtree: true });
})();
