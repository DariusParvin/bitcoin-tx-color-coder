import MyTransaction from "./transaction.js";
import { getColor } from "./colorText.js";
import { exampleTransactions } from "./exampleTransactions.js";

window.onload = function () {
  document
    .getElementById("optionsForm")
    .addEventListener("change", function (event) {
      // clear the previous transaction
      resetElements()

      // hide all forms
      document.getElementById("option1Form").classList.add("hidden");
      document.getElementById("option2Form").classList.add("hidden");
      document.getElementById("option3Form").classList.add("hidden");

      // show selected form
      document
        .getElementById(event.target.value + "Form")
        .classList.remove("hidden");
    });

  let option1Form = document.getElementById("option1Form");
  // dynamically generate the buttons
  exampleTransactions.forEach(function (transaction) {
    let button = document.createElement("button");
    button.classList.add("link-button");
    button.textContent = transaction.type;
    button.dataset.transactionType = transaction.type;
    button.addEventListener("click", function (e) {
      e.preventDefault();
      processTransaction(transaction.value);
    });
    option1Form.appendChild(button);
  });

  document
    .getElementById("option2Form")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      var txidInput = document.getElementById("txidInput").value;
      if (txidInput === "") {
        alert("Please enter a transaction ID.");
        return;
      } else if (txidInput.length !== 64) {
        alert("transaction ID is not 32 bytes (64 hex characters)");
        return;
      }
      
      const transactionHex = await fetchData(txidInput);
      processTransaction(transactionHex);
    });

  document
    .getElementById("option3Form")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const transactionHex = document.getElementById("txHexInput").value;
      processTransaction(transactionHex);
    });

  // select the first option by default
  document.getElementById("option1").checked = true;
  option1Form.classList.remove("hidden");
};

async function fetchData(txInput) {
  const mainnetUrl = `https://blockstream.info/api/tx/${txInput}/hex`;
  const testnetUrl = `https://blockstream.info/testnet/api/tx/${txInput}/hex`;

  const requests = [fetch(mainnetUrl), fetch(testnetUrl)];
  
  const responses = await Promise.allSettled(requests);

  for (let response of responses) {
    if (response.status === "fulfilled") {
      if (response.value.ok) {
        return await response.value.text();
      }
    }
  }

  throw new Error('Transaction not found in both mainnet and testnet.');
}



function processTransaction(transactionHex) {
  const rawTx = document.getElementById("rawTxData");
  rawTx.textContent = transactionHex;
  document.getElementById("txHexContainer").classList.remove("hidden");

  let tx = MyTransaction.fromHex(transactionHex);
  let tuples = tx.toAnnotatedTuples();
  console.log(tuples);
  var coloredSpans = tuples.map(function (item, index) {
    var color = getColor(item);
    // Note the use of `data-section-id` and the click event listener.
    return '<span style="color: ' + color + '" data-section-id="' + index + '" class="transaction-section">' + item[0] + "</span>" + "|";
  });

  var coloredTextElement = document.getElementById("coloredText");
  coloredTextElement.innerHTML = coloredSpans.join("");
  document.getElementById("coloredTextContainer").classList.remove("hidden");

  var txBreakdownElement = document.getElementById("tx-breakdown");
  var coloredListItems = tuples.map(function (item, index) {
    var color = getColor(item);
    var data = item[0];
    var label = item[1];
    var decoded = item[2];
    var description = item[3];
  
    return (
      '<li><span style="color: ' + color + '" class="transaction-section legend-item styledTextPart" data-section-id="' + index + '">' +
      data +
      '</span>: <span>' +
      label +
      '</span><div class="description">' +
      'decoded: ' + decoded + '<br>' +
      description +
      '</div></li>'
    );
  });
  

  
  txBreakdownElement.innerHTML = coloredListItems.join("");
  txBreakdownElement.classList.remove("hidden");
}

document.addEventListener('click', function(event) {
  // If a transaction section was clicked...
  if (event.target.matches('.transaction-section')) {
     // Un-highlight all elements.
     document.querySelectorAll('.highlight').forEach(element => {
      element.classList.remove('highlight');
    });
    
    // Get the section id.
    let sectionId = event.target.dataset.sectionId;

    // Find all elements with this section id.
    let elements = document.querySelectorAll(`[data-section-id="${sectionId}"]`);

    // For each element...
    elements.forEach(element => {
      // ...toggle the highlight class.
      element.classList.toggle('highlight');
    });
  }
});

document.body.addEventListener("click", function (e) {
  // If the clicked target is not part of your color coded text or legend list
  if (!e.target.matches('.highlight')) {
    // Get all currently highlighted elements
    let highlightedElements = document.querySelectorAll('.highlight');

    // Remove highlighting class from each highlighted element
    highlightedElements.forEach(function(el) {
      el.classList.remove('highlight');
    });
  }
});

function resetElements() {
  document.getElementById("txHexContainer").classList.add("hidden");
  document.getElementById("coloredTextContainer").classList.add("hidden");
  document.getElementById("tx-breakdown").classList.add("hidden");
}