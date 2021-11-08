import { updateQueue } from "./Component";

function addEvent(dom, type, handler) {
  const store = dom.store || (dom.store = {});
  store[type] = handler;

  document[type] = dispatchEvent;
}

function dispatchEvent(e) {
  let target = e.target;
  const type = e.type;
  updateQueue.isBatchingUpdate = true
  while (target) {
    const store = target.store;
    if (store) {
      const handler = store["on" + type];
      if (handler) {
        handler.call(target, e);
      }
    }
    target = target.parentNode;
  }
  updateQueue.batchUpdate()
  updateQueue.isBatchingUpdate = false
}

export default addEvent;
