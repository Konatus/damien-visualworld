<script>
import imageSize from "../../utils/img-size";
import Position from "../../utils/position";
import Url from "../../conf/url";
import validateURL from "../../utils/validate-url";
import app from "../../conf/app";
import html from "../../utils/html";

const MARGIN = 4; // Margin between objects
const MAXROWS = 20;
const MAXCELLS = 20;

export default {
    name: "BoardLayerUpload",
    inject: ["$view"],
    data() {
        return {
            boardLayerUpload_positionOnPaste: {},
        };
    },
    mounted() {
        document.addEventListener("paste", this.boardLayerUpload_onPaste);
        document.addEventListener("copy", this.boardLayerUpload_onCopy);
    },
    destroyed() {
        document.removeEventListener("paste", this.boardLayerUpload_onPaste);
        document.removeEventListener("copy", this.boardLayerUpload_onCopy);
    },
    methods: {
        boardLayerUpload_onMove(evt) {
            this.boardLayerUpload_positionOnPaste = {
                pageX: evt.pageX,
                pageY: evt.pageY,
                isBoard: evt.target.id == "selection-by-drag",
            };
        },
        boardLayerUpload_onCopy(evt) {
            try {
                let setInClipboard;
                const target = evt.target || evt.srcElement;
                if (this.boardLayerSelect_activeLayer === this.$attrs.id) {
                    if (
                        this.selectedPositionIds.length &&
                        (target.nodeName == "BODY" ||
                            target.id === "selection-by-drag")
                    ) {
                        // Filter selected positions & get object data
                        const selectedPositions = this.positions.filter(
                            (position) =>
                                this.selectedPositionIds.includes(
                                    position.positionId
                                )
                        );
                        selectedPositions.forEach((position) => {
                            position.objectData =
                                this.$store.getters["object/byId"](
                                    position.objectId
                                ) || {}; // Associate object data with position
                        });

                        // Set list of positions selected in the clipboard
                        setInClipboard = JSON.stringify(selectedPositions);
                        navigator.clipboard.writeText(setInClipboard);
                    }
                }
                this.$store.dispatch(
                    `root/log`,
                    `boardLayerUpload_onCopy RETURN id='${this.$attrs.id}', target.nodeName='${target.nodeName}', target.id='${target.id}', this.selectedPositionIds.length=${this.selectedPositionIds?.length}, setInClipboard='${setInClipboard}'`
                );
            } catch (e) {
                this.$store.dispatch(
                    `root/log`,
                    `boardLayerUpload_onCopy CATCH catch='${JSON.stringify(e)}'`
                );
            }
        },
        boardLayerUpload_onPaste(evt) {
            const target = evt.target || evt.srcElement;
            if (
                this.boardLayerSelect_activeLayer !== this.$attrs.id ||
                html.interactable(evt.target || evt.srcElement)
            ) {
                this.$store.dispatch(
                    `root/log`,
                    `boardLayerUpload_onPaste START_RETURN, id='${
                        this.$attrs.id
                    }', target.dompath='${JSON.stringify(
                        html.domPath(target)
                    )}' `
                );
                return;
            }

            // set current mouse position in board
            evt = Object.assign(evt, this.boardLayerUpload_positionOnPaste);

            //  Paste positions (copied from Visual World)
            const clipboardText = evt.clipboardData.getData("text");
            try {
                let clipboardJson = JSON.parse(clipboardText);
                if (Array.isArray(clipboardJson)) {
                    evt.preventDefault();
                    const data = clipboardJson.filter(
                        (x) => x.worldId == this.$view.worldId
                    );

                    const panzoom = this.$store.getters[`panzoom/panzoom`];
                    const center = this.doObjectCenter(
                        Position.eventToLayer(evt, panzoom)[0]
                    );

                    this.$store.commit(`app/objectsInBoard/event`, {
                        name: "objectToolbarDuplication",
                        data,
                        center,
                    });

                    this.$store.dispatch(
                        `root/log`,
                        `boardLayerUpload_onPaste POSITIONS_RETURN payload='${JSON.stringify(
                            { data, center }
                        )}'`
                    );
                    return;
                }
            } catch (e) {
                this.$store.dispatch(
                    `root/log`,
                    `boardLayerUpload_onPaste POSITIONS_CATCH catch='${e}' `
                );
                if (!(e instanceof SyntaxError)) return;
            }

            // Paste Excel
            const clipboardHtml = evt.clipboardData.getData("text/html");
            if (clipboardHtml.indexOf("content=Excel") >= 0) {
                // Avoid pasting positions data in fields
                this.boardLayerUpload_doCreateXLSX(clipboardHtml, evt);
                this.$store.dispatch(
                    `root/log`,
                    `boardLayerUpload_onPaste EXCEL_RETURN `
                );
                return;
            }

            // Paste plain-text, image or uri
            if (this.boardLayerUpload_positionOnPaste.isBoard) {
                this.boardLayerUpload_onDrop(evt);
                this.$store.dispatch(
                    `root/log`,
                    `boardLayerUpload_onPaste DROP_RETURN `
                );
                return;
            }
        },
        boardLayerUpload_onDrop(evt) {
            const data = evt.dataTransfer || evt.clipboardData;
            const textUri =
                data.getData("text/uri-list") || data.getData("text/plain");
            if (data.types.includes("Files")) {
                this.$store.dispatch(
                    `root/log`,
                    `boardLayerUpload_onDrop FILES`
                );

                const files = Object.values(data.files);
                this.boardLayerUpload_doCreateImage(
                    files.filter((file) => file.type.indexOf("image/") >= 0),
                    evt
                );

                files
                    .filter((file) => file.type == "text/plain")
                    .forEach((file) => {
                        const reader = new FileReader();
                        reader.onload = () => {
                            evt.textWrap = reader.result;
                            this.boardLayerUpload_doCreateObject(evt);
                        };
                        reader.onerror = function () {
                            this.$store.dispatch(
                                `root/log`,
                                `boardLayerUpload_onDrop READER_ONERROR reader.error.code=${reader.error.code}`
                            );
                        };
                        reader.readAsText(file);
                    });
            } else if (/\.(jpe?g|png|gif)$/i.test(textUri)) {
                this.$store.dispatch(
                    `root/log`,
                    `boardLayerUpload_onDrop JPG_PNG_GIF`
                );
                fetch(textUri)
                    .then((res) => res.blob())
                    .then((blob) =>
                        this.boardLayerUpload_doCreateImage([blob], evt)
                    );
            } else if (data.types.includes("text/plain")) {
                this.$store.dispatch(
                    `root/log`,
                    `boardLayerUpload_onDrop TEXT_PLAIN`
                );
                this.boardLayerUpload_doCreateObject(evt);
            }
        },

        boardLayerUpload_doCreateObject(evt) {
            const text =
                (evt.clipboardData && evt.clipboardData.getData("text")) ||
                (evt.dataTransfer && evt.dataTransfer.getData("text")) ||
                evt.textWrap;
            // Set undefined value to componentId if default object
            evt.dataset = { componentId: undefined };
            // Else set generate component id
            const dataUrl = {
                input: text,
                dataset: {
                    componentId: app.visualWorldComponent.VW_url_model,
                },
            };

            evt.position = {
                width: validateURL(text)
                    ? app.defaultComponent.data.urldefaultWidth
                    : app.defaultComponent.data.defaultWidth,
                height: validateURL(text)
                    ? app.defaultComponent.data.urlDefaultHeight
                    : app.defaultComponent.data.defaultHeight,
            };
            if (validateURL(text)) {
                Object.assign(evt, dataUrl);
            } else {
                evt.description = text;
            }

            this.componentDockCreateObject_doOpenDialog(evt);
        },
        boardLayerUpload_doCreateImage(files, evt) {
            const tooBigImages = files.filter(
                (file) => file.size > app.maxUploadSize
            );
            tooBigImages.forEach(async (file) => {
                this.$store.commit("alert/add", {
                    type: "warning",
                    title: file.name,
                    description: this.$t(`object_data.upload_is_too_large`, {
                        fileSize:
                            Math.ceil((file.size / 1024 / 1024) * 100) / 100,
                        maxUploadSize: Math.floor(
                            app.maxUploadSize / 1024 / 1024
                        ),
                    }),
                });
            });

            const smallEnoughImages = files.filter(
                (file) => file.size <= app.maxUploadSize
            );
            smallEnoughImages.forEach(async (file, index) => {
                // Get picture size
                file.position = { ...(await imageSize(file)), index };

                const key = Date.now() + index;
                const worldId = this.$view.worldId;

                let formData = new FormData();
                formData.append("file", file);

                let xhr = new XMLHttpRequest();
                xhr.open("POST", Url.img({ worldId, key }), true);
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        //file.cachedUrl = JSON.parse(xhr.response).filename
                    }
                };
                xhr.onload = () => {
                    evt.imgupload = {
                        key: key,
                        fileName: file.name,
                        cachedUrl: file.cachedUrl,
                        lastModified: file.lastModifiedDate,
                        size: file.size,
                        percent: 100,
                        status: "success",
                    };
                    evt.position = { ...file.position };
                    evt.dataset = {
                        componentId: app.visualWorldComponent.VW_img_model,
                    };
                    this.componentDockCreateObject_doOpenDialog(evt);
                };
                xhr.send(formData);
            });
        },
        boardLayerUpload_doCreateXLSX(files, evt) {
            if (
                !this.$store.getters[`connectionMe/isGrantedForOne`](
                    [
                        "position-alive/create-front",
                        "position-alive/create-back",
                    ],
                    this.$view
                )
            ) {
                return;
            }
            const xlsxDocument = document.createElement("html");
            xlsxDocument.innerHTML = files;
            const table = xlsxDocument.lastElementChild.firstElementChild;

            const panzoom = this.$store.getters[`panzoom/panzoom`];
            const boardSize = app.board.size;

            const width = app.defaultComponent.data.defaultWidth;
            const height = app.defaultComponent.data.defaultHeight;

            let truncate = false;
            let rows = table.rows;
            let positions = [];
            let cells;
            const scale = {
                x: 0,
                y: 0,
            };

            const { pageX, pageY, isBoard } =
                this.boardLayerUpload_positionOnPaste;
            if (!isBoard) return;

            // Iterate over rows
            for (let i = 0; i < rows.length; i++) {
                if (rows.length > MAXROWS) truncate = true;
                cells = rows[i].cells;

                // Iterate over cells
                for (let j = 0; j < cells.length; j++) {
                    if (cells.length > MAXCELLS) truncate = true;
                    const content = cells[j].textContent;

                    if (content.trim().length) {
                        // Only create position with content
                        evt.pageX =
                            pageX + (width + MARGIN) * panzoom.scale * j;
                        evt.pageY =
                            pageY + (height + MARGIN) * panzoom.scale * i;

                        let { left, top } = Position.eventToLayer(
                            evt,
                            panzoom
                        )[0]; // TODO: use full list in case of touch event

                        if (!i && !j) {
                            // Create all the positions inside the board
                            const cellsLen =
                                cells.length <= MAXCELLS
                                    ? cells.length
                                    : MAXCELLS;
                            const rowsLen =
                                rows.length <= MAXROWS ? rows.length : MAXROWS;

                            scale.x =
                                (width + MARGIN) * cellsLen + left >
                                boardSize.width
                                    ? (width + MARGIN) * cellsLen +
                                      left -
                                      boardSize.width
                                    : 0;
                            scale.y =
                                (height + MARGIN) * rowsLen + top >
                                boardSize.height
                                    ? (height + MARGIN) * rowsLen +
                                      top -
                                      boardSize.height
                                    : 0;
                        }
                        left = left - scale.x;
                        top = top - scale.y;

                        // Limit the number of positions created
                        if (i < MAXROWS && j < MAXCELLS) {
                            positions.push({
                                componentId: undefined,
                                object: { data: { description: content } },
                                data: {
                                    width,
                                    height,
                                    top,
                                    left,
                                    zIndex:
                                        1 +
                                        this.$store.getters[
                                            `positionAlive/zIndexMax`
                                        ],
                                },
                            });
                        }
                    }
                }
            }

            this.$store.dispatch(`positionAlive/create`, {
                worldId: this.$view.worldId,
                boardId: this.$view.boardId,
                data: positions,
                isBackground:
                    this.$store.getters[
                        `app/objectsInBoard/activeLayerIsBackground`
                    ],
            });

            this.$store.commit("overlay/spinner", true);
            if (truncate) {
                this.$store.commit("alert/add", {
                    type: "warning",
                    title: this.$t("alert.xlsx.truncate.title"),
                    description: this.$t("alert.xlsx.truncate.description", {
                        MAXROWS,
                        MAXCELLS,
                    }),
                });
            }
        },
    },
};
</script>
