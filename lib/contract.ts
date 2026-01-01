import { ethers } from 'ethers';
import { toast } from '@/hooks/use-toast';

// The ABI is loaded from the deployment script's output
import contractArtifact from '@/artifacts/contracts/AdExchange.json';

const getEthereum = () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
        return (window as any).ethereum;
    }
    return null;
};

const getProvider = () => {
    const ethereum = getEthereum();
    if (ethereum) {
        return new ethers.providers.Web3Provider(ethereum);
    }
    return null;
};

const getSigner = () => {
    const provider = getProvider();
    if (provider) {
        return provider.getSigner();
    }
    return null;
};

const getContract = () => {
    const signer = getSigner();
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    if (signer && contractAddress) {
        return new ethers.Contract(contractAddress, contractArtifact.abi, signer);
    }
    return null;
};

export const connectWallet = async () => {
    const ethereum = getEthereum();
    if (!ethereum) {
        toast({ title: "MetaMask not detected", description: "Please install MetaMask to use this feature." });
        return null;
    }
    try {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        return accounts[0];
    } catch (error) {
        toast({ title: "Wallet connection failed", description: "You must connect your wallet to proceed." });
        return null;
    }
};

export const addLocalNetwork = async () => {
    const ethereum = getEthereum();
    if (!ethereum) return;

    try {
        await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
                chainId: `0x${Number(process.env.NEXT_PUBLIC_CHAIN_ID).toString(16)}`,
                chainName: 'Hardhat Localhost',
                nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['http://127.0.0.1:8545'],
            }],
        });
    } catch (error) {
        console.error("Failed to add local network to MetaMask:", error);
    }
};

export const deposit = async (amount: string) => {
    const contract = getContract();
    if (!contract) return;
    const value = ethers.utils.parseEther(amount);
    const tx = await contract.deposit({ value });
    await tx.wait();
};

export const withdraw = async (amount: string) => {
    const contract = getContract();
    if (!contract) return;
    const value = ethers.utils.parseEther(amount);
    const tx = await contract.withdraw(value);
    await tx.wait();
};

export const getBalance = async (address: string) => {
    const contract = getContract();
    if (!contract) return '0';
    const balance = await contract.getBalance(address);
    return ethers.utils.formatEther(balance);
};

export const settleAuction = async (settlement: any) => {
    const contract = getContract();
    if (!contract) return;

    const { signature, ...settlementData } = settlement;

    const txData = {
      ...settlementData,
      amount: ethers.utils.parseUnits(settlement.amount.toString(), 'ether'),
    }

    const tx = await contract.settleAuction(txData, signature);
    await tx.wait();
};