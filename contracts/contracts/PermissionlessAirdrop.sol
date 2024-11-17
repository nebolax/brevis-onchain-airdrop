// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./lib/BrevisAppZkOnly.sol";
import "./IERC20.sol";

contract PermissionlessAirdrop is BrevisAppZkOnly {
    bytes32 public immutable vkHash;
    address public immutable airdoppingToken;
    mapping(address => uint256) public issuedTokens;

    event Airdropped(address recipient, address token, uint256 amount);

    constructor(
        address _brevisRequest,
        bytes32 _vkHash,
        address _airdoppingToken
    ) BrevisAppZkOnly(_brevisRequest) {
        vkHash = _vkHash;
        airdoppingToken = _airdoppingToken;
    }

    function handleProofResult(bytes32 _vkHash, bytes calldata _circuitOutput) internal override {
        require(vkHash == _vkHash, "invalid vk");
        (
            address userAddr,
            uint256 transferCount,
            uint256 totalSent,
            uint256 earlisetTransferBlock
        ) = decodeOutput(_circuitOutput);

        // Calculate some airdrop-specific business logic.
        // Doing some random calculations here just to demonstrate the possibility of it.
        uint256 points = 0;
        if (transferCount < 3) points = transferCount;
        if (transferCount < 10) points = transferCount * 2;
        else points = transferCount * 4;

        if (totalSent < 10000000000000000000000) { // total sent < 10k
            points += 10;
        } else { // total sent > 10k
            points += 50;
        }

        if (earlisetTransferBlock < 20000000) { // started sending GHO earlier than Jun 1st 2024
            points += 100;
        }
        uint256 amount = points * 5 * 1000000000000000000;

        IERC20(airdoppingToken).transfer(userAddr, amount);
        emit Airdropped(userAddr, airdoppingToken, amount);    
    }

    function decodeOutput(bytes calldata o) internal pure returns (address, uint256, uint256, uint256) {
        address userAddr = address(bytes20(o[0:20]));
        uint256 transferCount = uint256(uint248(bytes31(o[20:51])));
        uint256 totalSent = uint256(uint248(bytes31(o[51:82])));
        uint256 earlisetTransferBlock = uint256(uint248(bytes31(o[82:113])));
        return (userAddr, transferCount, totalSent, earlisetTransferBlock);
    }
}
