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

      var txInput = document.getElementById("txidInput").value;
      if (txInput === "") {
        alert("Please enter a transaction ID.");
        return;
      } else if (txInput.length !== 64) {
        alert("transaction ID is not 32 bytes (64 hex characters)");
        return;
      }

      var url = `https://blockchain.info/rawtx/${txInput}?format=hex`;
      const transactionHex = await fetchData(url);
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

async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}. Please check the input.`);
    }
    return await response.text();
  } catch (error) {
    console.error("Error:", error);
    alert(`Failed to fetch data. ${error.message}`);
  }
}

function processTransaction(transactionHex) {
  const rawTx = document.getElementById("rawTxData");
  rawTx.textContent = transactionHex;
  document.getElementById("txHexContainer").classList.remove("hidden");

  let tx = MyTransaction.fromHex(transactionHex);
  let tuples = tx.toTuples();

  var coloredSpans = tuples.map(function (item) {
    var color = getColor(item);
    return '<span style="color: ' + color + '">' + item[0] + "</span>" + "|";
  });

  var coloredTextElement = document.getElementById("coloredText");
  coloredTextElement.innerHTML = coloredSpans.join("");
  document.getElementById("coloredTextContainer").classList.remove("hidden");

  var txBreakdownElement = document.getElementById("tx-breakdown");
  var coloredListItems = tuples.map(function (item) {
    var color = getColor(item);
    return (
      '<li><span style="color: ' +
      color +
      '">' +
      item[0] +
      "</span>: <span>" +
      item[1] +
      "</span></li>"
    );
  });
  txBreakdownElement.innerHTML = coloredListItems.join("");
  txBreakdownElement.classList.remove("hidden");
}

function resetElements() {
  document.getElementById("txHexContainer").classList.add("hidden");
  document.getElementById("coloredTextContainer").classList.add("hidden");
  document.getElementById("tx-breakdown").classList.add("hidden");
}