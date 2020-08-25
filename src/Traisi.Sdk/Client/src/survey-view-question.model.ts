import { ResponseValidationState } from './public_api'
import { SurveyViewPage } from './survey-view-page.model'
import { SurveyRespondent } from './survey-respondent.model'
import { SurveyViewSection } from './survey-view-section.model'
import { SurveyLogicRules } from './survey-logic.model'

export interface SurveyViewQuestion {
  configuration: object | Array<any> | any
  id: number
  isHidden?: boolean
  isRespondentHidden?: { [id: number]: boolean }
  respondentValidationState?: { [id: number]: ResponseValidationState }
  isOptional: boolean
  isRepeat: boolean
  label: string
  descriptionLabel: string
  name: string
  order: number
  viewOrder: number
  questionId: number
  questionType: string
  pageIndex: number
  repeatSource?: number
  repeatTargets?: number[]
  repeatChildren?: { [id: string]: Array<SurveyViewQuestion> }
  navigationOder: number
  repeatNumber?: number
  inSectionIndex?: number

  // convenient ref to section or page

  parentSection: SurveyViewSection
  parentPage: SurveyViewPage
  viewId: Symbol
  parentMember?: SurveyRespondent
  validationState: ResponseValidationState
  conditionals: Array<SurveyLogicRules>
}
