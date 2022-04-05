import {createContext, useReducer, useCallback} from 'react';
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
      connector.on('call_request', (error, payload) => {
        // Once a signature request is performed, this is triggered.
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
    console.log(connector);
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