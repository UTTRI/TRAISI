import { Component, ViewEncapsulation, ElementRef, Renderer2, NgZone, ViewChild, HostBinding, OnInit } from '@angular/core';
import {
	Router,
	Event as RouterEvent,
	NavigationStart,
	NavigationEnd,
	NavigationCancel,
	NavigationError,
	ActivatedRoute
} from '@angular/router';
import { AppConfig } from '../app.config';
import { AuthService } from '..../../../shared/services/auth.service';
import { SurveyBuilderComponent } from '../survey-builder/survey-builder.component';
import { AccountService } from 'app/services/account.service';
import { BehaviorSubject } from 'rxjs';

declare let jQuery: JQueryStatic;
declare let Hammer: any;

@Component({
	selector: 'app-layout',
	encapsulation: ViewEncapsulation.None,
	templateUrl: './layout.template.html',
	styleUrls: ['layout.component.scss']
})
export class LayoutComponent implements OnInit {
	@HostBinding('class.nav-static') public navStatic: boolean;
	@HostBinding('class.chat-sidebar-opened') public chatOpened: boolean = false;
	@HostBinding('class.app') public appClass: boolean = true;
	public config: any;
	public configFn: any;
	public $sidebar: any;

	@ViewChild('spinnerElement', { static: true }) public spinnerElement: ElementRef;
	@ViewChild('routerComponent', { static: true }) public routerComponent: ElementRef;

	public hasSidebar: boolean = false;
	public userName: string;
	public onBuilder: boolean = false;

	/**
	 *
	 * @param config
	 * @param el
	 * @param router
	 * @param renderer
	 * @param ngZone
	 * @param authService
	 * @param _accountService
	 * @param _activatedRoute
	 */
	constructor(
		config: AppConfig,
		public el: ElementRef,
		public router: Router,
		private renderer: Renderer2,
		private ngZone: NgZone,
		private authService: AuthService,
		private _accountService: AccountService,
		private _activatedRoute: ActivatedRoute
	) {
		this.el = el;
		this.config = config.getConfig();
		this.configFn = config;
		this.router = router;

		this.router.events.subscribe((event: RouterEvent) => {
			if (event instanceof NavigationEnd) {
				let data: any = (<BehaviorSubject<any>>this._activatedRoute.firstChild.data).value;
				this.hasSidebar = false;
				if (data['hasSidebar'] !== undefined) {
					if (data['hasSidebar'] === true) {
						this.hasSidebar = true;
					}
				}
			}
		});
	}

	public toggleSidebarListener(state): void {
		const toggleNavigation = state === 'static' ? this.toggleNavigationState : this.toggleNavigationCollapseState;
		toggleNavigation.apply(this);
		localStorage.setItem('nav-static', JSON.stringify(this.navStatic));
	}

	public toggleChatListener(): void {
		jQuery(this.el.nativeElement)
			.find('.chat-notification-sing')
			.remove();
		this.chatOpened = !this.chatOpened;

		setTimeout(() => {
			// demo: add class & badge to indicate incoming messages from contact
			// .js-notification-added ensures notification added only once
			jQuery('.chat-sidebar-user-group:first-of-type ' + '.list-group-item:first-child:not(.js-notification-added)')
				.addClass('active js-notification-added')
				.find('.fa-circle')
				.before('<span class="badge badge-danger badge-pill ' + 'float-right animated bounceInDown">3</span>');
		}, 1000);
	}

	public toggleNavigationState(): void {
		this.navStatic = !this.navStatic;
		if (!this.navStatic) {
			this.collapseNavigation();
		}
	}

	public expandNavigation(): void {
		// this method only makes sense for non-static navigation state
		if (this.isNavigationStatic() && (this.configFn.isScreen('lg') || this.configFn.isScreen('xl'))) {
			return;
		}
		jQuery('app-layout').removeClass('nav-collapsed');
		this.$sidebar
			.find('.active .active')
			.closest('.collapse')
			.collapse('show')
			.siblings('[data-toggle=collapse]')
			.removeClass('collapsed');
	}

	public collapseNavigation(): void {
		// this method only makes sense for non-static navigation state
		if (this.isNavigationStatic() && (this.configFn.isScreen('lg') || this.configFn.isScreen('xl'))) {
			return;
		}

		jQuery('app-layout').addClass('nav-collapsed');
		this.$sidebar
			.find('.collapse.in')
			.collapse('hide')
			.siblings('[data-toggle=collapse]')
			.addClass('collapsed');
	}

	/**
	 * Check and set navigation collapse according to screen size and navigation state
	 */
	public checkNavigationState(): void {
		if (this.isNavigationStatic()) {
			if (this.configFn.isScreen('sm') || this.configFn.isScreen('xs') || this.configFn.isScreen('md')) {
				this.collapseNavigation();
			}
		} else {
			if (this.configFn.isScreen('lg') || this.configFn.isScreen('xl')) {
				setTimeout(() => {
					this.collapseNavigation();
				}, this.config.settings.navCollapseTimeout);
			} else {
				this.collapseNavigation();
			}
		}
	}

	public isNavigationStatic(): boolean {
		return this.navStatic === true;
	}

	public toggleNavigationCollapseState(): void {
		if (jQuery('app-layout').is('.nav-collapsed')) {
			this.expandNavigation();
		} else {
			this.collapseNavigation();
		}
	}

