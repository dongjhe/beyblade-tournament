(() => {
  let activeRecorder = null;
  let swapped = false;

  const NativeMediaRecorder = window.MediaRecorder;
  if (NativeMediaRecorder && !window.__beybladeRecorderPatched) {
    const nativeStart = NativeMediaRecorder.prototype.start;
    NativeMediaRecorder.prototype.start = function (...args) {
      activeRecorder = this;
      return nativeStart.apply(this, args);
    };
    window.__beybladeRecorderPatched = true;
  }

  const style = document.createElement('style');
  style.textContent = `
    .battle-modal{position:relative}
    .battle-head{position:absolute!important;right:8px;top:6px;z-index:50;background:transparent!important;height:auto!important;padding:0!important}
    .battle-head h2{display:none!important}
    .battle-close{font-size:32px!important;background:rgba(4,18,34,.72)!important;border:1px solid #315777!important;border-radius:10px!important;width:44px;height:44px;line-height:34px}
    .battle-arena{padding-top:22px!important}
    .battle-center{justify-content:flex-start!important}
    .battle-toolbar{width:100%;display:grid;grid-template-columns:1.25fr 1fr .8fr;gap:8px;align-items:stretch;margin:0 0 4px}
    .battle-toolbar .countdown-btn,.battle-toolbar button{width:100%;min-width:0;min-height:48px;padding:8px 10px;border-radius:12px;font-size:12px;font-weight:900}
    .swap-side-btn{background:#168df5;border:2px solid #38c8ff;box-shadow:0 0 12px #168df544}
    .video-pause-btn{background:#1766c2;border:2px solid #38c8ff}
    .video-pause-btn.paused{background:#d97706;border-color:#f59e0b}
    .battle-side.player-a .battle-name,.battle-side.player-a .finish-btn{border-color:#25c9ff!important;box-shadow:0 0 10px rgba(37,201,255,.22)}
    .battle-side.player-a .battle-name{border-bottom-color:#25c9ff!important}
    .battle-side.player-a .finish-btn strong,.battle-side.player-a .finish-btn.xtreme b{color:#25c9ff!important}
    .battle-side.player-b .battle-name,.battle-side.player-b .finish-btn{border-color:#ff405c!important;box-shadow:0 0 10px rgba(255,64,92,.22)}
    .battle-side.player-b .battle-name{border-bottom-color:#ff405c!important}
    .battle-side.player-b .finish-btn strong,.battle-side.player-b .finish-btn.xtreme b{color:#ff657b!important}
    .battle-side .launch-fail-btn{margin-top:2px;min-height:58px;background:#8d1730!important;border:2px solid #ff405c!important;color:#fff!important;flex-direction:row!important;justify-content:center!important;gap:12px!important;font-size:13px!important}
    .battle-side .launch-fail-btn.has-fail{background:#b41d39!important}
    .score-versus .player-a-score .big-score{border-color:#25c9ff!important;color:#25c9ff!important;box-shadow:0 0 14px rgba(37,201,255,.28)!important}
    .score-versus .player-b-score .big-score{border-color:#ff405c!important;color:#ff657b!important;box-shadow:0 0 14px rgba(255,64,92,.28)!important}
    .battle-tools{grid-template-columns:1fr!important}
    .battle-tools>.launch-fail-btn{display:none!important}
    @media (orientation:landscape) and (max-height:600px){
      .battle-overlay{padding:0!important;align-items:flex-start!important}
      .battle-modal{width:100vw!important;max-width:none!important;min-height:100dvh!important;max-height:none!important;border-radius:0!important}
      .battle-arena{grid-template-columns:minmax(190px,.9fr) minmax(330px,1.35fr) minmax(190px,.9fr)!important;gap:12px!important;padding:12px 18px 14px!important}
      .battle-side{gap:5px!important}
      .battle-name{font-size:18px!important;padding:8px 5px!important;border-bottom-width:4px!important}
      .finish-btn{min-height:48px!important;padding:7px 10px!important}
      .finish-btn b,.finish-btn.xtreme b{font-size:16px!important}.finish-btn strong{font-size:19px!important}
      .battle-round{font-size:28px!important}.battle-sub{display:none!important}
      .battle-toolbar{margin-top:0!important}.battle-toolbar .countdown-btn,.battle-toolbar button{min-height:42px!important;padding:6px!important;font-size:11px!important}
      .camera-preview,.replay-panel{position:static!important;width:100%!important;max-width:none!important;top:auto!important}
      .camera-preview{max-height:180px!important}.replay-video{max-height:175px!important}
      .score-versus{margin:2px 0!important}.big-score{height:62px!important;font-size:38px!important;border-width:3px!important;border-radius:14px!important}
      .score-versus small{margin-top:2px!important;font-size:7px!important}
      .draw-btn{padding:7px!important;font-size:12px!important}
      .battle-side .launch-fail-btn{min-height:45px!important;padding:6px!important;font-size:11px!important}
      .fail-marks i{width:16px!important;height:6px!important}
      .fail-note{display:none!important}.battle-footer{padding:6px 16px calc(6px + env(safe-area-inset-bottom))!important}
    }
  `;
  document.head.appendChild(style);

  function pauseResumeRecording(button) {
    const recorder = activeRecorder;
    if (!recorder || recorder.state === 'inactive') return;
    if (recorder.state === 'recording') {
      recorder.pause();
      button.classList.add('paused');
      button.textContent = '▶ 繼續';
    } else if (recorder.state === 'paused') {
      recorder.resume();
      button.classList.remove('paused');
      button.textContent = '⏸ 暫停';
    }
  }

  function setupBattle(modal) {
    if (modal.dataset.layoutReady === '1') return;
    modal.dataset.layoutReady = '1';
    swapped = false;

    const arena = modal.querySelector('.battle-arena');
    const center = modal.querySelector('.battle-center');
    const sides = [...modal.querySelectorAll('.battle-side')];
    const scoreVersus = modal.querySelector('.score-versus');
    const tools = modal.querySelector('.battle-tools');
    const countdown = modal.querySelector('.countdown-btn');
    if (!arena || !center || sides.length !== 2 || !scoreVersus || !tools || !countdown) return;

    const playerA = sides[0];
    const playerB = sides[1];
    playerA.classList.add('player-a');
    playerB.classList.add('player-b');

    const scoreBoxes = [...scoreVersus.children].filter(el => el.tagName === 'DIV');
    if (scoreBoxes[0]) scoreBoxes[0].classList.add('player-a-score');
    if (scoreBoxes[1]) scoreBoxes[1].classList.add('player-b-score');

    const failButtons = [...tools.querySelectorAll('.launch-fail-btn')];
    if (failButtons[0]) playerA.appendChild(failButtons[0]);
    if (failButtons[1]) playerB.appendChild(failButtons[1]);

    const toolbar = document.createElement('div');
    toolbar.className = 'battle-toolbar';
    center.insertBefore(toolbar, center.firstChild);
    toolbar.appendChild(countdown);

    const swap = document.createElement('button');
    swap.className = 'swap-side-btn';
    swap.type = 'button';
    swap.innerHTML = '⇄ 交換位置';
    toolbar.appendChild(swap);

    const pause = document.createElement('button');
    pause.className = 'video-pause-btn';
    pause.type = 'button';
    pause.textContent = '⏸ 暫停';
    toolbar.appendChild(pause);

    pause.addEventListener('click', e => {
      e.stopPropagation();
      pauseResumeRecording(pause);
    });

    swap.addEventListener('click', e => {
      e.stopPropagation();
      swapped = !swapped;
      if (swapped) {
        arena.insertBefore(playerB, center);
        arena.appendChild(playerA);
        if (scoreBoxes.length === 2) scoreVersus.insertBefore(scoreBoxes[1], scoreVersus.firstChild);
      } else {
        arena.insertBefore(playerA, center);
        arena.appendChild(playerB);
        if (scoreBoxes.length === 2) scoreVersus.insertBefore(scoreBoxes[0], scoreVersus.firstChild);
      }
    });
  }

  const observer = new MutationObserver(() => {
    document.querySelectorAll('.battle-modal').forEach(setupBattle);
  });
  observer.observe(document.body, { childList: true, subtree: true });
  document.querySelectorAll('.battle-modal').forEach(setupBattle);
})();
