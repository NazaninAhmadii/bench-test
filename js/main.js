
//the REST API endpoint
const BASE_URL = 'https://resttest.bench.co/transactions/';


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

//The application
const app = async () => {
    try {

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

        console.log(transactions)

    } catch (e) {
        console.log(e)
    }
}

//start the app
app();