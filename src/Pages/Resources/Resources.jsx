import {Link} from 'react-router-dom';

import links from './links.js'

import Links from './Links.jsx';

function Resources(props) {
  return (
    <>
      <nav className="breadcrumb" aria-label="breadcrumbs">
        <ul>
          <li>
            <Link to="/">Menu</Link>
          </li>
          <li className="is-active">
            <Link to="/resources" aria-current="page">Developer Resources</Link>
          </li>
        </ul>
      </nav>
      <h1 className="title">Resources</h1>
      <h2 className="subtitle">My favorite places to learn more about Algorand, AVM, TEAL, etc.</h2>
      <div className="content">
        <p>
          I made this page to be my entry point when studying a specific Algorand development topic. In its current form this is mostly a list of categorized links, but I plan on providing more context down the line.
        </p>

        <h3>Client</h3>
        <Links list={links['client']} />

        <h3>Applications</h3>
        <Links list={links['applications']} />

        <h3>Explorers</h3>
        <Links list={links['explorers']} />

        <h3>Algorand Node</h3>
        <Links list={links['node']} />

        <h3>Developers</h3>
        <Links list={links['developers']} />

      </div>
    </>
  );
}

export {Resources};