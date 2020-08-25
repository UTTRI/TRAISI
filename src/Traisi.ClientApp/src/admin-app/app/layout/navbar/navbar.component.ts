import { Component, EventEmitter, OnInit, ElementRef, Input, Output, AfterViewInit, AfterContentInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AppConfig } from '../../app.config';
import { AppTranslationService } from '../../../../shared/services/app-translation.service';
import { ConfigurationService } from '../../../../shared/services/configuration.service';
import { Location, HashLocationStrategy } from '@angular/common';
import { Permission } from '../../../../shared/models/permission.model';
import { AccountService } from '../../services/account.service';
import { UserGroupService } from '../../services/user-group.service';
import { SurveyService } from '../../services/survey.service';
declare let jQuery: JQueryStatic;
declare let Theme: any;
@Component({
	selector: 'app-navbar',
	templateUrl: './navbar.template.html',
	styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, AfterViewInit, AfterContentInit {
	public isGroupAdmin: boolean = false;

	@Output() public toggleSidebarEvent: EventEmitter<any> = new EventEmitter();
	@Output() public toggleChatEvent: EventEmitter<any> = new EventEmitter();
	@Output() public logoutEvent: EventEmitter<any> = new EventEmitter();

	@Input() public userName: string;
	@Input() public onBuilder: boolean = false;
	public $el: any;
	public config: any;

	constructor(
		el: ElementRef,
		config: AppConfig,
		private router: Router,
		private accountService: AccountService,
		private translationService: AppTranslationService,
		public configurations: ConfigurationService,
		private userGroupService: UserGroupService,
		private location: Location,
		private surveyService: SurveyService
	) {
		this.$el = jQuery(el.nativeElement);
		this.config = config.getConfig();
	}

	public ngAfterContentInit(): void {
		new Theme().init();
	}

	public toggleSidebar(state): void {
		this.toggleSidebarEvent.emit(state);
	}

	public toggleChat(): void {
		this.toggleChatEvent.emit(null);
	}

	public logout(): void {
		this.logoutEvent.emit();
	}

	public refreshPage() {
		this.router.navigate([this.router.url]);
	}

	public goBackPage() {
		this.location.back();
	}

	public ngOnInit(): void {
		setTimeout(() => {
			const $chatNotification = jQuery('#chat-notification');
			$chatNotification
				.removeClass('hide')
				.addClass('animated fadeIn')
				.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => {
					$chatNotification.removeClass('animated fadeIn');
					setTimeout(() => {
						$chatNotification
							.addClass('animated fadeOut')
							.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd' + ' oanimationend animationend', () => {
								$chatNotification.addClass('hide');
							});
					}, 8000);
				});
			$chatNotification.siblings('#toggle-chat').append('<i class="chat-notification-sing animated bounceIn"></i>');
		}, 4000);

		this.$el.find('.input-group-addon + .form-control').on('blur focus', function(e): void {
			jQuery(this)
				.parents('.input-group')
				[e.type === 'focus' ? 'addClass' : 'removeClass']('focus');
		});

		this.router.events.subscribe(event => {
			if (event instanceof NavigationEnd) {
				this.changeActiveNavigationItem(this.location);
			}
		});

		this.userGroupService.isGroupAdmin().subscribe(result => (this.isGroupAdmin = result));
	}

	public ngAfterViewInit(): void {
		this.changeActiveNavigationItem(this.location);
	}

	public changeActiveNavigationItem(location): void {
		let $newActiveLink;
		if (location._platformStrategy instanceof HashLocationStrategy) {
			$newActiveLink = this.$el.find('a[href="#' + location._baseHref + location.path().split('?')[0] + '"]');
		} else {
			$newActiveLink = this.$el.find('a[href="' + location._baseHref + location.path().split('?')[0] + '"]');
		}

		// collapse .collapse only if new and old active links belong to different .collapse
		if (!$newActiveLink.is('.active > .collapse > li > a')) {
			this.$el
				.find('.active .active')
				.closest('.collapse')
				.collapse('hide');
		}
		this.$el.find('.sidebar-nav .active').removeClass('active');

		$newActiveLink
			.closest('li')
			.addClass('active')
			.parents('li')
			.addClass('active');

		// uncollapse parent
		$newActiveLink
			.closest('.collapse')
			.addClass('in')
			.css('height', '')
			.siblings('a[data-toggle=collapse]')
			.removeClass('collapsed');
	}

	get canManageUsers() {
		return this.accountService.userHasPermission(Permission.manageUsersPermission);
	}

	get canViewRoles() {
		return this.accountService.userHasPermission(Permission.viewRolesPermission);
	}

	get canManageGroupUsers() {
		return this.accountService.userHasPermission(Permission.manageGroupUsersPermission);
	}
}
