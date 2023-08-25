import { Component } from '@angular/core';
import { MatchService } from '../matches/match.service';
import { ITeam } from '../shared/interfaces';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { LoginService } from './login.service';

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

  constructor(private matchService: MatchService, private loginService: LoginService, private router: Router) {
  }

  ngOnInit() {
    //TODO: This logic will become obsolete
    this.matchService.getTeams()
      .subscribe(teams => {
        this.teams = teams;
        this.returningUser();
      });
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
      localStorage.setItem('userEmail',this.email);
      this.loginService.setAuthEmail(this.email);
      this.router.navigate(['/matches']);
    }
    else
      this.result = "Email not found; Cannot edit; Can view";

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
