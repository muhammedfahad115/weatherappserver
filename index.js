
const express = require('express')
require('dotenv').config()
const {graphqlHTTP} = require('express-graphql')
const cors = require('cors');
const schema = require('./schema/schema')
const connectDB = require('./config/config')
connectDB()

const app = express()
const port =  5000;

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));

app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true,
}))

app.listen(port, ()=>{
    console.log('listening on port', port);
})