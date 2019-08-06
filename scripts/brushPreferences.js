const brushWidth = document.getElementById('brushWidth');

brushWidth.onchange = event => state.input_canvas.freeDrawingBrush.width = parseInt(event.target.value);