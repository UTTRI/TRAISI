import { Address } from './models'

export interface SurveyRespondent {
  name?: string
  id?: number
  relationship?: string
  email?: string
  phoneNumber?: string
  homeAddress?: Address
  homeLatitude?: number
  homeLongitude?: number
  surveyAccessTime?: Date;
}
