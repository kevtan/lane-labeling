window.onkeydown = e => {
    switch (e.key) {
        case 'ArrowRight':
            displayImage(state.image + 1);
            break;
        case 'ArrowLeft':
            displayImage(state.image - 1);
            break;
        case 'd':
        case 's':
        case 'r':
            state.lane.type = e.key;
            break;
        case 'w':
        case 'y':
            state.lane.color = e.key;
            break;
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
            state.lane.number = parseInt(e.key);
            break;
        case 'Enter':
            computeGrabcut();
            break;
    }
};