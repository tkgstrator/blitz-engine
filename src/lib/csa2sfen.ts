import { WebSocket } from 'ws'
import { Record, importCSA } from 'electron-shogi-core'

export const csa2sfen = (csa: string): string => {
  const pattern: RegExp = /([0-9A-Z\+-]{7}),([0-9]{1,3})/g
  const matches: string[] = [...csa.matchAll(pattern)].map((match) => match[1])
  const text: string = ['V2.2', 'PI', '+'].concat(matches).join('\n')
  const prefix: string[] = ['V2.2', 'PI', '+']
  const output: string = prefix.concat(matches).join('\n')
  const record: Record | Error = importCSA(output)

  if (record instanceof Record) {
    return record.sfen
  } else {
    throw Error('Invalid CSA Format')
  }
}
