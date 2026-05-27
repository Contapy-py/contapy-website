// Navbar con sombra al hacer scroll

window.addEventListener("scroll", function () {

    const header = document.querySelector(".header");

    if (window.scrollY > 40) {
        header.style.boxShadow = "0 8px 25px rgba(0,0,0,.08)";
    } else {
        header.style.boxShadow = "none";
    }
});


// Animación suave al cargar

window.addEventListener("load", () => {

    const cards = document.querySelectorAll(
        ".service-card, .plan-card, .hero-card, .author-card"
    );

    cards.forEach((card, index) => {

        card.style.opacity = "0";
        card.style.transform = "translateY(20px)";
        card.style.transition = "all .5s ease";

        setTimeout(() => {
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
        }, index * 120);

    });

});
