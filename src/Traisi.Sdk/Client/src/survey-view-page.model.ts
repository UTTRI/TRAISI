import { SurveyViewSection } from './survey-view-section.model'
import { SurveyViewQuestion } from './survey-view-question.model'

export interface SurveyViewPage {
  id: number

  sections: Array<SurveyViewSection>

  questions: Array<SurveyViewQuestion>

  order: number

  label: string

  icon: string
}
