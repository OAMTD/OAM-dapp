import { ethers } from 'ethers';
import erc20Abi from '../abi/erc20Abi.json';

export async function approveToken(signer, tokenAddress, contractAddress, amount) {
  const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, signer);
  const allowance = await tokenContract.allowance(await signer.getAddress(), contractAddress);
  if (allowance < amount) {
    const tx = await tokenContract.approve(contractAddress, amount);
    await tx.wait();
  }
}