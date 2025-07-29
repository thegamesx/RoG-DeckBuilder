// Función común para comparar dos cartas segun sortBy
function compareCards(a, b, sortBy, order = "asc") {
  let aValue, bValue;
  switch (sortBy) {
    case 'cost':
      aValue = parseInt(a.getAttribute('data-converted-cost'));
      bValue = parseInt(b.getAttribute('data-converted-cost'));
      break;
    case 'faction':
      aValue = a.getAttribute('data-faction');
      bValue = b.getAttribute('data-faction');
      break;
    case 'name':
      aValue = a.getAttribute('data-card-name').toLowerCase();
      bValue = b.getAttribute('data-card-name').toLowerCase();
      break;
    case 'type':
      aValue = a.getAttribute('data-type');
      bValue = b.getAttribute('data-type');
      break;
    case 'rarity':
      aValue = parseInt(a.getAttribute('data-rarity'));
      bValue = parseInt(b.getAttribute('data-rarity'));
      break;
    default:
      return 0;
  }

  // Si son iguales, desempatar por nombre
  if (aValue === bValue) {
    const nameA = a.getAttribute('data-card-name').toLowerCase();
    const nameB = b.getAttribute('data-card-name').toLowerCase();
    return (order === "des" ? -1 : 1) * nameA.localeCompare(nameB);
  }

  // Comparación principal
  if (typeof aValue === "number" && typeof bValue === "number") {
    return (order === "des" ? -1 : 1) * (aValue - bValue);
  } else {
    return (order === "des" ? -1 : 1) * aValue.localeCompare(bValue);
  }
}
