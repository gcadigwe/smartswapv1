// @ts-nocheck
/* eslint-disable prettier/prettier */
/*
 *
 * WalletProvider actions
 *
*/

import { NOTICE } from 'containers/NoticeProvider/constants';
import {
  connectMetaMask,
  getAddressTokenBalance,
  provider,
  signer,
} from 'utils/wallet-wiget/connection';
import { ethers } from 'ethers';
import { tokenList } from 'utils/constants';
import { formatBalance, isNotEmpty } from 'utils/UtilFunc';
import { getTokenDetails } from 'utils/tokens';
import {
  WALLET_CONNECTED,
  WALLET_PROPS,
  LOADING_WALLET,
  CLOSE_LOADING_WALLET,
  CLEAR_WALLET,
  CHANGE_DEADLINE,
  CHANGE_BNB,
  UPDATE_CHAIN_ID,
  GET_ALL_TOKEN,
  SET_USER_TOKEN,
  DELETE_USER_TOKEN,
  ADD_NEW_TOKEN_LIST,
  UPDATE_TOKEN_LIST,
  TOGGLE_LIST_SHOW,
  UPDATE_TO_TOKEN,
  UPDATE_FROM_TOKEN,
} from './constants';
import defaultTokenList from '../../utils/default-token.json';
import testNetTokenList from '../../utils/test-net-tokens.json';

export const reConnect = (wallet) => async dispatch => {
  try {
    dispatch({ type: LOADING_WALLET, payload: true });
    const { selectedAddress, chainId } = wallet;
    const ethProvider = await provider();
    const walletSigner = await signer();
    const balance = formatBalance(ethers.utils.formatEther(await ethProvider.getBalance(selectedAddress))).toString();
    const rgpBalance = await getAddressTokenBalance(selectedAddress, getTokenAddress(chainId), walletSigner);
    dispatch({
      type: WALLET_CONNECTED, wallet: {
        address: selectedAddress,
        provider: ethProvider, signer: walletSigner, chainId, balance
      },
    })
    dispatch({ type: WALLET_PROPS, payload: { rgpBalance } });
    dispatch({ type: CLOSE_LOADING_WALLET, payload: false });
  } catch (e) {
    return dispatch({
      type: NOTICE, message: {
        title: 'Connection Error:',
        body: 'Please reload this page and reconnect',
        type: 'error',
      }
    });
  } finally {
    dispatch({ type: CLOSE_LOADING_WALLET, payload: false });
  }

}

export const connectWallet = () => async dispatch => {
  try {
    dispatch({ type: LOADING_WALLET, payload: true });
    const ethProvider = await provider();
    const walletSigner = await signer()
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });

    const res = await connectMetaMask();
    dispatch({ type: CLOSE_LOADING_WALLET, payload: false });
    const balance = await ethProvider.getBalance(res[0]);
    dispatch({
      type: WALLET_CONNECTED, wallet: {
        address: res[0], balance: formatBalance(ethers.utils.formatEther(balance)),
        provider: ethProvider, signer: walletSigner, chainId,
      },
    });
    const rgpAddress = getTokenAddress(chainId);
    const rgpBalance = await getAddressTokenBalance(res[0], rgpAddress, walletSigner);
    dispatch({ type: WALLET_PROPS, payload: { rgpBalance } });
    return dispatch({
      type: NOTICE, message: {
        title: 'Success:',
        body: 'Connection was successful',
        type: 'success',
      }
    })
  } catch (e) {
    dispatch({ type: CLOSE_LOADING_WALLET, payload: false });
    return dispatch({
      type: NOTICE, message: {
        title: 'Connection Error',
        body: 'Please reload this page and reconnect',
        type: 'error',
      }
    });
  } finally {
    dispatch({ type: CLOSE_LOADING_WALLET, payload: false });

  }

};

export const setWalletProps = wallet => dispatch =>
  dispatch({
    type: WALLET_PROPS,
    payload: wallet,
  });

export function connectingWallet(option) {
  return dispatch => {
    dispatch({
      type: option ? LOADING_WALLET : CLOSE_LOADING_WALLET,
      payload: !!option,
    });
  };
}

export const disconnectWallet = () => dispatch => {
  dispatch({ type: CLEAR_WALLET, payload: null });
}
export const changeDeadlineValue = value => dispatch => {
  dispatch({ type: CHANGE_DEADLINE, payload: value })
}

export const updateChainId = chainId => dispatch => {
  dispatch({ type: UPDATE_CHAIN_ID, payload: chainId })
}

export const changeRGPValue = wallet => async dispatch => {
  if (wallet.signer != 'signer') {

    try {
      const { address } = wallet;
      const ethProvider = await provider();

      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const rgpBalance = await getAddressTokenBalance(wallet.address, getTokenAddress(chainId), wallet.signer);
      const balance = formatBalance(ethers.utils.formatEther(await ethProvider.getBalance(address))).toString();
      dispatch({ type: WALLET_PROPS, payload: { rgpBalance } });
      dispatch({ type: CHANGE_BNB, payload: { balance } })
    } catch (error) {
      console.log("error while trying to refresh data", error)
    }
  }
}

export const getTokenAddress = (chainId) => {
  if (chainId === '0x38' && window.ethereum !== undefined && window.ethereum.isMetaMask) {
    return '0xFA262F303Aa244f9CC66f312F0755d89C3793192';
  }
  if (chainId === '0x61' && window.ethereum !== undefined && window.ethereum.isMetaMask) {
    return '0x9f0227a21987c1ffab1785ba3eba60578ec1501b';
  }
  return window.ethereum !== undefined && window.ethereum.isTrust && chainId == '0x38' && '0xFA262F303Aa244f9CC66f312F0755d89C3793192';
}


export const getTokenList = () => async (dispatch) => {
  const tokenByNetwork = getChainId() === MAINNET.toString() ? defaultTokenList : testNetTokenList;
  const returnData = tokenByNetwork.map((token, id) => {
    const balance = null;
    const available = true;
    const imported = !!token.imported;
    return { ...token, id, balance, available, imported };
  });
  return dispatch({
    type: GET_ALL_TOKEN, payload: returnData
  })
}
export const getChainId = () => {
  if (window.ethereum && window.ethereum.chainId !== null) {
    return window.ethereum.chainId.toString();
  }
  return null;
};
const MAINNET =
  window.ethereum !== undefined && window.ethereum.isTrust ? '56' : '0x38';

export const importUserTokenAction = async (userTokenAddress) => {
  const tokenData = await getTokenDetails(userTokenAddress);
  return !isNotEmpty(tokenData) && storeUserToken(tokenData);
}

export const storeUserToken = (tokenData) => (dispatch) => dispatch({
  type: SET_USER_TOKEN, payload: tokenData
})


export const deleteUserTokenList = (address) => (dispatch) => dispatch({
  type: DELETE_USER_TOKEN, payload: address
})

export const importUriTokenList = (list) => (dispatch) => {
  dispatch({
    type: ADD_NEW_TOKEN_LIST, payload: list
  })
};

export const updateTokenListAction = (list) => (dispatch) => dispatch({
  type: UPDATE_TOKEN_LIST, payload: list
});

export const toggleDefaultTokenList = (option) => (dispatch) => dispatch({
  type: TOGGLE_LIST_SHOW, payload: option
})

export const updateToToken = (token) => (dispatch) => dispatch({
  type: UPDATE_TO_TOKEN, payload: token
});

export const updateFromToken = (token) => (dispatch) => dispatch({
  type: UPDATE_FROM_TOKEN, payload: token
});
