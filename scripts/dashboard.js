document.addEventListener('DOMContentLoaded', async () => {
  const session = await window.moneytourSessionReady;
  if (!session) return;
  const userId = String(session.userId);
  // console.log("Logged in userId: ", userId);
  const myUsername = session.username;
  const usernameSpan = document.getElementById("username");
  let formattedUsername = '';
  if (myUsername) {
    formattedUsername = myUsername.charAt(0).toUpperCase() + myUsername.slice(1).toLowerCase();
    document.getElementById("username").textContent = formattedUsername;
    document.getElementById("profileMark").textContent = formattedUsername.slice(0, 2).toUpperCase();
    const updateGreeting = () => {
      document.getElementById("greeting").textContent =
        `Good ${window.moneytourTimeOfDay()}, ${formattedUsername}`;
    };
    updateGreeting();
    window.setInterval(updateGreeting, 60_000);
  }

  const howtoButton = document.getElementById("howtoToggle");
  const howtoCard = document.querySelector(".howto-card");
  const howtoMedia = window.matchMedia("(max-width: 900px)");
  const updateHowtoDisclosure = () => {
    if (howtoMedia.matches) {
      howtoCard.classList.remove("is-open");
      howtoButton.setAttribute("aria-expanded", "false");
    } else {
      howtoCard.classList.remove("is-open");
      howtoButton.setAttribute("aria-expanded", "true");
    }
  };
  updateHowtoDisclosure();
  howtoMedia.addEventListener("change", updateHowtoDisclosure);
  howtoButton.addEventListener("click", () => {
    if (!howtoMedia.matches) return;
    const isOpen = howtoCard.classList.toggle("is-open");
    howtoButton.setAttribute("aria-expanded", String(isOpen));
  });

  const transactionForm = document.getElementById('transactionForm');
  const transactionList = document.getElementById('transactionList');
  const balanceDisplay = document.getElementById('balance');
  const incomeDisplay = document.getElementById('income');
  const expenseDisplay = document.getElementById('expense');
  const overviewCard = document.querySelector(".dashboard-card");

  const currency = '₦';

  function formatCurrency(amount) {
    return `${currency}${window.moneytourFormatAmount(amount)}`;
  }

  // Fetch and display balance
  async function fetchBalance() {
    try {
      const response = await fetch(window.moneytourApiUrl(`/api/balance/${userId}`), {
        credentials: "include",
        headers: window.moneytourAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch balance");

      const result = await response.json();

      const totalIncome = Number(result.totalIncome || 0);
      const totalExpense = Number(result.totalExpense || 0);
      const balance = Number(result.balance || 0);

      balanceDisplay.textContent = formatCurrency(balance);
      incomeDisplay.textContent = formatCurrency(totalIncome);
      expenseDisplay.textContent = formatCurrency(totalExpense);
      const largestAmount = Math.max(Math.abs(balance), totalIncome, totalExpense);
      const amountDigits = Math.max(1, Math.floor(largestAmount).toString().length);
      const cardWidth = Math.min(560, 500 + (amountDigits - 1) * 8);
      overviewCard.style.width = `min(${cardWidth}px, 100%)`;
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  }

  // Fetch and display recent transactions
  async function fetchTransactions() {
    try {
      const response = await fetch(window.moneytourApiUrl(`/api/transHistory/${userId}`), {
        credentials: "include",
        headers: window.moneytourAuthHeaders(),
      });

      if (!response.ok) throw new Error("Failed to fetch transactions");

      const transactions = await response.json();
      const activityList = document.getElementById('activityList');
      activityList.innerHTML = '';

      if (!transactions || transactions.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'activity-item';
        empty.innerHTML = '<span>No activity yet. Add your first transaction below.</span>';
        activityList.appendChild(empty);
        return;
      }

      transactions.slice(0, 3).forEach(transaction => {
        const isIncome = transaction.type === 'income';
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
          <span class="activity-icon">${isIncome ? '↗' : '↘'}</span>
          <span><b>${transaction.particulars}</b><small>${new Date(transaction.date).toLocaleDateString()}</small></span>
          <strong class="${isIncome ? 'positive' : ''}">${isIncome ? '+' : '-'}${formatCurrency(transaction.amount)}</strong>
        `;
        activityList.appendChild(item);
      });
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  }

  // Add new transaction
  if (transactionForm) {
    transactionForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const formData = new FormData(transactionForm);
      const type = transactionForm.elements.transType.checked ? 'expense' : 'income';
      const particulars = formData.get('particulars');
      const amount = formData.get('amount');
      const date = formData.get('date');

      try {
        const response = await fetch(window.moneytourApiUrl("/api/transHistory"), {
          method: 'POST',
          credentials: "include",
          headers: { 'Content-Type': 'application/json', ...window.moneytourAuthHeaders() },
          body: JSON.stringify({ userId, type, particulars, amount, date })
        });

        console.log(response)
        const result = await response.json();
        console.log(result);

        if (result.success) {
          alert(result.message);
          transactionForm.reset();
          fetchTransactions();
          fetchBalance();
        } else {
          alert(result.error || "Transaction failed");
        }
      } catch (error) {
        console.error("Error adding transaction:", error);
      }
    });
  }
  // Load the balance and transactions on page start
  fetchBalance();
  fetchTransactions();
});
