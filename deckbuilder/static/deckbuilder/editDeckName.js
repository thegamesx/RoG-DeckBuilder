const title = document.getElementById("deck-name-title");
let isEditing = false;

title.addEventListener("click", () => {
    if (!isEditing) {
        title.contentEditable = true;
        isEditing = true;
        title.classList.add("editing-title");

        if (title.textContent === "Sin nombre") {
        title.textContent = ""; // Limpia el texto si es "Sin nombre"
        }
        title.focus();

        // Seleccionar todo el texto al hacer clic
        const range = document.createRange();
        range.selectNodeContents(title);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }
});

// Al presionar Enter o al salir del foco, se deja de editar
title.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault(); // Evita salto de línea
    title.blur();
  }
});

title.addEventListener("blur", () => {
  title.contentEditable = false;
  isEditing = false;
  title.classList.remove("editing-title");

  if (title.textContent.trim() === "") {
    title.textContent = "Sin nombre"; // Si está vacío, vuelve a "Sin nombre"
  }
});