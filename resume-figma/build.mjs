// 이력서 템플릿 빌드 스크립트
//   node build.mjs              → index.html + svg/ + png/ + resume.pdf
//   node build.mjs --html-only  → index.html 만 생성
// 내용 수정은 content.json 에서 합니다. (**굵게** 표기 지원)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(fs.readFileSync(path.join(DIR, 'content.json'), 'utf8'));

// ---------- HTML ----------
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const rich = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');

const logo = (l, size) => {
  if (l.type === 'text') {
    return `<div class="logo logo-text" data-layer="logo" style="--s:${size}px;background:${esc(l.bg)};color:${esc(l.color)}"><span>${esc(l.text)}</span></div>`;
  }
  return `<div class="logo logo-bldg" data-layer="logo" style="--s:${size}px">
      <i class="b-body"></i><i class="b-win" style="left:.40em;top:.33em"></i><i class="b-win" style="left:.53em;top:.33em"></i>
      <i class="b-win" style="left:.40em;top:.45em"></i><i class="b-win" style="left:.53em;top:.45em"></i>
      <i class="b-door"></i></div>`;
};

const pageHead = title => `<div class="page-head" data-layer="page-title"><h2>${esc(title)}</h2></div><div class="rule" data-layer="rule"></div>`;

const cover = () => {
  const p = data.profile;
  return `<section class="page" data-layer="01-이력서">
  <header class="cover-head" data-layer="profile">
    <h1 class="name">${esc(p.name)}</h1>
    <p class="birth">${esc(p.birth)}</p>
    <div class="photo" data-layer="photo"><i class="ph-head"></i><i class="ph-body"></i></div>
  </header>
  <h2 class="headline" data-layer="headline">${esc(p.headline)}</h2>
  <div class="rule" data-layer="rule"></div>
  <div class="intro" data-layer="intro">${p.intro.map(lines => `<p>${lines.map(rich).join('<br>')}</p>`).join('')}</div>
  <div class="sec-head" data-layer="section-경력"><h3>경력</h3><span class="total">${esc(data.career.total)}</span></div>
  <div class="rule" data-layer="rule"></div>
  <div class="jobs">${data.career.rows.map((r, i) => `
    <div class="job" data-layer="job-${i + 1}">
      ${logo(r.logo, 45)}
      <div class="job-meta">
        <p class="co">${esc(r.company)}</p>${r.role ? `<p class="role">${esc(r.role)}</p>` : ''}<p class="period">${esc(r.period)}</p>
      </div>
      <ul class="job-hl">${r.highlights.map(h => `<li>${rich(h)}</li>`).join('')}</ul>
    </div>`).join('')}
  </div>
  <div class="sec-head edu-head" data-layer="section-교육자격"><h3>교육 · 자격</h3></div>
  <div class="rule" data-layer="rule"></div>
  <div class="edu">${data.education.map((e, i) => `
    <div class="edu-row" data-layer="edu-${i + 1}"><span class="d">${esc(e.date)}</span><span class="t">${esc(e.text)}</span></div>`).join('')}
  </div>
</section>`;
};

const strengths = () => `<section class="page" data-layer="02-강점">
  ${pageHead('강점')}
  ${data.strengths.map((s, i) => `${i ? '<div class="hair st-hair" data-layer="divider"></div>' : ''}
  <div class="strength" data-layer="strength-${i + 1}">
    <h3 class="st-title">${esc(s.title)}</h3>
    <div class="st-body">${s.paragraphs.map(t => `<p>${rich(t)}</p>`).join('')}</div>
  </div>`).join('')}
</section>`;

