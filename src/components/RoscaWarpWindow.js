'use client';

import { useState, useEffect } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { MyStyledConnectButton } from './MyStyledConnectButton';
import RoscaAbi from '../abi/BlindRoscaABI.js'; 
import { ethers } from 'ethers';

export default function RoscaWarpWindow() {
  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

  const { address, isConnected } = useAccount();
  const { data: oamBalance } = useBalance({
    address: address,
    token: CONTRACT_ADDRESS,
    watch: true,
  });

  const [poolSize, setPoolSize] = useState(5);
  const [poolDraw, setPoolDraw] = useState(25);
  const [tokenChain, setTokenChain] = useState('USDC-ETH');
  const [growthLock, setGrowthLock] = useState(false);
  const [lockPercentage, setLockPercentage] = useState(5);
  const [growthTarget, setGrowthTarget] = useState('');
  const [feesAccepted, setFeesAccepted] = useState(false);
  const [searching, setSearching] = useState(false);
  const [assignedPool, setAssignedPool] = useState(null);
  const [membersJoined, setMembersJoined] = useState(0);
  const [confirmingPayment, setConfirmingPayment] = useState(false);

  useEffect(() => {
    if (poolDraw && growthLock) {
      setGrowthTarget(Math.floor(poolDraw * 1.5));
    }
  }, [poolDraw, growthLock]);

  const requiredFlashbits = poolDraw;
  const requiredStablecoin = poolDraw;

  const hasEnoughOAM = oamBalance && Number(oamBalance.formatted) >= requiredFlashbits;

  const handleSearchAndJoin = async () => {
    if (!isConnected) return;

    if (!feesAccepted) return;

    setSearching(true);

    // Mock Assign Pool
    const fakePoolId = Math.floor(Math.random() * 10000);
    setAssignedPool({
      id: fakePoolId,
      membersNeeded: poolSize,
      currentMembers: 1,
      drawAmount: poolDraw,
    });

    setMembersJoined(1);

    setTimeout(() => setSearching(false), 1000);
  };

  const handleConfirmAndPay = async () => {
    if (!isConnected) return;

    try {
      setConfirmingPayment(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, RoscaAbi, signer);

      const stablecoinAmount = ethers.utils.parseUnits(String(requiredStablecoin), 18);
      const flashbitsAmount = ethers.utils.parseUnits(String(requiredFlashbits), 18);

      await contract.joinPool(
        poolSize,
        poolDraw,
        address,
        growthLock ? lockPercentage : 0,
        growthLock ? ethers.utils.parseUnits(growthTarget.toString(), 18) : 0
      );

      console.log('Transaction submitted Commander.');
    } catch (error) {
      console.error('Transaction failed Commander:', error);
    } finally {
      setConfirmingPayment(false);
    }
  };

  return (
    <div style={outerContainer}>
      <div style={settingsWindow}>
        <h2 style={{ textAlign: 'center', color: '#00FFF0' }}>
          {isConnected ? "OAM Perfect Strangers ROSCA" : "OAM Rosca Perfect Strangers Public Pool Beta"}
        </h2>

        {/* Accepted Token Type */}
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <label>Accepted Token Types:</label>
          <br />
          <select value={tokenChain} onChange={(e) => setTokenChain(e.target.value)}>
            <option value="USDC-ETH">USDC - Ethereum</option>
            <option value="USDC-Polygon">USDC - Polygon</option>
            <option value="USDT-ETH">USDT - Ethereum</option>
            <option value="USDT-Polygon">USDT - Polygon</option>
          </select>
        </div>

        {/* Pool Draw */}
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <label>Pool Draw ($):</label>
          <br />
          <select value={poolDraw} onChange={(e) => setPoolDraw(Number(e.target.value))}>
            {[25, 50, 75, 100, 125, 150, 175, 200].map(amount => (
              <option key={amount} value={amount}>${amount}</option>
            ))}
          </select>
          <div style={{ marginTop: '0.5rem', color: '#00FFF0' }}>
            Weekly Contribution: ${(poolDraw / poolSize).toFixed(2)} / week
            <br />
            Required Deposit: ${requiredStablecoin} + {requiredFlashbits} Flashbits
            <br />
            Weekly payments are manual. Deposit fallback secures participation.
          </div>
        </div>

        {/* Growth Lock */}
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <label>
            <input
              type="checkbox"
              checked={growthLock}
              onChange={(e) => setGrowthLock(e.target.checked)}
            /> Enable Growth Lock?
          </label>
          {growthLock && (
            <>
              <div style={{ marginTop: '0.5rem' }}>
                <select
                  value={lockPercentage}
                  onChange={(e) => setLockPercentage(Number(e.target.value))}
                >
                  <option value={5}>5%</option>
                  <option value={10}>10%</option>
                  <option value={15}>15%</option>
                </select>
                <div style={{ fontSize: '0.8rem', marginTop: '0.3rem', color: '#FF9900' }}>
                  Applied toward your deposit until growth target is reached.
                  <br />
                  Growth Lock users receive extra Global Lottery entries.
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                  Target Growth ($):
                  <input
                    type="number"
                    value={growthTarget}
                    onChange={(e) => setGrowthTarget(e.target.value)}
                    min={poolDraw}
                    style={{ marginLeft: '0.5rem', width: '100px' }}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Select Pool Size */}
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <label>Select Pool Size:</label>
          <br />
          {[5, 10, 15].map(size => (
            <button
              key={size}
              onClick={() => setPoolSize(size)}
              style={{
                margin: '0.3rem',
                backgroundColor: poolSize === size ? '#00FFF0' : '#222',
                color: poolSize === size ? '#000' : '#FFF',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {size} Members
            </button>
          ))}
        </div>

        {/* Accept Fees */}
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <label>
            <input
              type="checkbox"
              checked={feesAccepted}
              onChange={(e) => setFeesAccepted(e.target.checked)}
            /> Accept 1% Treasury, 0.25% Pool & Global Lottery Fees
          </label>
        </div>

        {/* Search and Join Button */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <button
            style={searchButton}
            onClick={handleSearchAndJoin}
            disabled={!isConnected || !feesAccepted}
          >
            {searching ? "Searching..." : "Search + Join Pool"}
          </button>
          {!isConnected && (
            <div style={{ marginTop: '0.5rem', color: '#FF9900' }}>
              ⚠️ Please Connect Wallet to Join Pool.
            </div>
          )}
        </div>
      </div>

      {/* Assigned Pool Window */}
      {assignedPool && (
        <div style={assignedPoolWindow(membersJoined, assignedPool.membersNeeded)}>
          <h2>Assigned Pool #{assignedPool.id}</h2>
          <p>Pool Status: {membersJoined} of {assignedPool.membersNeeded} Members</p>
          <p>Weekly Contribution: ${(poolDraw / poolSize).toFixed(2)}</p>
          <p>Deposit Confirmed: ${requiredStablecoin} + {requiredFlashbits} Flashbits</p>
          <button
            style={confirmButton(membersJoined, assignedPool.membersNeeded)}
            onClick={handleConfirmAndPay}
          >
            {confirmingPayment ? "Confirming..." : `Confirm & Pay ($${poolDraw})`}
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------
// Style Constants
// ---------------------

const outerContainer = {
  backgroundImage: `url('/backgrounds/moondrop.jpg')`,
  backgroundSize: 'cover',
  backgroundAttachment: 'fixed',
  color: '#fff',
  minHeight: '100vh',
  padding: '40px',
};

const settingsWindow = {
  marginTop: '2rem',
  backgroundColor: 'rgba(0,0,0,0.6)',
  padding: '2rem',
  borderRadius: '12px',
  border: '2px solid #00FFF0',
  boxShadow: '0 0 20px #00FFF0, inset 0 0 10px #00FFF0',
  animation: 'pulse-border 3s infinite alternate',
};

const searchButton = {
  backgroundColor: '#00FFF0',
  color: '#000',
  padding: '1rem 2rem',
  borderRadius: '8px',
  fontSize: '1.1rem',
  border: 'none',
  cursor: 'pointer',
};

const assignedPoolWindow = (current, max) => ({
  marginTop: '3rem',
  backgroundColor: 'rgba(0,0,0,0.8)',
  padding: '2rem',
  borderRadius: '12px',
  border: '2px solid #00FFF0',
  boxShadow: current === max - 1 ? '0 0 20px #FF9900, inset 0 0 10px #FF9900' : '0 0 20px #00FFF0',
  animation: current === max - 1 ? 'pulse-border 1.5s infinite alternate' : '',
});

const confirmButton = (current, max) => ({
  marginTop: '1rem',
  backgroundColor: current === max - 1 ? '#FF9900' : '#00FFF0',
  color: '#000',
  padding: '1rem 2rem',
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
  fontSize: '1.1rem',
});