import {} from 'jasmine';
import { TravelDiaryEditor } from './travel-diary-editor.service';

describe('Hello world', () => {
    let expected = '';
    
    let x = new TravelDiaryEditor(new Date());

	beforeEach(() => {
        expected = 'Hello World';
        console.log(TravelDiaryEditor);
	});

	afterEach(() => {
		expected = '';
	});

	it('says hello', () => {
		expect('').toEqual('');
	});
}); 



