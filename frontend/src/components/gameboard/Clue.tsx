import { Component, h } from 'preact'

const blackCircle = <img src='/static/img/black_circle.png' />
const whiteCircle = <img src='/static/img/white_circle.png' />
const times = <img src='/static/img/times.png' />

interface CustomInputProps {
  nb: any
  nw: any
}

export default class Clue extends Component<CustomInputProps> {

  public render() {
    const nb = this.props['nb']
    const nw = this.props['nw']

    let row1nb = 0
    let row2nb = 0

    if (nb > 2) {
      row1nb = 2
      row2nb = nb - 2
    } else {
      row1nb = nb
      row2nb = 0
    }

    let row1nw = 0
    let row2nw = 0

    if (nw > 2) {
      row2nw = 2
      row1nw = nw - 2
    } else {
      row2nw = nw
      row1nw = 0
    }

    let row1blank = 2 - row1nb - row1nw
    let row2blank = 2 - row2nb - row2nw

    return (
      <div class='clue'>
        {[...Array(row1nb)].map((_) => <span>{blackCircle}</span>)}
        {[...Array(row1nw)].map((_) => <span>{whiteCircle}</span>)}
        {[...Array(row1blank)].map((_) => <span>{times}</span>)}
        <br />
        {[...Array(row2nb)].map((_) => <span>{blackCircle}</span>)}
        {[...Array(row2nw)].map((_) => <span>{whiteCircle}</span>)}
        {[...Array(row2blank)].map((_) => <span>{times}</span>)}
      </div>
    )
  }
}

