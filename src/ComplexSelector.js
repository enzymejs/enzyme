import split from 'lodash/split';

export default class ComplexSelector {
  constructor(buildPredicate, findWhereUnwrapped, childrenOfNode) {
    this.buildPredicate = buildPredicate;
    this.findWhereUnwrapped = findWhereUnwrapped;
    this.childrenOfNode = childrenOfNode;
  }

  getSelectors(selector) { // eslint-disable-line class-methods-use-this
    const selectors = split(selector, / (?=(?:(?:[^"]*"){2})*[^"]*$)/);
    return selectors.reduce((list, sel) => {
      if (sel === '+' || sel === '~') {
        const temp = list.pop();
        return list.concat(sel, temp);
      }

      return list.concat(sel);
    }, []);
  }

  handleSelectors(selectors, wrapper) {
    const recurseSelector = (offset, fn, pre) => {
      const predicate = pre || this.buildPredicate(selectors[offset]);
      const nextWrapper = this.findWhereUnwrapped(wrapper, predicate, fn);
      const nextSelectors = selectors.slice(offset + 1);
      return this.handleSelectors(nextSelectors, nextWrapper);
    };

    const buildSiblingPredicate = (first, second) => {
      const firstPredicate = this.buildPredicate(first);
      const secondPredicate = this.buildPredicate(second);

      return (child) => {
        if (firstPredicate(child)) {
          return sibling => secondPredicate(sibling);
        }

        return false;
      };
    };

    let predicate;
    let selectSiblings;

    if (selectors.length) {
      switch (selectors[0]) {
        case '>':
          return recurseSelector(1, this.treeFilterDirect());
        case '+':
          predicate = buildSiblingPredicate(selectors[1], selectors[2]);
          selectSiblings = (children, pre, results, idx) => {
            const adjacent = children[idx + 1];
            if (pre(adjacent)) { results.push(adjacent); }
          };

          return recurseSelector(2, this.treeFindSiblings(selectSiblings), predicate);
        case '~':
          predicate = buildSiblingPredicate(selectors[1], selectors[2]);
          selectSiblings = (children, pre, results, idx) =>
            children.slice(idx + 1).map(child =>
              (pre(child) ? results.push(child) : null),
            );

          return recurseSelector(2, this.treeFindSiblings(selectSiblings), predicate);
        default:
          return recurseSelector(0);
      }
    }

    return wrapper;
  }

  find(selector, wrapper) {
    if (typeof selector === 'string') {
      const selectors = this.getSelectors(selector);

      return this.handleSelectors(selectors, wrapper);
    }

    const predicate = this.buildPredicate(selector);
    return this.findWhereUnwrapped(wrapper, predicate);
  }

  treeFilterDirect() {
    return (tree, fn) => this.childrenOfNode(tree).filter(child => fn(child));
  }

  treeFindSiblings(selectSiblings) {
    return (tree, fn) => {
      const results = [];
      const list = [this.childrenOfNode(tree)];

      const traverseChildren = children => children.forEach((child, i) => {
        const secondPredicate = fn(child);

        list.push(this.childrenOfNode(child));

        if (secondPredicate) {
          selectSiblings(children, secondPredicate, results, i);
        }
      });

      while (list.length) {
        traverseChildren(list.shift());
      }

      return results;
    };
  }

}
