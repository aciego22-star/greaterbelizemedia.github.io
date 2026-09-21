/* Every word this file puts on the page comes from the language payload that
   ships beside the deals data, so the Spanish site has no English of ours left
   in its interface. Declared before anything else here because the basket, the
   lightbox and the reel all reach for it. */
var TT_TXT=window.TT_T||{};
function t(k,d){return TT_TXT[k]||d;}

/* ================= land at the top of the page you asked for =================
   Tapping Reviews should show the top of the reviews page. Two things get in
   the way of that and neither is the link:

   A browser remembers where you were on a page and puts you back there when you
   return to it. That is the behaviour you want from the Back button and not at
   all what you want from a menu, and iOS applies it more eagerly than a desktop
   browser does, which is why this only happened sometimes: the first visit to a
   page landed at the top, and every visit after that landed wherever you had
   scrolled to last time.

   And when the site is sitting inside someone else's frame, a preview panel or
   the in-app browser inside Instagram or Facebook, scrolling ourselves to the
   top does nothing to the page around us, and that page is the one actually
   holding the scrollbar. We cannot script it, it is not ours. But
   scrollIntoView is a scroll the browser performs rather than one we perform,
   so it walks up through the frames on its own and brings the top of the site
   into view wherever the frame happens to be sitting.

   Back still returns you where you were, a reload keeps your place, a link to a
   section still goes to that section, and if you have already started scrolling
   we leave you alone rather than yanking you back. */
(function(){
 if(location.hash) return;          // #deal-, #v-, #c- all mean "take me there"

 var kind = null;
 try{ kind = (performance.getEntriesByType('navigation')||[])[0].type; }catch(e){}
 if(kind === 'back_forward' || kind === 'reload') return;

 var moved = false;
 ['wheel','touchmove','keydown','pointerdown'].forEach(function(ev){
  addEventListener(ev, function(){ moved = true; }, {passive:true, once:true});
 });

 function top(){
  if(moved) return;
  var root = document.documentElement, prev = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';   // the stylesheet asks for smooth; not here
  try{ window.scrollTo(0,0); }catch(e){}
  if(window.top !== window.self){
   try{
    (document.querySelector('header') || document.body)
      .scrollIntoView({block:'start', inline:'nearest'});
   }catch(e){}
  }
  root.style.scrollBehavior = prev;
 }

 // A browser that is going to restore a position does it around and after the
 // load event, so check again once everything has settled rather than only once.
 top();
 addEventListener('DOMContentLoaded', top);
 addEventListener('load', function(){ top(); setTimeout(top,120); setTimeout(top,450); });
})();

