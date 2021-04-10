/* eslint-disable no-unused-expressions */
/* eslint-disable no-nested-ternary */
/* eslint-disable eqeqeq */
/* eslint-disable prettier/prettier */
/* eslint-disable camelcase */
/* eslint-disable react/prop-types */
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Box } from '@chakra-ui/layout';
import { Button } from '@chakra-ui/button';
import { connect } from 'react-redux';
import { ethers } from 'ethers';
import { notify } from 'containers/NoticeProvider/actions';
import Web3 from 'web3';
import { BUSDToken, rigelToken, BNBTOKEN, router, WETH } from '../../utils/SwapConnect';
import ArrowDownImage from '../../assets/arrow-down.svg';
import From from './from';
import To from './to';
import SwapSettings from "./SwapSettings";
import { SMART_SWAP, TOKENS_CONTRACT } from "../../utils/constants";
import ShowMessageBox from './../Toast/ShowMessageBox';

export const Manual = props => {
  const { wallet, wallet_props } = props.wallet;
  const [fromAmount, setFromAmount] = useState('');
  const [path, setPath] = useState([{ fromPath: TOKENS_CONTRACT.RGP, token: "RGP" }]);
  const [showBox, setShowBox] = useState(false);
  const [isNewUser, setIsNewUser] = useState(true)
  const [amountIn, setAmountIn] = useState('0.0');
  const [boxMessage, setBoxMessage] = useState('');
  const [rgpBalance, setRGPBalance] = useState('0.0');
  const [ETHBalance, setETHBalance] = useState('0.0');
  const [busdBalance, setBUSDBalance] = useState('0.0');
  const [bnbBalance, setBNBBalance] = useState('0.0');
  const [selectedToken, setSelectedToken] = useState('');
  const [selectedToToken, setSelectedToToken] = useState('');
  const [transactionDeadline, setTransactionDeadline] = useState("1234")
  const [swapUserTokenBalance, setSwapUserTokenBalance] = useState("connect to wallet")
  const [approveButton, setApproveButton] = useState(false)
  const [disableSwapTokenButton, setDisableSwapTokenButton] = useState(true)

  useEffect(() => {
    callTransformFunction()
    checkForAllVariables()
    checkForApproval(path[0])
  }, [path, selectedToken, selectedToToken, wallet])

  //handling change ev
  const handleChangeToAmount = (event) => {
    setAmountIn(event.target.value);
    getToAmount(event.target.value, 'to');
  };
  const handleChangeFromAmount = event => {
    setFromAmount(event.target.value)
    getToAmount(event.target.value, 'from');
  };

  //use this to fetch bnb balance of user
  const showBNBMaxValue = async (val) => {
    const bnb = await BNBTOKEN();
    const walletBal = await bnb.balanceOf(wallet.address);
    const bnbBalance = ethers.utils.formatUnits(walletBal);
    setFromAmount(bnbBalance)
  }

  const showMaxValue = async (val) => {
    const rgp = await rigelToken();
    const walletBal = await rgp.balanceOf(wallet.address);
    const rgpBal = ethers.utils.formatUnits(walletBal);
    setFromAmount(rgpBal)
  }

  const setPathArray = (target, token) => {
    const pathObject = path.filter(value => !value.hasOwnProperty('fromPath'));
    let newArray = [{ fromPath: target, token }, ...pathObject]
    // console.log(newArray)
    // callTransformFunction(newArray)
    setPath(newArray)

  };
  const setPathToArray = (target, token) => {
    const pathObject = path.filter(value => !value.hasOwnProperty('toPath'));
    let newArray = [...pathObject, { toPath: target, token }]
    // console.log(newArray)
    // callTransformFunction(newArray)
    setPath(newArray)

  };
  /**
   * @describe this Function is suppose to get the
   * amount of token for the ToField
   * @param {*} tokenAddress
   * @param {*} symbol
   */
  const checkIfUserIsLoggedIn = () => {
    if (wallet.signer === "signer") {
      return false
    } else {
      return true
    }
  }
  const checkForApproval = (value) => {
    let res
    if (value.token === "RGP") {
      // res = await rgpApproval()
      res = true
    } else if (value.token === "BUSD") {
      // res = await bnbApproval()
      res = false
    } else if (value.token === "ETH") {
      // res = await rgpApproval()
      res = true
    }
    return res
  }
  const changeUIBasedOnResult = (result) => {
    console.log({ result })
    if (result) {
      // it means you have approve
      setSwapUserTokenBalance("swap token")
      console.log("true")
      setDisableSwapTokenButton(false)
      setApproveButton(false)
    } else {
      //you have not approve
      setApproveButton(true)
      setDisableSwapTokenButton(true)
    }
  }
  const checkForAllVariables = () => {

    if (checkIfUserIsLoggedIn()) {
      setSwapUserTokenBalance("Enter amount")
      if (fromAmount > 0 || amountIn > 0) {
        setSwapUserTokenBalance("select a token")
        if (selectedToToken !== 'Select a token') {
          setSwapUserTokenBalance("select the correct pair")
          if ((path[0].token === "RGP" && path[1].token === "BUSD") || (path[0].token === "BUSD" && path[1].token === "RGP")) {
            alert(`correct token ${path[0].token} and ${path[1].token}`)
            let result = checkForApproval(path[0])
            changeUIBasedOnResult(result)
          } else if ((path[0].token === "RGP" && path[1].token === "ETH") || (path[0].token === "ETH" && path[1].token === "RGP")) {
            alert(`correct token ${path[0].token} and ${path[1].token}`)
            let result = checkForApproval(path[0])

            changeUIBasedOnResult(result)
          } else {
            sendNotice('Select the correct token pair')
            setSwapUserTokenBalance("select the correct pair")
          }
        } else {
          sendNotice('Select the designated token')
          setSwapUserTokenBalance("select a token")
        }
      } else {
        sendNotice('Enter the amount of token to exchange')
        setSwapUserTokenBalance("Enter amount")
      }
    } else {
      sendNotice('Please use the Connect button above')
      setSwapUserTokenBalance("Connect to wallet")
    }
  }
  const getToAmount = async (fromQty, field) => {
    const askAmount = (typeof fromQty == "undefined") ? fromAmount : fromQty;
    callTransformFunction(askAmount, field)
  };
  const callTransformFunction = async (askAmount = fromAmount, field = "from") => {
    console.log("calling callTransform")
    console.log(path)
    if (wallet.signer !== 'signer' && askAmount > 0 && path[1]) {
      if ((path[0].token === "RGP" && path[1].token === "BUSD") || (path[0].token === "BUSD" && path[1].token === "RGP")) {
        alert("call updateSendAmount")
        await updateSendAmount(wallet, path, askAmount, setAmountIn, setShowBox, setBoxMessage, setFromAmount, field);
      } else if ((path[0].token === "RGP" && path[1].token === "ETH") || (path[0].token === "ETH" && path[1].token === "RGP")) {
        alert("call updateRGPETHSendAmount")
        await updateRGPETHSendAmount(wallet, path, askAmount, setAmountIn, setShowBox, setBoxMessage, setFromAmount, field)
      } else {
        alert("wrong token")
      }

    }
  }
  const swapUserToken = async () => {
    let res = await checkForAllVariables()
    console.log("yes")
    if (res) {
      console.log(path)
      if ((path[0].token === "RGP" && path[1].token === "BUSD") || (path[0].token === "BUSD" && path[1].token === "RGP")) {
        console.log(res)
        await swapTokenForTokens()
      } else if ((path[0].token === "RGP" && path[1].token === "ETH") || (path[0].token === "ETH" && path[1].token === "RGP")) {
        console.log("eth")
        await ETHRGPSwapTokenForTokens()
      }

    } else {
      alert("something went wrong cannot swap")
    }
  const swapUserTokenOld = () => {
    //checkForAllVariables()
    // wallet.signer === 'signer' ?
    //   sendNotice('Please use the Connect button above')
    //   : typeof wallet.signer === 'object' && fromAmount == parseFloat(0.0)
    //     ? sendNotice('Enter the amount of token to exchange')
    //     : typeof wallet.signer === 'object' && fromAmount != parseFloat(0.0) && selectedToToken === 'Select a token'
    //       ? sendNotice('Select the designated token')
    //       : typeof wallet.signer === 'object' &&
    //         fromAmount != parseFloat(0.0) && selectedToToken !== 'Select a token'
    //         ? ((isNewUser) ? rgpApproval() : swapTokenForTokens())
    //         : null

  }
  const rgpApproval = async () => {
    if (wallet.signer !== 'signer') {
      const rgp = await rigelToken();
      const walletBal = await rgp.balanceOf(wallet.address);
      await rgp.approve(SMART_SWAP.SMART_SWAPPING, walletBal, {
        from: wallet.address,
        gasLimit: 150000,
        gasPrice: ethers.utils.parseUnits('20', 'gwei')
      });
    }
    return true
  };

  // Approval for BNB Tokens
  const bnbApproval = async () => {
    if (wallet.signer !== 'signer') {
      const bnb = await BNBTOKEN();
      const walletBal = await bnb.balanceOf(wallet.address);
      await bnb.approve(SMART_SWAP.SMART_SWAPPING, walletBal, {
        from: wallet.address,
        gasLimit: 150000,
        gasPrice: ethers.utils.parseUnits('20', 'gwei')
      });
    }
    return false
  };

  // // Approval for BNB Tokens
  // const ETHApproval = async () => {
  //   if (wallet.signer !== 'signer') {
  //     const eth = await WETH();
  //     const walletBal = await eth.balanceOf(wallet.address);
  //     await eth.approve(SMART_SWAP.SMART_SWAPPING, walletBal, {
  //       from: wallet.address,
  //       gasLimit: 150000,
  //       gasPrice: ethers.utils.parseUnits('20', 'gwei')
  //     });
  //   }
  //   return false
  // };

  const swapTokenForTokens = async () => {
    if (wallet.signer !== 'signer') {
      const rout = await router();
      const deadL = Math.floor(new Date().getTime() / 1000.0 + 300);
      const fromPath = ethers.utils.getAddress(path[0].fromPath);
      const toPath = ethers.utils.getAddress(path[1].toPath);
      const passOutPut = amountIn;
      try {
        await rout.swapExactTokensForTokens(
          Web3.utils.toWei(fromAmount.toString()),
          Web3.utils.toWei(amountIn.toString()),
          [fromPath, toPath],
          wallet.address,
          deadL,
          {
            from: wallet.address,
            gasLimit: 190000,
            gasPrice: ethers.utils.parseUnits('20', 'gwei'),
          },
        );
        notify({ title: 'Transaction  Message', body: 'Swap was successful', type: 'success' })

      } catch (e) {
        notify({ title: 'Transaction Message', body: e.message, type: 'error' })
      }
      console.log("Amount Input: ", amountIn, "OutputAmount: ", passOutPut,
        "From: ", fromPath, "To: ", toPath, "Recipient: ", wallet.address,
        'Deadline: ', deadL);
    }
  };

  useEffect(() => {
    const getBalance = async () => {
      if (wallet.signer !== 'signer') {
        // console.log("wallet address", wallet.address)
        // await checkUser();
        setRGPBalance(wallet_props[0] ? wallet_props[0].rgp : wallet.address);
        await checkUser(wallet, setIsNewUser);
        const busd = await BUSDToken();
        const bnb = await BNBTOKEN(); // THIS SHOULD BE USED FOR bnb ON FE
        setRGPBalance(wallet_props[0] ? wallet_props[0].rgp : wallet.address);
        setETHBalance(wallet ? wallet.balance : '0.0');
        setBUSDBalance(
          ethers.utils
            .formatEther(await busd.balanceOf(wallet.address))
            .toString(),
        );
        //cal this on UI for bnb balance
        setBNBBalance(
          ethers.utils
            .formatEther(await bnb.balanceOf(wallet.address))
            .toString(),
        );
      }
    };
    getBalance();
  }, [wallet]);


  const sendNotice = (message) => {
    props.notify({
      title: 'Site Information',
      body: message,
      type: 'info'
    })
  }
  return (
    <div>
      <Box
        boxShadow=" 0px 10px 20px  rgba(18, 1, 54,0.25)"
        bg="#120136"
        mt={3}
        p={5}
        rounded="2xl"
      >
        <SwapSettings
          transactionDeadline={transactionDeadline}
          setTransactionDeadline={setTransactionDeadline}
        />
        <From
          showMaxValue={showMaxValue}
          fromAmount={fromAmount}
          handleChangeFromAmount={handleChangeFromAmount}
          path={path}
          setPathArray={setPathArray}
          selectedToken={selectedToken}
          setSelectedToken={setSelectedToken}
          rgpBalance={rgpBalance}
          busdBalance={busdBalance}
          ETHBalance={ETHBalance}
          getToAmount={getToAmount}
          userWallet={props.wallet}
          setPath={setPath}
        />
        <Box textAlign="center">
          <ArrowDownImage />
        </Box>
        <To
          userWallet={props.wallet}
          amountIn={amountIn}
          handleChangeToAmount={handleChangeToAmount}
          setPathToArray={setPathToArray}
          setAmountIn={setAmountIn}
          selectedToToken={selectedToToken}
          setSelectedToToken={setSelectedToToken}
          rgpBalance={rgpBalance}
          busdBalance={busdBalance}
          ETHBalance={ETHBalance}
          getToAmount={getToAmount}
        />
        {showBox && <ShowMessageBox boxMessage={boxMessage} />}
        <Box mt={14}>
          <Button
            d="block"
            w="100%"
            h="50px"
            color="#40BAD5"
            border="none"
            fontWeight="regular"
            fontSize="lg"
            cursor="pointer"
            rounded="2xl"
            bg="rgba(64, 186, 213,0.25)"
            borderColor="#40BAD5"
            _hover={{ background: 'rgba(64, 186, 213,0.35)' }}
            _active={{ outline: '#29235E', background: '#29235E' }}
            disabled={disableSwapTokenButton}
            onClick={() => swapUserToken()}
          >
            {/* {wallet.signer === 'signer' ?
              'connect to Wallet'
              : typeof wallet.signer === 'object' && fromAmount == parseFloat(0.0)
                ? 'Enter Amount'
                : typeof wallet.signer === 'object' && fromAmount != parseFloat(0.0) && selectedToToken === 'Select a token'
                  ? 'Click Select a Token'
                  : typeof wallet.signer === 'object' &&
                    fromAmount != parseFloat(0.0) && selectedToToken !== 'Select a token'
                    ? ((isNewUser) ? 'Approve Transaction' : 'Swap Tokens')
                    : ''
            } */}
            {swapUserTokenBalance}
          </Button>
        </Box>
        <Box mt={6}>
          {approveButton && <Button
            d="block"
            w="100%"
            h="50px"
            color="#40BAD5"
            border="none"
            fontWeight="regular"
            fontSize="lg"
            cursor="pointer"
            rounded="2xl"
            bg="rgba(64, 186, 213,0.25)"
            borderColor="#40BAD5"
            _hover={{ background: 'rgba(64, 186, 213,0.35)' }}
            _active={{ outline: '#29235E', background: '#29235E' }}
            display={approveButton ? "block" : "none"}
            onClick={() => alert("approving token....")}
          >
            Approve
          </Button>


          }
        </Box>
      </Box>
    </div>
  );
};
const mapStateToProps = ({ wallet }) => ({ wallet });
export default connect(
  mapStateToProps,
  { notify },
)(Manual);

async function updateSendAmount(wallet, path, askAmount, setAmountIn, setShowBox, setBoxMessage, setFromAmount, field) {
  const rout = await router();
  if (typeof path[1] != 'undefined') {
    const { fromPath } = path[0];
    const { toPath } = path[1];
    try {
      const amount = await rout.getAmountsOut(
        Web3.utils.toWei(askAmount.toString()),
        (field != 'to') ? [fromPath, toPath] : [toPath, fromPath]
      );
      return (field != 'to') ? setAmountIn(
        ethers.utils.formatEther(amount[1]).toString()) : setFromAmount(ethers.utils.formatEther(amount[1]).toString());
    } catch (e) {
      setShowBox(true);
      setBoxMessage(e.message);
    }
    // try {
    //   const amount = await rout.getAmountsOut(
    //     Web3.utils.toWei(askAmount.toString()),
    //     (field != 'to') ? [fromPath, toPath] : [toPath, fromPath]
    //   );
    //   return (field != 'to') ? setAmountIn(
    //     ethers.utils.formatEther(amount[1]).toString()) : setFromAmount(ethers.utils.formatEther(amount[1]).toString());
    // } catch (e) {
    //   setShowBox(true);
    //   setBoxMessage(e.message);
    // }
  }
}

async function updateRGPETHSendAmount(wallet, path, askAmount, setAmountIn, setShowBox, setBoxMessage, setFromAmount, field) {
  const routRGPETH = await router();
  if (typeof path[1] != 'undefined') {
    const { fromPath } = path[0];
    const { toPath } = path[1];
    try {
      const amount = await routRGPETH.getAmountsOut(
        Web3.utils.toWei(askAmount.toString()),
        (field != 'to') ? [fromPath, toPath] : [toPath, fromPath]
      );
      return (field != 'to') ? setAmountIn(
        ethers.utils.formatEther(amount[1]).toString()) : setFromAmount(ethers.utils.formatEther(amount[1]).toString());
    } catch (e) {
      setShowBox(true);
      setBoxMessage(e.message);
    }
    // try {
    //   const amount = await rout.getAmountsOut(
    //     Web3.utils.toWei(askAmount.toString()),
    //     (field != 'to') ? [fromPath, toPath] : [toPath, fromPath]
    //   );
    //   return (field != 'to') ? setAmountIn(
    //     ethers.utils.formatEther(amount[1]).toString()) : setFromAmount(ethers.utils.formatEther(amount[1]).toString());
    // } catch (e) {
    //   setShowBox(true);
    //   setBoxMessage(e.message);
    // }
  }
}
function setPathObject(path, target) {
  const pathObject = path.find(value => value.hasOwnProperty('fromPath'));
  if (pathObject) pathObject.fromPath = target;
  else path.push({ fromPath: target });
}

async function RGPcheckAllowance() {
  if (wallet.signer !== 'signer') {
    const rgp = await rigelToken();
    const walletBal = await rgp.balanceOf(wallet.address);
    return await rgp.allowance(wallet.address, SMART_SWAP.MasterChef, { from: wallet.address });
  }
}

async function ETHcheckAllowance() {
  if (wallet.signer !== 'signer') {
    const eth = await WETH();
    const walletBal = await eth.balanceOf(wallet.address);
    return await eth.allowance(wallet.address, SMART_SWAP.router, { from: wallet.address });
  }
}

async function BUSDcheckAllowance() {
  if (wallet.signer !== 'signer') {
    const busd = await BUSDToken();
    const walletBal = await busd.balanceOf(wallet.address);
    return await busd.allowance(wallet.address, SMART_SWAP.router, { from: wallet.address });
  }
}

const checkUser = async (wallet, setIsNewUser) => {
  const rgp = await rigelToken();
  const checkAllow = await rgp.allowance(wallet.address, SMART_SWAP.router);
  if (wallet.signer !== 'signer') {
    if (checkAllow == setIsNewUser(true)) {
      return setIsNewUser(true)
    }
    return setIsNewUser(false)
  }
  if (ethers.utils.formatEther(checkAllow).toString() > 0) {
    return setIsNewUser(false)
  }
  return setIsNewUser(true)
};
