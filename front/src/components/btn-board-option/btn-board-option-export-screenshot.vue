<script>
const PAPER_FORMAT = "a4"; // TODO: move to config?
const PAPER_UNIT = "mm";
const PAPER_FORMATS = {
    a2: {
        height: 594,
        width: 420,
    },
    a3: {
        height: 420,
        width: 297,
    },
    a4: {
        height: 297,
        width: 210,
    },
};
let jsPDF; // Will be lazily loaded
let domToImage; // Will be lazily loaded
import BlobDownload from "../../utils/blob-download";
export default {
    name: "BtnBoardOptionExportScreenshot",
    render() {
        return null;
    },

    inject: ["$view"],

    data() {
        return {
            btnBoardOptionExportScreenshot_usedAreaCache: null,
        };
    },

    computed: {
        btnBoardOptionExportScreenshot_filename() {
            return `${this.$store.getters["boardAlive/nameById"](
                this.$view.boardId
            )}`;
        },
        btnBoardOptionExportScreenshot_usedArea() {
            const positions = this.$store.getters["positionAlive/asArray"];
            const xMin = Math.min(
                ...positions.map((position) => position.data.left)
            );
            const xMax = Math.max(
                ...positions.map(
                    (position) => position.data.left + position.data.width
                )
            );
            const yMin = Math.min(
                ...positions.map((position) => position.data.top)
            );
            const yMax = Math.max(
                ...positions.map(
                    (position) => position.data.top + position.data.height
                )
            );
            const zMin = Math.min(
                ...positions.map((position) => position.data.zIndex)
            );
            return {
                left: xMin,
                right: xMax,
                width: xMax - xMin,
                top: yMin,
                bottom: yMax,
                height: yMax - yMin,
                under: zMin,
            };
        },
    },
    watch: {
        btnBoardOptionExportScreenshot_usedArea(value) {
            if (value.width > 0 && value.height > 0) {
                this.btnBoardOptionExportScreenshot_usedAreaCache = value;
            }
        },
    },

    methods: {
        async btnBoardOptionExportScreenshot_pdf() {
            if (!jsPDF) {
                jsPDF = (await import("jspdf")).jsPDF;
            }
            if (!domToImage) {
                domToImage = (await import("dom-to-image")).default;
            }

            return this.btnBoardOptionExportScreenshot_do(
                (dom, { scale, width, height }) => {
                    // Canvas & paper size
                    const paperSize = PAPER_FORMATS[PAPER_FORMAT];

                    // Effective layout
                    const isPortrait =
                        height > width && paperSize.height > paperSize.width;
                    let imageWidth;
                    let imageHeight;
                    let marginWidth = 0;
                    let marginHeight = 0;
                    if (isPortrait) {
                        if (
                            paperSize.height /
                                paperSize.width /
                                (height / width) <
                            1
                        ) {
                            // Portrait plus allongé que le papier
                            imageHeight = paperSize.height;
                            imageWidth = (paperSize.height * width) / height;
                            marginWidth = (paperSize.width - imageWidth) / 2;
                        } else {
                            // Portrait moins allongé que le papier
                            imageWidth = paperSize.width;
                            imageHeight = (paperSize.width * height) / width;
                            marginHeight = (paperSize.height - imageHeight) / 2;
                        }
                    } else {
                        if (
                            paperSize.width /
                                paperSize.height /
                                (height / width) <
                            1
                        ) {
                            // Paysage moins allongé que le papier
                            imageHeight = paperSize.width;
                            imageWidth = (paperSize.width * width) / height;
                            marginWidth = (paperSize.height - imageWidth) / 2;
                        } else {
                            // Paysage plus allongé que le papier
                            imageWidth = paperSize.height;
                            imageHeight = (paperSize.height * height) / width;
                            marginHeight = (paperSize.width - imageHeight) / 2;
                        }
                    }

                    return new Promise((resolve) => {
                        domToImage
                            .toJpeg(dom, { scale, width, height, quality: 0.9 })
                            .then((dataUrl) => {
                                const pdf = new jsPDF({
                                    unit: PAPER_UNIT,
                                    format: PAPER_FORMAT,
                                    orientation: isPortrait
                                        ? "portrait"
                                        : "landscape",
                                });
                                pdf.addImage(
                                    dataUrl,
                                    "JPG",
                                    marginWidth,
                                    marginHeight,
                                    imageWidth,
                                    imageHeight
                                );
                                pdf.setProperties({
                                    title: this.$store.getters[
                                        "boardAlive/nameById"
                                    ](this.$view.boardId),
                                    subject:
                                        this.$store.getters["boardAlive/byId"](
                                            this.$view.boardId
                                        )?.data?.description || "",
                                    author: `${this.$store.state.connectionMe?.user?.identity?.firstname} ${this.$store.state.connectionMe?.user?.identity?.lastname} (${this.$store.state.connectionMe?.user?.identity?.email})`,
                                    keywords: this.$route.fullPath,
                                    creator: "Visual World",
                                });
                                pdf.save(
                                    `${this.btnBoardOptionExportScreenshot_filename}.pdf`
                                );
                                resolve();
                            });
                    });
                }
            );
        },
        async btnBoardOptionExportScreenshot_png() {
            if (!domToImage) {
                domToImage = (await import("dom-to-image")).default;
            }
            return this.btnBoardOptionExportScreenshot_do(
                (dom, { scale, width, height }) => {
                    return domToImage
                        .toBlob(dom, { scale, width, height })
                        .then((blob) => {
                            BlobDownload(
                                `${this.btnBoardOptionExportScreenshot_filename}.png`,
                                blob
                            );
                        });
                }
            );
        },
        async btnBoardOptionExportScreenshot_blob() {
            if (!domToImage) {
                domToImage = (await import("dom-to-image")).default;
            }
            return new Promise((resolve /* reject */) => {
                this.btnBoardOptionExportScreenshot_do(
                    (dom, { scale, width, height }) => {
                        return domToImage
                            .toBlob(dom, { scale, width, height })
                            .then((blob) => {
                                resolve(blob);
                            });
                    },
                    1000 /* px */
                );
            });
        },
        async btnBoardOptionExportScreenshot_64() {
            if (!domToImage) {
                domToImage = (await import("dom-to-image")).default;
            }
            return Promise.race([
                new Promise((_, reject) => {
                    setTimeout(
                        reject,
                        10000,
                        new Error(
                            JSON.stringify({
                                err: "sreenshot has reached timeout",
                            })
                        )
                    );
                }),
                new Promise((resolve /* reject */) => {
                    this.btnBoardOptionExportScreenshot_do(
                        (dom, { scale, width, height }) => {
                            return domToImage
                                .toPng(dom, { scale, width, height })
                                .then((dataUrl) => {
                                    resolve(dataUrl);
                                });
                        },
                        250 /* px, width of pictures in template-library */,
                        false
                    );
                }),
            ]);
        },
        btnBoardOptionExportScreenshot_do(
            callback,
            maxWidth,
            withSpinner = true
        ) {
            // maxWidth may be set to a small value in order to fastly generate a thumbnail of the board
            // In localhost CORS prevents images from loading during screenshot
            if (withSpinner) {
                this.$store.commit("overlay/spinner", true);
            }
            this.$store.commit(`app/objectsInBoard/event`, "resetSelection");

            // Wait next tick, when the selection is reset
            this.$nextTick(() => {
                const area = this.btnBoardOptionExportScreenshot_usedAreaCache;
                const scale = maxWidth ? maxWidth / area.width : 1;

                // Save canvas as img
                const canvasesOnCopy = document.querySelectorAll(
                    "#panzoom-scene canvas"
                );
                const canvasesAsImg = [];
                for (let canvas of canvasesOnCopy) {
                    canvasesAsImg.push(canvas.toDataURL());
                }

                // Copy the panzoom-scene and reset zoom
                const scene = document
                    .querySelector("#panzoom-scene")
                    .cloneNode(true);
                scene.innerHTML = scene.innerHTML.replace(/%26/g, "&");
                scene.style.transform = `matrix( 1, 0, 0, 1, 0, 0 )`;
                scene.style.transformOrigin = "top left";
                scene.style.width = `${area.right}px`;
                scene.style.height = `${area.bottom}px`;

                // Move to the payload area
                const board = scene.querySelector("#board-2d");
                board.style.position = "absolute";
                board.style.top = `${-area.top}px`;
                board.style.left = `${-area.left}px`;

                // Remove undesired CSS
                board.style.boxShadow = "unset";
                board.style.borderWidth = 0;
                board.style.borderRadius = 0;

                // Replace pasted canvas by img
                let id = 0;
                const canvasesOnPaste = scene.querySelectorAll("canvas");
                for (let canvas of canvasesOnPaste) {
                    const img = document.createElement("img");
                    img.src = canvasesAsImg[id];
                    canvas.replaceWith(img);
                    id++;
                }

                document.body.prepend(scene);
                return callback(scene, {
                    scale,
                    width: area.width,
                    height: area.height,
                })
                    .catch(() => {
                        alert(`An unexpected error occured`);
                    })
                    .finally(() => {
                        scene.remove();
                        if (withSpinner) {
                            this.$store.commit("overlay/spinner", false);
                        }
                    });
            });
        },
    },
};
</script>
