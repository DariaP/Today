var markdown = require( "markdown" ).markdown,
  cheerio = require('cheerio');

function parseRecords(data, callback) {
  var records = [],
      html = markdown.toHTML(data),
      $ = cheerio.load(html),
      dates = $('h1');

  dates.each(function(i) {
    var date = $(this),
        done = date.next().next(),
        diff = done.next().next();

    records.push({
      date: date.text(),
      done: done.text(),
      diff: diff.text()
    });
  });
  callback(records);
}

function makeRecord(data) {
  return "# " + data.date +
         "\n## what have I learned today?\n" +
         data.done + 
         "\n \n## what would I do differently?\n" +
         data.diff + "\n \n# " + ;
}

module.exports = {
  parseRecords: parseRecords,
  makeRecord: makeRecord
};