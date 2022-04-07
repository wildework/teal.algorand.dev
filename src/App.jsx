// import {useEffect} from 'react';
import {Provider as AlgorandProvider, useAlgorand} from './Algorand';

function App() {
  const algorand = useAlgorand();

  console.log(algorand.state);

  const deploy = async () => {
    const approvalCode = `
      #pragma version 6
      txn ApplicationID
      int 0
      ==
      bnz initialize
      //
      // Do nothing.
      //
      int 1
      return
      //
      // Initialize application
      //
      initialize:
      byte "Count"
      int 0
      app_global_put
      int 1
      return
    `;
    const clearCode = `
      #pragma version 6
      int 1
      return
    `;
    const result = await algorand.deploy(
      approvalCode,
      clearCode,
      {
        global: {
          ints: 1,
          bytes: 0
        },
        local: {
          ints: 0,
          bytes: 0
        }
      }
    );
    console.log(result);
  };

  const applicationID = 82724157;

  const redeploy = async () => {
    const approvalCode = `
      #pragma version 6
      // Transaction to create the application.
      txn ApplicationID
      int 0
      ==
      bnz initialize
      // Transaction to update the application.
      txn OnCompletion
      int UpdateApplication
      ==
      bnz initialize
      // Transaction to increment value.
      txna ApplicationArgs 0
      byte "Add"
      ==
      bnz increment
      //
      // Do nothing.
      //
      int 1
      return
      //
      // Initialize application
      //
      initialize:
      byte "Count"
      int 0
      app_global_put
      int 1
      return
      //
      // Increment value
      //
      increment:
      byte "Count"
      app_global_get
      store 0
      byte "Count"
      load 0
      int 1
      +
      app_global_put
      int 1
      return
    `;
    const clearCode = `
      #pragma version 6
      int 1
      return
    `;
    const result = await algorand.redeploy(applicationID, approvalCode, clearCode);
    console.log(result);
  };

  const add = async () => {
    const result = await algorand.execute(applicationID, 'Add');
    console.log(result);
  };

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
          <p className="block">
            <button onClick={algorand.connect}>Connect</button>
            <button onClick={algorand.disconnect}>Disconnect</button>
          </p>
          {algorand.state.account && <pre className="block">{algorand.state.account}</pre>}
          <p className="block">
            <button onClick={deploy}>Deploy</button>
            <button onClick={redeploy}>Redeploy</button>
            <button onClick={add}>Add</button>
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

function WrappedApp(props) {
  return (
    <AlgorandProvider>
      <App />
    </AlgorandProvider>
  );
}

export default WrappedApp;
