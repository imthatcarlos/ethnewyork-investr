export const shortAddress = (address) =>
  `${address.substring(0, 6)}...${address.substring(address.length - 6)}`;
