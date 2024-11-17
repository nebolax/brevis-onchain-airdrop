import { Brevis, ErrCode, ProofRequest, Prover, ReceiptData, Field } from 'brevis-sdk-typescript';
import { ethers, getDefaultProvider } from 'ethers';
import { BrevisAbi } from './brevisAbi';

// RealAave - 0x65f57e2d8247f4F4Adb4E0beF35801c01eba9dac
const BrevisAddress = "0xa082F86d9d1660C29cf3f962A31d7D20E367154F"
const GHOAddress = "0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f"
const AirdropContract = "0xeCD9Ce940b5E8EC9bF5Cb9FAcA29CBE67c3d45DA"

// Scoping block range because not all data is indexed on Brevis
const StartBlock = 20000000 // Jun 1st
const EndBlock = 21150000 // Nov 9th

// Sample user wallets:
// 2 pure GHO transfers - 0x53412713bC706d0cA54C9370bCF51AC47aBB266F

// returns a list of hashes
async function findGHOTransactions(userAddress: string): Promise<string[]> {
    const provider = new ethers.providers.JsonRpcProvider({ url: "https://eth.llamarpc.com" })
    const response = await fetch(`https://api.etherscan.io/v2/api?chainid=1&module=account&action=tokentx&contractaddress=${GHOAddress}&address=${userAddress}&startblock=${StartBlock}&endblock=${EndBlock}&sort=asc&apikey=R6BDH1D559D9GRU8CQPUGHN4N4FN7TBG6J`)
    const allTransfers: any[] = (await response.json()).result
    console.log(`Found ${allTransfers.length} GHO transfers by ${userAddress}`)

    // For the sake of circuit simplicity we only process pure transfers, i.e. GHO.transfer(to, amount).
    // We ignore dapp interactions.
    const pureTransfers: string[] = []
    for (let transfer of allTransfers) {
        const txHash: string = transfer.hash
        const txData = await provider.getTransaction(txHash)
        console.log(`For ${txHash} the "to" was ${txData.to}`)
        if (txData.to?.toLowerCase() === GHOAddress.toLowerCase()) {
            pureTransfers.push(txHash)
        }
    }
    console.log(`Found ${pureTransfers.length} pure GHO transfers by ${userAddress}`)
    return pureTransfers
}

/**
 * Permissonlessly airdrops a user based on their onchain activity.
 */
async function main() {
    // Set up brevis stuff
    const privateKey = "0xcac6f4b5cc12843de7b8a6e5c61fdb8b272ff31a21d0097db748710899297386"
    const wallet = new ethers.Wallet(privateKey, getDefaultProvider(11155111))
    const brevisContract = new ethers.Contract(BrevisAddress, BrevisAbi, wallet)
    const prover = new Prover('185.167.98.54:33247');
    const brevis = new Brevis('appsdkv3.brevis.network:443');
    const proofReq = new ProofRequest();

    const userAddress = process.argv[2] // via command line
    if (userAddress.length === 0) {
        console.error("empty user address")
        return
    }

    // Find transactions where the user has sent GHO
    const txHashes = await findGHOTransactions(userAddress);

    proofReq.setCustomInput({
        UserAddr: {
            type: "Uint248",
            data: userAddress
        }
    })
    // txHashes.forEach((txHash) => proofReq.addReceipt(
    proofReq.addReceipt(
        new ReceiptData({
            tx_hash: txHashes[0],
            fields: [
                new Field({
                    log_pos: 0,
                    is_topic: true,
                    field_index: 1,
                }),
                new Field({
                    log_pos: 0,
                    is_topic: true,
                    field_index: 2,
                }),
                new Field({
                    log_pos: 0,
                    is_topic: false,
                    field_index: 0,
                }),
            ],
        })
    );
    // proofReq.addReceipt(
    //     new ReceiptData({
    //         tx_hash: txHashes[1],
    //         fields: [
    //             new Field({
    //                 log_pos: 0,
    //                 is_topic: true,
    //                 field_index: 1,
    //             }),
    //             new Field({
    //                 log_pos: 0,
    //                 is_topic: true,
    //                 field_index: 2,
    //             }),
    //             new Field({
    //                 log_pos: 0,
    //                 is_topic: false,
    //                 field_index: 0,
    //             }),
    //         ],
    //     })
    // );
    // ))

    console.log(`Sending prove request to the local circuit for ${userAddress}`)
    const proofRes = await prover.prove(proofReq);

    // error handling
    if (proofRes.has_err) {
        const err = proofRes.err;
        switch (err.code) {
            case ErrCode.ERROR_INVALID_INPUT:
                console.error('invalid receipt/storage/transaction input:', err.msg);
                break;

            case ErrCode.ERROR_INVALID_CUSTOM_INPUT:
                console.error('invalid custom input:', err.msg);
                break;

            case ErrCode.ERROR_FAILED_TO_PROVE:
                console.error('failed to prove:', err.msg);
                break;
        }
        return;
    }
    console.log('generated local proof', proofRes.proof);

    try {
        const brevisRes = await brevis.submit(proofReq, proofRes, 1, 11155111, 0, "", "");
        console.log('brevis api output', brevisRes);

        // Submit a brevis sendRequest onchain
        const populatedTx = await brevisContract.populateTransaction.sendRequest(
            brevisRes.queryKey.query_hash, // _proofId
            brevisRes.queryKey.nonce, // _nonce
            "0x0000000000000000000000000000000000000000", // _refundee
            [AirdropContract, 1000000], // callback address and callback gas
            0 // always 0 - using zk-only circuit
        );
        const response = await wallet.sendTransaction(populatedTx)
        await response.wait() // transaction executed!
        console.log("Registered the request in the Brevis contract")

        await brevis.wait(brevisRes.queryKey, 11155111);
    } catch (err) {
        console.error(err);
    }
}

main();
