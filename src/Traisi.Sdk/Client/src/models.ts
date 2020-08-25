import { SurveyRespondentViewModel } from "./public_api";

export interface SurveyResponseViewModel {
    questionId?: number;
    responseValues?: { [key: string]: any; }[] | undefined;
    configuration?: { [key: string]: any; } | undefined;
    respondent?: SurveyRespondentViewModel | undefined;
}

export type ResponseModel = SurveyResponseViewModel