import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Ethereum from './Ethereum.png'
import { ethers } from 'ethers';
import { useWeb3ModalProvider, useWeb3ModalAccount } from '@web3modal/ethers5/react'

// the sender address
const EVO_WALLET_ADDRESS = process.env.REACT_APP_EVO_WALLET_ADDRESS;
// contract address for the EVoT
const EVOT_CONTRACT_ADDRESS = process.env.REACT_APP_EVOT_CONTRACT_ADDRESS;
// contract address for the Test
const TEST_CONTRACT_ADDRESS = process.env.REACT_APP_TEST_CONTRACT_ADDRESS;
// the sender privatekey
const EVO_WALLET_PRIVATE_KEY = process.env.REACT_APP_EVO_WALLET_PRIVATE_KEY;

// Token ABI
const EVOT_CONTRACT_ABI = process.env.REACT_APP_EVOT_CONTRACT_ABI;
const TEST_CONTRACT_ABI = process.env.REACT_APP_EVOT_TEST_CONTRACT_ABI;

// bet amount
const betAmount = '1'
// amount to send
const amountToCredit = '1000'

const WalletCard = () => {
    const [errorMessage, setErrorMessage] = useState(null);
    const [userBalance, setUserBalance] = useState(null);
    const [defaultSymbol, setDefaultSymbol] = useState(null);
    const [creditAmount, setCreditAmount] = useState(0);
    const [minThreshold, setMinThreshold] = useState(0);
    const { address, chainId, isConnected } = useWeb3ModalAccount()
    const { walletProvider } = useWeb3ModalProvider()

    function BalanceHandler() {
        async function getBalance() {
            if (!isConnected) {
                setErrorMessage("User disconnected")
            } else {
                const ethersProvider = new ethers.providers.Web3Provider(walletProvider)
                const signer = ethersProvider.getSigner()
                // The Contract object
                const evotContract = new ethers.Contract(TEST_CONTRACT_ADDRESS, TEST_CONTRACT_ABI, signer)
                const symbol = await evotContract.symbol()
                const balance = await evotContract.balanceOf(address)
                setUserBalance(ethers.utils.formatUnits(balance, 18))
                setDefaultSymbol(symbol)
                console.log(symbol)
                console.log(ethers.utils.formatUnits(balance, 18))
            }
        }
        
        return <Button style={{ marginRight: 20, background: "white" }} onClick={getBalance}>Get EVoT Balance</Button>
    }

    function CreditHandler() {
        async function transfer() {
            if (!isConnected) {
                setErrorMessage("User disconnected")
            } else {
                if (userBalance >= amountToCredit) {
                    const ethersProvider = new ethers.providers.Web3Provider(walletProvider)
                    const signer = ethersProvider.getSigner()
                    // The Contract object
                    const evotContract = new ethers.Contract(EVOT_CONTRACT_ADDRESS, EVOT_CONTRACT_ABI, signer)
                    const decimals = await evotContract.decimals()
                    const evotWithSigner = evotContract.connect(signer);
                    const evot = ethers.utils.parseUnits(amountToCredit, decimals);
                    evotWithSigner.transfer(EVO_WALLET_ADDRESS, evot)
                    .then(function(tx){
                        setCreditAmount(amountToCredit/100)
                        const thresholdAmount = Number(amountToCredit/100) + Number(minThreshold)
                        setMinThreshold(thresholdAmount)
                    })
                } else {
                    setErrorMessage("No sufficient EVoTs!!!");
                }
            }
        }
        
        return <Button style={{ marginRight: 20, background: minThreshold > 0 ? "#A5CC82" : "white" }}
        onClick={transfer}> {(minThreshold > 0) ? "+Threshold:"+(minThreshold).toString()+" CRO" : "+Threshold"}</Button>
    }

    function PlayHandler() {
        async function play() {
            if (!isConnected) {
                setErrorMessage("User disconnected")
            } else {
                if (creditAmount > 0) {
                    const creditdAmount = Number(creditAmount) - Number(betAmount)
                    console.log(creditdAmount)
                    setCreditAmount(creditdAmount)
                    if (minThreshold > 0) {
                        const thresholdAmount = Number(minThreshold) - Number(betAmount)
                        console.log(thresholdAmount)
                        setMinThreshold(thresholdAmount)
                    }
                } else {
                    setErrorMessage("No sufficient Credit!!!");
                }
            }
        }
        
        return <Button style={{ marginRight: 20, background: creditAmount > 0 ? "#A5CC82" : "white" }}
        onClick={play}> {(creditAmount > 0) ? "-Play:"+(creditAmount).toString()+" CRO" : "-Play"}</Button>
    }

    function WinHandler() {
        async function win() {
            if (!isConnected) {
                setErrorMessage("User disconnected")
            } else {
                console.log(EVO_WALLET_ADDRESS);
                console.log(EVOT_CONTRACT_ADDRESS);
                console.log(EVO_WALLET_PRIVATE_KEY);
                const winAmount = Number(creditAmount) + Number(betAmount)
                console.log(winAmount)
                setCreditAmount(winAmount)
            }
        }
        
        return <Button style={{ marginRight: 20, background: creditAmount > 0 ? "#A5CC82" : "white" }}
        onClick={win}> {"+Win"}</Button>
    }

    function CollectHandler() {
        async function collect() {
            if (!isConnected) {
                setErrorMessage("User disconnected")
            } else {
                if ((creditAmount - minThreshold) > 0) {
                    const ethersProvider = new ethers.providers.Web3Provider(walletProvider)
                    const signer = ethersProvider.getSigner()
                    const recipient = await signer.getAddress()
                    const amountToSend = creditAmount - minThreshold
        
                    const gasLimit = ethersProvider.estimateGas({
                        from: EVO_WALLET_ADDRESS,
                        to: recipient,
                        value: ethers.utils.parseEther(amountToSend.toString()),
                      });
        
                    const priorityFeePerGas = await ethersProvider.getFeeData();
                    console.log(`Estimated priority fee per gas: ${priorityFeePerGas.maxPriorityFeePerGas}`);
                    
                    const nonce = await ethersProvider.getTransactionCount(EVO_WALLET_ADDRESS);
                    const wallet = new ethers.Wallet(EVO_WALLET_PRIVATE_KEY, ethersProvider)

                    // Creating and sending the transaction object
                    const tx = await wallet.sendTransaction({
                        to: recipient,
                        value: ethers.utils.parseEther(amountToSend.toString()),
                        gasLimit: gasLimit,
                        nonce: nonce,
                        maxPriorityFeePerGas: priorityFeePerGas.maxPriorityFeePerGas,
                        chainId: chainId,
                    });
                    console.log("Mining transaction...");
                    console.log(`https://cronoscan.com/tx/${tx.hash}`);
                    // Waiting for the transaction to be mined
                    const receipt = await tx.wait();
                    console.log(receipt);
                    // The transaction is now on chain!
                    if (receipt.status == 1) {
                        console.log("Success...");
                        setCreditAmount(minThreshold)
                    } else {
                        console.log("Failure...");
                        setErrorMessage("something went wrong, please try again later!");
                    }
                } else {
                    setErrorMessage("Your credit should be greater than threshold amount.");
                }
            }
        }
        return <Button style={{ marginRight: 20, background: (creditAmount - minThreshold) > 0 ? "#A5CC82" : "white" }}
        onClick={collect}> {(creditAmount - minThreshold) > 0 ? "-Collect:"+(creditAmount - minThreshold).toString()+" CRO" : "-Collect"}</Button>
    }
    return (
        <div className="WalletCard">
            <img src={Ethereum} className="App-logo" alt="logo" />
            <h3 className="h4">
                Welcome to a decentralized Application
            </h3>
            <section>
            <CreditHandler />
            <PlayHandler />
            <WinHandler />
            <CollectHandler />
            </section>
            <div className="balanceDisplay">
                <h3>
                    <BalanceHandler/>: {userBalance} {defaultSymbol}
                </h3>
            </div>
            {errorMessage}
        </div>
    )
}
export default WalletCard;