import { observable, action } from 'mobx'

export default class GameStore {
  @observable
  msg = 'hello'

  @observable
  pendingPegs: string[] = []

  @observable
  currentGuess: string[] = []

  @observable
  guesses: string[][] = []

  @action
  pickColour(colour: string) {
    if (this.pendingPegs.length < 4) {
      this.pendingPegs.push(colour)
    }
  }

  @action clearColours() {
      this.pendingPegs = []
  }
  
  @action makeGuess() {
    this.currentGuess = this.pendingPegs
    this.guesses.unshift(this.currentGuess)
    this.clearColours()
  }
}
