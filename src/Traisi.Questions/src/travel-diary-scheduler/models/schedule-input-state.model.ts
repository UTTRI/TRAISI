import { TimelineResponseData } from "traisi-question-sdk";
import { TravelDiarySchedulerErrorState } from "./error-state.model";
import { TimelineSchedulerData } from "./timeline-scheduler-data.model";

export interface ScheduleInputState {

    shouldCollectDepartureTime?: boolean;
    shouldCollectTravelMode?: boolean;
    canAdvance?: boolean;
    isValid?: boolean;
    isActive?: boolean;
    model?: TimelineSchedulerData;
    scheduleIndex?: number;
    returnHomeResponse?: string;
    errorState?: TravelDiarySchedulerErrorState;


}