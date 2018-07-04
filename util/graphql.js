const { GraphQLClient } = require('graphql-request')

const endpoint = 'http://10.210.210.146:5001/graphql'

const client = new GraphQLClient(endpoint)

module.exports = client
