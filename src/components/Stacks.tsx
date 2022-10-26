import React, { useEffect, useState } from "react";
import {Link} from "react-router-dom";
import { getStacks } from "../api/stacks";
import { Stacks } from "../types/stack";

const StackList = () => {
  const [stacks, setStack] = useState<Stacks>();
  useEffect(() => {
    const fetchStacks = async () => {
      const result = await getStacks();
      setStack(result.data);
    };
    fetchStacks();
  }, []);
  return (
    <div>
      <h1>List of instances</h1>
      {stacks?.map((stack) => {
        return (
          <div key={stack.name}>
            <Link to={`/stacks/${stack.name}`}>{stack.name}</Link>
          </div>
        );
      })}
    </div>
  );
};

export default StackList;
