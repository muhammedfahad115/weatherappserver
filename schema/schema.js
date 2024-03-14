

const User = require('../Model/userSchema');
const axios = require('axios');

const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull,
    GraphQLEnumType,
    GraphQLFloat, 

} = require('graphql');


const UserType = new GraphQLObjectType({
    name: 'User',
    fields: ()=>({
        username: {type: GraphQLString},
        email: {type: GraphQLString},
        user: {type: GraphQLString},
        message: {type: GraphQLString},
    }),
})

const LoginType = new GraphQLObjectType({
    name: 'login',
    fields: ()=>({
        // email: {type: GraphQLString},
        message: {type: GraphQLString}
    })
})

const ForecastType = new GraphQLObjectType({
    name: 'Forecast',
    fields: () => ({
        time: { type: GraphQLString },
        weather: { type: GraphQLString },
        temperature: { type: GraphQLFloat }, 
    }),
});

const WeatherType = new GraphQLObjectType({
    name: 'Weather',
    fields: () => ({
        cityName: { type: GraphQLString },
        currentWeather: { type: GraphQLString },
        currentTemperature: { type: GraphQLFloat },
        upcomingForecast: { type: new GraphQLList(ForecastType) }, 
    }),
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQuery',
    fields: () => ({
      users: {
        type: new GraphQLList(UserType),
        resolve(parent, args) {
          return User.find({}, { password: 0 });  // Exclude password field from the results
        },
      },
         weather: {
            type: WeatherType,
            args: {
                city: { type: GraphQLNonNull(GraphQLString) },
            },
            async resolve(parent, args) {
                console.log("args", args)
                try {
                    const apiKey = process.env.WEATHERAPP;
                    const city = args.city;
                    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
                    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

                    const [currentWeatherResponse, forecastResponse] = await Promise.all([
                        axios.get(currentWeatherUrl),
                        axios.get(forecastUrl),
                    ]);

                    const currentWeatherData = currentWeatherResponse.data;
                    const forecastData = forecastResponse.data;

                    const cityName = currentWeatherData.name;
                    const currentWeather = currentWeatherData.weather[0].main;
                    const currentTemperature = currentWeatherData.main.temp;
                    const upcomingForecast = forecastData.list.map((item) => ({
                        time: item.dt_txt,
                        weather: item.weather[0].main,
                        temperature: item.main.temp,
                    }));
                    console.log(cityName, currentWeather, currentTemperature, upcomingForecast)
                    return {
                        cityName,
                        currentWeather,
                        currentTemperature,
                        upcomingForecast,
                    };
                } catch (error) {
                    throw new Error('Failed to fetch weather data');
                }
            },
        },
    }),
  });

// Mutations
const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      signup: {
        type: UserType, // Assuming you have a UserType defined elsewhere
        args: {
          username: { type: GraphQLNonNull(GraphQLString) },
          email: { type: GraphQLNonNull(GraphQLString) },
          password: { type: GraphQLNonNull(GraphQLString) },
        },
        resolve(parent, args, context) {
            
          const newUser = new User({
            username: args.username,
            email: args.email,
            password: args.password, 
          });

          console.log(newUser)
  
          return newUser.save().then((savedUser)=>{
            if(!savedUser){
                throw new Error('Email exists try another one');
            }
            return {
                user: savedUser,
                message: 'success',
            }
          })
        },
      },
      login: {
        type: LoginType,
        args: {
            email: {type: GraphQLNonNull(GraphQLString)},
            password: {type: GraphQLNonNull(GraphQLString)}
        },
        resolve(parent,args,context){
            return User.findOne({email: args.email, password: args.password})
            .then((user)=>{
                if(!user){
                    throw new Error('Invalid email or password')
                }
                const message = 'success'
                return {message}
            })
        }
      }
    },
  });

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation,
});