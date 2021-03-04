import { put, all, fork, takeEvery, takeLatest } from 'redux-saga/effects';
import { notify } from '../NoticeProvider/actions';
import { connectedWallet } from './actions';
import { WALLET_CONNECTED } from './constants';

export function* connectWallet() {
  try {
    yield put(
      notify({
        title: 'System Error:',
        message: 'e',
        type: 'error',
      }),
    );
  } catch (e) {
    yield put(
      notify({
        title: 'System Error:',
        message: e,
        type: 'error',
      }),
    );
  }
}
export function* walletProviderSaga() {
  yield takeLatest(WALLET_CONNECTED, linkWallet);
}

export default function* rootSaga() {
  yield all([fork(walletProviderSaga)]);
}
