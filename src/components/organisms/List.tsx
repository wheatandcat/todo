import React, { memo } from "react";

type Props = {
  text: string;
};

const List: React.FC<Props> = (props) => {
  return (
    <li className="pl-2">
      <div>
        <span>
          <b>・</b>
          {props.text}
        </span>
      </div>
    </li>
  );
};

export default memo(List);
