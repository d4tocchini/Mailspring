const React = require('react');
function _() {
  const __ = require('underscore');
  return (_ = function() {
    return __;
  })();
}
function VirtualDOMUtils_() {
  const { VirtualDOMUtils } = require('mailspring-exports');
  return (VirtualDOMUtils_ = function() {
    return VirtualDOMUtils;
  })();
}
function SearchMatch_() {
  const SearchMatch = require('./search-match');
  return (SearchMatch_ = function() {
    return SearchMatch;
  })();
}
const UnifiedDOMParser = require('./unified-dom-parser');

module.exports = class VirtualDOMParser extends UnifiedDOMParser {
  getWalker(dom) {
    const pruneFn = node => {
      return node.type === 'style';
    };
    return VirtualDOMUtils_().walk({ element: dom, pruneFn });
  }

  isTextNode({ element }) {
    return typeof element === 'string';
  }

  textNodeLength({ element }) {
    return element.length;
  }

  textNodeContents(textNode) {
    return textNode.element;
  }

  looksLikeBlockElement({ element }) {
    if (!element) {
      return false;
    }
    const blockTypes = ['br', 'p', 'blockquote', 'div', 'table', 'iframe'];
    if (typeof element.type === 'function') {
      return true;
    } else if (blockTypes.indexOf(element.type) >= 0) {
      return true;
    }
    return false;
  }

  getRawFullString(fullString) {
    return _()
      .pluck(fullString, 'element')
      .join('');
  }

  removeMatchesAndNormalize(element) {
    let newChildren = [];
    let strAccumulator = [];

    const resetAccumulator = () => {
      if (strAccumulator.length > 0) {
        newChildren.push(strAccumulator.join(''));
        strAccumulator = [];
      }
    };

    const is_array = element instanceof Array;
    if (React.isValidElement(element) || is_array) {
      let children;

      if (is_array) {
        children = element;
      } else {
        children = element.props.children;
      }

      if (!children) {
        newChildren = null;
      } else if (React.isValidElement(children)) {
        newChildren = children;
      } else if (typeof children === 'string') {
        strAccumulator.push(children);
      } else if (children.length > 0) {
        for (let i = 0; i < children.length; i++) {
          const child = children[i];
          if (typeof child === 'string') {
            strAccumulator.push(child);
          } else if (this._isSearchElement(child)) {
            resetAccumulator();
            newChildren.push(child.props.children);
          } else {
            resetAccumulator();
            newChildren.push(this.removeMatchesAndNormalize(child));
          }
        }
      } else {
        newChildren = children;
      }

      resetAccumulator();

      if (is_array) {
        return newChildren;
      }
      return React.cloneElement(element, {}, newChildren);
    }
    return element;
  }
  _isSearchElement(element) {
    return element.type === SearchMatch_();
  }

  createTextNode({ rawText }) {
    return rawText;
  }
  createMatchNode({ matchText, regionId, isCurrentMatch, renderIndex }) {
    const className = isCurrentMatch ? 'current-match' : '';
    return React.createElement(SearchMatch_(), { className, regionId, renderIndex }, matchText);
  }
  textNodeKey(textElement) {
    return textElement.parentNode;
  }

  highlightSearch(element, matchNodeMap) {
    const is_array = element instanceof Array;
    if (React.isValidElement(element) || is_array) {
      let newChildren = [];
      let children;

      if (is_array) {
        children = element;
      } else {
        children = element.props.children;
      }

      const matchNode = matchNodeMap.get(element);
      let originalTextNode = null;
      let newTextNodes = [];
      if (matchNode) {
        originalTextNode = matchNode.originalTextNode;
        newTextNodes = matchNode.newTextNodes;
      }

      if (!children) {
        newChildren = null;
      } else if (React.isValidElement(children)) {
        if (originalTextNode && originalTextNode.childOffset === 0) {
          newChildren = newTextNodes;
        } else {
          newChildren = this.highlightSearch(children, matchNodeMap);
        }
      } else if (children instanceof Array && children.length > 0) {
        for (let i = 0; i < children.length; i++) {
          const child = children[i];
          if (originalTextNode && originalTextNode.childOffset === i) {
            newChildren.push(newTextNodes);
          } else {
            newChildren.push(this.highlightSearch(child, matchNodeMap));
          }
        }
      } else {
        if (originalTextNode && originalTextNode.childOffset === 0) {
          newChildren = newTextNodes;
        } else {
          newChildren = children;
        }
      }

      if (is_array) {
        return newChildren;
      }
      return React.cloneElement(element, {}, newChildren);
    }
    return element;
  }
};