const careerDetail = () => `<section class="page" data-layer="03-경력">
  ${pageHead('경력')}
  ${data.careerDetail.map((c, i) => `${i ? '<div class="hair" data-layer="divider"></div>' : ''}
  <div class="cd-block" data-layer="company-${i + 1}">
    <div class="cd-left"><p class="cd-co">${esc(c.company)}</p><p class="cd-period">${esc(c.period)}</p></div>
    <div class="cd-right">${c.items.map((it, j) => `${j ? '<div class="hair" data-layer="divider"></div>' : ''}
      <div class="cd-item"><p class="cd-title">${rich(it.title)}</p><p class="cd-desc">${rich(it.desc)}</p></div>`).join('')}
    </div>
  </div>`).join('')}
</section>`;

const section = s => {
  let body = '';
  if (s.type === 'text') body = `<div class="pj-text">${s.lines.map(l => `<p>${rich(l)}</p>`).join('')}</div>`;
  if (s.type === 'entities') body = s.items.map(it => `<div class="ent"><p class="ent-name">${rich(it.name)}</p><p class="ent-desc">${rich(it.desc)}</p></div>`).join('');
  if (s.type === 'bullets') body = `<ul class="pj-list">${s.items.map(t => `<li><span class="dot">·</span><span>${rich(t)}</span></li>`).join('')}</ul>`;
  return `<div class="pj-sec sec-${s.type}" data-layer="sec-${esc(s.title)}"><h4>${esc(s.title)}</h4>${body}</div>`;
};

const project = (pj, i) => `<section class="page" data-layer="${String(i + 4).padStart(2, '0')}-프로젝트${i + 1}">
  ${pageHead(`프로젝트 ${i + 1}`)}
  <h3 class="pj-title" data-layer="project-title">${rich(pj.title)}</h3>
  <div class="org" data-layer="org">${logo(pj.org.logo, 35)}<div><p class="org-name">${esc(pj.org.name)}</p><p class="org-period">${esc(pj.org.period)}</p></div></div>
  ${pj.sections.map((s, j) => `${j ? '<div class="hair" data-layer="divider"></div>' : ''}${section(s)}`).join('')}
</section>`;

