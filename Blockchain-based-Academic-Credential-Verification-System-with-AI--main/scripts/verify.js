const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  
  console.log("Checking contract at:", contractAddress);
  
  // Get code at address
  const code = await ethers.provider.getCode(contractAddress);
  console.log("Contract code length:", code.length);
  
  if (code === "0x") {
    console.log("❌ No contract deployed at this address!");
    return;
  }
  
  // Try to get the contract
  const contract = await ethers.getContractAt("AcademicCredential", contractAddress);
  console.log("✅ Contract found!");
  
  try {
    const owner = await contract.owner();
    console.log("Contract owner:", owner);
  } catch (error) {
    console.log("❌ Error calling owner():", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
