const React = require('react');
const PropTypes = require('prop-types');

const SearchMatch = props => {
  return (
    <span
      data-region-id={props.regionId}
      data-render-index={props.renderIndex}
      className={`search-match ${props.className}`}
    >
      {props.children}
    </span>
  );
};

// SearchMatch.isSearchMatch = true;

SearchMatch.propTypes = {
  regionId: PropTypes.string,
  className: PropTypes.string,
  renderIndex: PropTypes.number,
};

module.exports = SearchMatch;
