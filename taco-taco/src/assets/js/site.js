(function(){
 var H=document.documentElement; H.classList.add('js');
 var WA_NUMBER='5016108859';   // TESTING line. Switch to 5016134677 (613-4677) for go-live.
 var basket=[];                // {name, meat, price(number), label, qty}
 var $=function(id){return document.getElementById(id);};
 var barCount=$('bb-count'), barTotal=$('bb-total');
 var panel=$('basket-panel'), list=$('bp-list'), panelTotal=$('bp-total');

 function priceNum(s){var m=(s||'').match(/\$(\d+(?:\.\d+)?)/);return m?parseFloat(m[1]):0;}
 function money(n){return '$'+(Math.round(n*100)/100);}
 function keyOf(n,m){return n+'|'+(m||'');}
 function count(){return basket.reduce(function(a,b){return a+b.qty;},0);}
 function total(){return basket.reduce(function(a,b){return a+b.qty*b.price;},0);}

 var BKEY='tt_basket_v1';
 function saveBasket(){try{localStorage.setItem(BKEY,JSON.stringify(basket));}catch(e){}}
 function loadBasket(){try{var v=JSON.parse(localStorage.getItem(BKEY)||'null');
  if(v&&v.length){basket=v;basket.forEach(function(it){if(!it.key)it.key=keyOf(it.name,it.meat);});renderBar();}}catch(e){}}

 function renderBar(){var c=count();H.classList.toggle('has-items',c>0);
  barCount.textContent=c+(c===1?' item':' items');barTotal.textContent=money(total());}
 function renderPanel(){
  list.innerHTML='';
  if(!basket.length){list.innerHTML='<p class="bp-empty">Your basket is empty. Tap Add on any menu item.</p>';}
  basket.forEach(function(it,i){
   var row=document.createElement('div');row.className='bp-row';
   row.innerHTML='<span class="bp-thumb'+(it.img?'':' none')+'"'+(it.img?' style="background-image:url(\''+it.img+'\')"':'')+'></span>'+
    '<div class="bp-info"><span class="bp-name"></span><span class="bp-price"></span></div>'+
    '<div class="bp-qty"><button type="button" class="qbtn" data-a="dec" data-i="'+i+'" aria-label="Decrease">−</button>'+
    '<span class="qn">'+it.qty+'</span>'+
    '<button type="button" class="qbtn" data-a="inc" data-i="'+i+'" aria-label="Increase">+</button></div>';
   row.querySelector('.bp-name').textContent=it.name+(it.meat?' ('+it.meat+')':'');
   if(it.opts&&it.opts.length){
    var o=document.createElement('span'); o.className='bp-opts';
    o.textContent=it.opts.join(' \u00b7 ');
    row.querySelector('.bp-info').appendChild(o);
   }
   row.querySelector('.bp-price').textContent=money(it.qty*it.price);
   list.appendChild(row);
  });
  panelTotal.textContent=money(total());
 }
 function add(name,priceStr,meat,img,extra){
  // A meat can carry a surcharge of its own: the menu prices birria a dollar up.
  extra=extra||0;
  var price=priceNum(priceStr)+extra;
  var label=extra?('$'+price+(/\bea\b/.test(priceStr||'')?' ea':'')):priceStr;
  var k=keyOf(name,meat),f=basket.filter(function(b){return (b.key||keyOf(b.name,b.meat))===k;})[0];
  if(f){f.qty++;}else{basket.push({key:k,name:name,meat:meat||'',price:price,
   label:label,qty:1,img:img||''});}
  renderBar();saveBasket();
 }
 // A promotional deal. `wa` is the real food the kitchen receives; the flyer never goes to them.
 function addDeal(o){
  var f=basket.filter(function(b){return b.key===o.key;})[0];
  if(f){f.qty++;}else{basket.push({key:o.key,name:o.name,meat:'',price:o.price,label:'$'+o.price,
   qty:1,img:o.img||'',deal:true,opts:o.opts||[],wa:o.wa||[]});}
  renderBar();saveBasket();renderPanel();
 }
 // Send a copy of the dish arcing across the page into the basket.
 function flyToBasket(btn){
  try{
   if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches) return;
   var row=btn.closest('.mi'), thumb=row&&row.querySelector('.mi-thumb');
   var bar=document.getElementById('basket-bar');
   if(!thumb||!bar) return;
   var s=thumb.getBoundingClientRect(), t=bar.getBoundingClientRect();
   if(!t.width) return;                       // basket not on screen yet
   var fly=document.createElement('span');
   fly.className='fly';
   fly.style.cssText='left:'+s.left+'px;top:'+s.top+'px;width:'+s.width+'px;height:'+s.height+'px;'+
     'background-image:'+getComputedStyle(thumb).backgroundImage+';background-color:#f7f0e0';
   document.body.appendChild(fly);
   var dx=(t.left+t.width/2)-(s.left+s.width/2), dy=(t.top+t.height/2)-(s.top+s.height/2);
   requestAnimationFrame(function(){
    fly.style.transform='translate('+dx.toFixed(0)+'px,'+dy.toFixed(0)+'px) scale(.18) rotate(300deg)';
    fly.style.opacity='.35';
   });
   setTimeout(function(){
    fly.parentNode&&fly.parentNode.removeChild(fly);
    bar.classList.add('bump'); setTimeout(function(){bar.classList.remove('bump');},460);
   },720);
  }catch(e){}
 }
 document.querySelectorAll('.add-btn').forEach(function(btn){
  btn.addEventListener('click',function(){
   var meat='', extra=0;
   if(btn.getAttribute('data-meat')){
    var sel=btn.parentNode.querySelector('.mi-meat');
    if(sel){
     meat=sel.value;
     var o=sel.options[sel.selectedIndex];
     extra=o?(parseFloat(o.getAttribute('data-add'))||0):0;
    }
   }
   add(btn.getAttribute('data-name'),btn.getAttribute('data-price'),meat,btn.getAttribute('data-img'),extra);
   flyToBasket(btn);
   btn.classList.add('added');btn.textContent='Added';
   setTimeout(function(){btn.classList.remove('added');btn.textContent='Add';},900);
  });
 });
 list.addEventListener('click',function(e){
  var b=e.target.closest('.qbtn');if(!b)return;
  var i=+b.getAttribute('data-i');
  if(b.getAttribute('data-a')==='inc'){basket[i].qty++;}
  else{basket[i].qty--;if(basket[i].qty<=0)basket.splice(i,1);}
  renderBar();renderPanel();saveBasket();
 });
 function openBasket(){renderPanel();panel.classList.add('open');}
 $('bb-view').addEventListener('click',openBasket);
 $('bp-close').addEventListener('click',function(){panel.classList.remove('open');});
 panel.addEventListener('click',function(e){if(e.target===panel)panel.classList.remove('open');});
 $('bp-clear').addEventListener('click',function(){basket=[];renderBar();renderPanel();saveBasket();});
 document.querySelectorAll('.js-open-basket').forEach(function(a){
  a.addEventListener('click',function(e){e.preventDefault();openBasket();});});

 // Build the order message and hand it to WhatsApp. The customer taps send on their own device.
 function waText(){
  var lines=[];
  basket.forEach(function(it){
   if(it.deal&&it.wa&&it.wa.length){
    lines.push(it.name+' - '+money(it.price)+':');
    it.wa.forEach(function(l){lines.push('  - '+l);});
    lines.push('  Qty: '+it.qty);
    lines.push('');
   }else{
    lines.push('- '+it.qty+'x '+it.name+(it.meat?' ('+it.meat+')':'')+': '+money(it.qty*it.price));
   }
  });
  while(lines.length&&lines[lines.length-1]==='')lines.pop();
  return 'Hi Taco Taco! I would like to place this order:\n\n'+lines.join('\n')+'\n\nTotal: '+money(total())+' BZD';
 }
 $('bp-send').addEventListener('click',function(){
  if(!basket.length)return;
  window.open('https://wa.me/'+WA_NUMBER+'?text='+encodeURIComponent(waText()),'_blank');
 });

 // Collapsible menu: expand/collapse; when collapsing, jump back to the menu top.
 var mc=$('menu-collapse'), mtog=$('menu-toggle');
 if(mc&&mtog){mtog.addEventListener('click',function(){
  var open=mc.classList.toggle('open');
  mtog.textContent=open?'Collapse Menu':'View Full Menu';
  if(!open){var sec=document.getElementById('menu');if(sec)sec.scrollIntoView({behavior:'smooth',block:'start'});}
 });}

 window.TTBasket={addDeal:addDeal,money:money};
 loadBasket();
})();
/* ---------- depth pass: hero parallax, card tilt, scroll reveal ----------
   Everything here is decoration only: it never touches the basket or the order flow, it is
   skipped entirely for reduced-motion users, and content stays visible if any of it is missing. */
