pragma solidity ^0.5.0;

contract RegistrationForTender {
  uint public companyCount = 0;

  struct Company {
    uint id;
    string name;
    bool completed;
  }

  mapping(uint => Company) public companies;

  event CompanyCreated(
    uint id,
    string name,
    bool completed
  );

  event CompanyCompleted(
    uint id,
    bool completed
  );

  constructor() public {
  }

  function createCompany(string memory _name) public {
    companyCount ++;
    companies[companyCount] = Company(companyCount, _name, false);
    emit CompanyCreated(companyCount, _name, false);
  }

  function toggleCompleted(uint _id) public {
    Company memory _company = companies[_id];
    _company.completed = !_company.completed;
    companies[_id] = _company;
    emit CompanyCompleted(_id, _company.completed);
  }

} 