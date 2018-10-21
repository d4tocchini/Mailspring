import _ from 'underscore';
import React, { Component } from 'react';
import { Utils } from 'mailspring-exports';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import ScrollRegion from './scroll-region';
import Spinner from './spinner';

import ListDataSource from './list-data-source';
import ListSelection from './list-selection';
import ListTabularItem from './list-tabular-item';
// import { Map } from 'core-js';

class ListColumn {
  constructor({ name, resolver, flex, width }) {
    this.name = name;
    this.resolver = resolver;
    this.flex = flex;
    this.width = width;
  }
}

// D4
const EMPTY_ITEMS = []
class VPoolComponent extends Component {

  renderItem(item, idx, id, key, itemProps) {

  }

  constructor(a,b,c) {
    super(a,b,c)
    this.items = []
    this.renderedRows = []
    this._key_count = 0
    this._id2key = new Map()
    this._id2render = new Map()
    this._id2props = new Map()
    this._prev_ids = []
    this._next_ids = []
    this._free_keys_count = 0
    this._free_keys = []
    this._added_count = 0
    this._added_ids = []
    // this._removed_ids = []
    this.key_allocs = new Map()

    this.renderItems = function(items) {
      this.items = items
      this._loop_items(items, '_load_added_id')
      this._prerender_items(items)
      const res = this._render_items(items)
      this._postrender_items()
      this.items = EMPTY_ITEMS
      return res
    }
    this._loop_items = function(items, fn_name) {
      var idx = 0
      const l = items.length
      while (idx < l) {
        this[fn_name](items[idx], idx++)
      }
    }
  }
  _loop_ids(ids, fn_name) {
    var idx = 0
    const l = ids.length
    while (idx < l) {
      this[fn_name](ids[idx], idx++)
    }
  }

  _prerender_items() {
    this._added_count = 0
    this._loop_ids(this._prev_ids, '_free_removed')
    this._loop_ids(this._added_ids, '_assign_new_id_keys')
  }

  _postrender_items() {
    this._added_ids.length = 0
    const _next_ids = this._prev_ids
    this._prev_ids = this._next_ids
    this._next_ids = _next_ids
    this._next_ids.length = 0
  }

  _render_items(items) {
    let vacancies = 0
    let i = 0
    const l = items.length
    const res = this.renderedRows
    while (i < l) {
      const data = items[i]
      const item = (data !== undefined) && data.item
      if (item) {
        const id = item.id
        const key = this._id2key.get(id)
        const idx = data.idx
        const itemProps = data.itemProps
        res[i - vacancies] = this.renderItem(item, idx, id, key, itemProps)

        // res[i - vacancies] = this._id2render.get(id)
      }
      else {
        vacancies = vacancies + 1
      }
      i = i + 1
    }
    const _actual_length = l - vacancies
    if (res.length !== _actual_length) {
      res.length = _actual_length
    }
    return res
  }

  _take_key() {
    return this._free_keys_count > 0
      ? this._recycle_key()
      : this._alloc_key()
  }

  _alloc_key() {
    return this._key_count++
  }

  // recycle most recently freed keys first
  _recycle_key() {
    const key = this._free_keys[--this._free_keys_count]
    this._free_keys.length = this._free_keys_count
    return key
  }

  _free_key(key) {
    this._free_keys[this._free_keys_count++] = key
  }

  _load_added_id(_item, i) {
    const id = _item.item.id
    this._next_ids[i] = id
    if (this._id2key.has(id) === false) {
      this._added_ids[this._added_count++] = id
    }
  }

  _free_removed(id, i) {
    if (this._next_ids.indexOf(id) === -1) {
      this._free_key(this._id2key.get(id))
      this._id2key.delete(id)
      this._id2render.delete(id)
      this._id2props.delete(id)
    }
  }
  _assign_new_id_keys(id, i) {
    const key = this._take_key(id)
    this._id2key.set(id, key)
  }

}

class ListTabularRows extends VPoolComponent {
  static displayName = 'ListTabularRows';

  static propTypes = {
    rows: PropTypes.array,
    columns: PropTypes.array.isRequired,
    draggable: PropTypes.bool,
    itemHeight: PropTypes.number,
    innerStyles: PropTypes.object,
    onSelect: PropTypes.func,
    onClick: PropTypes.func,
    onDoubleClick: PropTypes.func,
    onDragStart: PropTypes.func,
    onDragEnd: PropTypes.func,
    _vrange_start: PropTypes.number,
    _vrange_end: PropTypes.number,
    _pre_buffer: PropTypes.number,
    _post_buffer: PropTypes.number,
  };