(function(){
 var mq=window.matchMedia||function(){return {matches:false};};
 var reduce=mq('(prefers-reduced-motion: reduce)').matches;
 var fine=mq('(hover:hover) and (pointer:fine)').matches;
 var rAF=window.requestAnimationFrame||function(f){return setTimeout(f,16);};

 /* 1) scroll reveal. A rAF-throttled sweep rather than IntersectionObserver: anything at or
       above the fold is revealed, so a fast jump-scroll or an anchor jump can never strand an
       element in the hidden state. Listeners detach once everything has been revealed. */
 if(!reduce){
  var pending=[].slice.call(document.querySelectorAll('.sec-head,.fav,.about-card,.ostep,.order-card,.gitem'));
  pending.forEach(function(el){
   el.classList.add('d3-rv');
   var sibs=el.parentNode?[].slice.call(el.parentNode.children):[], i=sibs.indexOf(el);
   if(i>0&&sibs.length>1&&sibs.length<9){el.style.transitionDelay=(Math.min(i,5)*0.07).toFixed(2)+'s';}
  });
  var rvQueued=false;
  function sweep(){
   rvQueued=false;
   var vh=window.innerHeight, next=[];
   pending.forEach(function(el){
    if(el.getBoundingClientRect().top < vh*0.94){el.classList.add('in');} else {next.push(el);}
   });
   pending=next;
   if(!pending.length){
    window.removeEventListener('scroll',rvTick); window.removeEventListener('resize',rvTick);
    document.removeEventListener('click',rvTick);
   }
  }
  function rvTick(){ if(!rvQueued){rvQueued=true;rAF(sweep);} }
  window.addEventListener('scroll',rvTick,{passive:true});
  window.addEventListener('resize',rvTick);
  document.addEventListener('click',rvTick);   // layout shifts, e.g. expanding the menu
  sweep();
 }

 /* 2) hero parallax: each layer drifts at its own rate so the stage reads as a diorama.
       Desktop also gets a small pointer sway. */
 var stage=document.querySelector('.hero-stage');
 if(stage&&!reduce){
  var layers=[['.stage-type',-0.22,-10],['.blob',0.08,5],['.product-wrap',0.18,10],
              ['.spin-badge:not(.b2)',0.40,20],['.spin-badge.b2',0.30,-16],
              ['.side-badge:not(.two)',0.44,-22],['.side-badge.two',0.34,18]]
   .map(function(l){return [stage.querySelector(l[0]),l[1],l[2]];})
   .filter(function(l){return l[0];});
  var amp=fine?1:0.9, mx=0, queued=false;
  function paint(){
   queued=false;
   var r=stage.getBoundingClientRect();
   if(r.bottom<0||r.top>window.innerHeight)return;      // offscreen: nothing to do
   var y=-r.top;                                         // px scrolled past the stage top
   layers.forEach(function(l){
    l[0].style.translate=(mx*l[2]*amp).toFixed(1)+'px '+(y*l[1]*amp).toFixed(1)+'px';
   });
  }
  function tick(){ if(!queued){queued=true;rAF(paint);} }
  window.addEventListener('scroll',tick,{passive:true});
  window.addEventListener('resize',tick);
  if(fine){document.querySelector('.hero').addEventListener('pointermove',function(e){
   mx=(e.clientX/window.innerWidth-0.5)*2; tick();},{passive:true});}
  paint();
 }

 /* 3) card tilt toward the cursor. Pointer-precise devices only, so touch is untouched. */
 if(fine&&!reduce){
  [].slice.call(document.querySelectorAll('.fav,.about-card,.ostep,.gitem')).forEach(function(el){
   el.classList.add('d3-tilt');
   el.addEventListener('pointerenter',function(){el.classList.add('d3-live');});
   el.addEventListener('pointermove',function(e){
    var r=el.getBoundingClientRect();
    var cx=(e.clientX-r.left)/r.width-0.5, cy=(e.clientY-r.top)/r.height-0.5;
    el.style.transform='perspective(780px) rotateX('+(-cy*6).toFixed(2)+'deg) rotateY('+
      (cx*6).toFixed(2)+'deg) translateZ(8px)';
   },{passive:true});
   el.addEventListener('pointerleave',function(){
    el.classList.remove('d3-live'); el.style.transform='';});
  });
 }
})();

