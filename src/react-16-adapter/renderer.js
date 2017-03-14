import Renderer from 'react-test-renderer';

class RSTNode {
  constructor(node){
    this.type = node.type;
    this.nodeType = node.nodeType;
    this.props = node.props;
    this.instance = node.instance;

    //Probably do a better check
    // Maybe check instance
    // Or type of
    // and / or rendered
    this.rendered = node.rendered.map( steve => steve.rendered ? new RSTNode(steve) : steve);
  }
}

class EnzymeRenderer {
  constructor() {
    this.element = undefined;
  }

  render(element) {
    this.element = element;
  }

  getNode() {
    const renderer = Renderer.create(this.element);
    const unformattedTree = renderer.toTree();
    return new RSTNode(unformattedTree);
  }
}

export default EnzymeRenderer;
