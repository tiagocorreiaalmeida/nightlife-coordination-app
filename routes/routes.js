require("dotenv").config();
const express = require("express");
const router = express.Router();
const yelp = require("yelp-fusion");
const moment = require("moment");

const Place = require("../models/places");
const User = require("../models/user");

router.get("/", (req, res) => {
    res.render("index");
});

router.get("/search/:location", (req, res) => {
    let userLocation = req.params.location;
    let clientRequest = yelp.accessToken(process.env.YELP_ID, process.env.YELP_SECRET).then((response) => {
        const client = yelp.client(response.jsonBody.access_token);
        return client.search({
            term: "bar",
            location: userLocation,
            open_now: true,
            limit: 1
        });
    });
    clientRequest.then((resData) => {
        if(!resData) return res.send(JSON.stringify({error:"no data"}));
        let retrievePlace = ele => Place.findOne({ id_place: ele.id }).then(data => {
            if (data) return data.toObject();
            return new Place({
                id_place: ele.id,
                name: ele.name,
                type: ele.categories[0].title,
                img: ele.image_url,
                url: ele.url,
                rating: ele.rating,
                phone: ele.phone,
                coord: ele.coordinates.latitude + "," + ele.coordinates.longitude,
                address: ele.location.display_address[0] + " " + ele.location.display_address[1] + " " + ele.location.display_address[2],
                users_going: []
            })
                .save()
                .then(data => data.toObject());
        });
        Promise.all(resData.jsonBody.businesses.map(retrievePlace)).then(places => {
            res.send(JSON.stringify(places))
        });
    }).catch((e) => { 
        if(e.statusCode === 400){
            res.send(JSON.stringify({error:"Location not found!"}));
        }else if(e.statusCode === 500){
            res.send(JSON.stringify({error:"Something went wrong please try again!"}));
        }else{
            console.log(e);
        }
     });
});

router.get("/go/:id", (req, res) => {
    if (req.user) {
        let userID = req.user.id;
        let location = req.params.id;
        Place.findOne({ id_place: location }).then((data) => {
            if (data) {
                Place.findOne({ id_place: location, users_going: userID}).then((data) => {
                    if (data) {
                        return Place.findOneAndUpdate({ id_place: location, users_going: userID }, { $pull: { users_going: userID }},{new:true});
                    } else {
                        return Place.findOneAndUpdate({ id_place: location }, { $push: { users_going: userID }},{new:true});
                    }
                }).then((data)=>{
                    let users_going = data.toObject().users_going.length;
                    res.send(JSON.stringify({users_going}));
                }).catch((e) => {
                    console.log(e);
                });
            } else { res.send(JSON.stringify({ error: true })); }
        }).catch((e) => console.log(e));
    } else { res.send(JSON.stringify({ error: true })); }
});

module.exports = router;