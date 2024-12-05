const hre = require("hardhat");
const fs = require("fs");

async function main() {
    const network = hre.network.name;
    console.log(`Deploying contracts to ${network} network...`);

    const initialTokenSupply = 1_000_000;

    // Deploy WeightedCalculator library
    console.log("Deploying WeightedCalculator...");
    const WeightedCalculator = await hre.ethers.getContractFactory("WeightedCalculator");
    const calculator = await WeightedCalculator.deploy();
    await calculator.waitForDeployment(); // Înlocuiește deployed() cu waitForDeployment()
    console.log("WeightedCalculator deployed to:", calculator.target);

    // Deploy MyToken
    console.log("Deploying MyToken...");
    const MyToken = await hre.ethers.getContractFactory("MyToken");
    const token = await MyToken.deploy(initialTokenSupply);
    await token.waitForDeployment(); // Înlocuiește deployed() cu waitForDeployment()
    console.log(`MyToken deployed to: ${token.target}, with initial supply: ${initialTokenSupply}`);

    // Deploy ReputationSystem
    console.log("Deploying ReputationSystem...");
    const ReputationSystem = await hre.ethers.getContractFactory("ReputationSystem", {
        libraries: {
            WeightedCalculator: calculator.target, // Folosește target pentru adresă
        },
    });

    const reputation = await ReputationSystem.deploy(token.target);
    await reputation.waitForDeployment(); // Înlocuiește deployed() cu waitForDeployment()
    console.log("ReputationSystem deployed to:", reputation.target);

    // Post-Deployment Verification
    console.log("Verifying contracts...");
    const totalSupply = await token.totalSupply();
    console.log("Total Supply of MyToken:", totalSupply.toString());

    const admin = (await hre.ethers.getSigners())[0];
    console.log(`Admin address: ${admin.address}`);

    // Save Deployment Info
    saveDeploymentInfo(network, {
        WeightedCalculator: calculator.target,
        MyToken: token.target,
        ReputationSystem: reputation.target,
    });

    console.log("Deployment complete!");
}

function saveDeploymentInfo(network, data) {
    const fileName = `deployments/${network}.json`;
    fs.mkdirSync("deployments", { recursive: true });
    fs.writeFileSync(fileName, JSON.stringify(data, null, 2));
    console.log(`Deployment info saved to ${fileName}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Deployment failed:", error);
        process.exit(1);
    });
