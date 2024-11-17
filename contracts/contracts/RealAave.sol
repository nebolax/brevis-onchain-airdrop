// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract RealAave is ERC20 {
    constructor() ERC20("RealAave", "RLAAVE") {
        _mint(msg.sender, 1 << 255);
    }
}