import { Expose, Type } from 'class-transformer'
import 'reflect-metadata'

export namespace CSA {
  export class Moves {
    @Expose()
    readonly game_id: string

    @Expose()
    @Type(() => Move)
    readonly moves: Move[]

    @Expose()
    readonly observers_num: number

    get CSAString(): string {
      return ['V2.2', 'PI', '+'].concat(this.moves.flatMap((move) => [move.csa, `T${0}`])).join('\n')
    }
  }

  class Move {
    @Expose()
    readonly csa: string

    @Expose()
    readonly time_left: number
  }
}
