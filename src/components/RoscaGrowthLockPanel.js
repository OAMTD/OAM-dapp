'use client';

import { useState } from 'react';
import { useAccount, useContractWrite } from 'wagmi';
import { parseUnits } from 'viem';
import BlindRoscaABI from '../abi/BlindRoscaABI.js'; // Updated to .js as instructed

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

export default function RoscaGrowthLockPanel() {
  const { address, isConnected } = useAccount();
  const [showActions, setShowActions] = useState(false);
  const [activePanel, setActivePanel] = useState(null);

  const [depositAmount, setDepositAmount] = useState('');
  const [targetGrowth, setTargetGrowth] = useState('');
  const [drawPercent, setDrawPercent] = useState('5');
  const [addAmount, setAddAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('');
  const [transferAddress, setTransferAddress] = useState('');
  const [heirAddress, setHeirAddress] = useState('');

  const isPositive = (val) => Number(val) > 0;

  // Contract Writes
  const { write: startGrowthLock } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: BlindRoscaABI,
    functionName: 'joinPool',
    args: [
      5,
      parseUnits(depositAmount || '0', 18),
      address,
      parseUnits(drawPercent || '5', 18),
      parseUnits(targetGrowth || '0', 18)
    ],
  });

  const { write: addFundsToGrowthLock } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: BlindRoscaABI,
    functionName: 'depositToGrowthLock',
    args: [parseUnits(addAmount || '0', 18)],
  });

  const { write: transferGrowthLock } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: BlindRoscaABI,
    functionName: 'transferGrowthLock',
    args: [transferAddress],
  });

  const { write: breakGrowthLock } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: BlindRoscaABI,
    functionName: 'emergencyBreakGrowthLock',
  });

  const { write: withdrawAddedFunds } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: BlindRoscaABI,
    functionName: 'withdrawManualGrowthPortion',
    args: [parseUnits(addAmount || '0', 18)],
  });

  const { write: updateFallbackHeir } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: BlindRoscaABI,
    functionName: 'updateFallbackHeir',
    args: [heirAddress],
  });

  const handleTogglePanel = (panel) => {
    setActivePanel((prev) => (prev === panel ? null : panel));
  };

  return (
    <div style={mainPanelStyle}>
      {!showActions ? (
        <>
          <h2 style={titleStyle}>Growth Lock Management</h2>
          <p style={infoStyle}>
            Secure, grow, or transfer your ROSCA deposits. All funds remain under your control.
            Inactive accounts for over 2 years will auto-transfer to your assigned heir address.
          </p>
          <div style={{ textAlign: 'center' }}>
            <button style={buttonStyle} onClick={() => setShowActions(true)}>
              Manage Growth Lock
            </button>
          </div>
        </>
      ) : (
        <>
          <h3 style={titleStyle}>Growth Lock Options</h3>
          <div style={buttonRowStyle}>
            <button style={buttonStyle} onClick={() => handleTogglePanel('start')}>Start</button>
            <button style={buttonStyle} onClick={() => handleTogglePanel('add')}>Add Funds</button>
            <button style={buttonStyle} onClick={() => handleTogglePanel('transfer')}>Transfer Lock</button>
            <button style={buttonStyle} onClick={() => handleTogglePanel('heir')}>Set Heir</button>
            <button style={redButtonStyle} onClick={() => handleTogglePanel('break')}>Break Lock</button>
          </div>

          {/* Start */}
          {activePanel === 'start' && (
            <div style={actionBoxStyle}>
              <h4>Start Growth Lock</h4>
              <select style={inputStyle} value={selectedToken} onChange={(e) => setSelectedToken(e.target.value)}>
                <option value="">Select Token</option>
                <option value="usdc-eth">USDC - Ethereum</option>
                <option value="usdc-poly">USDC - Polygon</option>
                <option value="usdt-eth">USDT - Ethereum</option>
                <option value="usdt-poly">USDT - Polygon</option>
              </select>
              <input
                type="number"
                style={inputStyle}
                placeholder="Deposit Amount ($)"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
              <input
                type="number"
                style={inputStyle}
                placeholder="Target Growth Goal ($)"
                value={targetGrowth}
                onChange={(e) => setTargetGrowth(e.target.value)}
              />
              <select style={inputStyle} value={drawPercent} onChange={(e) => setDrawPercent(e.target.value)}>
                <option value="5">5%</option>
                <option value="10">10%</option>
                <option value="15">15%</option>
              </select>
              <p style={noteStyle}>
                This percentage is applied to weekly draws and grows your locked deposit.
                Users with Growth Lock receive extra lottery entries.
              </p>
              <div style={buttonRowStyle}>
                <button
                  style={confirmButtonStyle}
                  disabled={!isConnected || !isPositive(depositAmount)}
                  onClick={() => startGrowthLock?.()}
                >
                  Confirm Start
                </button>
                <button style={cancelButtonStyle} onClick={() => handleTogglePanel(null)}>Cancel</button>
              </div>
            </div>
          )}

          {/* Add Funds */}
          {activePanel === 'add' && (
            <div style={actionBoxStyle}>
              <h4>Add Funds</h4>
              <input
                type="number"
                style={inputStyle}
                placeholder="Amount to Add"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
              />
              <div style={buttonRowStyle}>
                <button style={confirmButtonStyle} onClick={() => addFundsToGrowthLock?.()} disabled={!isPositive(addAmount)}>
                  Confirm Add
                </button>
                <button style={cancelButtonStyle} onClick={() => handleTogglePanel(null)}>Cancel</button>
              </div>
            </div>
          )}

          {/* Transfer Lock */}
          {activePanel === 'transfer' && (
            <div style={actionBoxStyle}>
              <h4>Transfer Growth Lock</h4>
              <input
                type="text"
                style={inputStyle}
                placeholder="Target Contract Address"
                value={transferAddress}
                onChange={(e) => setTransferAddress(e.target.value)}
              />
              <div style={buttonRowStyle}>
                <button style={confirmButtonStyle} onClick={() => transferGrowthLock?.()} disabled={!transferAddress}>
                  Confirm Transfer
                </button>
                <button style={cancelButtonStyle} onClick={() => handleTogglePanel(null)}>Cancel</button>
              </div>
            </div>
          )}

          {/* Set Heir */}
          {activePanel === 'heir' && (
            <div style={actionBoxStyle}>
              <h4>Assign Heir</h4>
              <input
                type="text"
                style={inputStyle}
                placeholder="Heir Wallet Address"
                value={heirAddress}
                onChange={(e) => setHeirAddress(e.target.value)}
              />
              <div style={buttonRowStyle}>
                <button style={confirmButtonStyle} onClick={() => updateFallbackHeir?.()} disabled={!heirAddress}>
                  Set Heir
                </button>
                <button style={cancelButtonStyle} onClick={() => handleTogglePanel(null)}>Cancel</button>
              </div>
            </div>
          )}

          {/* Break Lock */}
          {activePanel === 'break' && (
            <div style={actionBoxStyle}>
              <h4>Break Growth Lock</h4>
              <p style={noteStyle}>25% penalty applies. Partial withdrawals every 60 days allowed.</p>
              <div style={buttonRowStyle}>
                <button style={buttonStyle} onClick={() => withdrawAddedFunds?.()} disabled={!isPositive(addAmount)}>Withdraw 50%</button>
                <button style={redButtonStyle} onClick={() => breakGrowthLock?.()}>Break Lock</button>
                <button style={cancelButtonStyle} onClick={() => handleTogglePanel(null)}>Cancel</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// --- STYLES ---
const mainPanelStyle = {
  border: '2px solid #00FFF0',
  borderRadius: '14px',
  padding: '30px',
  backgroundColor: 'rgba(0, 0, 0, 0.75)',
  boxShadow: '0 0 18px #00FFF0',
  maxWidth: '760px',
  margin: '30px auto'
};

const titleStyle = {
  color: '#00FFF0',
  textAlign: 'center',
  marginBottom: '10px'
};

const infoStyle = {
  color: '#ccc',
  fontSize: '0.92rem',
  textAlign: 'center',
  marginBottom: '25px'
};

const buttonRowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: '12px',
  marginTop: '10px'
};

const buttonStyle = {
  padding: '10px 14px',
  background: '#00FFF0',
  borderRadius: '8px',
  fontWeight: 'bold',
  border: 'none',
  cursor: 'pointer'
};

const redButtonStyle = {
  ...buttonStyle,
  background: '#FF3A3A',
  color: '#fff'
};

const confirmButtonStyle = {
  ...buttonStyle,
  padding: '8px 20px'
};

const cancelButtonStyle = {
  ...buttonStyle,
  background: '#444',
  color: '#fff'
};

const actionBoxStyle = {
  border: '1px solid #00FFF0',
  backgroundColor: 'rgba(0,0,0,0.6)',
  padding: '20px',
  borderRadius: '10px',
  marginTop: '15px'
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  marginTop: '10px',
  borderRadius: '6px',
  fontSize: '1rem'
};

const noteStyle = {
  fontSize: '0.85rem',
  color: '#FFCC00',
  textAlign: 'center',
  marginTop: '6px'
};