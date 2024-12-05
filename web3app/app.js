import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js";

const contractAddresses = {
    MyToken: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", // Adresa MyToken
    ReputationSystem: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0" // Adresa ReputationSystem
};

const abiMyToken = [
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)"
];

const abiReputationSystem = [
    "function getWeightedScore(address user) view returns (uint256)",
    "function addFeedback(address user, uint score)"
];

let provider, signer, myToken, reputationSystem;

// Conectare wallet
document.getElementById("connectWallet").addEventListener("click", async () => {
    if (!window.ethereum) {
        alert("MetaMask is not installed!");
        return;
    }

    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();

    const walletAddress = await signer.getAddress();
    document.getElementById("walletInfo").innerText = `Wallet: ${walletAddress}`;

    const balance = await provider.getBalance(walletAddress);
    document.getElementById("walletBalance").innerText = `Balance: ${ethers.utils.formatEther(balance)} ETH`;

    // Inițializare contracte
    myToken = new ethers.Contract(contractAddresses.MyToken, abiMyToken, signer);
    reputationSystem = new ethers.Contract(contractAddresses.ReputationSystem, abiReputationSystem, signer);

    console.log("Contracts connected:", { myToken, reputationSystem });
});


// Send Tokens
document.getElementById("sendTokens").addEventListener("click", async () => {
    const recipient = document.getElementById("recipient").value;
    const amount = document.getElementById("amount").value;

    try {
        if (!myToken) {
            throw new Error("Contract MyToken nu este conectat!");
        }

        if (!ethers.utils.isAddress(recipient)) {
            throw new Error("Recipient address is invalid!");
        }

        const tx = await myToken.transfer(recipient, ethers.utils.parseUnits(amount, 18));
        await tx.wait();
        document.getElementById("transactionStatus").innerText = "Tokens sent successfully!";
    } catch (error) {
        document.getElementById("transactionStatus").innerText = `Error: ${error.message}`;
        console.error("Error sending tokens:", error);
    }
});

// Add Feedback
document.getElementById("addFeedback").addEventListener("click", async () => {
    const userAddress = document.getElementById("feedbackUser").value;
    const score = document.getElementById("feedbackScore").value;

    try {
        if (!reputationSystem) {
            throw new Error("Contract ReputationSystem nu este conectat!");
        }
        if (score < 1 || score > 5) {
            throw new Error("Score must be between 1 and 5");
        }

        const tx = await reputationSystem.addFeedback(userAddress, score);
        await tx.wait();
        document.getElementById("feedbackStatus").innerText = "Feedback added successfully!";
    } catch (error) {
        document.getElementById("feedbackStatus").innerText = `Error: ${error.message}`;
        console.error("Error adding feedback:", error);
    }
});

// Get Weighted Score
document.getElementById("getScore").addEventListener("click", async () => {
    const userAddress = document.getElementById("userAddress").value;

    try {
        if (!ethers.utils.isAddress(userAddress)) {
            throw new Error("Invalid user address! Please enter a valid Ethereum address.");
        }

        if (!reputationSystem) {
            throw new Error("Contract ReputationSystem nu este conectat!");
        }

        const score = await reputationSystem.getWeightedScore(userAddress);
        document.getElementById("weightedScore").innerText = `Weighted Score: ${score.toString()}`;
    } catch (error) {
        document.getElementById("weightedScore").innerText = `Error: ${error.message}`;
        console.error("Error retrieving weighted score:", error);
    }
});
