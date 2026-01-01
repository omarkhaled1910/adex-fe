const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const AdExchange = await ethers.getContractFactory("AdExchange");
  // The EIP712 constructor arguments
  const name = "AdExchange";
  const version = "1";
  const adExchange = await AdExchange.deploy(name, version);

  await adExchange.deployed();

  console.log("AdExchange deployed to:", adExchange.address);

  // Save contract address to a file and update .env.local
  const contractData = {
    address: adExchange.address,
    abi: JSON.parse(adExchange.interface.format('json'))
  };
  
  const artifactsPath = path.join(__dirname, '..', 'artifacts', 'contracts');
  if (!fs.existsSync(artifactsPath)) {
      fs.mkdirSync(artifactsPath, { recursive: true });
  }
  fs.writeFileSync(
    path.join(artifactsPath, 'AdExchange.json'),
    JSON.stringify(contractData, null, 2)
  );

  // Update .env.local
  const envPath = path.join(__dirname, '..', '.env.local');
  let envFileContent = fs.readFileSync(envPath, 'utf8');
  
  const contractAddressRegex = /CONTRACT_ADDRESS=.*/g;
  const nextPublicContractAddressRegex = /NEXT_PUBLIC_CONTRACT_ADDRESS=.*/g;

  if (contractAddressRegex.test(envFileContent)) {
    envFileContent = envFileContent.replace(contractAddressRegex, `CONTRACT_ADDRESS=${adExchange.address}`);
  } else {
    envFileContent += `\nCONTRACT_ADDRESS=${adExchange.address}`;
  }

  if (nextPublicContractAddressRegex.test(envFileContent)) {
    envFileContent = envFileContent.replace(nextPublicContractAddressRegex, `NEXT_PUBLIC_CONTRACT_ADDRESS=${adExchange.address}`);
  } else {
    envFileContent += `\nNEXT_PUBLIC_CONTRACT_ADDRESS=${adExchange.address}`;
  }

  fs.writeFileSync(envPath, envFileContent);
  console.log('✅ Updated .env.local with new contract address.');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });