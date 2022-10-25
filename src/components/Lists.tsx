import React, { useEffect, useState } from "react";
import { useAuthHeader, useIsAuthenticated } from "react-auth-kit";
import { useNavigate } from "react-router";
import { getInstances } from "../api";
import { InstancesGroup } from "../types";

const InstancesList = () => {
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated()
  const getAuthHeader = useAuthHeader()
  const [instances, setInstances] = useState<InstancesGroup>();

  useEffect(() => {
    if (isAuthenticated()) {


    const authHeader = getAuthHeader()
    const fetchInstances = async () => {
      const result = await getInstances(authHeader);
      setInstances(result.data);
    };
    if (!instances) {
      fetchInstances();
    }
  } else {
    navigate('/')
  }
  },[getAuthHeader, isAuthenticated, instances, navigate]);
  return (
    <div>
      <h1>List of instances</h1>
      {JSON.stringify(instances)}
    </div>
  );
};

export default InstancesList;
