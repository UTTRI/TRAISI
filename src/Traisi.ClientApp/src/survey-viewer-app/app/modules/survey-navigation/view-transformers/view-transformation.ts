import { NavigationState } from 'app/models/navigation-state.model';

export abstract class ViewTransformation {

	public abstract transformNavigationState(state: NavigationState): NavigationState;
}
