document.addEventListener('DOMContentLoaded', () => {
  const transactionTable = document.getElementById('transactionTable').getElementsByTagName('tbody')[0];

  // Fetch and display transactions in a table
  async function fetchTransactions() {
    try {
      const response = await fetch(`http://localhost:5500/api/transactions/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch transactions");

      const transactions = await response.json();
      transactionTable.innerHTML = '';

      transactions.forEach(transaction => {
        const row = transactionTable.insertRow();
        row.insertCell(0).textContent = transaction.transactionId;
        row.insertCell(1).textContent = transaction.type;
        row.insertCell(2).textContent = transaction.particulars;
        row.insertCell(3).textContent = `$${parseFloat(transaction.amount).toFixed(2)}`;
        row.insertCell(4).textContent = new Date(transaction.date).toLocaleDateString();
      });
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  }
});
