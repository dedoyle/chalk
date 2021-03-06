'use strict';

var base64 = require('../binary/base64');
var arrayBuffToBinString = require('../binary/arrayBufferToBinaryString');
var readAsArrayBuffer = require('../binary/readAsArrayBuffer');
var binStringToBlobOrBuffer = require('../binary/binaryStringToBlobOrBuffer');
var errors = require('../errors');
var md5 = require('../md5');

function preprocessAttachments(docInfos, blobType, callback) {

  if (!docInfos.length) {
    return callback();
  }

  var docv = 0;

  function parseBase64(data) {
    try {
      return base64.atob(data);
    } catch (e) {
      var err = errors.error(errors.BAD_ARG,
        'Attachments need to be base64 encoded');
      return {error: err};
    }
  }

  function preprocessAttachment(att, callback) {
    if (att.stub) {
      return callback();
    }
    if (typeof att.data === 'string') {
      // input is a base64 string

      var asBinary = parseBase64(att.data);
      if (asBinary.error) {
        return callback(asBinary.error);
      }

      att.length = asBinary.length;
      if (blobType === 'blob') {
        att.data = binStringToBlobOrBuffer(asBinary, att.content_type);
      } else if (blobType === 'base64') {
        att.data = base64.btoa(asBinary);
      } else { // binary
        att.data = asBinary;
      }
      md5(asBinary).then(function (result) {
        att.digest = 'md5-' + result;
        callback();
      });
    } else { // input is a blob
      readAsArrayBuffer(att.data, function (buff) {
        if (blobType === 'binary') {
          att.data = arrayBuffToBinString(buff);
        } else if (blobType === 'base64') {
          att.data = base64.btoa(arrayBuffToBinString(buff));
        }
        md5(buff).then(function (result) {
          att.digest = 'md5-' + result;
          att.length = buff.byteLength;
          callback();
        });
      });
    }
  }

  var overallErr;

  docInfos.forEach(function (docInfo) {
    var attachments = docInfo.data && docInfo.data._attachments ?
      Object.keys(docInfo.data._attachments) : [];
    var recv = 0;

    if (!attachments.length) {
      return done();
    }

    function processedAttachment(err) {
      overallErr = err;
      recv++;
      if (recv === attachments.length) {
        done();
      }
    }

    for (var key in docInfo.data._attachments) {
      if (docInfo.data._attachments.hasOwnProperty(key)) {
        preprocessAttachment(docInfo.data._attachments[key],
          processedAttachment);
      }
    }
  });

  function done() {
    docv++;
    if (docInfos.length === docv) {
      if (overallErr) {
        callback(overallErr);
      } else {
        callback();
      }
    }
  }
}

module.exports = preprocessAttachments;
