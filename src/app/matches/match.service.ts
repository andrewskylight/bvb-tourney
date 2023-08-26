import { Injectable } from '@angular/core';
import { Observable, Subject, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { IMatch, IGroup, ITeam, ISetSchema, ITourney } from '../shared/interfaces';
import { Match } from '../shared/match';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import groupsData from '../api/groups.json';
import teamsData from '../api/teams.json';
import setSchema from '../api/setSchema.json';
import matchesData from '../api/matches.json';

import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { TourneyService } from '../tourney/tourney.service';

@Injectable({
  providedIn: 'root'
})
export class MatchService {

  public Matches: IMatch[] = matchesData.matches;
  public tourneyData: ITourney;
  tourneyDataChanged = new Subject<ITourney>();

  private selectedTeam = "";
  public isDebug = false;

  private matches: IMatch[];
  matchesChanged = new Subject<IMatch[]>();

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(
    private http: HttpClient,
    private db: AngularFireDatabase,
    private tourneyService: TourneyService)
    { }

  // getGroups(): Observable<IGroup[]> {
  //   const output = of(groupsData);
  //   return output;
  // }

  // getTeams(): Observable<ITeam[]> {
  //   const output = of(teamsData);
  //   return output;
  // }

  // getSetSchema(): Observable<ISetSchema[]> {
  //   const output = of(setSchema);
  //   return output;
  // }

  getTourneyData() {
    if(!this.tourneyData || this.tourneyService.isTourneyDataRefreshRequired){
      this.http.get<ITourney>(this.getTourneyRootURL() + '/.json',this.httpOptions)
      .subscribe(data => {
        this.tourneyData = data;
        this.tourneyDataChanged.next(this.tourneyData);
        this.tourneyService.isTourneyDataRefreshRequired = false;
        console.log("Fetched tourney data.");
      })
    }else {
      this.tourneyDataChanged.next(this.tourneyData);
    }
  }

  public refreshTourneyData() {
    this.tourneyData = null;
    this.getTourneyData();
  }

  getTourneyRootURL():string{
    let tourneyURL = this.tourneyService.getDBURL() +
                    "tourneys/" + this.tourneyService.getCurTourney();

    console.log("Tourney URL",tourneyURL);
    return tourneyURL;
  }



  getMatchesPath():string{
    let matchesPath = 'tourneys/' + this.tourneyService.getCurTourney() + '/matches';
    return matchesPath;
  }

  /** FETCH Matches from the server: angularfire2 */
  fetchMatches(){
    this.db.list(this.getMatchesPath()).snapshotChanges()
    .pipe(
      map(changes => {
        // Convert the snapshotChanges array into a regular array of data objects
        return changes.map(c => ({ key: c.payload.key, ...c.payload.val() as IMatch }));
      })
    ).subscribe((matches: IMatch[]) => {
      this.matches = matches;
      this.matchesChanged.next([...this.matches]);
    })
}


  //////// Save methods //////////

  /** POST: add a new Match to the server */
  addMatch(Match: Match): Observable<Match> {
    return this.http.post<Match>(this.tourneyService.getDBURL(), Match, this.httpOptions).pipe(
      tap((newMatch: Match) => this.log(`added Match w/ id=${newMatch.id}`)),
      catchError(this.handleError<Match>('addMatch'))
    );
  }

  /** PUT: update the Match on the server */
  updateMatch(Match: IMatch): Observable<any> {
    console.log('updateMatch:' +
      Match.id + " " +
      Match.team1 + " " +
      Match.team2 + " " +
      Match.sets[0].t1_points + " " + Match.sets[0].t2_points);

    //const updateURL = this.MatchesUrl + '/' + Match.id + '/sets/0.json';
    //const updateURL = "https://tourney-f6031-default-rtdb.firebaseio.com/matches/0/sets/0/.json";
    //const updateURL = "https://tourney-f6031-default-rtdb.firebaseio.com/matches/" + Match.id + "/sets.json";

    let updateURL = this.getTourneyRootURL() + '/matches/' + Match.id + "/sets.json";
    console.log("update URL", updateURL);

    return this.http.put(updateURL, Match.sets, this.httpOptions).pipe(
      tap(_ => this.log(`updated Match id=${Match.id}`)),
      catchError(this.handleError<any>('updateMatch'))
    );
  }

  /** Log a HeroService message with the MessageService */
  private log(message: string) {
    //this.messageService.add(`HeroService: ${message}`);
    console.log(message);
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   *
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {
    console.error(operation);
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  //////// Selected Team methods //////////
  getSelectedTeam(): string {
    if (this.selectedTeam != "")
      return this.selectedTeam;

    if (localStorage.getItem('selectedTeam') != null){
      this.selectedTeam = localStorage.getItem('selectedTeam');
      return this.selectedTeam;
    }

    return "";
  }

  setSelectedTeam(selectedTeam:string): void {
    this.selectedTeam = selectedTeam;
    localStorage.setItem('selectedTeam',selectedTeam);
  }
}

// BACK UP //
/* SAMPLE GET METHOD */
  // getGroups(): Observable<IGroup[]> {
  //   return this.http.get<Group[]>(this.GroupsUrl)
  //   .pipe(
  //     tap(_ => this.log('fetched Groups')),
  //     catchError(this.handleError<Group[]>('getGroups', []))
  //   );
  // }
