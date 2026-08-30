/* Day of VB - site achievements (gamification layer)
   Shared across index.html, contact.html, donate.html.
   Pure client-side, persisted in localStorage. No backend, no cost. */
(function(){
  var ACHIEVEMENTS = [
    { id:'welcome',  icon:'🎮', name:'Welcome, Player',   desc:'Visited the site for the first time' },
    { id:'videos',   icon:'📼', name:'Video Scout',       desc:'Checked out the Videos section' },
    { id:'blog',     icon:'📜', name:'Lore Reader',       desc:'Visited the Blog' },
    { id:'contact',  icon:'💬', name:'Made Contact',      desc:'Visited the Contact page' },
    { id:'poked',    icon:'😤', name:'Poked the Bear',    desc:'Clicked the 3D character' },
    { id:'gaming',   icon:'🕹️', name:'Two-Channel Fan',   desc:'Checked out VB Gaming' },
    { id:'donate',   icon:'🪙', name:'Generous Soul',     desc:'Visited the Support page' },
    { id:'nightowl', icon:'🌙', name:'Night Owl',         desc:'Visited between midnight and 5am' },
    { id:'complete', icon:'🏆', name:'Completionist',     desc:'Unlocked every other achievement' }
  ];
  var STORAGE_KEY = 'vb_achievements';
  var TOTAL = ACHIEVEMENTS.length - 1; /* excluding the meta 'complete' one */

  function getUnlocked(){
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch(e){ return {}; }
  }
  function saveUnlocked(obj){
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); } catch(e){}
  }

  var css = ''
    + '#vbAchBadge{position:fixed;bottom:20px;right:20px;z-index:9999;'
    + 'width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#1a0a10,#0D0F1A);'
    + 'border:1px solid rgba(255,45,85,0.35);box-shadow:0 4px 18px rgba(0,0,0,0.5),0 0 16px rgba(255,45,85,0.15);'
    + 'display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:22px;'
    + 'font-family:"Orbitron",sans-serif;transition:transform 0.2s;user-select:none}'
    + '#vbAchBadge:hover{transform:scale(1.08)}'
    + '#vbAchCount{position:absolute;top:-4px;right:-4px;background:#FF2D55;color:#fff;'
    + 'font-size:10px;font-weight:700;border-radius:10px;padding:2px 6px;min-width:16px;text-align:center;'
    + 'box-shadow:0 0 8px rgba(255,45,85,0.6)}'
    + '#vbAchPanel{position:fixed;bottom:82px;right:20px;z-index:9999;width:300px;max-width:calc(100vw - 40px);'
    + 'max-height:70vh;overflow-y:auto;background:#0D0F1A;border:1px solid rgba(255,45,85,0.25);'
    + 'border-radius:14px;padding:16px;box-shadow:0 10px 40px rgba(0,0,0,0.6);display:none;'
    + 'font-family:"Rajdhani",sans-serif}'
    + '#vbAchPanel.open{display:block}'
    + '#vbAchPanel h3{font-family:"Orbitron",sans-serif;font-size:13px;color:#F0F0F0;letter-spacing:0.08em;'
    + 'text-transform:uppercase;margin-bottom:4px}'
    + '#vbAchPanel .vbAchSub{font-size:11px;color:#9A9BA8;margin-bottom:12px}'
    + '.vbAchRow{display:flex;align-items:center;gap:10px;padding:8px 6px;border-radius:8px;margin-bottom:4px}'
    + '.vbAchRow.locked{opacity:0.35}'
    + '.vbAchRow.unlocked{background:rgba(255,45,85,0.07)}'
    + '.vbAchIcon{font-size:20px;width:28px;text-align:center;flex-shrink:0}'
    + '.vbAchText{flex:1;min-width:0}'
    + '.vbAchName{font-size:13px;font-weight:700;color:#F0F0F0}'
    + '.vbAchDesc{font-size:11px;color:#6B6C78}'
    + '#vbAchToast{position:fixed;bottom:82px;right:20px;z-index:10000;background:#0D0F1A;'
    + 'border:1px solid #FF2D55;border-radius:12px;padding:12px 16px;display:flex;align-items:center;gap:10px;'
    + 'box-shadow:0 0 24px rgba(255,45,85,0.4);transform:translateX(120%);transition:transform 0.35s ease;'
    + 'font-family:"Rajdhani",sans-serif;max-width:260px}'
    + '#vbAchToast.show{transform:translateX(0)}'
    + '#vbAchToast .vbAchIcon{font-size:24px}'
    + '#vbAchToast .vbAchToastLabel{font-size:10px;color:#FF2D55;font-family:"Orbitron",sans-serif;'
    + 'letter-spacing:0.05em;text-transform:uppercase}'
    + '#vbAchToast .vbAchName{font-size:13px;color:#fff}'
    + '#vbAchToast.vbAchClickable{cursor:pointer;border-color:#FFD24C;box-shadow:0 0 24px rgba(255,210,76,0.5)}'
    + '.vbAchSecretLink{font-size:10px;color:#FFD24C;margin-top:2px}'
    + '#vbAchSecretRow{display:flex;align-items:center;gap:10px;padding:10px 6px;margin-top:8px;'
    + 'border-top:1px solid rgba(255,210,76,0.25);cursor:pointer;color:#FFD24C;font-size:12px;font-weight:700}'
    + '#vbAchSecretRow:hover{text-shadow:0 0 8px #FFD24C}';
  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  function render(){
    var unlocked = getUnlocked();
    var count = ACHIEVEMENTS.filter(function(a){ return a.id !== 'complete' && unlocked[a.id]; }).length;
    var countEl = document.getElementById('vbAchCount');
    if (countEl) countEl.textContent = count + '/' + TOTAL;

    var list = document.getElementById('vbAchList');
    if (list){
      list.innerHTML = ACHIEVEMENTS.map(function(a){
        var isUnlocked = !!unlocked[a.id];
        return '<div class="vbAchRow ' + (isUnlocked ? 'unlocked' : 'locked') + '">'
          + '<div class="vbAchIcon">' + (isUnlocked ? a.icon : '❓') + '</div>'
          + '<div class="vbAchText"><div class="vbAchName">' + (isUnlocked ? a.name : '???') + '</div>'
          + '<div class="vbAchDesc">' + (isUnlocked ? a.desc : 'Not unlocked yet') + '</div></div>'
          + '</div>';
      }).join('');
      var oldRow = document.getElementById('vbAchSecretRow');
      if (oldRow) oldRow.remove();
      if (unlocked['complete']){
        var row = document.createElement('div');
        row.id = 'vbAchSecretRow';
        row.innerHTML = '🔓 Open your secret reward →';
        row.addEventListener('click', function(){ window.location.href = 'secret.html'; });
        list.parentNode.appendChild(row);
      }
    }
  }

  function showToast(a){
    var toast = document.getElementById('vbAchToast');
    if (!toast) return;
    var isComplete = a.id === 'complete';
    var inner = '<div class="vbAchIcon">' + a.icon + '</div>'
      + '<div><div class="vbAchToastLabel">Achievement Unlocked</div>'
      + '<div class="vbAchName">' + a.name + '</div>'
      + (isComplete ? '<div class="vbAchSecretLink">🔓 Tap to open your reward →</div>' : '')
      + '</div>';
    toast.innerHTML = inner;
    toast.onclick = isComplete ? function(){ window.location.href = 'secret.html'; } : null;
    toast.classList.toggle('vbAchClickable', isComplete);
    toast.classList.add('show');
    setTimeout(function(){ toast.classList.remove('show'); }, isComplete ? 6000 : 3200);
  }

  window.unlockAchievement = function(id){
    var def = ACHIEVEMENTS.find(function(a){ return a.id === id; });
    if (!def) return;
    var unlocked = getUnlocked();
    if (unlocked[id]) return; /* already have it */
    unlocked[id] = Date.now();

    var allDone = ACHIEVEMENTS.filter(function(a){ return a.id !== 'complete'; })
      .every(function(a){ return unlocked[a.id]; });
    saveUnlocked(unlocked);
    render();
    showToast(def);

    if (allDone && !unlocked['complete']){
      setTimeout(function(){
        var u2 = getUnlocked();
        u2['complete'] = Date.now();
        saveUnlocked(u2);
        render();
        showToast(ACHIEVEMENTS.find(function(a){ return a.id === 'complete'; }));
      }, 1600);
    }
  };

  function init(){
    var badge = document.createElement('div');
    badge.id = 'vbAchBadge';
    badge.title = 'Achievements';
    badge.innerHTML = '🏆<span id="vbAchCount">0/' + TOTAL + '</span>';
    document.body.appendChild(badge);

    var panel = document.createElement('div');
    panel.id = 'vbAchPanel';
    panel.innerHTML = '<h3>🏆 Achievements</h3><div class="vbAchSub">Explore the site to unlock them all</div><div id="vbAchList"></div>';
    document.body.appendChild(panel);

    var toast = document.createElement('div');
    toast.id = 'vbAchToast';
    document.body.appendChild(toast);

    badge.addEventListener('click', function(){
      panel.classList.toggle('open');
    });
    document.addEventListener('click', function(e){
      if (!panel.contains(e.target) && !badge.contains(e.target)) panel.classList.remove('open');
    });

    render();

    /* auto-unlocks */
    window.unlockAchievement('welcome');
    var hour = new Date().getHours();
    if (hour >= 0 && hour < 5) window.unlockAchievement('nightowl');

    /* section-view based unlocks - catches scrolling too, not just nav clicks */
    var sectionMap = { videos:'videos', blog:'blog', gaming:'gaming', contact:'contact' };
    if ('IntersectionObserver' in window){
      var obs = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if (entry.isIntersecting && sectionMap[entry.target.id]){
            window.unlockAchievement(sectionMap[entry.target.id]);
          }
        });
      }, { threshold: 0.35 });
      Object.keys(sectionMap).forEach(function(id){
        var el = document.getElementById(id);
        if (el) obs.observe(el);
      });
    }

    /* contact.html and donate.html are separate pages - unlock on load there */
    var path = window.location.pathname;
    if (/contact\.html/.test(path)) window.unlockAchievement('contact');
    if (/donate\.html/.test(path)) window.unlockAchievement('donate');

    /* 3D character click, if present on this page (contact.html) */
    var char3d = document.getElementById('char3d');
    if (char3d){
      char3d.addEventListener('click', function(){ window.unlockAchievement('poked'); });
    }
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
