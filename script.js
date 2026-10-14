(function(){
  "use strict";
  var C = window.WEDDING;
  document.documentElement.classList.add("js");
  var $ = function(s,r){return (r||document).querySelector(s)};
  var $$ = function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};

  /* ---- fill text from config ---- */
  var bind = {
    groomShort:C.groomShort, brideShort:C.brideShort, venueLine1:C.venueLine1, venueLine2:C.venueLine2,
    groom:C.groom, bride:C.bride, groomUpper:C.groom.toUpperCase(), brideUpper:C.bride.toUpperCase(),
    venue:C.venue, address:C.address
  };
  $$("[data-bind]").forEach(function(el){ var k=el.getAttribute("data-bind"); if(bind[k]) el.textContent=bind[k]; });

  bind.dateLine = C.weekday+", "+C.dateLabel+" \u00b7 "+C.timeLabel;
  $$("[data-bind=dateLine]").forEach(function(el){ el.textContent=bind.dateLine; });
  $("#introPhoto").src = C.introPhoto;
  $("#introPhoto").style.objectPosition = C.introFocus || "50% 40%";
  $("#closingImg").src = C.closingPhoto;
  $("#closingImg").style.objectPosition = C.closingFocus || "50% 50%";

  /* ---- opening animation: replay ---- */
  var intro = $("#top");
  $("#replay").addEventListener("click", function(){
    intro.classList.remove("play"); void intro.offsetWidth; intro.classList.add("play");
  });
  (function(){
    var started=false;
    function go(){ if(started) return; started=true; requestAnimationFrame(function(){ requestAnimationFrame(function(){ intro.classList.add("play"); }); }); }
    var imgs=[].slice.call(intro.querySelectorAll("img")).map(function(i){ return i.decode ? i.decode().catch(function(){}) : Promise.resolve(); });
    Promise.all(imgs).then(go);
    setTimeout(go,1500);
  })();

  /* ---- background music: starts on the guest's first tap, can be switched off ---- */
  (function(){
    var btn=$("#music"), a=$("#bgm");
    if(!C.music){ btn.hidden=true; return; }
    a.volume=C.musicVolume==null?0.5:C.musicVolume; var started=false, userOff=false;
    function ui(){ var on=!a.paused; btn.setAttribute("aria-pressed",on); btn.setAttribute("aria-label",on?"Turn music off":"Turn music on"); $(".mlabel",btn).textContent=on?"Music on":"Music"; }
    function play(){ if(!a.src) a.src=C.music; var p=a.play(); if(p&&p.then) p.then(function(){started=true;ui();}).catch(function(){ui();}); }
    btn.addEventListener("click",function(e){ e.stopPropagation(); if(a.paused){ userOff=false; play(); } else { userOff=true; a.pause(); ui(); } });
    function first(e){ if(started||userOff||btn.contains(e.target)) return; play(); }
    ["pointerdown","keydown","touchend"].forEach(function(ev){ document.addEventListener(ev,first,{passive:true}); });
    document.addEventListener("visibilitychange",function(){ if(document.hidden&&!a.paused){ a.pause(); a.dataset.auto="1"; ui(); } else if(!document.hidden&&a.dataset.auto==="1"&&!userOff){ a.dataset.auto=""; play(); } });
    window.addEventListener("scroll",function(){ btn.classList.toggle("compact",window.scrollY>window.innerHeight*.5); },{passive:true});
    a.addEventListener("play",ui); a.addEventListener("pause",ui); ui();
  })();

  /* ---- slow auto-scroll: any touch, wheel, key or click on the page stops it ---- */
  (function(){
    var btn=$("#auto");
    if(!C.autoScroll || (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches)){ btn.hidden=true; return; }
    var speed=C.autoScrollSpeed||38, on=false, last=0, acc=0, root=document.documentElement;
    function ui(){ btn.setAttribute("aria-pressed",on); btn.setAttribute("aria-label",on?"Stop auto-scroll":"Start slow auto-scroll"); $(".alabel",btn).textContent=on?"Stop":"Auto-scroll"; }
    function atEnd(){ return window.innerHeight+window.scrollY >= root.scrollHeight-2; }
    function step(ts){
      if(!on) return;
      if(!last) last=ts;
      var dt=Math.min(ts-last,60); last=ts;
      if(!document.getElementById("lightbox").open){
        acc+=speed*dt/1000; var px=Math.floor(acc);
        if(px>0){ acc-=px; window.scrollBy(0,px); }
        if(atEnd()){ stop(); return; }
      }
      requestAnimationFrame(step);
    }
    function start(){ if(atEnd()) window.scrollTo(0,0); root.style.scrollBehavior="auto"; on=true; last=0; acc=0; ui(); requestAnimationFrame(step); }
    function stop(){ on=false; root.style.scrollBehavior=""; ui(); }
    btn.addEventListener("click",function(){ on?stop():start(); });
    ["wheel","touchstart","keydown","mousedown"].forEach(function(ev){
      window.addEventListener(ev,function(e){
        if(!on) return;
        if(ev==="keydown"){ if(btn.contains(e.target) && (e.key==="Enter"||e.key===" ")) return; }
        else if(ev!=="wheel" && btn.contains(e.target)) return;
        stop();
      },{passive:true});
    });
    document.addEventListener("focusin",function(e){ if(on && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) stop(); });
    ui();
  })();

  /* ---- floating RSVP button: visible from the start, hidden while the RSVP form is on screen ---- */
  (function(){
    var fab=$("#fab"), rs=$("#rsvp"), inRsvp=false;
    function upd(){ fab.classList.toggle("show", !inRsvp && window.scrollY>window.innerHeight*0.5); }
    window.addEventListener("scroll",upd,{passive:true});
    if("IntersectionObserver" in window) new IntersectionObserver(function(e){ inRsvp=e[0].isIntersecting; upd(); },{threshold:.15}).observe(rs);
  })();

  /* ---- gallery + lightbox ---- */
  var photos = C.photos, gal = $("#gallery"), lb = $("#lightbox"), lbImg = $("#lbImg"), cur = 0;
  if(photos.length===1) gal.classList.add("single");
  if(photos.length===2) gal.classList.add("double");
  photos.forEach(function(p,i){
    var b=document.createElement("button"); b.type="button"; b.setAttribute("aria-label","View photograph "+(i+1)+" of "+photos.length);
    var im=document.createElement("img"); im.src=p.src; im.alt=p.alt||""; im.loading="lazy"; im.decoding="async";
    im.style.objectPosition=p.focus||"50% 50%"; b.appendChild(im);
    b.addEventListener("click",function(){ show(i); if(lb.showModal) lb.showModal(); else lb.setAttribute("open",""); });
    gal.appendChild(b);
  });
  function show(i){ cur=(i+photos.length)%photos.length; lbImg.src=photos[cur].src; lbImg.alt=photos[cur].alt||""; }
  if(photos.length<2) lb.classList.add("one");
  $(".lb-close").onclick=function(){ lb.close(); };
  $(".lb-nav.prev").onclick=function(){ show(cur-1); };
  $(".lb-nav.next").onclick=function(){ show(cur+1); };
  lb.addEventListener("click",function(e){ if(e.target===lb) lb.close(); });
  lb.addEventListener("keydown",function(e){ if(e.key==="ArrowLeft") show(cur-1); if(e.key==="ArrowRight") show(cur+1); });

  /* ---- reveal on scroll: calm, staggered, one-time ---- */
  (function(){
    var sections=$$(".sec").concat($$(".closing"));
    sections.forEach(function(sec){
      var kids=[].slice.call((sec.classList.contains("closing")?sec.querySelector(".closing-text"):sec).children);
      var n=0;
      kids.forEach(function(k){
        if(k.classList.contains("corner")||k.classList.contains("hp")) return;
        k.classList.add("rv"); k.style.setProperty("--td",(n*0.16).toFixed(2)+"s"); n++;
      });
    });
    $$(".gallery button").forEach(function(b,i){ b.style.setProperty("--td",(i*0.25).toFixed(2)+"s"); });
    var galEl=$("#gallery"); var targets=sections.concat(galEl?[galEl]:[]);
    if("IntersectionObserver" in window){
      var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add("in"); if(e.target.id==="gallery") $$(".gallery button").forEach(function(b){b.classList.add("in")}); io.unobserve(e.target);} }); },{threshold:.18,rootMargin:"0px 0px -6% 0px"});
      targets.forEach(function(t){io.observe(t)});
    } else targets.forEach(function(t){t.classList.add("in")}); $$(".gallery button").forEach(function(b){b.classList.add("in")});
  })();

  /* ---- countdown (absolute time, so it is correct in every time zone) ---- */
  var target = new Date(C.startsAt).getTime();
  function pad(n){return n<10?"0"+n:""+n}
  function tick(){
    var d=target-Date.now();
    if(d<=0){ $("#countdown").innerHTML='<p class="lead" style="grid-column:1/-1">Today is the day.</p>'; $("#cdNote").textContent=""; return false; }
    var s=Math.floor(d/1000);
    $("#cd-d").textContent=Math.floor(s/86400);
    $("#cd-h").textContent=pad(Math.floor(s%86400/3600));
    $("#cd-m").textContent=pad(Math.floor(s%3600/60));
    $("#cd-s").textContent=pad(s%60);
    return true;
  }
  if(tick()){ var t=setInterval(function(){ if(!tick()) clearInterval(t); },1000); }

  /* ---- mini calendar (built from the wedding date) ---- */
  (function(){
    var m=/^(\d{4})-(\d{2})-(\d{2})/.exec(C.startsAt); if(!m) return;
    var Y=+m[1], M=+m[2], D=+m[3], first=new Date(Date.UTC(Y,M-1,1)).getUTCDay(), n=new Date(Date.UTC(Y,M,0)).getUTCDate();
    var names=["January","February","March","April","May","June","July","August","September","October","November","December"];
    var html='<p class="cal-h">'+names[M-1]+' '+Y+'</p><div class="cal-g">'+["S","M","T","W","T","F","S"].map(function(d){return "<i>"+d+"</i>"}).join("");
    for(var i=0;i<first;i++) html+="<span></span>";
    for(var d=1;d<=n;d++) html+= d===D ? '<span class="on">'+d+'</span>' : "<span>"+d+"</span>";
    $("#miniCal").innerHTML=html+"</div>";
  })();

  /* ---- calendar ---- */
  function utc(ms){ return new Date(ms).toISOString().replace(/[-:]/g,"").replace(/\.\d{3}/,""); }
  var st=target, en=target+(C.calendarHours||3)*3600000;
  var title="Wedding Dinner of "+C.groom+" & "+C.bride;
  var loc=C.venue+", "+C.address;
  var desc="Please arrive before 7:00 PM for our pre-dinner cocktail session and photo session.";
  $("#calGoogle").href="https://calendar.google.com/calendar/render?action=TEMPLATE&text="+encodeURIComponent(title)+
    "&dates="+utc(st)+"/"+utc(en)+"&details="+encodeURIComponent(desc)+"&location="+encodeURIComponent(loc)+"&ctz=Asia/Kuala_Lumpur";
  $("#calIcs").addEventListener("click",function(){
    function esc(s){return s.replace(/\\/g,"\\\\").replace(/;/g,"\\;").replace(/,/g,"\\,").replace(/\n/g,"\\n");}
    var ics=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Wedding Invitation//EN","CALSCALE:GREGORIAN","BEGIN:VEVENT",
      "UID:wedding-"+utc(st)+"@invitation","DTSTAMP:"+utc(Date.now()),"DTSTART:"+utc(st),"DTEND:"+utc(en),
      "SUMMARY:"+esc(title),"LOCATION:"+esc(loc),"DESCRIPTION:"+esc(desc),"END:VEVENT","END:VCALENDAR"].join("\r\n");
    var blob=new Blob([ics],{type:"text/calendar;charset=utf-8"}), a=document.createElement("a");
    a.href=URL.createObjectURL(blob); a.download="wedding-dinner.ics"; document.body.appendChild(a); a.click();
    setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},500);
  });

  /* ---- directions ---- */
  $("#dirBtn").href="https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(C.venue+", "+C.address);

  /* ---- RSVP ---- */
  var form=$("#rsvpForm"), yes=$("#yesFields"), sel=$("#guests"), compWrap=$("#companionsWrap"), btn=$("#submitBtn"), status=$("#formStatus");
  var urlMax=parseInt(new URLSearchParams(location.search).get("max"),10);
  var max=Math.max(1,Math.min(10,C.maxGuests||10));
  if(urlMax>0) max=Math.min(max,urlMax);
  sel.innerHTML='<option value="">Select number of pax</option>';
  for(var i=1;i<=max;i++){ var o=document.createElement("option"); o.value=i; o.textContent=i===1?"1 pax (just me)":i+" pax"; sel.appendChild(o); }

  function attending(){ var r=form.querySelector('input[name="attending"]:checked'); return r?r.value:""; }
  function refresh(){
    var a=attending(), y=a==="Yes"; yes.hidden=!y;
    sel.disabled=(a==="No"); if(a==="No") sel.value="";
    $("#paxHint").textContent = a==="No" ? "Not needed. Thank you for letting us know." : (y ? "Including yourself, how many will be attending?" : "Please select once you have confirmed that you are attending.");
    compWrap.hidden=!(y && parseInt(sel.value,10)>1);
  }
  form.addEventListener("change",refresh);

  function setErr(name,msg){ var p=form.querySelector('[data-err="'+name+'"]'); if(!p) return; p.textContent=msg||""; var f=p.closest(".field"); if(f) f.classList.toggle("bad",!!msg); }
  function validate(){
    var bad=null, n=form.name.value.trim(), ph=form.phone.value.trim(), a=attending();
    ["name","phone","attending","guests","companions"].forEach(function(k){setErr(k,"")});
    function flag(k,m,el){ setErr(k,m); if(!bad) bad=el; }
    if(n.length<2) flag("name","Please enter your full name.",form.name);
    if(!/^[+()\d][\d\s\-().+]{6,18}$/.test(ph) || ph.replace(/\D/g,"").length<8) flag("phone","Please enter a valid phone number, for example 012-345 6789.",form.phone);
    if(!a) flag("attending","Please let us know if you can join us.",form.querySelector('input[name="attending"]'));
    if(a==="Yes"){
      var g=parseInt(sel.value,10);
      if(!g) flag("guests","Please choose your number of pax.",sel);
      else if(g>1 && form.companions.value.trim().length<2) flag("companions","Please list the names of your accompanying guests.",form.companions);
    }
    if(bad) bad.focus();
    return !bad;
  }

  var requestId = (window.crypto&&crypto.randomUUID)?crypto.randomUUID():String(Date.now())+Math.random().toString(16).slice(2);
  var busy=false;
  form.addEventListener("submit",function(e){
    e.preventDefault(); if(busy) return;
    status.textContent=""; if(!validate()) return;
    if(!C.rsvpEndpoint || C.rsvpEndpoint.indexOf("PASTE_")===0){ status.textContent="RSVP is not connected yet. Please add the Apps Script web app URL in config.js."; return; }
    var yesAns=attending()==="Yes";
    var payload={ requestId:requestId, website:form.website.value, name:form.name.value.trim(), phone:form.phone.value.trim(),
      attending:yesAns?"Yes":"No", guests:yesAns?parseInt(sel.value,10):0,
      companions:yesAns?form.companions.value.trim():"", diet:yesAns?form.diet.value.trim():"", message:form.message.value.trim() };
    busy=true; btn.disabled=true; btn.classList.add("loading"); $(".lbl",btn).textContent="Sending…";
    var ctl=("AbortController" in window)?new AbortController():null, to=setTimeout(function(){ctl&&ctl.abort()},25000);
    fetch(C.rsvpEndpoint,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(payload),signal:ctl?ctl.signal:undefined})
      .then(function(r){ if(!r.ok) throw new Error("http"); return r.json(); })
      .then(function(j){
        if(!j||j.status!=="ok"){ var se=new Error((j&&j.message)||"server"); se.fromServer=!!(j&&j.message); throw se; }
        form.hidden=true; $("#thanksMsg").textContent = yesAns
          ? "Thank you, "+payload.name.split(" ")[0]+". We have received your RSVP and look forward to celebrating with you."
          : "Thank you for letting us know, "+payload.name.split(" ")[0]+". You will be missed, and we are grateful for your warm wishes.";
        var t=$("#thanks"); t.hidden=false; t.focus(); t.scrollIntoView({behavior:"smooth",block:"center"});
        requestId=(window.crypto&&crypto.randomUUID)?crypto.randomUUID():String(Date.now());
      })
      .catch(function(err){
        status.textContent = (err && err.fromServer) ? err.message : "We could not confirm that your RSVP was saved. Please check your connection and try again. Your answers are still here.";
      })
      .then(function(){ clearTimeout(to); busy=false; btn.disabled=false; btn.classList.remove("loading"); $(".lbl",btn).textContent="Submit RSVP"; });
  });
  $("#another").onclick=function(){ form.reset(); refresh(); form.hidden=false; $("#thanks").hidden=true; form.name.focus(); };
})();
