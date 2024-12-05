const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ReputationSystem", function () {
    let MyToken, ReputationSystem, WeightedCalculator, token, reputation, calculator, owner, addr1, addr2;

    beforeEach(async function () {
        // Deploy WeightedCalculator library
        WeightedCalculator = await ethers.getContractFactory("WeightedCalculator");
        calculator = await WeightedCalculator.deploy();
        await calculator.waitForDeployment();
        console.log("WeightedCalculator deployed at:", calculator.target);

        // Deploy MyToken
        MyToken = await ethers.getContractFactory("MyToken");
        token = await MyToken.deploy(1000000);
        await token.waitForDeployment();

        // Deploy ReputationSystem with linked library
        const ReputationSystemFactory = await ethers.getContractFactory("ReputationSystem", {
            libraries: {
                WeightedCalculator: calculator.target,
            },
        });
        reputation = await ReputationSystemFactory.deploy(token.target);
        await reputation.waitForDeployment();

        [owner, addr1, addr2] = await ethers.getSigners();
    });

    it("Should add feedback and retrieve weighted score", async function () {
        await reputation.addFeedback(addr1.address, 5);
        const weightedScore = await reputation.getWeightedScore(addr1.address);
        expect(weightedScore).to.equal(5);
    });

    it("Should reward a user with tokens", async function () {
        await token.transfer(reputation.target, 100);
        await reputation.rewardUser(addr1.address, 50);
        const balance = await token.balanceOf(addr1.address);
        expect(balance).to.equal(50);
    });

    it("Should send ETH to a user", async function () {
        const tx = await reputation.sendRewardWithEth(addr1.address, { value: ethers.parseEther("0.01") });
        await tx.wait();
        const balance = await ethers.provider.getBalance(addr1.address);
        expect(balance).to.be.above(ethers.parseEther("0.01"));
    });

    it("Should execute all functionalities in a single flow", async function () {
        // 1. Adaugă feedback pentru un utilizator
        await reputation.addFeedback(addr1.address, 5);
        await reputation.addFeedback(addr1.address, 3);
    
        // Verifică dacă feedback-ul a fost adăugat corect
        const weightedScore1 = await reputation.getWeightedScore(addr1.address);
        console.log("Weighted Score after feedback:", weightedScore1.toString());
        expect(weightedScore1).to.be.above(0);
    
        // 2. Penalizează utilizatorul
        await reputation.penalizeUser(addr1.address, 2);
    
        // Verifică scorul ponderat după penalizare
        const weightedScore2 = await reputation.getWeightedScore(addr1.address);
        console.log("Weighted Score after penalty:", weightedScore2.toString());
        expect(weightedScore2).to.be.lessThan(weightedScore1);
    
        // 3. Recompensează utilizatorul cu token-uri
        await token.transfer(reputation.target, 200); // Alocă token-uri contractului
        await reputation.rewardUser(addr1.address, 100);
    
        // Verifică balanța de token-uri a utilizatorului
        const tokenBalance = await token.balanceOf(addr1.address);
        console.log("Token Balance after reward:", tokenBalance.toString());
        expect(tokenBalance).to.equal(100);
    
        // 4. Trimite ETH utilizatorului
        const initialBalance = await ethers.provider.getBalance(addr1.address);
        const tx = await reputation.sendRewardWithEth(addr1.address, { value: ethers.parseEther("0.02") });
        await tx.wait();
    
        // Verifică balanța utilizatorului după transferul de ETH
        const finalBalance = await ethers.provider.getBalance(addr1.address);
        console.log("ETH Balance after reward:", ethers.formatEther(finalBalance));
        expect(finalBalance).to.be.above(initialBalance);
    });
});
