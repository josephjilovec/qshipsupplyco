(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const header = $('.site-header');
  const hero = $('.hero');
  const motionButton = $('.motion-toggle');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reduced.matches;
  function applyMotion() {
    const off = paused || reduced.matches;
    document.body.dataset.motion = off ? 'off' : 'on';
    motionButton.hidden = false;
    motionButton.disabled = reduced.matches;
    motionButton.setAttribute('aria-pressed', String(off));
    motionButton.setAttribute('aria-label', reduced.matches ? 'Decorative motion disabled by your reduced-motion preference' : off ? 'Play decorative motion' : 'Pause decorative motion');
    $('.motion-icon').textContent = off ? '▷' : 'Ⅱ';
    $('.motion-label').textContent = reduced.matches ? 'Reduced' : off ? 'Off' : 'Motion';
  }
  motionButton.addEventListener('click', () => { paused = !paused; applyMotion(); });
  reduced.addEventListener?.('change', () => { paused = reduced.matches; applyMotion(); });
  applyMotion();

  const toggle = $('.nav-toggle');
  const nav = $('#navigation');
  const mobile = window.matchMedia('(max-width: 800px)');
  function closeMenu(returnFocus = false) {
    nav.dataset.open = 'false';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.querySelector('span').textContent = 'Menu';
    if (returnFocus) toggle.focus();
  }
  function setNavigation() { toggle.hidden = !mobile.matches; closeMenu(); }
  setNavigation();
  mobile.addEventListener?.('change', setNavigation);
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('span').textContent = open ? 'Close' : 'Menu';
    nav.dataset.open = String(open);
  });
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => closeMenu()));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') closeMenu(true);
  });

  let scheduled = false;
  function updateScroll() {
    scheduled = false;
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 24);
    const height = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    header.style.setProperty('--page-progress', String(Math.min(1, y / height)));
    if (!paused && !reduced.matches && y < hero.offsetHeight + window.innerHeight) {
      hero.style.setProperty('--hero-offset', `${Math.min(65, y * 0.13)}px`);
      hero.style.setProperty('--stamp-rotation', `${Math.min(30, y * 0.04)}deg`);
    }
  }
  function queueScroll() { if (!scheduled) { scheduled = true; requestAnimationFrame(updateScroll); } }
  window.addEventListener('scroll', queueScroll, { passive: true });
  window.addEventListener('resize', queueScroll, { passive: true });
  updateScroll();
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.12 });
    $$('[data-reveal]').forEach((element) => observer.observe(element));
  }

  const services = {
    supplies: { image: 'supply-details', alt: 'Illustrative concept of corrugated cartons, packing paper and a tape dispenser on a workbench', kicker: 'EVERYDAY ESSENTIALS', title: 'The things you order. Again. And again.', copy: 'Packaging, everyday consumables and other repeat purchases. A proposed pilot would bring the specification, ordering rhythm and supplier questions into one manageable scope.', tag: 'Start with one recurring category' },
    comparisons: { image: 'purchasing-desk', alt: 'AI-generated concept of colleagues checking a carton sample against paper specifications', kicker: 'COMPARABLE INFORMATION', title: 'Compare the commitment. Not just the unit price.', copy: 'Keep specifications, delivery charges, quantities and unanswered questions together. Your team gets a clearer comparison and retains the supplier decision.', tag: 'A fuller picture before approval' },
    followups: { image: 'hero', alt: 'AI-generated concept of an orderly small-business packing workspace', kicker: 'A VISIBLE NEXT ACTION', title: 'An open question should have a next owner.', copy: 'A supplier confirmation that has not arrived. A short delivery. An unresolved discrepancy. The proposed coordination record keeps the question and the next follow-up visible.', tag: 'A named owner through closeout' }
  };
  const choices = $$('.service-choice');
  function selectService(key) {
    const item = services[key];
    if (!item) return;
    choices.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.service === key)));
    const image = $('#service-image');
    image.alt = item.alt;
    image.srcset = `assets/${item.image}-768.webp 768w, assets/${item.image}.webp 1536w`;
    image.src = `assets/${item.image}.webp`;
    $('#service-kicker').textContent = item.kicker;
    $('#service-panel-title').textContent = item.title;
    $('#service-copy').textContent = item.copy;
    $('#service-tag').textContent = item.tag;
  }
  choices.forEach((button, index) => {
    button.addEventListener('click', () => selectService(button.dataset.service));
    button.addEventListener('keydown', (event) => {
      let next;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % choices.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + choices.length - 1) % choices.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = choices.length - 1;
      if (next !== undefined) { event.preventDefault(); choices[next].focus(); selectService(choices[next].dataset.service); }
    });
  });

  const node = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };
  function paragraph(text, className = '') { return node('p', className, text); }
  function quoteCard(supplier, total, calculation, delivery) {
    const card = node('article', 'example-quote');
    card.append(node('small', 'mini-label', supplier), node('h3', '', total), paragraph(calculation), paragraph(delivery), node('span', '', 'Lead time: not confirmed'));
    return card;
  }
  function selectExample(key) {
    const output = $('#sample-content');
    output.replaceChildren();
    if (key === 'quotes') {
      const cards = node('div', 'example-quotes');
      cards.append(quoteCard('FICTIONAL SUPPLIER A', '$768', '1,000 cartons × $0.72 = $720', 'Delivery estimate: $48'), quoteCard('FICTIONAL SUPPLIER B', '$776', '1,000 cartons × $0.68 = $680', 'Delivery estimate: $96'));
      output.append(cards, paragraph('Illustrative USD estimates before tax. Supplier B has the lower unit price; Supplier A has the lower estimated total. Specification, tax, delivery and timing still need confirmation.', 'example-note'), paragraph('Your business chooses the supplier, approves the commitment and pays directly. QShip’s proposed role is to keep the comparison and follow-up clear.', 'example-note'));
    } else {
      const exception = node('div', 'receipt-exception');
      exception.append(node('h3', '', '20 cartons short'), paragraph('In this fictional example, Receiving records a shortfall. The coordinator asks the supplier to confirm what happened and propose a resolution. The client reviews and accepts or queries that proposal.'));
      output.append(node('div', 'receipt-number', '980 / 1,000'), node('span', 'receipt-label', 'UNITS RECEIVED / UNITS ORDERED · FICTIONAL EXAMPLE'), exception, paragraph('The discrepancy stays open until the agreed resolution is recorded. This example does not place an order or resolve an actual claim.', 'example-note'));
    }
    $$('[data-example]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.example === key)));
  }
  const dialog = $('#example-dialog');
  const exampleButton = $('[data-open-example]');
  let exampleOpener;
  exampleButton.disabled = false;
  exampleButton.addEventListener('click', () => {
    exampleOpener = document.activeElement;
    selectExample('quotes');
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else { dialog.setAttribute('open', ''); dialog.setAttribute('role', 'dialog'); }
    $('[data-close-example]').focus();
  });
  function closeExample() {
    if (typeof dialog.close === 'function') dialog.close(); else dialog.removeAttribute('open');
    exampleOpener?.focus();
  }
  $('[data-close-example]').addEventListener('click', closeExample);
  dialog.addEventListener('close', () => exampleOpener?.focus());
  dialog.addEventListener('click', (event) => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) closeExample();
  });
  $$('[data-example]').forEach((button) => button.addEventListener('click', () => selectExample(button.dataset.example)));

  const form = $('[data-inquiry]');
  const result = $('#brief-result');
  const area = $('#brief-text');
  const email = $('#email-brief');
  const status = $('#copy-status');
  const title = 'QShip Supply Co. — coordination pilot interest';
  function updateEmail() { email.href = `mailto:josephjilovec@pm.me?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(area.value)}`; }
  form.querySelector('[type="submit"]').disabled = false;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    area.value = `${title}\n\nRecurring category: ${data.get('category')}\nHandoff to improve: ${data.get('handoff')}\nOrdering rhythm: ${data.get('rhythm')}\nApproving role: ${data.get('authority') || 'To be defined'}\nRecurring complication: ${data.get('context') || 'To discuss'}\n\nI understand this service is in development. Please let me know whether a suitable pilot is available and agree the scope before any engagement.`;
    updateEmail();
    result.hidden = false;
    $('#brief-heading').focus({ preventScroll: true });
    result.scrollIntoView({ block: 'start', behavior: paused || reduced.matches ? 'auto' : 'smooth' });
    status.textContent = 'Draft created in this browser. Nothing has been sent.';
  });
  form.addEventListener('input', (event) => { if (!event.target.closest('#brief-result')) { result.hidden = true; status.textContent = ''; } });
  area.addEventListener('input', updateEmail);
  $('#copy-brief').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(area.value); status.textContent = 'Copied. Paste the draft into your preferred email app.'; }
    catch { area.focus(); area.select(); status.textContent = 'Select and copy the draft above using your device’s copy command.'; }
  });
})();
