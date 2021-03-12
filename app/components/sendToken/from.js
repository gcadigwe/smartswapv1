// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useDisclosure } from '@chakra-ui/hooks';
import { Box, Flex, Text } from '@chakra-ui/layout';
import { Input } from '@chakra-ui/input';
import { connect } from 'react-redux';
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/modal';
import { ethers } from 'ethers';
import RigelToken from 'utils/abis/RigelToken.json';

import swapConnect from '../../utils/swapConnect';
import InputSelector from './InputSelector';
import RGPImage from '../../assets/rgp.svg';
import BNBImage from '../../assets/bnb.svg';
import ArrowDownImage from '../../assets/arrow-down.svg';
import ETHImage from '../../assets/eth.svg';
import { TOKENS, TOKENS_CONTRACT } from '../../utils/constants';

const Manual = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedToken, setSelectedToken] = useState(TOKENS.RGP);
  const [rgpBalance, setRGPBalance] = useState('0.0');
  const [fromAmount, setFromAmount] = useState('');
  const [path, setPath] = useState([]);
  const handleChangeFromAmount = event => setFromAmount(event.target.value);
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  swapConnect()
  useEffect(() => {
    const rigelToken = async () => {
      const rgpContractAddress = '0xD848eD7f625165D7fFa9e3B3b0661d6074902FD4';
      const rgp2ABI = RigelToken;
      const rgpToken = new ethers.Contract(rgpContractAddress, rgp2ABI, signer);
      const rigelBal = await rgpToken.balanceOf(
        '0x2289Bc372bc6a46DD3eBC070FC5B7b7A49597A4E',
      );
      const balance = ethers.utils.formatEther(rigelBal).toString();
      setRGPBalance(balance);
    };
    rigelToken();
  }, []);
  return (
    <>
      <Box
        color="#fff"
        bg="#29235E"
        h="100%"
        mb="10px"
        justifyContent="space-between"
        px={4}
        rounded="2xl"
      >
        <Flex justifyContent="space-between" mb={1}>
          <Text fontSize="sm" color="#40BAD5">
            From
          </Text>
          <Text fontSize="sm" color=" rgba(255, 255, 255,0.50)">
            {/* Balance: {tokenBalance} */}
            Balance: {rgpBalance}
          </Text>
        </Flex>
        <InputSelector
          handleChange={handleChangeFromAmount}
          value={fromAmount}
          max
          onOpen={onOpen}
          selectedToken={selectedToken}
        />
      </Box>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent
          bg="#120136"
          color="#fff"
          borderRadius="20px"
          width="90vw"
          minHeight="60vh"
        >
          <ModalCloseButton
            bg="none"
            border="0px"
            color="#fff"
            cursor="pointer"
            _focus={{ outline: 'none' }}
          />
          <ModalHeader fontWeight="light">Select a token</ModalHeader>
          <ModalBody mt={4}>
            <Input
              placeholder="Search by name or paste address"
              borderColor="#40BAD5"
              color="gray.500"
              rounded="2xl"
              h="50px"
              fontSize="sm"
              variant="outline"
            />
            <Flex justifyContent="space-between" mt={5}>
              <Text fontSize="sm" fontWeight="light" color="#fff">
                Token
              </Text>
              <ArrowDownImage />
            </Flex>
            <Flex
              justifyContent="space-between"
              mt={3}
              cursor="pointer"
              onClick={() => {
                setSelectedToken(TOKENS.BNB);
                setPath(TOKENS_CONTRACT.BNB);
                onClose();
              }}
            >
              <Flex alignItems="center">
                <BNBImage />
                <Text fontSize="md" fontWeight="regular" color="#fff" ml={2}>
                  {TOKENS.BNB}
                </Text>
              </Flex>
              <Text fontSize="md" fontWeight="regular" color="#fff">
                0
              </Text>
            </Flex>
            <Flex
              justifyContent="space-between"
              mt={1}
              cursor="pointer"
              onClick={() => {
                setSelectedToken(TOKENS.ETH);
                setPath(TOKENS_CONTRACT.ETH);
                onClose();
              }}
            >
              <Flex alignItems="center">
                <ETHImage />
                <Text fontSize="md" fontWeight="regular" color="#fff" ml={2}>
                  {TOKENS.ETH}
                </Text>
              </Flex>
              <Text fontSize="md" fontWeight="regular" color="#fff">
                0
              </Text>
            </Flex>
            <Flex
              justifyContent="space-between"
              mt={1}
              cursor="pointer"
              onClick={() => {
                setSelectedToken(TOKENS.RGP);
                setPath(TOKENS_CONTRACT.RGP);
                onClose();
              }}
            >
              <Flex alignItems="center">
                <RGPImage />
                <Text fontSize="md" fontWeight="regular" color="#fff" ml={2}>
                  {TOKENS.RGP}
                </Text>
              </Flex>
              <Text fontSize="md" fontWeight="regular" color="#fff">
                {rgpBalance}
              </Text>
            </Flex>
          </ModalBody>

          <ModalFooter />
        </ModalContent>
      </Modal>
    </>
  );
};

export default connect()(Manual);
