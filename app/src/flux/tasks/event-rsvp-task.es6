const Task = require('./task');

// module.exports = Task.setup(
 class EventRSVPTask extends Task {

    constructor(event, RSVPEmail, RSVPResponse) {
      super();
      this.event = event;
      this.RSVPEmail = RSVPEmail;
      this.RSVPResponse = RSVPResponse;
    }

    performLocal() {}

    onOtherError() {
      return Promise.resolve();
    }

    onTimeoutError() {
      return Promise.resolve();
    }
  }
// )

module.exports = EventRSVPTask
