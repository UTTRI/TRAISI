import { } from 'jasmine';
import { ConditionalEvaluator } from '../../app/services/conditional-evaluator/conditional-evaluator.service'
import { QuestionConditionalOperator } from '../../app/models/question-conditional-operator.model';


describe("ConditionalEvaluator", () => {
	let conditionalEvaluator: ConditionalEvaluator;

	beforeEach(() => {
		conditionalEvaluator = new ConditionalEvaluator(null, null);
	});

	it("it should be defined", () => {
		expect(conditionalEvaluator).toBeDefined();
	});


});
