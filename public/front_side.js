/*handleResize è chiamata con due eventi: quando c'è il ridimensionamento della finestra 
e quando ce il caricamenro della pagina per fare in modo che quando la pagina si 
allarga ritornano i classici navlinks
innerwith erestituisce il valore della larghezza della pagina in un certo momento 
in pixel
*/
function handleResize() {
  const navLinkMini = document.getElementById("nav-link-mini");
  const navLink = document.getElementById("nav-link");
  const hamburger = document.getElementById("hamburger");
  const xButton = document.getElementById("x_button");

  if (window.innerWidth > 1080) {
    navLinkMini.style.display = "none";
    navLink.style.display = "flex";
    hamburger.style.display = "none";
    xButton.style.display = "none";
  } else {
    navLink.style.display = "none";
    if (xButton.style.display === "none") {
      hamburger.style.display = "block";
      navLinkMini.style.display = "none";
    }
  }
}

// Chiamare handleResize quando la finestra viene ridimensionata
window.addEventListener("resize", handleResize);

// Chiamare handleResize quando la pagina viene caricata
window.addEventListener("load", handleResize);

// GESRIONE DEL MENU AD HAMBURGER
function openNav() {
  navlink = document.getElementById("nav-link-mini");
  if (document.getElementById("hamburger").style.display !== "none") {
    navlink.style.display = "flex";
    navlink.style.animation = "slideRight 0.5s";
    document.getElementById("x_button").style.display = "block";
    document.getElementById("hamburger").style.display = "none";
  } else if (document.getElementById("x_button").style.display !== "none") {
    navlink.style.animation = "slideLeft 0.5s";
    setTimeout(() => {
      navlink.style.display = "none";
    }, 300); // Wait for the slideLeft animation to finish
    document.getElementById("x_button").style.display = "none";
    document.getElementById("hamburger").style.display = "block";
  }
}

//POPUP DESCRIZIONE MAKETPLACE
// Funzione per aprire il popup
function openDescription() {
  var popup = document.getElementById("popup");
  popup.style.display = "block"; // Mostra il popup
  popup.classList.remove("close");
  popup.classList.add("open");
}

const results = document.getElementsByClassName("course");
if (results.length > 0) {
  /*mostra il titiolo del corso a cui sono iscritto o creato al passaggio del mouse come alert*/
  course = document.getElementsByClassName("course");
  course.getElementsById("course-title").addEventListener("hover", function () {
    alert(this.textContent);
  });
}

/* getelementbyid riestituisce o loggetto identificato o null*/