  constructor(a,b,c) {
    super(a,b,c)
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   return !Utils.isEqualReact(nextProps, this.props) || !Utils.isEqualReact(nextState, this.state);
  // }

  _assign_row_key(id, idx, n) {
    const map = this.rowkeymap
    return map.has(id)
      ? map.get(id)
      : map.set(id, )
  }

  // D4
  renderItem(item, idx, id, key, itemProps) {
    // let key = this._get_row_key(id, idx, n)
    const props = this.props
    const itemHeight = props.itemHeight
    const child_props = ListTabularItem.Props({
      id,
      key,
      item: item,
      itemProps: itemProps,
      metrics: {
        top: idx * itemHeight,
        height: itemHeight
      },
      columns: props.columns,
      onSelect: props.onSelect,
      onClick: props.onClick,
      onDoubleClick: props.onDoubleClick,
    })
    let rendered
    const prev_child_props = this._id2props.get(id)
    this._id2props.set(id, child_props)

    if (
        prev_child_props === undefined
        || (
          (this.props._vrange_start + this.props._pre_buffer - 1 < (idx)
          && this.props._vrange_end - this.props._post_buffer + 1 > (idx)
          )
          // && (
          //   this.props._RANGE_DID_CHANGE === false
          //   || ListTabularItem.propsDiff(child_props, prev_child_props)
          // )
        )
      ) {
        this._id2render.set(id,
          rendered = React.createElement(ListTabularItem, child_props)
        )
        // console.log(idx,true)
    }
    else {
      rendered = this._id2render.get(id) || null
      // console.log(idx,false)
    }
    return rendered

  }

  render() {

    const { rows, innerStyles, draggable, onDragStart, onDragEnd } = this.props;
    return (
      <div
        className="list-rows"
        style={innerStyles}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        draggable={draggable}
      >
        {this.renderItems(rows)}
      </div>
    );
  }


}



class ListTabular extends Component {
  static displayName = 'ListTabular';

  static propTypes = {
    footer: PropTypes.node,
    draggable: PropTypes.bool,
    className: PropTypes.string,
    columns: PropTypes.array.isRequired,
    dataSource: PropTypes.object,
    itemPropsProvider: PropTypes.func,
    itemHeight: PropTypes.number,
    EmptyComponent: PropTypes.func,
    scrollTooltipComponent: PropTypes.func,
    onClick: PropTypes.func,
    onSelect: PropTypes.func,
    onDoubleClick: PropTypes.func,
    onDragStart: PropTypes.func,
    onDragEnd: PropTypes.func,
    onComponentDidUpdate: PropTypes.func,
  };

  static defaultProps = {
    footer: false,
    EmptyComponent: () => false,
    itemPropsProvider: () => ({}),
  };

  static Item = ListTabularItem;
  static Column = ListColumn;
  static Selection = ListSelection;
  static DataSource = ListDataSource;

