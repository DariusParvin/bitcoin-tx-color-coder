import MyTransaction from "./transaction.js";
import { getColor } from "./colorText.js";

window.onload = function () {
  document
    .getElementById("txForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();
      resetDisplay();

      var txInput = document.getElementById("txInput").value;
      var url = `https://blockchain.info/rawtx/${txInput}?format=hex`;
      const rawData = await fetchData(url);

      let tx = MyTransaction.fromHex(rawData);
      let tuples = tx.toTuples();
      console.log(tuples);

      // Get the HTML element where we will append our colored text.
      // In this case, the element has an id of "colored-text".
      var targetElement = document.getElementById("colored-text");

      const txIn = tx.ins.length
      const txOut = tx.outs.length

      var coloredSpans = tuples.map(function (item) {
        var color = getColor(item, txIn, txOut);
        return '<span style="color: ' + color + '">' + item[0] + "</span>";
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
      elem.textContent = rawData;
      elem.classList.add("show");
    });
};

function resetDisplay() {
  ["colored-text", "tx-breakdown"].forEach((id) => {
    var elem = document.getElementById(id);
    elem.textContent = "";
    elem.classList.remove("show");
  });
}

async function fetchData(url, elementId) {
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
