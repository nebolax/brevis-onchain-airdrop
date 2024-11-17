package circuits

import (
	"github.com/brevis-network/brevis-sdk/sdk"
	"github.com/ethereum/go-ethereum/common/hexutil"
)

/*
* A circuit intended to be used for permissonless onchain airdrop claiming.
* The circuit validates that the user has made certain interactions with a certain token.
* Specifically:
* 1. Checks how many times the user has sent the token.
 */

type AppCircuit struct{
	// UserAddr sdk.Uint248
}

var GHOTokenAddr = sdk.ConstUint248("0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f")
var TransferTopic = sdk.ParseEventID(
	hexutil.MustDecode("0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"))

var _ sdk.AppCircuit = &AppCircuit{}

func (c *AppCircuit) Allocate() (maxReceipts, maxStorage, maxTransactions int) {
	return 32, 0, 0 // We are only checking receipts
}

func (c *AppCircuit) Define(api *sdk.CircuitAPI, in sdk.DataInput) error {
	// receipts := sdk.NewDataStream(api, in.Receipts)

	// // Assert that these are Transfer events of the GHO token where UserAddr sends the token
	// sdk.AssertEach(receipts, func(r sdk.Receipt) sdk.Uint248 {
	// 	assertionPassed := api.Uint248.And(
	// 		/* Here we iterate over Transfer events. Fields explanation:
	// 		* 0. Field 0 - topic1 checks that the "from" is the user.
	// 		* 1. Field 1 - topic2 does simple sybil resistance and checks that the user didn't send the token to themselves.
	// 		* 2. Field 2 - data contains the amount that the user sent.
	// 		*/
	// 		/////////////////////    Field 0    //////////////////////////////
	// 		api.Uint248.IsEqual(r.Fields[0].Contract, GHOTokenAddr),
	// 		api.Uint248.IsEqual(r.Fields[0].IsTopic, sdk.ConstUint248(1)), // has to be a topic (not event data)
	// 		api.Uint248.IsEqual(r.Fields[0].EventID, TransferTopic), // has to be a transfer event
	// 		api.Uint248.IsEqual(r.Fields[0].Index, sdk.ConstUint248(1)), // has to be topic1 = the sender of the token
	// 		api.Uint248.IsEqual(api.ToUint248(r.Fields[0].Value), c.UserAddr), // check that the sender here is the user address
	// 		/////////////////////    Field 1    //////////////////////////////
	// 		api.Uint248.IsEqual(r.Fields[1].Contract, GHOTokenAddr),
	// 		api.Uint248.IsEqual(r.Fields[1].IsTopic, sdk.ConstUint248(1)), // has to be a topic (not event data)
	// 		api.Uint248.IsEqual(r.Fields[1].EventID, TransferTopic), // has to be a transfer event
	// 		api.Uint248.IsEqual(r.Fields[1].Index, sdk.ConstUint248(2)), // has to be topic2 = the recipient of the token
	// 		api.Uint248.IsEqual(api.ToUint248(r.Fields[0].Value), c.UserAddr), // check that the user didn't send the token to themselves
	// 		/////////////////////    Field 2    //////////////////////////////
	// 		api.Uint248.IsEqual(r.Fields[2].Contract, GHOTokenAddr),
	// 		api.Uint248.IsEqual(r.Fields[2].IsTopic, sdk.ConstUint248(0)), // has to be event data
	// 		api.Uint248.IsEqual(r.Fields[2].EventID, TransferTopic), // has to be a transfer event
	// 		api.Uint248.IsEqual(r.Fields[2].Index, sdk.ConstUint248(0)), // event data has to be index 0		
	// 	)
	// 	return assertionPassed
	// })

	// // Assert uniqueness of transfers by checking uniqueness of the block numbers
	// // (receipts have to be in chronological order)
	// blockNums := sdk.Map(receipts, func(r sdk.Receipt) sdk.Uint248 { return api.ToUint248(r.BlockNum) })
	// earliestTransferBlock := sdk.GetUnderlying(blockNums, 0)
	// sdk.Reduce(
	// 	blockNums,
	// 	earliestTransferBlock,
	// 	func(prevBlockNum sdk.Uint248, curBlockNum sdk.Uint248) (newBlockNum sdk.Uint248) {
	// 		api.Uint248.AssertIsEqual(api.Uint248.IsLessThan(prevBlockNum, curBlockNum), sdk.ConstUint248(1))
	// 		return curBlockNum
	// 	},
	// )

	// // How much in total has the user sent
	// amounts := sdk.Map(receipts, func(r sdk.Receipt) sdk.Uint248 { return api.ToUint248(r.Fields[1].Value) } )
	// totalSent := sdk.Reduce(
	// 	amounts,
	// 	sdk.ConstUint248(0),
	// 	func(acc sdk.Uint248, cur sdk.Uint248) (next sdk.Uint248) { return api.Uint248.Add(acc, cur) },
	// )

	// transfersCount := sdk.Count(receipts)

	// api.OutputAddress(c.UserAddr)
	// api.OutputUint(248, transfersCount)
	// api.OutputUint(248, totalSent)
	// api.OutputUint(248, earliestTransferBlock)

	return nil
}
