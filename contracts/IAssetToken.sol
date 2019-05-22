pragma solidity ^0.5.5;

/**
 * @title AssetToken interface
 * @author Carlos Beltran <imthatcarlos@gmail.com>
 */
interface IAssetToken {
  function getCurrentValue() external view returns(uint);
  function getCurrentProfit() external view returns(uint);
  function getProjectedProfit() external view returns(uint);
  function claimFundsAndBurn() external;

  // compiler-generated getter methods
  function valuePerTokenCents() external view returns(uint value);
  function cap() external view returns(uint value);
  function totalSupply() external view returns(uint value);
  function timeframeMonths() external view returns(uint value);
  function projectedValueUSD() external view returns(uint);
  function valueUSD() external view returns(uint);
  function name() external view returns(string memory value);

  // openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol
  function mint(address to, uint256 tokenId) external returns (bool);

  // openzeppelin-solidity/contracts/token/ERC20/IERC20.sol
  function balanceOf(address who) external view returns (uint256);
  function transfer(address to, uint256 value) external returns (bool);
}
