// Menu para elegir donde van las cartas
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('card-menu-icon')) {
        const menu = document.getElementById('card-menu');
        const cardDiv = e.target.closest('.card-to-add');
        if (!cardDiv) return;
        const cardId = cardDiv.id;
        const rect = e.target.getBoundingClientRect();
        menu.style.left = rect.left + 'px';
        menu.style.top = rect.top + 'px';
        menu.setAttribute('triggered-card-id', cardId);
        menu.style.display = 'block';
    } else if (!e.target.closest('#card-menu')) {
        // Esconde el menú si hacemos click fuera de la ventana
        document.getElementById('card-menu').style.display = 'none';
    }
});