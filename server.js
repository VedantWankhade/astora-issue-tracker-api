// fs to read from files
const fs = require("fs");
require("dotenv").config();
const express = require("express");
const { MongoClient } = require("mongodb");
const { GraphQLScalarType, Kind } = require("graphql");
const { ApolloServer, UserInputError } = require("apollo-server-express");

// local database api url
const DB_URL = process.env.DB_URL || "mongodb://localhost/astora-db";
let db;

async function connectToDB() {
  const dbClient = await new MongoClient(DB_URL, { useNewUrlParser: true });
  await dbClient.connect();
  console.log("Connected to database api at ", DB_URL);
  db = dbClient.db();
}

async function getNextSequence(idName) {
  const result = await db
    .collection("counters")
    .findOneAndUpdate(
      { _id: idName },
      { $inc: { current: 1 } },
      { returnOriginal: false }
    );
  return result.value.current;
}

let aboutMessage = "Astora issue tracker API v1.0";

// scalar Date type for graphQL api
const GraphQLDate = new GraphQLScalarType({
  name: "GraphQLDate",
  description: "A Date type in GraphQL as a scalar",

  // function to convert Date object into a precise date string
  serialize(value) {
    return value.toISOString();
  },

  // function to convert inline input date string into a Date object
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      const value = new Date(ast.value);
      return isNaN(value) ? undefined : value;
    }
  },

  // function to convert variable input date string into a Date object
  parseValue(value) {
    const dateValue = new Date(value);
    return isNaN(dateValue) ? undefined : dateValue;
  },
});

// function to validate user inputs
function validateIssue(issue) {
  const errors = [];

  if (issue.title.length < 3) {
    errors.push('Field "title" must be at least 3 characters long.');
  }
  if (issue.status === "Assigned" && !issue.owner) {
    errors.push('Field "owner" is required when status is "Assigned"');
  }
  if (errors.length > 0) {
    // ApolloServer error BAD_USER_INPUT
    throw new UserInputError("Invalid input(s)", { errors });
  }
}

// fields to serve the api calls
const apiResolvers = {
  Query: {
    about: () => aboutMessage,
    // returns the list of issues as a graphQL type [Issue]
    issueList: async () => await db.collection("issues").find({}).toArray(),
  },
  Mutation: {
    setAboutMessage: (_, { message }) => {
      return (aboutMessage = message);
    },
    // adds issue to the issuesDB list, takes Issue graphQL type
    issueAdd: async (_, { issue }) => {
      validateIssue(issue);
      issue.created = new Date();
      issue.id = await getNextSequence("issues");
      const result = await db.collection("issues").insertOne(issue);
      const savedIssue = await db
        .collection("issues")
        .findOne({ _id: result.insertedId });
      return savedIssue;
    },
  },
  GraphQLDate,
};

const server = new ApolloServer({
  typeDefs: fs.readFileSync("./schema.graphql", "utf-8"),
  resolvers: apiResolvers,
  // show user input errors in api console
  formatError: (error) => {
    console.log(error);
    return error;
  },
});

const app = express();
// apply graphql api middleware to express app at path /api
server.applyMiddleware({ app, path: "/api" });

const API_SERVER_PORT = process.env.API_SERVER_PORT || 3000;

(async function () {
  try {
    await connectToDB();
    app.listen(API_SERVER_PORT, function () {
      console.log(
        `API server started at port http://localhost:${API_SERVER_PORT}`
      );
    });
  } catch (err) {
    console.log(err);
  }
})();
