export const rows = [
  {
    prefix: 'A',
    count: 27,
    left: 10,
    right: 10,
    center: 7
  },
  {
    prefix: 'B',
    count: 30,
    left: 11,
    right: 11,
    center: 8
  },
  {
    prefix: 'C',
    count: 30,
    left: 11,
    right: 11,
    center: 8
  },
  {
    prefix: 'D',
    count: 33,
    left: 12,
    right: 12,
    center: 9
  },
  {
    prefix: 'E',
    count: 34,
    left: 12,
    right: 12,
    center: 10
  },
  {
    prefix: 'F',
    count: 36,
    left: 13,
    right: 13,
    center: 10
  },
  {
    prefix: 'G',
    count: 38,
    left: 14,
    right: 13,
    center: 11
  },
  {
    prefix: 'H',
    count: 40,
    left: 14,
    right: 14,
    center: 12
  },
  {
    prefix: 'I',
    count: 41,
    left: 15,
    right: 14,
    center: 12
  },
  {
    prefix: 'J',
    count: 36,
    left: 15,
    right: 15,
    center: 6
  },
  {
    prefix: 'K',
    count: 36,
    left: 15,
    right: 15,
    center: 6
  },
  {
    prefix: 'L',
    count: 36,
    left: 15,
    right: 15,
    center: 6
  },
  {
    prefix: 'M',
    count: 36,
    left: 15,
    right: 15,
    center: 6
  },
  {
    prefix: 'N',
    count: 36,
    left: 15,
    right: 15,
    center: 6
  },
  {
    prefix: 'O',
    count: 36,
    left: 15,
    right: 15,
    center: 6
  },
  {
    prefix: 'P',
    count: 36,
    left: 15,
    right: 15,
    center: 6
  },
  {
    prefix: 'Q',
    count: 42,
    left: 14,
    right: 15,
    center: 13
  },
  {
    prefix: 'R',
    count: 43,
    left: 14,
    right: 15,
    center: 14
  },
  {
    prefix: 'S',
    count: 43,
    left: 14,
    right: 15,
    center: 14
  },
  {
    prefix: 'T',
    count: 44,
    left: 14,
    right: 15,
    center: 15
  }
]

const checker = (row) => {
  let sections = []
  let a = ['A', 'B', 'C', 'D', 'E', 'F']
  a.forEach((b) => {
    let sec = {
      section: b,
      seats: rows.map((r) => {
        return {
          row: r.prefix,
          start: 1,
          end: r.right + r.center
        }
      })
    }
    sections.push(sec)
  })
  return sections
}
// const fs = require('fs')
import fs from 'fs'
fs.writeFileSync('a.json', JSON.stringify(checker(rows)))
console.log(checker(rows))
