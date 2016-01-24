
var name = $.cookie("name");

jQuery.validator.setDefaults({
  debug: true,
  success: "valid"
});

$("#namehead").text(name);
$("#logg").text(name);
$("#title").text(name);

var getfrom = {"name": name};

getAllPosts(getfrom);
getFriends(getfrom);

function getFriends(user) {
    $.ajax(
        {
            type: "GET",
            url: "http://localhost:3000/getfriends?name=" + user["name"],
            success: updateFriendsSite
        }
    );
};

function getAllPosts(jsonname){
    $.ajax(
        {
            type: "POST",
            url: "http://localhost:3000/getposts",
            data: jsonname,
            success: addAllSite
        }
    );
};

$(document).ready(function() {

    $( "#submitmsg" ).click(function(){
        var form = $( "#msgform" );
        form.validate();
        if( form.valid() ) {
          var dt = new Date();
          var time = dt.toDateString();
          var thepost = [$("#msgboard").val(), name, time];
          var form = {"to": $("#namehead").text() , "body": $("#msgboard").val(), "from": name, "time": time};

          $.ajax(
            {
              type: "POST",
              url: "http://localhost:3000/postmsg",
              data: form,
              success: getAllPosts
            }
          );
        }
        else{
          $("#msgerror").text("Did not post, message either over max length 420 or empty.");
        }
      });


    $("#namesearch").on("input", function(){
        sendLiveSearch();
    });

    $("#submit").click(function(){
        var form = $( "#friendform" );
        form.validate();

        if( form.valid() ){
         var username = $("#namesearch").val();
         allUsers({"name": username}, function(result){
             if(result){
                 $("#namehead").text(username);
                 var getfrom = {"name": username};
                 getAllPosts(getfrom);
                 getFriends(getfrom);
             }
         });
        }
    });

    $("#logout").click(function(e){
        $.removeCookie("name");
        window.open("http://localhost:3000", "_self");
        e.preventDefault();
    });

    $("#befriend").click(function(){
        var friend = $("#namehead").text();
        if( $("#befriend").text() == "FRIEND"){
            addFriend(friend);
        }
        else{
            removeFriend({"you": name, "friend": friend});
            removeFriend({"you": friend, "friend": name});
        }
    });

});


function addPostSite(topost){
    $("#posts").prepend("<li>" + '<span class="imsg">' + topost[0] + '</span>' + "<p>"+ "<b>" + topost[1] + ":   " + "</b>" + topost[2] + "</p>" + "</li>");
}

function addAllSite(data){
    $("#posts").empty();
    var jsonObj = $.parseJSON(data);
    for(var i in jsonObj){
        add = [jsonObj[i]["body"], jsonObj[i]["from"], jsonObj[i]["time"]];
        addPostSite(add);
        add = [];
    }
};

function updateFriendsSite(data){
    $("#friendslist").empty();
    var friendbutton = "FRIEND";
    $("#friendlist").text("");
    for(var i in data){
        $("#friendlist").append("<li>" + data[i] + "</li>");
        if(name == data[i]){
            friendbutton = "UNFRIEND";
        }
    }
    $("#befriend").text(friendbutton);
};

function sendLiveSearch(){
    $.ajax(
        {
            type: "POST",
            url: "http://localhost:3000/getusers",
            success: getLiveSearch
        }
    );
};

function getLiveSearch(data){
    var searchres = [];
    for(var i in data){
        searchres.push(data[i]["name"]);
    };
    $("#namesearch").autocomplete({
        source: searchres,
        messages: {
            noResults: "",
            results: function(){}
        }
    });
};

function allUsers(name, callback){
    $.ajax(
        {
            type: "POST",
            url: "http://localhost:3000/userexists",
            data: name,
            success: callback
        }
    );
};



function addFriend(friend){
    var form = { "friend": friend, "you": $.cookie("name")};
    $.ajax(
        {
            type: "POST",
            url: "http://localhost:3000/addfriend",
            data: form,
            success: friendChange
        }
    );
};

function removeFriend(form){
    $.ajax(
        {
            type: "POST",
            url: "http://localhost:3000/unfriend",
            data: form,
            success: friendChange
        }
    );
}



function friendChange(data){
    getFriends({"name": $("#namehead").text()});
};
