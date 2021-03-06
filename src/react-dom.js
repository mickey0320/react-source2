import {
  React_Context,
  React_Forward,
  React_Memo,
  React_Provider,
  React_Text,
} from "./constants";
import addEvent from "./event";

let hookStates = [];
let hookIndex = 0;
let scheduleUpdate;

function render(vdom, container) {
  mount(vdom, container);
  scheduleUpdate = () => {
    compareTwoVdom(container, vdom, vdom);
    hookIndex = 0;
  };
}

function mount(vdom, container) {
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
  } else if (type.$$typeof === React_Provider) {
    return mountReactProviderComponent(vdom);
  } else if (type.$$typeof === React_Memo) {
    return mountReactMemoComponent(vdom);
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
  if (type.contextType) {
    classInstance.context = type.contextType._value;
  }
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
  const renderVdom = type(props);
  vdom.oldRenderVdom = renderVdom;

  return createDOM(renderVdom);
}

function mountReactMemoComponent(vdom) {
  const { type, props } = vdom;
  const renderVdom = type.component(props);
  vdom.prevProps = props;
  vdom.oldRenderVdom = renderVdom;

  return createDOM(renderVdom);
}

function mountForwardComponent(vdom) {
  const { ref, type, props } = vdom;
  const oldRenderVdom = type.render(props, ref);

  return createDOM(oldRenderVdom);
}

function mountReactProviderComponent(vdom) {
  const { type, props } = vdom;
  type._context._value = props.value;
  vdom.oldRenderVdom = props.children;

  return createDOM(props.children);
}

export function findDOM(vdom) {
  if (!vdom) return null;
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
  } else if (oldVdom.type.$$typeof === React_Provider) {
    updateReactProviderComponent(oldVdom, newVdom);
  } else if (oldVdom.type.$$typeof === React_Memo) {
    updateReactMemoComponent(oldVdom, newVdom);
  } else if (typeof oldVdom.type === "function") {
    if (oldVdom.type.isReact) {
      updateClassComponent(oldVdom, newVdom);
    } else {
      updateFunctionComponent(oldVdom, newVdom);
    }
  }
}

function updateReactProviderComponent(oldVdom, newVdom) {
  const { type, props } = newVdom;
  const dom = (newVdom.dom = findDOM(oldVdom));
  type._context._value = props.value;
  const newRenderVdom = props.children;
  compareTwoVdom(dom, oldVdom.oldRenderVdom, newRenderVdom);
  newVdom.oldRenderVdom = newRenderVdom;
}

function updateReactMemoComponent(oldVdom, newVdom) {
  const { type, props } = newVdom;
  const dom = findDOM(oldVdom);
  const parentNode = dom.parentNode;
  if (!type.compare(oldVdom.oldProps, props)) {
    const renderVdom = type.component(newVdom.props);
    compareTwoVdom(parentNode, oldVdom.oldRenderVdom, renderVdom);
    newVdom.oldRenderVdom = renderVdom;
    newVdom.oldProps = props;
  } else {
    newVdom.oldRenderVdom = oldVdom.oldRenderVdom;
    newVdom.oldProps = oldVdom.oldProps;
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
  newVdom.oldRenderVdom = newRenderVdom;
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
  const dom = findDOM(vdom.classInstance.oldRenderVdom);
  dom.parentNode.removeChild(dom);
}

function mountNode(parentNode, oldVdom, newVdom, nextDOM) {
  const newDOM = createDOM(newVdom);
  if (nextDOM) {
    parentNode.insertBefore(newDOM, nextDOM);
  } else {
    parentNode.appendChild(newDOM);
  }
  if (newDOM._componentDidMount) {
    newDOM._componentDidMount();
  }
}

// export function useState(initialState) {
//   if (hookStates[hookIndex] === undefined) {
//     hookStates[hookIndex] = initialState;
//   }
//   const currentIndex = hookIndex;
//   function setState(newState) {
//     hookStates[currentIndex] = newState;
//     scheduleUpdate();
//   }

//   return [hookStates[hookIndex++], setState];
// }

export function useState(initialState) {
  return useReducer(null, initialState);
}

export function useReducer(reducer, initialState) {
  if (hookStates[hookIndex] === undefined) {
    hookStates[hookIndex] = initialState;
  }
  const currentIndex = hookIndex;

  function dispatch(action) {
    const newState = reducer
      ? reducer(hookStates[currentIndex], action)
      : action;
    hookStates[currentIndex] = newState;
    scheduleUpdate();
  }

  return [hookStates[hookIndex++], dispatch];
}

export function useMemo(factory, deps) {
  if (hookStates[hookIndex] === undefined) {
    hookStates[hookIndex] = [factory(), deps];
  } else {
    const oldDeps = hookStates[hookIndex][1];
    for (let i = 0; i < deps.length; i++) {
      if (oldDeps[i] !== deps[i]) {
        hookStates[hookIndex][0] = factory();
        hookStates[hookIndex][1] = deps;
        continue;
      }
    }
  }

  return hookStates[hookIndex++][0];
}

export function useRef(value) {
  if (hookStates[hookIndex] === undefined) {
    hookStates[hookIndex] = { current: value };
  }

  return hookStates[hookIndex++];
}

export function useCallback(callback, deps) {
  if (hookStates[hookIndex] === undefined) {
    hookStates[hookIndex] = [callback, deps];
  } else {
    const oldDeps = hookStates[hookIndex][1];
    for (let i = 0; i < deps.length; i++) {
      if (oldDeps[i] !== deps[i]) {
        hookStates[hookIndex][0] = callback;
        hookStates[hookIndex][1] = deps;
      }
    }
  }

  return hookStates[hookIndex++][0];
}

export function useContext(context) {
  return context.value;
}

export function useEffect(callback, deps) {
  const currentIndex = hookIndex
  if (hookStates[hookIndex] === undefined) {
    setTimeout(() => {
      hookStates[currentIndex] = [callback(), deps];
    });
    hookIndex++
  } else {
    const [lastDestroy, lastDeps] = hookStates[hookIndex];
    const isSame = lastDeps && lastDeps.every((dep, i) => dep === deps[i]);
    if (!isSame) {
      if (lastDestroy) {
        lastDestroy();
      }
      setTimeout(() => {
        hookStates[currentIndex] = [callback(), deps];
      });
      hookIndex++
    } else {
      hookIndex++;
    }
  }
}

const ReactDOM = {
  render,
};

export default ReactDOM;
