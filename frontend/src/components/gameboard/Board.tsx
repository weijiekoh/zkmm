import { h, Component } from 'preact'
import { observer, inject } from 'mobx-preact'
import Peg from './Peg'

const Board = inject('gameStore')(observer(class Board extends Component {
  render () {
    console.log(this.props['gameStore'].guesses)
    return (
      <div class='board'>
        <div class='current pure-u-2-3'>
          {this.props['gameStore'].pendingPegs.map(peg => {
            return (
              <Peg colour={peg} />
            )
          })}
        </div>

        <div class='pure-u-1-3'>
          {this.props['gameStore'].pendingPegs.length === 4 && 
              <button 
                onClick={() => this.props['gameStore'].makeGuess()}
                class='peg_button'>
                Guess
              </button>
          }

          {this.props['gameStore'].pendingPegs.length > 0 && 
            <div class='clear'>
              <button
                class='peg_button'
                onClick={() => this.props['gameStore'].clearColours()}>
                Clear
              </button>
            </div>
          }
        </div>

        <hr />

        <div class='past_guesses'>
            {this.props['gameStore'].guesses.map(guess => {
              return (
                <div class='guess'>
                  <div class='pure-u-2-3'>
                    {guess.map(peg => {
                      return (
                        <Peg colour={peg} />
                      )
                    })}
                  </div>
                  <div class='pure-u-1-3'>
                    Result
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    )
  }
}))

export default Board
