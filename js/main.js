// use JSDoc (https://jsdoc.app/) to generate API Doc

//the REST API endpoint
const BASE_URL = 'https://resttest.bench.co/transactions/';

/**
 * Given a page id it fetches and returns page data.
 * @param {number} page - The page ID.
 * @returns {array} - The page data
 * @throws Error exeption if fails to fetch data
 */
const fetchPage = async (page) => {
    //fetch data from the API per page number
    const response = await fetch(`${BASE_URL}${page}.json`);

    //check response status
    if (response.ok) {
        const data = await response.json();
        return data;
    } else {
        throw new Error(`Error Fetching Data: ${response.status}`);
    }
}

/**
 * Given a transaction row it construct the HTML representaion of that row.
 * @param {object} transactionRow - transaction row
 * @returns {string} - The HTML representation of row data
 */
const createRow = (transactionRow) => {
    //change data format
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    let formatedDate = new Date(transactionRow.Date).
        toLocaleDateString('en-US', options);
    let formatedAmount = Intl.NumberFormat('en-US', {
        style: 'currency', currency: 'USD'
    }).format(transactionRow.Amount);

    //generate and returns the new row
    return `<tr>
    <td>${formatedDate}</td>
    <td>${transactionRow.Company}</td>
    <td>${transactionRow.Ledger}</td>
    <td>${formatedAmount}</td>
    </tr>`
}

/**
 * Renders HTML table content, given transactions data and table body element.
 * Also calculate and returns totalBalance
 * @param {array} transactions - transaction array
 * @param {HTMLElement} tableBody - table body to update
 * @returns {number}
 */
const renderTableAndCalculateBalance = (transactions, tableBody) => {
    let totalBalance = 0.0;
    if (transactions.length) {
        transactions.map((item) => {
            totalBalance += parseFloat(item.Amount);
            tableBody.innerHTML += createRow(item);
        })
    }
    return totalBalance;
}

//The application
const app = async () => {
    try {
        const totalBalance = document.querySelector("[data-js=totalBalance]");
        const transactionTableBody = document.querySelector("[data-js=transactionBody]");
        //Get data from API
        let counter = 1;

        //Get firstpage data
        const firstPage = await fetchPage(counter);
        const totalCount = firstPage.totalCount;
        let transactions = firstPage.transactions;

        // Get data from all pages 
        while (transactions.length < totalCount) {
            counter++;
            const pageData = await fetchPage(counter);
            transactions = transactions.concat(pageData.transactions);
        }

        const balance = renderTableAndCalculateBalance(transactions,
            transactionTableBody);

        //Show the total balance
        let formatedBalance = Intl.NumberFormat('en-US',
            { style: 'currency', currency: 'USD' })
            .format(balance);
        totalBalance.innerHTML = `${formatedBalance}`

    } catch (e) {
        console.log(e)
    }
}

//start the app
app();