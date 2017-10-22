require("dotenv").config();
const express = require("express");
const router = express.Router();
const yelp = require("yelp-fusion");
const moment = require("moment");

const Places = require("../models/places");
const User = require("../models/places");

router.get("/",(req,res)=>{
    res.render("index");
});

router.get("/search/:location",(req,res)=>{
   let userLocation = req.params.location;
   yelp.accessToken(process.env.YELP_ID,process.env.YELP_SECRET).then((response)=>{
        const client = yelp.client(response.jsonBody.access_token);
        client.search({
            term:"bar",
            location:userLocation,
            limit:1
        }).then((resData)=>{
            console.log(JSON.stringify(resData,undefined,2));
            let responseData = resData.jsonBody.businesses.map((ele)=>{
                if(ele.is_closed !== "false")
                    {
                        return {
                            id: ele.id,
                            name: ele.name,
                            type: ele.categories[0].title,
                            img: ele.image_url,
                            url: ele.url,
                            rating: ele.rating,
                            phone: ele.phone,
                            lat: ele.coordinates.latitude,
                            lng: ele.coordinates.longitude,
                            address: ele.location.display_address[0] + " " + ele.location.display_address[1] + " " + ele.location.display_address[2],
                            going: 0
                        
                        }
                }
            });
            res.send(JSON.stringify(responseData));
        }).catch((e)=>{console.log(e);});
    }).catch((e)=>{console.log(e);}); 
});

router.get("/go/:id",(req,res)=>{
    let location = req.params.id;

    Places.findOne({id_place:location}).then((data)=>{
        if(data){
            let length = data.users_going.length;
            Places.findOne({id_place:location,users_going:"anothernewuser"}).then((data)=>{
                if(data){
                    Places.update({id_place:location,users_going:"anothernewuser"},{$pull:{users_going:"anothernewuser"}}).then((data)=>{
                            let dataUpdated ={size: length-=1};
                            res.send(JSON.stringify(dataUpdated));
                    }).catch((e)=>{
                        console.log(e);
                    });
                }else{
                    Places.update({id_place:location},{$push:{users_going:"anothernewuser"}}).then((data)=>{
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
            Places.create({id_place:location,users_going:"anothernewuser"}).then((data)=>{
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