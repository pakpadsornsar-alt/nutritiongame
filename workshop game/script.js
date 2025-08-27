// ค่าคงที่
const TARGET = 550;
const FOODS = [
  { key: "rice",    name: "ข้าว",       kcalPerUnit: 80,  emoji: "🍚" },
  { key: "soup",    name: "ต้มจืด",     kcalPerUnit: 50,  emoji: "🍲" },
  { key: "stir",    name: "ผัดผัก",     kcalPerUnit: 80,  emoji: "🥦" },
  { key: "namprik", name: "น้ำพริก",    kcalPerUnit: 60,  emoji: "🌶️" },
  { key: "fish",    name: "ปลาทอด",     kcalPerUnit: 120, emoji: "🐟" },
  { key: "yum",     name: "ยำรวมมิตร",  kcalPerUnit: 90,  emoji: "🥗" },
];

// state
const units = Object.fromEntries(FOODS.map(f => [f.key, 0]));
const perItemTotals = Object.fromEntries(FOODS.map(f => [f.key, 0]));

// elements
const el = {
  cards: document.getElementById("cards"),
  totalKcal: document.getElementById("totalKcal"),
  adviceBox: document.getElementById("adviceBox"),
  confirmBtn: document.getElementById("confirmBtn"),
  resetBtn: document.getElementById("resetBtn"),
  progressFill: document.getElementById("progressFill"),
  targetLabel: document.getElementById("targetLabel"),
  targetText: document.getElementById("targetText"),
  scaleMid: document.getElementById("scaleMid"),
};

// init labels
el.targetLabel.textContent = TARGET;
el.targetText.textContent = TARGET;
el.scaleMid.textContent = TARGET;

// build UI
function buildCards() {
  el.cards.innerHTML = "";
  FOODS.forEach(f => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="row">
        <div class="emoji" aria-hidden="true">${f.emoji}</div>
        <span class="badge">${f.kcalPerUnit} kcal/หน่วย</span>
      </div>
      <div class="name">${f.name}</div>
      <div class="btns" role="group" aria-label="เลือกจำนวนหน่วยของ ${f.name}">
        ${[1,2,3,4].map(q => `<button class="qty" data-key="${f.key}" data-qty="${q}">${q} หน่วย</button>`).join("")}
      </div>
      <div class="stats"><span>พลังงานเมนูนี้</span><span id="item-${f.key}" class="itemKcal">0 kcal</span></div>
    `;
    el.cards.appendChild(card);
  });

  // events
  el.cards.querySelectorAll("button.qty").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.key;
      const qty = parseInt(btn.dataset.qty, 10);
      units[key] = qty;
      // toggle selected
      btn.parentElement.querySelectorAll("button.qty").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      render();
    });
  });
}

function calcTotals() {
  let total = 0;
  FOODS.forEach(f => {
    const item = (units[f.key] || 0) * f.kcalPerUnit;
    perItemTotals[f.key] = item;
    total += item;
  });
  return total;
}

function allChosen() {
  return FOODS.every(f => (units[f.key] || 0) > 0);
}

function getAdvice(total) {
  if (!allChosen())        return { text: "กรุณาเลือกปริมาณอาหารให้ครบทุกเมนู", cls: ""   };
  if (total < TARGET - 50) return { text: "พลังงานน้อยกว่าเป้าหมาย ควรเพิ่มอาหารอีกเล็กน้อย", cls: "warn" };
  if (total > TARGET + 50) return { text: "พลังงานเกินเป้าหมาย ควรลดปริมาณบางเมนู",     cls: "bad"  };
  return { text: "ยอดเยี่ยม! พลังงานใกล้เคียงกับเป้าหมาย", cls: "good" };
}

function render() {
  const total = calcTotals();

  // per item
  FOODS.forEach(f => {
    const cell = document.getElementById("item-" + f.key);
    if (cell) cell.textContent = perItemTotals[f.key] + " kcal";
  });

  // total & bar
  el.totalKcal.textContent = total;
  el.progressFill.style.width = Math.min(100, (total / 1200) * 100) + "%";

  // advice
  const adv = getAdvice(total);
  el.adviceBox.textContent = "คำแนะนำ: " + adv.text;
  el.adviceBox.className = "advice " + (adv.cls || "");

  // confirm state
  el.confirmBtn.disabled = !allChosen();
}

// actions
el.resetBtn.addEventListener("click", () => {
  Object.keys(units).forEach(k => units[k] = 0);
  document.querySelectorAll("button.qty.selected").forEach(b => b.classList.remove("selected"));
  render();
});

el.confirmBtn.addEventListener("click", () => {
  const total = calcTotals();
  const adv = getAdvice(total);
  alert(`พลังงานรวมของมื้ออาหารนี้คือ ${total} kcal (เป้าหมาย ${TARGET} kcal)\nคำแนะนำ: ${adv.text}`);
});

// init
buildCards();
render();
