const pegsToNum = (g) => {
  let guess = 0
  const pegs = { R: 1, G: 2, B: 3, Y: 4 }
  g.forEach((peg, i) => {
    guess += 10 ** (3 - i) * pegs[peg]
  })

  return guess
}

export { pegsToNum }
