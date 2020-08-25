import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Utilities } from '../../../../../../shared/services/utilities';

@Component({
  selector: 'app-screening-questions',
  templateUrl: './screening-questions.component.html',
  styleUrls: ['./screening-questions.component.scss']
})
export class ScreeningQuestionsComponent implements OnInit {

	public questionsList: string[] = [];
	private pageHTMLJson: any;

	@Input()
	public pageHTML: string;
	@Output()
	public pageHTMLChange: EventEmitter<string> = new EventEmitter();
	@Input() public pageThemeInfo: any;
	@Output()	public pageThemeInfoChange: EventEmitter<any> = new EventEmitter();

  constructor() {
		this.getPayload = this.getPayload.bind(this);
	 }

  public ngOnInit(): void {
		try {
			let pageData = JSON.parse(this.pageHTML);
			this.pageHTMLJson = pageData;
			this.questionsList = pageData.questionsList;
		} catch (e) {
			this.pageHTMLJson = {};
		}
	}

	public deleteQuestion(index: number): void
	{
		this.questionsList.splice(index, 1);
		this.updateHTML();
	}

	public addQuestion(): void {
		this.questionsList.push('');
		this.updateHTML();
	}

	public getPayload(index: number): string {
		return this.questionsList[index];
	}

	public onDrop(dropResult: any): void {

		this.questionsList = Utilities.applyDrag(this.questionsList, dropResult);
		this.updateHTML();
	}

	public updateHTML(): void {
		this.pageHTMLJson.questionsList = this.questionsList;
		this.pageHTML = JSON.stringify(this.pageHTMLJson);
		this.pageHTMLChange.emit(this.pageHTML);
	}

	public trackByIdx(index: number, obj: any): any {
		return index;
	}
}
