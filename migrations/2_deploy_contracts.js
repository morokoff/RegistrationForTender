  
var RegistrationForTender = artifacts.require("./RegistrationForTender.sol");

module.exports = function(deployer) {
  deployer.deploy(RegistrationForTender);
};