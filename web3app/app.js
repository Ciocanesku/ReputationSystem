import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js";

const contractAddresses = {
    MyToken: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    ReputationSystem: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
};

const abiMyToken = [
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)"
];

const abiReputationSystem = [
    "function getWeightedScore(address user) view returns (uint256)",
    "function addFeedback(address user, uint score)",
    "function penalizeUser(address user, uint score)",
    "function rewardUser(address user, uint amount)",
    "function sendRewardWithEth(address user) payable",
    "function owner() view returns (address)"
];

let provider, signer, myToken, reputationSystem, isAdmin = false;

async function checkAdminStatus() {
    try {
        const adminAddress = await reputationSystem.owner();
        const walletAddress = await signer.getAddress();
        isAdmin = adminAddress.toLowerCase() === walletAddress.toLowerCase();
    } catch (error) {
        isAdmin = false;
    }
}

function toggleFunctionalityVisibility() {
    const adminElements = document.querySelectorAll(".admin-only");
    const functionalitiesSection = document.getElementById("functionalities-section");

    adminElements.forEach(el => el.style.display = isAdmin ? "block" : "none");
    functionalitiesSection.style.display = "block";
    document.getElementById("connect-section").style.display = "none";
    document.getElementById("logoutWallet").style.display = "block";
}

async function updateConnectedUserBalance() {
    try {
        const walletAddress = await signer.getAddress();
        const balance = await myToken.balanceOf(walletAddress);
        document.getElementById("connectedTokenBalance").innerText = 
            `MyToken Balance: ${ethers.utils.formatUnits(balance, 18)} MYT`;
    } catch (error) {
        document.getElementById("connectedTokenBalance").innerText = "MyToken Balance: Error";
    }
}

document.getElementById("connectWallet").addEventListener("click", async () => {
    if (!window.ethereum) {
        alert("MetaMask is not installed!");
        return;
    }

    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();

    const walletAddress = await signer.getAddress();
    localStorage.setItem("connectedWallet", walletAddress); // Save to localStorage
    document.getElementById("walletInfo").innerText = `Wallet: ${walletAddress}`;

    const balance = await provider.getBalance(walletAddress);
    document.getElementById("walletBalance").innerText = `Balance: ${ethers.utils.formatEther(balance)} ETH`;

    // Initialize contracts
    myToken = new ethers.Contract(contractAddresses.MyToken, abiMyToken, signer);
    reputationSystem = new ethers.Contract(contractAddresses.ReputationSystem, abiReputationSystem, signer);

    console.log("Contracts connected:", { myToken, reputationSystem });

    // Update balance and visibility
    await updateConnectedUserBalance();
    await checkAdminStatus();
    toggleFunctionalityVisibility();
});

window.addEventListener("load", async () => {
    const savedWallet = localStorage.getItem("connectedWallet");
    if (savedWallet) {
        try {
            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();

            const walletAddress = await signer.getAddress();
            if (walletAddress.toLowerCase() === savedWallet.toLowerCase()) {
                document.getElementById("walletInfo").innerText = `Wallet: ${walletAddress}`;
                const balance = await provider.getBalance(walletAddress);
                document.getElementById("walletBalance").innerText = `Balance: ${ethers.utils.formatEther(balance)} ETH`;

                // Initialize contracts
                myToken = new ethers.Contract(contractAddresses.MyToken, abiMyToken, signer);
                reputationSystem = new ethers.Contract(contractAddresses.ReputationSystem, abiReputationSystem, signer);

                console.log("Contracts connected:", { myToken, reputationSystem });

                // Update balance and visibility
                await updateConnectedUserBalance();
                await checkAdminStatus();
                toggleFunctionalityVisibility();
            } else {
                localStorage.removeItem("connectedWallet"); // Remove if wallet mismatch
            }
        } catch (error) {
            console.error("Error reconnecting:", error);
            localStorage.removeItem("connectedWallet"); // Clear if an error occurs
        }
    }
});