  constructor(props) {
    super(props);
    if (!props.itemHeight) {
      throw new Error(
        'ListTabular: You must provide an itemHeight - raising to avoid divide by zero errors.'
      );
    }

    this._unlisten = () => {};
    this.state = this.buildStateForRange({ start: -1, end: -1 });

    // D4
    this._RANGE_DID_CHANGE = false
    this._pre_buffer = 12
    this._post_buffer = 12
    this._is_updating_range = false

    this._vrange_start =
      this._prev_range_start = -this._pre_buffer
    this._vrange_end =
      this._prev_range_end = 9999999
    this._coerce_range_update = () => {
      this._vrange_start =
        this._prev_range_start = -this._pre_buffer
      this._vrange_end =
        this._prev_range_end = 9999999
    }
    this._updateRangeState = () => {
      if (this._is_updating_range === false) {
        this._is_updating_range = true
        requestAnimationFrame(this._updateRangeState_)
      }
    }
    this._updateRangeState_ = () => {
      const { scrollTop } = this._scrollRegion;
      const { itemHeight } = this.props;

      // Determine the exact range of rows we want onscreen
      const rangeSize = Math.ceil(window.innerHeight / itemHeight);

      let rangeStart = (scrollTop / itemHeight)|0;
      let rangeEnd = rangeStart + rangeSize;

      // Expand the start/end so that you can advance the keyboard cursor fast and
      // we have items to move to and then scroll to.
      this._vrange_start = rangeStart - this._pre_buffer
      rangeStart = Math.max(0, this._vrange_start);
      this._vrange_end = rangeEnd + this._post_buffer
      rangeEnd = Math.min(this._vrange_end, this.state.count + 1);

      const rangeStart_delta = Math.abs(rangeStart - this._prev_range_start) //this.state.renderedRangeStart)
      const rangeEnd_delta = Math.abs(rangeEnd - this._prev_range_end) //this.state.renderedRangeEnd)

      // Final sanity check to prevent needless work
      const shouldUpdate =
          (rangeStart_delta > 0) || //(this._pre_buffer >> 1)) ||
          (rangeEnd_delta > 0 )

        // ) ||
        // (
        //   (rangeEnd === this.state.renderedRangeEnd) &&
        //   (rangeStart === this.state.renderedRangeStart)
        // );

      if (shouldUpdate === true ) {
        this._RANGE_DID_CHANGE = true

        this.updateRangeStateFiring = true;

        this._prev_range_start = rangeStart
        this._prev_range_end = rangeEnd

        this.props.dataSource.setRetainedRange({
          start: rangeStart,
          end: rangeEnd,
        });

        const nextState = this.buildStateForRange({ start: rangeStart, end: rangeEnd });
        this.setState(nextState);
      }


      this._is_updating_range = false
    }

  }

  componentDidMount() {
    window.addEventListener('resize', this.onWindowResize, true);
    this.setupDataSource(this.props.dataSource);
    this._coerce_range_update()
    this.updateRangeState();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.dataSource !== this.props.dataSource) {
      this.setupDataSource(nextProps.dataSource);
    }
  }

  componentDidUpdate(prevProps) {
    this._RANGE_DID_CHANGE = false
    if (this.props.onComponentDidUpdate) {
      this.props.onComponentDidUpdate();
    }
    // If our view has been swapped out for an entirely different one,
    // reset our scroll position to the top.
    if (prevProps.dataSource !== this.props.dataSource) {
      this._scrollRegion.scrollTop = 0;
      this._coerce_range_update()
    }

    if (!this.updateRangeStateFiring) {
      this.updateRangeState();
    }
    this.updateRangeStateFiring = false;

    if (!this._cleanupAnimationTimeout) {
      this._cleanupAnimationTimeout = window.setTimeout(this.onCleanupAnimatingItems, 50);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize, true);
    if (this._cleanupAnimationTimeout) {
      window.clearTimeout(this._cleanupAnimationTimeout);
    }
    this._unlisten();
  }

  onWindowResize = () => {
    if (this._onWindowResize == null) {
      this._onWindowResize = _.debounce(this.updateRangeState, 50);
    }
    this._onWindowResize();
  };

  onScroll = () => {
    // If we've shifted enough pixels from our previous scrollTop to require
    // new rows to be rendered, update our state!
    this.updateRangeState();
  };

  onCleanupAnimatingItems = () => {
    this._cleanupAnimationTimeout = null;

    const nextAnimatingOut = {};
    Object.entries(this.state.animatingOut).forEach(([idx, record]) => {
      if (Date.now() < record.end) {
        nextAnimatingOut[idx] = record;
      }
    });

    if (Object.keys(nextAnimatingOut).length < Object.keys(this.state.animatingOut).length) {
      this.setState({ animatingOut: nextAnimatingOut });
    }

    if (Object.keys(nextAnimatingOut).length > 0) {
      this._cleanupAnimationTimeout = window.setTimeout(this.onCleanupAnimatingItems, 50);
    }
  };

  setupDataSource(dataSource) {
    this._unlisten();
    this._unlisten = dataSource.listen(() => {
      this.setState(this.buildStateForRange());
    });
    this.setState(this.buildStateForRange({ start: -1, end: -1, dataSource }));
  }

