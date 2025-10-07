function renderCardGroups(groups, container) {
    container.innerHTML = ''; // Limpiar el contenedor antes de agregar nuevos grupos

    const grid = document.createElement('div');
    grid.classList.add('card-columns-grid');

    Object.entries(groups).forEach(([groupKey, cards]) => {
        const col = document.createElement('div');
        col.classList.add('col-12', 'col-md-6', 'col-xl-4');

        const cardGroup = document.createElement('div');
        cardGroup.classList.add('card', 'h-100', 'bg-opacity-10');

        const groupTitle = document.createElement('h5');
        groupTitle.classList.add('card-header', 'bg-opacity-25');
        switch(groupKey) {
            case 'main':
                groupTitle.textContent = "Mazo Principal";
                break;
            case 'side':
                groupTitle.textContent = "Side";
                break;
            case 'maybe':
                groupTitle.textContent = "Candidatos";
                break;
        }
        col.appendChild(groupTitle);

        // Lista de cartas
        const cardList = document.createElement('ul');
        cardList.classList.add('list-group', 'list-group-flush'); // Ver si dejar el flush

        cards.forEach(card => {
            const cardItem = document.createElement('li');
            cardItem.classList.add(
                'list-group-item', 
                'd-flex', 
                'justify-content-between', 
                'align-items-center', 
                'card-item', 
                'card-in-list');
            cardItem.dataset.faction = card.card_id__faction.join("");
            cardItem.dataset.art = card.card_art;

            cardItem.innerHTML = `
                <span class="me-2 fw-bold text-end number-copies">${card.quantity}</span>
                <span class="rarity-dot me-1" rarity-value="${card.card_id__rarity}"></span>
                <span class="card-name">${card.card_id__card_name}</span>
                <span class="ms-auto text-end card-cost">${card.card_id__cost}</span>
            `;
            cardList.appendChild(cardItem);
        });

        cardGroup.appendChild(groupTitle);
        cardGroup.appendChild(cardList);
        col.appendChild(cardGroup);
        container.appendChild(col);
    });

    container.appendChild(grid);
}

document.addEventListener('DOMContentLoaded', () => {
    const deckContainer = document.getElementById('card-list-container');
    const loadedDeck = JSON.parse(document.getElementById('loaded-deck').textContent || '{}');

    // Nos fijamos si el mazo tiene cartas antes de intentar renderizarlas
    if (loadedDeck && (loadedDeck.card_list.main.length > 0 || loadedDeck.card_list.side > 0 || loadedDeck.card_list.maybe.length > 0)) {
        renderCardGroups(loadedDeck.card_list, deckContainer);
    } else {
        deckContainer.innerHTML = '<p>Este mazo no contiene cartas.</p>';
    }
});