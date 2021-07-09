import { tokenList } from 'utils/constants';
import { getTokenListBalance } from 'utils/wallet-wiget/TokensUtils';
import { isFunc } from 'utils/UtilFunc';
import { getAddress } from '@ethersproject/address'
import { Contract } from '@ethersproject/contracts'
import ERC20Token from 'utils/abis/ERC20Token.json';
import { getProvider } from 'utils/SwapConnect';

// import { SmartFactory } from './SwapConnect';
// list all transactions here
// export default async function Tokens() {
   // const tokens = {
   //     tokens: [
   //         'BNB',
   //         'ETH',
   //         'RGP',
   //     ],
   //     listTokens: ''
   // }

//   const swap = async e => {
//     const { SmartSwapContractAddress } = await SmartFactory();
     // adding liquidity

//     const addLiquid = await SmartSwapContractAddress.addLiquidity(
//       tokenA,
//       tokenB,
//       amountADesired,
//       amountBDesired,
//       amountAMin,
//       amountBMin,
//       addTo,
//       dline,
//     );

//     // Adding liquidity for ETH
//     const addETHLiquid = await SmartSwapContractAddress.addLiquidityETH(
//       token,
//       amountofTokenDesired,
//       amountTokenMin,
//       amountETHmin,
//       addTo,
//       dline,
//     );

//     // remove liquidity for ETH
//     const removETHLiquid = await SmartSwapContractAddress.removeLiquidityETH(
//       token,
//       amountofTokenDesired,
//       amountTokenMin,
//       amountETHmin,
//       addTo,
//       dline,
//     );

//     // removeLiquidity
//     const removeLiquid = await SmartSwapContractAddress.removeLiquidity(
//       tokenA,
//       tokenB,
//       liquidity,
//       amountAMin,
//       amountBMin,
//       addTo,
//       dline,
//     );

//     // swapping Exact token for tokens
//     const swapExactTokforTok = await SmartSwapContractAddress.swapExactTokensForTokens(
//       amountIn,
//       amountOutMin,
//       path,
//       addressTo,
//       deadline,
//     );

//     // swapping exact token for eth
//     const swapExactTokforETH = await SmartSwapContractAddress.swapExactTokensForETH(
//       amountIn,
//       amountOutMin,
//       path,
//       addressTo,
//       deadline,
//     );

//     // swapping eth for exact tokens
//     const swapETHForExactTok = await SmartSwapContractAddress.swapETHForExactTokens(
//       amountOut,
//       amountInMax,
//       path,
//       addressTo,
//       deadline,
//     );

//     // swapping Tokens for exact eth
//     const swapTokforExactEth = await SmartSwapContractAddress.swapTokensForExactETH(
//       amountOut,
//       amountInMax,
//       path,
//       addressTo,
//       deadline,
//     );

//     // swapping token for exact tokens
//     const swapTokForExactTok = await SmartSwapContractAddress.swapTokensForExactTokens(
//       amountOut,
//       amountInMax,
//       path,
//       addressTo,
//       deadline,
//     );
//   };
// }

// SEARCH TOKENS
export const getTokenList =async (searchToken) =>{
   console.log(searchToken)
   let token;
   const filteredTokenList = filterAvailableTokenList(searchToken)
   if(filteredTokenList.length>0){
      return filteredTokenList
   }else{
      let addressOfToken =await  isItAddress(searchToken)
      console.log({addressOfToken})
     let tokenData = addressOfToken ? await getTokenWithContract(searchToken) : await getTokenWithoutContract(searchToken)
      return tokenData.length > 0 ? tokenData : 0
   }
}

export const getTokenWithContract = async (searchToken) =>{
   console.log({searchToken})
   let contract =await new Contract(searchToken, ERC20Token, getProvider())
   console.log({contract})
   try{
      let name = await contract.name()
   let balance = await contract.balanceOf("0x3552b618dc1c3d5e53818c651bc41ae7a307f767")
   let tokenObject = [{
      name: name.toString(),
      balance: balance.toString()
   }]
    console.log({tokenObject})
   return tokenObject   
   }catch(e){
      console.log(e)
   }

}
export const getTokenWithoutContract = (searchToken) =>{
alert("without contract")
return []
}
export const isItAddress  = (token) => {
   try {
      console.log(token)
      return getAddress(token)
 
    } catch {
      return false
    }
}

export const filterAvailableTokenList =(searchToken) =>{
 const filteredTokenList = tokenList.filter(
        token =>
          token.symbol.toLowerCase().includes(searchToken.toLowerCase()) ||
          token.name.toLowerCase().includes(searchToken.toLowerCase()),
      );
     return filteredTokenList
}