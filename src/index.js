import MyTransaction from "./transaction.js";
import { getColor } from "./colorText.js";
import { exampleTransactions } from "./exampleTransactions.js";

window.onload = function () {
  document
    .getElementById("optionsForm")
    .addEventListener("change", function (event) {
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
      // resetDisplay();

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
      // resetDisplay();

      const transactionHex = document.getElementById("txHexInput").value;
      processTransaction(transactionHex);
    });
};

function resetDisplay() {
  ["colored-text", "tx-breakdown"].forEach((id) => {
    var elem = document.getElementById(id);
    elem.textContent = "";
    elem.classList.remove("show");
  });
}

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
  let tx = MyTransaction.fromHex(transactionHex);
  let tuples = tx.toTuples();

  // Get the HTML element where we will append our colored text.
  // In this case, the element has an id of "colored-text".
  var targetElement = document.getElementById("colored-text");

  const txIn = tx.ins.length;
  const txOut = tx.outs.length;

  var coloredSpans = tuples.map(function (item) {
    var color = getColor(item, txIn, txOut);
    return '<span style="color: ' + color + '">' + item[0] + "</span>" + "|";
  });

  // The Array join function is used to combine all elements of an array into a single string.
  // We then set the innerHTML of our target element to this string,
  // effectively replacing whatever was in the target element with our colored text.
  targetElement.innerHTML = coloredSpans.join("");

  var txBreakdownElement = document.getElementById("tx-breakdown");
  var coloredListItems = tuples.map(function (item) {
    var color = getColor(item, txIn, txOut); // Hash the string to get a color
    // Return a string of HTML that is a list item element with the first part as a colored span and the second part as a plain span.
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

  const elem = document.getElementById("rawTxData");
  elem.textContent = transactionHex;
  elem.classList.add("show");
}
