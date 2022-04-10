import {cx, css} from '@emotion/css';
import {BrowserRouter, Routes, Route, Outlet, Link} from 'react-router-dom';

import {Provider as AlgorandProvider, useAlgorand} from './Algorand';
import * as Counter from './AlgorandCounter';

import * as Pages from './Pages';

const styles = {
  container: css({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'auto',
    backgroundColor: '#e0e0e0'
  }),
  head: css({
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'row',
    padding: '32px',
    borderBottom: '1px solid #eeeeee',
    backgroundColor: '#f5f5f5',
  }),
  body: css({
    boxSizing: 'border-box',
    flex: '1',
    padding: '32px',
    backgroundColor: '#fafafa',
  }),
  feet: css({
    boxSizing: 'border-box',
    padding: '32px 32px 64px 32px',
    borderTop: '1px solid #eeeeee',
    backgroundColor: '#fafafa',
  }),
};



function App(props) {
  const algorand = useAlgorand();

  console.log(algorand.state);

  const onToggleAuthentication = () => {
    if (algorand.state.account) {
      algorand.disconnect();
    } else {
      algorand.connect();
    }
  };

  return (
    <div className={cx(styles.container)}>
      <div className={cx(styles.head)}>
        <h1 className="title" style={{flex: '1', margin: '0'}}>
          <Link to="/" style={{fontSize: '0.7em'}}>
            Algorand.dev
          </Link>
        </h1>
        <button className="button is-primary" onClick={onToggleAuthentication}>
          <span className="icon">
            <i className="far fa-user"></i>
          </span>
          <span>{algorand.state.account ? 'Disconnect' : 'Connect'}</span>
        </button>
      </div>
      <div className={cx(styles.body)}>
        {algorand.state.account &&
          <div className="tags has-addons">
            <span className="tag is-dark">Account</span>
            <span className="tag" style={{justifyContent: 'flex-start', width: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{algorand.state.account}</span>
          </div>
        }
        <Outlet />
      </div>
      <div className={cx(styles.feet)}>
        Built by
        {' '}
        <a href="https://twitter.com/algorand_dev">
          Morgan Wilde
        </a>
      </div>
    </div>
  );
}

function WrappedApp(props) {
  return (
    <BrowserRouter>
      <AlgorandProvider
        modules={[
          {
            bundle: Counter
          }
        ]}
      >
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Pages.Menu />} />
            <Route path="/resources" element={<Pages.Resources />} />
            <Route path="/teal" element={<Pages.TEAL />} />
            <Route path="/counter" element={<Pages.Counter />} />
          </Route>
        </Routes>
      </AlgorandProvider>
    </BrowserRouter>
  );
}

export default WrappedApp;