export class CodeGenerator {
	constructor(public id?: number,
		public groupName?: string,
		public surveyId?: number,
		public pattern?: string,
		public codeLength?: number,
		public numberOfCodes?: number,
		public isGroupCode?: boolean,
		public usePattern?: boolean,
		public isTest?: boolean) {
			this.pattern = 'CCC-###';
			this.codeLength = 0;
	}
}
