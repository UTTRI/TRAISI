import { TravelDiaryEvent } from "./consts";

export interface TravelDiaryViewTimeEvent  {
	event: TravelDiaryEvent;
	height: number; 
	width: number;
	top: number;
	left: number;
	startsBeforeDay: boolean;
	endsAfterDay: boolean; 
} 
