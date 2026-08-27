document.addEventListener('DOMContentLoaded', () => {
  const userId = localStorage.getItem("myUserId");
  // console.log("Logged in userId: ", userId);
  const myUsername = localStorage.getItem('myUsername');
  const usernameSpan = document.getElementById("username");
/*
  if (userId === null) {
    alert("Please login first!");
    window.location.href = "login.html";
    return;
  }
*/
  // Capitalize first letter of username
  let formattedUsername = '';
  if (myUsername) {
    formattedUsername = myUsername.charAt(0).toUpperCase() + myUsername.slice(1);
    document.getElementById("username").textContent = formattedUsername;
    document.getElementById("profileMark").textContent = myUsername.slice(0, 2).toUpperCase();
    document.getElementById("greeting").textContent = `Good morning, ${formattedUsername}`;
  }

  const transactionForm = document.getElementById('transactionForm');
  const transactionList = document.getElementById('transactionList');
  const balanceDisplay = document.getElementById('balance');
  const incomeDisplay = document.getElementById('income');
  const expenseDisplay = document.getElementById('expense');

  const currency = '₦';

  // Fetch and display balance
  async function fetchBalance() {
    try {
      const response = await fetch(`http://localhost:5500/api/balance/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch balance");

      const result = await response.json();

      const totalIncome = result.totalIncome ? parseFloat(result.totalIncome) : 0;
      const totalExpense = result.totalExpense ? parseFloat(result.totalExpense) : 0;
      const balance = result.balance ? parseFloat(result.balance) : 0;

      balanceDisplay.textContent = `${currency}${balance.toFixed(2)}`;
      incomeDisplay.textContent = `${currency}${totalIncome.toFixed(2)}`;
      expenseDisplay.textContent = `${currency}${totalExpense.toFixed(2)}`;
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  }

  // Fetch and display recent transactions
  async function fetchTransactions() {
    try {
      const response = await fetch(`http://localhost:5500/api/transHistory/${userId}`);

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
          <strong class="${isIncome ? 'positive' : ''}">${isIncome ? '+' : '-'}${currency}${parseFloat(transaction.amount).toFixed(2)}</strong>
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
      const type = formData.get('transType') === 'expense' ? 'expense' : 'income';
      const particulars = formData.get('particulars');
      const amount = formData.get('amount');
      const date = formData.get('date');

      try {
        const response = await fetch('http://localhost:5500/api/transHistory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
