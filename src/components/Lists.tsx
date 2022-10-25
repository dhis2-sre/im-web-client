import React, { useEffect, useState } from "react";
import { getInstances } from "../api";
import { InstancesGroup } from "../types";

const InstancesList = () => {
  const [instances, setInstances] = useState<InstancesGroup>();
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
      {JSON.stringify(instances)}
    </div>
  );
};

export default InstancesList;
