import { TimelineResponseData } from "traisi-question-sdk";

export interface ScheduleInputState {

    shouldCollectDepartureTime?: boolean;
    shouldCollectTravelMode?: boolean;
    canAdvance?: boolean;
    isValid?: boolean;
    isActive?: boolean;
    model?: TimelineResponseData;
    scheduleIndex?: number;
    returnHomeResponse?: string;
    isConfirmed?: boolean;


}