import { h, Component } from 'preact'
import { observer, inject } from 'mobx-preact'

import Peg from './Peg'
import Board from './Board'

const Picker = inject('gameStore')(observer(class Picker extends Component {
  componentDidMount() {
      this.props['gameStore'].registerWithServer()
  }

  render () {
    return (
      <div class='picker'>
      <p>Colour picker</p>
      <div class='pegs'>
      <Peg colour='R' />
      <Peg colour='G' />
      <Peg colour='B' />
      <Peg colour='Y' />
      </div>
      </div>
    )
  }
}))

const Gameboard = () => (
  <div class='gameboard'>
  <Picker />
  <Board />
  </div>
)

export default Gameboard
