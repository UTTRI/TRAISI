export interface Position {
	Lat: number;
	Long: number;
}

export interface Site {
	id: string;
	Position: Position;
	Name: string;
	CityCode: string;
	CityName: string;
	Language?: any;
	Category: number;
	LogicalId?: any;
	RoadNumber: number;
	Type: string;
	TimeSourceType: string;
	TransportMode?: any;
}

export interface Departure {
	Site: Site;
	GuidanceInfo?: any;
	Extension?: any;
	Time: string;
}

export interface Position2 {
	Lat: number;
	Long: number;
}

export interface Site2 {
	id: string;
	Position: Position2;
	Name: string;
	CityCode: string;
	CityName: string;
	Language?: any;
	Category: number;
	LogicalId?: any;
	RoadNumber: number;
	Type: string;
	TimeSourceType: string;
	TransportMode?: any;
}

export interface Arrival {
	Site: Site2;
	GuidanceInfo?: any;
	Extension?: any;
	Time: string;
}

export interface Direction {
	Id: string;
	Name: string;
}

export interface Attribute {
	Value: string;
	Name: string;
}

export interface Position3 {
	Lat: number;
	Long: number;
}

export interface StopPlace {
	importId: string;
	Parent?: any;
	idcomment?: any;
	id: string;
	Position: Position3;
	Name: string;
	CityCode: string;
	CityName: string;
	Language?: any;
	Category: number;
	LogicalId: string;
	RoadNumber: number;
	Type: string;
	TimeSourceType: string;
	TransportMode: string;
}

export interface Departure2 {
	StopPlace: StopPlace;
	PassThrough: boolean;
	Extension?: any;
	Time: string;
}

export interface Position4 {
	Lat: number;
	Long: number;
}

export interface StopPlace2 {
	importId: string;
	Parent?: any;
	idcomment?: any;
	id: string;
	Position: Position4;
	Name: string;
	CityCode: string;
	CityName: string;
	Language?: any;
	Category: number;
	LogicalId: string;
	RoadNumber: number;
	Type: string;
	TimeSourceType: string;
	TransportMode: string;
}

export interface Arrival2 {
	StopPlace: StopPlace2;
	PassThrough: boolean;
	Extension?: any;
	Time: string;
}

export interface Operator {
	id: string;
	Name: string;
	Code: string;
}

export interface Access {
	UFR: number;
	DM: number;
	NV: number;
	ME: number;
}

export interface LineAccess {
	UFR: number;
	DM: number;
	NV: number;
	ME: number;
}

export interface Line {
	id: string;
	companyRef: string;
	ptNetworkRef: string;
	groupOfLineRef?: any;
	Name: string;
	Number: string;
	PublishedName: string;
	RegistrationNumber?: any;
	Comment?: any;
	Color: string;
}

export interface PTNetwork {
	id: string;
	Name: string;
	VersionDate?: any;
	RegistrationNumber: string;
	Comment?: any;
}

export interface Position5 {
	Lat: number;
	Long: number;
}

export interface StopPlace3 {
	importId: string;
	Parent?: any;
	idcomment?: any;
	id: string;
	Position: Position5;
	Name: string;
	CityCode: string;
	CityName: string;
	Language?: any;
	Category: number;
	LogicalId: string;
	RoadNumber: number;
	Type: string;
	TimeSourceType: string;
	TransportMode: string;
}

export interface Departure3 {
	StopPlace: StopPlace3;
	PassThrough: boolean;
	Extension?: any;
	Time: string;
}

export interface Position6 {
	Lat: number;
	Long: number;
}

export interface StopPlace4 {
	importId: string;
	Parent?: any;
	idcomment?: any;
	id: string;
	Position: Position6;
	Name: string;
	CityCode: string;
	CityName: string;
	Language?: any;
	Category: number;
	LogicalId: string;
	RoadNumber: number;
	Type: string;
	TimeSourceType: string;
	TransportMode: string;
}

export interface Arrival3 {
	StopPlace: StopPlace4;
	PassThrough: boolean;
	Extension?: any;
	Time: string;
}

export interface Step {
	id?: any;
	Departure: Departure3;
	Arrival: Arrival3;
	Geometry: string;
	Duration: string;
	Distance: number;
	Extension?: any;
}

export interface Steps {
	Step: Step[];
}

