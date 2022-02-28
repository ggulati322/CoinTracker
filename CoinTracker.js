/*

Transfer Detector.

Goal: Given a list of withdrawals and deposits, detect the likely transfers amongst them.

A few notes:
- The same withdrawal or deposit cannot be used for multiple different transfers.
    - If there is a case where a given withdrwawal or deposit can be matched with multiple possible
      transfers, use the first occurrence in the list.
- A transfer can only be made between different wallets.

For Example, given:

    Input: 

        [
            ('tx_id_1', 'wallet_id_1', '2020-01-01 15:30:20 UTC', 'out', 5.3), // 5.3 BTC was withdrawn out of 'wallet_id_1'
            ('tx_id_2', 'wallet_id_1', '2020-01-03 12:05:25 UTC', 'out', 3.2), // 3.2 BTC was withdrawn out of 'wallet_id_1'
            ('tx_id_3', 'wallet_id_2', '2020-01-01 15:30:20 UTC', 'in', 5.3),  // 5.3 BTC was deposited into 'wallet_id_2'
            ('tx_id_4', 'wallet_id_3', '2020-01-01 15:30:20 UTC', 'in', 5.3)   // 5.3 BTC was deposited into 'wallet_id_3'
        ]
        Side Note: instead of using parenthesis to surround elements in array use brackets
            - parenthesis in array will evaulate every element, but will be equivalent to only the last element
    Output: 
        [('tx_id_1', 'tx_id_3')]

Tests:
    - Add a few tests to verify your implementation works on a variety of inputs
*/

/*
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
*/

/*
    Goal: Create and Return a transaction key that can help find matching transactions
    @param transaction - array of 5 elements (transactionId, walletId, timeStamp, transactionType, amount)
    @param useOppositeTransType - boolean to decide what transaction type to use
*/
const createTransactionKey = (transaction, useOppositeTransType) => {
    const timeStamp = transaction[2];
    const transactionType = useOppositeTransType ? oppositeTransactionType(transaction[3]) : transaction[3];
    const transactionAmount = transaction[4];
    return timeStamp + " " + transactionAmount + " " + transactionType; 
}

/*
    Goal: Return opposite transaction type
    @param transactionType - transaction type string
*/
const oppositeTransactionType = (transactionType) => {
    return transactionType == 'in' ? 'out' : 'in';
}

/*
    Goal: Modify and Return matchingTransactions dictionary with a new transactionKey
    @param matchingTransactions - dictionary that holds unmatched transactions
    @param transaction - array of 5 elements (transactionId, walletId, timeStamp, transactionType, amount)
*/
let addTransactionKey = (matchingTransactions, transaction) => {
    const transactionId = transaction[0];
    const walletId = transaction[1];
    const key = createTransactionKey(transaction, false);
    const value = [walletId, transactionId];

    matchingTransactions[key] = value;
    return matchingTransactions;
}

/*
    Goal: Given a list of withdrawals and deposits, detect the likely transfers amongst them.
    @param: transaction - JSON of withdrawals and deposits
    @return res - JSON of likely transfers
*/
let detect_transfers = (transactions) => {
    const transactionArr = JSON.parse(transactions);

    let res = [];
    let matchingTransactions = {};

    transactionArr.forEach((transaction) => {
        // make const
        const transactionId = transaction[0];
        const walletId = transaction[1];

        const matchingTransactionKey = createTransactionKey(transaction, true);

        if(matchingTransactions.hasOwnProperty(matchingTransactionKey)) {
            const walletAndTransIds = matchingTransactions[matchingTransactionKey]; // should be a tupple of the matching transaction wallet id and transaction id
            if(walletAndTransIds[0] == walletId) {
                // add helper function 
                matchingTransactions = addTransactionKey(matchingTransactions, transaction)
                return;
            }
            res.push([walletAndTransIds[1], transactionId]);
            delete matchingTransactions[matchingTransactionKey]; 
        } else {
            matchingTransactions = addTransactionKey(matchingTransactions, transaction)
        }
    });
    
    return JSON.stringify(res);
}

// Case 0: Empty Input
const data0 = [];
const test0 = detect_transfers(JSON.stringify(data0));

// Case 1: There exists one matching transaction 
const data1 = [
            ['tx_id_1', 'wallet_id_1', '2020-01-01 15:30:20 UTC', 'out', 5.3], // 5.3 BTC was withdrawn out of 'wallet_id_1'
            ['tx_id_2', 'wallet_id_1', '2020-01-03 12:05:25 UTC', 'out', 3.2], // 3.2 BTC was withdrawn out of 'wallet_id_1'
            ['tx_id_3', 'wallet_id_2', '2020-01-01 15:30:20 UTC', 'in', 5.3],  // 5.3 BTC was deposited into 'wallet_id_2'
            ['tx_id_4', 'wallet_id_3', '2020-01-01 15:30:20 UTC', 'in', 5.3]   // 5.3 BTC was deposited into 'wallet_id_3'
        ];
