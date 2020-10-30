import { Observable } from 'rxjs'

export abstract class SurveyAnalyticsService {
  public abstract sendEvent(
    eventCategory: string,
    eventAction: string,
    eventLabel?: string,
    eventValue?: number,
  ): Observable<void>
  public abstract sendTiming(
    timingVar: string,
    timingValue: number,
    timingCategory?: string,
    timlingLabel?: string,
  ): Observable<void>
  public abstract setPage(
    pageTitle: string,
    pagePath: string,
    pageLocation: string,
  ): Observable<void>
}
