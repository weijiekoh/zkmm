import { action, observable } from 'mobx'

export default class GameStore {
  @observable
  public log = [
    'You can play a (semi)-trustless game of Mastermind here.',
    'Select four pegs of any colour or permutation and click the Guess button.',
    'After a couple of minutes, the codemaster will send you a clue.',
    'The clue cannot be faked as your browser will verify it using a zk-SNARK.',
    'Have fun!'
  ]

  @observable
  public pendingPegs: string[] = []

  @observable
  public currentGuess: string[] = []

  @observable
  public guesses: string[][] = []

  @action
  public pickColour(colour: string) {
    if (this.pendingPegs.length < 4) {
      this.pendingPegs.push(colour)
    }
  }

  @action public clearColours() {
      this.pendingPegs = []
  }

  @action public makeGuess() {
    this.currentGuess = this.pendingPegs
    this.guesses.unshift(this.currentGuess)
    this.clearColours()
  }
}
