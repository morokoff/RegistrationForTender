App = {
  loading: false,
  contracts: {},

  load: async () => {
    await App.loadWeb3()
    await App.loadAccount()
    await App.loadContract()
    await App.render()
  },

  // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
  loadWeb3: async () => {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider
      web3 = new Web3(web3.currentProvider)
    } else {
      window.alert("Please connect to Metamask.")
    }
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(ethereum)
      try {
        // Request account access if needed
        await ethereum.enable()
        // Acccounts now exposed
        web3.eth.sendTransaction({/* ... */})
      } catch (error) {
        // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = web3.currentProvider
      window.web3 = new Web3(web3.currentProvider)
      // Acccounts always exposed
      web3.eth.sendTransaction({/* ... */})
    }
    // Non-dapp browsers...
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  },

  loadAccount: async () => {
    // Set the current blockchain account
    App.account = web3.eth.accounts[0]
  },

  loadContract: async () => {
    // Create a JavaScript version of the smart contract
    const registrationForTender = await $.getJSON('RegistrationForTender.json')
    App.contracts.RegistrationForTender = TruffleContract(registrationForTender)
    App.contracts.RegistrationForTender.setProvider(App.web3Provider)

    // Hydrate the smart contract with values from the blockchain
    App.registrationForTender = await App.contracts.RegistrationForTender.deployed()
  },

  render: async () => {
    // Prevent double render
    if (App.loading) {
      return
    }

    // Update app loading state
    App.setLoading(true)

    // Render Account
    $('#account').html(App.account)

    // Render Tasks
    await App.renderCompanies()

    // Update loading state
    App.setLoading(false)
  },

  renderCompanies: async () => {
    // Load the total company count from the blockchain
    const companyCount = await App.registrationForTender.companyCount()
    const $companyTemplate = $('.companyTemplate')

    // Render out each company with a new template
    for (var i = 1; i <= companyCount; i++) {
      // Fetch the company data from the blockchain
      const company = await App.registrationForTender.companies(i)
      const companyId = company[0].toNumber()
      const companyContent = company[1]
      const companyCompleted = company[2]

      // Create the html for the company
      const $newCompanyTemplate = $companyTemplate.clone()
      $newCompanyTemplate.find('.content').html(companyContent)
      $newCompanyTemplate.find('input')
                      .prop('name', companyId)
                      .prop('checked', companyCompleted)
                      .on('click', App.toggleCompleted)

      // Put the company in the correct list
      if (companyCompleted) {
        $('#completedRegistrationForTender').append($newCompanyTemplate)
      } else {
        $('#registrationForTender').append($newCompanyTemplate)
      }

      // Show the company
      $newCompanyTemplate.show()
    }
  },

  createCompany: async () => {
    App.setLoading(true)
    const content = $('#newCompany').val()
    await App.registrationForTender.createCompany(content)
    window.location.reload()
  },

  toggleCompleted: async (e) => {
    App.setLoading(true)
    const companyId = e.target.name
    await App.registrationForTender.toggleCompleted(companyId)
    window.location.reload()
  },

  setLoading: (boolean) => {
    App.loading = boolean
    const loader = $('#loader')
    const content = $('#content')
    if (boolean) {
      loader.show()
      content.hide()
    } else {
      loader.hide()
      content.show()
    }
  }
}

$(() => {
  $(window).load(() => {
    App.load()
  })
})