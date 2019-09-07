export const getElementPropSelector = (prop) => (x) => x.props[prop];

export const getWrapperPropSelector = (prop) => (x) => x.prop(prop);
