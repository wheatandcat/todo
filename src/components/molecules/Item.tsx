import { memo, type FC } from "react";
import { getTaskText } from "@/lib/task";

type Props = {
  type?: string;
  value: any;
};

const Item: FC<Props> = (props) => {
  let isLink = props.type === "a";
  if (typeof props.value === "string") {
    isLink =
      props.value.startsWith("https://") || props.value.startsWith("http://");
  }

  let text = props.value;
  if (props.type === "a") {
    text = getTaskText(props.value);
  }

  if (isLink) {
    return (
      <a href={text} target="_blank" rel="noreferrer">
        {text}
      </a>
    );
  }
  return <>{text}</>;
};

export default memo(Item);
