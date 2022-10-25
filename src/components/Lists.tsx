import React, { useEffect, useState } from "react";
import { getInstances } from "../api";
import { InstancesGroup } from "../types";

const InstancesList = () => {
  const [instancesGroups, setInstances] = useState<InstancesGroup>();
  useEffect(() => {
    const fetchInstances = async () => {
      const result = await getInstances();
      setInstances(result.data);
    };
    fetchInstances();
  }, []);
  return (
    <div>
      <h1>List of instances</h1>
      {instancesGroups?.map((group) => {
        return (
          <div key={group.Name}>
            <h1>{group.Name}</h1>
            {group.Instances?.map((instance) => {
              return (
                <div key={instance.ID}>
                  <h2>{instance.Name}</h2>
                  <p>Created at: {instance.CreatedAt}</p>
                  <p>Group name: {instance.GroupName}</p>
                  <p>Stack name: {instance.StackName}</p>
                </div>
              );
            })}
            {!group.Instances && <p>no instances</p>}
          </div>
        );
      })}
    </div>
  );
};

export default InstancesList;
