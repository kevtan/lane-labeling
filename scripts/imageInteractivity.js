const toggleImageInteractivity = _ => {
    if (state.image_object)
        state.image_object.selectable = !state.image_object.selectable;
    else
        console.log('state.image_object not yet initialized!');
}