import React, { memo } from "react";

type Props = {
  children: React.ReactNode;
};

const List: React.FC<Props> = (props) => {
  return (
    <li className="pl-2">
      <div>
        <span>
          <b>・</b>
          {props.children}
        </span>
      </div>
    </li>
  );
};

export default memo(List);
