import { h, Component } from 'preact'
import { observer, inject } from 'mobx-preact'

const Status = inject('gameStore')(observer(class Status extends Component {
  render() {
    const text = this.props['gameStore'].log.map((line) => {
      return line + '\n\n'
    })
    return (
      <div class='status'>
        <textarea readOnly={true}>
          {text}
        </textarea>
      </div>
    )
  }
}))

export default Status
