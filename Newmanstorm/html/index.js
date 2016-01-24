
var loginuser;
var audio = new Audio("magicword.wav");
audio.loop = true;

jQuery.validator.setDefaults({
  debug: true,
  success: "valid"
});



$(document).ready(function() {

    $( "#formswitch" ).click(function(e){
        $("#error").text("");

        if($("h1").text() == "Login"){
            $("h1").text("Register");
            $("#logreg").text("Register");
            $("#formswitch").text("Login");
        }
        else{
            $("h1").text("Login");
            $("#logreg").text("Login");
            $("#formswitch").text("Register");
      }

        e.preventDefault();
    });


    $( "#logreg" ).click(function(){
        var form = $( "#subform" );
        form.validate();
        $("#error").text("");

        if( form.valid() ) {
          if($("h1").text() == "Login"){
            var form = {"name" : $("#name").val(), "pass" : $("#password").val()};
            loginuser = form["name"];
            $.ajax( {
              type: "POST",
              url: "http://localhost:3000/verifyuser",
              data: form,
              success: great,
              error: passError
            }
          );
        }
        else {
          var logform = {"name" : $("#name").val(), "pass" : $("#password").val(), "friends" : []};
          $.ajax( {
            type: "POST",
            url: "http://localhost:3000/saveuser",
            data: logform,
            error: regError
          }
        );
      }
    }
    else{
      $("#error").text("Name: 3-12 letters or numbers. Pass: minimum is length 3.");
    }
  });
});

function great(data){
    $.cookie("name", $("#name").val());
    window.open("http://localhost:3000/profile.html", "_self");
};

function passError(data){
    audio.play();
    $("#error").text("Wrong password!");

};

function regError(data){
    $("#error").text("User already exists!");
};
