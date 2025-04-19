// utils/contractInfo.js
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
export const TREASURY_WALLET = process.env.NEXT_PUBLIC_TREASURY_WALLET;
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;

export const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS;
export const USDT_ADDRESS = process.env.NEXT_PUBLIC_USDT_ADDRESS;
export const WETH_ADDRESS = process.env.NEXT_PUBLIC_WETH_ADDRESS;


"use client";
import { useEffect, useState } from "react";
import { ethers, Contract } from "ethers";
import oamTokenAbi from "../abi/oamTokendao_abi.js";

export default function ContractInfo({ signer }) {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [totalSupply, setTotalSupply] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!signer || !process.env.NEXT_PUBLIC_CONTRACT_ADDRESS) return;

      try {
        const contract = new Contract(
          process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
          oamTokenAbi,
          signer
        );

        const name = await contract.name();
        const symbol = await contract.symbol();
        const supply = await contract.totalSupply();

        setName(name);
        setSymbol(symbol);
        setTotalSupply(ethers.formatUnits(supply, 18));
      } catch (err) {
        // Clean fail, optionally keep a silent fallback
      }
    };

    fetchData();
  }, [signer]);

  return (
    <div style={{ marginTop: "30px", color: "#00FFF0" }}>
      <h3>Contract Info</h3>
      <p><strong>Name:</strong> {name || "..."}</p>
      <p><strong>Symbol:</strong> {symbol || "..."}</p>
      <p><strong>Total Supply:</strong> {totalSupply || "..."} OAM</p>
    </div>
  );
}
