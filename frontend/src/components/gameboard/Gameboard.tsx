import { observer, inject } from 'mobx-preact'
import { Component, h } from 'preact'

import Board from './Board'
import Peg from './Peg'

const Picker = inject('gameStore')(observer(class CPicker extends Component {
  public componentDidMount() {
      this.props['gameStore'].registerWithServer()
  }

  public render() {
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
