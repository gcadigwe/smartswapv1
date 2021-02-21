/**
 *
 * Smart Swapping Page
 *  Add Git Book Link to show Others what we ant to achieve
 */

import React, { memo, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import { Box, Flex, Text } from '@chakra-ui/react';

import Layout from 'components/layout/index';
import ActiveOrder from 'components/order/ActiveOrder';
import ShowDetails from 'components/detail/ShowDetails';
import ChartGraph from 'components/charts/ShowChart';
import SendToken from 'components/sendToken';
import History from 'components/history';
import { TABS } from 'utils/constants';

import { useInjectSaga } from 'utils/injectSaga';
import { useInjectReducer } from 'utils/injectReducer';
import makeSelectSmartSwappingPage from './selectors';
import reducer from './reducer';
import saga from './saga';
import styles from '../../styles/Home.css';

export function SmartSwappingPage() {
  useInjectReducer({ key: 'smartSwappingPage', reducer });
  useInjectSaga({ key: 'smartSwappingPage', saga });
  const [tab, setTab] = useState(TABS.MANUAL);
  return (
    <Layout title="Smart Swapping Page">
      <Flex mx={2} flexWrap="wrap">
        <Box mx={5} w={['100%', '100%', '45%', '29.5%']} mb={4}>
          <Box bg="#120136" rounded="2xl">
            {tab === TABS.MANUAL ? <ShowDetails /> : <ActiveOrder active />}
          </Box>
        </Box>

        <Box mx={5} w={['100%', '100%', '45%', '29.5%']} rounded="lg" mb={4}>
          <Box bg="#120136" rounded="2xl">
            <Flex color="gray.500" justifyContent="space-between" px={4}>
              <Text
                cursor="pointer"
                className={
                  tab === TABS.MANUAL ? styles.active : styles.inactive
                }
                onClick={() => {
                  setTab(TABS.MANUAL);
                }}
              >
                Manual
              </Text>
              <Text
                cursor="pointer"
                className={tab === TABS.PRICE ? styles.active : styles.inactive}
                onClick={() => {
                  setTab(TABS.PRICE);
                }}
              >
                Set price
              </Text>
              <Text
                cursor="pointer"
                className={
                  tab === TABS.AUTO_TIME ? styles.active : styles.inactive
                }
                onClick={() => {
                  setTab(TABS.AUTO_TIME);
                }}
              >
                Auto Time
              </Text>
            </Flex>
          </Box>
          <ChartGraph />
          <SendToken />
        </Box>
        <Box mx={5} w={['100%', '100%', '45%', '29.5%']} mb={4}>
          <Box bg="#120136" rounded="2xl">
            <History />
          </Box>
        </Box>
      </Flex>
    </Layout>
  );
}

SmartSwappingPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  smartSwappingPage: makeSelectSmartSwappingPage(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(
  withConnect,
  memo,
)(SmartSwappingPage);
