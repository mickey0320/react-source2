import { Component } from "./Component";
import { wrapToVdom } from "./util";
import { React_Forward } from "./constants";

function createElement(type, options = {}, ...children) {
  const { ref, key, ...props } = options;
  delete props.__self;
  delete props.__source;
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

function createRef() {
  return {
    current: null,
  };
}

function forwardRef(render) {
  return {
    $$typeof: React_Forward,
    render,
  };
}

const React = {
  createElement,
  Component,
  createRef,
  forwardRef,
};

export default React;
