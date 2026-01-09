"use client";

import { ethers } from "ethers";

// AdExchange ABI (simplified for frontend)
export const AD_EXCHANGE_ABI = [
  "function depositAsAdvertiser() external payable",
  "function registerAsPublisher() external",
  "function settleBid((address advertiser, address publisher, uint256 amount, uint256 impressionId, uint256 deadline) settlement, bytes signature) external",
  "function withdrawPublisher(uint256 amount) external",
  "function withdrawAdvertiser(uint256 amount) external",
  "function getAdvertiser(address addr) external view returns (uint256 balance, uint256 totalSpent, uint256 totalImpressions, bool registered)",
  "function getPublisher(address addr) external view returns (uint256 balance, uint256 totalEarned, uint256 totalImpressions, bool registered)",
  "function getPlatformStats() external view returns (uint256 totalVolume, uint256 totalSettlements, uint256 platformFeePercent)",
  "function getDomainSeparator() external view returns (bytes32)",
  "event AdvertiserDeposit(address indexed advertiser, uint256 amount, uint256 newBalance)",
  "event BidSettled(address indexed advertiser, address indexed publisher, uint256 amount, uint256 impressionId, uint256 platformFee)",
];

const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export interface AdvertiserInfo {
  balance: bigint;
  totalSpent: bigint;
  totalImpressions: bigint;
  registered: boolean;
}

export interface PublisherInfo {
  balance: bigint;
  totalEarned: bigint;
  totalImpressions: bigint;
  registered: boolean;
}

export interface PlatformStats {
  totalVolume: bigint;
  totalSettlements: bigint;
  platformFeePercent: bigint;
}

export async function getProvider(): Promise<
  ethers.providers.Web3Provider | ethers.providers.JsonRpcProvider
> {
  if (typeof window !== "undefined" && (window as any).ethereum) {
    return new ethers.providers.Web3Provider((window as any).ethereum);
  }
  // Fallback to local node
  return new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
}

export async function getSigner(): Promise<ethers.Signer> {
  const provider = await getProvider();
  if (provider instanceof ethers.providers.Web3Provider) {
    await provider.send("eth_requestAccounts", []);
    return provider.getSigner();
  }
  // For local development, use first account
  return (provider as ethers.providers.JsonRpcProvider).getSigner();
}

export async function getContract(
  withSigner = false
): Promise<ethers.Contract> {
  const provider = await getProvider();
  if (withSigner) {
    const signer = await getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, AD_EXCHANGE_ABI, signer);
  }
  return new ethers.Contract(CONTRACT_ADDRESS, AD_EXCHANGE_ABI, provider);
}

export async function depositAsAdvertiser(
  amountInEther: string
): Promise<ethers.providers.TransactionReceipt> {
  const contract = await getContract(true);
  const tx = await contract.depositAsAdvertiser({
    value: ethers.utils.parseEther(amountInEther),
  });
  return tx.wait();
}

export async function registerAsPublisher(): Promise<ethers.providers.TransactionReceipt> {
  const contract = await getContract(true);
  const tx = await contract.registerAsPublisher();
  return tx.wait();
}

export async function getAdvertiserInfo(
  address: string
): Promise<AdvertiserInfo> {
  const contract = await getContract();
  const [balance, totalSpent, totalImpressions, registered] =
    await contract.getAdvertiser(address);
  return { balance, totalSpent, totalImpressions, registered };
}

export async function getPublisherInfo(
  address: string
): Promise<PublisherInfo> {
  const contract = await getContract();
  const [balance, totalEarned, totalImpressions, registered] =
    await contract.getPublisher(address);
  return { balance, totalEarned, totalImpressions, registered };
}

export async function getPlatformStats(): Promise<PlatformStats> {
  const contract = await getContract();
  const [totalVolume, totalSettlements, platformFeePercent] =
    await contract.getPlatformStats();
  return { totalVolume, totalSettlements, platformFeePercent };
}

export async function withdrawAdvertiser(
  amountInEther: string
): Promise<ethers.providers.TransactionReceipt> {
  const contract = await getContract(true);
  const tx = await contract.withdrawAdvertiser(
    ethers.utils.parseEther(amountInEther)
  );
  return tx.wait();
}

export async function withdrawPublisher(
  amountInEther: string
): Promise<ethers.providers.TransactionReceipt> {
  const contract = await getContract(true);
  const tx = await contract.withdrawPublisher(ethers.utils.parseEther(amountInEther));
  return tx.wait();
}

// EIP-712 Signature for off-chain settlement
export async function signSettlement(
  advertiserAddress: string,
  publisherAddress: string,
  amount: bigint,
  impressionId: bigint,
  deadline: bigint
): Promise<string> {
  const signer = await getSigner();

  const domain = {
    name: "AdExchange",
    version: "1",
    chainId: 31337, // Hardhat chain ID
    verifyingContract: CONTRACT_ADDRESS,
  };

  const types = {
    BidSettlement: [
      { name: "advertiser", type: "address" },
      { name: "publisher", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "impressionId", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  };

  const value = {
    advertiser: advertiserAddress,
    publisher: publisherAddress,
    amount,
    impressionId,
    deadline,
  };

  return (signer as ethers.Signer & { _signTypedData: Function })._signTypedData(
    domain,
    types,
    value
  );
}
