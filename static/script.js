function prova(){
  //get the form object
  var email = "prova"
  // console.log(email);

  fetch('../api/v1/prova', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify( { email: email } ),
  })
  .then((resp) => resp.json()) // Transform the data into json
  .then(function(data) { // Here you get the data to modify as you please
    document.getElementById("prova").innerHTML = data.message;
    loadLendings();
    return;
})
  .catch( error => console.error(error) ); // If there is any error you will catch them here

}


function ricercaRastrelliereDispositivo(){

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
          const { latitude, longitude } = position.coords;
      
          fetch('/api/v1/position', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ position: { latitude, longitude } }),
          })
          .then(response => response.json())
          .then(data => console.log(data.message))
          .catch((error) => {
            console.error('Error:', error);
          });
        });
      } else {

        console.log("Geolocation is not supported by this browser.");
      }
}