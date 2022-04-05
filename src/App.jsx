import {Provider as AlgorandProvider, useAlgorand} from './Algorand';

function App() {
  const algorand = useAlgorand();

  console.log(algorand.state);

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
          {algorand.state.account && <pre>{algorand.state.account}</pre>}
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
