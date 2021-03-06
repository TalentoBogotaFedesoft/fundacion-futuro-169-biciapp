import { BusesPage } from './../pages/buses/buses';
import { AdminsPage } from './../pages/admins/admins';
import { AdminDashboardPage } from './../pages/admin-dashboard/admin-dashboard';
import { HomePage } from './../pages/home/home';
import { Component, ViewChild } from '@angular/core';
import { Platform, Events, Nav } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { LoginPage } from '../pages/login/login';
import { RegisterUserPage } from '../pages/register-user/register-user';
import { ApiProvider } from '../providers/api/api';
import { UserDashboardPage } from '../pages/user-dashboard/user-dashboard';
import { TravelPage } from '../pages/travel/travel';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  rootPage: any = HomePage;
  pages: Array<{ title: string, component: any, icon: string }>;
  private loggedIn: boolean;

  constructor(platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    public events: Events,
    private api: ApiProvider) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });

    let defaultPages = [
      { title: 'Iniciar sesión', component: LoginPage, icon: 'log-in' },
      { title: 'Registrarse', component: RegisterUserPage, icon: 'create' },
      { title: 'Empezar viaje', component: TravelPage, icon: 'navigate' },
    ];

    this.pages = defaultPages;

    events.subscribe('admin:loggedIn', () => {
      this.loggedIn = true;
      this.nav.setRoot(AdminDashboardPage);

      this.pages = [
        { title: 'Buses', component: BusesPage, icon: 'bus' },
        { title: 'Rutas', component: LoginPage, icon: 'map' },
        { title: 'Estaciones', component: LoginPage, icon: 'cube' },
        { title: 'Administradores', component: AdminsPage, icon: 'contacts' },
        { title: 'Inicio', component: AdminDashboardPage, icon: 'home' }
      ];
    });

    events.subscribe('user:loggedIn', () => {
      this.loggedIn = true;
      this.nav.setRoot(UserDashboardPage);

      this.pages = [
        { title: 'Empezar viaje', component: TravelPage, icon: 'navigate' },
        { title: 'Mis viajes', component: LoginPage, icon: 'map' },
        { title: 'Mis alertas', component: LoginPage, icon: 'alarm' },
        { title: 'Mis evaluaciones', component: LoginPage, icon: 'star' },
        { title: 'Inicio', component: UserDashboardPage, icon: 'home' }
      ];
    });

    events.subscribe('loggedOut', () => {
      this.loggedIn = false;
      this.pages = defaultPages;
    })

    this.api.loadUser().then(() => {
      this.setRole();
    })

  }

  setRole(): void {
    let role = this.api.getRole();

    if (role === "user") {
      this.events.publish('user:loggedIn');
    } else if (role) {
      this.events.publish('admin:loggedIn');
    }
  }

  openPage(page) {
    this.nav.setRoot(page.component);
  }

  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  logout(): void {
    this.api.logout();
    this.events.publish('loggedOut');
    this.nav.setRoot(HomePage);
  }
}