export interface PTRide {
	Disruption: boolean;
	Direction: Direction;
	Attribute: Attribute[];
	LastStopId: number;
	IsLastCourse: boolean;
	DontGetOut: boolean;
	Departure: Departure2;
	Arrival: Arrival2;
	Operator: Operator;
	Picto?: any;
	Access: Access;
	DepartureAccess?: any;
	ArrivalAccess?: any;
	LineAccess: LineAccess;
	Notes?: any;
	CodeActivity: string;
	IsDateExtended: boolean;
	GetOnWaitingTime: number;
	lineRef?: any;
	companyRef?: any;
	ptNetworkRef?: any;
	vehicleJourneyRef: string;
	groupeOfLineRef?: any;
	StopHeadSign?: any;
	JourneyPatternName: string;
	Destination: string;
	Line: Line;
	GroupOfLine?: any;
	PTNetwork: PTNetwork;
	Company?: any;
	Duration: string;
	Distance: number;
	KmlOverview?: any;
	Comment?: any;
	steps: Steps;
	Code: string;
	Extension?: any;
	TransportMode: string;
	Diversion?: any;
	TripGeometry: string;
}

export interface Position7 {
	Lat: number;
	Long: number;
}

export interface Site3 {
	id: string;
	Position: Position7;
	Name: string;
	CityCode: string;
	CityName: string;
	Language?: any;
	Category: number;
	LogicalId: string;
	RoadNumber: number;
	Type: string;
	TimeSourceType: string;
	TransportMode: string;
}

export interface Departure4 {
	Site: Site3;
	GuidanceInfo?: any;
	Extension?: any;
	Time: string;
}

export interface Position8 {
	Lat: number;
	Long: number;
}

export interface Site4 {
	id: string;
	Position: Position8;
	Name: string;
	CityCode: string;
	CityName: string;
	Language?: any;
	Category: number;
	LogicalId: string;
	RoadNumber: number;
	Type: string;
	TimeSourceType: string;
	TransportMode: string;
}

export interface Arrival4 {
	Site: Site4;
	GuidanceInfo?: any;
	Extension?: any;
	Time: string;
}

export interface Position9 {
	Lat: number;
	Long: number;
}

export interface Site5 {
	id: string;
	Position: Position9;
	Name: string;
	CityCode: string;
	CityName: string;
	Language?: any;
	Category: number;
	LogicalId: string;
	RoadNumber: number;
	Type: string;
	TimeSourceType: string;
	TransportMode: string;
}

export interface Departure5 {
	Site: Site5;
	GuidanceInfo?: any;
	Extension?: any;
	Time: string;
}

export interface Position10 {
	Lat: number;
	Long: number;
}

export interface Site6 {
	id: string;
	Position: Position10;
	Name: string;
	CityCode: string;
	CityName: string;
	Language?: any;
	Category: number;
	LogicalId: string;
	RoadNumber: number;
	Type: string;
	TimeSourceType: string;
	TransportMode: string;
}

export interface Arrival5 {
	Site: Site6;
	GuidanceInfo?: any;
	Extension?: any;
	Time: string;
}

export interface Elevation {
	Altitude: number;
	Distance: number;
}

export interface PathLink {
	id: string;
	Access?: any;
	Departure: Departure5;
	Arrival: Arrival5;
	Duration: string;
	Distance: number;
	Geometry: string;
	Extension?: any;
	Speed: number;
	direction: number;
	Type: string;
	SubType: string;
	Elevations: Elevation[];
	TimeSourceType: string;
	TrafficState: string;
	RelativeDirection: string;
	MagneticDirection: string;
}

export interface PathLinks {
	PathLink: PathLink[];
}

export interface Leg {
	CoVPInformation?: any;
	TADInformation?: any;
	Departure: Departure4;
	Arrival: Arrival4;
	Duration: string;
	TransportCenter?: any;
	pathLinks: PathLinks;
	KmlOverview?: any;
	Extension?: any;
	TransportMode: string;
}

export interface Section {
	PTRide: PTRide;
	Leg: Leg;
}

export interface Sections {
	Section: Section[];
}

export interface Trip {
	CarbonFootprint?: any;
	Disruption: boolean;
	Departure: Departure;
	Arrival: Arrival;
	TripKey: string;
	TripTitle: string;
	Duration: string;
	Distance: number;
	InterchangeNumber: number;
	KmlOverview?: any;
	sections: Sections;
	DepartureTime: string;
	ArrivalTime: string;
}

export interface Trips {
	Trip: Trip[];
}

export interface Status {
	comment: string;
	ExecutionTime: number;
	Code: string;
}

export interface Response {
	Query?: any;
	trips: Trips;
	Status: Status;
}

export interface Datum {
	response: Response;
	PlanTripType: number;
	PlanTripDifferenceList: any[];
	Order: number;
}

export interface RootObject {
	Data: Datum[];
	StatusCode: number;
	Message: string;
}
