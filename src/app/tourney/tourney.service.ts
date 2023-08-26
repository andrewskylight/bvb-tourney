import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class TourneyService {

  private dbURL = 'https://tourney-f6031-default-rtdb.firebaseio.com/';  // URL to web api

  private curTourney: string = "";
  public isTourneyDataRefreshRequired = false;

  constructor(private titleService: Title) { }

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
    this.isTourneyDataRefreshRequired = true;
    this.titleService.setTitle(this.curTourney);
  }

  getDBURL():string{
    return this.dbURL;
  }
}
