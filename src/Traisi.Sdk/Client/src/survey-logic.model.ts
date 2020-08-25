interface SurveyLogicRules {
	condition: SurveyLogicCondition;
	rules: SurveyLogicRule[];
}

interface SurveyLogicRule {
	operator: SurveyLogicOperator;
	sourceQuestionId: number;
	value: Array<string>;
}


enum SurveyLogicOperator {
	equals = '=',
	notEquals = '!=',
	greaterThan = '>',
	greaterThanEqualTo = '>=',
	lessThan = '<',
	lessThanEqualTo = '<=',
	contains = 'contains',
	like = 'like',
	anyOf = 'any of',
	allOf = 'all of',
	noneOf = 'none of'
}

enum SurveyLogicCondition {
	and = 'and',
	or = 'or'
}


export {
	SurveyLogicOperator,
	SurveyLogicCondition,
	SurveyLogicRule,
	SurveyLogicRule as SurveyViewerLogicRuleViewModel,
	SurveyLogicRules,
	SurveyLogicRules as SurveyViewerLogicRulesViewModel,
};
