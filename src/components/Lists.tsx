import React, { useEffect, useState } from "react";
import { useAuthHeader } from "react-auth-kit";
import { getInstances } from "../api";
import { InstancesGroup } from "../types";

const InstancesList = () => {
  const getAuthHeader = useAuthHeader()
  const [instances, setInstances] = useState<InstancesGroup>();

  useEffect(() => {
    const authHeader = getAuthHeader()
    console.log(authHeader)
    const fetchInstances = async () => {
      const result = await getInstances(authHeader);
      setInstances(result.data);
    };
    if (authHeader && !instances) {
      fetchInstances();
    }

  },[getAuthHeader, instances]);
  return (
    <div>
      <h1>List of instances</h1>
      {JSON.stringify(instances)}
    </div>
  );
};

export default InstancesList;
