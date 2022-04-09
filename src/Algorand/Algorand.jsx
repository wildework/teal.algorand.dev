import {createContext, useReducer, useCallback, useEffect} from 'react';
import WalletConnect from '@walletconnect/client';
import QRCodeModal from 'algorand-walletconnect-qrcode-modal';
import algosdk from 'algosdk';
import {formatJsonRpcRequest} from '@json-rpc-tools/utils';

import reducer from './reducer.js';

const Context = createContext();

// AlgoExplorer moved their Node and Indexer endpoints, which is why the original algorand.dev isn't working.
const client = new algosdk.Algodv2('', 'https://node.testnet.algoexplorerapi.io/', '');
// const indexer = new algosdk.Indexer('', 'https://algoindexer.testnet.algoexplorerapi.io/', '');
// const explorer = 'https://testnet.algoexplorer.io';

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

  const onSignatureSuccess = async (signedTransaction) => {
    const decodedTransaction = signedTransaction.map((transaction) => {
      if (transaction) {
        return new Uint8Array(Buffer.from(transaction, 'base64'))
      } else {
        return null;
      }
    });

    try {
      const response = await client.sendRawTransaction(decodedTransaction).do();
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  };

  const sign = async (transaction) => {
    const encodedTransaction = Buffer
      .from(algosdk.encodeUnsignedTransaction(transaction))
      .toString('base64');
    
    const request = formatJsonRpcRequest(
      'algo_signTxn',
      [
        [
          {
            txn: encodedTransaction,
            message: 'Test #1'
          }
        ]
      ]
    );

    try {
      const response = await state.connector.sendCustomRequest(request);
      console.log('success');
      console.log(response);
      onSignatureSuccess(response);
    } catch (error) {
      console.log('error');
      console.log(error);
    }
  };

  const compile = async (teal) => {
    const program = await client.compile(teal).do();
    const bytecode = Uint8Array.from(Buffer.from(program.result, 'base64'));

    return bytecode;
  };
  const deploy = async (approvalCode, clearCode, stateAllocation) => {
    const approvalProgram = await compile(approvalCode);
    const clearProgram = await compile(clearCode);

    const suggestedParams = await client.getTransactionParams().do();

    // Reference: https://algorand.github.io/js-algorand-sdk/modules.html#makeApplicationCreateTxnFromObject
    const transaction = await algosdk.makeApplicationCreateTxnFromObject({
      approvalProgram,
      clearProgram,
      from: state.account,
      numGlobalByteSlices: stateAllocation.global.bytes,
      numGlobalInts: stateAllocation.global.ints,
      numLocalByteSlices: stateAllocation.local.bytes,
      numLocalInts: stateAllocation.local.ints,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
      suggestedParams: {
        ...suggestedParams,
        lastRound: suggestedParams.firstRound + 10
      },
    });

    console.log(transaction);
    sign(transaction);
  };

  const redeploy = async (applicationID, approvalCode, clearCode) => {
    const approvalProgram = await compile(approvalCode);
    const clearProgram = await compile(clearCode);

    const suggestedParams = await client.getTransactionParams().do();

    // Reference: https://algorand.github.io/js-algorand-sdk/modules.html#makeApplicationUpdateTxnFromObject
    const transaction = await algosdk.makeApplicationUpdateTxnFromObject({
      appIndex: applicationID,
      approvalProgram,
      clearProgram,
      from: state.account,
      suggestedParams: {
        ...suggestedParams,
        lastRound: suggestedParams.firstRound + 10
      }
    });

    console.log(transaction);
    sign(transaction);
  };

  const execute = async (applicationID, method, parameters = []) => {
    const suggestedParams = await client.getTransactionParams().do();

    const encodedParameters = [
      method,
      ...parameters
    ].map((parameter) => {
      if (typeof parameter === 'string') {
        return Uint8Array.from(parameter, (character) => character.charCodeAt(0));
      } else if (Number.isInteger(parameter)) {
        return algosdk.encodeUint64(parameter);
      } else {
        return null;
      }
    }).filter((parameter) => parameter !== null);

    // Reference: https://algorand.github.io/js-algorand-sdk/modules.html#makeApplicationNoOpTxnFromObject
    const transaction = await algosdk.makeApplicationNoOpTxnFromObject({
      appArgs: encodedParameters,
      appIndex: applicationID,
      from: state.account,
      suggestedParams: {
        ...suggestedParams,
        lastRound: suggestedParams.firstRound + 10
      }
    });

    console.log(transaction);
    sign(transaction);
  };

  const executeABI = async (application, method, parameters) => {
    const suggestedParams = await client.getTransactionParams().do();
    
    const composer = new algosdk.AtomicTransactionComposer();

    // TODO: This doesn't work because [signer] is not aware of WalletConnect and crashes.

    composer.addMethodCall({
      method: application.methods.find((candidate) => candidate.name === method),
      methodArgs: [33],
      appID: application.networks[suggestedParams.genesisHash].appID,
      sender: state.account,
      suggestedParams,
      signer: algosdk.makeBasicAccountTransactionSigner(state.account)
    });

    // const group = composer.buildGroup();
    const result = await composer.execute(client, 10);
    console.log(result);
  };

  return (
    <Context.Provider
      value={{
        state,
        connect,
        disconnect,
        reconnect,
        compile,
        deploy,
        redeploy,
        execute,
        executeABI
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