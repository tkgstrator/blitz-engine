import { type ChildProcessWithoutNullStreams, spawn } from 'node:child_process'
import { plainToInstance } from 'class-transformer'
import { Record as Board, exportCSA, importCSA } from 'electron-shogi-core'
import WebSocket from 'ws'
import { Command } from './enums/command'
import { CSA } from './models/moves'

export class Engine {
  private readonly engine: ChildProcessWithoutNullStreams = spawn('engine/YaneuraOu-by-gcc')
  private socket: WebSocket.Server
  private board: Board = new Board()

  constructor() {
    this.engine.stdout.pipe(process.stdout)
    this.engine.stdin.write('setoption name EvalDir value engine/eval\n')
    this.engine.stdin.write('setoption name BookDir value engine/book\n')
    this.engine.stdin.write('setoption name BookFile value user_book1.db\n')
    this.engine.stdin.write('setoption name MultiPV value 1\n')
    this.engine.stdin.write('usi\n')
    this.engine.stdin.write('isready\n')
    this.socket = new WebSocket.Server({
      host: '0.0.0.0',
      port: 8080,
      clientTracking: true,
      backlog: 9999,
      skipUTF8Validation: true
    })
    console.log('[SERVER]: INIT')
  }

  convertCSAMove(bestmove: string): string | undefined {
    const usi: string = this.board
      .getUSI({ startpos: true, resign: true, allMoves: true })
      .split(' ')
      .concat(bestmove)
      .join(' ')
    const board: Board | Error = Board.newByUSI(usi)
    if (board instanceof Board) {
      const pattern: RegExp = /^.{7}$/
      const moves: string[] = exportCSA(board, {})
        .split('\n')
        .filter((v) => pattern.test(v))
      console.log('[CSA CURRENT]', moves)
      if (moves.length !== 0) {
        return moves.slice(-1)[0]
      }
      return undefined
    } else {
      console.error('[ENGINE]', 'INVALID USI DATA')
    }
  }

  start() {
    console.log('[SERVER]: START')
    this.socket.on('connection', this.handleConnect.bind(this))
  }

  handleConnect(ws: WebSocket) {
    ws.on('open', this.handleOpen.bind(this))
    ws.on('close', this.handleClose.bind(this))
    ws.onopen = this.handleOnOpen.bind(this)
    ws.onclose = this.handleOnClose.bind(this)
    ws.on('message', (data: WebSocket.Data) => {
      console.log('[ENGINE]: ->', data.toLocaleString())
      const message: string = data.toString()
      const components: string[] = message.split(/\s/)
      const command: Command | undefined = Object.values(Command).find((c) => c === components[0])
      const payload_string: string = `${components.slice(1).join(' ').replace(/\\/g, '')}`
      if (command !== undefined) {
        switch (command) {
          case Command.BEST_MOVE:
            const payload: CSA.Moves = plainToInstance(CSA.Moves, JSON.parse(payload_string))
            const board: Board | Error = importCSA(payload.CSAString)
            if (board instanceof Board) {
              this.board = board
              const usi: string = board.getUSI({ startpos: true, resign: true, allMoves: true })
              console.log('[ENGINE]: <-', usi)
              this.engine.stdin.write(`${usi}\n`)
              this.engine.stdin.write('go movetime 100\n')
            } else {
              console.error('[ENGINE]:', 'INVALID CSA DATA')
            }
            break
          default:
            ws.send('UNDEFINED')
        }
      }
    })
    this.engine.stdout.on('data', (data: WebSocket.Data) => {
      const stdout: string = data.toString().trim()
      const commands: string[] = stdout.split('\n').filter((v) => v.length !== 0 && v.includes('info'))
      if (stdout.includes('bestmove')) {
        const pattern: RegExp = /bestmove\s([\w\*]{4,6}|resign)/
        const match: RegExpMatchArray | null = stdout.match(pattern)
        if (match !== null) {
          const [_, bestmove] = [...match]
          const bestmove_csa: string | undefined = this.convertCSAMove(bestmove)
          if (bestmove_csa !== undefined) {
            console.log('[BEST]:', `USI: ${bestmove}`, `CSA: ${bestmove_csa}`)
            if (bestmove_csa === 'resign') {
              ws.send(`BEST_MOVE ${JSON.stringify({ bestmove: 'TORYO' })}`)
            } else {
              ws.send(`BEST_MOVE ${JSON.stringify({ bestmove: bestmove_csa })}`)
            }
          } else {
            console.error('[ENGINE]:', 'INVALID CSA MOVE')
          }
        }
      }
    })
  }

  handleOpen() {
    console.info('[SERVER]: OPEN')
  }

  handleOnOpen() {
    console.info('[SERVER]: ON OPEN')
  }

  handleClose() {
    console.info('[SERVER]: CLOSE')
    this.engine.stdin.write('stop\n')
  }

  handleOnClose() {
    console.info('[SERVER]: ON CLOSE')
    this.engine.stdin.write('stop\n')
  }

  handleMessage(data: WebSocket.Data) {}
}