/* ---------- scroll-scrubbed showcase ----------
   Level 2: scroll drives playback. Frames are the gallery <img> nodes already in the page,
   cloned so no image data is duplicated. Skipped entirely for reduced motion, and the original
   grid remains the fallback, so the gallery is never lost. */
(function(){
 var mq=window.matchMedia||function(){return {matches:false};};
 if(mq('(prefers-reduced-motion: reduce)').matches) return;
 var rAF=window.requestAnimationFrame||function(f){return setTimeout(f,16);};
 var sec=document.getElementById('gallery'), gal=sec&&sec.querySelector('.gal');
 if(!sec||!gal) return;
 var imgs=[].slice.call(gal.querySelectorAll('img'));
 if(imgs.length<4) return;

 var scrub=document.createElement('div'); scrub.className='scrub';
 var stage=document.createElement('div'); stage.className='scrub-stage';
 var deck=document.createElement('div'); deck.className='scrub-deck';
 var frames=imgs.map(function(im){
  var f=document.createElement('figure'); f.className='sf';
  var c=im.cloneNode(false); c.removeAttribute('class'); c.setAttribute('alt',im.getAttribute('alt')||'');
  f.appendChild(c); deck.appendChild(f); return f;
 });
 var N=frames.length;
 var hud=document.createElement('div'); hud.className='scrub-hud';
 hud.innerHTML='<span class="scrub-num"><b>01</b> / '+(N<10?'0':'')+N+'</span>'+
   '<div class="scrub-track"><i></i></div>'+
   '<button type="button" class="scrub-skip" id="scrub-skip">Skip to gallery</button>';
 stage.appendChild(deck); stage.appendChild(hud); scrub.appendChild(stage);
 gal.parentNode.insertBefore(scrub, gal);
 document.documentElement.classList.add('scrub-on');
 var num=hud.querySelector('b'), bar=hud.querySelector('.scrub-track i');

 // Escape hatch: a pinned section should never trap the reader.
 var label=document.createElement('p'); label.className='gal-label'; label.textContent='Browse all photos';
 gal.parentNode.insertBefore(label, gal);
 hud.querySelector('#scrub-skip').addEventListener('click',function(){
  var y=label.getBoundingClientRect().top+window.pageYOffset-84;
  try{window.scrollTo({top:y,behavior:'smooth'});}catch(e){window.scrollTo(0,y);}
 });

 function sizeIt(){ scrub.style.height=(window.innerHeight + (N-1)*window.innerHeight*0.12)+'px'; }
 var last=-1, queued=false;
 function draw(){
  queued=false;
  var r=scrub.getBoundingClientRect(), travel=scrub.offsetHeight-stage.offsetHeight;
  if(travel<=0) return;
  var p=Math.max(0,Math.min(1,-r.top/travel));
  if(r.bottom<0||r.top>window.innerHeight) return;      // offscreen: skip the work
  var pos=p*(N-1);
  for(var i=0;i<N;i++){
   var d=i-pos, ad=Math.abs(d), f=frames[i];
   if(ad>1.15){ if(f.style.opacity!=='0'){f.style.opacity='0';f.style.visibility='hidden';} continue; }
   f.style.visibility='visible';
   f.style.opacity=(1-ad).toFixed(3);
   f.style.zIndex=String(100-Math.round(ad*100));
   f.style.transform='translate3d('+(d*30).toFixed(1)+'%,0,'+(-ad*300).toFixed(0)+'px) '+
                     'rotateY('+(-d*30).toFixed(1)+'deg)';
  }
  var idx=Math.round(pos)+1;
  if(idx!==last){ last=idx; num.textContent=(idx<10?'0':'')+idx; }
  bar.style.width=(p*100).toFixed(1)+'%';
 }
 function tick(){ if(!queued){queued=true;rAF(draw);} }
 window.addEventListener('scroll',tick,{passive:true});
 window.addEventListener('resize',function(){sizeIt();tick();});
 sizeIt(); draw();
})();