  getRowsToRender() {
    const { itemPropsProvider } = this.props;
    const { items, animatingOut, renderedRangeStart, renderedRangeEnd } = this.state;
    // The ordering of the rows array is important. We want current rows to
    // slide over rows which are animating out, so we need to render them last.
    const rows = [];
    Object.entries(animatingOut).forEach(([idx, record]) => {
      const itemProps = itemPropsProvider(record.item, idx / 1);
      rows.push({ item: record.item, idx: idx / 1, itemProps });
    });

    Utils.range(renderedRangeStart, renderedRangeEnd).forEach(idx => {
      const item = items[idx];
      if (item) {
        const itemProps = itemPropsProvider(item, idx);
        rows.push({ item, idx, itemProps });
      }
    });

    return rows;
  }

  scrollTo(node) {
    if (!this._scrollRegion) {
      return;
    }
    this._scrollRegion.scrollTo(node);
  }

  scrollByPage(direction) {
    if (!this._scrollRegion) {
      return;
    }
    const height = ReactDOM.findDOMNode(this._scrollRegion).clientHeight;
    this._scrollRegion.scrollTop += height * direction;
  }

  updateRangeState() {
    if (!this._scrollRegion) {
      return;
    }
    this._updateRangeState()
  }

  buildStateForRange(args = {}) {
    const {
      start = this.state.renderedRangeStart,
      end = this.state.renderedRangeEnd,
      dataSource = this.props.dataSource,
    } = args;

    const items = {};
    let animatingOut = {};

    Utils.range(start, end).forEach(idx => {
      items[idx] = dataSource.get(idx);
    });

    // If we have a previous state, and the previous range matches the new range,
    // (eg: we're not scrolling), identify removed items. We'll render them in one
    // last time but not allocate height to them. This allows us to animate them
    // being covered by other items, not just disappearing when others start to slide up.
    if (this.state && start === this.state.renderedRangeStart) {
      const nextIds = Object.values(items).map(a => a && a.id);
      animatingOut = {};

      // Keep items which are still animating out and are still not in the set
      Object.entries(this.state.animatingOut).forEach(([recordIdx, record]) => {
        if (Date.now() < record.end && !nextIds.includes(record.item.id)) {
          animatingOut[recordIdx] = record;
        }
      });

      // Add items which are no longer found in the set
      Object.entries(this.state.items).forEach(([previousIdx, previousItem]) => {
        if (!previousItem || nextIds.includes(previousItem.id)) {
          return;
        }
        animatingOut[previousIdx] = {
          idx: previousIdx,
          item: previousItem,
          end: Date.now() + 125,
        };
      });

      // If we think /all/ the items are animating out, or a lot of them,
      // the user probably switched to an entirely different perspective.
      // Don't bother trying to animate.
      const animatingCount = Object.keys(animatingOut).length;
      if (animatingCount > 8 || animatingCount === Object.keys(this.state.items).length) {
        animatingOut = {};
      }
    }

    return {
      items,
      animatingOut,
      renderedRangeStart: start,
      renderedRangeEnd: end,
      count: dataSource.count(),
      loaded: dataSource.loaded(),
      empty: dataSource.empty(),
    };
  }

  render() {
    const {
      footer,
      columns,
      className,
      draggable,
      itemHeight,
      EmptyComponent,
      scrollTooltipComponent,
      onClick,
      onSelect,
      onDragEnd,
      onDragStart,
      onDoubleClick,
    } = this.props;
    const { count, loaded, empty } = this.state;
    const rows = this.getRowsToRender();
    const innerStyles = { height: count * itemHeight };

    return (
      <div className={`list-container list-tabular ${className}`}>
        <ScrollRegion
          ref={cm => {
            this._scrollRegion = cm;
          }}
          onScroll={this.onScroll}
          tabIndex="-1"
          scrollTooltipComponent={scrollTooltipComponent}
        >
          <ListTabularRows
            _RANGE_DID_CHANGE={this._RANGE_DID_CHANGE}
            _vrange_start={this._vrange_start}
            _vrange_end={this._vrange_end}
            _pre_buffer={this._pre_buffer}
            _post_buffer={this._post_buffer}
            rows={rows}
            columns={columns}
            draggable={draggable}
            itemHeight={itemHeight}
            innerStyles={innerStyles}
            onClick={onClick}
            onSelect={onSelect}
            onDragEnd={onDragEnd}
            onDragStart={onDragStart}
            onDoubleClick={onDoubleClick}
          />
          <div className="footer">{footer}</div>
        </ScrollRegion>
        <Spinner visible={!loaded && empty} />
        <EmptyComponent visible={loaded && empty} />
      </div>
    );
  }
}

module.exports = ListTabular;