(function(){
 var H=document.documentElement; H.classList.add('js');
 var WA_NUMBER='5016108859';   // set by build_site.py; do not edit here
 var basket=[];                // {name, meat, price(number), label, qty}
 var $=function(id){return document.getElementById(id);};
 var barCount=$('bb-count'), barTotal=$('bb-total');
 var panel=$('basket-panel'), list=$('bp-list'), panelTotal=$('bp-total');

 function priceNum(s){var m=(s||'').match(/\$(\d+(?:\.\d+)?)/);return m?parseFloat(m[1]):0;}
 // Belize dollars, always two places. A discount of five percent turns whole
 // menu prices into cents, and a total reading $37.5 next to a line reading
 // $2.05 is the kind of thing a customer queries at the counter.
 function round2(n){return Math.round((n+Number.EPSILON)*100)/100;}
 function money(n){return '$'+round2(n).toFixed(2);}
 function keyOf(n,m){return n+'|'+(m||'');}
 function count(){return basket.reduce(function(a,b){return a+b.qty;},0);}
 function total(){return basket.reduce(function(a,b){return a+b.qty*b.price;},0);}

 /* ===================== the September promotion =====================
    Every number the customer sees and every number the restaurant receives
    comes out of bill(). Nothing else in this file works out a discount, so the
    basket and the WhatsApp message cannot drift apart: there is only one sum.

    The window is checked against the browser's clock on every call rather than
    once at load, so a page left open past midnight on the 30th stops applying
    the discount by itself, and the site needs no redeploy to end the offer. */
 var PROMO=window.TT_PROMO||{on:false};
 function promoOn(){
  if(!PROMO.on) return false;
  var now=Date.now();
  return now>=PROMO.from && now<=PROMO.to;
 }
 // What the percentage comes off. A deal already carries its own reduced
 // price, so whether those are included is a decision, and it is made once, in
 // promo_data.py, not here.
 function promoBase(){
  if(PROMO.deals!==false) return total();
  return basket.reduce(function(a,b){return a+(b.deal?0:b.qty*b.price);},0);
 }
 function bill(){
  var sub=round2(total());
  var off=(promoOn()&&basket.length&&sub>0)?round2(promoBase()*PROMO.pct/100):0;
  if(off>sub) off=sub;                       // belt and braces; cannot happen at 5%
  return {sub:sub, off:off, total:round2(sub-off), on:off>0};
 }

 /* ---- who the order is for, and how they are getting it ----
    Two things the kitchen used to have to ask for in a reply. The name is what
    gets called across the counter and the fulfilment is what decides whether
    anybody boxes it, so both belong in the first message rather than the third.

    What the customer reads is translated; what travels to the kitchen is the
    English word, the same rule the menu item names already follow, so a ticket
    reads the same whichever language it was ordered in.

    Both are remembered on this device. A regular should not retype their own
    name every Friday. */
 var WKEY='tt_who_v1';
 var nameEl=$('bp-who-name'), warnEl=$('bp-warn');
 var delBox=$('bp-del'), addrEl=$('bp-addr'), timeEl=$('bp-time');
 function fulfilEl(){return document.querySelector('input[name=bp-fulfil]:checked');}
 function whenEl(){return document.querySelector('input[name=bp-when]:checked');}
 function who(){
  var f=fulfilEl(), w=whenEl();
  var o={name:(nameEl&&nameEl.value||'').trim(), how:f?f.value:''};
  if(o.how==='Delivery'){
   o.addr=(addrEl&&addrEl.value||'').trim().replace(/\s*\n\s*/g,', ');
   o.when=w?w.value:'';
   o.at=(timeEl&&timeEl.value)||'';
  }
  return o;
 }
 /* The address and the time only exist for a delivery, so they only appear for
    one. Asking somebody eating at a table for their street is how a form earns
    a reputation. */
 function syncDelivery(){
  var f=fulfilEl(), on=!!f&&f.value==='Delivery';
  if(delBox) delBox.hidden=!on;
  var w=whenEl();
  if(timeEl) timeEl.hidden=!(on&&w&&w.value==='At a time');
 }
 function saveWho(){
  try{localStorage.setItem(WKEY,JSON.stringify(who()));}catch(e){}
 }
 function loadWho(){
  try{
   var v=JSON.parse(localStorage.getItem(WKEY)||'null');
   if(v){
    if(v.name&&nameEl) nameEl.value=v.name;
    if(v.how){
     var r=document.querySelector('input[name=bp-fulfil][value="'+v.how+'"]');
     if(r) r.checked=true;
    }
    if(v.addr&&addrEl) addrEl.value=v.addr;
    if(v.when){
     var q=document.querySelector('input[name=bp-when][value="'+v.when+'"]');
     if(q) q.checked=true;
    }
    if(v.at&&timeEl) timeEl.value=v.at;
   }
  }catch(e){}
  syncDelivery();
 }
 if(nameEl) nameEl.addEventListener('input',function(){
  nameEl.classList.remove('bad'); if(warnEl) warnEl.hidden=true; saveWho();
 });
 function clearMarks(){
  if(nameEl) nameEl.classList.remove('bad');
  if(addrEl) addrEl.classList.remove('bad');
  ['.bp-how','.bp-del-when'].forEach(function(sel){
   var g=document.querySelector(sel); if(g) g.classList.remove('bad');
  });
  if(warnEl) warnEl.hidden=true;
 }
 document.querySelectorAll('input[name=bp-fulfil]').forEach(function(r){
  r.addEventListener('change',function(){ syncDelivery(); clearMarks(); saveWho(); });
 });
 document.querySelectorAll('input[name=bp-when]').forEach(function(r){
  r.addEventListener('change',function(){ syncDelivery(); clearMarks(); saveWho();
   if(timeEl&&!timeEl.hidden&&timeEl.focus) timeEl.focus();
  });
 });
 if(addrEl) addrEl.addEventListener('input',function(){ clearMarks(); saveWho(); });
 if(timeEl) timeEl.addEventListener('change',function(){ clearMarks(); saveWho(); });
 /* Nothing is sent half answered: the kitchen cannot cook "for someone, somehow".
    The wording follows the deals form, which already stops on a missing choice. */
 function whoReady(){
  var w=who(), missing=[];
  if(!w.name){ missing.push(t('who_name','Your name')); if(nameEl) nameEl.classList.add('bad'); }
  if(!w.how){ missing.push(t('who_how','How are you getting it?'));
              var g=document.querySelector('.bp-how'); if(g) g.classList.add('bad'); }
  if(w.how==='Delivery'){
   if(!w.addr){ missing.push(t('who_addr','Delivery address')); if(addrEl) addrEl.classList.add('bad'); }
   // "At a time" with no time on it is the same as not having answered
   if(!w.when||(w.when==='At a time'&&!w.at)){
    missing.push(t('who_when','When do you want it?'));
    var d=document.querySelector('.bp-del-when'); if(d) d.classList.add('bad');
   }
  }
  if(!missing.length) return true;
  if(warnEl){
   warnEl.textContent=t('pick_one','Please choose')+': '+missing.join(', ');
   warnEl.hidden=false;
  }
  var focus=!w.name?nameEl
           :!w.how?document.querySelector('input[name=bp-fulfil]')
           :(w.how==='Delivery'&&!w.addr)?addrEl
           :(w.how==='Delivery')?document.querySelector('input[name=bp-when]')
           :nameEl;
  if(focus&&focus.focus) focus.focus();
  return false;
 }

 var BKEY='tt_basket_v1';
 function saveBasket(){try{localStorage.setItem(BKEY,JSON.stringify(basket));}catch(e){}}
 function loadBasket(){try{var v=JSON.parse(localStorage.getItem(BKEY)||'null');
  if(v&&v.length){basket=v;basket.forEach(function(it){if(!it.key)it.key=keyOf(it.name,it.meat);});renderBar();}}catch(e){}}

 var barPromo=$('bb-promo');
 function renderBar(){var c=count();H.classList.toggle('has-items',c>0);
  var b=bill();
  barCount.textContent=c+' '+(c===1?t('item','item'):t('items','items'));
  barTotal.textContent=money(b.total);
  if(barPromo){
   // The offer stays in front of the customer after the popup is gone.
   barPromo.hidden=!b.on;
   barPromo.textContent=b.on?(PROMO.badge||''):'';
  }}
 function renderPanel(){
  list.innerHTML='';
  if(!basket.length){
   var last=lastOrder();
   if(last){
    list.innerHTML='<div class="bp-sent"><p></p>'+
      '<button type="button" class="btn-ghost" id="bp-undo"></button></div>';
    list.querySelector('p').textContent=t('sent_ok','Order sent to WhatsApp.');
    var ub=list.querySelector('#bp-undo');
    ub.textContent=t('sent_undo','Put it back in my basket');
    ub.addEventListener('click',function(){
     basket=last.items.slice(); dropLast();
     renderBar();saveBasket();renderPanel();
    });
   }else{
    list.innerHTML='<p class="bp-empty"></p>';
    list.firstChild.textContent=t('basket_empty','Your basket is empty. Tap Add on any menu item.');
   }
  }
  basket.forEach(function(it,i){
   var row=document.createElement('div');row.className='bp-row';
   row.innerHTML='<span class="bp-thumb'+(it.img?'':' none')+'"'+(it.img?' style="background-image:url(\''+it.img+'\')"':'')+'></span>'+
    '<div class="bp-info"><span class="bp-name"></span><span class="bp-price"></span></div>'+
    '<div class="bp-qty"><button type="button" class="qbtn" data-a="dec" data-i="'+i+'" aria-label="'+t('decrease','Decrease')+'">−</button>'+
    '<span class="qn">'+it.qty+'</span>'+
    '<button type="button" class="qbtn" data-a="inc" data-i="'+i+'" aria-label="'+t('increase','Increase')+'">+</button></div>';
   // What the guest reads, which on the Spanish site is not what the kitchen
   // receives: the order keeps the name printed on the restaurant's own menu.
   var shownMeat=it.meatDisp||it.meat;
   row.querySelector('.bp-name').textContent=(it.disp||it.name)+(shownMeat?' ('+shownMeat+')':'');
   if(it.opts&&it.opts.length){
    var o=document.createElement('span'); o.className='bp-opts';
    o.textContent=it.opts.join(' \u00b7 ');
    row.querySelector('.bp-info').appendChild(o);
   }
   row.querySelector('.bp-price').textContent=money(it.qty*it.price);
   list.appendChild(row);
  });
  var b=bill();
  var sum=$('bp-sum');
  if(sum){
   sum.hidden=!b.on;
   if(b.on){
    $('bp-sub-l').textContent=PROMO.subtotal||'Subtotal';
    $('bp-sub').textContent=money(b.sub);
    $('bp-disc-l').textContent=PROMO.line||'';
    $('bp-disc').textContent='\u2212'+money(b.off);
   }
  }
  panelTotal.textContent=money(b.total);
 }
 function add(name,priceStr,meat,img,extra,disp,meatDisp){
  // A meat can carry a surcharge of its own: the menu prices birria a dollar up.
  extra=extra||0;
  var price=priceNum(priceStr)+extra;
  var label=extra?('$'+price+(/\bea\b/.test(priceStr||'')?' ea':'')):priceStr;
  var k=keyOf(name,meat),f=basket.filter(function(b){return (b.key||keyOf(b.name,b.meat))===k;})[0];
  if(f){f.qty++;}else{basket.push({key:k,name:name,meat:meat||'',price:price,
   label:label,qty:1,img:img||'',disp:disp||'',meatDisp:meatDisp||''});}
  renderBar();saveBasket();dropLast();
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
   var meat='', meatLabel='', extra=0;
   if(btn.getAttribute('data-meat')){
    var sel=btn.parentNode.querySelector('.mi-meat');
    if(sel){
     // value is the kitchen's word for the meat, text is the reader's
     meat=sel.value;
     var o=sel.options[sel.selectedIndex];
     meatLabel=o?o.text:meat;
     extra=o?(parseFloat(o.getAttribute('data-add'))||0):0;
    }
   }
   add(btn.getAttribute('data-name'),btn.getAttribute('data-price'),meat,btn.getAttribute('data-img'),extra,
      btn.getAttribute('data-disp')||'',meatLabel);
   flyToBasket(btn);
   var was=btn.getAttribute('data-label')||btn.textContent;
   btn.setAttribute('data-label',was);
   btn.classList.add('added');btn.textContent=t('added','Added');
   setTimeout(function(){btn.classList.remove('added');btn.textContent=was;},900);
  });
 });
 list.addEventListener('click',function(e){
  var b=e.target.closest('.qbtn');if(!b)return;
  var i=+b.getAttribute('data-i');
  if(b.getAttribute('data-a')==='inc'){basket[i].qty++;}
  else{basket[i].qty--;if(basket[i].qty<=0)basket.splice(i,1);}
  renderBar();renderPanel();saveBasket();
 });
 function openBasket(){renderPanel();loadWho();panel.classList.add('open');}
 $('bb-view').addEventListener('click',openBasket);
 $('bp-close').addEventListener('click',function(){panel.classList.remove('open');});
 panel.addEventListener('click',function(e){if(e.target===panel)panel.classList.remove('open');});
 $('bp-clear').addEventListener('click',function(){basket=[];renderBar();renderPanel();saveBasket();});
 // "Order on WhatsApp" from a page with no basket on it: open the same chat the
 // basket sends to, with an opening line, rather than inventing a second route.
 document.querySelectorAll('.js-wa-start').forEach(function(b){
  b.addEventListener('click',function(){
   // Not named t: var t would be hoisted over the t() translation helper, and
   // the empty-basket branch is the one that needs to call it.
   if(count()&&!whoReady()){ openBasket(); return; }
   var msg=count()
     ? waText()
     : t('wa_open','Hello Taco Taco, I would like to place an order.');
   var win=window.open('https://wa.me/'+WA_NUMBER+'?text='+encodeURIComponent(msg),'_blank');
   if(win&&count()) armClear();
  });
 });
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
  // Same bill() the basket just drew, so the restaurant is quoted the figures
  // the customer was shown, to the cent. When the promotion is not running this
  // is the single total line the site has always sent.
  var b=bill(), tail;
  if(b.on){
   tail='\n\n'+(PROMO.subtotal||'Subtotal')+': BZD '+money(b.sub)
      + '\n\uD83C\uDDE7\uD83C\uDDFF '+(PROMO.line||'')+': \u2212BZD '+money(b.off)
      + '\n'+(PROMO.final||'Final Order Total')+': BZD '+money(b.total);
  }else{
   tail='\n\n'+t('wa_total','Total')+': '+money(b.total)+' BZD';
  }
  // Who and how go first. A ticket the kitchen reads top down should say whose
  // it is and where it is going before it says what is in it.
  var w=who(), head='';
  if(w.name) head+='\n'+t('wa_name','Name')+': '+w.name;
  if(w.how)  head+='\n'+t('wa_how','Order for')+': '+w.how;
  if(w.how==='Delivery'){
   if(w.addr) head+='\n'+t('wa_addr','Address')+': '+w.addr;
   if(w.when) head+='\n'+t('wa_when','When')+': '+(w.when==='At a time'&&w.at?w.at:w.when);
  }
  if(head) head+='\n';
  if(w.how==='Delivery') tail+='\n'+t('wa_fee','Delivery charge to be confirmed on WhatsApp.');
  return t('wa_intro','Hi Taco Taco! I would like to place this order:')+'\n'+head+'\n'+lines.join('\n')+tail;
 }
 /* ---- the basket empties once the order has gone ----------------------
    It used to survive the handoff, so somebody who sent an order and then came
    back to the site found it still sitting there and sent it twice.

    The clearing waits for the page to actually be hidden rather than firing on
    the tap. If WhatsApp never opens, because a browser blocked the popup or the
    app is not installed, nothing was sent and the basket is still there to try
    again with. Only once the customer has genuinely left for WhatsApp does it
    empty.

    And because "left for WhatsApp" is not quite the same as "pressed send",
    the order is held for ten minutes and the empty basket offers it back. A
    customer who opened the draft, changed their mind and returned should not
    have to rebuild six lines from memory. */
 var clearTimer=null;
 var LKEY='tt_last_order_v1';
 function stashOrder(){
  try{localStorage.setItem(LKEY,JSON.stringify({at:Date.now(),items:basket}));}catch(e){}
 }
 function lastOrder(){
  try{
   var v=JSON.parse(localStorage.getItem(LKEY)||'null');
   if(v&&v.items&&v.items.length&&Date.now()-v.at<600000) return v;
  }catch(e){}
  return null;
 }
 function dropLast(){try{localStorage.removeItem(LKEY);}catch(e){}}
 function clearAfterSend(){
  if(clearTimer){clearTimeout(clearTimer);clearTimer=null;}
  if(!basket.length) return;
  stashOrder();
  basket=[];
  renderBar();saveBasket();renderPanel();
 }
 /* Armed only once WhatsApp has actually been handed the order. window.open
    returns nothing when a browser blocks the popup, and in that case nothing
    was sent and the basket must survive for a second try.

    Whichever comes first: the customer leaving for WhatsApp, or a short wait.
    Leaving is the honest signal and covers the phone, where the app takes over
    the screen. The wait covers a desktop where WhatsApp Web opened alongside
    and this page never went anywhere. */
 function armClear(){
  if(clearTimer) clearTimeout(clearTimer);
  clearTimer=setTimeout(clearAfterSend,1500);
 }
 addEventListener('visibilitychange',function(){
  if(document.visibilityState==='hidden'&&clearTimer) clearAfterSend();
 });
 addEventListener('pagehide',function(){ if(clearTimer) clearAfterSend(); });

 function sendToWhatsApp(text){
  var win=window.open('https://wa.me/'+WA_NUMBER+'?text='+encodeURIComponent(text),'_blank');
  if(win) armClear();
  return win;
 }

 $('bp-send').addEventListener('click',function(){
  if(!basket.length)return;
  if(!whoReady())return;
  saveWho();
  sendToWhatsApp(waText());
 });

 // Collapsible menu: expand/collapse; when collapsing, jump back to the menu top.
 var mc=$('menu-collapse'), mtog=$('menu-toggle');
 if(mc&&mtog){mtog.addEventListener('click',function(){
  var open=mc.classList.toggle('open');
  mtog.textContent=open?t('menu_close','Collapse Menu'):t('menu_open','View Full Menu');
  if(!open){var sec=document.getElementById('menu');if(sec)sec.scrollIntoView({behavior:'smooth',block:'start'});}
 });}

 /* ===================== the promotion popup =====================
    Shown once. "Once" is the browser session, so walking from the home page to
    the menu to the gallery does not mean meeting it three times, and closing
    the tab and coming back tomorrow does mean seeing it again.

    It opens as soon as this script runs, which is the end of HTML parsing, and
    that timing is deliberate rather than casual. A modal that covers the
    viewport becomes the largest contentful paint whenever it arrives, and the
    browser keeps revising that measurement until the visitor first touches the
    page. Opening it on a timer after load therefore does not avoid the cost,
    it moves the site's headline metric out to whenever the timer fires: on a
    trial here, waiting 700ms past load took the home page from 1.85s to 4.02s
    on a 4G connection while the page itself finished at exactly the same
    moment. Painting it with everything else costs nothing and the greeting
    arrives when the visitor arrives, which is what a greeting is for.

    Keyboard and screen reader: focus moves into the card and is kept there
    while it is open, Escape closes it, and focus goes back where it came from.
    Behind it the page cannot scroll, and it is the last thing in the DOM so a
    reader that ignores all of this still meets the page first. */
 (function(){
  var box=$('promo'); if(!box||!promoOn()) return;
  var card=box.querySelector('.promo-card');
  var key='tt_promo_'+(PROMO.id||'x');
  var shown=false, opener=null;

  function seen(){ try{return sessionStorage.getItem(key)==='1';}catch(e){return shown;} }
  function mark(){ shown=true; try{sessionStorage.setItem(key,'1');}catch(e){} }

  function focusables(){
   return card.querySelectorAll('a[href],button:not([disabled])');
  }
  function keep(e){
   if(e.key==='Escape'){ e.preventDefault(); close(); return; }
   if(e.key!=='Tab') return;
   var f=focusables(); if(!f.length) return;
   var first=f[0], last=f[f.length-1];
   if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
   else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
  }
  function open(){
   if(seen()) return;
   mark();
   opener=document.activeElement;
   box.hidden=false;
   requestAnimationFrame(function(){ box.classList.add('on'); });
   H.classList.add('promo-open');
   document.addEventListener('keydown',keep,true);
   var go=$('promo-go'); if(go) go.focus({preventScroll:true});
  }
  function close(){
   box.classList.remove('on');
   H.classList.remove('promo-open');
   document.removeEventListener('keydown',keep,true);
   setTimeout(function(){ box.hidden=true; },260);
   if(opener&&opener.focus) try{opener.focus({preventScroll:true});}catch(e){}
  }
  $('promo-x').addEventListener('click',close);
  // The button is a real link to the menu. Close first so the page behind is
  // scrollable again whether the browser navigates or stays put on #menu.
  $('promo-go').addEventListener('click',function(){ close(); });
  // Tapping the backdrop closes it, the card itself does not.
  box.addEventListener('click',function(e){ if(e.target===box) close(); });

  requestAnimationFrame(open);
 })();

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
    // An unrevealed block is not there as far as a finger is concerned, so the
    // rule has to be "anything with any part of it on screen", not "anything
    // nearly on screen". The 60 covers the 38px the hidden state is shifted
    // down by, which is counted in the rectangle we measure here: without it a
    // gallery tile poking into the bottom of the screen was visible enough to
    // aim at and still not taking the tap.
    if(el.getBoundingClientRect().top < vh + 60){el.classList.add('in');} else {next.push(el);}
   });
   pending=next;
   if(!pending.length){
    window.removeEventListener('scroll',rvTick); window.removeEventListener('resize',rvTick);
    document.removeEventListener('click',rvTick);
    document.removeEventListener('pointerdown',rvTick,true);
    document.removeEventListener('touchstart',rvTick,true);
   }
  }
  function rvTick(){ if(!rvQueued){rvQueued=true;rAF(sweep);} }
  window.addEventListener('scroll',rvTick,{passive:true});
  window.addEventListener('resize',rvTick);
  document.addEventListener('click',rvTick);   // layout shifts, e.g. expanding the menu
  // A finger coming down anywhere sweeps first. pointerdown and touchstart both
  // land before the browser decides what the tap hit, so whatever is under the
  // thumb is awake by the time it matters.
  document.addEventListener('pointerdown',rvTick,true);
  document.addEventListener('touchstart',rvTick,true);
  sweep();
  // One more once the images have arrived and the page has stopped moving.
  addEventListener('load',function(){ rvTick(); setTimeout(rvTick,300); });
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
 // Every photograph in the gallery gets a frame.

 var scrub=document.createElement('div'); scrub.className='scrub';
 var stage=document.createElement('div'); stage.className='scrub-stage';
 var deck=document.createElement('div'); deck.className='scrub-deck';
 // The frame keeps the address of its photograph but does not ask for it yet.
 // Cloning these with their src is what made the gallery take twenty seconds on
 // a slow line: forty-four copies of the grid, all of them sitting inside a
 // pinned stage at the top of the page, so every photograph on the page was
 // fetched before the reader had scrolled a pixel and the lazy loading on the
 // grid below counted for nothing. They load as the showcase reaches them now.
 var frames=imgs.map(function(im){
  var f=document.createElement('figure'); f.className='sf';
  var c=im.cloneNode(false);
  c.removeAttribute('class'); c.removeAttribute('loading');
  c.setAttribute('alt',im.getAttribute('alt')||'');
  c.setAttribute('data-src',im.getAttribute('src')||im.getAttribute('data-src'));
  c.removeAttribute('src'); c.removeAttribute('srcset');
  c.removeAttribute('data-srcset'); c.removeAttribute('sizes');
  f.appendChild(c); deck.appendChild(f); return f;
 });
 function want(i){
  // the one on show, and enough either side that a fast scroll never lands on
  // an empty frame
  for(var k=Math.max(0,i-2);k<=Math.min(frames.length-1,i+3);k++){
   var im=frames[k].firstChild, d=im&&im.getAttribute('data-src');
   if(d){ im.setAttribute('src',d); im.removeAttribute('data-src'); }
  }
 }
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

 // Pinned scrolling is budgeted rather than fixed per frame: at a flat 12vh each,
 // forty-odd photographs would hold the reader for six screens. The whole run is
 // kept to roughly three and a half, and a short gallery still gets the slower,
 // more deliberate pace it had.
 function step(){ return Math.min(0.12, 2.6/Math.max(1,N-1)); }
 function sizeIt(){ scrub.style.height=(window.innerHeight + (N-1)*window.innerHeight*step())+'px'; }
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
  want(Math.round(pos));
  bar.style.width=(p*100).toFixed(1)+'%';
 }
 function tick(){ if(!queued){queued=true;rAF(draw);} }
 window.addEventListener('scroll',tick,{passive:true});
 window.addEventListener('resize',function(){sizeIt();tick();});
 sizeIt(); want(0); draw();
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
  // Remember which flyer the finger went down on. A tap that lands while the
  // track is still sliding used to hit nothing at all, because the slide had
  // moved on by the time the finger lifted and no click was ever raised.
  var touchedSlide=null;
  car.addEventListener('touchstart',function(e){
   x0=e.touches[0].clientX; y0=e.touches[0].clientY; stop();
   var el=document.elementFromPoint(x0,y0);
   touchedSlide=el&&el.closest?el.closest('.dcar-slide'):null;
  },{passive:true});
  car.addEventListener('touchend',function(e){
   var dx=0,dy=0;
   if(x0!==null){ dx=e.changedTouches[0].clientX-x0; dy=e.changedTouches[0].clientY-y0; }
   x0=y0=null;
   var slide=touchedSlide; touchedSlide=null;
   if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)){ pauseFor(9000); show(dx<0?i+1:i-1); return; }
   if(slide&&slide.href&&Math.abs(dx)<12&&Math.abs(dy)<12){
    e.preventDefault();          // stop the browser raising its own click as well
    location.href=slide.href;
    return;
   }
   pauseFor(2500);               // a scroll went past, so pick back up shortly
  });
  car.addEventListener('touchcancel',function(){x0=y0=null;touchedSlide=null;pauseFor(2500);},{passive:true});
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
    warn.textContent=(STR.pick_one||t('pick_one','Please choose'))+': '+missing.join(', ');
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
  // Matches the .out transition: swap the words only once the old review has
  // left the card, so nobody sees the text change mid-slide.
  setTimeout(function(){
   render(card,r);
   inn.classList.remove('out'); inn.classList.add('in');
   requestAnimationFrame(function(){requestAnimationFrame(function(){inn.classList.remove('in');});});
  },310);
  slot++; nextRev++;
 }
 // One card changes per turn, so at three seconds a turn any given card holds
 // its review for twelve, which is long enough to read and short enough that
 // the band is plainly doing something.
 function play(){ if(held||timer) return; timer=setInterval(step,3000); }
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

