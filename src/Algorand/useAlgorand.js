import {useContext, useEffect} from 'react';
import {Context} from './Algorand.jsx';

function useAlgorand() {
  const algorand = useContext(Context);

  useEffect(() => {
    algorand.reconnect();
  }, [algorand.reconnect]);

  return algorand;
}

export {useAlgorand};