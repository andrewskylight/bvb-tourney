import { Component } from '@angular/core';
import { MatchService } from '../match.service';
import { ITeam } from '../shared/interfaces';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

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

  constructor(private matchService: MatchService, private router: Router) {
  }

  ngOnInit(){
    this.matchService.getTeams()
    .subscribe(teams => {
      this.teams = teams;
    });
  }

  onSubmit() {
    // Perform login logic here
    if (this.isEmailFound(this.email)){
      this.result = "Email found; Login successful";
      this.matchService.setAuthEmail(this.email);
      this.router.navigate(['/matches']);
    }
    else
      this.result = "Email not found; Cannot edit; Can view";

  }

  isEmailFound(email: string):boolean{
    //Check Conditions
    if (this.matchService.isAdminEmail(email))
      return true;

    //loop through teams' emails
    for (let i=0; i<this.teams.length; i++){
      if (this.teams[i].email == email)
        return true;
    }
    return false;
  }
}
