import React, { useState } from "react";

function TxDetails({ txid, txHex, size, weight, vsize }) {
  const [showDetails, setShowDetails] = useState(false);
  
  const linkStyle = {
    color: "lightblue",
    fontWeight: "bold"
  };

  return (
    <div className="txDetails-box">
        <button className="txDetails-button" onClick={() => setShowDetails(!showDetails)}>
            See Transaction Details
            <span className={`chevron ${showDetails ? "rotate" : ""}`}></span>
        </button>
        {showDetails && (
            <div className="txDetails-content">
                <ul id="txDetails">
                    <li><strong>Transaction ID:</strong> {txid}</li>
                    <li><strong>Transaction Hex:</strong> {txHex}</li>
                    <li><strong>Size:</strong> {size} bytes</li>
                    <li><strong>Weight:</strong> {weight} units</li>
                    <li><strong>vSize:</strong> {vsize} vbytes</li>
                    <li><a href={`https://mempool.space/tx/${txid}`} target="_blank" rel="noopener noreferrer" style={linkStyle}>View more on mempool.space</a></li>
                </ul>
            </div>
        )}
    </div>
  );
}

export default TxDetails;
