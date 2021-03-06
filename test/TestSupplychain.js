// This script is designed to test the solidity smart contract - SuppyChain.sol -- and the various functions within

// Declare a variable and assign the compiled smart contract artifact
var SupplyChain = artifacts.require('SupplyChain')

contract('SupplyChain', function(accounts) {
    // Declare few constants and assign a few sample accounts generated by ganache-cli
    var sku = 1
    var upc = 1
    const ownerID = accounts[0]
    const originFarmerID = accounts[1]
    const originFarmName = "John Doe"
    const originFarmInformation = "Yarray Valley"
    const originFarmLatitude = "-38.239770"
    const originFarmLongitude = "144.341490"
    var productID = sku + upc
    const productNotes = "Best beans for Espresso"
    const productPrice = web3.utils.toWei("1", "ether")
    var itemState = 0
    const distributorID = accounts[2]
    const retailerID = accounts[3]
    const consumerID = accounts[4]
    const emptyAddress = '0x00000000000000000000000000000000000000'    
    
    console.log("ganache-cli accounts used here...")
    console.log("Contract Owner: accounts[0] ", accounts[0])
    console.log("Farmer: accounts[1] ", accounts[1])
    console.log("Distributor: accounts[2] ", accounts[2])
    console.log("Retailer: accounts[3] ", accounts[3])
    console.log("Consumer: accounts[4] ", accounts[4])

    // 1st Test
    it("Testing smart contract function harvestItem() that allows a farmer to harvest coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        
        await supplyChain.addFarmer(originFarmerID)        
        assert.equal((await supplyChain.getPastEvents('Harvested')).length, 0, 'Error: There should not be any Harvested event yet')
        
        // Mark an item as Harvested by calling function harvestItem()                
        await supplyChain.harvestItem(upc, 
            originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, 
            originFarmLongitude, productNotes, {from: originFarmerID})

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set        
        assert.equal(await supplyChain.isFarmer(originFarmerID), true, 'Error: originFarmerID should be a farmer')
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], originFarmerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferOne[3], originFarmerID, 'Error: Missing or Invalid originFarmerID')
        assert.equal(resultBufferOne[4], originFarmName, 'Error: Missing or Invalid originFarmName')
        assert.equal(resultBufferOne[5], originFarmInformation, 'Error: Missing or Invalid originFarmInformation')
        assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude')
        assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude')
        assert.equal(resultBufferTwo[5], 0, 'Error: Invalid item State')
        assert.equal((await supplyChain.getPastEvents('Harvested')).length, 1, 'Error: Harvested event should have been emitted')
    }).timeout(10000);       

    // 2nd Test
    it("Testing smart contract function processItem() that allows a farmer to process coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        
        // Declare and Initialize a variable for event
        assert.equal((await supplyChain.getPastEvents('Processed')).length, 0, 'Error: There should not be any Processed event yet')

        // Mark an item as Processed by calling function processItem()
        await supplyChain.processItem(upc, {from: originFarmerID})

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferTwo[5], 1, 'Error: Invalid item State')
        assert.equal((await supplyChain.getPastEvents('Processed')).length, 1, 'Error: Processed event should have been emitted')
        
    }).timeout(10000);       

    // 3rd Test
    it("Testing smart contract function packItem() that allows a farmer to pack coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        
        // Declare and Initialize a variable for event
        assert.equal((await supplyChain.getPastEvents('Packed')).length, 0, 'Error: There should not be any Packed event yet')                       

        // Mark an item as Packed by calling function packItem()
        await supplyChain.packItem(upc, {from: originFarmerID})

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferTwo[5], 2, 'Error: Invalid item State')
        assert.equal((await supplyChain.getPastEvents('Packed')).length, 1, 'Error: Packed event should have been emitted')
        
    }).timeout(10000);       

    // 4th Test
    it("Testing smart contract function sellItem() that allows a farmer to sell coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        
        // Declare and Initialize a variable for event
        assert.equal((await supplyChain.getPastEvents('ForSale')).length, 0, 'Error: There should not be any ForSale event yet')                                      

        // Mark an item as ForSale by calling function sellItem()
        await supplyChain.sellItem(upc, productPrice, {from: originFarmerID})

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferTwo[4], productPrice, 'Error: Invalid product price')
        assert.equal(resultBufferTwo[5], 3, 'Error: Invalid item State')
        assert.equal((await supplyChain.getPastEvents('ForSale')).length, 1, 'Error: ForSale event should have been emitted')
          
    }).timeout(10000);   

    // 5th Test
    it("Testing smart contract function buyItem() that allows a distributor to buy coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        
        // Declare and Initialize a variable for event
        assert.equal((await supplyChain.getPastEvents('Sold')).length, 0, 'Error: There should not be any Sold event yet')                                 

        // Mark an item as Sold by calling function buyItem()
        await supplyChain.addDistributor(distributorID)           
        let balanceDistributorbefore = await web3.eth.getBalance(distributorID);
        let tx = await supplyChain.buyItem(upc, {from: distributorID, value: web3.utils.toWei("1", "ether")})
        let gasUsed = tx.receipt.gasUsed
        let gasPrice = (await web3.eth.getTransaction(tx.tx)).gasPrice;                
        let balanceDistributorAfter = await web3.eth.getBalance(distributorID);
        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferOne[2], distributorID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferTwo[5], 4, 'Error: Invalid item State') 
        assert.equal(resultBufferTwo[6], distributorID, 'Error: Invalid distributorID')
        //assert.equal(balanceDistributorAfter, balanceDistributorbefore - productPrice - gasUsed*gasPrice, "Error: Distributor balance should have been reduced by the product price")
        assert.equal((await supplyChain.getPastEvents('Sold')).length, 1, 'Error: Sold event should have been emitted')

    }).timeout(10000);   

    // 6th Test
    it("Testing smart contract function shipItem() that allows a distributor to ship coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        
        // Declare and Initialize a variable for event
        assert.equal((await supplyChain.getPastEvents('Shipped')).length, 0, 'Error: There should not be any Shipped event yet')

        // Mark an item as Shipped by calling function shipItem()
        await supplyChain.shipItem(upc, {from: distributorID})

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferTwo[5], 5, 'Error: Invalid item State')
        assert.equal((await supplyChain.getPastEvents('Shipped')).length, 1, 'Error: Shipped event should have been emitted')
              
    }).timeout(10000);   

    // 7th Test
    it("Testing smart contract function receiveItem() that allows a retailer to mark coffee received", async() => {
        const supplyChain = await SupplyChain.deployed()
        
        // Declare and Initialize a variable for event
        assert.equal((await supplyChain.getPastEvents('Received')).length, 0, 'Error: There should not be any Received event yet')                
        
        // Mark an item as Received by calling function receiveItem()
        await supplyChain.addRetailer(retailerID)  
        await supplyChain.receiveItem(upc, {from: retailerID})

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferOne[2], retailerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferTwo[5], 6, 'Error: Invalid item State')
        assert.equal(resultBufferTwo[7], retailerID, 'Error: Invalid retailerID')
        assert.equal((await supplyChain.getPastEvents('Received')).length, 1, 'Error: Received event should have been emitted')
             
    }).timeout(10000);

    // 8th Test
    it("Testing smart contract function purchaseItem() that allows a consumer to purchase coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        
        // Declare and Initialize a variable for event
        assert.equal((await supplyChain.getPastEvents('Purchased')).length, 0, 'Error: There should not be any Purchased event yet')                                        

        // Mark an item as Purchased by calling function purchaseItem()
        await supplyChain.addConsumer(consumerID)  
        await supplyChain.purchaseItem(upc, {from: consumerID})

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferOne[2], consumerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferTwo[5], 7, 'Error: Invalid item State')
        assert.equal(resultBufferTwo[8], consumerID, 'Error: Invalid retailerID')
        assert.equal((await supplyChain.getPastEvents('Purchased')).length, 1, 'Error: Purchased event should have been emitted')
    }).timeout(10000);

    // 9th Test
    it("Testing smart contract function fetchItemBufferOne() that allows anyone to fetch item details from blockchain", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        
        // Verify the result set:
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], consumerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferOne[3], originFarmerID, 'Error: Missing or Invalid originFarmerID')
        assert.equal(resultBufferOne[4], originFarmName, 'Error: Missing or Invalid originFarmName')
        assert.equal(resultBufferOne[5], originFarmInformation, 'Error: Missing or Invalid originFarmInformation')
        assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude')
        assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude')
    }).timeout(10000);

    // 10th Test
    it("Testing smart contract function fetchItemBufferTwo() that allows anyone to fetch item details from blockchain", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)
        
        // Verify the result set:
        assert.equal(resultBufferTwo[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferTwo[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferTwo[2], productID, 'Error: Invalid item Product ID')
        assert.equal(resultBufferTwo[3], productNotes, 'Error: Invalid item Product Noted')
        assert.equal(resultBufferTwo[4], productPrice, 'Error: Invalid item Product Price')
        assert.equal(resultBufferTwo[5], 7, 'Error: Invalid item State')
        assert.equal(resultBufferTwo[6], distributorID, 'Error: Invalid distributorID')
        assert.equal(resultBufferTwo[7], retailerID, 'Error: Invalid retailerID')
        assert.equal(resultBufferTwo[8], consumerID, 'Error: Invalid retailerID')
    }).timeout(10000);

});

