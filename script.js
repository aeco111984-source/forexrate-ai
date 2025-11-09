/* === ForexRate.ai — v1 Static Logic (API-ready hooks) === */

// ---------- Clock (GMT) ----------
function updateClock() {
  const now = new Date();
  const hh = String(now.getUTCHours()).padStart(2, '0');
  const mm = String(now.getUTCMinutes()).padStart(2, '0');
  const ss = String(now.getUTCSeconds()).padStart(2, '0');
  document.getElementById('clock').textContent = `${hh}:${mm}:${ss}`;
}
setInterval(updateClock, 1000); updateClock();

// Year
document.getElementById('year').textContent = new Date().getFullYear();

// ---------- Static demo rates ----------
/**
 * Base map relative to 1 USD (rough demo values).
 * v2: replace with live fetch → normalize to USD base for converter.
 */
const baseUSD = {
  USD: 1.00,
  EUR: 0.93,
  GBP: 0.78,
  JPY: 151.0,
  CHF: 0.90,
  CAD: 1.36,
  AUD: 1.50,
  NZD: 1.67,
  XAU: 0.00045, // 1 USD = 0.00045 oz of gold (~$2220/oz)
  XAG: 0.038,   // 1 USD = 0.038 oz of silver (~$26/oz)
  BTC: 0.000017 // placeholder
};

// Symbol metadata (display name)
const symbols = [
  { sym: 'EURUSD', name: 'Euro / US Dollar', type: 'FX' },
  { sym: 'GBPUSD', name: 'British Pound / US Dollar', type: 'FX' },
  { sym: 'USDJPY', name: 'US Dollar / Japanese Yen', type: 'FX' },
  { sym: 'USDCHF', name: 'US Dollar / Swiss Franc', type: 'FX' },
  { sym: 'USDCAD', name: 'US Dollar / Canadian Dollar', type: 'FX' },
  { sym: 'AUDUSD', name: 'Australian Dollar / US Dollar', type: 'FX' },
  { sym: 'XAUUSD', name: 'Gold / US Dollar', type: 'Metal' },
  { sym: 'XAGUSD', name: 'Silver / US Dollar', type: 'Metal' },
  { sym: 'BTCUSD', name: 'Bitcoin / US Dollar', type: 'Crypto' }
];

// Generate a pseudo price from base map (demo only)
function priceFromBase(sym) {
  const a = sym.slice(0,3), b = sym.slice(3);
  const pa = baseUSD[a]; const pb = baseUSD[b];
  if (!pa || !pb) return null;
  return (pb / pa);
}

// Memory of last prices to compute change
const last = {};

// ---------- Prices grid render ----------
const pricesGrid = document.getElementById('pricesGrid');

function fmt(n, dp=5){
  return Number(n).toFixed(dp);
}

function renderCard(item){
  const p = priceFromBase(item.sym);
  if (!p) return '';
  const prev = last[item.sym] ?? p;
  const diff = p - prev;
  const chClass = diff >= 0 ? 'up' : 'down';
  const displayDp = /JPY$/.test(item.sym) ? 3 : (/XAU|XAG|BTC/.test(item.sym) ? 2 : 5);
  const priceStr = fmt(p, displayDp);

  last[item.sym] = p;

  return `
    <div class="card" data-sym="${item.sym}">
      <div class="row">
        <div>
          <div class="sym">${item.sym}</div>
          <div class="name">${item.name}</div>
        </div>
        <div class="tag">${item.type}</div>
      </div>
      <div class="row">
        <div class="price">${priceStr}</div>
        <div class="change ${chClass}">${diff >= 0 ? '▲' : '▼'} ${Math.abs(diff).toFixed( displayDp > 3 ? 4 : 3 )}</div>
      </div>
      <div class="spark">mini chart (v2)</div>
    </div>
  `;
}

function renderGrid(){
  pricesGrid.innerHTML = symbols.map(renderCard).join('');
}
renderGrid();

// Hero snapshot (top 5)
const snapshotList = document.getElementById('snapshotList');
function renderSnapshot(){
  const top = ['EURUSD','GBPUSD','USDJPY','XAUUSD','BTCUSD'];
  snapshotList.innerHTML = top.map(sym => {
    const it = symbols.find(s => s.sym === sym);
    const p = priceFromBase(sym);
    const dp = /JPY$/.test(sym) ? 3 : (/XAU|XAG|BTC/.test(sym) ? 2 : 5);
    return `<li><span>${sym}</span><b>${fmt(p, dp)}</b></li>`;
  }).join('');
}
renderSnapshot();

// Simulate tick (random tiny move)
document.getElementById('simulateTick').addEventListener('click', () => {
  const keys = Object.keys(baseUSD);
  for (let k of keys){
    if (['XAU','XAG','BTC'].includes(k)) continue;
    const bump = (Math.random() - 0.5) * 0.002; // ±0.2%
    baseUSD[k] *= (1 + bump);
  }
  renderGrid(); renderSnapshot();
});

// ---------- Search ----------
const pairSearch = document.getElementById('pairSearch');
document.getElementById('btnSearch').addEventListener('click', () => {
  const q = pairSearch.value.trim().toUpperCase();
  if (!q){ renderGrid(); return; }
  pricesGrid.innerHTML = symbols
    .filter(s => s.sym.includes(q) || s.name.toUpperCase().includes(q))
    .map(renderCard).join('');
});

// ---------- Converter ----------
const fromCur = document.getElementById('fromCur');
const toCur = document.getElementById('toCur');
const convResult = document.getElementById('convResult');

const currencyList = ['USD','EUR','GBP','JPY','CHF','CAD','AUD','NZD','XAU','XAG','BTC'];
function populateSelects(){
  const opts = currencyList.map(c => `<option value="${c}">${c}</option>`).join('');
  fromCur.innerHTML = opts;
  toCur.innerHTML = opts;
  fromCur.value = 'EUR';
  toCur.value = 'USD';
}
populateSelects();

document.getElementById('btnConvert').addEventListener('click', () => {
  const amount = parseFloat(document.getElementById('amount').value || '0');
  const from = fromCur.value;
  const to = toCur.value;
  if (!baseUSD[from] || !baseUSD[to]) {
    convResult.textContent = 'Unsupported currency.';
    return;
    }
  const inUSD = amount / baseUSD[from];
  const out = inUSD * baseUSD[to];
  const dp = (to === 'JPY') ? 2 : (['XAU','XAG','BTC'].includes(to) ? 6 : 4);
  convResult.textContent = `${amount} ${from} ≈ ${out.toFixed(dp)} ${to}`;
});

// ---------- Tabs ----------
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.tab-panel');
tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    tabs.forEach(b => b.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.getAttribute('aria-controls')).classList.add('active');
  });
});

/* ===== API-ready hooks for v2 =====
   async function fetchLive() {
     const res = await fetch('https://api.yourfeed.com/latest?base=USD&apikey=YOUR_KEY');
     const data = await res.json();
     Object.assign(baseUSD, data.rates);
     renderGrid(); renderSnapshot();
   }
   setInterval(fetchLive, 10000);
   fetchLive();
*/