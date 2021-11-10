import { React_Forward, React_Text } from "./constants";
import addEvent from "./event";

function render(vdom, container) {
  const dom = createDOM(vdom);
  if (container) {
    container.appendChild(dom);
    if (dom._componentDidMount) {
      dom._componentDidMount();
    }
  }
}

export function createDOM(vdom) {
  const { type, props, ref } = vdom;
  let dom;
  if (type === React_Text) {
    dom = document.createTextNode(props.content);
  } else if (typeof type === "string") {
    dom = document.createElement(type);
    updateProps(dom, {}, props);
  } else if (type.$$typeof === React_Forward) {
    return mountForwardComponent(vdom);
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
    children.forEach((childVdom) => {
      render(childVdom, dom);
    });
  }
  vdom.dom = dom;
  if (ref) {
    ref.current = dom;
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
      addEvent(dom, prop.toLocaleLowerCase(), newProps[prop]);
    } else {
      dom.setAttribute(prop, newProps[prop]);
    }
  }
}

function mountClassComponent(vdom) {
  const { type, props, ref } = vdom;
  const classInstance = new type(props);
  vdom.classInstance = classInstance;
  if (classInstance.componentWillMount) {
    classInstance.componentWillMount();
  }
  const oldRenderVdom = classInstance.render();
  vdom.oldRenderVdom = classInstance.oldRenderVdom = oldRenderVdom;
  if (ref) {
    ref.current = classInstance;
  }

  const dom = createDOM(oldRenderVdom);
  if (classInstance.componentDidMount) {
    dom._componentDidMount =
      classInstance.componentDidMount.bind(classInstance);
  }
  return dom;
}

function mountFunctionComponent(vdom) {
  const { type, props } = vdom;
  const oldRenderVdom = type(props);
  vdom.oldRenderVdom = oldRenderVdom;

  return createDOM(oldRenderVdom);
}

function mountForwardComponent(vdom) {
  const { ref, type, props } = vdom;
  const oldRenderVdom = type.render(props, ref);

  return createDOM(oldRenderVdom);
}

export function findDOM(vdom) {
  if(!vdom) return null
  if (vdom.dom) {
    return vdom.dom;
  } else {
    return findDOM(vdom.oldRenderVdom);
  }
}

export const compareTwoVdom = (parentNode, oldVdom, newVdom, nextDOM) => {
  if (!oldVdom && !newVdom) {
    return null;
  } else if (oldVdom && !newVdom) {
    unmountNode(oldVdom);
  } else if (!oldVdom && newVdom) {
    mountNode(parentNode, oldVdom, newVdom, nextDOM);
  } else if (oldVdom && newVdom && oldVdom.type !== newVdom.type) {
    unmountNode(oldVdom);
    mountNode(parentNode, oldVdom, newVdom, nextDOM);
  } else if (oldVdom && oldVdom && oldVdom.type === newVdom.type) {
    updateElement(oldVdom, newVdom);
  }
};

function updateElement(oldVdom, newVdom) {
  if (oldVdom.type === React_Text) {
    const dom = (newVdom.dom = oldVdom.dom);
    if (oldVdom.props.content !== newVdom.props.content) {
      dom.textContent = newVdom.props.content;
    }
  } else if (typeof oldVdom.type === "string") {
    const currentDOM = (newVdom.dom = findDOM(oldVdom));
    updateProps(currentDOM, oldVdom.props, newVdom.props);
    updateChildren(currentDOM, oldVdom.props.children, newVdom.props.children);
  } else if (typeof oldVdom.type === "function") {
    if (oldVdom.type.isReact) {
      updateClassComponent(oldVdom, newVdom);
    } else {
      updateFunctionComponent(oldVdom, newVdom);
    }
  }
}

function updateClassComponent(oldVdom, newVdom) {
  const classInstance = (newVdom.classInstance = oldVdom.classInstance);
  if (classInstance.componentWillReceiveProps) {
    classInstance.componentWillReceiveProps(newVdom.props);
  }
  classInstance.updater.emitUpdate(newVdom.props);
}

function updateFunctionComponent(oldVdom, newVdom) {
  const { props, type } = newVdom;
  const oldRenderVdom = oldVdom.oldRenderVdom;
  const newRenderVdom = type(props);
  const currentDOM = findDOM(oldRenderVdom);

  compareTwoVdom(currentDOM, oldRenderVdom, newRenderVdom);
}

function updateChildren(parentNode, oldVdomChildren, newVdomChildren) {
  const oldVdomChildrenArray = Array.isArray(oldVdomChildren)
    ? oldVdomChildren
    : [oldVdomChildren];
  const newVdomChildrenArray = Array.isArray(newVdomChildren)
    ? newVdomChildren
    : [newVdomChildren];
  const maxLen = Math.max(
    oldVdomChildrenArray.length,
    newVdomChildrenArray.length
  );
  for (let i = 0; i < maxLen; i++) {
    const nextVdom = oldVdomChildrenArray.find(
      (item, index) => item && index > i
    );
    compareTwoVdom(
      parentNode,
      oldVdomChildrenArray[i],
      newVdomChildrenArray[i],
      nextVdom && findDOM(nextVdom)
    );
  }
}

function unmountNode(vdom) {
  const { ref, props } = vdom;
  const classInstance = vdom.classInstance;
  if (classInstance.componentWillUnmount) {
    classInstance.componentWillUnmount();
  }
  if (ref) ref.current = null;
  if (props.children) {
    const children = Array.isArray(props.children)
      ? props.children
      : [props.children];
    children.forEach(unmountNode);
  }
  const dom = findDOM(vdom);
  dom.parentNode.removeChild(dom);
}

function mountNode(parentNode, oldVdom, newVdom, nextDOM) {
  const classInstance = oldVdom.classInstance;
  const newDOM = createDOM(newVdom);
  if (nextDOM) {
    parentNode.insertBefore(newDOM, nextDOM);
  } else {
    parentNode.appendChild(newDOM);
  }
  if (classInstance.componentDidMount) {
    classInstance.componentDidMount();
  }
}

const ReactDOM = {
  render,
};

export default ReactDOM;
