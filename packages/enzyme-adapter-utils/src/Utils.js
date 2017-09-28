import createMountWrapper from './createMountWrapper';
import createRenderWrapper from './createRenderWrapper';
import elementToTree from './elementToTree';
import nodeTypeFromType from './nodeTypeFromType';

export {
  createMountWrapper,
  createRenderWrapper,
  elementToTree,
  nodeTypeFromType,
};

export function mapNativeEventNames(event) {
  const nativeToReactEventMap = {
    compositionend: 'compositionEnd',
    compositionstart: 'compositionStart',
    compositionupdate: 'compositionUpdate',
    keydown: 'keyDown',
    keyup: 'keyUp',
    keypress: 'keyPress',
    contextmenu: 'contextMenu',
    dblclick: 'doubleClick',
    doubleclick: 'doubleClick', // kept for legacy. TODO: remove with next major.
    dragend: 'dragEnd',
    dragenter: 'dragEnter',
    dragexist: 'dragExit',
    dragleave: 'dragLeave',
    dragover: 'dragOver',
    dragstart: 'dragStart',
    mousedown: 'mouseDown',
    mousemove: 'mouseMove',
    mouseout: 'mouseOut',
    mouseover: 'mouseOver',
    mouseup: 'mouseUp',
    touchcancel: 'touchCancel',
    touchend: 'touchEnd',
    touchmove: 'touchMove',
    touchstart: 'touchStart',
    canplay: 'canPlay',
    canplaythrough: 'canPlayThrough',
    durationchange: 'durationChange',
    loadeddata: 'loadedData',
    loadedmetadata: 'loadedMetadata',
    loadstart: 'loadStart',
    ratechange: 'rateChange',
    timeupdate: 'timeUpdate',
    volumechange: 'volumeChange',
    beforeinput: 'beforeInput',
    mouseenter: 'mouseEnter',
    mouseleave: 'mouseLeave',
  };

  return nativeToReactEventMap[event] || event;
}

// 'click' => 'onClick'
// 'mouseEnter' => 'onMouseEnter'
export function propFromEvent(event) {
  const nativeEvent = mapNativeEventNames(event);
  return `on${nativeEvent[0].toUpperCase()}${nativeEvent.slice(1)}`;
}

export function withSetStateAllowed(fn) {
  // NOTE(lmr):
  // this is currently here to circumvent a React bug where `setState()` is
  // not allowed without global being defined.
  let cleanup = false;
  if (typeof global.document === 'undefined') {
    cleanup = true;
    global.document = {};
  }
  const result = fn();
  if (cleanup) {
    // This works around a bug in node/jest in that developers aren't able to
    // delete things from global when running in a node vm.
    global.document = undefined;
    delete global.document;
  }
  return result;
}

export function assertDomAvailable(feature) {
  if (!global || !global.document || !global.document.createElement) {
    throw new Error(
      `Enzyme's ${feature} expects a DOM environment to be loaded, but found none`,
    );
  }
}

export function propsWithKeysAndRef(node) {
  if (node.ref !== null || node.key !== null) {
    return {
      ...node.props,
      key: node.key,
      ref: node.ref,
    };
  }
  return node.props;
}
