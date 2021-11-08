import { Component } from "./Component";
import { wrapToVdom } from "./util";

function createElement(type, options = {}, ...children) {
  const { ref, key, ...props } = options;
  if (children.length > 1) {
    props.children = children.map(wrapToVdom);
  } else if (children.length === 1) {
    props.children = wrapToVdom(children[0]);
  } else {
    props.children = undefined;
  }
  return {
    type,
    props,
    ref,
    key,
  };
}

const React = {
  createElement,
  Component,
};

export default React;
