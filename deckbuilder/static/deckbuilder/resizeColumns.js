const resizer = document.getElementById('resizer');
const left = document.querySelector('.column-left');
const right = document.querySelector('.column-right');
const container = document.querySelector('.deckbuilder');

let isResizing = false;

resizer.addEventListener('mousedown', function (e) {
    isResizing = true;
    document.body.style.cursor = 'col-resize';
});

document.addEventListener('mousemove', function (e) {
    if (!isResizing) return;

    const containerRect = container.getBoundingClientRect();
    const offsetLeft = e.clientX - containerRect.left;

    const minLeft = 600;
    const minRight = 390;
    const totalWidth = containerRect.width;
    const resizerWidth = resizer.offsetWidth;

    if (offsetLeft < minLeft || totalWidth - offsetLeft < minRight) return;

    left.style.flex = 'none';
    left.style.width = `${offsetLeft - resizerWidth / 2}px`;

    right.style.flex = 'none';
    right.style.width = `${totalWidth - offsetLeft - resizerWidth / 2}px`;
});

document.addEventListener('mouseup', function () {
    isResizing = false;
    document.body.style.cursor = 'default';
});