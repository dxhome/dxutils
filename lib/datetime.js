'use strict';

function DateTime(date, formattor) {
  if (!(this instanceof DateTime)){
    return new DateTime(date, formattor);
  }

  date = date || new Date();
  formattor = formattor || '';



}

DateTime.FORMAT_SIMPLE = 'YYYY-MM-DD hh:mm:ss Z';

DateTime.prototype.format = function () {

};

module.exports = DateTime;