export function propsOfNode(node) {
  return node ? node.props : {};
  // return entries((node && node.props) || {})
  //   .filter(([, value]) => typeof value !== 'undefined')
  //   .reduce((acc, [key, value]) => Object.assign(acc, { [key]: value }), {});
}

export function nodeHasType(node, type) {
  if (!type || !node) return false;
  if (!node.type) return false;
  if (typeof node.type === 'string') return node.type === type;
  return node.type.displayName === type || node.type.name === type;
  // return (typeof node.type === 'function' ?
  //   functionName(node.type) === type : node.type.name === type) || node.type.displayName === type;
}
