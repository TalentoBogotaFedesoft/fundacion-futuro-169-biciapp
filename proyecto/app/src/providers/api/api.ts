import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { map, catchError, mergeMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Storage } from '@ionic/storage';

export interface User {
  name: string;
  email: string;
  role: string;
  token: string;
}

@Injectable()
export class ApiProvider {
  private url: string;
  private currentUser: User;

  constructor(public http: HttpClient, private storage: Storage) {
    this.url = 'http://localhost:3000/api';
  }

  public loginAdmin(params): Observable<any> {
    return this.http.post(`${this.url}/auth_admin`, {
      auth: params
    }).pipe(
      map((response: any) => {
        this.currentUser.token = response.jwt;
        return true;
      }),
      mergeMap((response) => this.getAdmin()),
      map((response) => {
        this.saveUser(response.name, response.role, response.email);
        return true;
      })
      , catchError(() => {
        return Observable.of(false);
      }))
  }

  public loginUser(params): Observable<boolean> {
    return this.http.post(`${this.url}/auth_user`, {
      auth: params
    }).pipe(
      map((response: any) => {
        this.currentUser.token = response.jwt;
        return true;
      }),
      mergeMap((response) => this.getUser()),
      map((response) => {
        this.saveUser(response.name, "user", response.email);
        return true;
      })
      , catchError(() => {
        return Observable.of(false);
      }))
  }

  public registerUser(params): Observable<boolean> {
    return this.http.post(`${this.url}/v1/user`, {
      user: params
    }).pipe(map(() => {
      return true;
    }), catchError(() => {
      return Observable.of(false);
    }))
  }

  public getRole(): string {
    return this.currentUser.role;
  }

  public getCurrentUser(): User {
    return this.currentUser;
  }

  public logout(): void {
    this.storage.remove('user').then(() => {
      this.currentUser = {
        name: "",
        email: "",
        role: "",
        token: ""
      };
    });
  }

  public loadUser(): Promise<boolean> {
    return this.storage.get('user').then((value) => {
      if (value === null) {
        this.currentUser = {
          name: "",
          email: "",
          role: "",
          token: ""
        };
      } else {
        this.currentUser = value;
      }
      return true;
    });
  }

  public getUser(): Observable<any> {
    return this.http.get(`${this.url}/v1/user/1`, {
      headers: {
        'Authorization': this.currentUser.token
      }
    }).pipe(map((response) => {
      return response;
    }), catchError((error: HttpErrorResponse) => {
      return Observable.of(false);
    }));

  }

  public getAdmin(): Observable<any> {
    return this.http.get(`${this.url}/v1/admin/1`, {
      headers: {
        'Authorization': this.currentUser.token
      }
    }).pipe(map((response) => {
      return response;
    }), catchError((error: HttpErrorResponse) => {
      return Observable.of(false);
    }));

  }

  private saveUser(name, role, email) {
    this.currentUser.name = name;
    this.currentUser.role = role;
    this.currentUser.email = email;
    console.log('user saved');
    this.storage.set('user', this.currentUser);
  }


}
