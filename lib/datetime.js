'use strict';

function DateTime(date, formattor) {
  if (!(this instanceof Logger)){
    return new DateTime(date, formattor);
  }

  date = date || new Date();




}

DateTime.FORMAT_SIMPLE = 'YYYY-MM-DD hh:mm:ss Z';

DateTime.prototype.format = function (formattor) {

};

module.exports = DateTime;