import { Component, OnInit, ViewEncapsulation, AfterViewInit, Injector, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { constructor } from 'jquery';
import { AlertService, DialogType, MessageSeverity } from '../../../shared/services/alert.service';
import { AppTranslationService } from '../../../shared/services/app-translation.service';
import { AccountService } from 'app/services/account.service';
import { UserGroupService } from 'app/services/user-group.service';
import { UserGroup } from '../models/user-group.model';
import { fadeInOut } from '../services/animations';
import { PhoneDataPermissions } from '../models/phonedata.permissions.model';
import { PhoneData } from '../models/phonedata.model';
import { Permission } from '../../../shared/models/permission.model';
import { Utilities } from '../../../shared/services/utilities';
import { PhoneDataService } from '../services/phonedata.service';
import { id } from '@swimlane/ngx-datatable';
import { Select2OptionData } from 'ng-select2';
import { FileSelectDirective } from 'ng2-file-upload';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-smartphonedata-management',
  templateUrl: './smartphonedata-management.component.html',
  styleUrls: ['./smartphonedata-management.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [fadeInOut]
})
export class SmartphonedataManagementComponent implements OnInit {
  
  //Smartphone Data
  public phoneDataArray: PhoneData[] = [];
  //public phoneBeingViewed: boolean = true;

  @ViewChild('phoneTable')
  public pTable: any;

  public model: PhoneData;
  public loadingIndicator: boolean;

  public phoneDataColumns: any[] = [];
  public phoneDataRows: PhoneData[] = [];
  public phoneDataRowsCache: PhoneData[] = [];

  /* @ViewChild('sampleTagTemplate', { static: true })
  public sampleTagTemplate: TemplateRef<any>; */

  @ViewChild('dateTemplate', { static: true })
  public dateTemplate: TemplateRef<any>;

  @ViewChild('expandTemplate', { static: true })
  public expandTemplate: TemplateRef<any>;

  @ViewChild('textTemplate', { static: true })
  public textTemplate: TemplateRef<any>;

  @ViewChild('actionsTemplate', { static: true })
  public actionsTemplate: TemplateRef<any>;

 /**
	 *
	 * @param {PhoneDataService} phoneDataService
	 */

  constructor(
    private alertService: AlertService,
    private translationService: AppTranslationService,
    private accountService: AccountService,
    private phoneDataService: PhoneDataService,
    private userGroupService: UserGroupService,
    private authService: AuthService
  ) {

    this.model = new PhoneData();
  }

