(() => {
  let floatingWindow = null;
  let syncTimer = null;

  function notify(message){
    const toast = document.getElementById('toast');
    if(!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(notify.t);
    notify.t = setTimeout(() => toast.classList.remove('show'), 3200);
  }

  function miniMarkup(doc){
    doc.open();
    doc.write(`<!doctype html>
<html><head><meta charset="utf-8"><title>Lesblok mini</title>
<style>
  *{box-sizing:border-box}
  html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#fff;color:#171717;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
  body{display:flex;align-items:center}
  .box{width:100%;padding:16px 18px 13px}
  .top{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:10px}
  .title{font-size:22px;font-weight:900;letter-spacing:-.025em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .wrap{font-size:11px;font-weight:900;color:#ff9a3c;visibility:hidden;white-space:nowrap}
  .wrap.show{visibility:visible}
  .bar{height:17px;border-radius:999px;background:#ececea;overflow:hidden}
  .fill{height:100%;width:0;border-radius:inherit;background:#e96a4a;transition:width .25s linear,background-color .2s ease}
  .bottom{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:9px;color:#777;font-size:12px}
  .next{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .controls{display:flex;gap:5px;flex:0 0 auto}
  button{border:0;border-radius:8px;padding:5px 8px;font:inherit;font-weight:850;background:#efefec;color:#171717;cursor:pointer}
</style></head>
<body><div class="box">
  <div class="top"><div class="title" id="pipTitle">LESBLOK</div><div class="wrap" id="pipWrap">WRAP UP</div></div>
  <div class="bar"><div class="fill" id="pipFill"></div></div>
  <div class="bottom">
    <div class="next" id="pipNext">Next</div>
    <div class="controls"><button id="pipPlus">+1</button><button id="pipPause">Ⅱ</button><button id="pipNextBtn">NEXT</button></div>
  </div>
</div></body></html>`);
    doc.close();

    doc.getElementById('pipPlus').onclick = () => document.getElementById('plusBtn')?.click();
    doc.getElementById('pipNextBtn').onclick = () => document.getElementById('nextBtn')?.click();
    doc.getElementById('pipPause').onclick = () => {
      const pause = document.getElementById('pauseBtn');
      const start = document.getElementById('startBtn');
      if(pause && !pause.disabled) pause.click();
      else start?.click();
    };
  }

  function syncMini(){
    if(!floatingWindow || floatingWindow.closed){
      clearInterval(syncTimer);
      syncTimer = null;
      return;
    }
    try{
      const d = floatingWindow.document;
      const title = document.getElementById('title')?.textContent || 'LESBLOK';
      const fill = document.getElementById('progress');
      const next = document.getElementById('next')?.innerText || '';
      const wrap = document.getElementById('wrap');
      const pause = document.getElementById('pauseBtn');

      d.getElementById('pipTitle').textContent = title;
      d.getElementById('pipFill').style.width = fill?.style.width || '0%';
      d.getElementById('pipFill').style.background = fill ? getComputedStyle(fill).backgroundColor : '#e96a4a';
      d.getElementById('pipNext').textContent = next;
      d.getElementById('pipWrap').classList.toggle('show', !!wrap?.classList.contains('show'));
      d.getElementById('pipPause').textContent = pause && !pause.disabled ? 'Ⅱ' : '▶';
    }catch(e){}
  }

  async function openFloatingMini(){
    try{
      if(floatingWindow && !floatingWindow.closed) floatingWindow.close();

      if('documentPictureInPicture' in window){
        floatingWindow = await window.documentPictureInPicture.requestWindow({width:470,height:175});
        miniMarkup(floatingWindow.document);
        notify('Mini-timer geopend: dit venster blijft boven je andere schermen.');
      } else {
        floatingWindow = window.open('about:blank','LesblokMini','popup=yes,width=470,height=175,resizable=yes,scrollbars=no');
        if(!floatingWindow){
          notify('De browser blokkeert het mini-venster. Sta pop-ups toe voor deze site.');
          return;
        }
        miniMarkup(floatingWindow.document);
        notify('Always-on-top wordt niet ondersteund in deze browser; gewone mini-popup geopend.');
      }

      syncMini();
      clearInterval(syncTimer);
      syncTimer = setInterval(syncMini, 200);
      floatingWindow.addEventListener('pagehide', () => {
        clearInterval(syncTimer);
        syncTimer = null;
        floatingWindow = null;
      }, {once:true});
    } catch(err){
      console.error(err);
      notify('Mini-timer kon niet worden geopend. Probeer Chrome en klik opnieuw op MINI.');
    }
  }

  // Replace the MINI button so the old compact-mode click handler is removed.
  const oldMini = document.getElementById('miniBtn');
  if(oldMini){
    const mini = oldMini.cloneNode(true);
    mini.textContent = 'MINI';
    oldMini.replaceWith(mini);
    mini.addEventListener('click', openFloatingMini);
  }

  // The separate POP OUT button is redundant now.
  document.getElementById('popBtn')?.remove();
})();
