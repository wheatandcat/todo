import { type FC, type ReactNode, memo } from "react";

type Props = {
  children: ReactNode;
};

const List: FC<Props> = (props) => {
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
