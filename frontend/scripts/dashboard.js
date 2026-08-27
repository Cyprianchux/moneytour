document.addEventListener('DOMContentLoaded', () => {
  const userId = localStorage.getItem("myUserId");
  // console.log("Logged in userId: ", userId);
  const myUsername = localStorage.getItem('myUsername');
  const usernameSpan = document.getElementById("username");

  if (userId === null) {
    alert("Please login first!");
    window.location.href = "login.html";
    return;
  }

  // Capitalize first letter of username
  if (myUsername) {
    const formattedUsername = myUsername.charAt(0).toUpperCase() + myUsername.slice(1);
    document.getElementById("username").textContent = formattedUsername;
  }
  
  const transactionForm = document.getElementById('transactionForm');
  const transactionList = document.getElementById('transactionList');
  const balanceDisplay = document.getElementById('balance');
/* 
  const incomeDisplay = document.getElementById('income');
  const expenseDisplay = document.getElementById('expense');
  */

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
        //  fetchTransactions();
          fetchBalance();
        } else {
          alert(result.error || "Transaction failed");
        }
      } catch (error) {
        console.error("Error adding transaction:", error);
      }
    });
  }
  // Load the balance on page start
  fetchBalance();
});
