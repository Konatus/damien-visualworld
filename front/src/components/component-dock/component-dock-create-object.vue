<!--
    This component allows the creation of an object in the board, from the component dock.
    Ce component permet la création d'un objet dans le tableau, depuis le dock de composants.
-->
<script>
import app from "../../conf/app";
import Position from "../../utils/position";
import validateURL from "../../utils/validate-url";

import ObjectData from "../object-data/object-data";

import isEqual from "lodash.isequal";
import merge from "lodash.merge";

export default {
    name: "ComponentDockCreateObject",

    inject: ["$view"],

    data() {
        return {
            componentDockCreateObject_position: {},
            componentDockCreateObject_component: {},
            cacheObjectCenter: {},
            multiLag: 0,
        };
    },

    methods: {
        componentDockCreateObject_resetSelection() {
            this.$store.commit(`app/objectsInBoard/selectedPositionIds`, []);
            this.$store.commit(`app/objectsInBoard/selectedLinkIds`, []);
        },

        // Create an object if component-library is closed
        componentDockCreateObject_do(event) {
            if (!this.isComponentLibraryOpen) {
                this.componentDockCreateObject_doOpenDialog(event);
            }
        },

        // Create an object with its position inside displayed board at event position
        componentDockCreateObject_doOpenDialog(event) {
            try {
                // Transform a screen position into a board position
                const panzoom = this.$store.getters[`panzoom/panzoom`];
                const objectCenter = Position.eventToLayer(event, panzoom)[0]; // TODO: use full list in case of touch event
                this.componentDockCreateObject_position = {
                    center: this.doObjectCenter(objectCenter),
                    zIndex: 1 + this.$store.getters[`positionAlive/zIndexMax`],
                    componentId: event.dataset.componentId,
                };

                // Data of component
                this.componentDockCreateObject_component = this.$store.getters[
                    `componentAlive/byId`
                ](this.componentDockCreateObject_position.componentId);
                const schema = this.componentDockCreateObject_component.data
                    .schemaForm
                    ? JSON.parse(
                          this.componentDockCreateObject_component.data
                              .schemaForm
                      )
                    : {};

                // Ask for data, if necessary
                if (
                    schema &&
                    schema.list &&
                    schema.list.length > 0 &&
                    schema.list.some((field) => field?.options?.required) &&
                    !validateURL(event.input)
                ) {
                    this.$modal.show(
                        ObjectData,
                        {
                            isNew: true,
                            componentId:
                                this.componentDockCreateObject_position
                                    .componentId,
                            position: {
                                width: this.componentDockCreateObject_component
                                    .data.defaultWidth,
                                height: this.componentDockCreateObject_component
                                    .data.defaultHeight,
                            },
                            submitCallback: (dataProvidedByUser) => {
                                this.componentDockCreateObject_onSubmitDialog(
                                    dataProvidedByUser
                                );
                            },
                            displayCancel: true,
                        },
                        app.modal.parameters_object_data
                    );
                }

                // Else directly handles onSubmitDialog function
                else {
                    this.componentDockCreateObject_onSubmitDialog(event);
                }
            } catch {
                /* not catched */
            }
        },

        // Dispatch event to store
        componentDockCreateObject_onSubmitDialog(form = {}) {
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
            const componentId = form.componentId || form.dataset.componentId;
            const dataOfPosition = this.componentDockCreateObject_position;

            // Raw position
            const imageIndex = form.position.index || 0; // Offset on drag multiple images
            let width = form.position.width;
            let height = form.position.height;
            let top = dataOfPosition.center.top - height / 2 + imageIndex * 200;
            let left =
                dataOfPosition.center.left - width / 2 + imageIndex * 200;

            // Position must be inside board borders
            const boardSize = app.board.size;
            if (width > boardSize.width) {
                width = boardSize.width;
            }
            if (height > boardSize.height) {
                height = boardSize.height;
            }
            if (left < 0) {
                left = 0;
            }
            if (top < 0) {
                top = 0;
            }
            if (left + width > boardSize.width) {
                left = boardSize.width - width;
            }
            if (top + height > boardSize.height) {
                top = boardSize.height - height;
            }

            //  On create generic or standard object
            if (form.imgupload) form.data = { imgupload: [form.imgupload] };
            else if (form.description)
                form.data = { description: form.description };
            else if (form.input) form.data = { input: form.input };

            // Default values
            const defaultData =
                this.$store.getters[`componentAlive/defaultDataById`](
                    componentId
                );

            // Dispatch data to the store
            this.$store.dispatch(`positionAlive/create`, {
                worldId: this.$view.worldId,
                boardId: this.$view.boardId,
                data: [
                    {
                        componentId,
                        object: {
                            data: merge(defaultData, form.data),
                        },
                        data: {
                            width,
                            height,
                            top,
                            left,
                            rotation: 0,
                            zIndex: dataOfPosition.zIndex,
                        },
                    },
                ],
                isBackground:
                    this.$store.getters[
                        `app/objectsInBoard/activeLayerIsBackground`
                    ],
            });
        },
        doObjectCenter(objectCenter) {
            if (isEqual(this.cacheObjectCenter, objectCenter)) {
                this.multiLag++;
            } else {
                this.multiLag = 0;
            }
            this.cacheObjectCenter = objectCenter;

            return {
                left: objectCenter.left + this.multiLag * app.lagOffset,
                top: objectCenter.top + this.multiLag * app.lagOffset,
            };
        },
    },
};
</script>
