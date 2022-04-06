import {createContext, useReducer, useCallback, useEffect} from 'react';
import WalletConnect from '@walletconnect/client';
import QRCodeModal from 'algorand-walletconnect-qrcode-modal';
import algosdk from 'algosdk';
import {formatJsonRpcRequest} from '@json-rpc-tools/utils';

import reducer from './reducer.js';

const Context = createContext();

const constants = {
  walletConnectOptions: {
    bridge: 'https://bridge.walletconnect.org',
    qrcodeModal: QRCodeModal
  },
  transactionTimeout: 10 // rounds
};

function Provider(props) {
  const [state, dispatch] = useReducer(reducer, {
    connector: null,
    account: null,
    isInitialized: false,
    isWaiting: false
  });

  const attachConnectorListeners = useCallback(
    (connector) => {

      connector.on('connect', (error, payload) => {
        dispatch({type: 'didConnect', payload: connector});
      });
      connector.on('disconnect', (error, payload) => {
        dispatch({type: 'didDisconnect'});
        console.log(error, payload);
      });
      connector.on('session_request', (error, payload) => {
        console.log('session_request');
        console.log(error, payload);
      });
      connector.on('session_update', (error, payload) => {
        console.log('session_update');
        console.log(error, payload);
      });
      connector.on('call_request', async (error, payload) => {
        // Once a signature request is performed, this is triggered.
        if (error && error.message === 'Parse error') {
          // I haven't figured a reason why this error occurs.
          // It always happens after I reload Chrome while having Pera wallet open.
          // The error is comes directly from WalletConnect as a WebSocket message.
          // Reference:
          // 1. https://github.com/WalletConnect/walletconnect-monorepo/blob/v1.0/packages/clients/core/src/events.ts#L66
          // 2. https://github.com/WalletConnect/walletconnect-monorepo/blob/54f3ca0b1cd1ac24e8992a5a812fdfad01769abb/packages/helpers/utils/src/validators.ts#L56
          return;
        }
        console.log('call_request');
        console.log(error, payload);
      });
      connector.on('wc_sessionRequest', (error, payload) => {
        console.log('wc_sessionRequest');
        console.log(error, payload);
      });
      connector.on('wc_sessionUpdate', (error, payload) => {
        console.log('wc_sessionUpdate');
        console.log(error, payload);
      });
    },
    []
  );

  const connect = async () => {
    const connector = new WalletConnect(constants.walletConnectOptions);
    await connector.createSession();
    attachConnectorListeners(connector);
    if (!connector.connected) {
      await connector.createSession();
      if (connector.connected) {
        dispatch({type: 'didConnect', payload: connector});
      }
    }
  };
  const reconnect = useCallback(
    () => {
      const connector = new WalletConnect(constants.walletConnectOptions);
      attachConnectorListeners(connector);
      if (connector.connected) {
        dispatch({type: 'didConnect', payload: connector});
      }
      dispatch({type: 'setInitialized', payload: true});
    },
    [attachConnectorListeners]
  );
  const disconnect = async () => {
    if (state.connector) {
      await state.connector.killSession();
    }
  };

  useEffect(() => {
    reconnect();
  }, [reconnect]);

  return (
    <Context.Provider
      value={{
        state,
        connect,
        disconnect,
        reconnect
      }}
    >
      {props.children}
    </Context.Provider>
  );
}

export {
  Context,
  Provider
};