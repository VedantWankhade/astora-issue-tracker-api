const { GraphQLScalarType, Kind } = require('graphql');

// scalar Date type for graphQL api
const GraphQLDate = new GraphQLScalarType({
  name: 'GraphQLDate',
  description: 'A Date type in GraphQL as a scalar',

  // function to convert Date object into a precise date string
  serialize(value) {
    return value.toISOString();
  },

  // function to convert inline input date string into a Date object
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      const value = new Date(ast.value);
      return Number.isNaN(value) ? undefined : value;
    }
  },

  // function to convert variable input date string into a Date object
  parseValue(value) {
    const dateValue = new Date(value);
    return isNaN(dateValue) ? undefined : dateValue;
  },
});

module.exports = GraphQLDate;
