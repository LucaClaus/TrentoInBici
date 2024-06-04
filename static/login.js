function login()
{
    //get the form object
    var email = document.getElementById("loginEmail").value;
    var password = document.getElementById("loginPassword").value;
    console.log("email: ", email, " password: ", password);

    fetch('/api/v1/authentication', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( { email: email, password: password } ),
    })
    .then((resp) => resp.json()) // Transform the data into json
    .then(function(data) { // Here you get the data to modify as you please
        if(data.success){
            console.log(data);
            loggedUser.token = data.token;
            loggedUser.email = data.email;
            loggedUser.id = data.id;
            loggedUser.self = data.self;
            console.log(loggedUser.email);

            localStorage.setItem("loggedUserEmail", loggedUser.email);
            localStorage.setItem("loggedUserToken", loggedUser.token);
            localStorage.setItem("loggedUserId", loggedUser.id);
            localStorage.setItem("loggedUserSelf", loggedUser.self);

            window.location.href = "index.html";
             
        }else{
            alert("Errore di autenticazione!");
        }
        
        return;
    })
    .catch(function(error) {
        
    }); 

};