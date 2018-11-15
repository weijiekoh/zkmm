import { h } from 'preact'

const Picker = () => {
  const redPeg = <span class='peg red_peg'>R</span>
  const bluePeg = <span class='peg blue_peg'>B</span>
  const greenPeg = <span class='peg green_peg'>G</span>
  const yellowPeg = <span class='peg yellow_peg'>Y</span>
  return (
    <div class='picker'>
      <p>Colour picker</p>
      <div class='pegs'>
        {redPeg}
        {bluePeg}
        {greenPeg}
        {yellowPeg}
      </div>
    </div>
  )
}

const Board = () => (
  <div>
    Board
  </div>
)

const Gameboard = () => (
  <div class='gameboard'>
    <Picker />
    <hr />
    <Board />
  </div>
)

export default Gameboard
