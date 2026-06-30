const STORAGE_KEY = 'budget-flow-state-v1';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const initialState = {
  activeAccountIndex: 0,
  transferMode: 'send',
  transferAmount: '218.00',
  transferName: 'Rita Davis',
  recipientNumber: '**** 9303',
  accounts: [
    {
      id: 'emma',
      name: 'Emma Smith',
      balance: 14500,
      masked: '**** 3098',
      accent: 'linear-gradient(145deg, #a2f5a8 0%, #87e5fb 40%, #b7a2ff 100%)',
      avatar: 'E',
      transactions: [
        { title: 'Airbnb', meta: 'Today, 9:00 AM', amount: -167, tag: '+10', icon: 'A', type: 'expense', category: 'Travel' },
        { title: 'Apple', meta: 'Today, 7:00 AM', amount: -19.99, tag: '+8', icon: '', type: 'expense', category: 'Shopping' },
        { title: 'Netflix', meta: 'Yesterday, 9:00 PM', amount: -29.99, tag: '+2', icon: 'N', type: 'expense', category: 'Entertainment' },
        { title: 'Salary', meta: 'Yesterday, 11:14 AM', amount: 4200, tag: '+1', icon: '↥', type: 'income', category: 'Income' },
        { title: 'Transfer from Sam', meta: 'Mon, 4:20 PM', amount: 860, tag: '+3', icon: '↻', type: 'income', category: 'Income' },
      ],
    },
    {
      id: 'travel',
      name: 'Travel Reserve',
      balance: 6240,
      masked: '**** 9021',
      accent: 'linear-gradient(145deg, #ffd77f 0%, #ff9b9b 48%, #f5e76d 100%)',
      avatar: 'T',
      transactions: [
        { title: 'Hotel', meta: 'Today, 11:40 AM', amount: -240, tag: '+4', icon: 'H', type: 'expense', category: 'Travel' },
        { title: 'Taxi', meta: 'Today, 8:10 AM', amount: -38, tag: '+2', icon: '↘', type: 'expense', category: 'Transport' },
        { title: 'Refund', meta: 'Tue, 2:18 PM', amount: 120, tag: '+1', icon: '↥', type: 'income', category: 'Income' },
        { title: 'Food market', meta: 'Tue, 9:05 AM', amount: -66, tag: '+4', icon: 'F', type: 'expense', category: 'Food' },
      ],
    },
  ],
  categories: [
    { name: 'Food', color: '#8ff58f' },
    { name: 'Health & Fitness', color: '#8fe8ff' },
    { name: 'Transport', color: '#ffffff' },
    { name: 'Shopping', color: '#7f7cf6' },
    { name: 'Education', color: '#f4f45a' },
    { name: 'Other', color: '#ff95d1' },
  ],
  weeklyFlow: [
    { label: 'Mon', value: 64 },
    { label: 'Tue', value: 48 },
    { label: 'Wed', value: 86 },
    { label: 'Thu', value: 52 },
    { label: 'Fri', value: 94 },
    { label: 'Sat', value: 72 },
    { label: 'Sun', value: 38 },
  ],
};

let state = loadState();

const els = {
  activeAvatar: document.getElementById('activeAvatar'),
  activeName: document.getElementById('activeName'),
  activeBalance: document.getElementById('activeBalance'),
  activeCardName: document.getElementById('activeCardName'),
  activeCardNumber: document.getElementById('activeCardNumber'),
  accountTrack: document.getElementById('accountTrack'),
  accountDots: document.getElementById('accountDots'),
  transactionList: document.getElementById('transactionList'),
  amountValue: document.getElementById('amountValue'),
  recipientName: document.getElementById('recipientName'),
  recipientNumber: document.getElementById('recipientNumber'),
  confirmTransfer: document.getElementById('confirmTransfer'),
  modeButtons: Array.from(document.querySelectorAll('.mode-button')),
  donutChart: document.getElementById('donutChart'),
  expenseTotal: document.getElementById('expenseTotal'),
  categoryLegend: document.getElementById('categoryLegend'),
  expenseList: document.getElementById('expenseList'),
  flowBars: document.getElementById('flowBars'),
  exportReport: document.getElementById('exportReport'),
  openTransferButtons: Array.from(document.querySelectorAll('[data-open-transfer]')),
  scrollTargets: Array.from(document.querySelectorAll('[data-scroll-to]')),
  keypad: Array.from(document.querySelectorAll('.keypad .key')),
  accountCarousel: document.querySelector('.carousel-track'),
};

