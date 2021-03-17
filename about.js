let aboutMessage = 'Astora issue tracker API v1.0';

function getMessage() {
  return aboutMessage;
}

function setMessage(_, { message }) {
  aboutMessage = message;
  return aboutMessage;
}

module.exports = { getMessage, setMessage };
