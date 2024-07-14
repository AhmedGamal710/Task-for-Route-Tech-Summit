document.addEventListener('DOMContentLoaded', () => {
    const apiEndpoint = 'http://localhost:3000';
    const customerTableBody = document.querySelector('#customerTable tbody');
    const filterNameInput = document.getElementById('filterName');
    const filterAmountInput = document.getElementById('filterAmount');
    const transactionChart = document.getElementById('transactionChart').getContext('2d');
    let customers = [];
    let transactions = [];
    let chart;

    // Fetch data from API
    async function fetchData() {
        try {
            const customerResponse = await fetch(`${apiEndpoint}/customers`);
            customers = await customerResponse.json();
            
            const transactionResponse = await fetch(`${apiEndpoint}/transactions`);
            transactions = await transactionResponse.json();
            
            if (customers && transactions) {
                displayCustomers();
            } else {
                console.error('No data found');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }
    

    // Display customers in table
    function displayCustomers(filterName = '', filterAmount = 0) {
        customerTableBody.innerHTML = '';
        transactions.filter(transaction => {
            const customer = customers.find(cust => cust.id === transaction.customer_id);
            return customer && customer.name.toLowerCase().includes(filterName.toLowerCase()) && transaction.amount >= filterAmount;
        }).forEach(transaction => {
            const customer = customers.find(cust => cust.id === transaction.customer_id);
            if (customer) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${customer.name}</td>
                    <td>${transaction.date}</td>
                    <td>${transaction.amount}</td>
                `;
                row.addEventListener('click', () => displayChart(customer.id));
                customerTableBody.appendChild(row);
            }
        });
    }
    

    // Display chart for selected customer
    function displayChart(customerId) {
        const customerTransactions = transactions.filter(transaction => transaction.customer_id === customerId);
        const dates = [...new Set(customerTransactions.map(transaction => transaction.date))];
        const amounts = dates.map(date => customerTransactions.filter(transaction => transaction.date === date).reduce((sum, transaction) => sum + transaction.amount, 0));
        
        if (chart) {
            chart.destroy();
        }
        
        chart = new Chart(transactionChart, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Transaction Amount',
                    data: amounts,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    filterNameInput.addEventListener('input', () => displayCustomers(filterNameInput.value, filterAmountInput.value));
    filterAmountInput.addEventListener('input', () => displayCustomers(filterNameInput.value, filterAmountInput.value));
    
    fetchData();
});
