// dotenv should be import at top
import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import session from 'express-session';
import cors from 'cors'
import connectDB from './db/connectdb.js';
import web from './routes/web.js'
// import io from 'socket.io';
import http from 'http'; // Import http
import { Server } from 'socket.io';

const app = express(); // Create an Express application
const port = process.env.PORT || "8000";
const DATABASE_URL = process.env.DATABASE_URL || "mongodb://127.0.0.1:27017"
// connecting mongodb 
connectDB(DATABASE_URL)

// Use cors middleware for all routes
app.use(cors());



const server = http.createServer(app);
const io = new Server(server);

// Your other routes and middleware

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });

    socket.on('rideRequest', (data) => {
        // Handle the ride request event and emit it to the driver
        io.emit('newRideRequest', data);
    });
});


// app.use(bodyparser.json())

// Middleware to parse JSON in the request body
app.use(express.json()) //for parsing application/json  // to accept JSON data

//while creating Doc. when we do console.log(req.body) it print undefined, to solve this we use urlencoded
//extended: false means value can be string or array
//extended: true means value can be any type
//The express urlencoded() function is a built-in middleware function in Express. It parses incoming requests with urlencoded payloads and is based on body-parser
app.use(express.urlencoded({ extended: false })); //it will help to parse our form data




// *********************************************************************
// Make sure you set up the middleware before defining your routes. 
app.use(session({
    secret: 'your-secret-key', // Replace with a strong secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if you're using HTTPS
}));

// Route for homeRide, protected by session check
app.get('/HomeRide', (req, res) => {
    if (req.session.username) {
        res.render('HomeRide', {
            title: 'Ride Dashboard',
            username: req.session.username
        });
    } else {
        // swal("Welcome! ", "Successfully created","success");
        res.redirect('/');
    }
});

// Route for HomeDrive, protected by session check
app.get('/HomeDriver', (req, res) => {
    if (req.session.username) {
        res.render('HomeDriver', {
            title: 'Driver Dashboard',
            username: req.session.username
        });
    } else {
        res.redirect('/');
    }
});

app.get('/go', (req, res) => {

    if (req.session.routeData) {
        res.render('go', {
            title: 'Select Ride',
            pickup: req.session.routeData.pickup,
            dropoff: req.session.routeData.dropoff,
            bikePrice: req.session.routeData.bikePrice,
            miniPrice: req.session.routeData.miniPrice,
            sedanPrice: req.session.routeData.sedanPrice,
            topSedanPrice: req.session.routeData.topSedanPrice,
            xlPrice: req.session.routeData.xlPrice,
            routeData: JSON.stringify(req.session.routeData.route) // Pass routeData as a JSON string
        });
    } else {
        res.render('go', {
            title: 'Select Ride',
            pickup: '',
            dropoff: '',
            bikePrice: 0,
            routeData: null // Handle case where there is no route data
        });
    }
    // res.render('go', {
    //     title: 'Select Ride',
    //     pickup: req.session.pickup,
    //     dropoff: req.session.dropoff,
    //     bikePrice: req.session.bikePrice,
    //     miniPrice: req.session.miniPrice,
    //     sedanPrice: req.session.sedanPrice,
    //     topSedanPrice: req.session.topSedanPrice,
    //     xlPrice: req.session.xlPrice,
    // });
});

// ********************************************************************************

// load the routes
app.use('/', web)



// to serve static files 
app.use(express.static('public'))

// set template engine 
app.set('view engine', 'ejs')

// Start the server
server.listen(port, () => {
    console.log(`server listening at http://localhost:${port}`)
})


