const express = require('express');
const {ApolloServer,gql} = require('apollo-server-express');

require('dotenv').config();
require('./config/config')();

const app = express();
const port = 4000;


app.listen(port,()=>{
    console.log(`Server is now running on the port ${port}`);
})