const test1 = detect_transfers(JSON.stringify(data1));

// Case 2: There exists two transactions with the same timestamp, amount, and different transaction types BUT have the same wallet id (hence not a matching transaction)
const data2 = [
            ['tx_id_1', 'wallet_id_1', '2020-01-01 15:30:20 UTC', 'out', 5.3], // 5.3 BTC was withdrawn out of 'wallet_id_1'
            ['tx_id_2', 'wallet_id_1', '2020-01-03 12:05:25 UTC', 'out', 3.2], // 3.2 BTC was withdrawn out of 'wallet_id_1'
            ['tx_id_3', 'wallet_id_3', '2020-01-01 15:30:20 UTC', 'in', 3.1],   // 5.3 BTC was deposited into 'wallet_id_3'
            ['tx_id_4', 'wallet_id_4', '2020-02-91 12:15:15 UTC', 'in', 4.2],  // 4.2 BTC was deposited into 'wallet_id_4'
            ['tx_id_5', 'wallet_id_4', '2020-02-91 12:15:15 UTC', 'out', 4.2]  // 4.2 BTC was withdrawan into 'wallet_id_4'
        ]

const test2 = detect_transfers(JSON.stringify(data2));

// Case 3: There exists a transaction that has two matching transactions (should only return the first match)
const data3 = [
            ['tx_id_1', 'wallet_id_1', '2020-01-01 15:30:20 UTC', 'out', 5.3], // 5.3 BTC was withdrawn out of 'wallet_id_1'
            ['tx_id_2', 'wallet_id_1', '2020-01-03 12:05:25 UTC', 'out', 3.2], // 3.2 BTC was withdrawn out of 'wallet_id_1'
            ['tx_id_3', 'wallet_id_2', '2020-01-01 15:30:20 UTC', 'in', 5.3],  // 5.3 BTC was deposited into 'wallet_id_2'
            ['tx_id_4', 'wallet_id_3', '2020-01-01 15:30:20 UTC', 'in', 5.3],   // 5.3 BTC was deposited into 'wallet_id_3'
            ['tx_id_5', 'wallet_id_4', '2020-01-01 15:30:20 UTC', 'in', 5.3],  // 5.3 BTC was deposited into 'wallet_id_4'
            ['tx_id_6', 'wallet_id_4', '2020-02-91 12:15:15 UTC', 'out', 4.2]  // 4.2 BTC was withdrawan into 'wallet_id_4'
]

const test3 = detect_transfers(JSON.stringify(data3));

// Case 4: There exists a two pairs of transactions with same transaction type, amount, and timestamp AND there are two matches with the same ransaction type, amount, and timestamp
const data4 = [
            ['tx_id_1', 'wallet_id_1', '2020-01-01 15:30:20 UTC', 'out', 5.3], // 5.3 BTC was withdrawn out of 'wallet_id_1'
            ['tx_id_2', 'wallet_id_1', '2020-01-03 12:05:25 UTC', 'out', 3.2], // 3.2 BTC was withdrawn out of 'wallet_id_1'
            ['tx_id_3', 'wallet_id_2', '2020-01-01 15:30:20 UTC', 'in', 5.3],  // 5.3 BTC was deposited into 'wallet_id_2'
            ['tx_id_4', 'wallet_id_3', '2020-01-01 15:30:20 UTC', 'in', 5.3],   // 5.3 BTC was deposited into 'wallet_id_3'
            ['tx_id_5', 'wallet_id_4', '2020-01-01 15:30:20 UTC', 'out', 5.3],  // 5.3 BTC was deposited into 'wallet_id_4'
            ['tx_id_6', 'wallet_id_4', '2020-02-91 12:15:15 UTC', 'out', 4.2]  // 4.2 BTC was withdrawan into 'wallet_id_4'
]

const test4 = detect_transfers(JSON.stringify(data4));

console.log("Empty input returns an empty output: ", test0 == '[]',);
console.log("There is a match between transaction tx_id_1 and tx_id_3:  ", test1 == '[["tx_id_1","tx_id_3"]]');
console.log("There is no transaction between the same wallets:  ", test2 == '[]');
console.log("There is only a transaction match between tx_id_1 and tx_id_3", test3 == '[["tx_id_1","tx_id_3"]]');
console.log("There are two matching transactions between (tx_id_1 and tx_id_3) and (tx_id_4 and tax_id_5): ", test4 == '[["tx_id_1","tx_id_3"],["tx_id_4","tx_id_5"]]');
