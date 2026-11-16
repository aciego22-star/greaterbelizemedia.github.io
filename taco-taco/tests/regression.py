import http.server, socketserver, threading, functools, re, os, sys
from playwright.sync_api import sync_playwright
D="/home/user/greaterbelizemedia.github.io/taco-taco/dist"
H=functools.partial(http.server.SimpleHTTPRequestHandler, directory=D)
class Q(socketserver.TCPServer):
    allow_reuse_address=True
    def log_message(self,*a): pass
srv=Q(("127.0.0.1",8735),H); threading.Thread(target=srv.serve_forever,daemon=True).start()
B="http://127.0.0.1:8735"
fails=[]
def ck(c,m):
    print(("  PASS  " if c else "  FAIL  ")+m)
    if not c: fails.append(m)

with sync_playwright() as p:
    br=p.chromium.launch(executable_path="/opt/pw-browsers/chromium", args=["--no-sandbox"])
    ctx=br.new_context(viewport={"width":390,"height":844})
    pg=ctx.new_page()
    pg.on("pageerror", lambda e: fails.append("JS error: %s"%e))

    print("\n[1] REACHABILITY: every internal link resolves")
    seen=set(); queue=["/index.html"]; broken=[]
    while queue:
        u=queue.pop(0)
        if u in seen: continue
        seen.add(u)
        r=pg.request.get(B+u)
        if r.status!=200: broken.append("%s -> %d"%(u,r.status)); continue
        if not u.endswith(".html"): continue
        html=r.text()
        for href in re.findall(r'href="([^"#?]+)"', html):
            if href.startswith(("http","mailto","tel","javascript")): continue
            base = u.rsplit("/",1)[0]
            tgt = href if href.startswith("/") else os.path.normpath(base+"/"+href)
            if not tgt.startswith("/"): tgt="/"+tgt
            if tgt.endswith(".html") or tgt.endswith(".xml") or tgt.endswith(".txt"):
                queue.append(tgt)
    ck(not broken, "all internal links 200 (%d pages crawled)"%len(seen))
    for b in broken: print("      ", b)

    print("\n[2] GST + DELIVERY MATH")
    pg.goto(B+"/index.html", wait_until="load"); pg.wait_for_timeout(600)
    # dismiss popups
    for sel in ["#intro-x","#promo-x","#gstbar .gstbar-x"]:
        el=pg.query_selector(sel)
        if el and el.is_visible(): el.click(); pg.wait_for_timeout(200)
    gst=pg.evaluate("()=>window.TT_GST")
    print("   TT_GST:", gst)
    ck(gst and gst.get("on") is True, "GST is on")
    ck(gst and abs(gst.get("rate",0)-12.5)<0.001, "GST rate is 12.5")
    # add a known item via the menu page
    pg.goto(B+"/menu.html", wait_until="load"); pg.wait_for_timeout(600)
    for sel in ["#intro-x","#promo-x","#gstbar .gstbar-x"]:
        el=pg.query_selector(sel)
        if el and el.is_visible(): el.click(); pg.wait_for_timeout(200)
    _all=pg.query_selector_all(".add-btn")
    _plain=[b for b in _all if not b.get_attribute("data-meat")]
    btn=_plain[0] if _plain else (_all[0] if _all else None)
    ck(btn is not None, "menu has an add control")
    def money(sel):
        el=pg.query_selector(sel)
        if not el: return None
        t=el.inner_text().replace("$","").replace(",","").replace("-","").strip()
        try: return float(t)
        except: return None
    def shown(sel):
        el=pg.query_selector(sel)
        return bool(el) and el.is_visible()
    def openbasket():
        for _ in range(3):
            if shown("#bp-sum"): return
            b=pg.query_selector("#bb-view")
            if b and b.is_visible():
                b.click(); pg.wait_for_timeout(600)
            else:
                return
    if btn:
        price=float(btn.get_attribute("data-price").replace("$",""))
        name=btn.get_attribute("data-name")
        print("   adding: %s $%.2f"%(name,price))
        btn.scroll_into_view_if_needed(); btn.click(); pg.wait_for_timeout(700)
        n=pg.evaluate("()=>{try{return JSON.parse(localStorage.getItem('tt_basket_v1')||'[]').length}catch(e){return 0}}")
        ck(n==1, "item lands in the basket (%d)"%n)
        bar=pg.query_selector("#basket-bar")
        print("   bar:", bar.inner_text().replace("\n"," ") if bar and bar.is_visible() else "(hidden)")
        openbasket()
        ck(shown("#bp-sum"), "basket panel opens from the bar")
        sub=money("#bp-sub"); gstv=money("#bp-gst"); tot=money("#bp-total")
        print("   sub=%s gst=%s total=%s  fee_row=%s gst_row=%s"%(sub,gstv,tot,shown("#bp-fee-row"),shown("#bp-gst-row")))
        ck(sub is not None and sub>=price, "subtotal renders and covers the item price (%s)"%sub)
        ck(shown("#bp-gst-row"), "GST row is visible")
        ck(gstv is not None and gstv>0, "GST amount renders")
        if sub is not None and gstv is not None:
            ck(abs(gstv-round(sub*0.125,2))<0.02, "GST = 12.5%% of subtotal (%.2f vs %.2f)"%(gstv, round(sub*0.125,2)))
            ck(tot is not None and abs(tot-round(sub+gstv,2))<0.02, "total = subtotal + GST on pickup (%s)"%tot)
        ck(not shown("#bp-fee-row"), "no delivery fee row on pickup")
        ck(not shown(".bp-disc"), "no discount row when nothing is discounted")
        print("   -- delivery zones --")
        dl=pg.query_selector("input[name='bp-fulfil'][value='Delivery']")
        ck(dl is not None, "Delivery option exists")
        if dl:
            dl.click(force=True); pg.wait_for_timeout(700)
            for z in pg.query_selector_all("input[name='bp-zone']"):
                f=float(z.get_attribute("data-fee")); zn=z.get_attribute("value")
                z.click(force=True); pg.wait_for_timeout(500)
                s2=money("#bp-sub"); fe=money("#bp-fee"); g2=money("#bp-gst"); t2=money("#bp-total")
                print("      %-36s fee=%s sub=%s gst=%s total=%s"%(zn,fe,s2,g2,t2))
                ck(shown("#bp-fee-row"), "fee row shows for %s"%zn)
                ck(fe is not None and abs(fe-f)<0.01, "fee is $%d for %s"%(f,zn))
                if s2 is not None and g2 is not None:
                    ck(abs(g2-round((s2+f)*0.125,2))<0.02, "GST charged on food + the $%d delivery (%.2f vs %.2f)"%(f,g2,round((s2+f)*0.125,2)))
                    ck(t2 is not None and abs(t2-round(s2+f+g2,2))<0.02, "total = food + $%d delivery + GST (%s)"%(f,t2))
            pk=pg.query_selector("input[name='bp-fulfil'][value='Pickup']")
            if pk:
                pk.click(force=True); pg.wait_for_timeout(600)
                ck(not shown("#bp-fee-row"), "fee row clears when switching back off delivery")
                s3=money("#bp-sub"); g3=money("#bp-gst"); t3=money("#bp-total")
                print("      back to pickup: sub=%s gst=%s total=%s"%(s3,g3,t3))
                if s3 is not None and g3 is not None:
                    ck(t3 is not None and abs(t3-round(s3+g3,2))<0.02, "total drops back to food + GST (%s)"%t3)
        print("   -- collection time --")
        for val in ["Pickup","Dine-In"]:
            r=pg.query_selector("input[name='bp-fulfil'][value='%s']"%val)
            if r:
                r.click(force=True); pg.wait_for_timeout(500)
                ck(shown("#bp-whenbox"), "collection time shows for %s"%val)

    print("\n[3] SEASONAL ITEMS (until 2026-11-30, today 2026-11-16)")
    season=pg.evaluate("()=>window.TT_SEASON")
    print("   TT_SEASON:", season)
    ck(season and len(season)==5, "5 seasonal items shipped (%d)"%(len(season) if season else 0))
    rows=pg.eval_on_selector_all(".mi[data-until]","e=>e.map(x=>x.querySelector('.mi-name').innerText)")
    print("   visible seasonal rows:", rows)
    ck(len(rows)==5, "all 5 seasonal rows still visible in November (%d)"%len(rows))
    badges=pg.eval_on_selector_all(".mi[data-until] .mi-new","e=>e.length")
    ck(badges==5, "each seasonal row carries a New badge (%d)"%badges)
    thumbs=pg.eval_on_selector_all(".mi[data-until] .mi-thumb:not(.mi-thumb-none)","e=>e.map(x=>(x.style.backgroundImage.match(/[^/]+\\.webp/)||['?'])[0])")
    print("   seasonal thumbs:", thumbs)
    ck(len(thumbs)==4, "4 of 5 seasonal rows have a photo, pecan pie has none (%d)"%len(thumbs))
    named=pg.eval_on_selector_all(".mi[data-until]","e=>e.map(x=>x.querySelector('.mi-name').innerText+(x.querySelector('.mi-thumb:not(.mi-thumb-none)')?' [photo]':' [no photo, spacer]'))")
    for n in named: print("     ", n)

    print("\n[4] SEASONAL EXPIRY (simulated 2026-12-01)")
    pg2=ctx.new_page()
    pg2.add_init_script("""
      const F=Date; const T=new F('2026-12-01T12:00:00Z').getTime();
      Date=class extends F{constructor(...a){if(!a.length)super(T);else super(...a);}
        static now(){return T;}};
      Date.UTC=F.UTC; Date.parse=F.parse;
    """)
    pg2.goto(B+"/menu.html", wait_until="load"); pg2.wait_for_timeout(800)
    rows2=pg2.eval_on_selector_all(".mi[data-until]","e=>e.length")
    ck(rows2==0, "seasonal rows removed on 1 December (%d left)"%rows2)
    pg2.goto(B+"/index.html", wait_until="load"); pg2.wait_for_timeout(800)
    favs=pg2.eval_on_selector_all(".fav[data-until]","e=>e.length")
    ck(favs==0, "seasonal crowd-favourite cards removed on 1 December (%d left)"%favs)
    empty=pg2.eval_on_selector_all(".mcat","e=>e.filter(c=>!c.querySelector('.mi')).length")
    ck(empty==0, "no empty menu category left behind (%d)"%empty)
    pg2.close()

    print("\n[5] DELIVERY ZONES")
    pg.goto(B+"/index.html", wait_until="load"); pg.wait_for_timeout(600)
    for sel in ["#intro-x","#promo-x","#gstbar .gstbar-x"]:
        el=pg.query_selector(sel)
        if el and el.is_visible(): el.click(); pg.wait_for_timeout(200)
    zones=pg.eval_on_selector_all(".bp-zone-opt","e=>e.map(x=>x.innerText.replace(/\\n/g,' ')+' | fee='+x.querySelector('input').getAttribute('data-fee'))")
    for z in zones: print("   ", z)
    ck(len(zones)==2, "two delivery zones offered (%d)"%len(zones))
    txt=" ".join(zones).lower()
    for place in ["belmopan","armenia","roaring creek","camalote"]:
        ck(place in txt, "zone copy names %s"%place)

    print("\n[6] INTRO POPUP")
    ctx3=br.new_context(viewport={"width":390,"height":844})
    pg3=ctx3.new_page()
    pg3.goto(B+"/index.html", wait_until="load"); pg3.wait_for_timeout(900)
    box=pg3.query_selector("#intro")
    ck(box is not None and box.is_visible(), "intro popup shows on first visit")
    if box:
        t=box.inner_text().lower()
        ck("carnitas" in t, "intro copy mentions carnitas")
        ck("limited time" in t or "while supplies last" in t, "intro copy carries the limited-time line")
        v=box.query_selector("video")
        ck(v is not None, "intro video element present")
        if v: print("   video src:", v.get_attribute("src") or (v.query_selector("source").get_attribute("src") if v.query_selector("source") else "?"))
        x=pg3.query_selector("#intro-x"); x.click(); pg3.wait_for_timeout(400)
        ck(not box.is_visible(), "intro popup closes")
    pg3.reload(wait_until="load"); pg3.wait_for_timeout(900)
    box2=pg3.query_selector("#intro")
    ck(box2 is None or not box2.is_visible(), "intro popup does not reappear in the same session")
    pg3.close(); ctx3.close()

    print("\n[7] ARTICLES / SEO")
    for slug in ["meats-belmopan.html","birria-belmopan.html","taco-taco-mexican-restaurant-belmopan.html"]:
        for pre in ["","es/"]:
            r=pg.request.get(B+"/"+pre+slug)
            ck(r.status==200, "%s%s serves 200"%(pre,slug))
    sm=pg.request.get(B+"/sitemap.xml").text()
    ck(sm.count("<loc>")==20, "sitemap lists 20 urls (%d)"%sm.count("<loc>"))
    for slug in ["meats-belmopan","birria-belmopan","taco-taco-mexican-restaurant-belmopan"]:
        ck(("/%s.html"%slug) in sm and ("/es/%s.html"%slug) in sm, "sitemap has both languages of %s"%slug)
    html=pg.request.get(B+"/meats-belmopan.html").text()
    ck('rel="canonical"' in html, "article has a canonical tag")
    ck('hreflang' in html, "article has hreflang alternates")
    ck('"@type": "Article"' in html or '"@type":"Article"' in html, "article carries Article structured data")
    ck('"datePublished"' in html, "article declares datePublished")
    ck('property="og:image"' in html, "article has an og:image")
    llms=pg.request.get(B+"/llms.txt").text()
    ck("meats-belmopan" in llms, "llms.txt lists the new article")

    ctx.close(); br.close()
srv.shutdown()
print("\n==== %d failure(s) ====" % len(fails))
for f in fails: print(" -", f)
sys.exit(1 if fails else 0)
