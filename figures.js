/* =====================================================================
   astroComputer — "The idea" figures.
   FIGS['<moduleId>:<stepIndex>'] = [ {svg|img, cap, credit?}, ... ]
   SVGs are drawn with tiny helpers below; some curves are computed from
   the real equations (Planck, Saha+Boltzmann, Kepler III, Leavitt).
   ===================================================================== */
(function(){
const FC={ink:'#e8ecff',mut:'#9aa3c7',dim:'rgba(154,163,199,0.35)',sun:'#ffd34d',earth:'#3fd0ff',mars:'#ff8a5c',
  amb:'#ffb24a',vio:'#b08cff',grn:'#5ee6a8',rose:'#ff6b9d',cyan:'#3fd0ff',red:'#ff5a5a',blue:'#6a8cff'};
const col = c => FC[c] || c;

/* one hidden <svg> holding arrowhead markers for every colour */
const defs = document.createElementNS('http://www.w3.org/2000/svg','svg');
defs.setAttribute('width','0'); defs.setAttribute('height','0'); defs.style.position='absolute';
defs.innerHTML = '<defs>' + Object.keys(FC).map(k =>
  `<marker id="ah-${k}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${FC[k]}"/></marker>`).join('') +
  `<linearGradient id="rainbow" x1="0" x2="1"><stop offset="0" stop-color="#7a3cff"/><stop offset=".2" stop-color="#3b6bff"/><stop offset=".38" stop-color="#20c8ff"/><stop offset=".52" stop-color="#3fe07a"/><stop offset=".68" stop-color="#f4e43a"/><stop offset=".84" stop-color="#ff8a2a"/><stop offset="1" stop-color="#ff2a2a"/></linearGradient>` +
  `<radialGradient id="glow"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>`;
document.addEventListener('DOMContentLoaded', () => document.body.appendChild(defs));
if(document.body) document.body.appendChild(defs);

/* ---------- drawing helpers ---------- */
const f1 = n => +n.toFixed(1);
const S = (w,h,b) => `<svg class="figsvg" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" font-family="-apple-system,'Segoe UI',Roboto,sans-serif">${b}</svg>`;
const L = (x1,y1,x2,y2,c='mut',o={}) => `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${col(c)}" stroke-width="${o.w||1.5}"${o.d?` stroke-dasharray="${o.d}"`:''}${o.a?` marker-end="url(#ah-${c})"`:''}${o.a0?` marker-start="url(#ah-${c})"`:''}${o.op?` opacity="${o.op}"`:''}/>`;
const P = (d,c='mut',o={}) => `<path d="${d}" stroke="${o.nos?'none':col(c)}" stroke-width="${o.w||1.5}" fill="${o.f?col(o.f):'none'}"${o.fo?` fill-opacity="${o.fo}"`:''}${o.d?` stroke-dasharray="${o.d}"`:''}${o.a?` marker-end="url(#ah-${c})"`:''}${o.op?` opacity="${o.op}"`:''}/>`;
const Ci = (cx,cy,r,c='mut',o={}) => `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r)}" stroke="${col(c)}" stroke-width="${o.w||1.5}" fill="${o.f?col(o.f):'none'}"${o.fo?` fill-opacity="${o.fo}"`:''}${o.d?` stroke-dasharray="${o.d}"`:''}${o.op?` opacity="${o.op}"`:''}/>`;
const Dt = (x,y,r,c,glow) => (glow?`<circle cx="${f1(x)}" cy="${f1(y)}" r="${r*2.6}" fill="${col(c)}" opacity=".18"/>`:'')+`<circle cx="${f1(x)}" cy="${f1(y)}" r="${r}" fill="${col(c)}"/>`;
const T = (x,y,s,c='ink',o={}) => `<text x="${f1(x)}" y="${f1(y)}" fill="${col(c)}" font-size="${o.s||12}" text-anchor="${o.a||'middle'}"${o.i?' font-style="italic"':''}${o.b?' font-weight="700"':''}${o.r?` transform="rotate(${o.r} ${f1(x)} ${f1(y)})"`:''}>${s}</text>`;
const R = (x,y,w,h,c='mut',o={}) => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${o.rx||0}" stroke="${o.nos?'none':col(c)}" stroke-width="${o.w||1.5}" fill="${o.f?col(o.f):'none'}"${o.fo?` fill-opacity="${o.fo}"`:''}${o.tr?` transform="${o.tr}"`:''}/>`;
const pt = (cx,cy,r,deg) => [cx + r*Math.cos(deg*Math.PI/180), cy - r*Math.sin(deg*Math.PI/180)];
/* angle arc at (cx,cy) from math-angle a1 to a2 (degrees, counter-clockwise) */
const Arc = (cx,cy,r,a1,a2,c='amb',o={}) => { const [x1,y1]=pt(cx,cy,r,a1), [x2,y2]=pt(cx,cy,r,a2);
  return P(`M${f1(x1)},${f1(y1)} A${r},${r} 0 ${Math.abs(a2-a1)>180?1:0} 0 ${f1(x2)},${f1(y2)}`, c, o); };
const poly = pts => 'M' + pts.map(p => f1(p[0])+','+f1(p[1])).join(' L');
/* orbit with the focus at (fx,fy): r = a(1-e^2)/(1+e cos th), perihelion pointing at angle rot */
const orbitPt = (fx,fy,a,e,rot,th) => { const r = a*(1-e*e)/(1+e*Math.cos(th*Math.PI/180)); return pt(fx,fy,r,th+rot); };
const orbit = (fx,fy,a,e,rot=0,t0=0,t1=360) => { const p=[]; for(let t=t0;t<=t1;t+=2) p.push(orbitPt(fx,fy,a,e,rot,t)); return poly(p) + (t1-t0>=360?' Z':''); };
const star = (x,y,s=14,c='ink') => T(x,y+s*0.35,'★',c,{s});
const sunG = (x,y,r=9) => Dt(x,y,r,'sun',true);
const plot = (xs,fx,fy) => poly(xs.map(v => [fx(v[0]), fy(v[1])]));
const hspec = (x,y,w,h) => R(x,y,w,h,'none',{nos:1,f:'url(#rainbow)'}).replace('fill="url(#rainbow)"','fill="url(#rainbow)" opacity=".85"');

const F = {};

/* =========================== 1 · KEPLER =========================== */
F['kepler:0'] = [{img:'img/kepler_opposition.jpg', cap:'Earth (inner orbit) is faster than Mars. When Earth catches up and passes it, which is opposition, Mars seems to loop backwards. The time from one overtaking to the next is the synodic period.', credit:'From the Kepler & Mars companion'}];
F['kepler:1'] = [{img:'img/kepler_triangulation.jpg', cap:'Mars (red) is at the same point every 687 days while Earth is at t₁, t₂, t₃. The sight lines from Earth cross at Mars. This is drawn over Kepler’s own woodcut from Astronomia Nova.', credit:'From the Kepler & Mars companion'}];
F['kepler:2'] = [{img:'img/kepler_circle_gap.jpg', cap:'A perfect circle versus Mars’s measured path. The thin crescent between them, at most 0.00429 of the radius, is the 8-arcminute disagreement that forced Kepler to an ellipse.', credit:'From the Kepler & Mars companion'}];
F['kepler:3'] = [{svg:(() => {
  const fx=110, fy=110, a=120, e=0.45, rot=180;
  const wedge = (t0,t1,c) => { const p=[[fx,fy]]; for(let t=t0;t<=t1+1e-9;t+=(t1-t0)/30) p.push(orbitPt(fx,fy,a,e,rot,t)); return P(poly(p)+' Z',c,{f:c,fo:.35,w:1}); };
  const near = 50, far = near*Math.pow(66/174,2);
  return S(340,245, P(orbit(fx,fy,a,e,rot),'mut') + wedge(-near/2,near/2,'amb') + wedge(180-far/2,180+far/2,'amb') +
    sunG(fx,fy) + Dt(...orbitPt(fx,fy,a,e,rot,near/2),5,'mars') + Dt(...orbitPt(fx,fy,a,e,rot,180+far/2),5,'mars') +
    T(28,62,'fast',  'amb',{a:'start',b:1}) + T(28,76,'near the Sun','mut',{a:'start',s:10}) +
    T(300,62,'slow','amb',{a:'end',b:1}) + T(300,76,'far away','mut',{a:'end',s:10}) +
    T(170,238,'Both shaded slices: same area, same time','ink',{s:11.5}));
})(), cap:'Near the Sun the planet sweeps a short, wide slice; far away, a long, thin one. The areas are equal because the planet moves faster when it is closer.'}];
F['kepler:4'] = [{svg:(() => {
  const cx=150, cy=125, a=115, e=0.6, b=a*Math.sqrt(1-e*e), sx=cx+a*e, E=70;
  const Q=[cx+a*Math.cos(E*Math.PI/180), cy-a*Math.sin(E*Math.PI/180)], Pp=[Q[0], cy-b*Math.sin(E*Math.PI/180)];
  const th = Math.atan2(cy-Pp[1], Pp[0]-sx)*180/Math.PI;
  return S(340,262, Ci(cx,cy,a,'dim',{d:'4 4'}) + `<ellipse cx="${cx}" cy="${cy}" rx="${a}" ry="${f1(b)}" stroke="${FC.mut}" stroke-width="1.5" fill="none"/>` +
    L(cx-a-8,cy,cx+a+10,cy,'dim') + L(cx,cy,Q[0],Q[1],'vio') + L(sx,cy,Pp[0],Pp[1],'amb') + L(Q[0],Q[1],Pp[0],Pp[1],'dim',{d:'3 3'}) +
    Arc(cx,cy,26,0,E,'vio') + Arc(sx,cy,20,0,th,'amb') + sunG(sx,cy,8) + Dt(cx,cy,3,'mut') + Dt(Q[0],Q[1],4,'vio') + Dt(...Pp,6,'mars') +
    T(cx-6,cy+16,'centre','mut',{s:10}) + T(sx+4,cy+22,'Sun','sun',{s:10}) + T(cx+30,cy-12,'E','vio',{i:1,s:14}) + T(sx+12,cy-24,'θ','amb',{i:1,s:14}) +
    T(Pp[0]+10,Pp[1]+4,'planet','ink',{a:'start',s:11}) + T(Q[0]+8,Q[1]-2,'helper point on circle','vio',{a:'start',s:10}) +
    T(318,256,'E: helper angle (from the centre)  ·  θ: real direction (from the Sun)','mut',{a:'end',s:9.5}));
})(), cap:'Draw a circle around the ellipse. The helper angle E is measured from the centre to a point on that circle directly above the planet. The real direction θ is measured from the Sun. Kepler’s equation links E to the time.'}];
F['kepler:5'] = [{svg:(() => {
  const pl=[['Mercury',.387,.241],['Venus',.723,.615],['Earth',1,1],['Mars',1.524,1.881],['Jupiter',5.203,11.86],['Saturn',9.537,29.46]];
  const X=v=>50+(Math.log10(v)+0.5)/1.6*270, Y=v=>195-(Math.log10(v)+0.75)/2.35*175;
  let b = L(50,195,325,195,'mut') + L(50,195,50,15,'mut') + P(`M${f1(X(0.3))},${f1(Y(Math.pow(0.3,1.5)))} L${f1(X(11))},${f1(Y(Math.pow(11,1.5)))}`,'amb',{d:'5 4'});
  pl.forEach(p => { b += Dt(X(p[1]),Y(p[2]),4.5,'cyan') + T(X(p[1])+7,Y(p[2])+4,p[0],'ink',{a:'start',s:10}); });
  return S(340,225, b + T(188,215,'orbit size a (AU, log scale)','mut',{s:10.5}) + T(16,105,'period P (yr, log)','mut',{s:10.5,r:-90}) +
    T(120,60,'P² = a³','amb',{b:1,s:14}));
})(), cap:'Every planet falls on one straight line when plotted on log scales. A slope of 3/2 means P² ∝ a³. These points are real orbital data.'}];

/* =========================== 2 · POSITIONS =========================== */
F['positions:0'] = [{svg:(() => {
  const lx=70, ly=110, f=220, th=12, t=Math.tan(th*Math.PI/180);
  return S(340,215, `<ellipse cx="${lx}" cy="${ly}" rx="7" ry="55" stroke="${FC.cyan}" fill="${FC.cyan}" fill-opacity=".12"/>` +
    L(lx+f,30,lx+f,190,'ink',{w:3}) + L(8,ly,lx+f,ly,'mut') + L(8,ly+(lx-8)*t,lx+f,ly-f*t,'amb') +
    star(8,ly-1,14,'ink') + star(8,ly+(lx-8)*t,14,'amb') + Arc(lx,ly,34,0,th,'amb') + T(lx+44,ly-2,'θ','amb',{i:1,s:13}) +
    L(lx,200,lx+f,200,'mut',{a:1,a0:1,w:1}) + T(lx+f/2,196,'focal length  f','mut',{s:11}) +
    L(lx+f+12,ly,lx+f+12,ly-f*t,'grn',{a:1,a0:1,w:1.2}) + T(lx+f+16,ly-f*t/2+4,'x','grn',{a:'start',i:1,s:13}) +
    T(lx,40,'lens','cyan',{s:11}) + T(lx+f,22,'plate','ink',{s:11}) + T(180,60,'x ≈ f · θ','ink',{b:1,s:13}));
})(), cap:'Two stars an angle θ apart land a distance x apart on the plate. A longer focal length f spreads them further, so each millimetre covers fewer arcseconds.'}];
const tangent = (rev) => { const ox=170, oy=200, r=125, ang=35, top=oy-r;
  const sp=[ox+r*Math.sin(ang*Math.PI/180), oy-r*Math.cos(ang*Math.PI/180)], px=ox+r*Math.tan(ang*Math.PI/180);
  return S(340,215, Ci(ox,oy,r,'cyan',{fo:.06,f:'cyan'}) + L(20,top,320,top,'ink',{w:3}) + L(ox,oy,px,top,'dim',{d:'4 4'}) +
    (rev ? L(px,top+2,sp[0]+2,sp[1]-3,'amb',{a:1}) : L(sp[0],sp[1],px-2,top+3,'amb',{a:1})) +
    Dt(ox,top,4,'ink') + star(sp[0],sp[1],13,'amb') + Dt(px,top,4,'amb') +
    T(ox-6,top-10,'plate centre (α₀, δ₀)','ink',{s:10.5}) + T(px+4,top-10,rev?'measured (ξ, η)':'(ξ, η)','amb',{a:'start',s:10.5}) +
    T(ox-70,top+60,'sky (a sphere)','cyan',{s:11}) + T(28,top-10,'flat plate','ink',{a:'start',s:10.5}) +
    T(sp[0]+14,sp[1]+16,rev?'→ star’s (α, δ)':'star (α, δ)','amb',{a:'start',s:10.5})); };
F['positions:1'] = [{svg:tangent(false), cap:'The plate is a flat sheet touching the sky-sphere at the plate centre. Each star is projected straight out from the centre of the sphere onto the sheet, which gives its standard coordinates (ξ, η).'}];
F['positions:2'] = [{svg:(() => {
  const cx=165, cy=110; let b = L(cx-120,cy,cx+120,cy,'mut',{d:'4 4'}) + L(cx,cy+85,cx,cy-90,'mut',{d:'4 4'}) + T(cx+124,cy+4,'ξ','mut',{a:'start',i:1,s:13}) + T(cx+4,cy-92,'η','mut',{a:'start',i:1,s:13});
  b += `<g transform="translate(18 14) rotate(-9 ${cx} ${cy})">` + L(cx-120,cy,cx+120,cy,'cyan',{a:1}) + L(cx,cy+85,cx,cy-90,'cyan',{a:1}) + T(cx+124,cy+4,'x','cyan',{a:'start',i:1,s:13}) + T(cx+4,cy-94,'y','cyan',{a:'start',i:1,s:13}) + '</g>';
  [[90,55],[250,70],[120,170]].forEach(p => { b += star(p[0],p[1],16,'amb'); });
  return S(340,220, b + T(10,200,'grey: ideal plate (ξ, η)','mut',{a:'start',s:10})+T(10,214,'blue: machine axes (x, y): turned, shifted, stretched','cyan',{a:'start',s:10}) +
    T(300,40,'★ known stars','amb',{s:11}));
})(), cap:'The measuring machine’s axes (blue) are slightly turned, shifted and stretched compared with the ideal plate (grey). Stars with known positions (★) show exactly how much, and six plate constants record it.'}];
F['positions:3'] = [{svg:tangent(true), cap:'The same geometry run backwards: a corrected point on the flat plate is projected back onto the sphere to get the star’s right ascension and declination.'}];
F['positions:4'] = [{svg:(() => {
  const A=[95,165], B=[245,65]; let b='';
  [[30,30],[300,40],[60,95],[180,120],[310,150],[150,30],[40,190],[280,200],[210,180]].forEach(p => b += Dt(p[0],p[1],1.6,'mut'));
  return S(340,220, b + L(A[0],A[1],B[0],A[1],'amb',{w:2,a:1}) + L(B[0],A[1],B[0],B[1],'vio',{w:2,a:1}) + L(A[0],A[1],B[0]-2,B[1]+2,'grn',{w:2.4,a:1}) +
    R(B[0]-10,A[1]-10,10,10,'mut',{w:1}) + star(A[0],A[1],16,'ink') + star(B[0],B[1],16,'ink') +
    T(A[0]-8,A[1]-14,'plate of 1900','mut',{a:'end',s:10.5}) + T(B[0],B[1]-14,'plate of 2000','mut',{s:10.5}) +
    T((A[0]+B[0])/2,A[1]+20,'east–west:  μα cos δ','amb',{s:11}) + T(B[0]+8,(A[1]+B[1])/2+4,'north–south: μδ','vio',{a:'start',s:11}) +
    T((A[0]+B[0])/2-14,(A[1]+B[1])/2-8,'μ','grn',{i:1,b:1,s:15}));
})(), cap:'A star drifts between two plates taken a century apart. Make a right triangle with x = east–west motion, y = north–south motion, and z = the total motion μ (the hypotenuse).'}];
F['positions:5'] = [{svg:(() => {
  const ex=170, ey=150, tilt=23.5, len=105, tip=pt(ex,ey,len,90-tilt), rx=len*Math.sin(tilt*Math.PI/180), cyy=tip[1];
  return S(340,220, L(ex,ey+60,ex,20,'dim',{d:'4 4'}) + L(ex,ey,tip[0],tip[1],'cyan',{w:2.5}) + L(ex,ey,ex-rx,cyy,'dim') +
    `<ellipse cx="${ex}" cy="${f1(cyy)}" rx="${f1(rx)}" ry="11" stroke="${FC.amb}" stroke-width="1.6" fill="none" stroke-dasharray="5 4"/>` +
    P(`M${f1(ex-12)},${f1(cyy+11)} L${f1(ex+12)},${f1(cyy+11)}`,'amb',{a:1}) +
    Ci(ex,ey,34,'earth',{f:'earth',fo:.25,w:2}) + T(ex,ey+5,'Earth','ink',{s:11}) +
    star(tip[0]+4,tip[1]-6,13,'ink') + T(tip[0]+14,tip[1]-6,'Polaris (now)','ink',{a:'start',s:10.5}) +
    star(ex-rx-4,cyy-6,13,'mut') + T(ex-rx-14,cyy-6,'Vega (AD 14,000)','mut',{a:'end',s:10.5}) +
    T(ex+6,16,'ecliptic pole','mut',{a:'start',s:10}) + T(ex+50,ey+44,'23.5° tilt','cyan',{a:'start',s:10.5}) +
    T(170,212,'the axis traces this cone once every ~26,000 years','amb',{s:11}));
})(), cap:'Earth’s axis wobbles like a spinning top. The north celestial pole, and with it the whole RA/Dec grid, slowly circles the ecliptic pole.'}];
F['positions:6'] = [{svg:(() => {
  let b=''; [20,45,70,95,120,150].forEach((x,i)=>{ b+=L(x,18+(i%3)*10,x,48+(i%3)*10,'cyan',{w:1.2,a:1}); b+=L(x+170,18+(i%3)*10,x+170,48+(i%3)*10,'cyan',{w:1.2,a:1}); });
  const tube = (cx,deg) => `<g transform="rotate(${deg} ${cx} 175)">${R(cx-9,95,18,80,'ink',{f:'#1b2142',w:1.6,rx:2})}</g>`;
  return S(340,220, b + tube(85,0) + tube(255,22) + L(255,175,255,85,'dim',{d:'3 3'}) +
    T(85,205,'standing still','mut',{s:11}) + L(215,205,300,205,'amb',{w:2,a:1}) + T(257,196,'moving','amb',{s:11}) +
    T(170,88,'starlight','cyan',{s:10.5}) + T(300,140,'tilted','amb',{a:'start',s:10.5}));
})(), cap:'Like walking through vertical rain, you have to tilt the umbrella (or telescope) forward. Earth moves at 30 km/s, so starlight appears tilted by up to 20.5″. The tilt here is hugely exaggerated.'}];

/* =========================== 3 · DISTANCES =========================== */
F['distances:0'] = [{svg:S(340,190, L(40,100,300,60,'mut') + L(40,100,300,140,'mut') + L(300,60,300,140,'amb',{w:3}) + Arc(40,100,50,-8.7,8.7,'grn') +
  T(100,104,'θ','grn',{i:1,s:14}) + T(312,104,'D','amb',{a:'start',i:1,s:14}) + L(40,165,300,165,'mut',{a:1,a0:1,w:1}) + T(170,160,'distance  d','mut',{s:11}) +
  `<circle cx="34" cy="100" r="9" fill="none" stroke="${FC.ink}" stroke-width="1.5"/><circle cx="37" cy="100" r="3.5" fill="${FC.ink}"/>` + T(170,30,'θ ≈ D / d   (in radians)','ink',{b:1,s:13})),
  cap:'A far-off object of size D at distance d covers a small angle θ. For small angles, the angle is simply size ÷ distance.'}];
F['distances:1'] = [{svg:(() => {
  const s=[170,175], E1=[95,175], E2=[245,175], st=[170,95], k=(175-22)/80;
  const x1=E1[0]+75*k, x2=E2[0]-75*k; let bg=''; [30,60,140,200,265,300,320,90,175,240].forEach((x,i)=>bg+=Dt(x,16+(i%3)*6,1.5,'mut'));
  return S(340,215, bg + `<ellipse cx="${s[0]}" cy="${s[1]}" rx="75" ry="20" stroke="${FC.dim}" fill="none" stroke-dasharray="4 4"/>` +
    L(E1[0],E1[1],x1,22,'cyan',{w:1.2,op:.8}) + L(E2[0],E2[1],x2,22,'rose',{w:1.2,op:.8}) + L(st[0],st[1],s[0],s[1],'amb',{d:'3 3'}) + L(s[0],s[1],E2[0],E2[1],'amb',{d:'3 3'}) +
    sunG(...s,8) + Dt(...E1,6,'earth') + Dt(...E2,6,'earth') + star(st[0],st[1],15,'ink') + Dt(x1,22,4,'cyan') + Dt(x2,22,4,'rose') +
    T(E1[0]-4,E1[1]+20,'Earth in January','cyan',{s:10}) + T(E2[0]+4,E2[1]+20,'Earth in July','rose',{s:10}) + T(208,188,'1 AU','amb',{s:10}) +
    T(178,118,'p','amb',{i:1,b:1,s:14}) + T(184,98,'nearby star','ink',{a:'start',s:10.5}) + T(330,38,'distant background stars','mut',{a:'end',s:9.5}));
})(), cap:'Six months apart, Earth views a nearby star from opposite sides of its orbit, and the star appears to shift against the distant background. Half that shift is the parallax p. The smaller p is, the farther away the star.'}];
F['distances:2'] = [{svg:(() => {
  const sx=30, sy=110; let b=Dt(sx,sy,6,'sun',true);
  [[130,25,18],[250,50,36]].forEach(([x,h,w]) => { [[x-w/2,sy-h],[x+w/2,sy-h],[x-w/2,sy+h],[x+w/2,sy+h]].forEach(p => b += L(sx,sy,p[0],p[1],'dim',{w:1})); });
  b += R(130-9,sy-25,18,50,'amb',{f:'amb',fo:.25}) + R(250-18,sy-50,36,100,'amb',{f:'amb',fo:.12}) + L(250-18,sy,250+18,sy,'amb',{w:1}) + L(250,sy-50,250,sy+50,'amb',{w:1});
  return S(340,215, b + T(130,sy+44,'distance d','mut',{s:10.5}) + T(130,sy+57,'1 patch','amb',{s:10.5}) + T(250,sy+68,'distance 2d','mut',{s:10.5}) + T(250,sy+81,'4 patches → ¼ each','amb',{s:10.5}) +
    T(170,22,'F = L / 4πd²','ink',{b:1,s:13}));
})(), cap:'The same light that covers one patch at distance d covers four patches at 2d. Each patch gets a quarter of the light. That is the inverse-square law.'}];
F['distances:3'] = [{svg:(() => { let b=''; for(let m=0;m<=5;m++){ const x=35+m*54, r=13*Math.pow(10,-0.4*m*0.5); b+=Dt(x,80,Math.max(r,1.6),'ink',true)+T(x,130,'m = '+m,'mut',{s:11}); }
  return S(340,200, b + P('M35,150 L35,158 L305,158 L305,150','amb',{w:1.3}) + T(170,176,'5 magnitudes = exactly 100× fainter','amb',{s:11.5}) +
    T(170,26,'each step ≈ 2.5× fainter  ·  bigger number = fainter','mut',{s:11})); })(),
  cap:'The magnitude scale runs backwards: the bigger the number, the fainter the star. Each step is a factor of about 2.5 in brightness, and five steps is exactly 100.'}];
F['distances:4'] = [{svg:S(340,190, `<circle cx="28" cy="95" r="9" fill="none" stroke="${FC.ink}" stroke-width="1.5"/><circle cx="31" cy="95" r="3.5" fill="${FC.ink}"/>` +
  Dt(110,95,10,'sun',true) + Dt(290,95,4,'sun',true) + L(40,140,110,140,'mut',{a:1,a0:1,w:1}) + L(40,165,290,165,'mut',{a:1,a0:1,w:1}) +
  T(75,135,'10 pc','mut',{s:10.5}) + T(170,160,'real distance d','mut',{s:10.5}) + T(110,62,'M','amb',{i:1,b:1,s:15}) + T(110,48,'how bright from 10 pc','amb',{s:10}) +
  T(290,62,'m','cyan',{i:1,b:1,s:15}) + T(330,48,'how bright it looks','cyan',{a:'end',s:10}) + T(205,100,'same star','mut',{s:10.5})),
  cap:'M is the star’s brightness if it were placed at a standard 10 parsecs. m is how bright it looks at its real distance. The difference m − M tells you how far away it is.'}];
F['distances:5'] = [{svg:(() => {
  const XX=lp=>45+lp/2*265, YY=M=>25+(M-(-7))/((-1)-(-7))*150;
  let b=L(45,178,315,178,'mut')+L(45,178,45,20,'mut');
  b+=P(`M${f1(XX(0))},${f1(YY(-1.62))} L${f1(XX(2))},${f1(YY(-6.48))}`,'amb',{w:2});
  [[.3,-2.4],[.5,-2.7],[.6,-3.0],[.75,-3.6],[.9,-3.7],[1.0,-4.2],[1.1,-4.4],[1.25,-4.6],[1.35,-5.1],[1.5,-5.2],[1.6,-5.7],[1.75,-5.9]].forEach(p=>b+=Dt(XX(p[0]),YY(p[1]),3.4,'vio'));
  [[0,'1'],[1,'10'],[2,'100']].forEach(([lp,s])=>b+=T(XX(lp),192,s,'mut',{s:10}));
  let lc='M215,150'; for(let i=0;i<=40;i++){ const ph=(i%20)/20, y=150-(ph<0.2?ph/0.2:1-(ph-0.2)/0.8)*22; lc+=` L${215+i*2.3},${f1(y)}`; }
  return S(340,215, b + R(208,120,104,40,'dim',{rx:6,w:1}) + P(lc,'grn',{w:1.4}) + T(260,170,'one Cepheid pulsing','grn',{s:9.5}) +
    T(180,208,'pulse period (days)','mut',{s:10.5}) + T(18,100,'true brightness →','mut',{s:10.5,r:-90}) + T(130,40,'slower pulse = brighter star','amb',{s:11}));
})(), cap:'Leavitt’s discovery: Cepheids that take longer to pulse are more luminous. Measure the period (inset) and the line gives the true brightness.'}];
F['distances:6'] = [{svg:(() => {
  const X=t=>45+(t+12)/50*270, Y=m=>30+(m+20)/4.2*155;
  const curve=(pk,dm)=>{ const p=[]; for(let t=-12;t<=38;t+=1){ const m = t<0 ? pk+0.012*t*t : (t<=20? pk+dm*(t/15) : pk+dm*(20/15)+0.035*(t-20)); p.push([X(t),Y(m)]);} return poly(p); };
  return S(340,215, L(45,190,315,190,'mut')+L(45,190,45,20,'mut') + P(curve(-19.6,0.9),'amb',{w:2}) + P(curve(-19.0,1.6),'cyan',{w:2}) +
    L(X(0),25,X(0),190,'dim',{d:'3 3'}) + L(X(15),25,X(15),190,'dim',{d:'3 3'}) + T(X(7.5),40,'15 days','mut',{s:10}) +
    L(X(15)+6,Y(-19.0),X(15)+6,Y(-19.0+1.6),'cyan',{a:1,a0:1,w:1}) + T(X(15)+10,Y(-18.2)+4,'Δm₁₅','cyan',{a:'start',s:11}) +
    T(X(25),Y(-18.85),'slow fade','amb',{a:'start',s:10.5}) + T(X(22),Y(-15.75),'fast fade','cyan',{a:'start',s:10.5}) +
    T(180,206,'days after peak','mut',{s:10.5}) + T(18,105,'brightness →','mut',{s:10.5,r:-90}));
})(), cap:'Two Type Ia supernovae. The more luminous one fades more slowly. Measuring how much it fades in 15 days (Δm₁₅) corrects its peak brightness.'}];

/* =========================== 4 · SPEEDS =========================== */
F['speeds:0'] = [{svg:(() => { let b=''; for(let k=1;k<=5;k++) b+=Ci(170-k*12,100,k*20,'mut',{w:1.1,op:1-k*0.13});
  return S(340,200, b + Dt(170,100,6,'sun',true) + L(176,100,214,100,'amb',{w:2,a:1}) +
    T(318,92,'blueshift','blue',{a:'end',b:1,s:12}) + T(318,106,'waves squeezed','blue',{a:'end',s:10}) +
    T(22,92,'redshift','red',{a:'start',b:1,s:12}) + T(22,106,'waves stretched','red',{a:'start',s:10}) +
    T(195,92,'v','amb',{i:1,s:12}) + T(170,190,'the star moves → ; each circle is one wave crest','mut',{s:10.5})); })(),
  cap:'A moving star crowds its light waves together ahead of it (shorter, bluer wavelengths) and stretches them out behind it (longer, redder wavelengths). The size of the shift gives the speed.'}];
F['speeds:1'] = [{svg:(() => { const X=l=>20+(l-3900)*0.107; let b=R(20,40,300,34,'none',{nos:1,f:'#090b16'})+hspec(20,110,300,34);
  [[4047,.6],[4358,1],[5461,1],[5770,.8],[5791,.8]].forEach(([l,o])=>b+=L(X(l),40,X(l),74,'#ffffff',{w:2.2,op:o}));
  [4340,4861,6563].forEach(l=>b+=L(X(l),110,X(l),144,'#05060d',{w:3}));
  [4358,5461].forEach(l=>b+=L(X(l),78,X(l),166,'dim',{d:'3 3',w:1}));
  for(let i=0;i<=10;i++) b+=L(20+i*30,170,20+i*30,176,'mut',{w:1});
  return S(340,215, b + L(20,170,320,170,'mut',{w:1}) + T(170,32,'comparison lamp: lines at known wavelengths','ink',{s:10.5}) + T(170,104,'star','ink',{s:10.5}) +
    T(X(4358),190,'4358 Å','amb',{s:10}) + T(X(5461),190,'5461 Å','amb',{s:10}) + T(170,207,'detector pixels →','mut',{s:10})); })(),
  cap:'A lamp with known emission lines (top) is recorded on the same detector as the star (bottom). The lamp lines pin down which pixel corresponds to which wavelength.'}];
F['speeds:2'] = [{svg:(() => { const s=[110,140], e=[110,70], ang=35, ux=Math.cos(ang*Math.PI/180), uy=-Math.sin(ang*Math.PI/180), comp=85*ux;
  return S(340,215, Ci(...s,70,'dim',{d:'4 4'}) + sunG(...s) + Dt(...e,6,'earth') + L(e[0],e[1],e[0]+85,e[1],'cyan',{w:2,a:1}) +
    L(e[0],e[1],e[0]+130*ux,e[1]+130*uy,'dim',{d:'2 4'}) + star(e[0]+140*ux,e[1]+140*uy,15,'ink') +
    L(e[0],e[1],e[0]+comp*ux,e[1]+comp*uy,'amb',{w:2.4,a:1}) + L(e[0]+85,e[1],e[0]+comp*ux,e[1]+comp*uy,'mut',{d:'3 3',w:1}) +
    T(e[0]+90,e[1]+14,"Earth's velocity",'cyan',{a:'start',s:10.5}) + T(e[0]+40,e[1]-34,'part toward the star','amb',{a:'end',s:10.5}) +
    T(e[0]+150*ux,e[1]+150*uy-4,'to the star','ink',{s:10.5}) + T(s[0],s[1]+24,'Sun','sun',{s:10}) + T(330,200,'add the amber part back to get the star’s own speed','mut',{a:'end',s:9.5})); })(),
  cap:'Earth moves at 30 km/s. Only the part of that motion pointing toward the star (amber) shifts the star’s lines, and that is what the correction removes.'}];
F['speeds:3'] = [{svg:(() => { const O=[40,185], s=[200,110], u=[0.916,-0.401], n=[-0.401,-0.916], vr=[s[0]+70*u[0],s[1]+70*u[1]], vt=[s[0]+55*n[0],s[1]+55*n[1]], v=[s[0]+70*u[0]+55*n[0],s[1]+70*u[1]+55*n[1]];
  return S(340,215, L(O[0],O[1],s[0],s[1],'dim',{d:'4 4'}) + L(...s,...vr,'rose',{w:2.2,a:1}) + L(...s,...vt,'vio',{w:2.2,a:1}) + L(...s,...v,'grn',{w:2.6,a:1}) +
    L(...vr,...v,'dim',{d:'3 3',w:1}) + L(...vt,...v,'dim',{d:'3 3',w:1}) + star(...s,16,'ink') +
    `<circle cx="${O[0]}" cy="${O[1]}" r="8" fill="none" stroke="${FC.ink}" stroke-width="1.5"/><circle cx="${O[0]+3}" cy="${O[1]}" r="3" fill="${FC.ink}"/>` +
    T(332,vr[1]+24,'v_r: from the spectrum','rose',{a:'end',s:10.5}) + T(vt[0]-6,vt[1],'v_t: proper motion × distance','vio',{a:'end',s:10.5}) +
    T(v[0]+6,v[1]-4,'v: true speed','grn',{a:'start',s:10.5}) + T(O[0]+14,O[1]+4,'us','ink',{a:'start',s:10.5})); })(),
  cap:'Make a right triangle with x = the speed along our line of sight (v_r, from the Doppler shift), y = the speed across the sky (v_t, from proper motion and distance), and z = the true speed v (the hypotenuse).'}];
F['speeds:4'] = [{svg:(() => { const c=[80,105]; let curve1='', curve2='';
  for(let i=0;i<=60;i++){ const x=165+i*2.6, ph=i/60*2*Math.PI*1.5; curve1+=(i?' L':'M')+f1(x)+','+f1(105-20*Math.sin(ph)); curve2+=(i?' L':'M')+f1(x)+','+f1(105+48*Math.sin(ph)); }
  return S(340,215, Ci(...c,18,'amb',{d:'3 3',w:1}) + Ci(...c,46,'cyan',{d:'3 3',w:1}) + L(c[0]-4,c[1],c[0]+4,c[1],'mut') + L(c[0],c[1]-4,c[0],c[1]+4,'mut') +
    Dt(c[0]+18,c[1],9,'amb',true) + Dt(c[0]-46,c[1],5,'cyan',true) + T(c[0],180,'two stars circle','mut',{s:10}) + T(c[0],193,'their balance point','mut',{s:10}) +
    L(165,105,325,105,'dim',{w:1}) + P(curve1,'amb',{w:2}) + P(curve2,'cyan',{w:2}) + L(171,105,171,57,'cyan',{a:1,w:1.2}) + T(176,62,'K','cyan',{a:'start',i:1,b:1,s:13}) +
    T(245,200,'velocity over time','mut',{s:10.5}) + T(245,26,'lighter star swings more','cyan',{s:10})); })(),
  cap:'Two stars orbit their shared centre of mass. Each one’s lines swing back and forth in velocity. The size of the swing (K) and its period (P) feed into Kepler’s third law to weigh the stars.'}];
F['speeds:5'] = [{svg:(() => { const rows=[['lab (at rest)',0],['nearby galaxy',0.05],['quasar 3C 273',0.158]]; const L0=[95,150,200]; let b='';
  rows.forEach(([lab,z],i)=>{ const y=30+i*55; b+=hspec(20,y,300,30)+T(20,y-5,lab,'ink',{a:'start',s:10.5})+T(320,y-5,'z = '+z,'mut',{a:'end',s:10});
    L0.forEach(x=>{ const xs=20+(x-20)*(1+z); b+=L(xs,y,xs,y+30,'#05060d',{w:3}); }); });
  return S(340,215, b + L(150,200,250,200,'red',{w:2,a:1}) + T(140,204,'lines slide redward','red',{a:'end',s:10.5})); })(),
  cap:'The same pattern of lines slides toward the red as the source recedes faster. For galaxies the slide grows with distance, which is Hubble’s law.'}];

/* =========================== 5 · COMPOSITION =========================== */
F['composition:0'] = [{svg:(() => { const h=6.626e-34,c=2.998e8,k=1.381e-23, B=(l,T)=>1/Math.pow(l,5)/(Math.exp(h*c/(l*k*T))-1);
  const Ts=[[10000,'blue'],[6000,'amb'],[4000,'red']], max=B(2.898e-3/10000,10000), X=nm=>45+(nm-100)/1900*270, Y=v=>185-v/max*160;
  let b=hspec(X(380),187,X(750)-X(380),7) + L(45,185,315,185,'mut') + L(45,185,45,18,'mut');
  Ts.forEach(([Tk,cc])=>{ const p=[], mk=B(2.898e-3/Tk,Tk), Bn=(l)=>B(l,Tk)/mk*max; for(let nm=100;nm<=2000;nm+=10) p.push([X(nm),Y(Bn(nm*1e-9))]); b+=P(poly(p),cc,{w:2});
    const pk=2.898e-3/Tk*1e9; b+=Dt(X(pk),Y(max),4,cc)+L(X(pk),Y(max),X(pk),185,cc,{d:'3 3',w:1})+T(330,40+Ts.findIndex(t=>t[0]===Tk)*16,Tk.toLocaleString()+' K',cc,{a:'end',s:11,b:1}); });
  return S(340,215, b + T(180,208,'wavelength (nm) →   visible band shown in colour','mut',{s:10}) + T(18,100,'brightness (each scaled to peak)','mut',{s:9.5,r:-90}) +
    T(330,104,'hotter → peak moves blue','ink',{a:'end',s:11})); })(),
  cap:'Glowing bodies at three temperatures, computed from Planck’s law. Each curve is scaled to the same height so you can compare where it peaks. Hotter bodies peak at shorter, bluer wavelengths. (In absolute terms the hot one is also far brighter.)'}];
F['composition:1'] = [{svg:(() => { const Y=n=>20+170*Math.pow(1/n,1.3); let b='';
  for(let n=1;n<=6;n++) b+=L(60,Y(n),320,Y(n),n===2?'ink':'mut',{w:n<=2?1.8:1})+(n<=3?T(52,Y(n)+4,'n='+n,'mut',{a:'end',s:10}):'');
  b+=T(52,Y(5)+2,'n=4…','mut',{a:'end',s:10});
  b+=L(85,Y(1),85,Y(2)+3,'mut',{a:1,w:1.6})+T(92,Y(1)-12,'Lyman (ultraviolet)','mut',{a:'start',s:9.5});
  [[3,'red','Hα 656'],[4,'cyan','Hβ 486'],[5,'blue','Hγ 434'],[6,'vio','Hδ 410']].forEach(([n,c,l],i)=>{ const x=150+i*42; b+=L(x,Y(2),x,Y(n)+3,c,{a:1,w:2.2})+T(x,Y(2)+16,l,c,{s:9.5}); });
  return S(340,215, b + T(320,Y(2)+32,'Balmer series: all start at n = 2','ink',{a:'end',s:10.5}) + T(320,14,'energy levels (schematic)','mut',{a:'end',s:9.5})); })(),
  cap:'Hydrogen’s electron can only sit on certain rungs. A jump from rung 2 up to rung 3, 4, 5… absorbs one exact colour: the Balmer lines Hα, Hβ, Hγ, Hδ.'},
  {img:'img/balmer_spectrum.png', cap:'The same Balmer lines as real dips in a star’s spectrum, captured with a Star Analyser 100 at 13.46 Å/pixel.', credit:'From the Spectroscopy companion'}];
F['composition:2'] = [{svg:(() => { const panel=(x0,title,counts)=>{ let b=T(x0+70,22,title,'ink',{s:11.5,b:1}); const ys=[170,110,60];
  ys.forEach((y,i)=>{ b+=L(x0+10,y,x0+130,y,'mut')+T(x0+5,y+4,'n='+(i+1),'mut',{a:'end',s:9.5}); for(let j=0;j<counts[i];j++) b+=Dt(x0+18+(j%12)*9.5,y-6-Math.floor(j/12)*9,3.4,'cyan'); }); return b; };
  return S(340,215, panel(35,'cool star',[22,0,0]) + panel(195,'hot star',[18,4,1]) + T(170,205,'collisions in hotter gas kick more atoms up to higher rungs','mut',{s:10})); })(),
  cap:'In a cool star almost every hydrogen atom sits on the bottom rung. A hotter gas kicks more atoms up to rung 2, where Balmer absorption starts. The dot counts are exaggerated: in the Sun it is about 1 in 100 million.'}];
F['composition:3'] = [{svg:(() => { const atom=(x,y)=>Ci(x,y,9,'dim',{w:1})+Dt(x,y,3.4,'rose')+Dt(x+9,y-2,2.2,'cyan');
  let a='', b=''; [[60,70],[100,100],[75,140],[125,60],[130,150],[50,170],[110,185]].forEach(p=>a+=atom(...p));
  [[220,70],[260,100],[235,140],[285,60],[290,150],[210,175],[270,185]].forEach(p=>b+=Dt(...p,3.6,'rose'));
  [[240,85],[300,120],[215,115],[275,165],[255,55],[305,185],[230,195]].forEach(p=>b+=Dt(...p,2.2,'cyan'));
  return S(340,215, R(25,35,135,165,'dim',{rx:10,w:1}) + R(185,35,135,165,'dim',{rx:10,w:1}) + a + b +
    T(92,25,'cooler: neutral atoms','ink',{s:11}) + T(252,25,'hotter: ionized','ink',{s:11}) +
    T(170,212,'● proton   ● electron: an atom with no electron can’t make a line','mut',{s:9.5})); })(),
  cap:'Heat pulls electrons free. A bare proton has no electron to jump between rungs, so ionized hydrogen produces no lines at all.'}];
F['composition:4'] = [{svg:(() => { const k=1.381e-23, me=9.109e-31, h=6.626e-34, eV=1.602e-19, Pe=20;
  const frac=T=>{ const kT=k*T, b=4*Math.exp(-10.2*eV/kT), sa=(kT/Pe)*(1/2)*2*Math.pow(2*Math.PI*me*kT/(h*h),1.5)*Math.exp(-13.6*eV/kT); return [b/(1+b), 1/(1+sa)]; };
  const Ts=[]; for(let T=4000;T<=25000;T+=100) Ts.push(T);
  const prod=Ts.map(T=>{const [a,c]=frac(T); return a*c;}), pmax=Math.max(...prod), bz=Ts.map(T=>frac(T)[0]), bmax=Math.max(...bz);
  const X=T=>45+(T-4000)/21000*270, Y=v=>185-v*155; const Tpk=Ts[prod.indexOf(pmax)];
  return S(340,215, L(45,185,315,185,'mut')+L(45,185,45,22,'mut') +
    P(poly(Ts.map((T,i)=>[X(T),Y(bz[i]/bmax)])),'cyan',{d:'5 4',w:1.6}) + P(poly(Ts.map(T=>[X(T),Y(frac(T)[1])])),'rose',{d:'5 4',w:1.6}) +
    P(poly(Ts.map((T,i)=>[X(T),Y(prod[i]/pmax)])),'amb',{w:2.6}) + L(X(Tpk),Y(1),X(Tpk),185,'dim',{d:'3 3'}) +
    T(X(Tpk)+5,Y(1)+2,'≈ '+(Math.round(Tpk/100)*100).toLocaleString()+' K: A stars','amb',{a:'start',s:10.5}) +
    T(300,Y(0.93),'excited to n=2','cyan',{a:'end',s:10}) + T(X(11500),Y(0.45),'← still neutral','rose',{a:'start',s:10}) + T(X(18000),Y(0.18),'Balmer strength','amb',{s:10.5,b:1}) +
    [5000,10000,15000,20000,25000].map(T_=>T(X(T_),199,T_/1000+'k','mut',{s:9.5})).join('') + T(180,212,'surface temperature (K)','mut',{s:10}));
})(), cap:'Computed with the Boltzmann and Saha equations. The fraction excited (blue) rises with temperature, the fraction still neutral (red) collapses, and their product (amber) peaks near 10,000 K. That is why Balmer lines are strongest in A stars.'}];
F['composition:5'] = [{svg:(() => { const yc=45, y0=175, s=14, d=0.7, cx=110, Wpx=d*s*Math.sqrt(2*Math.PI); const p=[];
  for(let x=30;x<=190;x+=2) p.push([x, yc + d*(y0-yc)*Math.exp(-((x-cx)**2)/(2*s*s))]);
  return S(340,215, L(25,y0,320,y0,'mut') + L(25,yc,320,yc,'dim',{d:'4 4'}) + P(poly([[30,yc],...p,[190,yc]])+' Z','amb',{nos:1,f:'amb',fo:.35}) + P(poly(p),'ink',{w:2}) +
    R(250,yc,Wpx,y0-yc,'amb',{f:'amb',fo:.35}) + L(250,y0+10,250+Wpx,y0+10,'amb',{a:1,a0:1,w:1}) + T(250+Wpx/2,y0+26,'W','amb',{i:1,b:1,s:14}) +
    T(28,yc-8,'continuum (no absorption)','mut',{a:'start',s:10}) + T(110,y0+18,'the absorption line','ink',{s:10.5}) + T(215,110,'=','ink',{s:22}) +
    T(250+Wpx+8,yc+70,'same area','amb',{a:'start',s:10.5})); })(),
  cap:'Equivalent width: the area the line removes from the spectrum (left) equals a fully dark rectangle of width W (right). More absorbing atoms remove more light and give a larger W.'}];

/* =========================== 6 · COMETS =========================== */
F['comets:0'] = [{svg:(() => { const X=y=>25+(y-1500)/300*295; let b=L(20,110,325,110,'mut',{w:1.4});
  [1500,1600,1700,1800].forEach(y=>b+=L(X(y),105,X(y),115,'mut',{w:1})+T(X(y),132,y,'mut',{s:10}));
  const ys=[1531,1607,1682,1759]; ys.forEach((y,i)=>{ b+=Dt(X(y),110,5,i===3?'grn':'cyan',true)+T(X(y),88,y,i===3?'grn':'cyan',{s:11,b:1}); if(i) b+=P(`M${f1(X(ys[i-1]))},150 Q${f1((X(ys[i-1])+X(y))/2)},168 ${f1(X(y))},150`,'amb',{w:1.2})+T((X(ys[i-1])+X(y))/2,182,(y-ys[i-1])+' yr','amb',{s:10.5}); });
  return S(340,200, b + T(X(1759),70,'predicted return','grn',{s:10}) + T(170,30,'three “different” comets, one orbit','ink',{s:12})); })(),
  cap:'Halley saw that the comets of 1531, 1607 and 1682 had nearly identical orbits about 76 years apart. He concluded they were one comet and predicted its return for 1758–59.'}];
F['comets:1'] = [{svg:(() => { const sx=40, sy=110, s=8, q=0.586, a=17.9, Q=2*a-q, b=a*Math.sqrt(1-Math.pow(1-q/a,2));
  let p=''; [[1,'Earth'],[5.2,'Jupiter'],[9.54,'Saturn'],[30.1,'Neptune']].forEach(([r,n])=>p+=Ci(sx,sy,r*s,'dim',{w:1,d:r>2?'3 4':''}));
  return S(340,220, p + `<ellipse cx="${f1(sx+(a-q)*s)}" cy="${sy}" rx="${f1(a*s)}" ry="${f1(b*s)}" stroke="${FC.cyan}" stroke-width="2" fill="none"/>` + sunG(sx,sy,6) +
    T(sx+5.2*s+2,sy-46,'Jupiter','mut',{a:'start',s:9.5}) + T(sx+30.1*s-6,30,'Neptune','mut',{a:'end',s:9.5}) +
    L(sx-q*s-1,sy+52,sx+Q*s,sy+52,'amb',{a:1,a0:1,w:1}) + T(sx+Q*s/2,sy+66,'aphelion Q ≈ 35 AU','amb',{s:10.5}) +
    T(sx-30,sy+42,'q ≈ 0.6 AU','amb',{a:'start',s:10}) + T(200,sy-48,"Halley's orbit",'cyan',{s:11,b:1})); })(),
  cap:'Halley’s comet, drawn to scale. It skims inside Venus’s orbit (q ≈ 0.6 AU) and swings out beyond Neptune (Q ≈ 35 AU). The eccentricity is 0.97.'}];
F['comets:2'] = [{svg:(() => { const fx=100, fy=110, a=110, e=0.8, q=a*(1-e); let par=''; for(let y=-90;y<=90;y+=3) par+=(y===-90?'M':' L')+f1(fx-q+y*y/(4*q)*0.4)+','+f1(fy+y);
  return S(340,220, P(par,'dim',{d:'4 4'}) + P(orbit(fx,fy,a,e,180),'cyan',{w:2}) + sunG(fx,fy,7) +
    L(fx-q,fy,fx-q,fy-62,'rose',{w:2.4,a:1}) + L(fx+a*(1+e),fy,fx+a*(1+e),fy+12,'rose',{w:2.4,a:1}) +
    T(fx-q-6,fy-48,'fast','rose',{a:'end',b:1,s:11}) + T(fx+a*(1+e)-6,fy+30,'slow','rose',{a:'end',b:1,s:11}) +
    T(60,20,'dashed: escape orbit (parabola)','mut',{a:'start',s:10}) + T(230,200,'v² = GM(2/r − 1/a)','ink',{s:12,b:1})); })(),
  cap:'Energy is conserved, so a comet speeds up as it falls toward the Sun and crawls at the far end. Moving any faster at a given distance would send it out on an open, escaping path (dashed).'}];
F['comets:3'] = [{svg:(() => { const sx=60, sy=120, th=-145.4, C=orbitPt(sx,sy,150,0.9,180,th), J=pt(sx,sy,110,14);
  return S(340,220, Ci(sx,sy,110,'amb',{d:'4 4',w:1.2}) + P(orbit(sx,sy,150,0.9,180),'cyan',{w:2}) + sunG(sx,sy,7) +
    Dt(...J,9,'amb',true) + Dt(...C,4,'cyan',true) + L(...C,J[0]-3,J[1]-6,'rose',{w:2,a:1}) +
    T(J[0]+14,J[1]+16,'Jupiter','amb',{a:'start',s:10.5}) + T(C[0]-8,C[1]-8,'comet','cyan',{a:'end',s:10}) + T(330,24,'Jupiter’s tug changes the orbit size a','rose',{a:'end',s:10.5}) +
    T(330,40,'→ period changes → return delayed','rose',{a:'end',s:10.5}) + T(330,208,'1759: ~618 days late, as predicted','grn',{a:'end',s:11})); })(),
  cap:'Each time the comet passes a giant planet its orbit is nudged. A slightly larger orbit means a slightly longer period. Clairaut’s team added up those nudges to predict the 1759 return.'}];
F['comets:4'] = [{svg:(() => { const s=[80,150], E=[160,185], C=[270,60];
  return S(340,215, L(...s,...E,'earth',{w:2,a:1}) + L(...s,...C,'cyan',{w:2,a:1}) + L(...E,...C,'amb',{w:2.6,a:1}) + sunG(...s,8) + Dt(...E,6,'earth') + Dt(...C,5,'ink',true) +
    T(105,182,'r⊕','earth',{i:1,s:13}) + T(160,95,'r comet','cyan',{i:1,s:12}) + T(226,140,'ρ = r comet − r⊕','amb',{a:'start',i:1,s:12}) +
    T(C[0],C[1]-14,'comet','ink',{s:10.5}) + T(E[0]+10,E[1]+4,'Earth','earth',{a:'start',s:10.5}) + T(s[0],s[1]+24,'Sun','sun',{s:10}) +
    T(330,24,'ρ’s direction = RA, Dec','amb',{a:'end',s:10.5})); })(),
  cap:'Orbits give positions measured from the Sun. Subtracting Earth’s own position gives ρ, the arrow from Earth to the comet. Its direction is where the telescope must point.'}];
F['comets:5'] = [{svg:(() => { const s=[60,170], pts=[[150,150],[205,95],[240,30]].map(p=>p);
  return S(340,215, P(`M110,175 Q220,140 255,10`,'dim',{d:'4 4'}) + P(poly([s,pts[0],pts[1]])+' Z','amb',{nos:1,f:'amb',fo:.2}) + P(poly([s,pts[1],pts[2]])+' Z','vio',{nos:1,f:'vio',fo:.2}) +
    pts.map((p,i)=>L(...s,...p,'cyan',{w:1.6,a:1})+Dt(...p,4.5,'ink',true)+T(p[0]+10,p[1]+4,'r'+['₁','₂','₃'][i],'cyan',{a:'start',i:1,s:13})).join('') + sunG(...s,7) +
    T(330,170,'all three lie in one plane','ink',{a:'end',s:10.5}) + T(330,186,'so r₂ = c₁ r₁ + c₃ r₃','ink',{a:'end',s:11,b:1}) + T(330,202,'weights ≈ the shaded areas ≈ time gaps','mut',{a:'end',s:9.5})); })(),
  cap:'Three positions on the same orbit all lie in one flat plane with the Sun. So the middle one is a blend of the other two, and Kepler’s area law says the blend weights match the time gaps between sightings.'}];
F['comets:6'] = [{svg:(() => { const c=[100,105], r=60, E=[320,105];
  return S(340,210, Ci(...c,r,'rose',{f:'rose',fo:.08,w:2}) + Dt(...c,5,'ink',true) + [0,60,120,180,240,300].map(a=>L(...pt(...c,12,a),...pt(...c,r-6,a),'rose',{w:1.2,a:1})).join('') +
    L(...E,c[0],c[1],'dim',{d:'4 4'}) + L(...E,c[0],c[1]-r,'dim',{d:'4 4'}) + Arc(...E,70,180,180-Math.atan(r/(E[0]-c[0]))*180/Math.PI,'amb') +
    T(E[0]-82,E[1]-6,'θ','amb',{i:1,s:14}) + T(E[0],E[1]+20,'Earth','earth',{s:10.5}) + Dt(...E,5,'earth') +
    T(c[0],c[1]+r+18,'R = v_exp × t','rose',{s:11}) + T(c[0],22,'shell blown off by the nova','ink',{s:10.5}) + T(225,180,'d = R / θ','amb',{s:12.5,b:1})); })(),
  cap:'The spectrum gives the shell’s speed and the calendar gives its age, so speed × age is its real radius. A photograph gives its angular radius θ. Dividing one by the other gives the distance.'}];

/* =========================== 7 · MERCURY =========================== */
F['mercury:0'] = [{svg:(() => { const seg=[['Venus',277.9,'cyan'],['Jupiter',153.6,'amb'],['Earth',90.0,'grn'],['others',9.5,'mut'],['GR: 43″',43,'rose']], sc=290/574; let x=25, b='';
  seg.forEach(([n,v,c],i)=>{ const w=v*sc; b+=R(x,80,w,40,c,{f:c,fo:.45,w:1}); if(n!=='others') b+=T(x+w/2, i%2||i===4? 140:70, n, c, {s:10.5}); x+=w; });
  return S(340,190, b + L(25,160,25+531*sc,160,'mut',{a:1,a0:1,w:1}) + T(25+531*sc/2,178,'Newton: other planets = 531″','mut',{s:10.5}) +
    T(25+290,40,'observed: 574″ per century','ink',{a:'end',s:11,b:1})); })(),
  cap:'Mercury’s perihelion moves 574″ per century relative to the stars. The pulls of the other planets account for 531″ (Venus and Jupiter most). The leftover 43″ (rose) is the mystery.'}];
F['mercury:1'] = [{svg:(() => { const fx=200, fy=105, a=95, e=0.5, q1=orbitPt(fx,fy,a,e,0,15), q2=orbitPt(fx,fy,a+8,e,0,30), q3=orbitPt(fx,fy,a,e,0,45);
  return S(340,215, P(orbit(fx,fy,a,e,0),'cyan',{w:2}) + sunG(fx,fy,8) + Dt(...orbitPt(fx,fy,a,e,0,0),6,'mars',true) +
    P(`M${f1(q1[0])},${f1(q1[1])} Q${f1(q2[0])},${f1(q2[1])} ${f1(q3[0])},${f1(q3[1])}`,'amb',{a:1}) +
    T(orbitPt(fx,fy,a,e,0,0)[0]+10,fy+20,'perihelion','mars',{a:'start',s:10.5}) + T(170,207,'pure 1/r² gravity: after one lap it is exactly back where it started','mut',{s:10})); })(),
  cap:'With an exact inverse-square force, the planet’s in-and-out motion and its around-the-Sun motion keep perfect step. The ellipse closes on itself every lap and never turns.'}];
F['mercury:2'] = [{svg:(() => { let b=''; for(let k=0;k<8;k++) b+=P(orbit(170,118,70,0.55,k*22),'cyan',{w:1.3,op:0.25+k*0.1}) + Dt(...orbitPt(170,118,70,0.55,k*22,0),3.5,'mars');
  return S(340,250, b + sunG(170,118,7) + T(170,244,'each lap the ellipse turns a little: a “rosette” (hugely exaggerated)','mut',{s:10})); })(),
  cap:'Einstein’s extra term breaks the perfect step, so the ellipse turns a little every lap and the perihelion (dots) creeps around. The real effect for Mercury is about 700,000 times smaller than drawn.'}];
F['mercury:3'] = [{svg:(() => { const sx=130, sy=108, a=100, e=0.55, d=20;
  return S(340,215, P(orbit(sx,sy,a,e,180),'dim',{w:1.4,d:'4 4'}) + P(orbit(sx,sy,a,e,180+d),'cyan',{w:2}) + sunG(sx,sy,7) +
    L(sx,sy,...orbitPt(sx,sy,a,e,180,0),'dim',{w:1}) + L(sx,sy,...orbitPt(sx,sy,a,e,180+d,0),'cyan',{w:1}) +
    Dt(...orbitPt(sx,sy,a,e,180,0),4,'mars') + Dt(...orbitPt(sx,sy,a,e,180+d,0),5,'mars',true) + Arc(sx,sy,40,180,180+d,'amb',{w:2.2}) +
    T(sx-56,sy+34,'Δφ','amb',{i:1,b:1,s:14}) + T(12,24,'last lap (dashed)','mut',{a:'start',s:10}) + T(12,40,'this lap (solid)','cyan',{a:'start',s:10}) +
    T(170,205,'Δφ = 6πGM / c²a(1 − e²)  ·  Mercury: 0.1″ per lap','ink',{s:10.5})); })(),
  cap:'From one lap to the next the closest point (perihelion) moves forward by a small angle Δφ. Orbits closer to the Sun and more stretched orbits move more.'}];
F['mercury:4'] = [{svg:(() => { const d=[['Mercury',43.0],['Venus',8.6],['Earth',3.8],['Mars',1.35]]; let b=L(70,180,320,180,'mut');
  d.forEach(([n,v],i)=>{ const y=40+i*36, w=v/43*235; b+=R(72,y,w,24,i?'vio':'rose',{f:i?'vio':'rose',fo:.5,w:1})+T(64,y+16,n,'ink',{a:'end',s:11})+T(78+w,y+16,v+'″','ink',{a:'start',s:10.5}); });
  return S(340,210, b + T(195,200,'GR perihelion shift per century (falls off as a^−5/2)','mut',{s:10}) + T(195,24,'0.1035″ per orbit × 415 orbits = 43″','rose',{s:11})); })(),
  cap:'Tiny per orbit, but Mercury laps the Sun 415 times a century, so it adds up to 43″. Farther planets lose twice: a smaller shift per lap and fewer laps.'}];
F['mercury:5'] = [{img:'img/pulsar_periastron_advance.png', cap:'Real timing data for the Hulse–Taylor binary pulsar. The orbit’s shape seen in 1981–84 (blue) and 2009–13 (red) differs because its periastron turned by about 4.2° per year, the same physics as Mercury, scaled up.', credit:'From the Gravitational Waves companion (PINT analysis of the Zenodo TOAs)'}];

window.FIGS = F;
})();
