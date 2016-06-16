import { getAst } from './Utils';

export default class ComplexSelector {
  constructor(buildPredicate, findWhereUnwrapped, childrenOfNode) {
    this.buildPredicate = buildPredicate;
    this.findWhereUnwrapped = findWhereUnwrapped;
    this.childrenOfNode = childrenOfNode;
  }

  getSelectors(selectorNodes) {
    return selectorNodes.reduce((list, node) => {
      if (node.type === 'combinator' && (node.value === '+' || node.value === '~')) {
        const temp = list.pop();
        list.push(node, temp);
        return list;
      } else if (node.type !== 'combinator' || node.value !== ' ') {
        list.push(node);
      }

      return list;
    }, []);
  }

  handleSelectors(selectors, wrapper) {
    const recurseSelector = (offset, fn, pre) => {
      const predicate = pre || this.buildPredicate(selectors[offset].toString());
      const nextWrapper = this.findWhereUnwrapped(wrapper, predicate, fn);
      const nextSelectors = selectors.slice(offset + 1);
      return this.handleSelectors(nextSelectors, nextWrapper);
    };

    const buildSiblingPredicate = (first, second) => {
      const firstPredicate = this.buildPredicate(first.toString());
      const secondPredicate = this.buildPredicate(second.toString());

      return (child) => {
        if (firstPredicate(child)) {
          return (sibling) => secondPredicate(sibling);
        }

        return false;
      };
    };

    let predicate;
    let selectSiblings;

    if (selectors.length) {
      switch (selectors[0].value) {
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
              (pre(child) ? results.push(child) : null)
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
      // Note: ignores compound selectors (e.g. 'a, b')
      const selectorNodes = getAst(selector).nodes[0];
      const selectors = this.getSelectors(selectorNodes);

      return this.handleSelectors(selectors, wrapper);
    }

    const predicate = this.buildPredicate(selector);
    return this.findWhereUnwrapped(wrapper, predicate);
  }

  treeFilterDirect() {
    return (tree, fn) => {
      const results = [];
      this.childrenOfNode(tree).forEach(child => {
        if (fn(child)) {
          results.push(child);
        }
      });

      return results;
    };
  }

  treeFindSiblings(selectSiblings) {
    return (tree, fn) => {
      const results = [];
      const list = [this.childrenOfNode(tree)];

      const traverseChildren = (children) =>
        children.forEach((child, i) => {
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
