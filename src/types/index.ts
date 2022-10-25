export type Instance = {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: null;
  UserID: number;
  Name: string;
  GroupName: string;
  StackName: string;
  requiredParameters:
    | [
        {
          name: string;
          value: string;
        }
      ]
    | [];
  optionalParameters:
    | [
        {
          name: string;
          value: string;
        }
      ]
    | [];
  DeployLog: string;
};

export type InstancesGroup = Array<{
  Name: string;
  Hostname: string;
  Instances: Array<Instance> | null;
}>;
