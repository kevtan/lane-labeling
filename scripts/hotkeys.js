window.onkeydown = e => {
    switch (e.key) {
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
        case 'z':
            state.lane.type = 'd';
            break;
        case 'Z':
            state.lane.type = 's';
            break;
        case 'x':
            state.lane.type = 'r';
            break;
        case 'w':
            state.lane.color = 'w';
            break;
        case 'W':
            state.lane.color = 'y';
            break;
        case 'r':
            setImageNo(getImageNo() + 1);
            break;
        case 'R':
            setImageNo(getImageNo() - 1);
            break;
        case 'e':
            input_canvas.freeDrawingBrush.width++;
            break;
        case 'E':
            if (input_canvas.freeDrawingBrush.width > 2)
                input_canvas.freeDrawingBrush.width--;
            break;
        case 'a':
            setInputMode('Rectangle');
            break;
        case 's':
            setInputMode('Polygon');
            break;
        case 'S':
            const points = fcircles2cmatrix(input.data);
            const rrect = cv.minAreaRect(points);
            const frect = crect2frect(rrect);
            input_canvas.add(frect);
            input.type = "Rectangle";
            input.data = frect;
            break;
        case 'd':
            setInputMode('Green Line');
            break;
        case 'D':
            setInputMode('Red Line');
            break;
        case 'f':
            setInputMode('Pan');
            break;
        case 'F':
            input_canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
            break;
        case 'c':
            if (input.type == "Rectangle") input.data.set({
                selectable: false,
                hoverCursor: "crosshair"
            });
            computeGrabcut();
            break;
        case 'C':
            satisfied();
            break;
    }
};