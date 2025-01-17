// use JSDoc (https://jsdoc.app/) to generate API Doc
// Author: Nazanin

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
    const errorContainer = document.querySelector(
        "[data-js=errorContainer]");
    const loadingContainer = document.querySelector(
        "[data-js=loadingContainer]");

    try {
        const totalBalance = document.querySelector(
            "[data-js=totalBalance]");
        const transactionTableBody = document.querySelector(
            "[data-js=transactionBody]");

        //Get data from API
        let counter = 1;
        let totalCount = 0;
        let transactions = [];

        // Showing loading popup
        loadingContainer.style.display = 'block';

        // Get data from all pages 
        do {
            const pageData = await fetchPage(counter);
            transactions = transactions.concat(pageData.transactions);
            totalCount = pageData.totalCount;
            counter++;
        } while (transactions.length < totalCount)



        //removing loading popup
        loadingContainer.style.display = 'none';

        //Sort transactions based on Date
        const compareFunc = (a, b) => {
            if (a.Date > b.Date) {
                return -1;
            }
            if (a.Date < b.Date) {
                return 1;
            }
            return 0;
        }
        transactions.sort(compareFunc);

        const balance = renderTableAndCalculateBalance(transactions,
            transactionTableBody);

        //Show the total balance
        let formatedBalance = Intl.NumberFormat('en-US',
            { style: 'currency', currency: 'USD' })
            .format(balance);
        totalBalance.innerHTML = `${formatedBalance}`;

    } catch (e) { //catching any exception during execution of app
        //ideally the error should be reported back to server for server side logging
        console.log(e);
        loadingContainer.style.display = "none";
        errorContainer.style.display = "block";
    }
}

//start the app
app();