import {Component, EventEmitter, OnInit, ElementRef, AfterViewInit, Input, Output} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Location, PathLocationStrategy, HashLocationStrategy } from '@angular/common';
import { AppConfig } from '../../app.config';
import { AccountService } from '../../services/account.service';
import { Permission } from '../../models/permission.model';
declare let jQuery: any;

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.template.html'
})

export class SidebarComponent implements OnInit, AfterViewInit {
  $el: any;
  config: any;
  configFn: any;
  router: Router;
  location: Location;

  @Output() logoutEvent: EventEmitter<any> = new EventEmitter();
  @Input() userName: string;
  constructor(config: AppConfig, el: ElementRef, router: Router,
    location: Location, private accountService: AccountService) {
    this.$el = jQuery(el.nativeElement);
    this.config = config.getConfig();
    this.configFn = config;
    this.router = router;
    this.location = location;
  }

  initSidebarScroll(): void {
    const $sidebarContent = this.$el.find('.js-sidebar-content');
    if (this.$el.find('.slimScrollDiv').length !== 0) {
      $sidebarContent.slimscroll({
        destroy: true
      });
    }
    $sidebarContent.slimscroll({
      height: window.innerHeight,
      size: '4px'
    });
  }

  changeActiveNavigationItem(location): void {
    let $newActiveLink;
    if (location._platformStrategy instanceof HashLocationStrategy) {
      $newActiveLink = this.$el.find('a[href="#' + location.path().split('?')[0] + '"]');
    } else {
      $newActiveLink = this.$el.find('a[href="' + location.path().split('?')[0] + '"]');
    }

    // collapse .collapse only if new and old active links belong to different .collapse
    if (!$newActiveLink.is('.active > .collapse > li > a')) {
      this.$el.find('.active .active').closest('.collapse').collapse('hide');
    }
    this.$el.find('.sidebar-nav .active').removeClass('active');

    $newActiveLink.closest('li').addClass('active')
      .parents('li').addClass('active');

    // uncollapse parent
    $newActiveLink.closest('.collapse').addClass('in').css('height', '')
      .siblings('a[data-toggle=collapse]').removeClass('collapsed');
  }

  ngAfterViewInit(): void {
    this.changeActiveNavigationItem(this.location);
  }

  toggleSidebarOverflow($event) {
    jQuery('#sidebar').css('z-index', $event ? '2' : '0' );
    jQuery('.js-sidebar-content, .slimScrollDiv').css('overflow', $event ? 'visible' : 'hidden');
  }

  ngOnInit(): void {
    jQuery(window).on('sn:resize', this.initSidebarScroll.bind(this));
    this.initSidebarScroll();

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.changeActiveNavigationItem(this.location);
      }
    });
  }
  logout(): void {
    this.logoutEvent.emit();
  }

  get canManageUsers() {
    return this.accountService.userHasPermission(Permission.manageUsersPermission);
  }

  get canViewRoles() {
    return this.accountService.userHasPermission(Permission.viewRolesPermission);
  }
}
