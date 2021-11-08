import { React_Text } from "./constants";

export const wrapToVdom = (val) => {
  if (typeof val === "number" || typeof val === "string") {
    return {
      type: React_Text,
      props: {
        content: val,
      },
    };
  } else {
    return val;
  }
};
