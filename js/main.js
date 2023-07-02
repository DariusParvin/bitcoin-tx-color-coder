window.onload = function() {
    document.getElementById('txForm').addEventListener('submit', function(e) {
        e.preventDefault();

        // Reset the display
        var txDataElem = document.getElementById('txData');
        txDataElem.textContent = '';
        txDataElem.classList.remove('show');

        var rawTxDataElem = document.getElementById('rawTxData');
        rawTxDataElem.textContent = '';
        rawTxDataElem.classList.remove('show');

        var txHash = document.getElementById('txHash').value;
        
        fetch(`https://blockchain.info/rawtx/${txHash}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("HTTP error " + response.status);
                }
                return response.json();
            })
            .then(data => {
                txDataElem.textContent = JSON.stringify(data, null, 2);
                txDataElem.classList.add('show');
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to fetch transaction data. Please check the transaction hash.');
            });
        
        fetch(`https://blockchain.info/rawtx/${txHash}?format=hex`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("HTTP error " + response.status);
                }
                return response.text();
            })
            .then(data => {
                rawTxDataElem.textContent = data;
                rawTxDataElem.classList.add('show');
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to fetch raw transaction data. Please check the transaction hash.');
            });
    });
}
