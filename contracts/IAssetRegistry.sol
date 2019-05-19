pragma solidity ^0.5.5;

/**
 * @title AssetRegistry interface
 * @author Carlos Beltran <imthatcarlos@gmail.com>
 */
interface IAssetRegistry {
  event AssetRecordCreated(address tokenAddress, address assetOwner, uint id);
  event AssetRecordUpdated(address indexed tokenAddress, uint id);
  event AssetFunded(uint id, address indexed tokenAddress);
  event AssetFullyInvested(address indexed tokenAddress, address investmentOwner);

  function setMainContractAddress(address _contractAddress) external;
  function addAsset(address payable _owner, string calldata _name, uint _valueUSD, uint _cap, uint _annualizedROI, uint _projectedValueUSD, uint _timeframeMonths, uint _valuePerTokenCents, string calldata _fileURL) external;
  function addAssetData(uint _id, string calldata _fileURL) external;
  function updateAssetLookup(address _tokenAddress, uint _remainingSupply, uint _tokensMinted) external returns(bool);
  function fundAsset(uint _amountStable, uint _assetId) external;
  function calculateTotalProjectedValue() external view returns(uint);
  function calculateTotalCurrentValue() external view returns(uint);
  function getAssetIdByToken(address _tokenAddress) external view returns(uint);
  function getActiveAssetIds() external view returns(uint[] memory);
  function getActiveAssetIdsOf(address _owner) external view returns(uint[] memory);
  function getAssetsCount() external view returns(uint);
  function getAssetById(uint _id) external view returns (address owner, address tokenAddress, bool filled, bool funded, string memory fileURL);
  function getFillableAssetAddressAt(uint _id) external view returns(address payable tokenAddress);

  // compiler-generated getter methods
  function fillableAssetsCount() external view returns(uint value);
  function minFillableAmount() external view returns(uint value);
}
