import Web3 from "web3";
import supplyChainArtifact from "../../build/contracts/SupplyChain.json";
//var Web3 = require("web3");

const App = {
    //web3Provider: null,    
    contracts: {},
    emptyAddress: "0x0000000000000000000000000000000000000000",
    //account: "0x0000000000000000000000000000000000000000",
    sku: 0,
    upc: 0,
    metamaskAccountID: "0x0000000000000000000000000000000000000000",
    ownerID: "0x0000000000000000000000000000000000000000",
    originFarmerID: "0x0000000000000000000000000000000000000000",
    originFarmName: null,
    originFarmInformation: null,
    originFarmLatitude: null,
    originFarmLongitude: null,
    productNotes: null,
    productPrice: 0,
    distributorID: "0x0000000000000000000000000000000000000000",
    retailerID: "0x0000000000000000000000000000000000000000",
    consumerID: "0x0000000000000000000000000000000000000000",
    
    init: async function () {        
        App.readForm();
        /// Setup access to blockchain
        //return await App.initWeb3();
        //const { web3 } = this;
        try {
            // get contract instance
            const networkId = await this.web3.eth.net.getId();
            const deployedNetwork = supplyChainArtifact.networks[networkId];
            this.contracts.SupplyChain = new this.web3.eth.Contract(
                supplyChainArtifact.abi,
                deployedNetwork.address,
            );
            
            // get accounts
            const accounts = await this.web3.eth.getAccounts();
            this.metamaskAccountID = accounts[0];
          } catch (error) {
            console.error("Could not connect to contract or chain.");
        }
        
        console.log(`current account: ${this.account}`)
        App.bindEvents()   
        App.fetchEvents()     
        App.fetchItemBufferOne();
        App.fetchItemBufferTwo();
    },

    readForm: function () {
        App.sku = $("#sku").val();
        App.upc = $("#upc").val();
        App.ownerID = $("#ownerID").val();
        App.originFarmerID = $("#originFarmerID").val();
        App.originFarmName = $("#originFarmName").val();
        App.originFarmInformation = $("#originFarmInformation").val();
        App.originFarmLatitude = $("#originFarmLatitude").val();
        App.originFarmLongitude = $("#originFarmLongitude").val();
        App.productNotes = $("#productNotes").val();
        App.productPrice = $("#productPrice").val();
        App.distributorID = $("#distributorID").val();
        App.retailerID = $("#retailerID").val();
        App.consumerID = $("#consumerID").val();

        console.log(
            App.sku,
            App.upc,
            App.ownerID, 
            App.originFarmerID, 
            App.originFarmName, 
            App.originFarmInformation, 
            App.originFarmLatitude, 
            App.originFarmLongitude, 
            App.productNotes, 
            App.productPrice, 
            App.distributorID, 
            App.retailerID, 
            App.consumerID
        );
    },
    
    getMetaskAccountID: function () {        
        return async function getAccount() {
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            const account = accounts[0];
            return account
          }()
    },
    /*
    initSupplyChain: function () {
        /// Source the truffle compiled smart contracts
        var jsonSupplyChain='../../build/contracts/SupplyChain.json';
        
        /// JSONfy the smart contracts
        $.getJSON(jsonSupplyChain, function(data) {
            console.log('data',data);
            var SupplyChainArtifact = data;
            App.contracts.SupplyChain = TruffleContract(SupplyChainArtifact);
            App.contracts.SupplyChain.setProvider(App.web3Provider);
            
            App.fetchItemBufferOne();
            App.fetchItemBufferTwo();
            App.fetchEvents();

        });

        return App.bindEvents();
    },
    */
    bindEvents: function() {
        $(document).on('click', App.handleButtonClick);
    },

    handleButtonClick: async function(event) {
        event.preventDefault();

        //App.getMetaskAccountID();

        var processId = parseInt($(event.target).data('id'));
        console.log('processId',processId);

        switch(processId) {
            case 1:
                return await App.harvestItem(event);
                break;
            case 2:
                return await App.processItem(event);
                break;
            case 3:
                return await App.packItem(event);
                break;
            case 4:
                return await App.sellItem(event);
                break;
            case 5:
                return await App.buyItem(event);
                break;
            case 6:
                return await App.shipItem(event);
                break;
            case 7:
                return await App.receiveItem(event);
                break;
            case 8:
                return await App.purchaseItem(event);
                break;
            case 9:
                return await App.fetchItemBufferOne(event);
                break;
            case 10:
                return await App.fetchItemBufferTwo(event);
                break;
            }
    },

    harvestItem: function(event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.methods.harvestItem(
            App.upc,
            App.metamaskAccountID, 
            App.originFarmName, 
            App.originFarmInformation, 
            App.originFarmLatitude, 
            App.originFarmLongitude, 
            App.productNotes
            ).send({from: App.metamaskAccountID}).then((res) => {
            $("#ftc-item").text(res);
            console.log('harvestItem', res);
        }).catch(err => console.log(err.message))        
    },

    processItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));        

        App.contracts.SupplyChain.methods.processItem(App.upc).send({from: App.metamaskAccountID}).then((res) => {
            $("#ftc-item").text(res);
            console.log('processItem', res);
        }).catch(err => console.log(err.message))
    },
    
    packItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));
        
        App.contracts.SupplyChain.methods.packItem(App.upc).send({from: App.metamaskAccountID}).then((res) => {
            $("#ftc-item").text(res);
            console.log('packItem', res);
        }).catch(err => console.log(err.message))
    },

    sellItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));
        
        const productPrice = App.web3.utils.toWei("1", "ether");
        App.contracts.SupplyChain.methods.sellItem(App.upc, productPrice).send({from: App.metamaskAccountID}).then((res) => {
            $("#ftc-item").text(res);
            console.log('productPrice',productPrice);
            console.log('sellItem', res);
        }).catch(err => console.log(err.message))
    },

    buyItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));
        const walletValue = App.web3.utils.toWei("3", "ether");
        App.contracts.SupplyChain.methods.buyItem(App.upc).send({from: App.metamaskAccountID, value: walletValue}).then((res) => {
            $("#ftc-item").text(res);            
            console.log('buyItem', res);
        }).catch(err => console.log(err.message))        
    },

    shipItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.methods.shipItem(App.upc).send({from: App.metamaskAccountID}).then((res) => {
            $("#ftc-item").text(res);
            console.log('shipItem', res);
        }).catch(err => console.log(err.message))
    },

    receiveItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.methods.receiveItem(App.upc).send({from: App.metamaskAccountID}).then((res) => {
            $("#ftc-item").text(res);
            console.log('receiveItem', res);
        }).catch(err => console.log(err.message))
    },

    purchaseItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));        

        App.contracts.SupplyChain.methods.purchaseItem(App.upc).send({from: App.metamaskAccountID}).then((res) => {
            $("#ftc-item").text(res);
            console.log('purchaseItem', res);
        }).catch(err => console.log(err.message))
    },

    fetchItemBufferOne: function () {
        App.upc = $('#upc').val();
        console.log('upc',App.upc);

        App.contracts.SupplyChain.methods.fetchItemBufferOne(App.upc).call({from: App.metamaskAccountID}).then((res) => {
            $("#ftc-item").text(res);
            console.log('fetchItemBufferOne', res);
        }).catch(err => console.log(err.message))
    },

    fetchItemBufferTwo: function () {
        App.contracts.SupplyChain.methods.fetchItemBufferTwo(App.upc).call().then((res) => {
            $("#ftc-item").text(res);
            console.log('fetchItemBufferTwo', res);
        }).catch(err => console.log(err.message))
    },

    fetchEvents: function () {
        /*
        if (typeof App.contracts.SupplyChain.currentProvider.sendAsync !== "function") {
            App.contracts.SupplyChain.currentProvider.sendAsync = function () {
                return App.contracts.SupplyChain.currentProvider.send.apply(
                App.contracts.SupplyChain.currentProvider,
                    arguments
              );
            };
        }

        App.contracts.SupplyChain.deployed().then(function(instance) {
        var events = instance.allEvents(function(err, log){
          if (!err)
            $("#ftc-events").append('<li>' + log.event + ' - ' + log.transactionHash + '</li>');
        });
        }).catch(function(err) {
          console.log(err.message);
        });
        */
        
        App.contracts.SupplyChain.events.allEvents((err, log) => {
            console.log('event', log.event, log.transactionHash)
            if(!err)
                $("#ftc-events").append('<li>' + log.event + ' - ' + log.transactionHash + '</li>');
        })
                            
    }
};

window.App = App;

window.addEventListener("load", async function() {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    
    await ethereum.request({ method: 'eth_requestAccounts' });
  } else {
    console.warn("No web3 detected. Falling back to http://192.168.1.19:7545. You should remove this fallback when you deploy live",);
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(new Web3.providers.HttpProvider("http://192.168.1.19:7545"),);
  }

  App.init();
});