/* ================= photo lightbox =================
   Anything carrying data-zoom opens full size on click, tap or Enter. The
   scroll-scrubbed showcase is left alone: a tap there belongs to the scrub. */
(function(){
 var lb=null, img=null, cap=null, lastFocus=null;

 function build(){
  lb=document.createElement('div');
  lb.className='lb';
  lb.setAttribute('role','dialog');
  lb.setAttribute('aria-modal','true');
  lb.setAttribute('aria-label','Photo');
  lb.innerHTML='<button type="button" class="lb-close" aria-label="'+t('close_photo','Close photo')+'">×</button>'+
   '<figure class="lb-fig"><img class="lb-img" alt=""><figcaption class="lb-cap"></figcaption></figure>';
  document.body.appendChild(lb);
  img=lb.querySelector('.lb-img');
  cap=lb.querySelector('.lb-cap');
  lb.addEventListener('click',function(e){
   if(e.target===lb||(e.target.closest&&e.target.closest('.lb-close'))) close();
  });
 }

 function open(src,title,alt){
  if(!src) return;
  if(!lb) build();
  lastFocus=document.activeElement;
  img.src=src;
  img.alt=alt||title||'';
  cap.textContent=title||'';
  cap.hidden=!title;
  document.documentElement.classList.add('lb-open');
  lb.classList.add('on');
  lb.querySelector('.lb-close').focus();
 }

 function close(){
  if(!lb||!lb.classList.contains('on')) return;
  lb.classList.remove('on');
  document.documentElement.classList.remove('lb-open');
  if(lastFocus&&lastFocus.focus) try{lastFocus.focus();}catch(e){}
 }

 function target(el){
  if(!el||!el.closest) return null;
  var t=el.closest('[data-zoom]');
  return (t&&!t.closest('.scrub'))?t:null;
 }
 function fire(t){
  open(t.getAttribute('data-zoom'), t.getAttribute('data-zoom-title')||'', t.getAttribute('alt'));
 }

 document.addEventListener('click',function(e){
  var t=target(e.target);
  if(!t) return;
  e.preventDefault();
  fire(t);
 });
 // An <img> is not focusable on its own, so it carries tabindex and answers Enter.
 document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){close();return;}
  if(e.key!=='Enter') return;
  var a=document.activeElement;
  if(!a||a.tagName==='BUTTON') return;          // a real button already gets a click
  var t=target(a);
  if(!t) return;
  e.preventDefault();
  fire(t);
 });
 addEventListener('popstate',close);
})();

