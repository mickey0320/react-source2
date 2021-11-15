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

export const shallowEqual = (obj1, obj2) => {
  if (obj1 === obj2) {
    return true;
  }
  if (
    typeof obj1 !== "object" ||
    obj1 == null ||
    typeof obj2 !== "object" ||
    obj2 == null
  ) {
    return false;
  }
  const key1s = Object.keys(obj1).length;
  const key2s = Object.keys(obj2).length;
  if (key1s.length !== key2s.length) {
    return false;
  }
  for (let key in obj1) {
    if (
      obj1[key] !== obj2[key] ||
      !Object.prototype.hasOwnProperty.call(obj2, key)
    ) {
      return false;
    }
  }

  return true;
};
