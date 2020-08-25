import { GroupsManagementModule } from './groups-management.module';

describe('GroupsManagementModule', () => {
  let groupsManagementModule: GroupsManagementModule;

  beforeEach(() => {
    groupsManagementModule = new GroupsManagementModule();
  });

  it('should create an instance', () => {
    expect(groupsManagementModule).toBeTruthy();
  });
});
