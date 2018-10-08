const url = require('url')
const React = require('react')
const PropTypes = require('prop-types')
const { shell } = require('electron')
const ReactDOM = require('react-dom')
const classnames = require('classnames')
const networkErrors = require('chromium-net-errors')
const RetinaImg = require('./retina-img')
const MailspringAPIRequest = require('../flux/mailspring-api-request')
const { rootURLForServer } = MailspringAPIRequest

class InitialLoadingCover extends React.Component {
  static propTypes = {
    ready: PropTypes.bool,
    error: PropTypes.string,
    onTryAgain: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this._slowTimeout = setTimeout(() => {
      this.setState({ slow: true });
    }, 3500);
  }

  componentWillUnmount() {
    clearTimeout(this._slowTimeout);
    this._slowTimeout = null;
  }

  render() {
    const classes = classnames({
      'webview-cover': true,
      ready: this.props.ready,
      error: this.props.error,
      slow: this.state.slow,
    });

    let message = this.props.error;
    if (this.props.error) {
      message = this.props.error;
    } else if (this.state.slow) {
      message = `Still trying to reach ${rootURLForServer('identity')}…`;
    } else {
      message = '&nbsp;';
    }

    return (
      <div className={classes}>
        <div style={{ flex: 1 }} />
        <RetinaImg
          className="spinner"
          style={{ width: 20, height: 20 }}
          name="inline-loading-spinner.gif"
          mode={RetinaImg.Mode.ContentPreserve}
        />
        <div className="message">{message}</div>
        <div className="btn try-again" onClick={this.props.onTryAgain}>
          Try Again
        </div>
        <div style={{ flex: 1 }} />
      </div>
    );
  }
}

module.exports = class Webview extends React.Component {
  static displayName = 'Webview';

  static propTypes = {
    src: PropTypes.string,
    onDidFinishLoad: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      ready: false,
      error: null,
    };
  }

  componentDidMount() {
    this._mounted = true;
    this._setupWebview(this.props);
  }

  componentWillReceiveProps(nextProps = {}) {
    if (this.props.src !== nextProps.src) {
      this.setState({ error: null, webviewLoading: true, ready: false });
      this._setupWebview(nextProps);
    }
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  _setupWebview(props) {
    if (!props.src) return;
    const webview = ReactDOM.findDOMNode(this.refs.webview);
    const listeners = {
      'did-fail-load': this._webviewDidFailLoad,
      'did-finish-load': this._webviewDidFinishLoad,
      // D4 TODO:
      // 'did-get-response-details': this._webviewDidGetResponseDetails,
      'did-stop-loading': this._webviewDidGetResponseDetails,
      'console-message': this._onConsoleMessage,
    };
    for (const event of Object.keys(listeners)) {
      webview.removeEventListener(event, listeners[event]);
    }
    webview.partition = 'in-memory-only';
    webview.src = props.src;
    for (const event of Object.keys(listeners)) {
      webview.addEventListener(event, listeners[event]);
    }
  }

  _onTryAgain = () => {
    const webview = ReactDOM.findDOMNode(this.refs.webview);
    webview.reload();
  };

  _onConsoleMessage = e => {
    if (/^http.+/i.test(e.message)) {
      shell.openExternal(e.message);
    }
    console.log('Guest page logged a message:', e.message);
  };

  _webviewDidGetResponseDetails = (e) => {

    // D4
    this.setState({ webviewLoading: false });
    return
    // TODO:
    if (!this._mounted) return;
    if (!originalURL.includes(url.parse(this.props.src).host)) {
      // This means that some other secondarily loaded resource (like
      // analytics or Linkedin, etc) got a response. We don't care about
      // that.
      return;
    }
    if (httpResponseCode >= 400) {
      const error = `
        Could not reach Mailspring. Please try again or contact
        support@getmailspring.com if the issue persists.
        (${originalURL}: ${httpResponseCode})
      `;
      this.setState({ ready: false, error: error, webviewLoading: false });
    }
    this.setState({ webviewLoading: false });
  };

  _webviewDidFailLoad = ({ errorCode, validatedURL }) => {
    if (!this._mounted) return;
    // "Operation was aborted" can be fired when we move between pages quickly.
    if (errorCode === -3) {
      return;
    }

    const e = new networkErrors.getErrorByCode(-1);
    const error = `Could not reach ${validatedURL}. ${e ? e.message : errorCode}`;
    this.setState({ ready: false, error: error, webviewLoading: false });
  };

  _webviewDidFinishLoad = () => {
    if (!this._mounted) return;
    // this is sometimes called right after did-fail-load
    if (this.state.error) return;
    this.setState({ ready: true, webviewLoading: false });

    if (!this.props.onDidFinishLoad) return;
    const webview = ReactDOM.findDOMNode(this.refs.webview);
    this.props.onDidFinishLoad(webview);

    // tweak the size of the webview to ensure it's contents have laid out
    webview.style.bottom = '1px';
    window.requestAnimationFrame(() => {
      webview.style.bottom = '0';
    });
  };

  render() {
    return (
      <div className="webview-wrap">
        <webview ref="webview" is partition="in-memory-only" />
        <div className={`webview-loading-spinner loading-${this.state.webviewLoading}`}>
          <RetinaImg
            style={{ width: 20, height: 20 }}
            name="inline-loading-spinner.gif"
            mode={RetinaImg.Mode.ContentPreserve}
          />
        </div>
        <InitialLoadingCover
          ready={this.state.ready}
          error={this.state.error}
          onTryAgain={this._onTryAgain}
        />
      </div>
    );
  }
}
