# CoinTracker
Algorithm for CoinTracker

Note: Need node downloaded to run code on terminal.

To Run Unit Tests in terminal:
1. cd into CoinTracker folder
2. run `node CoinTracker.js`


Notes/Strategy:

    Input: JSON Array
        - Input JSON Array will be defined s.t. each element is an array that contains 5 data points (defined below in order)
                0. Transaction ID 
                1. Wallet ID 
                2. Time Stamp
                3. Withdrawal or Deposit
                4. Amount 
    Output: JSON Array
        - Output JSON Array will be defined s.t. each element in a tupple that contains 2 data points (defined below in order)
        0. Transaction ID of the withdrawal
        1. Transaction ID of the deposit
    Edge Cases:
        - Invalid Input
        - Empty Input
        - A case where a given withdrwawal or deposit can be matched with multiple possible transfers
            - In this case, use the first occurrence in the list.
    Notes:
        - Need to find transfers based on the equivalence of 
            A. Deposit and Withdrawal amounts 
            B. Timestamps
    Questions:
        - Can you make a transfer to yourself? -- Going to assume no b/c it would be illogical in context. 
            - Need to make sure wallet ids are not the same if we already have verified timestamp, amount, and transactionType match up (also stated in notes that transfers can only be made between different wallets)
        
    Strategy:
        - define oppositeTransactionType helper function
            - Input: String (transactionType -- either 'in' or 'out')
            - Output String 
            - Notes: 
                - if input is 'in' return 'out'
                - if output is 'out' return 'in'
        - define createTransactionKey helper function
            - Input: 
                - Transaction Array (array of 5 elements -- transactionId, walletId, timestamp, transactionType, and transactionAmount)
                - Boolean (should we return the given transactionType or opposite)
            - Output: String (create a key to help find matches in a matchingTransactions dictionary)
            Notes:
                - extract timeStamp, amount, and transactionType from transaction Array
                - Call on oppositeTransactionType method if Input Boolean is true for transactionType
                - Return string in this given format: timeStamp + " " + transactionAmount + " " + transactionType
        - define detect_transfers method
            - convert JSON into an array (call in transactionsArr)
            - define return array (res = [])
            - define an empty object (matchingTransactions = {})
                Note: the keys will contain matching data (timestamp, amount, transactionType) and the values will contain a tupple of non-matching data (walletId, transactionIdx)
            - loop through transactionsArr
                - define transactionId (trasnactionId = transaction[0])
                - define walltedId (walletId = transaction[1])
                
                - call on createTransactionKey helper method (pass in current transaction and true) -- set variable to matchingTransactionKey
                 
                - if matchingTransactions contains matchingTransactionKey
                    - get the associated value in the dictionary with the matchingTransactionKey (should be a tupple of wallet id and transaction id)
                    - check that the current transaction has a different wallet id then the matching transaction's wallet id
                        - if wallet id's are the same then we do not have a match, so we have to: 
                            - construct a new transactionKey (call on createTransactionKey helper method with current transaction and false)
                            - construct the transactionKey's value (should be [walltedId, transactionId])
                            - add key-value pair to the matchingTransactions dictionary
                            - return
                        
                        - push the array [matchingTransactionId, currentTransactionId] to res
                        - delete the key-value of the matchingTransactionId from the matchingTransactions dictionary
                - else
                    - construct a new transactionKey (call on createTransactionKey helper method with current transaction and false)
                    - construct the transactionKey's value (should be [walltedId, transactionId])
                    - add key-value pair to the matchingTransactions dictionary
            
            - return res as JSON
 
