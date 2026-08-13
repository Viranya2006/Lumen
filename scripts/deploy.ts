import hre from "hardhat";
const { ethers } = hre;
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("Deploying LumenMarketplace smart contract to network...");

  const [deployer] = await ethers.getSigners();
  console.log(`Deployer address: ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Deployer balance: ${ethers.formatEther(balance)} ETH`);

  const LumenMarketplaceFactory = await ethers.getContractFactory("LumenMarketplace");
  const marketplace = await LumenMarketplaceFactory.deploy();
  await marketplace.waitForDeployment();

  const contractAddress = await marketplace.getAddress();
  console.log(`LumenMarketplace deployed successfully to: ${contractAddress}`);

  // Export deployment info and ABI to lib/contract/
  const artifactDir = path.join(__dirname, "../lib/contract");
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  const contractArtifact = {
    address: contractAddress,
    network: "sepolia",
    chainId: 11155111,
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(artifactDir, "deployment.json"),
    JSON.stringify(contractArtifact, null, 2)
  );

  console.log(`Deployment info saved to ${path.join(artifactDir, "deployment.json")}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
