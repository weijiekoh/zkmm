import { h, Component } from 'preact';
import Gameboard from './components/gameboard';
import Status from './components/status';
import { Provider } from 'mobx-preact'
import { GameStore } from './models'


export default class App extends Component {
  render() {
    let store = {
      gameStore: new GameStore()
    }
    return (
      <Provider {...store }>
        <div class='pure-g'>
          <div class='pure-u-2-3'>
              <Gameboard />
          </div>
          <div class='pure-u-1-3'>
              <Status />
          </div>
        </div>
      </Provider>
    )
  }
}
