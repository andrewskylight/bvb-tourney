import { Injectable } from '@angular/core';
import { Observable, Subject, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { IMatch, IGroup, ITeam, ISetSchema } from '../shared/interfaces';
import { Match } from '../shared/match';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import groupsData from '../api/groups.json';
import teamsData from '../api/teams.json';
import setSchema from '../api/setSchema.json';
import matchesData from '../api/matches.json';

import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';

@Injectable({
  providedIn: 'root'
})
export class MatchService {

  public Matches: IMatch[] = matchesData.matches;
  private MatchesUrl = 'https://tourney-f6031-default-rtdb.firebaseio.com/';  // URL to web api
  private AuthenticatedEmail = "";
  private AdminEmail = "tsura2003@gmail.com";
  public selectedTeam = "";
  public isDebug = false;

  private matches: IMatch[];
  matchesChanged = new Subject<IMatch[]>();

  matches$ = this.db.object('matches').valueChanges() as Observable<IMatch[]>;

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(
    private http: HttpClient,
    private db: AngularFireDatabase)
    { }

  setAuthEmail(email: string){
    this.AuthenticatedEmail = email;
  }

  getAuthEmail():string{
    return this.AuthenticatedEmail;
  }

  isLoggedIn():boolean{
    return this.AuthenticatedEmail == "";
  }

  isAdminLoggedIn():boolean{
    return this.AuthenticatedEmail.toUpperCase() == this.AdminEmail.toUpperCase();
  }

  anyoneLogggedIn():boolean{
    return this.AuthenticatedEmail != "";
  }

  isAdminEmail(email: string):boolean{
    return this.AdminEmail.toUpperCase() == email.toUpperCase();
  }

  getGroups(): Observable<IGroup[]> {
    const output = of(groupsData);
    return output;
  }



  getTeams(): Observable<ITeam[]> {
    const output = of(teamsData);
    return output;
  }

  getSetSchema(): Observable<ISetSchema[]> {
    const output = of(setSchema);
    return output;
  }

  /** GET Matches from the server */
  getMatches(): Observable<IMatch[]> {
    if(this.isDebug){
      const output = of(this.Matches);
      return output;
    }

    return this.http.get<IMatch[]>(this.MatchesUrl)
      .pipe(
        tap(_ => this.log('fetched Matches')),
        catchError(this.handleError<IMatch[]>('getMatches', []))
      );
  }

  /** GET Matches from the server: angularfire2 */
  fetchMatches(){
    this.db.list('/matches').snapshotChanges()
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

  /** GET Match by id. Return `undefined` when id not found */
  getMatchNo404<Data>(id: number): Observable<Match> {
    const url = `${this.MatchesUrl}/?id=${id}`;
    return this.http.get<Match[]>(url)
      .pipe(
        map(Matches => Matches[0]), // returns a {0|1} element array
        tap(h => {
          const outcome = h ? 'fetched' : 'did not find';
          this.log(`${outcome} Match id=${id}`);
        }),
        catchError(this.handleError<Match>(`getMatch id=${id}`))
      );
  }

  //////// Save methods //////////

  /** POST: add a new Match to the server */
  addMatch(Match: Match): Observable<Match> {
    return this.http.post<Match>(this.MatchesUrl, Match, this.httpOptions).pipe(
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

    const updateURL = "https://tourney-f6031-default-rtdb.firebaseio.com/matches/" + Match.id + "/sets.json";
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

    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
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
