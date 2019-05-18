const Main = artifacts.require("./Main");
const AssetRegistry = artifacts.require("./AssetRegistry");
const StableToken = artifacts.require("./StableToken");

var fs = require("fs");
var path = require("path");

module.exports = function(deployer, _network, _accounts) {
  var networkIdx = process.argv.indexOf("--network");
  var network = networkIdx != -1 ? process.argv[networkIdx + 1] : "development"

  var filePath = path.join(__dirname, "./../contracts.json");
  var data = JSON.parse(fs.readFileSync(filePath, "utf8"));

  // deploy contract
  deployer.deploy(StableToken).then(() => {
    return deployer.deploy(Main, StableToken.address).then((main) => {
      return deployer.deploy(AssetRegistry, StableToken.address, Main.address).then(() => {
        data[network]["Main"] = Main.address;
        data[network]["AssetRegistry"] = AssetRegistry.address;
        data[network]["StableToken"] = StableToken.address;

        var json = JSON.stringify(data);
        fs.writeFileSync(filePath, json, "utf8");

        // write to src/ directory as well
        const srcFilePath = path.join(__dirname, "./../src/json/contracts.json");
        fs.writeFileSync(srcFilePath, json, "utf8");

        // for ref
        main.setAssetRegistry(AssetRegistry.address);
      });
    });
  });
};
