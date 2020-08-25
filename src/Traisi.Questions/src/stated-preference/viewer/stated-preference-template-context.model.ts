import { StatedPreferenceQuestionComponent } from './stated-preference-question.component';

export interface StatedPreferenceTemplateContext {
    response: (questionId: string, type?: string) => void;
    isResponsesLoaded: boolean;
    responsesToLoad: Array<string>;
    distanceMatrixQueries: {
        origins: Set<string>;
        destinations: Set<string>;
    };

    distanceMatrixQuestionQueries: {
        origins: Set<string>;
        destinations: Set<string>;
    };

    distanceMatrixMap: { [name:string]: string };

    distanceMatrixResults?: any;

    component: StatedPreferenceQuestionComponent;

}