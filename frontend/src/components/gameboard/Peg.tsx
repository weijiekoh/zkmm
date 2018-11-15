import { h, Component } from 'preact'
import { observer, inject } from 'mobx-preact'

const Peg = inject('gameStore')(observer(class Peg extends Component {
  public genPegClass() {
    const colour = this.props['colour']
    const colours = {
      R: 'red_peg',
      G: 'green_peg',
      B: 'blue_peg',
      Y: 'yellow_peg'
    }
    return colours[colour]
  }

  public render() {
    return (
      <span 
        onClick={() => this.props['gameStore'].pickColour(this.props['colour'])}
      class={'peg ' + this.genPegClass()}>
        {this.props['colour'].toUpperCase()}
      </span>
    )
  }
}))

export default Peg
