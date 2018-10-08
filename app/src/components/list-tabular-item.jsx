const SwipeContainer = require('./swipe-container');
const { React, PropTypes } = require('mailspring-exports');

const EMPTY_METRICS = {
  top:0,
  height:0,
}
const EMPTY_ITEM = {}

class ListTabularItem extends React.Component {
  static displayName = 'ListTabularItem';
  static propTypes = {
    metrics: PropTypes.object,
    columns: PropTypes.arrayOf(PropTypes.object).isRequired,
    item: PropTypes.object.isRequired,
    itemProps: PropTypes.object,
    onSelect: PropTypes.func,
    onClick: PropTypes.func,
    onDoubleClick: PropTypes.func,
  };
  static Props(o) {
    return {
      id: o.id,
      key: o.key,
      metrics: o.metrics || EMPTY_METRICS,
      columns: o.columns,
      item: o.item || EMPTY_ITEM,

      itemProps: o.itemProps || {
        className: '',
        // TODO: many other props, but assuming
      },
      onSelect: o.onSelect,
      onClick: o.onClick,
      onDoubleClick: o.onDoubleClick,
    }
  }
  static propsDiff(a,b) {
    return  (a.id !== b.id
              // && (this._columnCache = null || true)
            )
      ||    a.metrics.top !== b.metrics.top
      ||    a.metrics.height !== b.metrics.height
      ||    a.columns.length !== b.columns.length
      ||    (
              a.columns !== b.columns
              // && (this._columnCache = null || true)
            )
      ||    a.itemProps.className !== b.itemProps.className
            // itemProps carries all the swipe stuff
      // TODO: colums, metrics... item...
      ||    a.onSelect !== b.onSelect
      ||    a.onClick !== b.onClick
      ||    a.onDoubleClick !== b.onDoubleClick
  }
  // DO NOT DELETE unless you know what you're doing! This method cuts
  // React.Perf.wasted-time from ~300msec to 20msec by doing a deep
  // comparison of props before triggering a re-render.
  // shouldComponentUpdate(nextProps, nextState) {
  //   // return true
  //   // console.log(this.propsDiff(this.props, nextProps))
  //   return this.constructor.propsDiff(this.props, nextProps)
  //   // if (
  //   //   this.props.columns !== nextProps.columns ||
  //   //   !Utils.isEqualReact(this.props.item, nextProps.item)
  //   // ) {
  //   //   this._columnCache = null;
  //   //   return true;
  //   // }
  //   // if (
  //   //   !Utils.isEqualReact(Utils.fastOmit(this.props, ['item']), Utils.fastOmit(nextProps, ['item']))
  //   // ) {
  //   //   return true;
  //   // }
  //   // return false;
  // }

  render() {

    const props = this.props.itemProps;
    const className = `list-item list-tabular-item ${props.className}`;
    props.className = ''
    // const props = Utils.fastOmit(itemProps, ['className']);

    // It's expensive to compute the contents of columns (format timestamps, etc.)
    // We only do it if the item prop has changed.
    // if (this._columnCache == null) {
      this._columnCache = this._columns();
    // }

    return (
      <SwipeContainer
        {...props}
        onClick={this._onClick}
        style={{
          transform: `translateY(${this.props.metrics.top}px)`,
          position: 'absolute',
          top: 0,
          width: '100%',
          height: this.props.metrics.height,
        }}
      >
        <div className={className} style={{ height: this.props.metrics.height }}>
          {this._columnCache}
        </div>
      </SwipeContainer>
    );
  }

  _columns = () => {
    const names = {};
    return (this.props.columns || []).map(column => {
      if (names[column.name]) {
        console.warn(
          `ListTabular: Columns do not have distinct names, will cause React error! \`${
            column.name
          }\` twice.`
        );
      }
      names[column.name] = true;

      return (
        <div
          key={column.name}
          style={{ flex: column.flex, width: column.width }}
          className={`list-column list-column-${column.name}`}
        >
          {column.resolver(this.props.item, this)}
        </div>
      );
    });
  };

  _onClick = event => {
    if (typeof this.props.onSelect === 'function') {
      this.props.onSelect(this.props.item, event);
    }

    if (typeof this.props.onClick === 'function') {
      this.props.onClick(this.props.item, event);
    }
    if (this._lastClickTime != null && Date.now() - this._lastClickTime < 350) {
      if (typeof this.props.onDoubleClick === 'function') {
        this.props.onDoubleClick(this.props.item, event);
      }
    }

    this._lastClickTime = Date.now();
  };
}

module.exports = ListTabularItem;