/* ================= what is cooking: drifting video chips =================
   Four thumbnails wander round a square stage, bounce off the walls and off each
   other, and where there are more clips than places a chip quietly swaps to one
   that is not on show.

   The three things that went wrong on a real phone, and what stops them here:

   1. The chips piled into the top corner, cut in half. The stage is sized by
      aspect-ratio, and on iOS that height is sometimes still 0 when a deferred
      script runs, so every chip was seeded at y=0 and drawn half above the top
      edge. Nothing recovered because a zero-height target never reaches an
      IntersectionObserver threshold, so the loop that would have clamped them
      back inside was never started. Now the stage cannot measure as zero, the
      animation starts on its own rather than waiting to be seen, and any frame
      that finds a position outside the box or not a number re-seeds.
   2. The flicker. A resize, which iOS fires every time the address bar slides,
      rescaled every position by the new size over the old one: one zero-height
      reading turned all four into 0 or NaN for a frame. Size changes now go
      through a clamp instead of a multiply, and are watched on the stage itself.
   3. The swap flashed the empty stage. The picture is loaded before the fade,
      not after it, and the chips take turns rather than being picked at random. */
(function(){
 var stage=document.getElementById('reel');
 if(!stage) return;
 var chips=[].slice.call(stage.querySelectorAll('.chip'));
 if(!chips.length) return;
 var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;

 var spares=[].slice.call(stage.querySelectorAll('.chip-spare')).map(function(t){
  return {id:t.getAttribute('data-id'), title:t.getAttribute('data-title'), img:t.getAttribute('data-img')};
 });

 if(reduce){                                  // lay them out and leave them alone
  stage.classList.add('reel-still');
  chips.forEach(function(c,i){
   c.style.position='absolute';
   var col=i%3, row=(i/3)|0;
   c.style.left=(4+col*33)+'%'; c.style.top=(6+row*48)+'%'; c.style.width='30%';
  });
  return;
 }

 var W=0,H=0,R=0, running=false, raf=null;
 var P=chips.map(function(){return {x:0,y:0,vx:0,vy:0};});
 // Six starting places round a ring rather than four in the corners, so they
 // begin spread out instead of shuffling apart in front of the reader.
 var SPOTS=[[0.26,0.22],[0.72,0.24],[0.82,0.58],[0.56,0.82],[0.24,0.76],[0.16,0.48]];

 function num(v,fb){ return (typeof v==='number'&&isFinite(v)&&v>0)?v:fb; }
 function measure(){
  var r=stage.getBoundingClientRect();
  W=num(stage.clientWidth,  num(r.width, 300));
  // The stage is square by design, so its own width is a better answer for the
  // height than the 0 the browser sometimes hands back mid-layout.
  H=num(stage.clientHeight, num(r.height, W));
  if(H<W*0.5) H=W;                            // a flat reading is a wrong reading
  R=num(chips[0].offsetWidth,W*0.42)/2;
  if(R>W/2) R=W/2;
 }
 function seedOne(p,i){
  var s=SPOTS[i%SPOTS.length];
  p.x=s[0]*W; p.y=s[1]*H;
  var a=Math.random()*Math.PI*2, sp=18+Math.random()*14;      // px per second
  p.vx=Math.cos(a)*sp; p.vy=Math.sin(a)*sp;
 }
 function seed(){ measure(); P.forEach(seedOne); }

 // One guard for every way a position can go wrong: a stray NaN, a stale value
 // from before a resize, a chip nudged through a wall by an overlap correction.
 function contain(){
  P.forEach(function(p,i){
   if(!isFinite(p.x)||!isFinite(p.y)||!isFinite(p.vx)||!isFinite(p.vy)){ seedOne(p,i); return; }
   if(p.x<R)     p.x=R;     else if(p.x>W-R) p.x=W-R;
   if(p.y<R)     p.y=R;     else if(p.y>H-R) p.y=H-R;
  });
 }
 function place(){
  P.forEach(function(p,i){
   chips[i].style.transform='translate3d('+(p.x-R).toFixed(1)+'px,'+(p.y-R).toFixed(1)+'px,0)';
  });
 }

 var last=0;
 function frame(t){
  if(!running) return;
  var dt=Math.min(0.05,(t-(last||t))/1000); last=t;
  P.forEach(function(p){
   p.x+=p.vx*dt; p.y+=p.vy*dt;
   if(p.x<R){p.x=R;p.vx=Math.abs(p.vx);} else if(p.x>W-R){p.x=W-R;p.vx=-Math.abs(p.vx);}
   if(p.y<R){p.y=R;p.vy=Math.abs(p.vy);} else if(p.y>H-R){p.y=H-R;p.vy=-Math.abs(p.vy);}
  });
  // equal masses, so a collision simply trades the velocity along the line of centres
  for(var i=0;i<P.length;i++)for(var j=i+1;j<P.length;j++){
   var a=P[i],b=P[j], dx=b.x-a.x, dy=b.y-a.y, d=Math.hypot(dx,dy)||0.001, min=R*2;
   if(d>=min) continue;
   var nx=dx/d, ny=dy/d, overlap=(min-d)/2;
   a.x-=nx*overlap; a.y-=ny*overlap; b.x+=nx*overlap; b.y+=ny*overlap;
   var av=a.vx*nx+a.vy*ny, bv=b.vx*nx+b.vy*ny, diff=bv-av;
   a.vx+=diff*nx; a.vy+=diff*ny; b.vx-=diff*nx; b.vy-=diff*ny;
  }
  contain();
  place();
  raf=requestAnimationFrame(frame);
 }
 function start(){ if(running||held) return; running=true; last=0; raf=requestAnimationFrame(frame); }
 function stop(){ running=false; if(raf) cancelAnimationFrame(raf); raf=null; }

 // Swap a chip for a clip that is not currently on show. The picture is fetched
 // and decoded first, so the fade lands on a loaded image instead of a gap.
 var swap=null, turn=0;
 function rotate(){
  if(!spares.length) return;
  var c=chips[turn++ % chips.length];          // in turn, not at random: calmer
  var next=spares.shift();
  var pre=new Image();
  pre.onload=pre.onerror=function(){
   var out={id:c.getAttribute('data-id'),
            title:c.querySelector('.chip-cap').textContent,
            img:c.querySelector('.chip-img').style.backgroundImage.slice(5,-2)};
   c.classList.add('swapping');
   setTimeout(function(){
    c.setAttribute('data-id',next.id);
    c.setAttribute('href','gallery.html#v-'+next.id);
    c.setAttribute('aria-label',t('watch','Watch')+': '+next.title);
    c.querySelector('.chip-cap').textContent=next.title;
    c.querySelector('.chip-img').style.backgroundImage="url('"+next.img+"')";
    c.classList.remove('swapping');
    spares.push(out);
   },440);
  };
  pre.src=next.img;
 }

 seed(); contain(); place();

 // Watch the stage, not the window. iOS fires a window resize every time the
 // address bar slides, and rescaling by old-size-over-new was how one bad
 // reading turned into four chips in the corner.
 function resize(){
  measure(); contain(); place();
  if(!running) start();
 }
 if('ResizeObserver' in window){ new ResizeObserver(resize).observe(stage); }
 addEventListener('resize', resize);
 addEventListener('orientationchange', function(){ setTimeout(resize, 250); });

 // A moving target is hard to tap, and a chip that shifts between finger down and
 // finger up loses the click entirely. Freeze the moment anyone reaches for one,
 // and always arm a release, so a scroll that begins on the stage cannot leave it
 // frozen for the rest of the visit.
 var held=false, resume=null, visible=true;
 // safety: a touch arms its own release, because iOS drops pointerup and
 // pointercancel often enough that a scroll begun on the stage used to freeze it
 // for good. A mouse or a keyboard has a reliable partner event, so those hold
 // until they get it.
 function hold(safety){ held=true; clearTimeout(resume); stop();
  if(safety) resume=setTimeout(function(){held=false; if(visible) start();}, safety); }
 function release(ms){ clearTimeout(resume);
  resume=setTimeout(function(){held=false; if(visible) start();}, ms||900); }
 // Belt and braces for a moving target. The chips freeze the moment a finger
 // lands, but that depends on pointerdown arriving, and a browser that does not
 // send it leaves the chip drifting through the gesture, which is exactly when a
 // browser decides the tap was not a tap and drops the click. So note which chip
 // was under the finger and follow it ourselves if the finger barely moved.
 var tx=null, ty=null, tapped=null;
 stage.addEventListener('touchstart',function(e){
  var t=e.touches[0]; tx=t.clientX; ty=t.clientY;
  var el=document.elementFromPoint(tx,ty);
  tapped=el&&el.closest?el.closest('.chip'):null;
 },{passive:true});
 stage.addEventListener('touchend',function(e){
  var c=tapped; tapped=null;
  if(!c||tx===null){ tx=ty=null; return; }
  var t=e.changedTouches[0], dx=t.clientX-tx, dy=t.clientY-ty;
  tx=ty=null;
  if(Math.abs(dx)<12 && Math.abs(dy)<12 && c.href){
   e.preventDefault();          // and do not let the browser raise its own click
   location.href=c.href;
  }
 });
 stage.addEventListener('touchcancel',function(){tapped=null;tx=ty=null;},{passive:true});
 stage.addEventListener('pointerdown',function(){hold(2500);});
 stage.addEventListener('pointerup',function(){release(900);});
 stage.addEventListener('pointercancel',function(){release(600);});
 stage.addEventListener('pointerleave',function(){release(300);});
 stage.addEventListener('mouseenter',function(){hold(0);});
 stage.addEventListener('mouseleave',function(){release(150);});
 stage.addEventListener('focusin',function(){hold(0);});
 stage.addEventListener('focusout',function(){release(400);});

 // Start now. Being seen only decides whether to keep going: a stage that has
 // not been measured yet cannot satisfy a ratio threshold, and waiting on one is
 // what left the chips stacked in the corner with nothing running to free them.
 start();
 if(spares.length) swap=setInterval(rotate,7000);
 if('IntersectionObserver' in window){
  new IntersectionObserver(function(es){
   es.forEach(function(e){
    visible=e.isIntersecting;
    if(visible){ resize(); } else { stop(); }
   });
  },{threshold:0}).observe(stage);
 }
 document.addEventListener('visibilitychange',function(){
  if(document.hidden){ stop(); } else { resize(); }
 });
})();

