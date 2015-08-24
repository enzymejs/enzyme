import jsdom from 'jsdom';

// A super simple DOM ready for React to render into
// Store this DOM and the window in global scope ready for React to access
global.document = jsdom.jsdom('<!DOCTYPE html><html><body></body></html>');
global.window = document.parentWindow;
//global.window = document.defaultView;

// take all properties of the window object and also attach it to the
// mocha global object
propagateToGlobal(global.window);