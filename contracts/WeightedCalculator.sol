// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library WeightedCalculator {
    function calculateWeightedScore(uint[] memory scores, uint[] memory weights) public pure returns (uint) {
        require(scores.length > 0 && weights.length > 0, "Empty scores or weights array");

        uint totalScore = 0;
        uint totalWeight = 0;

        for (uint i = 0; i < scores.length; i++) {
            totalScore += scores[i] * weights[i];
            totalWeight += weights[i];
        }

        return totalWeight == 0 ? 0 : totalScore / totalWeight;
    }
}
