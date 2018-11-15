import { h } from 'preact';
import Gameboard from './components/gameboard';
import Status from './components/status';

const App = () => (
  <div class='pure-g'>
    <div class='pure-u-2-3'>
        <Gameboard />
    </div>
    <div class='pure-u-1-3'>
        <Status />
    </div>
  </div>
);

export default App;
