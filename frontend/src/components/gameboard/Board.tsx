import { inject, observer } from 'mobx-preact'
import { Component, h } from 'preact'
import { pegsToNum } from '../../utils'
import Peg from './Peg'

const Board = inject('gameStore')(observer(class CBoard extends Component {
  public componentDidMount() {
    this.props['gameStore'].loopFetchProofs()
  }

  public render() {
    const store = this.props['gameStore']

    return (
      <div class='board'>
        <div class='current pure-u-2-3'>
          {store.pendingPegs.map((peg, i) => {
            return (
              <Peg colour={peg} key={i} />
            )
          })}
        </div>

        <div class='pure-u-1-3'>
          {store.pendingPegs.length === 4 &&
              <button
                onClick={() => store.makeGuess()}
                class='peg_button'
              >
                Guess
              </button>
          }

          {store.pendingPegs.length > 0 &&
            <div class='clear'>
              <button
                class='peg_button'
                onClick={() => store.clearColours()}
              >
                Clear
              </button>
            </div>
          }
        </div>

        <hr />

        <div class='past_guesses'>
            {store.guesses.map((guess, i) => {
              const guessAsNum = pegsToNum(guess['guess'])
              return (
                <div class='guess' key={i}>
                  <div class='pure-u-2-3'>
                    {guess['guess'].map((peg, j) => {
                      return (
                        <Peg key={j} colour={peg} />
                      )
                    })}
                  </div>

                  <div class='pure-u-1-3'>
                    <p>
                      <span>
                        Exact: {guess['nb']}; Inexact: {guess['nw']};
                      </span> {guess['verified'] === true ?
                        <span>zk-Verified!</span>
                        :
                        <span>Verifying...</span>
                      }
                    </p>
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
