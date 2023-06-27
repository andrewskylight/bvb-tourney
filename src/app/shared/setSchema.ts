import { ISetSchema } from "./interfaces";

export class SetSchema {
  setSchema: ISetSchema[];

  constructor(setSchema: ISetSchema[]) {
    this.setSchema = setSchema;
  }

  hasTieBreaker(): boolean {
    let tieBreakerFound = false;
    for (let i = 0; i < this.setSchema.length; i++) {
      if (this.setSchema[i].tieBreaker) tieBreakerFound = true;
    }
    return tieBreakerFound;
  }

  getTieBreakerSetIndex(): number {
    for (let i = 0; i < this.setSchema.length; i++) {
      if (this.setSchema[i].tieBreaker)
        return i;
    }

    return -1;
  }

  isTieBreakerSet(setIndex: number): boolean{
    return this.setSchema[setIndex].tieBreaker;
  }

}
