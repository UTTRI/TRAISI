import { User } from './user.model';

export class SurveyUser extends User {
	public surveyId: number;
	public shortcode: string;
	public groupcode: string;
}
