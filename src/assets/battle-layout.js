(() => {
  let activeRecorder = null;
  const NativeMediaRecorder = window.MediaRecorder;
  if (NativeMediaRecorder && !window.__beybladeRecorderPatched) {
    const nativeStart = NativeMediaRecorder.prototype.start;
    const nativeStop = NativeMediaRecorder.prototype.stop;
    NativeMediaRecorder.prototype.start = function (...args) {
      activeRecorder = this;
      return nativeStart.apply(this, args);
    };
    NativeMediaRecorder.prototype.stop = function (...args) {
      const result = nativeStop.apply(this, args);
      if (activeRecorder === this) activeRecorder = null;
      return result;
    };
    window.__beybladeRecorderPatched = true;
  }

  const style = document.createElement('style');
  style.textContent = `
    .battle-modal{position:relative}
    .battle-head{position:absolute!important;right:8px;top:6px;z-index:80;background:transparent!important;height:auto!important;padding:0!important}
    .battle-head h2{display:none!important}
    .battle-close{font-size:32px!important;background:rgba(4,18,34,.82)!important;border:1px solid #315777!important;border-radius:10px!important;width:44px;height:44px;line-height:34px}
    .battle-arena{padding-top:22px!important}
    .battle-center{justify-content:flex-start!important;min-width:0!important}
    .battle-toolbar{width:100%;display:grid;grid-template-columns:minmax(0,1.45fr) minmax(0,.9fr) minmax(0,.75fr);gap:8px;align-items:stretch;margin:0 0 8px;box-sizing:border-box}
    .battle-toolbar .countdown-btn,.battle-toolbar button{width:100%!important;max-width:none!important;min-width:0!important;min-height:46px!important;padding:7px 5px!important;border-radius:12px!important;font-size:11px!important;font-weight:900!important;white-space:normal!important;line-height:1.12!important;writing-mode:horizontal-tb!important;transform:none!important}
    .swap-side-btn{background:#168df5;border:2px solid #38c8ff;box-shadow:0 0 12px #168df544}
    .video-pause-btn{background:#1766c2;border:2px solid #38c8ff}.video-pause-btn.paused{background:#d97706;border-color:#f59e0b}
    .battle-side.player-a .battle-name,.battle-side.player-a .finish-btn{border-color:#25c9ff!important;box-shadow:0 0 10px rgba(37,201,255,.22)}
    .battle-side.player-a .battle-name{border-bottom-color:#25c9ff!important}.battle-side.player-a .finish-btn strong,.battle-side.player-a .finish-btn.xtreme b{color:#25c9ff!important}
    .battle-side.player-b .battle-name,.battle-side.player-b .finish-btn{border-color:#ff405c!important;box-shadow:0 0 10px rgba(255,64,92,.22)}
    .battle-side.player-b .battle-name{border-bottom-color:#ff405c!important}.battle-side.player-b .finish-btn strong,.battle-side.player-b .finish-btn.xtreme b{color:#ff657b!important}
    .battle-side .launch-fail-btn{margin-top:2px;min-height:58px;background:#8d1730!important;border:2px solid #ff405c!important;color:#fff!important;flex-direction:row!important;justify-content:center!important;gap:12px!important;font-size:13px!important}
    .battle-side .launch-fail-btn.has-fail{background:#b41d39!important}
    .score-versus .player-a-score{order:1}.score-versus>b{order:2}.score-versus .player-b-score{order:3}
    .score-versus.swapped .player-b-score{order:1}.score-versus.swapped .player-a-score{order:3}
    .score-versus .player-a-score .big-score{border-color:#25c9ff!important;color:#25c9ff!important;box-shadow:0 0 14px rgba(37,201,255,.28)!important}
    .score-versus .player-b-score .big-score{border-color:#ff405c!important;color:#ff657b!important;box-shadow:0 0 14px rgba(255,64,92,.28)!important}
    .battle-tools{grid-template-columns:1fr!important}.battle-tools>.launch-fail-btn{display:none!important}

    @media(max-width:760px) and (orientation:portrait){
      .battle-arena{grid-template-columns:1fr 1fr!important;grid-template-areas:'center center' 'left right'!important;gap:10px 8px!important;padding:14px 10px 24px!important}
      .battle-center{grid-area:center!important;width:100%!important}
      .battle-side{min-width:0!important}.battle-side.visual-left{grid-area:left!important}.battle-side.visual-right{grid-area:right!important}
      .battle-toolbar{grid-template-columns:minmax(0,1.5fr) minmax(0,.9fr) minmax(0,.8fr)!important;gap:6px!important;padding-right:48px!important}
      .battle-toolbar .countdown-btn,.battle-toolbar button{min-height:44px!important;font-size:10px!important}
      .battle-round{margin-top:4px!important}.camera-preview,.replay-panel{width:min(340px,92vw)!important}
    }

    @media (orientation:landscape) and (max-height:700px){
      .battle-overlay{padding:0!important;align-items:flex-start!important;overflow-y:auto!important}
      .battle-modal{width:100vw!important;max-width:none!important;min-height:100dvh!important;max-height:none!important;border-radius:0!important;overflow:visible!important}
      .battle-arena{display:grid!important;grid-template-columns:minmax(230px,1fr) minmax(390px,1.55fr) minmax(230px,1fr)!important;grid-template-areas:'left center right'!important;align-items:start!important;gap:16px!important;padding:18px 22px 14px!important}
      .battle-side.visual-left{grid-area:left!important;grid-column:auto!important;grid-row:auto!important}.battle-center{grid-area:center!important;grid-column:auto!important;grid-row:auto!important;width:100%!important}.battle-side.visual-right{grid-area:right!important;grid-column:auto!important;grid-row:auto!important}
      .battle-side{gap:7px!important;min-width:0!important}.battle-name{font-size:20px!important;padding:9px 6px!important;border-bottom-width:4px!important}.finish-btn{min-height:66px!important;padding:8px 14px!important}.finish-btn b,.finish-btn.xtreme b{font-size:19px!important}.finish-btn strong{font-size:23px!important}
      .battle-toolbar{grid-template-columns:minmax(0,1.45fr) minmax(0,.9fr) minmax(0,.75fr)!important;gap:8px!important;margin:0 0 8px!important;padding-right:54px!important}
      .battle-toolbar .countdown-btn,.battle-toolbar button{height:48px!important;min-height:48px!important;font-size:11px!important;padding:6px!important;white-space:normal!important}
      .battle-round{font-size:34px!important;margin:0 0 4px!important}.battle-sub{display:none!important}
      .camera-preview,.replay-panel{position:static!important;width:100%!important;max-width:none!important;top:auto!important}.camera-preview{height:230px!important;max-height:230px!important;object-fit:contain!important;background:#000!important}.replay-panel{margin-top:4px!important}.replay-video{height:230px!important;max-height:230px!important;object-fit:contain!important;background:#000!important}
      .score-versus{margin:8px 0 4px!important}.big-score{height:72px!important;font-size:42px!important;border-width:3px!important;border-radius:14px!important}.score-versus small{margin-top:2px!important;font-size:8px!important}
      .draw-btn{padding:9px!important;font-size:13px!important}.battle-side .launch-fail-btn{min-height:54px!important;padding:7px!important;font-size:12px!important}.fail-marks i{width:18px!important;height:7px!important}.fail-note{display:none!important}.battle-footer{padding:6px 16px calc(6px + env(safe-area-inset-bottom))!important}
    }
  `;
  document.head.appendChild(style);

  function pauseResumeRecording(button){
    const recorder=activeRecorder;
    if(!recorder || recorder.state==='inactive'){
      button.classList.remove('paused');
      button.textContent='⏸ 暫停';
      return;
    }
    try{
      if(recorder.state==='recording'){
        recorder.requestData?.();
        recorder.pause();
        button.classList.add('paused');
        button.textContent='▶ 繼續';
      }else if(recorder.state==='paused'){
        recorder.resume();
        button.classList.remove('paused');
        button.textContent='⏸ 暫停';
      }
    }catch(e){console.error('[battle] pause/resume failed',e)}
  }

  function setupBattle(modal){
    if(modal.dataset.layoutReady==='1')return;
    modal.dataset.layoutReady='1';
    let swapped=false;
    const arena=modal.querySelector('.battle-arena'),center=modal.querySelector('.battle-center'),sides=[...modal.querySelectorAll('.battle-side')],scoreVersus=modal.querySelector('.score-versus'),tools=modal.querySelector('.battle-tools'),countdown=modal.querySelector('.countdown-btn');
    if(!arena||!center||sides.length!==2||!scoreVersus||!tools||!countdown)return;
    const playerA=sides[0],playerB=sides[1];
    playerA.classList.add('player-a','visual-left');playerB.classList.add('player-b','visual-right');
    const scoreBoxes=[...scoreVersus.children].filter(el=>el.tagName==='DIV');
    if(scoreBoxes[0])scoreBoxes[0].classList.add('player-a-score');if(scoreBoxes[1])scoreBoxes[1].classList.add('player-b-score');
    const failButtons=[...tools.querySelectorAll('.launch-fail-btn')];if(failButtons[0])playerA.appendChild(failButtons[0]);if(failButtons[1])playerB.appendChild(failButtons[1]);
    const toolbar=document.createElement('div');toolbar.className='battle-toolbar';center.insertBefore(toolbar,center.firstChild);toolbar.appendChild(countdown);
    const swap=document.createElement('button');swap.className='swap-side-btn';swap.type='button';swap.textContent='⇄ 交換位置';toolbar.appendChild(swap);
    const pause=document.createElement('button');pause.className='video-pause-btn';pause.type='button';pause.textContent='⏸ 暫停';toolbar.appendChild(pause);
    pause.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();pauseResumeRecording(pause)});
    swap.addEventListener('click',e=>{
      e.preventDefault();e.stopPropagation();swapped=!swapped;scoreVersus.classList.toggle('swapped',swapped);
      playerA.classList.toggle('visual-left',!swapped);playerA.classList.toggle('visual-right',swapped);
      playerB.classList.toggle('visual-left',swapped);playerB.classList.toggle('visual-right',!swapped);
    });
  }
  const observer=new MutationObserver(()=>document.querySelectorAll('.battle-modal').forEach(setupBattle));observer.observe(document.body,{childList:true,subtree:true});document.querySelectorAll('.battle-modal').forEach(setupBattle);
})();
