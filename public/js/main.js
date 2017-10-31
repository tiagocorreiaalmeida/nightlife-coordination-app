let latest = "";
let request = (searchValue)=>{
    if(searchValue===""){
      $(".messages").empty();
      $(".messages").append('<div class="alert alert-dark" role="alert">Insert a location on the field</div>');
    }
    if(searchValue!=="" && searchValue !== latest){
        $("#send").attr("disabled","disabled");
        $("#location").attr("disabled","disabled");
        latest = searchValue;
        $(".load-wrap").addClass("active");
        $.getJSON("/search/"+searchValue,((data)=>{
                $("#dataInfo").empty();
                $(".messages").empty();
                if(data.error){
                    $(".messages").append(`<div class="alert alert-dark" role="alert">${data.error}</div>`);
                }else{
                    localStorage.setItem("lastSearch", JSON.stringify({ searchString: searchValue}));
                    data.forEach((ele)=>{
                        $("#dataInfo").append(`
                        <div class="col-lg-12 card mb-5 bar-info">
                            <div class="row">
                                <div class="col-sm-5 bar-info-img">
                                    <img class="card-img-top" src="${ele.img}" alt="Card image">
                                </div>
                                <div class="col-sm-7">
                                    <h4 class="mt-3 mb-3">
                                        <a href="${ele.url}">${ele.name}</a> - <i class="fa fa-tag" aria-hidden="true"></i> ${ele.type}
                                    </h4>
                                    <p><i class="fa fa-map-marker" aria-hidden="true"></i>${ele.address}</p>
                                    <p class="card-text">Rating: ${ele.rating}</p>
                                    <div class="row">
                                        <div class="col-md-4 col-sm-12 mb-2">
                                            <button id="go" class="btn btn-info btn-block" data-attr="${ele.id_place}" >Going: ${ele.users_going.length}</button>
                                        </div>
                                        <div class="col-md-4 col-sm-6 mb-2">
                                            <a href="callto:${ele.phone}" class="btn btn-outline-success btn-block"><i class="fa fa-phone" aria-hidden="true"></i></a>
                                        </div>
                                        <div class="col-md-4 col-sm-6 mb-2">
                                            <a href="http://maps.google.com/?q=${ele.coord}" target="_blank" class="btn btn-outline-info btn-block"><i class="fa fa-globe" aria-hidden="true"></i></a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>`);
                    });
                }
                $(".load-wrap").removeClass("active");
                $("#send").removeAttr("disabled");
                $("#location").removeAttr("disabled");
        }))
        .fail((e)=>{
            console.log(e);
        })
        
    }
}


if(localStorage.getItem("isLogginIn")) {
    localStorage.setItem("isLogginIn", "");
    let lastSearchData = JSON.parse(localStorage.getItem("lastSearch"));
    if(lastSearchData){
        $("#location").val(lastSearchData.searchString);
        request(lastSearchData.searchString);
    }
}

$(document).ready((()=>{
    $("#facebook, #twitter").click((()=>{
        localStorage.setItem("isLogginIn","true");
        return true;
    }));

    $("#logout").click((()=>{
        localStorage.clear();
    }));

    $(document).keypress((e)=>{
        if(e.which === 13){
            $("#send").click();
        }
    });
    $("#send").click((()=>{
        let input = $("#location").val();
        request(input);
    }));

    $("#dataInfo").on("click", "#go", function(){
        let element = $(this);
        let buttonid = $(this).attr("data-attr");
        $.getJSON("/go/"+buttonid,((data)=>{
            if(data && !data.error){
                element.text("Going: " + data["users_going"]);
            }
        }));
    });
}));