const CSS = `
:root{--ink:#111;--text:#222;--body:#333;--sub:#444;--muted:#666;--gray:#777;--light:#999;--rule:#222;--hair:#e1e1e1}
*{box-sizing:border-box;margin:0;padding:0}
body{background:#e9e9ec;color:var(--text);font-family:Pretendard,"Pretendard Variable",-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Noto Sans KR",sans-serif;-webkit-font-smoothing:antialiased}
.pages{display:flex;flex-direction:column;align-items:center;gap:40px;padding:40px 0}
.page{width:960px;height:1356px;background:#fff;position:relative;overflow:hidden;padding:0 80px}
.rule{height:2px;background:var(--rule)}
.hair{height:1px;background:var(--hair)}
ul{list-style:none}
b{font-weight:700;color:var(--ink)}
i{display:block;position:absolute}

/* logos */
.logo{width:var(--s);height:var(--s);font-size:var(--s);border-radius:50%;flex:none;position:relative;overflow:hidden}
.logo-bldg{background:#c8e9ff}
.logo-bldg .b-body{left:.34em;top:.24em;width:.32em;height:.50em;border-radius:.04em;background:#6f95bd}
.logo-bldg .b-win{width:.07em;height:.07em;background:#fff}
.logo-bldg .b-door{left:.455em;top:.60em;width:.09em;height:.14em;background:#fff}
.logo-text{display:flex;align-items:center;justify-content:center}
.logo-text span{font-size:.2em;font-weight:800;letter-spacing:.02em}

/* 01 cover */
.cover-head{padding-top:55px}
.name{font-size:60px;line-height:75px;font-weight:700;letter-spacing:-.02em;color:var(--text)}
.birth{margin-top:12px;font-size:20px;line-height:28px;color:var(--gray);letter-spacing:-.02em}
.photo{position:absolute;left:732px;top:59px;width:137px;height:182px;border:1px solid #eee;border-radius:16px;background:#f3f4f6;overflow:hidden}
.ph-head{left:45.5px;top:44px;width:44px;height:44px;border-radius:50%;background:#d5d9df}
.ph-body{left:22.5px;top:100px;width:90px;height:80px;border-radius:45px 45px 0 0;background:#d5d9df}
.headline{margin-top:77px;font-size:24px;line-height:32px;font-weight:600;letter-spacing:-.02em;color:var(--ink)}
.headline+.rule{margin-top:13px}
.intro{margin-top:13.5px}
.intro p{font-size:18px;line-height:28px;font-weight:300;letter-spacing:-.03em;color:var(--text)}
.intro p+p{margin-top:10px}
.sec-head{display:flex;align-items:baseline;gap:18px;margin-top:33px}
.sec-head h3{font-size:22px;line-height:30px;font-weight:700;letter-spacing:-.02em;color:var(--ink)}
.sec-head .total{font-size:20px;font-weight:600;letter-spacing:-.02em;color:var(--light)}
.sec-head+.rule{margin-top:17px}
.jobs{padding-top:11px}
.job{display:flex;align-items:flex-start}
.job+.job{margin-top:15px}
.job .logo{margin-top:9px}
.job-meta{margin-left:24px;width:325px;padding-top:2px}
.co{font-size:20px;line-height:31px;font-weight:600;letter-spacing:-.02em;color:var(--text)}
.role{font-size:17px;line-height:27px;letter-spacing:-.02em;color:var(--text)}
.period{font-size:17px;line-height:27px;letter-spacing:-.02em;color:var(--muted)}
.job-hl{flex:1}
.job-hl li{font-size:18px;line-height:33px;color:var(--text)}
.edu-head{margin-top:22px}
.edu{padding-top:10.5px}
.edu-row{display:flex;align-items:center;height:39px}
.edu-row .d{width:415px;font-size:17px;letter-spacing:-.02em;color:var(--muted)}
.edu-row .t{font-size:18px;font-weight:500;letter-spacing:-.02em;color:var(--text)}

/* page header (02~) */
.page-head{padding-top:47.5px}
.page-head h2{font-size:22px;line-height:30px;font-weight:700;letter-spacing:-.02em;color:var(--ink)}
.page-head+.rule{margin-top:16.5px}

/* 02 strengths */
.strength{padding-top:25.5px}
.st-hair{margin-top:45px}
.st-hair+.strength{padding-top:41px}
.st-title{font-size:22px;line-height:30px;font-weight:600;letter-spacing:-.02em;color:var(--ink)}
.st-body{margin-top:16px}
.st-body p{font-size:18px;line-height:29px;font-weight:300;letter-spacing:-.02em;color:var(--text)}
.st-body p+p{margin-top:10px}

/* 03 career detail */
.cd-block{display:flex;padding:26px 0 32px}
.hair+.cd-block{padding-top:31px}
.cd-left{width:290px;flex:none}
.cd-co{font-size:22px;line-height:30px;font-weight:600;letter-spacing:-.02em;color:var(--ink)}
.cd-period{margin-top:8.5px;font-size:18px;line-height:26px;letter-spacing:-.02em;color:var(--gray)}
.cd-right{width:500px}
.cd-item{padding:12px 0}
.cd-item:first-child{padding-top:0}
.cd-item:last-child{padding-bottom:0}
.cd-title{font-size:20px;line-height:28px;font-weight:600;letter-spacing:-.02em;color:var(--ink)}
.cd-desc{margin-top:3.5px;font-size:16px;line-height:24px;letter-spacing:-.02em;color:var(--sub)}

/* 04~ projects */
.pj-title{margin-top:36px;font-size:22px;line-height:30px;font-weight:600;letter-spacing:-.02em;color:var(--ink)}
.org{display:flex;align-items:center;gap:10px;margin-top:41.5px}
.org-name{font-size:16px;line-height:22px;font-weight:600;letter-spacing:-.02em;color:var(--ink)}
.org-period{font-size:14px;line-height:20px;letter-spacing:-.02em;color:var(--gray)}
.pj-sec{padding:27.5px 0 30.5px}
.org+.pj-sec{padding-top:19.5px}
.pj-sec.sec-text{padding-bottom:26.5px}
.pj-sec.sec-entities{padding-bottom:27px}
.pj-sec h4{font-size:20px;line-height:28px;font-weight:700;letter-spacing:-.02em;color:var(--ink)}
.pj-text{margin-top:3px}
.pj-text p{font-size:18px;line-height:27px;font-weight:300;color:var(--body)}
.ent{margin-top:14.5px}
.pj-sec h4+.ent{margin-top:5px}
.ent-name{font-size:18px;line-height:27px;font-weight:300;color:var(--body)}
.ent-desc{margin-top:5.5px;font-size:16px;line-height:24px;font-weight:600;color:var(--body)}
.pj-list{margin-top:7px}
.pj-list li{display:flex;font-size:18px;line-height:23px;font-weight:300;color:var(--body)}
.pj-list .dot{flex:none;width:27px;padding-left:12px}

@media print{
  @page{size:960px 1356px;margin:0}
  body{background:#fff}
  .pages{padding:0;gap:0}
  .page+.page{break-before:page}
}`;

