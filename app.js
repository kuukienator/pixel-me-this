(() => {
    const sizeSlider = document.getElementById('size');
    const paddingSlider = document.getElementById('padding');
    const styleDropdown = document.getElementById('style');
    const frame = document.querySelector('.frame');
    const image = document.getElementById('image');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const STORE = {
        currentPixels: null,
        currentOptions: {},
    };

    const AVERAGES_CACHE = {};

    const calculateColors2dArray = (dataArray, width) => {
        const pixels = [];
        const columnCount = width;
        let currentRow = [];
        const length = dataArray.length;

        for (let i = 0; i < length; i += 4) {
            currentRow.push([
                dataArray[i],
                dataArray[i + 1],
                dataArray[i + 2],
                dataArray[i + 3]
            ]);
            if (currentRow.length === columnCount) {
                pixels.push(currentRow);
                currentRow = [];
            }
        }

        return pixels;
    };

    const calculateAverageRGBSquared = rgbColors => {
        return rgbColors
            .reduce(
                (averageColor, currentColor) => {
                    for (let i = 0; i < currentColor.length; i++) {
                        averageColor[i] += Math.pow(currentColor[i], 2);
                    }
                    return averageColor;
                }, [0, 0, 0, 0]
            )
            .map(value => Math.sqrt(value / rgbColors.length));
    };

    const averageColors = (pixels, pixelSize) => {
        const rowsCount = pixels.length;
        const columnsCount = pixels[0].length;

        const scaledRows = rowsCount / pixelSize;
        const scaledColumns = columnsCount / pixelSize;

        const newRows = [];
        for (let row = 0; row <= scaledRows; row++) {
            const newColumns = [];
            for (let column = 0; column <= scaledColumns; column++) {
                let currentPixels = [];
                for (let i = 0; i < pixelSize / 2; i++) {
                    for (let j = 0; j < pixelSize / 2; j++) {
                        const currentRow = pixels[row * pixelSize + i];
                        if (currentRow) {
                            const currentColumn =
                                currentRow[column * pixelSize + j];
                            if (currentColumn) {
                                currentPixels.push(currentColumn);
                            }
                        }
                    }
                }

                newColumns.push(calculateAverageRGBSquared(currentPixels));
            }

            newRows.push(newColumns);
        }

        return newRows;
    };

    const loadImageByUrl = url => {
        image.src = url;
        image.crossOrigin = 'Anonymous';
        image.onload = imageOnloadCallback.bind(null, image, canvas, ctx);

        if (image.complete || image.complete === undefined) {
            image.src =
                'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
            image.src = url;
        }
    };

    const imageOnloadCallback = (image, canvas, ctx) => {
        const width = image.naturalWidth;
        const height = image.naturalHeight;
        const src = image.src;
        // const pixelSize = 4 * (window.devicePixelRatio * 2);
        const pixelSize = 4;
        const padding = 0;
        const addPixelVariation = false;
        const style = '3';

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(image, 0, 0);
        const imageData = ctx.getImageData(0, 0,  width,  height);
        STORE.currentPixels = calculateColors2dArray(imageData.data, width);
        STORE.currentOptions = Object.assign({}, STORE.currentOptions, { width, height, pixelSize, padding, addPixelVariation, ctx, src, style });
        update(STORE.currentOptions);
    };

    const updateCache = (key, size, averaged) => {
        const cacheEntry = AVERAGES_CACHE[key] || {};
        cacheEntry[size] = averaged;
        AVERAGES_CACHE[key] = cacheEntry;
        STORE.currentOptions.averaged = averaged;
    };

    const getAverage = (key, size) => {
        const cacheEntry = AVERAGES_CACHE[key] || {};
        return cacheEntry[size] || null;
    };

    const update = (options) => {
        const currentPixels = STORE.currentPixels;
        const averaged = averageColors(currentPixels, options.pixelSize);
        updateCache(options.src, options.pixelSize, averaged);
        render(Object.assign({}, options, { averaged }));
        // setInterval(() => render(Object.assign({}, options, { averaged })), 300);
    };

    const render = ({ ctx, averaged, width, height, pixelSize, padding, addPixelVariation, style }) => {
        switch (style) {
            case "1":
                renderCirclePixels(
                    ctx,
                    averaged,
                    width,
                    height,
                    pixelSize,
                    padding,
                    addPixelVariation
                );
            return;

            case "2":
                renderSquarePixels(
                    ctx,
                    averaged,
                    width,
                    height,
                    pixelSize,
                    padding,
                    addPixelVariation
                );
                break;

            case "3":
                renderCirclePixels(
                    ctx,
                    averaged,
                    width,
                    height,
                    pixelSize,
                    padding,
                    true
                );
                break;

            default:
                renderCirclePixels(
                    ctx,
                    averaged,
                    width,
                    height,
                    pixelSize,
                    padding,
                    addPixelVariation
                );
        }
    };

    const getRandomNumber = (min, max) => {
        return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1)) + Math.ceil(min);
    };

    const getRandomPixelVariation = pixelSize => getRandomNumber(0.25 * pixelSize, 2 * pixelSize);

    const renderSquarePixels = (
        ctx,
        pixels,
        w,
        h,
        pixelSize,
        padding,
        addPixelVariation
    ) => {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, w, h);

        const rows = pixels.length;
        for (let row = 0; row < rows; row++) {
            const currentRowLength = pixels[row].length;
            for (let column = 0; column < currentRowLength; column++) {
                const _pixelSize = addPixelVariation ?
                    pixelSize + getRandomPixelVariation(pixelSize) :
                    pixelSize;

                ctx.fillStyle = `rgba(${pixels[row][column].join(',')})`;
                ctx.fillRect(
                    column * pixelSize + padding,
                    row * pixelSize + padding,
                    _pixelSize - padding,
                    _pixelSize - padding
                );
            }
        }
    };

    const renderCirclePixels = (
        ctx,
        pixels,
        w,
        h,
        pixelSize,
        padding,
        addPixelVariation
    ) => {
        console.log('w', w);
        console.log('h', h);
        console.log('pixelSize', pixelSize);
        console.log('pixels', pixels.length);
        ctx.fillStyle = 'white';
        ctx.clearRect(0, 0, w, h);

        const rows = pixels.length;
        for (let row = 0; row < rows; row++) {
            const currentRowLength = pixels[row].length;
            for (let column = 0; column < currentRowLength; column++) {
                const _pixelSize = addPixelVariation ?
                    pixelSize + getRandomPixelVariation(pixelSize) :
                    pixelSize;

                ctx.beginPath();
                ctx.fillStyle = `rgba(${pixels[row][column].join(',')})`;
                ctx.arc(
                    // column * pixelSize - pixelSize / 2 + padding,
                    (column * pixelSize) - (pixelSize / 2) + padding,
                    // row * pixelSize - pixelSize / 2 + padding,
                    (row * pixelSize) - (pixelSize / 2) + padding,
                    // (row * pixelSize),
                    _pixelSize / 2 - padding,
                    0,
                    360
                );

                ctx.fill();
            }
        }
    };


    sizeSlider.addEventListener('change', function () {
        console.log('chnage', this.value, Number(this.value), typeof this.value)
        const pixelSize = Number(this.value);

        const averaged = averageColors(STORE.currentPixels, pixelSize);
        STORE.currentOptions = Object.assign({}, STORE.currentOptions, { pixelSize, averaged });
        render(STORE.currentOptions);
        return;

        // const pixelSize = this.value * (window.devicePixelRatio * 2);
        // const averaged = getAverage(STORE.currentOptions.src, pixelSize) || averageColors(STORE.currentPixels, pixelSize);
        // const currentPixels = STORE.currentPixels;
        // const averaged = averageColors(currentPixels, pixelSize);
        // updateCache(STORE.currentOptions.src, pixelSize, averaged);
        const options = Object.assign({}, STORE.currentOptions, { pixelSize, averaged });
        STORE.currentOptions = options;
        render(options);
    });

    paddingSlider.addEventListener('change', function () {
        const padding = Number(this.value);
        const options = Object.assign({}, STORE.currentOptions, { padding });
        STORE.currentOptions = options;
        render(options);
    });

    styleDropdown.addEventListener('change', function () {
        const style = this.value;
        const options = Object.assign({}, STORE.currentOptions, { style });
        STORE.currentOptions = options;
        render(options);
    });

    frame.addEventListener('click', () => {
        document.body.classList.toggle('split-diagonal');
    });

    const IMAGES = [
        // 'https://images.unsplash.com/photo-1565602088565-bdae818513aa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1024&q=80',
        // 'https://images.unsplash.com/photo-1544450537-e6282c1110b2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1024&q=80',
        'https://images.unsplash.com/photo-1511902467434-4677a533a674?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=512&q=80'
    ];

    loadImageByUrl( `${IMAGES[getRandomNumber(0, IMAGES.length - 1)]}`);
})();