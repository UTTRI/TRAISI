import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'app-text-block1',
	templateUrl: './text-block1.component.html',
	styleUrls: ['./text-block1.component.scss']
})
export class TextBlock1Component implements OnInit {
	public quillModules = {
		toolbar: [
			['bold', 'italic', 'underline', 'strike'], // toggled buttons
			['blockquote', 'code-block'],

			[{ list: 'ordered' }, { list: 'bullet' }],
			[{ script: 'sub' }, { script: 'super' }], // superscript/subscript
			[{ indent: '-1' }, { indent: '+1' }], // outdent/indent
			[{ direction: 'rtl' }], // text direction

			[{ header: [1, 2, 3, 4, 5, 6, false] }],

			[{ color: [] }], // dropdown with defaults from theme
			[{ font: [] }],
			[{ size: [] }],
			[{ align: [] }],

			['clean'], // remove formatting button

			['link'] // link and image, video
		]
	};

	@Input()
	public previewMode: any;
	@Input()
	public pageHTML: string;
	@Output()
	public pageHTMLChange = new EventEmitter();

	@Output() public forceSave = new EventEmitter();

	constructor() {}

	ngOnInit() {}

	updateContent(contentInfo: any) {
		this.pageHTMLChange.emit(this.pageHTML);
	}

	clearUploads() {
	}

}
