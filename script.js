const filters=document.querySelectorAll(".filter"),cards=document.querySelectorAll(".menu-card"),search=document.getElementById("search"),empty=document.getElementById("empty");let active="all";function render(){let q=search.value.toLowerCase(),shown=0;cards.forEach(c=>{let ok=(active==="all"||c.dataset.cat===active)&&c.dataset.name.includes(q);c.style.display=ok?"block":"none";if(ok)shown++});empty.style.display=shown?"none":"block"}filters.forEach(b=>b.addEventListener("click",()=>{filters.forEach(x=>x.classList.remove("active"));b.classList.add("active");active=b.dataset.filter;render()}));search.addEventListener("input",render);document.querySelector(".menu-toggle").addEventListener("click",()=>document.querySelector(".nav-links").classList.toggle("open"));document.querySelectorAll(".nav-links a").forEach(a=>a.addEventListener("click",()=>document.querySelector(".nav-links").classList.remove("open")));

// Auto-scroll: starts after 2 seconds without user activity.
// Any mouse, touch, wheel, keyboard, or click activity pauses/resets the timer.
(function initAutoScroll(){
  const IDLE_DELAY = 2000;
  const SCROLL_STEP = 0.7; // smaller = slower scrolling
  const FRAME_DELAY = 20;
  let idleTimer = null;
  let autoScrolling = false;
  let lastFrame = 0;

  function stopAutoScroll(){
    autoScrolling = false;
    clearTimeout(idleTimer);
  }

  function startTimer(){
    stopAutoScroll();
    idleTimer = setTimeout(() => {
      autoScrolling = true;
      lastFrame = performance.now();
      requestAnimationFrame(autoScroll);
    }, IDLE_DELAY);
  }

  function autoScroll(now){
    if(!autoScrolling) return;

    // Scroll gently downward.
    if(now - lastFrame >= FRAME_DELAY){
      window.scrollBy(0, SCROLL_STEP);
      lastFrame = now;
    }

    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    if(atBottom){
      // Quickly return to the top, then immediately continue the slow cycle.
      window.scrollTo({top: 0, behavior: 'smooth'});
      setTimeout(() => {
        if(autoScrolling){
          lastFrame = performance.now();
          requestAnimationFrame(autoScroll);
        }
      }, 450);
      return;
    }

    requestAnimationFrame(autoScroll);
  }

  ['mousemove','wheel','touchstart','touchmove','keydown','click','pointerdown'].forEach(eventName => {
    window.addEventListener(eventName, startTimer, {passive: true});
  });

  startTimer();
})();
