// fs to read from files
const fs = require('fs');
require('dotenv').config();
const { ApolloServer } = require('apollo-server-express');
const GraphQLDate = require('./graphql_date');
const about = require('./about');
const issue = require('./issue');

// fields to serve the api calls
const apiResolvers = {
  Query: {
    about: about.getMessage(),
    // returns the list of issues as a graphQL type [Issue]
    issueList: issue.list,
  },
  Mutation: {
    setAboutMessage: about.setMessage,
    // adds issue to the issuesDB list, takes Issue graphQL type
    issueAdd: issue.add,
  },
  GraphQLDate,
};

const server = new ApolloServer({
  typeDefs: fs.readFileSync('./schema.graphql', 'utf-8'),
  resolvers: apiResolvers,
  // show user input errors in api console
  formatError: (error) => {
    console.log(error);
    return error;
  },
});

function installHandler(app) {
  const enableCors = (process.env.ENABLE_CORS || 'true') === 'true';
  console.log('CORS setting:', enableCors);
  server.applyMiddleware({ app, path: '/api', cors: enableCors });
}

module.exports = installHandler;
