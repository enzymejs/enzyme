export default function nodeTypeFromType(type) {
  if (typeof type === 'string') {
    return 'host';
  }
  if (
    type &&
    type.prototype &&
    type.prototype.isReactComponent
  ) {
    return 'class';
  }
  return 'function';
}