/* Arriving at the gallery from a chip: go to that clip and offer it up.
   Playback is not forced with the sound on, because a browser will refuse it and
   the clip would be muted, which is the one thing we were asked not to do. */
(function(){
 if(!/gallery\.html$|gallery\.html#/.test(location.pathname+location.hash)) return;
 function cue(){
  var id=location.hash.replace('#','');
  if(!/^v-/.test(id)) return;
  var fig=document.getElementById(id);
  if(!fig) return;
  fig.scrollIntoView({block:'center'});
  fig.classList.add('cued');
  var v=fig.querySelector('video');
  if(v){ v.preload='auto'; v.load(); try{v.focus({preventScroll:true});}catch(e){} }
  setTimeout(function(){fig.classList.remove('cued');},4000);
 }
 addEventListener('load',function(){setTimeout(cue,60);});
 addEventListener('hashchange',cue);
})();

/* ================= fly in with a pop =================
   Cards spring up as they reach the screen, and every few seconds the ones on
   screen break rank top to bottom and jump at the reader.

   About the sound: a browser will not let a page make a noise until the visitor
   has touched it at least once, so the pop is armed on the first tap, key press
   or click anywhere on the site and stays armed after that. Before that first
   touch the cards still fly in, silently, because the alternative is a console
   full of blocked-autoplay errors and no sound either way. Nothing is
   downloaded: the pop is three lines of arithmetic in the browser's own audio
   engine, so it costs no bytes and never has to load in time. */
(function(){
 var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

 var AC = window.AudioContext || window.webkitAudioContext, ctx = null;
 function arm(){
  if(!AC) return;
  try{
   if(!ctx) ctx = new AC();
   if(ctx.state === 'suspended') ctx.resume();
  }catch(e){ ctx = null; }
 }
 // Not once(): iOS suspends the audio context again when the tab goes away, so
 // the next real gesture has to be able to wake it back up.
 ['pointerdown','touchend','keydown','click'].forEach(function(ev){
  addEventListener(ev, arm, {passive:true, capture:true});
 });

 function pop(){
  if(reduce || !ctx || ctx.state !== 'running') return;
  try{
   var t = ctx.currentTime;
   var o = ctx.createOscillator(), g = ctx.createGain();
   o.type = 'sine';
   o.frequency.setValueAtTime(880, t);                        // cork out of a bottle:
   o.frequency.exponentialRampToValueAtTime(190, t + 0.075);  // fast drop, short tail
   g.gain.setValueAtTime(0.0001, t);
   g.gain.exponentialRampToValueAtTime(0.13, t + 0.006);
   g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
   o.connect(g); g.connect(ctx.destination);
   o.start(t); o.stop(t + 0.14);
  }catch(e){}
 }

 function topFirst(a,b){
  var ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
  return (ra.top - rb.top) || (ra.left - rb.left);
 }

 function popGroup(cards){
  if(!cards.length) return;

  if(reduce){ cards.forEach(function(c){ c.classList.add('pop-done'); }); return; }

  cards.forEach(function(c){ c.classList.add('pop-in'); });

  function settle(c){
   c.classList.remove('pop-in','popped');
   c.classList.add('pop-done');
  }
  function enter(c, i, sound){
   if(c._popped) return;
   c._popped = true;
   setTimeout(function(){
    c.classList.add('popped');
    var done = function(){
     clearTimeout(c._popTimer);
     c.removeEventListener('animationend', done);
     settle(c);
    };
    c.addEventListener('animationend', done);
    c._popTimer = setTimeout(done, 1000);   // in case animationend never arrives
    if(sound) setTimeout(pop, 310);         // on the settle, not the launch
   }, i * 130);
  }

  // Bottom margin rather than a share of the card: a card taller than the screen
  // would never reach a percentage threshold and would never fly in at all.
  var opts = {threshold: 0.01, rootMargin: '0px 0px -60px 0px'};

  if(!('IntersectionObserver' in window)){
   cards.slice().sort(topFirst).forEach(function(c,i){ enter(c, i, false); });
  } else {
   var io = new IntersectionObserver(function(entries){
    var hits = [];
    entries.forEach(function(e){
     if(e.isIntersecting && !e.target._popped){ hits.push(e.target); io.unobserve(e.target); }
    });
    hits.sort(topFirst);
    // A long grid can bring a dozen cards over the line at once. Three pops is a
    // flourish; a dozen is a noise, so only the front of the wave is audible.
    hits.forEach(function(c,i){ enter(c, i, i < 3); });
   }, opts);
   cards.forEach(function(c){ io.observe(c); });
  }

  // Break rank every few seconds, top to bottom, but only the cards on screen.
  setInterval(function(){
   if(document.hidden) return;
   var vis = cards.filter(function(c){
    if(!c._popped) return false;
    var r = c.getBoundingClientRect();
    return r.bottom > 40 && r.top < (innerHeight || 800) - 40;
   }).sort(topFirst);
   if(!vis.length) return;
   vis.forEach(function(c,i){
    setTimeout(function(){
     c.classList.remove('pop-jump');
     void c.offsetWidth;                    // rewind the animation so it replays
     c.classList.add('pop-jump');
    }, i * 150);
   });
  }, 3600);

  document.addEventListener('animationend', function(e){
   if(e.animationName === 'ttPopJump') e.target.classList.remove('pop-jump');
  });
 }

 function q(sel){ return [].slice.call(document.querySelectorAll(sel)); }
 popGroup(q('.about-points .apoint'));   // About: the three feature cards
 popGroup(q('.rev-grid .rev'));          // Reviews page: the Google reviews
})();

/* ================= language =================
   The switch itself is a plain link, so it works with no JavaScript at all.
   This only records the choice, so that the next landing on an English page
   does not send a Spanish-phone reader back to Spanish against their wishes,
   and the other way round. Their choice outranks their phone's setting. */
(function(){
 [].slice.call(document.querySelectorAll('.lang-switch a')).forEach(function(a){
  a.addEventListener('click',function(){
   try{localStorage.setItem('tt_lang',a.getAttribute('data-lang'));}catch(e){}
  });
 });
})();

/* ================= tapping the page you are already on =================
   Reviews, from the Reviews page, used to be a tap that did nothing: the
   browser sees the same address and stays put, and the reader is left halfway
   down wondering whether they missed. Take them to the top of it instead, and
   close the Browse drawer on the way so they can see they arrived. */
(function(){
 function here(){ return location.pathname.split('/').pop() || 'index.html'; }
 document.addEventListener('click', function(e){
  var a = e.target.closest && e.target.closest('a[href]');
  if(!a) return;
  var href = a.getAttribute('href') || '';
  if(!/\.html$/.test(href) || href.indexOf('/') !== -1) return;   // same folder only
  if(href !== here()) return;
  e.preventDefault();
  var d = a.closest('details'); if(d) d.open = false;
  try{ window.scrollTo({top:0, behavior:'smooth'}); }catch(err){ window.scrollTo(0,0); }
 });
})();


/* ================= tiles that wait their turn =================
   The gallery grid is forty-four photographs a long way below the fold, and
   loading="lazy" was not holding them back: the browser widens its own idea of
   "near the screen" to thousands of pixels when the connection is slow, so on
   the one connection where it matters the entire page was fetched before the
   reader had moved. On a phone that read as a gallery that took forever.

   So the tiles carry their address rather than their picture, and this fills it
   in eight hundred pixels before they arrive, which is far enough that nobody
   scrolling normally sees a gap. Without JavaScript the noscript copy in the
   markup shows instead, so the gallery still works. */
(function(){
 var lz=[].slice.call(document.querySelectorAll('img.lz'));
 if(!lz.length) return;
 function load(im){
  var ss=im.getAttribute('data-srcset'), s=im.getAttribute('data-src');
  if(ss){ im.setAttribute('srcset',ss); im.removeAttribute('data-srcset'); }
  if(s){ im.setAttribute('src',s); im.removeAttribute('data-src'); }
  im.classList.remove('lz-wait');
 }
 lz.forEach(function(i){ i.classList.add('lz-wait'); });
 if(!('IntersectionObserver' in window)){ lz.forEach(load); return; }
 var io=new IntersectionObserver(function(es){
  es.forEach(function(e){ if(e.isIntersecting){ load(e.target); io.unobserve(e.target); } });
 },{rootMargin:'800px 0px'});
 lz.forEach(function(i){ io.observe(i); });
})();
