import {useReducer, useEffect, useCallback} from 'react';

import WalletConnect from '@walletconnect/client';
import QRCodeModal from 'algorand-walletconnect-qrcode-modal';
import algosdk from 'algosdk';
import {formatJsonRpcRequest} from '@json-rpc-tools/utils';

function reducer(state, action) {
  switch (action.type) {
    case 'setInitialized': {
      return {
        ...state,
        isInitialized: true
      };
    }
    case 'didConnect': {
      const connector = action.payload;

      return {
        ...state,
        connector,
        account: connector.accounts[0]
      };
    }
    case 'didDisconnect': {
      return {
        ...state,
        connector: null,
        account: null
      };
    }
    case 'startWaiting': {
      return {
        ...state,
        isWaiting: true
      };
    }
    case 'stopWaiting': {
      return {
        ...state,
        isWaiting: false
      };
    }
    case 'addPendingTransaction': {
      return {
        ...state,
        pendingTransactions: [
          ...state.pendingTransactions,
          action.payload
        ]
      };
    }
    case 'removePendingTransaction': {
      const transaction = {
        ID: action.payload.ID,
        block: action.payload.block
      };
      return {
        ...state,
        pendingTransactions: state.pendingTransactions.filter((candidate) => candidate !== transaction.ID),
        completedTransactions: [
          ...state.completedTransactions,
          transaction
        ]
      };
    }
    case 'addSignatureRequest': {
      return {
        ...state,
        signatureRequests: [
          ...state.signatureRequests,
          action.payload
        ]
      };
    }
    case 'removeSignatureRequests': {
      return {
        ...state,
        signatureRequests: [],
      };
    }
    default:
      return action;
  }
}

const constants = {
  walletConnectOptions: {
    bridge: 'https://bridge.walletconnect.org',
    qrcodeModal: QRCodeModal
  },
  transactionTimeout: 10 // rounds
};

function App() {
  const [state, dispatch] = useReducer(reducer, {
    connector: null,
    account: null,
    isInitialized: false,
    isWaiting: false,
    pendingTransactions: [
      // 'U2XBAFIRE4DQJP6VUUFZ7XLY664HMCBKQJ4MKSQ3D2RW73JGF5LA',
    ],
    completedTransactions: [
      // {
      //   ID: 'U2XBAFIRE4DQJP6VUUFZ7XLY664HMCBKQJ4MKSQ3D2RW73JGF5LA',
      //   block: '17528707'
      // }
    ],
    signatureRequests: []
  });

  console.log(state);

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

  useEffect(() => {
    reconnect();
  }, [reconnect]);

  return (
    <div
      className="App"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
    >
      <nav className="navbar is-transparent">
        <div className="navbar-brand">
          <h1 className="title is-4" style={{margin: '0'}}>
            <a className="navbar-item" href="https://bulma.io" style={{color: 'black'}}>
              Algorand.dev
            </a>
          </h1>
          <div className="navbar-burger burger" data-target="navbarExampleTransparentExample">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <div id="navbarExampleTransparentExample" className="navbar-menu">
          <div className="navbar-start">
            <a className="navbar-item" href="/">Home</a>
          </div>

          <div className="navbar-end">
            <div className="navbar-item">
              <div className="field is-grouped">
                <p className="control">
                  <a className="button is-primary" href="/">
                    <span className="icon">
                      <i className="far fa-envelope-open"></i>
                    </span>
                    <span>Contact</span>
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <section className="hero is-medium is-primary is-bold">
        <div className="hero-body">
          <div className="container">
            <h1 className="title">Developers!</h1>
            <h2 className="subtitle">Algorand is coming</h2>
          </div>
        </div>
      </section>

      <section className="section is-flex-grow-1">
        <div className="container">
          <h1 className="title">Sandbox</h1>
          <h2 className="subtitle">Watch out below...</h2>
          <p>
            <button onClick={connect}>Connect</button>
            <button onClick={disconnect}>Disconnect</button>
          </p>
          <p>
            {state.account && <pre>{state.account}</pre>}
          </p>
        </div>
      </section>

      <footer className="footer">
        <div className="content has-text-centered">
          <p>
            The future of <strong>Algorand</strong> adoption
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
