import { React_Forward, React_Text } from "./constants";
import addEvent from './event'

function render(vdom, container) {
  const dom = createDOM(vdom);
  if (container) {
    container.appendChild(dom);
  }
}

export function createDOM(vdom) {
  const { type, props, ref } = vdom;
  let dom;
  if (type === React_Text) {
    dom = document.createTextNode(props.content);
    return dom;
  } else if (typeof type === "string") {
    dom = document.createElement(type);
    updateProps(dom, {}, props);
  } else if(type.$$typeof === React_Forward){
    return mountForwardComponent(vdom)
  } else if (typeof type === "function") {
    if (type.isReact) {
      return mountClassComponent(vdom);
    } else {
      return mountFunctionComponent(vdom);
    }
  }
  if (props.children) {
    const children = Array.isArray(props.children)
      ? props.children
      : [props.children];
    children.forEach((childVdom) => render(childVdom, dom));
  }
  vdom.dom = dom
  if(ref) {
    ref.current = dom
  }
  return dom;
}

function updateProps(dom, oldProps, newProps) {
  for (let prop in newProps) {
    if (prop === "children") continue;
    if (prop === "style") {
      for (let key in newProps.style) {
        dom.style[key] = newProps.style[key];
      }
    } else if (prop.startsWith("on")) {
        addEvent(dom, prop.toLocaleLowerCase(), newProps[prop])
    } else {
      dom.setAttribute(prop, newProps[prop]);
    }
  }
}

function mountClassComponent(vdom) {
  const { type, props, ref } = vdom;
  const classInstance = new type(props);
  const oldRenderVdom = classInstance.render();
  classInstance.oldRenderVdom = oldRenderVdom
  if(ref){
    ref.current = classInstance
  }

  return createDOM(oldRenderVdom);
}

function mountFunctionComponent(vdom) {
  const { type, props } = vdom;
  const oldRenderVdom = type(props);

  return createDOM(oldRenderVdom);
}

function mountForwardComponent(vdom){
  const {ref, type, props} = vdom
  const oldRenderVdom = type.render(props, ref)

  return createDOM(oldRenderVdom)
}

export function findDOM(vdom){
  if(vdom.dom){
    return vdom.dom
  } else {
    return findDOM(vdom.oldRenderVdom)
  }
}

export const compareTwoVdom = (dom,oldVdom, newVdom) => {
  const newDOM = createDOM(newVdom)
  dom.parentNode.replaceChild(newDOM, dom)
}

const ReactDOM = {
  render,
};

export default ReactDOM;
