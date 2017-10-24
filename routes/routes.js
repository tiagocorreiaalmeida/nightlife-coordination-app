require("dotenv").config();
const express = require("express");
const router = express.Router();
const yelp = require("yelp-fusion");
const moment = require("moment");

const Place = require("../models/places");
const User = require("../models/user");

router.get("/",(req,res)=>{
    res.render("index");
});

router.get("/search/:location",(req,res)=>{
    //save requet that has people going and for each city check if is there any people going with going set on the db
   let userLocation = req.params.location;
   yelp.accessToken(process.env.YELP_ID,process.env.YELP_SECRET).then((response)=>{
        const client = yelp.client(response.jsonBody.access_token);
        client.search({
            term:"bar",
            location:userLocation,
            open_now:true,
            limit:1
        }).then((resData)=>{
            let responseData = resData.jsonBody.businesses.map((ele)=>{
                    Place.findOne({"id_place":ele.id}).then((data)=>{
                        if(data){
                            return data.toObject();
                        }else{
                            let place = new Place({
                                id_place: ele.id,
                                name: ele.name,
                                type: ele.categories[0].title,
                                img: ele.image_url,
                                url: ele.url,
                                rating: ele.rating,
                                phone: ele.phone,
                                coord: ele.coordinates.latitude +","+ele.coordinates.longitude,
                                address: ele.location.display_address[0] + " " + ele.location.display_address[1] + " " + ele.location.display_address[2],
                                users_going: []
                            });
                            place.save().then((placeData)=>{
                                return placeData.toObject();
                            }).catch((e)=>{
                                console.log(e);
                            });
                        }
                    }).catch((e)=>{

                    });
            });
            res.send(JSON.stringify(responseData));
        }).catch((e)=>{console.log(e);});
    }).catch((e)=>{console.log(e);}); 
});

router.get("/go/:id",(req,res)=>{
    let location = req.params.id;

    Place.findOne({id_place:location}).then((data)=>{
        if(data){
            let length = data.users_going.length;
            Place.findOne({id_place:location,users_going:"anothernewuser"}).then((data)=>{
                if(data){
                    Place.update({id_place:location,users_going:"anothernewuser"},{$pull:{users_going:"anothernewuser"}}).then((data)=>{
                            let dataUpdated ={size: length-=1};
                            res.send(JSON.stringify(dataUpdated));
                    }).catch((e)=>{
                        console.log(e);
                    });
                }else{
                    Place.update({id_place:location},{$push:{users_going:"anothernewuser"}}).then((data)=>{
                        let dataUpdated ={size: length+=1};
                        res.send(JSON.stringify(dataUpdated));
                    }).catch((e)=>{
                        console.log(e);
                    })
                }
            }).catch((e)=>{
                console.log(e);
            })
        }else{
            Place.create({id_place:location,users_going:"anothernewuser"}).then((data)=>{
                let dataUpdated = {size:1};
                res.send(JSON.stringify(dataUpdated));
            }).catch((e)=>{
                console.log(e);
            });

        }
    }).catch((e)=>{
        console.log(e);
    })

});

module.exports = router;