	public _sidebarMouseEnter(): void {
		if (this.configFn.isScreen('lg') || this.configFn.isScreen('xl')) {
			this.expandNavigation();
		}
	}
	public _sidebarMouseLeave(): void {
		if (this.configFn.isScreen('lg') || this.configFn.isScreen('xl')) {
			this.collapseNavigation();
		}
	}

	public enableSwipeCollapsing(): void {
		const swipe = new Hammer(document.getElementById('navbar'), {
			touchAction: 'auto'
		});
		const d = this;

		swipe.on('swipeleft', () => {
			setTimeout(() => {
				if (d.configFn.isScreen('md')) {
					return;
				}

				if (!jQuery('app-layout').is('.nav-collapsed')) {
					d.collapseNavigation();
				}
			});
		});

		swipe.on('swiperight', () => {
			if (d.configFn.isScreen('md')) {
				return;
			}

			if (jQuery('app-layout').is('.chat-sidebar-opened')) {
				return;
			}

			if (jQuery('app-layout').is('.nav-collapsed')) {
				d.expandNavigation();
			}
		});
	}

	public collapseNavIfSmallScreen(): void {
		if (this.configFn.isScreen('xs') || this.configFn.isScreen('sm') || this.configFn.isScreen('md')) {
			this.collapseNavigation();
		}
	}

	public ngOnInit(): void {
		if (localStorage.getItem('nav-static') === 'true') {
			this.navStatic = true;
		}

		const $el = jQuery(this.el.nativeElement);
		this.$sidebar = $el.find('app-sidebar');

		$el.find('a[href="#"]').on('click', e => {
			e.preventDefault();
		});

		this.$sidebar.on('mouseenter', this._sidebarMouseEnter.bind(this));
		this.$sidebar.on('mouseleave', this._sidebarMouseLeave.bind(this));

		this.checkNavigationState();

		this.$sidebar.on('click', () => {
			if (jQuery('app-layout').is('.nav-collapsed')) {
				this.expandNavigation();
			}
		});

		this.router.events.subscribe(event => {
			this._navigationInterceptor(event);
			this.collapseNavIfSmallScreen();
			if(window.scrollTo !== undefined) {
			window.scrollTo(0, 0);
			}
			// window.scrollTop = 0;
		});

		if ('ontouchstart' in window) {
			this.enableSwipeCollapsing();
		}

		this.$sidebar
			.find('.collapse')
			.on('show.bs.collapse', function(e): void {
				// execute only if we're actually the .collapse element initiated event
				// return for bubbled events
				if (e.target !== e.currentTarget) {
					return;
				}

				const $triggerLink = jQuery(this).prev('[data-toggle=collapse]');
				jQuery($triggerLink.data('parent'))
					.find('.collapse.show')
					.not(jQuery(this))
					.collapse('hide');
			})
			/* adding additional classes to navigation link li-parent
		for several purposes. see navigation styles */
			.on('show.bs.collapse', function(e): void {
				// execute only if we're actually the .collapse element initiated event
				// return for bubbled events
				if (e.target !== e.currentTarget) {
					return;
				}

				jQuery(this)
					.closest('li')
					.addClass('open');
			})
			.on('hide.bs.collapse', function(e): void {
				// execute only if we're actually the .collapse element initiated event
				// return for bubbled events
				if (e.target !== e.currentTarget) {
					return;
				}

				jQuery(this)
					.closest('li')
					.removeClass('open');
			});

		// populate name with logged in user
		this.userName = this.authService.currentUser.fullName.split(' ')[0];

		// charge user info
		let user = this._accountService.currentUserAccount;
	}

	private _navigationInterceptor(event: RouterEvent): void {
		if (event instanceof NavigationStart) {
			// We wanna run this function outside of Angular's zone to
			// bypass change detection
			this.ngZone.runOutsideAngular(() => {
				// For simplicity we are going to turn opacity on / off
				// you could add/remove a class for more advanced styling
				// and enter/leave animation of the spinner
				this.renderer.setStyle(this.spinnerElement.nativeElement, 'opacity', '1');
				this.renderer.setStyle(this.routerComponent.nativeElement, 'opacity', '0');
			});
		}
		if (event instanceof NavigationEnd) {
			this._hideSpinner();
		}

		// Set loading state to false in both of the below events to
		// hide the spinner in case a request fails
		if (event instanceof NavigationCancel) {
			this._hideSpinner();
		}
		if (event instanceof NavigationError) {
			this._hideSpinner();
		}
	}

	private _hideSpinner(): void {
		// We wanna run this function outside of Angular's zone to
		// bypass change detection,
		this.ngZone.runOutsideAngular(() => {
			// For simplicity we are going to turn opacity on / off
			// you could add/remove a class for more advanced styling
			// and enter/leave animation of the spinner
			this.renderer.setStyle(this.spinnerElement.nativeElement, 'opacity', '0');
			this.renderer.setStyle(this.routerComponent.nativeElement, 'opacity', '1');
		});
	}

	public logout() {
		this.authService.logout();
		this.authService.redirectLogoutUser();
	}

	public onActivate(event: any) {
		if (event instanceof SurveyBuilderComponent) {
			this.onBuilder = true;
			if (!this.navStatic) {
				this.toggleNavigationState();
			}
		} else {
			this.onBuilder = false;
		}
	}
}
