import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private AuthenticatedEmail = "";
  private AdminEmail = "tsura2003@gmail.com";

  constructor() { }

  setAuthEmail(email: string){
    this.AuthenticatedEmail = email;
  }

  getAuthEmail():string{
    return this.AuthenticatedEmail;
  }

  isLoggedIn():boolean{
    return this.AuthenticatedEmail != "";
  }

  isAdminLoggedIn():boolean{
    return this.AuthenticatedEmail.toUpperCase() == this.AdminEmail.toUpperCase();
  }

  isAdminEmail(email: string):boolean{
    return this.AdminEmail.toUpperCase() == email.toUpperCase();
  }
}
