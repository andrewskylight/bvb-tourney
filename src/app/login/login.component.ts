import { Component } from '@angular/core';
import { MatchService } from '../matches/match.service';
import { ITeam, ITourney } from '../shared/interfaces';
import { Observable, Subject, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { LoginService } from './login.service';
import { TourneyService } from '../tourney/tourney.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  public result = "";
  teams: ITeam[];

  email: string;
  //password: string;

  tourneySubs: Subscription;
  tourneyData: ITourney;

  constructor(public tourneyService: TourneyService, private matchService: MatchService, private loginService: LoginService, private router: Router) {
  }

  ngOnInit() {

    this.tourneySubs = this.matchService.tourneyDataChanged.subscribe(
      tourneyData => {
        this.tourneyData = tourneyData
        this.teams = this.tourneyData.teams;
        this.returningUser();
      });

    this.matchService.getTourneyData();
    //TODO: This logic will become obsolete
    // this.matchService.getTeams()
    //   .subscribe(teams => {
    //     this.teams = teams;
    //     this.returningUser();
    //   });
  }

  ngOnDestroy() {
    this.tourneySubs.unsubscribe();
  }

  returningUser() {
    let userEmail = this.getEmailFromLocalStorage();

    if (userEmail != null) {
      this.email = userEmail;
      this.onSubmit();
    }
  }

  getEmailFromLocalStorage(): string | null {
    // Retrieve the email from local storage
    return localStorage.getItem('userEmail');
  }

  onSubmit() {
    // Perform login logic here
    if (this.isEmailFound(this.email)) {
      this.result = "Email found; Login successful";
      localStorage.setItem('userEmail', this.email);
      this.loginService.setAuthEmail(this.email);

      if (this.tourneyService.getCurTourney() == "")
        this.router.navigate(['/tourneys']);
      else
        this.router.navigate(['/matches']);
    }
    else {
      this.result = "Email not found; Cannot edit; Can view";
    }
  }


    isEmailFound(email: string): boolean {
      //Check Conditions
      if (this.loginService.isAdminEmail(email))
        return true;

      //loop through teams' emails
      for (let i = 0; i < this.teams.length; i++) {
        if (this.teams[i].email.toUpperCase() == email.toUpperCase())
          return true;
      }
      return false;
    }
  }


