// Convierte un numero a romano
function toRoman(num) {
  if (isNaN(num) || num <= 0) return num;
  const lookup = {
    M:1000, CM:900, D:500, CD:400,
    C:100, XC:90, L:50, XL:40,
    X:10, IX:9, V:5, IV:4, I:1
  };
  let roman = '';
  for (let i in lookup) {
    while (num >= lookup[i]) {
      roman += i;
      num -= lookup[i];
    }
  }
  return roman;
}

// Convierte el coste de una carta a iconos visuales
function renderCardCost(costStr, useRoman = false) {
  console.log(costStr, useRoman)
  if (!costStr) return '';

  // Extraemos número al principio (coste genérico)
  const match = costStr.match(/^(\d*)([A-Z]*)$/);
  if (!match) return costStr;

  const [, numberPart, factionPart] = match;
  let html = '';

  if (numberPart) {
    const displayNumber = useRoman ? toRoman(parseInt(numberPart)) : numberPart
    html += `<span class="generic-cost">${displayNumber}</span>`;
  }

  for (const letter of factionPart) {
    html += `<img src="${SEAL_BASE_PATH}${letter}.webp" alt="${letter}" class="faction-icon">`;
  }

  return html;
}

document.addEventListener("DOMContentLoaded", () => {
    const costDiv = document.getElementById("card-cost");
    console.log(costDiv)
    costDiv.innerHTML = renderCardCost(costDiv.innerHTML, useRoman = true);
});