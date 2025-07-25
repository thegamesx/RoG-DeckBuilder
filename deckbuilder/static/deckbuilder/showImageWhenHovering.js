document.addEventListener("DOMContentLoaded", () => {
    const hoverBox = document.querySelector(".img-on-hover");
    const hoverImg = document.querySelector(".img-on-hover img");

    if (hoverBox) {
        hoverBox.style.display = "none";
    }

    document.addEventListener("mousemove", (e) => {
        if (hoverImg) {
            hoverBox.style.left = (e.pageX + 30) + "px";
            hoverBox.style.top = (e.pageY + -20) + "px";
        }
    });

    document.addEventListener("mouseenter", (e) => {
        const card = e.target.closest(".card-in-list");
        if (!card || !hoverImg || !hoverBox) return;

        const art = card.getAttribute("data-card-art");
        if (art) {
            hoverBox.style.display = "block";
            hoverImg.style.display = "none"; // Oculta la imagen mientras carga

            hoverImg.onload = () => {
                hoverImg.style.display = "block"; // Mostrar la imagen solo si cargó
            };

            hoverImg.onerror = () => {
                hoverImg.style.display = "none"; // Si hay error, no mostrar imagen
            };

            hoverImg.setAttribute("src", art);
        }
    }, true);   

    document.addEventListener("mouseleave", (e) => {
        const card = e.target.closest(".card-in-list");
        if (!card || !hoverBox) return;

        hoverBox.style.display = "none";
    }, true);  

});