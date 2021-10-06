const APIKEy = "d2bf4faee119b7c41f651c960e883955";
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';
const Movie_URL =  'https://api.themoviedb.org';


function initializePage(){
    var op = getCookie('option');
    var aux = getCookie('aux');
    switch (op) {
        case 'none':
            init(op, aux);
            console.log("Estoy en home");
            break;
        case 'top':
            init(op, aux);
            console.log("Estoy en ranking");
            break;
        case 'filter':
            init(op, aux);
            console.log("Estoy en género" + aux);
            break;
        case 'reverse':
            init(op, aux);
            console.log("Estoy en género rev" + aux);
            break;
        case 'letter':
            init(op, aux);
            console.log("Estoy en género let" + aux);
            break;
        case 'names':
            init(op, aux);
            console.log("Estoy en busqueda" + aux);
            break;
        default:
            init('none', 'none');
            console.log("Estoy en home");
            break;
    }
}

initializePage();

console.log("Cookie genre: "+ getCookie('aux'));
console.log("Cookie option: "+ getCookie('option'));

function setCookie(name,value) {
    document.cookie = name + "=" + (value || "");
    console.log("Cookie generada: "+ document.cookie);
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }


function changePage(name){
    var op = getCookie('option');
    switch (op) {
        case 'none':
            window.location.href = "index.html";
            break;
        case 'top':
            window.location.href = "ranking.html";
            break;
        case 'filter':
            window.location.href = "genre.html";
            break;
        case 'reverse':
             window.location.href = "genre.html";
             break;
        case 'letter':
            window.location.href = "genre.html";
            break;
        case 'names':
            window.location.href = "ranking.html";
            break;
        default:
            break;
    }
}

function setAndChange(name1, value1, name2, value2){
    setCookie(name1,value1);
    setCookie(name2,value2);
    changePage(name2);
}

async function init(op, aux){
    try{
        console.log("Estoy en init");

        const [movies,ratings,links] = await getMoviesData();
        const moviesMap=movies.map(m =>{

            const link = links.find( ({ movieId }) => movieId === m.movieId ); //Encuentre el id

            const rating=[];
            const sum=ratings.reduce((accumulator, currentValue) => { //Saca el promedio
                if(currentValue.movieId==parseInt(m.movieId)){
                rating.push(parseFloat(currentValue.rating));
                accumulator+=parseFloat(currentValue.rating);
                } return accumulator;
            },0);

            return {id:m.movieId, title:m.title, genre: m.genres,link:link.tmdbId, number: rating.length, average: Math.round((sum/rating.length)*100)/100, porcentaje:((sum/rating.length)/5)*100};
        })
        const moviesInfo= moviesMap.filter( ({ number }) => number >20 );

        switch(op){
            case 'none':
                const top5=moviesInfo.sort(function (b, a) {return a.average - b.average;}).slice(0,6);
                mostrar('movie-key',top5,'mov');
                break;
            case 'top':
                const top=moviesInfo.sort(function (b, a) {return a.average - b.average;}).slice(0,100);
                mostrarTop(top);
                break;
            case 'filter':
                if (aux != 'All') {
                    const fGenre = moviesInfo.filter( ({ genre }) => genre.includes(aux));
                    fGenre.sort(function (b, a) {return a.average - b.average;});
                    document.getElementById("nombre-genero").innerHTML=aux;
                    mostrar('movie-genre',fGenre,'mov');
                }
                else {
                    const todo = moviesInfo.sort(function (b, a) {return a.average - b.average;});
                    document.getElementById("nombre-genero").innerHTML=aux;
                    mostrar('movie-genre',todo,'mov');
                }
                break;
            case 'reverse':
                if (aux != 'All') {
                    const fGenrerev= moviesInfo.filter( ({ genre }) => genre.includes(aux));
                    fGenrerev.sort(function (a, b) {return a.average - b.average;});
                    document.getElementById("nombre-genero").innerHTML=aux;
                    mostrar('movie-genre',fGenrerev,'mov');
                }
                else{
                    const todorev = moviesInfo.sort(function (a, b) {return a.average - b.average;});
                    document.getElementById("nombre-genero").innerHTML=aux;
                    mostrar('movie-genre',todorev,'mov');
                }
                break;
            case 'letter':
                const fGenrelet = moviesInfo.filter( ({ genre }) => genre.includes(aux));
                fGenrelet.sort(function (a, b) {return a.title.localeCompare(b.title)});
                document.getElementById("nombre-genero").innerHTML=aux;
                mostrar('movie-genre',fGenrelet,'mov');
                break;
            case 'names':
                const sTitle = moviesInfo.filter( ({ title }) => title.includes(UpperCaseFirst(aux)));
                const fTitle = moviesInfo.filter( ({ title }) => title.includes(aux));
                const tTitle = fTitle.concat(sTitle);
                tTitle.sort(function (b, a) {return a.average - b.average;});
                mostrarTop(tTitle);
                break;
            default:
                console.log();
                break;
        }

    }catch(err){
        console.log(err);
        //manipular el error.
    }
}