const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(data.profile.name)} 이력서</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<style>${CSS}
</style>
</head>
<body>
<main class="pages">
${cover()}
${strengths()}
${careerDetail()}
${data.projects.map(project).join('\n')}
</main>
</body>
</html>
`;
fs.writeFileSync(path.join(DIR, 'index.html'), html);
console.log('✓ index.html');
if (process.argv.includes('--html-only')) process.exit(0);

// ---------- SVG / PNG / PDF ----------
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { console.error('playwright 가 필요합니다: npm i playwright && npx playwright install chromium'); process.exit(1); }

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1100, height: 1500 }, deviceScaleFactor: 2 });
await page.route(/^https?:/, r => r.abort()); // 로컬 설치된 Pretendard 로 렌더링
await page.goto(pathToFileURL(path.join(DIR, 'index.html')).href);
await page.evaluate(() => document.fonts.ready);
const fontOk = await page.evaluate(() => document.fonts.check('16px Pretendard'));
if (!fontOk) console.warn('! Pretendard 폰트가 설치되어 있지 않아 대체 폰트로 측정됩니다.');

// 페이지 DOM → 도형/텍스트 좌표 추출
const pages = await page.$$eval('.page', els => els.map(pageEl => {
  const P = pageEl.getBoundingClientRect();
  // 텍스트 박스 상단 → baseline 비율 (inline-block 트릭으로 실측)
  const probe = document.createElement('span');
  probe.style.cssText = 'position:absolute;left:0;top:0;font-size:100px;line-height:normal;white-space:nowrap';
  probe.innerHTML = '가Ag<i style="display:inline-block;position:static;width:0;height:0"></i>';
  document.body.appendChild(probe);
  const pr = document.createRange(); pr.selectNodeContents(probe.firstChild);
  const prr = pr.getClientRects()[0];
  const ascRatio = (probe.querySelector('i').getBoundingClientRect().bottom - prr.top) / prr.height;
  probe.remove();

  const items = [];
  const col = c => {
    const m = c && c.match(/rgba?\(([^)]+)\)/); if (!m) return null;
    const v = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    const a = v.length > 3 ? v[3] : 1; if (a === 0) return null;
    return { hex: '#' + v.slice(0, 3).map(x => Math.round(x).toString(16).padStart(2, '0')).join('').toUpperCase(), a };
  };
  const rad = (v, w) => { const f = (v || '0').split(' ')[0]; return f.endsWith('%') ? parseFloat(f) / 100 * w : parseFloat(f) || 0; };
  const blockOf = el => { while (el && getComputedStyle(el).display.startsWith('inline')) el = el.parentElement; return el; };
  const blockIds = new Map(); let nextBlock = 0;
  const bid = el => { const b = blockOf(el); if (!blockIds.has(b)) blockIds.set(b, nextBlock++); return blockIds.get(b); };

  const textNode = (node, el) => {
    const t = node.textContent; if (!t.trim()) return;
    const cs = getComputedStyle(el);
    const c = col(cs.color);
    const style = {
      size: parseFloat(cs.fontSize), weight: cs.fontWeight, fill: c ? c.hex : '#000000',
      ls: cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing),
    };
    const block = bid(el);
    const r = document.createRange();
    let cur = null;
    for (let i = 0; i < t.length; i++) {
      const ch = t[i];
      r.setStart(node, i); r.setEnd(node, i + 1);
      const rc = r.getClientRects()[0];
      if (!rc || (rc.width === 0 && /\s/.test(ch))) continue;
      const newLine = !cur || Math.abs(rc.top - cur.top) > rc.height * 0.5;
      if (newLine) {
        if (/\s/.test(ch)) continue;
        cur = { top: rc.top, x: rc.left - P.left, y: rc.top - P.top + rc.height * ascRatio, text: '' };
        const last = items[items.length - 1];
        if (last && last.kind === 'text' && last.block === block && Math.abs(last.y - cur.y) < 1) last.runs.push({ ...style, x: cur.x, text: '' });
        else items.push({ kind: 'text', block, y: cur.y, runs: [{ ...style, x: cur.x, text: '' }] });
      }
      if (/\s/.test(ch) && /\s$/.test(cur.text)) continue;
      cur.text += /\s/.test(ch) ? ' ' : ch;
      items[items.length - 1].runs.at(-1).text = cur.text;
    }
  };

  const walk = el => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    const layer = el.dataset.layer;
    if (layer && el !== pageEl) items.push({ kind: 'open', name: layer });
    const b = el.getBoundingClientRect();
    const x = b.left - P.left, y = b.top - P.top, w = b.width, h = b.height;
    const bg = col(cs.backgroundColor);
    const radii = [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius].map(v => rad(v, w));
    if (bg && el !== pageEl && w > 0 && h > 0) items.push({ kind: 'rect', x, y, w, h, fill: bg.hex, op: bg.a, radii });
    const bw = parseFloat(cs.borderTopWidth) || 0, bc = col(cs.borderTopColor);
    if (bw > 0 && bc && cs.borderTopStyle !== 'none' && cs.borderTopWidth === cs.borderBottomWidth && cs.borderLeftWidth === cs.borderTopWidth)
      items.push({ kind: 'stroke', x: x + bw / 2, y: y + bw / 2, w: w - bw, h: h - bw, stroke: bc.hex, sw: bw, radii: radii.map(v => Math.max(0, v - bw / 2)) });
    for (const n of el.childNodes) {
      if (n.nodeType === 3) textNode(n, el);
      else if (n.nodeType === 1) walk(n);
    }
    if (layer && el !== pageEl) items.push({ kind: 'close' });
  };
  walk(pageEl);
  return { name: pageEl.dataset.layer, w: P.width, h: P.height, items };
}));

const n = v => +v.toFixed(2);
const x = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const rr = (X, Y, W, H, [a, b, c, d]) =>
  `M${n(X + a)} ${n(Y)}H${n(X + W - b)}${b ? `A${n(b)} ${n(b)} 0 0 1 ${n(X + W)} ${n(Y + b)}` : ''}V${n(Y + H - c)}${c ? `A${n(c)} ${n(c)} 0 0 1 ${n(X + W - c)} ${n(Y + H)}` : ''}H${n(X + d)}${d ? `A${n(d)} ${n(d)} 0 0 1 ${n(X)} ${n(Y + H - d)}` : ''}V${n(Y + a)}${a ? `A${n(a)} ${n(a)} 0 0 1 ${n(X + a)} ${n(Y)}` : ''}Z`;
const shape = (it, paint) => {
  const { x: X, y: Y, w: W, h: H, radii } = it;
  if (radii.every(v => v === 0)) return `<rect x="${n(X)}" y="${n(Y)}" width="${n(W)}" height="${n(H)}" ${paint}/>`;
  if (Math.abs(W - H) < 0.5 && radii.every(v => v >= W / 2 - 0.5)) return `<circle cx="${n(X + W / 2)}" cy="${n(Y + H / 2)}" r="${n(W / 2)}" ${paint}/>`;
  if (radii.every(v => v === radii[0])) return `<rect x="${n(X)}" y="${n(Y)}" width="${n(W)}" height="${n(H)}" rx="${n(Math.min(radii[0], W / 2, H / 2))}" ${paint}/>`;
  return `<path d="${rr(X, Y, W, H, radii.map(v => Math.min(v, W / 2, H / 2)))}" ${paint}/>`;
};

fs.mkdirSync(path.join(DIR, 'svg'), { recursive: true });
fs.mkdirSync(path.join(DIR, 'png'), { recursive: true });
pages.forEach((pg, i) => {
  const used = new Map();
  const uid = s => { const k = s.replace(/\s+/g, '_'); const c = (used.get(k) || 0) + 1; used.set(k, c); return c > 1 ? `${k}_${c}` : k; };
  const out = [`<svg xmlns="http://www.w3.org/2000/svg" width="${n(pg.w)}" height="${n(pg.h)}" viewBox="0 0 ${n(pg.w)} ${n(pg.h)}" font-family="Pretendard, 'Noto Sans KR', sans-serif">`,
    `<rect id="background" width="${n(pg.w)}" height="${n(pg.h)}" fill="#FFFFFF"/>`];
  let depth = 1;
  const pad = () => '  '.repeat(depth);
  for (const it of pg.items) {
    if (it.kind === 'open') { out.push(`${pad()}<g id="${x(uid(it.name))}">`); depth++; }
    else if (it.kind === 'close') { depth--; out.push(`${pad()}</g>`); }
    else if (it.kind === 'rect') out.push(pad() + shape(it, `fill="${it.fill}"${it.op < 1 ? ` fill-opacity="${n(it.op)}"` : ''}`));
    else if (it.kind === 'stroke') out.push(pad() + shape(it, `fill="none" stroke="${it.stroke}" stroke-width="${n(it.sw)}"`));
    else if (it.kind === 'text') {
      const runs = it.runs.filter(r => r.text.trim()).map((r, k, a) => ({ ...r, text: k === a.length - 1 ? r.text.replace(/\s+$/, '') : r.text }));
      if (!runs.length) continue;
      const attrs = r => `font-size="${n(r.size)}" font-weight="${r.weight}" fill="${r.fill}"${r.ls ? ` letter-spacing="${n(r.ls)}"` : ''}`;
      const label = runs.map(r => r.text).join('').trim().slice(0, 40);
      if (runs.length === 1) out.push(`${pad()}<text id="${x(uid(label))}" xml:space="preserve" x="${n(runs[0].x)}" y="${n(it.y)}" ${attrs(runs[0])}>${x(runs[0].text)}</text>`);
      else out.push(`${pad()}<text id="${x(uid(label))}" xml:space="preserve" y="${n(it.y)}">${runs.map(r => `<tspan x="${n(r.x)}" ${attrs(r)}>${x(r.text)}</tspan>`).join('')}</text>`);
    }
  }
  out.push('</svg>\n');
  const file = `page-${String(i + 1).padStart(2, '0')}.svg`;
  fs.writeFileSync(path.join(DIR, 'svg', file), out.join('\n'));
});
console.log(`✓ svg/ (${pages.length} pages)`);

const els = await page.$$('.page');
for (let i = 0; i < els.length; i++) await els[i].screenshot({ path: path.join(DIR, 'png', `page-${String(i + 1).padStart(2, '0')}.png`) });
console.log('✓ png/');
await page.pdf({ path: path.join(DIR, 'resume.pdf'), width: '960px', height: '1356px', printBackground: true });
console.log('✓ resume.pdf');
await browser.close();
