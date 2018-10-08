
const cidRegexString = 'src=[\'"]cid:([^\'"]*)[\'"]';
const cidRegex = new RegExp(cidRegexString, 'g');
module.exports = { cidRegexString, cidRegex };