  ngOnInit(): void {

    this.phoneDataArray = [
      { gpsId: 670896633, userId: 12945, trackedAt: "2017-10-11 12:30:00 AM", latitude: 43.6776033, longitude: -79.3537117, accuracy: 18, tripId: 714756, startedAt: "12:29:55 AM", finishedAt: "12:47:30 AM", length: 1023, mode: "Walk", travelStatus: "Start" },
      { gpsId: 670896635, userId: 12945, trackedAt: "2017-10-11 12:30:00 AM", latitude: 43.6771117, longitude: -79.3538133, accuracy: 9.5, tripId: 714756, startedAt: "", finishedAt: "", length: "", mode: "Walk", travelStatus: "Travel" },
      { gpsId: 670896679, userId: 12945, trackedAt: "2017-10-11 12:31:00 AM", latitude: 43.6769867, longitude: -79.3548533, accuracy: 3.9, tripId: 714756, startedAt: "", finishedAt: "", length: "", mode: "Walk", travelStatus: "Travel" },
      { gpsId: 670896711, userId: 12945, trackedAt: "2017-10-11 12:32:00 AM", latitude: 43.6767783, longitude: -79.3556433, accuracy: 3.9, tripId: 714756, startedAt: "", finishedAt: "", length: "", mode: "Walk", travelStatus: "Travel" },
      { gpsId: 670896756, userId: 12945, trackedAt: "2017-10-11 12:34:00 AM", latitude: 43.6771417, longitude: -79.3555117, accuracy: 9, tripId: 714756, startedAt: "", finishedAt: "", length: "", mode: "Walk", travelStatus: "Travel" },
      { gpsId: 670896833, userId: 12945, trackedAt: "2017-10-11 12:36:00 AM", latitude: 43.6767333, longitude: -79.3562667, accuracy: 3.9, tripId: 714756, startedAt: "", finishedAt: "", length: "", mode: "Walk", travelStatus: "Travel" },
      { gpsId: 670896849, userId: 12945, trackedAt: "2017-10-11 12:36:00 AM", latitude: 43.6765383, longitude: -79.3567133, accuracy: 3.9, tripId: 714756, startedAt: "", finishedAt: "", length: "", mode: "Walk", travelStatus: "Travel" },
      { gpsId: 670896897, userId: 12945, trackedAt: "2017-10-11 12:37:00 AM", latitude: 43.6764867, longitude: -79.3579183, accuracy: 4.2, tripId: 714756, startedAt: "", finishedAt: "", length: "", mode: "Walk", travelStatus: "Travel" },
      { gpsId: 670896937, userId: 12945, trackedAt: "2017-10-11 12:39:00 AM", latitude: 43.6758833, longitude: 79.3582633, accuracy: 96, tripId: 714756, startedAt: "", finishedAt: "", length: "", mode: "Walk", travelStatus: "Travel" },
      { gpsId: 670896940, userId: 12945, trackedAt: "2017-10-11 12:39:00 AM", latitude: 43.6762819, longitude: -79.3580511, accuracy: 21.79, tripId: 714756, startedAt: "", finishedAt: "", length: "", mode: "Walk", travelStatus: "Travel" },
      { gpsId: 670901286, userId: 12945, trackedAt: "2017-10-11 12:40:00 AM", latitude: 43.6759422, longitude: -79.3577871, accuracy: 18.695, tripId: 714756, startedAt: "", finishedAt: "", length: "", mode: "Walk", travelStatus: "Travel" },
      { gpsId: 670901290, userId: 12945, trackedAt: "2017-10-11 12:40:00 AM", latitude: 43.6762819, longitude: -79.3580511, accuracy: 18.604, tripId: 714756, startedAt: "", finishedAt: "", length: "", mode: "Walk", travelStatus: "Travel" },
      { gpsId: 670901303, userId: 12945, trackedAt: "2017-10-11 12:41:00 AM", latitude: 43.6759422, longitude: -79.3577871, accuracy: 28.264, tripId: 714756, startedAt: "", finishedAt: "", length: "", mode: "Walk", travelStatus: "Travel" },
      { gpsId: 670901304, userId: 12945, trackedAt: "2017-10-11 12:42:00 AM", latitude: 43.6762819, longitude: -79.3580511, accuracy: 19.273, tripId: 714756, startedAt: "", finishedAt: "", length: "", mode: "Walk", travelStatus: "Travel" },
      { gpsId: 670901307, userId: 12945, trackedAt: "2017-10-11 12:42:00 AM", latitude: 43.6759422, longitude: -79.3577871, accuracy: 19.347, tripId: 714756, startedAt: "", finishedAt: "", length: "", mode: "Walk", travelStatus: "Travel" },
      { gpsId: 670901312, userId: 12945, trackedAt: "2017-10-11 12:42:00 AM", latitude: 43.6763149, longitude: -79.3580071, accuracy: 22592, tripId: 714756, startedAt: "", finishedAt: "", length: "", mode: "Walk", travelStatus: "Travel" },
      { gpsId: 670901352, userId: 12945, trackedAt: "2017-10-11 12:44:00 AM", latitude: 43.6764917, longitude: -79.3570433, accuracy: 3.9, tripId: 714756, startedAt: "", finishedAt: "", length: "", mode: "Walk", travelStatus: "Travel" },
      { gpsId: 670901368, userId: 12945, trackedAt: "2017-10-11 12:44:00 AM", latitude: 43.6765667, longitude: -79.356555, accuracy: 3.9, tripId: 714756, startedAt: "", finishedAt: "", length: "", mode: "Walk", travelStatus: "Travel" },
      { gpsId: 670901416, userId: 12945, trackedAt: "2017-10-11 12:45:00 AM", latitude: 43.676745, longitude: -79.3552883, accuracy: 3.9, tripId: 714756, startedAt: "", finishedAt: "", length: "", mode: "Walk", travelStatus: "Travel" },
      { gpsId: 670901448, userId: 12945, trackedAt: "2017-10-11 12:46:00 AM", latitude: 43.6769583, longitude: -79.3544583, accuracy: 3.9, tripId: 714756, startedAt: "", finishedAt: "", length: "", mode: "Walk", travelStatus: "Stop" }

    ];

    //Manage Smartphone Data
    this.phoneDataRows = this.phoneDataArray;
    this.phoneDataColumns = this.phoneDataArray;

    // columns for the display data table
    //Smartphone Data
    this.phoneDataColumns = [
      {
        width: 10,
        cellTemplate: this.expandTemplate,
        sortable: false,
        resizeable: false,
        draggable: false,
        canAutoResize: false
      },
      {
        prop: 'gpsId',
        name: 'GPS Id',
        width: 80,
        flexGrow: 25,
        cellTemplate: this.textTemplate,
        canAutoResize: false
      },
      {
        prop: 'userId',
        name: 'User Id',
        minWidth: 60,
        flexGrow: 25,
        cellTemplate: this.textTemplate,
        headerClass: 'col',
        cellClass: 'col'
      },
      {
        prop: 'trackedAt',
        name: 'Tracked At',
        minWidth: 180,
        flexGrow: 25,
        cellTemplate: this.textTemplate,
        headerClass: 'col',
        cellClass: 'col'
      },
      {
        prop: 'latitude',
        name: 'Latitude',
        minWidth: 100,
        flexGrow: 25,
        cellTemplate: this.textTemplate,
        headerClass: 'col',
        cellClass: 'col'
      },
      {
        prop: 'longitude',
        name: 'Longitude',
        minWidth: 100,
        flexGrow: 25,
        cellTemplate: this.textTemplate,
        headerClass: 'col',
        cellClass: 'col'
      },
      {
        prop: 'accuracy',
        name: 'Accuracy',
        minWidth: 60,
        flexGrow: 25,
        cellTemplate: this.textTemplate,
        headerClass: 'col d-none d-md-block',
        cellClass: 'col d-none d-md-block'
      },
      {
        prop: 'tripId',
        name: 'Trip Id',
        minWidth: 60,
        flexGrow: 20,
        cellTemplate: this.textTemplate,
        headerClass: 'col d-none d-md-block',
        cellClass: 'col d-none d-md-block'
      },
      {
        prop: 'startedAt',
        name: 'Started At',
        minWidth: 100,
        flexGrow: 25,
        cellTemplate: this.textTemplate,
        headerClass: 'col d-none d-md-block',
        cellClass: 'col d-none d-md-block'
      },
      {
        prop: 'finishedAt',
        name: 'Finished At',
        minWidth: 100,
        flexGrow: 25,
        cellTemplate: this.textTemplate,
        headerClass: 'col d-none d-md-block',
        cellClass: 'col d-none d-md-block'
      },
      {
        prop: 'length',
        name: 'Length',
        minWidth: 45,
        flexGrow: 15,
        cellTemplate: this.textTemplate,
        headerClass: 'col d-none d-md-block',
        cellClass: 'col d-none d-md-block'
      },
      {
        prop: 'mode',
        name: 'Mode',
        minWidth: 45,
        flexGrow: 15,
        cellTemplate: this.textTemplate,
        headerClass: 'col d-none d-md-block',
        cellClass: 'col d-none d-md-block'
      },
      {
        prop: 'travelStatus',
        name: 'Travel Status',
        minWidth: 45,
        flexGrow: 15,
        cellTemplate: this.textTemplate,
        headerClass: 'col',
        cellClass: 'col'
      }
    ];

    if (this.canViewPhoneData) {
			this.phoneDataColumns.push({
				name: 'Actions',
				width: 100,
				cellTemplate: this.actionsTemplate,
				resizeable: false,
				canAutoResize: false,
				sortable: false,
				draggable: false
			});
		}
		this.loadData(); 

  }

