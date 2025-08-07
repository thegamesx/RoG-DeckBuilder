// Función común para comparar dos cartas segun sortBy
function compareCards(aValue, aName, bValue, bName, order = "asc") {
  // Si son iguales, desempatar por nombre
  if (aValue === bValue) {
    return order === "des"
    ? bName.localeCompare(aName)
    : aName.localeCompare(bName);
  }

  // Comparación principal
  if (typeof aValue === "number" && typeof bValue === "number") {
    return (order === "des" ? -1 : 1) * (aValue - bValue);
  } else {
    return (order === "des" ? -1 : 1) * aValue.localeCompare(bValue);
  }
}

// Extrae el atributo relevante
function getAttributeCardList(card, sortBy) {
  switch (sortBy) {
    case 'cost':
      return parseInt(card.getAttribute('data-converted-cost'));
    case 'faction':
      return card.getAttribute('data-faction');
    case 'name':
      return card.getAttribute('data-card-name').toLowerCase();
    case 'type':
      return card.getAttribute('data-type');
    case 'rarity':
      return parseInt(card.getAttribute('data-rarity'));
    default:
      return null;
  }
}

function getAttributeCardArray(card, sortBy) {
  switch (sortBy) {
    case 'cost':
      return parseInt(card.card_id__converted_cost);
    case 'faction':
      return card.card_id__faction[0];
    case 'name':
      return card.card_id__card_name.toLowerCase();
    case 'type':
      return card.card_id__card_type;
    case 'rarity':
      return parseInt(card.card_id__rarity);
    default:
      return null;
  }
}