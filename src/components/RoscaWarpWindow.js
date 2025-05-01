'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { parseUnits } from 'viem';
import { getStablecoinAddress } from '../utils/stablecoins';
import { MyStyledConnectButton } from './MyStyledConnectButton';
import RoscaAbi from '../abi/BlindRoscaABI.js';
import OamAbi from '../abi/oamTokendaoAbi.js';

const ROSCA_CONTRACT = process.env.NEXT_PUBLIC_ROSCA_PROXY_ADDRESS;
const OAM_CONTRACT = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

export default function RoscaWarpWindow() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const [poolSize, setPoolSize] = useState(5);
  const [poolDraw, setPoolDraw] = useState(25);
  const [tokenChain, setTokenChain] = useState('USDC-ETH');
  const [growthLock, setGrowthLock] = useState(true);
  const [lockPercentage, setLockPercentage] = useState(5);
  const [growthTarget, setGrowthTarget] = useState('100');
  const [feesAccepted, setFeesAccepted] = useState(false);
  const [searching, setSearching] = useState(false);
  const [assignedPool, setAssignedPool] = useState(null);
  const [membersJoined, setMembersJoined] = useState(0);
  const [confirmingPayment, setConfirmingPayment] = useState(false);

  useEffect(() => {
    if (poolDraw < 25) {
      setGrowthLock(true);
      setGrowthTarget('100');
    } else if (growthLock) {
      setGrowthTarget(Math.floor(poolDraw * 1.5));
    }
  }, [poolDraw, growthLock]);

  const requiredFlashbits = poolDraw;
  const requiredStablecoin = poolDraw;
  const stablecoinAddress = getStablecoinAddress(tokenChain);

  const handleSearchAndJoin = () => {
    if (!isConnected || !feesAccepted) return;
    setSearching(true);
    const fakePoolId = Math.floor(Math.random() * 10000);
    setAssignedPool({
      id: fakePoolId,
      membersNeeded: poolSize,
      currentMembers: 1,
      drawAmount: poolDraw,
    });
    setMembersJoined(1);
    setTimeout(() => setSearching(false), 800);
  };

  const handleConfirmAndPay = async () => {
    if (!walletClient || !address) return alert('Wallet not connected.');
    if (!stablecoinAddress) return alert('Stablecoin not mapped.');
    if (!feesAccepted) return alert('You must accept fee terms.');

    try {
      setConfirmingPayment(true);
      const stableAmount = parseUnits(poolDraw.toString(), 6);
      const flashAmount = parseUnits(poolDraw.toString(), 18);

      // 1. Approve stablecoin
      const stableAllowance = await publicClient.readContract({
        address: stablecoinAddress,
        abi: [
          {
            name: 'allowance',
            type: 'function',
            stateMutability: 'view',
            inputs: [
              { name: 'owner', type: 'address' },
              { name: 'spender', type: 'address' }
            ],
            outputs: [{ name: '', type: 'uint256' }]
          }
        ],
        functionName: 'allowance',
        args: [address, ROSCA_CONTRACT]
      });

      if (BigInt(stableAllowance) < stableAmount) {
        await walletClient.writeContract({
          address: stablecoinAddress,
          abi: [
            {
              name: 'approve',
              type: 'function',
              stateMutability: 'nonpayable',
              inputs: [
                { name: 'spender', type: 'address' },
                { name: 'amount', type: 'uint256' }
              ],
              outputs: [{ name: '', type: 'bool' }]
            }
          ],
          functionName: 'approve',
          args: [ROSCA_CONTRACT, stableAmount]
        });
      }

      // 2. Approve Flashbits (OAM)
      const flashAllowance = await publicClient.readContract({
        address: OAM_CONTRACT,
        abi: OamAbi,
        functionName: 'allowance',
        args: [address, ROSCA_CONTRACT]
      });

      if (BigInt(flashAllowance) < flashAmount) {
        await walletClient.writeContract({
          address: OAM_CONTRACT,
          abi: OamAbi,
          functionName: 'approve',
          args: [ROSCA_CONTRACT, flashAmount]
        });
      }

      // 3. Join Pool
      const parsedGrowth = growthLock ? parseUnits(growthTarget.toString(), 18) : 0n;

      await walletClient.writeContract({
        address: ROSCA_CONTRACT,
        abi: RoscaAbi,
        functionName: 'joinPool',
        args: [
          poolSize,
          poolDraw,
          stablecoinAddress,
          growthLock ? lockPercentage : 0,
          parsedGrowth
        ]
      });

      alert('Join request sent successfully!');
    } catch (err) {
      console.error(err);
      alert(`Join failed: ${err.message || 'Unknown error'}`);
    } finally {
      setConfirmingPayment(false);
    }
  };

  return (
    <div style={{ padding: '2rem', color: '#fff' }}>
      <div style={{ backgroundColor: '#111', padding: '2rem', borderRadius: '12px', boxShadow: '0 0 20px #00FFF0' }}>
        <h2 style={{ textAlign: 'center', color: '#00FFF0' }}>
          {isConnected ? "OAM Perfect Strangers ROSCA" : "OAM Rosca Perfect Strangers Public Pool Beta"}
        </h2>

        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <label>Accepted Token Types:</label><br />
          <select value={tokenChain} onChange={(e) => setTokenChain(e.target.value)}>
            <option value="USDC-ETH">USDC - Ethereum</option>
            <option value="USDC-Polygon">USDC - Polygon</option>
            <option value="USDT-ETH">USDT - Ethereum</option>
            <option value="USDT-Polygon">USDT - Polygon</option>
          </select>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <label>Pool Draw ($):</label><br />
          <select value={poolDraw} onChange={(e) => setPoolDraw(Number(e.target.value))}>
            {[5, 10, 15, 20, 25, 50, 75, 100, 125, 150, 175, 200, 225, 250].map(amount => (
              <option key={amount} value={amount}>${amount}</option>
            ))}
          </select>
          <div style={{ marginTop: '0.5rem', color: '#00FFF0' }}>
            Weekly Contribution: ${(poolDraw / poolSize).toFixed(2)} / week
            <br />
            Required Deposit: ${requiredStablecoin} + {requiredFlashbits} Flashbits
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <label>
            <input
              type="checkbox"
              checked={growthLock}
              onChange={(e) => setGrowthLock(e.target.checked)}
              disabled={poolDraw < 25}
            /> Enable Growth Lock?
          </label>
          {growthLock && (
            <div style={{ marginTop: '0.5rem' }}>
              <select value={lockPercentage} onChange={(e) => setLockPercentage(Number(e.target.value))}>
                <option value={5}>5%</option>
                <option value={10}>10%</option>
                <option value={15}>15%</option>
              </select>
              <div style={{ marginTop: '0.5rem' }}>
                Target Growth ($):
                <input
                  type="number"
                  value={growthTarget}
                  onChange={(e) => setGrowthTarget(e.target.value)}
                  style={{ marginLeft: '0.5rem', width: '100px' }}
                />
              </div>
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <label>Select Pool Size:</label><br />
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

        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <label>
            <input
              type="checkbox"
              checked={feesAccepted}
              onChange={(e) => setFeesAccepted(e.target.checked)}
            /> Accept 1% Treasury, 0.25% Pool & Global Lottery Fees
          </label>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {!isConnected ? (
            <MyStyledConnectButton />
          ) : (
            <button
              style={{
                backgroundColor: '#00FFF0',
                color: '#000',
                padding: '1rem 2rem',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer'
              }}
              onClick={handleSearchAndJoin}
              disabled={!feesAccepted}
            >
              {searching ? "Searching..." : "Search + Join Pool"}
            </button>
          )}
        </div>
      </div>

      {assignedPool && (
        <div style={{
          marginTop: '3rem',
          backgroundColor: '#222',
          padding: '2rem',
          borderRadius: '12px',
          border: '2px solid #00FFF0'
        }}>
          <h2>Assigned Pool #{assignedPool.id}</h2>
          <p>Pool Status: {membersJoined} of {assignedPool.membersNeeded} Members</p>
          <p>Weekly Contribution: ${(poolDraw / poolSize).toFixed(2)}</p>
          <p>Deposit Confirmed: ${requiredStablecoin} + {requiredFlashbits} Flashbits</p>
          <button
            style={{
              marginTop: '1rem',
              backgroundColor: '#00FFF0',
              color: '#000',
              padding: '1rem 2rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.1rem',
            }}
            onClick={handleConfirmAndPay}
            disabled={confirmingPayment}
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