pragma solidity ^0.5.5;

import "./../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./../node_modules/openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "./../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./IAssetToken.sol";
import "./IAssetRegistry.sol";
import "./StableToken.sol";

/**
 * @title Main
 *
 * @author Carlos Beltran <imthatcarlos@gmail.com>
 */
contract Main is Ownable, Pausable {
  using SafeMath for uint;

  event InvestmentRecordCreated(address indexed tokenAddress, address investmentOwner, uint id);

  enum TokenType { Asset, NFT }

  struct Investment {
    TokenType tokenType;
    address owner;
    address tokenAddress;
    uint amountDAI;
    uint amountTokens;
    uint createdAt;
    uint timeframeMonths;
  }

  uint public VALUE_PER_VT_TOKENS_CENTS = 10;

  StableToken private stableToken;
  IAssetRegistry private assetRegistry;

  Investment[] private investments;
  mapping (address => uint[]) private activeInvestmentIds;

  modifier hasActiveInvestment() {
    require(activeInvestmentIds[msg.sender].length != 0, "must have an active investment");
    _;
  }

  modifier validInvestment(uint _id) {
    require(investments[_id].owner != address(0));
    _;
  }

  /**
   * Contract constructor
   * @param _stableTokenAddress Address of T token
   */
  constructor(address _stableTokenAddress) public {
    stableToken = StableToken(_stableTokenAddress);

    // take care of zero-index for storage arrays
    investments.push(Investment({
      tokenType: TokenType.Asset,
      owner: address(0),
      tokenAddress: address(0),
      amountDAI: 0,
      amountTokens: 0,
      createdAt: 0,
      timeframeMonths: 0
    }));
  }

  /**
   * Sets this contract's reference to AssetRegistry contract
   * @param _contractAddress Address of AssetRegistry
   */
  function setAssetRegistry(address _contractAddress) public onlyOwner {
    assetRegistry = IAssetRegistry(_contractAddress);
  }

  /**
   * Allows the sender to invest in the Asset represented by the AssetToken with the given address
   * NOTE: The sender must have approved the transfer of DAI to this contract
   * @param _amountStable Amount of DAI the sender is investing
   * @param _tokenAddress Address of the AssetToken contract
   */
  function invest(uint _amountStable, address payable _tokenAddress) public {
    IAssetToken tokenContract = IAssetToken(_tokenAddress);

    // total amount of tokens to mint for the sender
    uint amountTokens = _amountStable.div(tokenContract.valuePerTokenCents());

    // sanity check, make sure we don't overflow
    require(tokenContract.cap() >= tokenContract.totalSupply().add(amountTokens));

    // add to storage
    _createInvestmentRecord(
      TokenType.Asset,
      _amountStable,
      amountTokens,
      _tokenAddress,
      tokenContract.timeframeMonths()
    );

    // transfer the DAI tokens to the VT token contract
    require(stableToken.transferFrom(msg.sender, _tokenAddress, _amountStable));

    // mint VT tokens for them
    tokenContract.mint(msg.sender, amountTokens);

    // update our records of token supplies
    uint remainingSupply = tokenContract.cap().sub(tokenContract.totalSupply());
    assetRegistry.updateAssetLookup(_tokenAddress, remainingSupply, amountTokens);
  }

  /**
   * Returns the ids of all the sender's active assets
   */
  function getActiveInvestmentIds() public hasActiveInvestment view returns(uint[] memory) {
    return activeInvestmentIds[msg.sender];
  }

  /**
   * Returns the ids of all the given accounts's active investments
   * NOTE: can only be called by contract owner
   * @param _owner Owner address of assets
   */
  function getActiveInvestmentIdsOf(address _owner) public view onlyOwner returns(uint[] memory) {
    return activeInvestmentIds[_owner];
  }

  /**
   * Returns the number of active investments
   */
  function getInvestmentsCount() public view returns(uint) {
    return investments.length - 1; // ignoring first one created at init
  }

  /**
   * Returns details of the Investment with the given id
   * @param _id Investment id
   */
  function getInvestmentById(uint _id) public view validInvestment(_id)
    returns (
      TokenType tokenType,
      address owner,
      address tokenAddress,
      uint amountDAI,
      uint amountTokens,
      uint createdAt,
      uint timeframeMonths
    )
  {
    Investment storage inv = investments[_id];

    tokenType = inv.tokenType;
    owner = inv.owner;
    tokenAddress = inv.tokenAddress;
    amountDAI = inv.amountDAI;
    amountTokens = inv.amountTokens;
    createdAt = inv.createdAt;
    timeframeMonths = inv.timeframeMonths;
  }

  /**
   * Creates an Investment record and adds it to storage
   * @param _amountDAI Amount of DAI tokens invested
   * @param _amountTokens Amount of tokens minted in the VT token contract
   @ @param _tokenAddress Address of VT token contract
   @ param _timeframeMonths timeframe to be sold (months)
   */
  function _createInvestmentRecord(
    TokenType _tokenType,
    uint _amountDAI,
    uint _amountTokens,
    address _tokenAddress,
    uint _timeframeMonths
  ) internal {
    Investment memory record = Investment({
      tokenType: _tokenType,
      owner: msg.sender,
      tokenAddress: _tokenAddress,
      amountDAI: _amountDAI,
      amountTokens: _amountTokens,
      createdAt: block.timestamp,
      timeframeMonths: _timeframeMonths
    });

    // add the record to the storage array and push the index to the hashmap
    uint id = investments.push(record) - 1;
    activeInvestmentIds[msg.sender].push(id);

    emit InvestmentRecordCreated(_tokenAddress, msg.sender, id);
  }
}