function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return structuredClone(initialState);
    }

    const parsed = JSON.parse(stored);
    return {
      ...structuredClone(initialState),
      ...parsed,
      accounts: parsed.accounts?.length ? parsed.accounts : structuredClone(initialState.accounts),
      categories: initialState.categories,
      weeklyFlow: parsed.weeklyFlow?.length ? parsed.weeklyFlow : structuredClone(initialState.weeklyFlow),
    };
  } catch {
    return structuredClone(initialState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function formatAmount(amount) {
  return currency.format(amount);
}

function formatBalance(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatTransaction(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function activeAccount() {
  return state.accounts[state.activeAccountIndex];
}

function transactionsForActive() {
  return activeAccount().transactions;
}

function updateTopSummary() {
  const account = activeAccount();
  els.activeAvatar.textContent = account.avatar;
  els.activeName.textContent = account.name;
  els.activeBalance.textContent = formatBalance(account.balance);
  els.activeCardName.textContent = account.name;
  els.activeCardNumber.textContent = account.masked;
}

function renderAccounts() {
  els.accountTrack.innerHTML = state.accounts.map((account, index) => `
    <button class="account-card ${index === state.activeAccountIndex ? 'is-active' : ''}" type="button" data-account-index="${index}">
      <div class="account-card-top">
        <div class="account-copy">
          <strong>${account.name}</strong>
          <small>${account.masked}</small>
        </div>
        <span class="avatar" style="background:${account.accent}; color:#111;">${account.avatar}</span>
      </div>
      <div class="account-balance">${formatAmount(account.balance).replace('.00', '')}</div>
    </button>
  `).join('');

  els.accountDots.innerHTML = state.accounts.map((_, index) => `
    <button type="button" aria-label="Switch to account ${index + 1}" class="${index === state.activeAccountIndex ? 'is-active' : ''}" data-account-dot="${index}"></button>
  `).join('');

  Array.from(els.accountTrack.querySelectorAll('[data-account-index]')).forEach((button) => {
    button.addEventListener('click', () => {
      setActiveAccount(Number(button.dataset.accountIndex));
    });
  });

  Array.from(els.accountDots.querySelectorAll('[data-account-dot]')).forEach((dot) => {
    dot.addEventListener('click', () => {
      setActiveAccount(Number(dot.dataset.accountDot));
    });
  });
}

function renderTransactions() {
  const rows = transactionsForActive().slice(0, 6).map((item) => `
    <div class="transaction-row">
      <div class="transaction-row-left">
        <div class="transaction-icon">${item.icon}</div>
        <div class="transaction-copy">
          <span class="transaction-title">${item.title}</span>
          <span class="transaction-meta">${item.meta}</span>
        </div>
      </div>
      <div class="transaction-row-right">
        <span class="badge ${item.type === 'income' ? 'positive' : 'negative'}">${item.tag}</span>
        <span class="transaction-amount">${item.amount < 0 ? '-' : '+'}${formatTransaction(Math.abs(item.amount)).replace('$', '$')}</span>
      </div>
    </div>
  `).join('');

  els.transactionList.innerHTML = rows;
}

function renderTransfer() {
  els.modeButtons.forEach((button) => {
    button.classList.toggle('is-active', button.dataset.mode === state.transferMode);
  });
  els.amountValue.textContent = state.transferAmount;
  els.recipientName.textContent = state.transferName;
  els.recipientNumber.textContent = state.recipientNumber;

  els.confirmTransfer.textContent = state.transferMode === 'send' ? 'Send money' : 'Receive money';
}

function renderLegend() {
  els.categoryLegend.innerHTML = state.categories.map((category) => `
    <span class="legend-item"><span class="legend-dot" style="background:${category.color}"></span>${category.name}</span>
  `).join('');
}

function renderAnalytics() {
  const expenseTransactions = state.accounts.flatMap((account) => account.transactions.filter((item) => item.amount < 0));
  const total = 581.46;
  els.expenseTotal.textContent = formatTransaction(total);

  const breakdown = aggregateByCategory(expenseTransactions);
  const segments = breakdown.map((item) => `${item.color} ${item.percent}%`).join(', ');
  els.donutChart.style.background = segments ? `conic-gradient(${segments})` : 'conic-gradient(#8fe8ff 0 100%)';

  const recentExpenses = [
    { title: 'Food', category: 'Ingredients for pasta and snacks', amount: 67, icon: 'F' },
    { title: 'Health & Fitness', category: 'Renewed my gym membership', amount: 78, icon: 'H' },
    { title: 'Shopping', category: 'Running shoes and cap', amount: 41, icon: 'S' },
    { title: 'Transport', category: 'Commute and rides', amount: 26, icon: 'T' },
  ];

  els.expenseList.innerHTML = recentExpenses.map((item) => `
    <div class="expense-row">
      <div class="expense-row-left">
        <div class="expense-icon">${item.icon}</div>
        <div class="expense-copy">
          <span class="expense-title">${item.title}</span>
          <span class="expense-meta">${item.category}</span>
        </div>
      </div>
      <span class="expense-amount">-${formatTransaction(Math.abs(item.amount))}</span>
    </div>
  `).join('');

  els.flowBars.innerHTML = state.weeklyFlow.map((item) => `
    <div class="flow-bar-row">
      <div style="min-width: 34px; color: rgba(246,247,251,.72); font-size: .82rem;">${item.label}</div>
      <div class="flow-bar-track"><div class="flow-bar-fill" style="width:${item.value}%"></div></div>
      <div class="flow-value">${item.value}%</div>
    </div>
  `).join('');
}

function aggregateByCategory(items) {
  const map = new Map();

  items.forEach((item) => {
    const current = map.get(item.category) || { category: item.category, value: 0 };
    current.value += Math.abs(item.amount);
    map.set(item.category, current);
  });

  const sorted = Array.from(map.values()).sort((a, b) => b.value - a.value);
  const palette = new Map(state.categories.map((item) => [item.name, item.color]));
  const total = sorted.reduce((sum, item) => sum + item.value, 0) || 1;
  let cursor = 0;

  return sorted.map((item) => {
    const percent = Math.max(1, Math.round((item.value / total) * 100));
    const segment = {
      color: `${palette.get(item.category) || '#f4f45a'} ${cursor}% ${cursor + percent}%`,
      percent,
      category: item.category,
    };
    cursor += percent;
    return segment;
  });
}

function setActiveAccount(index) {
  state.activeAccountIndex = index;
  saveState();
  syncUI();

  const card = els.accountTrack.querySelector(`[data-account-index="${index}"]`);
  if (card) {
    card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }
}

function setTransferMode(mode) {
  state.transferMode = mode;
  saveState();
  renderTransfer();
}

function applyKeypad(key) {
  if (key === 'backspace') {
    state.transferAmount = state.transferAmount.length > 1 ? state.transferAmount.slice(0, -1) : '0';
    if (state.transferAmount === '0') {
      state.transferAmount = '0.00';
    }
    saveState();
    renderTransfer();
    return;
  }

  if (key === '.') {
    if (!state.transferAmount.includes('.')) {
      state.transferAmount += '.';
    }
    saveState();
    renderTransfer();
    return;
  }

  if (!/\d/.test(key)) {
    return;
  }

  const clean = state.transferAmount === '0.00' ? '' : state.transferAmount.replace(/[^\d.]/g, '');
  const next = `${clean}${key}`;
  const formatted = formatInputAmount(next);
  state.transferAmount = formatted;
  saveState();
  renderTransfer();
}

function formatInputAmount(value) {
  const digits = value.replace(/[^\d.]/g, '');
  const [whole = '0', fraction = ''] = digits.split('.');
  const normalizedWhole = whole.replace(/^0+(?=\d)/, '') || '0';
  const normalizedFraction = fraction.slice(0, 2);
  if (value.endsWith('.')) {
    return `${normalizedWhole}.`;
  }
  if (normalizedFraction.length === 0) {
    return normalizedWhole;
  }
  if (normalizedFraction.length === 1) {
    return `${normalizedWhole}.${normalizedFraction}0`;
  }
  return `${normalizedWhole}.${normalizedFraction}`;
}

function confirmTransfer() {
  const amount = Number.parseFloat(state.transferAmount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return;
  }

  const account = activeAccount();
  const delta = state.transferMode === 'send' ? -amount : amount;
  account.balance = Math.max(0, Math.round((account.balance + delta) * 100) / 100);
  account.transactions.unshift({
    title: state.transferName,
    meta: 'Just now',
    amount: delta,
    tag: state.transferMode === 'send' ? '+1' : '+1',
    icon: state.transferMode === 'send' ? '↗' : '↓',
    type: state.transferMode === 'send' ? 'expense' : 'income',
    category: state.transferMode === 'send' ? inferCategory(state.transferName) : 'Income',
  });

  if (account.transactions.length > 10) {
    account.transactions = account.transactions.slice(0, 10);
  }

  state.transferAmount = '0.00';
  saveState();
  syncUI();
}

function inferCategory(name) {
  const lookup = [
    ['air', 'Travel'],
    ['hotel', 'Travel'],
    ['taxi', 'Transport'],
    ['uber', 'Transport'],
    ['food', 'Food'],
    ['apple', 'Shopping'],
    ['netflix', 'Entertainment'],
    ['gym', 'Health & Fitness'],
    ['school', 'Education'],
  ];

  const lower = name.toLowerCase();
  const match = lookup.find(([token]) => lower.includes(token));
  return match ? match[1] : 'Other';
}

function exportCsv() {
  const rows = ['account,category,title,amount,date'];
  state.accounts.forEach((account) => {
    account.transactions.forEach((item) => {
      rows.push([
        account.name,
        item.category,
        item.title,
        item.amount,
        item.meta,
      ].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','));
    });
  });

  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'budget-flow-report.csv';
  anchor.click();
  URL.revokeObjectURL(url);
}

function bindEvents() {
  els.modeButtons.forEach((button) => {
    button.addEventListener('click', () => setTransferMode(button.dataset.mode));
  });

  els.keypad.forEach((button) => {
    button.addEventListener('click', () => applyKeypad(button.dataset.key || button.textContent.trim()));
  });

  els.confirmTransfer.addEventListener('click', confirmTransfer);
  els.exportReport.addEventListener('click', exportCsv);

  els.openTransferButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setTransferMode(button.dataset.openTransfer);
      scrollToSection('#transfer');
    });
  });

  els.scrollTargets.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      const target = button.getAttribute('data-scroll-to');
      if (target) {
        scrollToSection(target);
      }
    });
  });

  els.accountCarousel.addEventListener('scroll', () => {
    const cards = Array.from(els.accountTrack.querySelectorAll('.account-card'));
    const positions = cards.map((card, index) => ({
      index,
      distance: Math.abs(card.getBoundingClientRect().left - els.accountCarousel.getBoundingClientRect().left),
    }));
    const nearest = positions.sort((a, b) => a.distance - b.distance)[0];
    if (nearest && nearest.index !== state.activeAccountIndex && nearest.distance < 40) {
      state.activeAccountIndex = nearest.index;
      saveState();
      syncUI(false);
    }
  }, { passive: true });
}

function scrollToSection(selector) {
  const section = document.querySelector(selector);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }
}

function syncUI(scrollAccount = true) {
  updateTopSummary();
  renderAccounts();
  renderTransactions();
  renderTransfer();
  renderLegend();
  renderAnalytics();

  if (scrollAccount) {
    const active = els.accountTrack.querySelector(`[data-account-index="${state.activeAccountIndex}"]`);
    if (active) {
      active.scrollIntoView({ behavior: 'instant', inline: 'center', block: 'nearest' });
    }
  }
}

bindEvents();
syncUI();
