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
    return;
})
  .catch( error => console.error(error) ); // If there is any error you will catch them here

}

//funzione per richiesta della geolocalizzazione
function requestLocation() {
  return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(resolve, reject);
      } else {
          reject(new Error("Geolocation is not supported by this browser."));
      }
  });
}

function ricercaRastrelliereDispositivo() {
  requestLocation()
      .then(position => {
          var latitude = position.coords.latitude;
          var longitude = position.coords.longitude;

          return fetch('/api/v1/position', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ position: { latitude, longitude } }),
          });
      })
      .then(response => response.json())
      .then(function(data){
        document.getElementById("latitude").innerHTML = data.body.latitude;
        document.getElementById("longitude").innerHTML = data.body.longitude;
      })
      .catch(error => {
          console.error('Error:', error);
      });
}