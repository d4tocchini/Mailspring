const ReactDOM = require('react-dom');
function _() {
  const __ = require('underscore');
  return (_ = function() {
    return __;
  })();
}
function Utils_() {
  const __ = require('../flux/models/utils');
  return (Utils_ = function() {
    return __;
  })();
}
function VirtualDOMParser_() {
  const __ = require('./virtual-dom-parser');
  return (VirtualDOMParser_ = function() {
    return __;
  })();
}
function SearchableComponentStore_() {
  const __ = require('../flux/stores/searchable-component-store');
  return (SearchableComponentStore_ = function() {
    return __;
  })();
}

class SearchableComponent {
  // TODO: remove ... args
  componentDidMount(superMethod, ...args) {
    if (superMethod) superMethod.apply(this, args);
    this.__regionId = Utils_().generateTempId();
    const SearchableComponentStore = SearchableComponentStore_();
    this._searchableListener = SearchableComponentStore.listen(() => {
      this._onSearchableComponentStoreChange();
    });
    SearchableComponentStore.registerSearchRegion(this.__regionId, ReactDOM.findDOMNode(this));
  }

  _onSearchableComponentStoreChange() {
    const SearchableComponentStore = SearchableComponentStore_();
    const searchIndex = SearchableComponentStore.getCurrentRegionIndex(this.__regionId);
    const { searchTerm } = SearchableComponentStore.getCurrentSearchData();
    this.setState({
      __searchTerm: searchTerm,
      __searchIndex: searchIndex,
    });
  }

  shouldComponentUpdate(superMethod, nextProps, nextState) {
    let shouldUpdate = true;
    if (superMethod) {
      shouldUpdate = superMethod.apply(this, [nextProps, nextState]);
    }
    if (
      shouldUpdate &&
      (this.__searchTerm || (this.__searchIndex !== null && this.__searchIndex !== undefined))
    ) {
      shouldUpdate =
        this.__searchTerm !== nextState.__searchTerm ||
        this.__searchIndex !== nextState.__searchIndex;
    }
    return shouldUpdate;
  }

  componentWillUnmount(superMethod, ...args) {
    if (superMethod) superMethod.apply(this, args);
    this._searchableListener();
    SearchableComponentStore_().unregisterSearchRegion(this.__regionId);
  }

  componentDidUpdate(superMethod, ...args) {
    if (superMethod) superMethod.apply(this, args);
    SearchableComponentStore_().registerSearchRegion(this.__regionId, ReactDOM.findDOMNode(this));
  }
  render(superMethod) {
    if (superMethod) {
      const vDOM = superMethod.call(this);
      const VirtualDOMParser = VirtualDOMParser_();
      const parser = new VirtualDOMParser(this.__regionId);
      const searchTerm = this.state.__searchTerm;
      if (parser.matchesSearch(vDOM, searchTerm)) {
        const normalizedDOM = parser.removeMatchesAndNormalize(vDOM);
        const matchNodeMap = parser.getElementsWithNewMatchNodes(
          normalizedDOM,
          searchTerm,
          this.state.__searchIndex
        );
        return parser.highlightSearch(normalizedDOM, matchNodeMap);
      }
      return vDOM;
    }
    return null;
  }
}

/**
 * Takes a React component and makes it searchable
 */
class SearchableComponentMaker {
  static extend(component) {
    const proto = SearchableComponent.prototype;
    for (const propName of Object.getOwnPropertyNames(proto)) {
      const origMethod = component.prototype[propName];
      if (origMethod) {
        if (propName === 'constructor') {
          continue;
        }
        component.prototype[propName] = _().partial(proto[propName], origMethod);
      } else {
        component.prototype[propName] = proto[propName];
      }
    }
    return component;
  }

  static searchInIframe(contentDocument) {
    return contentDocument;
  }
}

module.exports = SearchableComponentMaker;
