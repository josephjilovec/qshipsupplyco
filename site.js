const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
navToggle?.addEventListener("click", () => {
  const open = navToggle.getAttribute("aria-expanded") !== "true";
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.textContent = open ? "Close" : "Menu";
  navLinks.dataset.open = String(open);
});
navLinks?.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    navLinks.dataset.open = "false";
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.textContent = "Menu";
  }),
);
const form = document.querySelector("[data-inquiry]");
function connectBrief(title, collect) {
  if (!form) return;
  form
    .querySelectorAll('[type="submit"]')
    .forEach((button) => (button.disabled = false));
  const result = document.getElementById("brief-result"),
    area = document.getElementById("brief-text"),
    email = document.getElementById("email-brief"),
    status = document.getElementById("copy-status");
  const update = () => {
    email.href =
      "mailto:josephjilovec@pm.me?subject=" +
      encodeURIComponent(title) +
      "&body=" +
      encodeURIComponent(area.value);
  };
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    area.value =
      title +
      "\n\n" +
      collect(new FormData(form)) +
      "\n\nI understand this service is in development. Please let me know whether a suitable pilot is available and agree the scope before any engagement.";
    update();
    result.hidden = false;
    document.getElementById("brief-heading").focus();
    status.textContent =
      "Draft created in this browser. Nothing has been sent.";
  });
  area.addEventListener("input", update);
  document.getElementById("copy-brief").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(area.value);
      status.textContent =
        "Copied. Paste the draft into your preferred email app.";
    } catch {
      area.focus();
      area.select();
      status.textContent =
        "Select and copy the draft above using your device’s copy command.";
    }
  });
  form.addEventListener("input", (e) => {
    if (e.target.closest("#brief-result")) return;
    result.hidden = true;
    status.textContent = "";
  });
}
function observeChapters(selector, onChange) {
  if (!("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver(
    (entries) => {
      const active = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (active) onChange(active.target.dataset.chapter);
    },
    { rootMargin: "-18% 0px -36% 0px", threshold: [0, 0.25, 0.5] },
  );
  document.querySelectorAll(selector).forEach((e) => observer.observe(e));
}
const stageData = {
  request: {
    status: "Ready to clarify",
    html: '<div class="record-line"><span>Specification</span><strong>Existing carton specification — verify before quote</strong></div><div class="record-line"><span>Required date</span><strong>To be agreed with the client</strong></div><div class="record-line"><span>Next action</span><strong>Confirm size, grade and quantity with Operations</strong></div><div class="owner-note"><b>OWNER / OPERATIONS</b><p>A clear request comes before a supplier commitment.</p></div>',
  },
  quotes: {
    status: "Compare full scope",
    html: '<div class="quote-grid"><div class="quote-card"><small>FICTIONAL SUPPLIER A</small><h3>$768</h3><p>1,000 × $0.72 = $720<br>Delivery estimate: $48</p><p>Lead time: unconfirmed</p></div><div class="quote-card"><small>FICTIONAL SUPPLIER B</small><h3>$776</h3><p>1,000 × $0.68 = $680<br>Delivery estimate: $96</p><p>Lead time: unconfirmed</p></div></div><p class="board-caution">Illustrative USD estimates before tax. Supplier B has the lower unit price; Supplier A has the lower estimated total. Specifications, tax, delivery and timing still need confirmation.</p><div class="owner-note"><b>NEXT / COORDINATOR</b><p>Return a comparable scope to the client. Do not choose on unit price alone.</p></div>',
  },
  approval: {
    status: "Client decision required",
    html: '<div class="record-line"><span>Commercial authority</span><strong>The client chooses and approves the supplier.</strong></div><div class="record-line"><span>Payment</span><strong>Client pays the supplier directly.</strong></div><div class="record-line"><span>Coordination record</span><strong>Record the approved scope, date and named decision maker.</strong></div><div class="owner-note"><b>HUMAN CHECKPOINT</b><p>This demonstration does not approve an order or create a purchase commitment.</p></div>',
  },
  receipt: {
    status: "Exception remains open",
    html: '<div class="quantity-banner">980 / 1,000<small>UNITS RECEIVED / UNITS ORDERED — FICTIONAL EXAMPLE</small></div><div class="exception"><h3>20 cartons short</h3><p>Receiving records the quantity. The coordinator asks the supplier to confirm the shortfall and a proposed resolution. The client accepts or queries that proposal.</p></div><div class="record-line"><span>Next owners</span><strong>Receiving → Supplier → Client approval of resolution</strong></div><p class="board-caution">No automatic closeout. The issue stays visible until the agreed resolution is recorded.</p>',
  },
};
function setStage(id) {
  const item = stageData[id];
  if (!item) return;
  document.getElementById("order-status").textContent = item.status;
  document.getElementById("board-content").innerHTML = item.html;
  document
    .querySelectorAll("[data-stage]")
    .forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.stage === id)),
    );
}
let manualStage = false;
document.querySelectorAll("[data-stage]").forEach((b) =>
  b.addEventListener("click", () => {
    manualStage = true;
    setStage(b.dataset.stage);
  }),
);
observeChapters(".purchase-chapter", (id) => {
  if (!manualStage) setStage(id);
});
window.addEventListener(
  "wheel",
  () => {
    manualStage = false;
  },
  { passive: true },
);
window.addEventListener(
  "touchmove",
  () => {
    manualStage = false;
  },
  { passive: true },
);
window.addEventListener("keydown", (e) => {
  if (
    ["PageDown", "PageUp", "ArrowDown", "ArrowUp", "Home", "End"].includes(
      e.key,
    ) &&
    !e.target.matches("input,textarea,select")
  )
    manualStage = false;
});
connectBrief(
  "QShip Supply Co. — coordination pilot interest",
  (d) =>
    "Recurring category: " +
    d.get("category") +
    "\nHandoff to improve: " +
    d.get("handoff") +
    "\nOrdering rhythm: " +
    d.get("rhythm") +
    "\nApproving role: " +
    (d.get("authority") || "To be defined") +
    "\nRecurring complication: " +
    (d.get("context") || "To discuss"),
);
