pragma solidity ^0.5.5;

import "./../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol"; // need for tests

/**
 * @title StableToken
 * @author Carlos Beltran <imthatcarlos@gmail.com>
 */
contract StableToken is ERC20Mintable {
  string public name = "StableToken";
  string public symbol = "DAI";
  uint public decimals = 18;
}