document.getElementById("logoutWallet").addEventListener("click", () => {
    localStorage.removeItem("connectedWallet");
    document.getElementById("walletInfo").innerText = "Wallet: Not connected";
    document.getElementById("walletBalance").innerText = "Balance: 0 ETH";
    document.getElementById("connectedTokenBalance").innerText = "MyToken Balance: N/A";
    document.getElementById("functionalities-section").style.display = "none";
    document.getElementById("connect-section").style.display = "block";
    isAdmin = false;
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
        // Check if the user address is valid
        if (!ethers.utils.isAddress(userAddress)) {
            throw new Error("Invalid user address! Please enter a valid Ethereum address.");
        }

        // Ensure the contract is connected
        if (!reputationSystem) {
            throw new Error("Contract ReputationSystem is not connected!");
        }

        // Fetch the weighted score
        const score = await reputationSystem.getWeightedScore(userAddress);

        // Display the score
        document.getElementById("weightedScore").innerText = `Weighted Score: ${score.toString()}`;
    } catch (error) {
        // Handle case where no feedback is found
        if (error.reason && error.reason.includes("No feedback found for this user")) {
            document.getElementById("weightedScore").innerText = "Weighted Score: No feedback yet";
        } else {
            document.getElementById("weightedScore").innerText = `Error: ${error.message}`;
        }

        console.error("Error retrieving weighted score:", error);
    }
});


// Reward User with Tokens
document.getElementById("rewardTokens").addEventListener("click", async () => {
    const userAddress = document.getElementById("rewardUserAddress").value;
    const amount = document.getElementById("rewardAmount").value;

    try {
        if (!reputationSystem) {
            throw new Error("Contract ReputationSystem nu este conectat!");
        }
        if (!ethers.utils.isAddress(userAddress)) {
            throw new Error("Invalid user address! Please enter a valid Ethereum address.");
        }

        const tx = await reputationSystem.rewardUser(userAddress, ethers.utils.parseUnits(amount, 18));
        await tx.wait();
        document.getElementById("rewardStatus").innerText = "Tokens rewarded successfully!";
    } catch (error) {
        document.getElementById("rewardStatus").innerText = `Error: ${error.message}`;
        console.error("Error rewarding tokens:", error);
    }
});

// Send ETH
document.getElementById("sendEth").addEventListener("click", async () => {
    const userAddress = document.getElementById("ethUserAddress").value;
    const amount = document.getElementById("ethAmount").value;

    try {
        if (!reputationSystem) {
            throw new Error("Contract ReputationSystem nu este conectat!");
        }
        if (!ethers.utils.isAddress(userAddress)) {
            throw new Error("Invalid user address! Please enter a valid Ethereum address.");
        }

        const tx = await reputationSystem.sendRewardWithEth(userAddress, {
            value: ethers.utils.parseEther(amount),
        });
        await tx.wait();
        document.getElementById("ethStatus").innerText = "ETH sent successfully!";
    } catch (error) {
        document.getElementById("ethStatus").innerText = `Error: ${error.message}`;
        console.error("Error sending ETH:", error);
    }
});

// Penalize User
document.getElementById("penalizeUser").addEventListener("click", async () => {
    const userAddress = document.getElementById("penalizeUserAddress").value;
    const penaltyScore = document.getElementById("penaltyScore").value;

    try {
        if (!reputationSystem) {
            throw new Error("Contract ReputationSystem nu este conectat!");
        }
        if (!ethers.utils.isAddress(userAddress)) {
            throw new Error("Invalid user address! Please enter a valid Ethereum address.");
        }
        if (penaltyScore < 1 || penaltyScore > 5) {
            throw new Error("Penalty score must be between 1 and 5.");
        }

        const tx = await reputationSystem.penalizeUser(userAddress, penaltyScore);
        await tx.wait();
        document.getElementById("penaltyStatus").innerText = "User penalized successfully!";
    } catch (error) {
        document.getElementById("penaltyStatus").innerText = `Error: ${error.message}`;
        console.error("Error penalizing user:", error);
    }
});