// <Función para poner primera letra del buscador en Mayúscula>
function UpperCaseFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// <Función para leer los CSV>
function getMoviesData(){
    return Promise.all([
        d3.csv("movies.csv"),
        d3.csv("ratings.csv"),
        d3.csv("links.csv"),
    ]).then(response => response )
    .catch(err => err)
}

function getMovieDb(id, img){
    const url = `${Movie_URL}/3/movie/${id}?api_key=${APIKEy}`;
    fetch(url).then((res)=>res.json()).then((data)=>
    {
        img.src=IMAGE_URL + data.poster_path;
    })
    .catch((error)=>{
        console.log('error de fec');
    });
    return url;
}

function getMovieDt(id, img, txt){
    const url = `${Movie_URL}/3/movie/${id}?api_key=${APIKEy}`;
    fetch(url).then((res)=>res.json()).then((data)=>
    {
        img.src=IMAGE_URL + data.poster_path;
        txt.innerHTML=data.overview;
    })
    .catch((error)=>{
        console.log('error de kgyygjhklmlk');
    });
    return url;
}

function mostrar(div, array, clase){
    console.log(div);
    var divMovie = document.getElementById(div);
    console.log(divMovie);
    divMovie.innerHTML="";

    if(array.length<=0){
        document.getElementById("title-general").innerHTML="There is no movies :(";
    }
    else{
        array.forEach(function(m){
            var newMovie = document.createElement("div"); newMovie.className=clase;
            divMovie.appendChild(newMovie);

            var imgMovie = document.createElement("img");
            getMovieDb(m.link,imgMovie);
            newMovie.appendChild(imgMovie);

            var datosMovie = document.createElement("div"); datosMovie.className="DatosMovie";
            var titleMovie =document.createElement("h3");
            var genreMovie = document.createElement("h5"); genreMovie.className="DGénero";
            var ratingMovie = document.createElement("h5"); ratingMovie.className="DPuntuacion";
            titleMovie.innerHTML = m.title;
            genreMovie.innerHTML = m.genre;
            ratingMovie.innerHTML = m.average;

            newMovie.appendChild(datosMovie);
            datosMovie.appendChild(titleMovie);
            datosMovie.appendChild(genreMovie);
            datosMovie.appendChild(ratingMovie);
        }
      )
    }
}

function mostrarTop(array){
    var title=document.createElement("h3");
    if (getCookie('option')=='top') {
        title.innerHTML="Top 100 Movies";
    }
   else
   {
        title.innerHTML="Results";
   }

    var divMovie =document.getElementById("movie-top");
    divMovie.innerHTML="";
    divMovie.appendChild(title);

    array.forEach(function(m){
      var newMovie= document.createElement("section"); newMovie.className="movie";
      divMovie.appendChild(newMovie);

      var imgMovie=document.createElement("img");
      var txtMovie=document.createElement("li"); txtMovie.className="Descripcion";
      getMovieDt(m.link,imgMovie,txtMovie);
      newMovie.appendChild(imgMovie);

      var datosMovie= document.createElement("ul");
      var titleMovie=document.createElement("li");
      var genreMovie=document.createElement("li");
      var ratingMovie=document.createElement("li");
      titleMovie.innerHTML=m.title;
      genreMovie.innerHTML=m.genre;
      ratingMovie.innerHTML=m.average+' <p>/ 5.0 </p>';

      newMovie.appendChild(datosMovie);
      datosMovie.appendChild(titleMovie);
      datosMovie.appendChild(genreMovie);
      datosMovie.appendChild(txtMovie);
      datosMovie.appendChild(ratingMovie);
    }
    )
}
