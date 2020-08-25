export abstract class QuestionConfigurationService {
  abstract getQuestionServerConfiguration(string): any
  abstract listConfigurations(): { question: string; property: string[] }[]
}
