import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot,
	CanActivateChild, NavigationExtras, CanLoad, Route } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import { Permission } from '../../../shared/models/permission.model';


@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
	constructor(private authService: AuthService, private router: Router) { }

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

		const url: string = state.url;
		return this.checkLogin(url);
	}

	canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
		return this.canActivate(route, state);
	}

	canLoad(route: Route): boolean {

		const url = `/${route.path}`;
		return this.checkLogin(url);
	}

	checkLogin(url: string): boolean {

		if (this.authService.isLoggedIn && this.authService.userPermissions.some(p => p === Permission.accessAdminPermission)) {
			return true;
		}
		this.authService.loginRedirectUrl = url;
		this.router.navigate(['/login']);

		return false;
	}
}