  /**
	 * Load initial sample info (samples for user and group list)
	 */
	 public loadData(): void {
		this.alertService.startLoadingMessage();
		this.loadingIndicator = true; 

		 this.phoneDataService.listPhoneData().subscribe(
			(phoneData: PhoneData[]) => {
				this.phoneDataService.listPhoneData().subscribe((phonesdata: PhoneData[]) => {
					this.userGroupService
						.listUserGroups()
						.subscribe(
							userGroups => this.onDataLoadSuccessful(phoneData),
							error => this.onDataLoadFailed(error)
						);
				});
			},
			error => this.onDataLoadFailed(error)
		); 
	}

  public onDataLoadSuccessful(phoneData: PhoneData[]
		): void {
		this.alertService.stopLoadingMessage();
		this.loadingIndicator = false;

		this.phoneDataRows = phoneData;
		this.phoneDataRowsCache = [...phoneData];
		
	}

	public onDataLoadFailed(error: any): void {
		this.alertService.stopLoadingMessage();
		this.loadingIndicator = false;

		this.alertService.showStickyMessage(
			'Load Error',
			`Unable to retrieve surveys from the server.\r\nErrors: "${Utilities.getHttpResponseMessage(error)}"`,
			MessageSeverity.error,
			error
		);
	}

 public get canViewPhoneData(): boolean {
		return this.accountService.userHasPermission(Permission.viewPhonedataPermission);
	}

}
