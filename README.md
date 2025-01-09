# Blockchain Interaction with Reputation System

This project is a blockchain-based application that implements a reputation system. Users can interact with smart contracts to provide feedback, view weighted scores, and transfer tokens. Admins have additional privileges, such as rewarding users with tokens, sending ETH, and penalizing users.

---

## Features

### User Functionalities
- **Connect Wallet**: Connect your Ethereum wallet to interact with the application.
- **Transfer Tokens**: Send MyToken to any Ethereum address.
- **Add Feedback**: Provide feedback for users, with scores ranging from 1 to 5.
- **Check Weighted Score**: View a user’s weighted reputation score based on their feedback.

### Admin Functionalities
- **Reward Users with Tokens**: Distribute tokens as rewards to users.
- **Send ETH**: Transfer Ether directly to a user’s wallet.
- **Penalize Users**: Add negative feedback to reduce a user’s reputation score.

### General Features
- **Role-Based Functionalities**: Admins and regular users are dynamically distinguished.
- **Session Persistence**: Wallet connection is maintained across page reloads.
- **Responsive UI**: Modern, user-friendly interface with a gray theme.

---

## Technologies Used

- **Solidity**: Smart contract development.
- **Hardhat**: Blockchain development environment for compiling, testing, and deploying contracts.
- **JavaScript & Ethers.js**: Frontend logic and blockchain interaction.
- **HTML/CSS**: User interface design and styling.

---

## Prerequisites

Ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** (Node Package Manager)
- **MetaMask** (or any Ethereum-compatible wallet)

Install **Hardhat** globally if not already installed:
```bash
npm install -g hardhat
