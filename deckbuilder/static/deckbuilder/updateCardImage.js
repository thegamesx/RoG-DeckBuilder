document.addEventListener("DOMContentLoaded", () => {
    const cardImage = document.getElementById("card-art-display");

    document.addEventListener("mouseenter", (e) => {
        if (!(e.target instanceof HTMLElement)) return;
        
        const card = e.target.closest(".card-in-list");
        const art = card.getAttribute("data-art");
        if (art) {

            cardImage.onload = () => {
                cardImage.style.display = "block"; // Mostrar la imagen solo si cargó
            };

            cardImage.setAttribute("src", "/media/" + art);
        }
    }, true);   
});