/* ---------- video gallery: the iframe is only created on tap, so no third-party
   player is loaded (or tracking) unless the visitor actually wants to watch. ---------- */
(function(){
 document.querySelectorAll('.vid').forEach(function(v){
  var btn=v.querySelector('.vid-play'); if(!btn) return;
  btn.addEventListener('click',function(){
   var src=v.getAttribute('data-src'); if(!src) return;
   var f=document.createElement('iframe');
   f.setAttribute('src',src+(src.indexOf('?')<0?'?':'&')+'autoplay=1');
   f.setAttribute('title',(v.querySelector('.vid-title')||{}).textContent||'Video');
   f.setAttribute('allow','accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture');
   f.setAttribute('allowfullscreen','');
   v.innerHTML=''; v.appendChild(f);
  });
 });
})();

/* ================= Deals & Combos =================
   The home carousel and the deal configurator. Selections are validated before a
   deal can be added, and each deal carries the real food description that the
   WhatsApp order is built from. */
(function(){
 var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;

 /* ---------- home carousel ---------- */
 var car=document.getElementById('dcar');
 if(car){
  var track=car.querySelector('.dcar-track'),
      slides=[].slice.call(car.querySelectorAll('.dcar-slide')),
      dots=[].slice.call(car.querySelectorAll('.dcar-dot')),
      i=0, timer=null, held=false, resume=null;
  function wake(n){                       // pull a deferred flyer in before it shows
   var img=slides[(n+slides.length)%slides.length];
   img=img&&img.querySelector('img[data-src]');
   if(img){img.src=img.getAttribute('data-src');img.removeAttribute('data-src');}
  }
  function show(n){
   i=(n+slides.length)%slides.length;
   wake(i); wake(i+1);
   track.style.transform='translateX('+(-i*100)+'%)';
   dots.forEach(function(d,k){d.classList.toggle('on',k===i);});
  }
  function play(){ if(reduce||held||slides.length<2) return; stop(); timer=setInterval(function(){show(i+1);},5000); }
  function stop(){ if(timer){clearInterval(timer);timer=null;} }
  // Every interaction only borrows the carousel. A finger landing here on the way
  // past used to stop it for good, which is why it sat still on a phone.
  function pauseFor(ms){
   held=true; stop();
   clearTimeout(resume); resume=setTimeout(function(){held=false;play();},ms);
  }
  car.querySelector('.dcar-next').addEventListener('click',function(){pauseFor(9000);show(i+1);});
  car.querySelector('.dcar-prev').addEventListener('click',function(){pauseFor(9000);show(i-1);});
  dots.forEach(function(d,k){d.addEventListener('click',function(){pauseFor(9000);show(k);});});
  car.addEventListener('mouseenter',stop);
  car.addEventListener('mouseleave',function(){if(!held)play();});
  car.addEventListener('focusin',function(){pauseFor(9000);});
  var x0=null,y0=null;
  car.addEventListener('touchstart',function(e){
   x0=e.touches[0].clientX; y0=e.touches[0].clientY; stop();
  },{passive:true});
  car.addEventListener('touchend',function(e){
   var dx=0,dy=0;
   if(x0!==null){ dx=e.changedTouches[0].clientX-x0; dy=e.changedTouches[0].clientY-y0; }
   x0=y0=null;
   if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)){ pauseFor(9000); show(dx<0?i+1:i-1); }
   else pauseFor(2500);        // a scroll went past, so pick back up shortly
  },{passive:true});
  car.addEventListener('touchcancel',function(){x0=y0=null;pauseFor(2500);},{passive:true});
  document.addEventListener('visibilitychange',function(){document.hidden?stop():play();});
  show(0); play();
  addEventListener('load',function(){setTimeout(function(){slides.forEach(function(_,k){wake(k);});},2500);});
 }

 /* ---------- deal cards ---------- */
 var DEALS=window.TT_DEALS||[], STR=window.TT_STR||{};
 if(!DEALS.length||!document.querySelector('.deal')) return;
 var byId={}; DEALS.forEach(function(d){byId[d.id]=d;});

 function val(card,cid){
  var wrap=card.querySelector('.opt[data-choice="'+cid+'"]');
  if(!wrap||wrap.hidden) return '';
  var r=wrap.querySelector('input[type=radio]:checked');
  if(r) return r.value;
  var sels=[].slice.call(wrap.querySelectorAll('.opt-sel'));
  if(!sels.length) return '';
  var vals=sels.map(function(s){return s.value;});
  return vals.every(function(v){return v;}) ? vals.join(', ') : '';
 }
 function applyVisibility(card,d){
  d.choices.forEach(function(c){
   if(!c.showIf) return;
   var wrap=card.querySelector('.opt[data-choice="'+c.id+'"]');
   if(wrap) wrap.hidden = (val(card,c.showIf.choice)!==c.showIf.equals);
  });
 }
 function priceOf(card,d){
  if(typeof d.price==='number') return d.price;
  var r=card.querySelector('input[type=radio][data-price]:checked');
  return r?parseFloat(r.getAttribute('data-price')):null;
 }
 function paint(card,d){
  applyVisibility(card,d);
  var p=priceOf(card,d), el=card.querySelector('.deal-price');
  if(el&&p!=null) el.textContent='$'+p;
 }
 function fill(tpl,card,d){
  return tpl.replace(/\{(\w+)\}/g,function(_,k){return val(card,k);}).replace(/\s+/g,' ').trim();
 }

 document.querySelectorAll('.deal').forEach(function(card){
  var d=byId[card.getAttribute('data-deal')]; if(!d) return;
  card.addEventListener('change',function(){paint(card,d);
   card.querySelectorAll('.opt-sel.bad').forEach(function(s){if(s.value)s.classList.remove('bad');});});
  paint(card,d);

  card.querySelector('.deal-add').addEventListener('click',function(){
   var warn=card.querySelector('.deal-warn'), missing=[];
   d.choices.forEach(function(c){
    var wrap=card.querySelector('.opt[data-choice="'+c.id+'"]');
    if(!wrap||wrap.hidden) return;
    if(!val(card,c.id)){
     missing.push(c.label);
     wrap.querySelectorAll('.opt-sel').forEach(function(s){if(!s.value)s.classList.add('bad');});
    }
   });
   var price=priceOf(card,d);
   if(price==null) missing.push((d.choices[0]||{}).label||'an option');
   if(missing.length){
    warn.textContent=(STR.pick_one||'Please choose')+': '+missing.join(', ');
    warn.hidden=false;
    var f=card.querySelector('.opt-sel.bad,.opt:not([hidden]) input[type=radio]');
    if(f&&f.focus)f.focus();
    return;
   }
   warn.hidden=true;

   var opts=[], sel={};
   d.choices.forEach(function(c){
    var v=val(card,c.id); if(!v) return;
    sel[c.id]=v; opts.push(c.label+': '+v);
   });
   var wa=(d.wa||[]).map(function(t){return fill(t,card,d);})
                    .filter(function(l){return l && !/\{\w+\}/.test(l) && !/:\s*$/.test(l);});
   window.TTBasket.addDeal({
    key:'deal:'+d.id+':'+JSON.stringify(sel),
    name:d.title, price:price, img:'assets/img/'+d.flyer, opts:opts, wa:wa
   });
   var b=this; b.classList.add('added'); b.textContent=STR.added||'Added';
   setTimeout(function(){b.classList.remove('added');b.textContent=STR.add||'Add To Basket';},1100);
  });
 });

 /* arriving from the carousel: bring that deal forward */
 function focusHash(){
  var h=location.hash.replace('#','');
  if(h.indexOf('deal-')!==0) return;
  var el=document.getElementById(h);
  if(!el) return;
  document.querySelectorAll('.deal.is-target').forEach(function(x){x.classList.remove('is-target');});
  el.classList.add('is-target');
  el.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
 }
 if(location.hash){ setTimeout(focusHash,120);
  // run again once images have settled, in case anything above shifted
  window.addEventListener('load',function(){setTimeout(focusHash,60);}); }
 window.addEventListener('hashchange',focusHash);
})();

