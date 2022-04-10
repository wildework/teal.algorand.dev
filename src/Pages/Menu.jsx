import {Link} from 'react-router-dom';

function Menu(props) {
  return (
    <>
      <div className="content">
        <ul>
          <li>
            <Link to="/resources">Developer resources</Link>
          </li>
          <li>
            <Link to="/teal">TEAL</Link>
          </li>
          <li>
            <Link to="/counter">Counter</Link>
          </li>
        </ul>
      </div>
    </>
  );
}

export {Menu};