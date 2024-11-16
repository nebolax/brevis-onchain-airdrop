package circuits

import (
	"testing"

	"github.com/brevis-network/brevis-sdk/sdk"
	"github.com/brevis-network/brevis-sdk/test"
	"github.com/ethereum/go-ethereum/common"
)

func TestCircuit(t *testing.T) {
	rpc := "RPC_URL"
	localDir := "$HOME/circuitOut/myBrevisApp"
	app, err := sdk.NewBrevisApp(1, rpc, localDir)
	check(err)

	// Sample transaction hashes with GHO transfers
	txHash1 := common.HexToHash("0x92e3811a8e1ec01de6fbfbbf40b5f0c341e515531b1cc2978318b3265ad577ae")
	txHash2 := common.HexToHash("0x48d7d0438831cac20721585d4a6f3a016d4db6a2a81f4e1e375030c06ab2e4c4")

	app.AddReceipt(sdk.ReceiptData{
		TxHash: txHash1,
		Fields: []sdk.LogFieldData{
			{
				IsTopic:    true,
				LogPos:     0,
				FieldIndex: 1,
			},
			{
				IsTopic:    true,
				LogPos:     0,
				FieldIndex: 2,
			},
			{
				IsTopic:    false,
				LogPos:     0,
				FieldIndex: 0,
			},
		},
	})

	app.AddReceipt(sdk.ReceiptData{
		TxHash: txHash2,
		Fields: []sdk.LogFieldData{
			{
				IsTopic:    true,
				LogPos:     0,
				FieldIndex: 1,
			},
			{
				IsTopic:    true,
				LogPos:     0,
				FieldIndex: 2,
			},
			{
				IsTopic:    false,
				LogPos:     0,
				FieldIndex: 0,
			},
		},
	})

	appCircuit := &AppCircuit{}
	appCircuitAssignment := &AppCircuit{}

	circuitInput, err := app.BuildCircuitInput(appCircuit)
	check(err)

	///////////////////////////////////////////////////////////////////////////////
	// Testing
	///////////////////////////////////////////////////////////////////////////////

	test.ProverSucceeded(t, appCircuit, appCircuitAssignment, circuitInput)
}

func check(err error) {
	if err != nil {
		panic(err)
	}
}
