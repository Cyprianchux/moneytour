document.addEventListener('DOMContentLoaded', async () => {
  const session = await window.moneytourSessionReady;
  if (!session) return;
  const userId = String(session.userId);

  if (userId === null) {
    alert('Please login first!');
    return;
  }

  const transactionTable = document.getElementById('transactionTable').getElementsByTagName('tbody')[0];

  // Fetch and display transactions in a table
  async function fetchTransactions() {
    try {
      const response = await fetch(window.moneytourApiUrl(`/api/transHistory/${userId}`), {
        credentials: "include",
        headers: window.moneytourAuthHeaders(),
      });

      if (!response.ok) throw new Error("Failed to fetch transactions");

      const transactions = await response.json();
      transactionTable.innerHTML = '';

      transactions.forEach(transaction => {
        const row = transactionTable.insertRow();
        
        [
          ["ID", transaction.transactionId],
          ["Type", transaction.type],
          ["Details", transaction.particulars],
          ["Amount", `$${parseFloat(transaction.amount).toFixed(2)}`],
          ["Date", new Date(transaction.date).toLocaleDateString()],
        ].forEach(([label, value]) => {
          const cell = row.insertCell();
          cell.dataset.label = label;
          cell.textContent = value;
        });
      });
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  }
  fetchTransactions();
});
