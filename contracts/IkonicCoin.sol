// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";

contract IkonicCoin is ERC20PresetMinterPauser {
    constructor() ERC20PresetMinterPauser("Ikonic Mock", "IKON") {
        mint(address(this), 1000000 ether);
    }
}