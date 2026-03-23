const imageSize = (file) => {
    const reader = new FileReader();
    const img = new Image();

    return new Promise(function (resolved /* rejected */) {
        reader.readAsDataURL(file);
        reader.onload = (evt) => {
            img.src = evt.target.result;
            img.onload = () => {
                resolved({ width: img.width, height: img.height });
            };
        };
    });
};
export default imageSize;
