import React, { useEffect, useState } from "react";
import { getStack } from "../api/stacks";
import { Stack } from "../types/stack";
import { useParams } from 'react-router';

const StackDetails = () => {
  const { name } = useParams();
  const [stack, setStack] = useState<Stack>();
  useEffect(() => {
    const fetchStack = async () => {
      const result = await getStack(name);
      setStack(result.data);
    };
    fetchStack();
  }, [name]);
  return (
      // TODO: Why do I need "stack?." everywhere?
      <div key={stack?.name}>
        <h1>{stack?.name}</h1>
        <h2>Required parameters</h2>
        <ul>
        {stack?.requiredParameters?.map((requiredParameter) => {
          return (
            <li key={requiredParameter.Name}>
              <div>{requiredParameter.Name}</div>
              <p>Consumed: {requiredParameter.Consumed.toString()}</p>
              <p>Stack: {requiredParameter.StackName}</p>
            </li>
          );
        })}
        </ul>
        <h2>Optional parameters</h2>
        <ul>
        {stack?.optionalParameters?.map((optionalParameter) => {
          return (
            <li key={optionalParameter.Name}>
              <h3>{optionalParameter.Name}</h3>
              <p>Consumed: {optionalParameter.Consumed.toString()}</p>
              <p>Stack: {optionalParameter.StackName}</p>
              <p>Default value: {optionalParameter.DefaultValue}</p>
            </li>
          );
        })}
        </ul>
        {!stack && <p>no stack</p>}
      </div>
  );
};

export default StackDetails;
