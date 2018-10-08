const moment = require('moment');
const Model = require('./model');
const Contact = require('./contact');

// the Chrono node module is huge
let chrono = null;


  class Event extends Model {

    static defineAttributes(Attribute) {

      this.searchable = true;
      this.searchFields = ['title', 'description', 'location', 'participants'];
      this.sortOrderAttribute = () => {
        return this.attributes.id;
      };
      this.naturalSortOrder = () => {
        return this.sortOrderAttribute().descending();
      };

      Attribute('String', { modelKey: 'calendarId',
        queryable: true,
        jsonKey: 'calendar_id',
      })
      Attribute('String', { modelKey: 'title',
        jsonKey: 'title',
      })
      Attribute('String', { modelKey: 'description',
        jsonKey: 'description',
      })
      // Can Have 1 of 4 types of subobjects. The Type can be:
      //
      // time
      //   object: "time"
      //   time: (unix timestamp)
      //
      // timestamp
      //   object: "timestamp"
      //   start_time: (unix timestamp)
      //   end_time: (unix timestamp)
      //
      // date
      //   object: "date"
      //   date: (ISO 8601 date format. i.e. 1912-06-23)
      //
      // datespan
      //   object: "datespan"
      //   start_date: (ISO 8601 date)
      //   end_date: (ISO 8601 date)
      Attribute('Object', { modelKey: 'when', })
      Attribute('String', { modelKey: 'location', jsonKey: 'location',
      })
      Attribute('String', { modelKey: 'owner', jsonKey: 'owner',
      })
      // Subobject:
      // name (string) - The participant's full name (optional)
      // email (string) - The participant's email address
      // status (string) - Attendance status. Allowed values are yes, maybe,
      //                   no and noreply. Defaults is noreply
      // comment (string) - A comment by the participant (optional)
      Attribute('Object', { modelKey: 'participants', jsonKey: 'participants', })
      Attribute('String', { modelKey: 'status', jsonKey: 'status', })
      Attribute('Boolean', { modelKey: 'readOnly', jsonKey: 'read_only', })
      Attribute('Boolean', { modelKey: 'busy', jsonKey: 'busy', })
      // Has a sub object of the form:
      // rrule: (array) - Array of recurrence rule (RRULE) strings. See RFC-2445
      // timezone: (string) - IANA time zone database formatted string
      //                      (e.g. America/New_York)
      Attribute('Object', { modelKey: 'recurrence', jsonKey: 'recurrence', })

      // ----  EXTRACTED ATTRIBUTES -----

      // The "object" type of the "when" object. Can be either "time",
      // "timestamp", "date", or "datespan"
      Attribute('String', { modelKey: 'type', jsonKey: '_type', })

      // The calculated Unix start time. See the implementation for how we
      // treat each type of "when" attribute.
      Attribute('Number', { modelKey: 'start', jsonKey: '_start',
        queryable: true,
      })

      // The calculated Unix end time. See the implementation for how we
      // treat each type of "when" attribute.
      Attribute('Number', { modelKey: 'end', jsonKey: '_end',
        queryable: true,
      })

      // This corresponds to the rowid in the FTS table. We need to use the FTS
      // rowid when updating and deleting items in the FTS table because otherwise
      // these operations would be way too slow on large FTS tables.
      Attribute('Number', { modelKey: 'searchIndexId', jsonKey: 'search_index_id', })
    }


    // We use moment to parse the date so we can more easily pick up the
    // current timezone of the current locale.
    // We also create a start and end times that span the full day without
    // bleeding into the next.
    _unixRangeForDatespan(startDate, endDate) {
      return {
        start: moment(startDate).unix(),
        end: moment(endDate)
          .add(1, 'day')
          .subtract(1, 'second')
          .unix(),
      };
    }

    fromJSON(json) {
      super.fromJSON(json);

      const when = this.when;

      if (!when) {
        return this;
      }

      if (when.time) {
        this.start = when.time;
        this.end = when.time;
      } else if (when.start_time && when.end_time) {
        this.start = when.start_time;
        this.end = when.end_time;
      } else if (when.date) {
        const range = this._unixRangeForDatespan(when.date, when.date);
        this.start = range.start;
        this.end = range.end;
      } else if (when.start_date && when.end_date) {
        const range = this._unixRangeForDatespan(when.start_date, when.end_date);
        this.start = range.start;
        this.end = range.end;
      }

      return this;
    }

    fromDraft(draft) {
      if (!this.title || this.title.length === 0) {
        this.title = draft.subject;
      }

      if (!this.participants || this.participants.length === 0) {
        this.participants = draft.participants().map(contact => {
          return {
            name: contact.name,
            email: contact.email,
            status: 'noreply',
          };
        });
      }
      return this;
    }

    isAllDay() {
      const daySpan = 86400 - 1;
      return this.end - this.start >= daySpan;
    }

    displayTitle() {
      const displayTitle = this.title.replace(/.*Invitation: /, '');
      const [displayTitleWithoutDate, date] = displayTitle.split(' @ ');
      if (!chrono) {
        chrono = require('chrono-node'); //eslint-disable-line
      }
      if (date && chrono.parseDate(date)) {
        return displayTitleWithoutDate;
      }
      return displayTitle;
    }

    participantForMe = () => {
      // TODO:
      for (const p of this.participants) {
        if (new Contact({ email: p.email }).isMe()) {
          return p;
        }
      }
      return null;
    };
  }
  module.exports = Model.setup(Event)