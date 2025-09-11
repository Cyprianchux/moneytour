document.addEventListener('DOMContentLoaded', () => {
  // Get userId from localStorage (set after login)
  const userId = localStorage.getItem("myUserId");
  console.log("Loaded userId: ", userId);
  if (userId === null) {
    alert("Please login first!");
    return; // stop if not logged in
  }

  const transactionForm = document.getElementById('transactionForm');
  const transactionList = document.getElementById('transactionList');
  const balanceDisplay = document.getElementById('balance');
/*  const incomeDisplay = document.getElementById('income');   // make sure you have these in HTML
  const expenseDisplay = document.getElementById('expense'); */

  // Fetch and display balance
  async function fetchBalance() {
    try {
      const response = await fetch(`http://localhost:5500/api/balance/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch balance");

      const result = await response.json();

      const totalIncome = result.totalIncome ? parseFloat(result.totalIncome) : 0;
      const totalExpense = result.totalExpense ? parseFloat(result.totalExpense) : 0;
      const balance = result.balance ? parseFloat(result.balance) : 0;

      balanceDisplay.textContent = `$${balance.toFixed(2)}`;
    /*  incomeDisplay.textContent = `$${totalIncome.toFixed(2)}`;
      expenseDisplay.textContent = `$${totalExpense.toFixed(2)}`; */
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  }

  // Fetch and display transactions
/*  async function fetchTransactions() {
    try {
      const response = await fetch(`http://localhost:5500/api/transactions/${userId}`);
      const transactions = await response.json();

      transactionList.innerHTML = '';
      transactions.forEach(transaction => {
        const li = document.createElement('li');
        li.textContent = `${transaction.particulars} - $${transaction.amount.toFixed(2)} (${transaction.type}) on ${new Date(transaction.date).toLocaleDateString()}`;
        transactionList.appendChild(li);
      });
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  } 
  */

  // Add new transaction
  if (transactionForm) {
    transactionForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const formData = new FormData(transactionForm);
      const type = formData.get('type') === 'income' ? 'income' : 'expense';
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
  // Load on page start
  fetchBalance();
//  fetchTransactions();
});