/* ================= rotating reviews (home) =================
   Vertical only: the outgoing review leaves upward and the incoming one arrives
   from below, one card at a time so the grid height never moves. Pauses on
   hover, focus, touch and when the tab is hidden, and resumes by itself. */
(function(){
 var grid=document.getElementById('rcards');
 if(!grid||!window.TT_REVIEWS) return;
 var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 var by={}; window.TT_REVIEWS.forEach(function(r){by[r.id]=r;});
 var queue=(window.TT_REV_ORDER||[]).map(function(id){return by[id];})
            .filter(function(r){return r&&r.en;});
 var cards=[].slice.call(grid.querySelectorAll('.rcard'));
 if(reduce||!cards.length||queue.length<=cards.length) return;   // nothing left to rotate in

 var nextRev=cards.length, slot=0, timer=null, held=false, resume=null;
 function render(card,r){
  var inn=card.querySelector('.rcard-in');
  inn.querySelector('blockquote').textContent=r.en;
  inn.querySelector('figcaption').textContent=r.name;
  var st=inn.querySelector('.stars'), fill=st&&st.querySelector('.fill');
  if(st) st.setAttribute('aria-label', r.rating+' out of 5');
  if(fill) fill.style.width=(r.rating/5*100).toFixed(1)+'%';
 }
 function step(){
  var card=cards[slot%cards.length], inn=card.querySelector('.rcard-in');
  var r=queue[nextRev%queue.length];
  inn.classList.add('out');
  setTimeout(function(){
   render(card,r);
   inn.classList.remove('out'); inn.classList.add('in');
   requestAnimationFrame(function(){requestAnimationFrame(function(){inn.classList.remove('in');});});
  },480);
  slot++; nextRev++;
 }
 function play(){ if(held||timer) return; timer=setInterval(step,5000); }
 function stop(){ if(timer){clearInterval(timer);timer=null;} }
 function pauseFor(ms){
  held=true; stop();
  clearTimeout(resume); resume=setTimeout(function(){held=false;play();},ms);
 }
 grid.addEventListener('mouseenter',stop);
 grid.addEventListener('mouseleave',function(){if(!held)play();});
 grid.addEventListener('focusin',stop);
 grid.addEventListener('focusout',function(){if(!held)play();});
 // Hold it while the finger is down so nothing changes under the reader, then
 // pick back up. A long hold reads as broken when you are only scrolling past.
 grid.addEventListener('touchstart',function(){held=true;stop();clearTimeout(resume);},{passive:true});
 grid.addEventListener('touchend',function(){pauseFor(2500);},{passive:true});
 grid.addEventListener('touchcancel',function(){pauseFor(2500);},{passive:true});
 document.addEventListener('visibilitychange',function(){document.hidden?stop():play();});
 play();
})();
