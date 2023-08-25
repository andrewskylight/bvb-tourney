import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TourneyService {

  private curTourney: string = "";

  constructor() { }

  getCurTourney():string{
    if (this.curTourney == "")
      this.curTourney = localStorage.getItem('curTourney');

    if (this.curTourney == null)
      this.curTourney == "";

    return this.curTourney;
  }

  setCurTourney(newTourney:string){
    this.curTourney = newTourney;
    localStorage.setItem('curTourney', this.curTourney);
    console.log("Current tourney ", this.curTourney);
  }
}
