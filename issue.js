const { UserInputError } = require('apollo-server-express');
const { getDB, getNextSequence } = require('./db');

async function get(_, { id }) {
  const db = getDB();
  const issue = await db.collection('issues').findOne({ id });
  return issue;
}

async function list(_, { status, effortMin, effortMax }) {
  const db = getDB();
  const filter = {};
  if (status) filter.status = status;
  if (effortMin !== undefined || effortMin !== undefined) {
    filter.effort = {};
    if (effortMin !== undefined) filter.effort.$gte = effortMin;
    if (effortMax !== undefined) filter.effort.$lte = effortMax;
  }
  const issues = await db.collection('issues').find(filter).toArray();
  return issues;
}

// function to validate user inputs
function validate(issue) {
  const errors = [];

  if (issue.title.length < 3) {
    errors.push('Field "title" must be at least 3 characters long.');
  }
  if (issue.status === 'Assigned' && !issue.owner) {
    errors.push('Field "owner" is required when status is "Assigned"');
  }
  if (errors.length > 0) {
    // ApolloServer error BAD_USER_INPUT
    throw new UserInputError('Invalid input(s)', { errors });
  }
}

async function add(_, { issue }) {
  const db = getDB();
  validate(issue);
  issue.created = new Date();
  issue.id = await getNextSequence('issues');
  const result = await db.collection('issues').insertOne(issue);
  return await db.collection('issues').findOne({ _id: result.insertedId });
}

module.exports = { list, add, get };
