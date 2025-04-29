import { ethers } from "ethers";
import { Web3Provider } from "@ethersproject/providers";
import BlindRoscaABI from "../../abi/BlindRoscaABI";

const roscaAddress = process.env.NEXT_PUBLIC_ROSCA_PROXY_ADDRESS; // From your env
const ADMIN_ADDRESS = "0x1399eF43A3a51Bf146DD35Be2180d476b5D50fAa"; // <<< PLACE YOUR ADMIN WALLET HERE

export default function AddStablecoin() {
  async function addStablecoin() {
    if (!window.ethereum) {
      alert("Connect wallet first!");
      return;
    }

    const provider = new Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const userAddress = await signer.getAddress();

    // ADMIN CHECK
    if (userAddress.toLowerCase() !== ADMIN_ADDRESS.toLowerCase()) {
      alert("You are not authorized to perform this action.");
      return;
    }

    const rosca = new ethers.Contract(roscaAddress, BlindRoscaABI, signer);

    const stablecoinAddress = prompt("Paste the stablecoin address (example: USDC address)");
    if (!stablecoinAddress) {
      alert("No address entered");
      return;
    }

    try {
      const tx = await rosca.addStablecoin(stablecoinAddress);
      alert("Transaction sent. Waiting confirmation...");
      await tx.wait();
      alert(`Stablecoin ${stablecoinAddress} successfully added.`);
    } catch (error) {
      console.error(error);
      alert("Error adding stablecoin." + (error?.reason || error?.message || "Unknwon error"));
    }
  }

  return (
    <div>
      <button onClick={addStablecoin}>Add Stablecoin (Admin Only)</button>
    </div>
  );
}