$(document).ready((()=>{
    let latest = "";
    $("#send").click((()=>{
        let value = $("#location").val();
        if(value!=="" && value !== latest){
            $.getJSON("/search/"+value,((data)=>{
                if(data){
                    $("#dataInfo").empty();
                    data.forEach((ele)=>{
                        $("#dataInfo").append('<div class="col-md-12 card mb-4"><div class="row"><div class="col-sm-3"><img class="card-img-top" src="'+ele.img+'" alt="Card image"></div><div class="col-sm-9"><h4 class="mt-3 mb-3"><a href="'+ele.url+'">'+ele.name+'</a> - <i class="fa fa-tag" aria-hidden="true"></i> '+ele.type+'</h4><p><i class="fa fa-map-marker" aria-hidden="true"></i>'+ele.address+'</p><p class="card-text">Rating: '+ele.rating+'</p><div class="row"><div class="col-sm-4"><button id="go" class="btn btn-info btn-block" data-attr="'+ele.going+'" >Going: '+ele.going+'</button></div><div class="col-sm-4 col-6"> <a href="callto:'+ele.phone+'" class="btn btn-outline-success btn-block"><i class="fa fa-phone" aria-hidden="true"></i></a></div><div class="col-sm-4 col-6"><a href="http://maps.google.com/?q='+ele.lat+','+ele.lng+'" target="_blank" class="btn btn-outline-info btn-block"><i class="fa fa-globe" aria-hidden="true"></i></a></div></div></div></div></div>');
                    });
                }else{
                    console.log("no data found");
                }       
            }))
            .fail((e)=>{
                console.log(e);
            })
        }
    }));

    $("#dataInfo").on("click", "#go", function(){
        let element = $(this);
        let buttonid = $(this).attr("data-attr");
        $.getJSON("/go/"+buttonid,((data)=>{
            if(data){
                element.text("Going: " + data["size"]);
            }
        }));
    });
}));
    //<button id="go" class="btn btn-info btn-block" data-attr="'+ele.id+'" >Going: '+ele.going+'</button>