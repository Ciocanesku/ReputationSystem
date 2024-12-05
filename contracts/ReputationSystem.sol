// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./WeightedCalculator.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ReputationSystem is Ownable {
    struct Feedback {
        uint score;
        uint timestamp;
    }

    mapping(address => Feedback[]) public feedbacks;
    IERC20 public rewardToken;

    event FeedbackAdded(address indexed user, int score);
    event RewardPaid(address indexed user, uint amount);

    constructor(address _rewardToken) Ownable(msg.sender) {
        rewardToken = IERC20(_rewardToken);
    }

    modifier onlyAdmin() {
        require(msg.sender == owner(), "Only admin can call this function");
        _;
    }

    function addFeedback(address user, uint score) external {
        require(score > 0 && score <= 5, "Score must be between 1 and 5");
        feedbacks[user].push(Feedback(score, block.timestamp));
        emit FeedbackAdded(user, int(score));
    }

    function penalizeUser(address user, uint score) external onlyAdmin {
        require(score > 0 && score <= 5, "Score must be between 1 and 5");
        int negativeScore = int(score) * -1;
        feedbacks[user].push(Feedback(uint(-negativeScore), block.timestamp));
        emit FeedbackAdded(user, negativeScore);
    }

    function getWeightedScore(address user) public view returns (uint) {
    Feedback[] memory userFeedbacks = feedbacks[user];
    require(userFeedbacks.length > 0, "No feedback found for this user"); // Adaugă protecție

    uint[] memory scores = new uint[](userFeedbacks.length);
    uint[] memory weights = new uint[](userFeedbacks.length);

    for (uint i = 0; i < userFeedbacks.length; i++) {
        scores[i] = userFeedbacks[i].score;
        weights[i] = block.timestamp - userFeedbacks[i].timestamp + 1;
    }

    return WeightedCalculator.calculateWeightedScore(scores, weights);
}

    function rewardUser(address user, uint amount) external onlyAdmin {
        require(rewardToken.transfer(user, amount), "Transfer failed");
        emit RewardPaid(user, amount);
    }

    function sendRewardWithEth(address payable user) external payable {
        require(msg.value > 0, "No ETH sent");
        user.transfer(msg.value);
    }

    function calculateReward(uint baseAmount, uint multiplier) public pure returns (uint) {
        return baseAmount * multiplier;
    }
}
