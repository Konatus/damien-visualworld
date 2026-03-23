<!--
    This component represents a position allowing to place an object on a board.
    Ce component représente une position permettant de placer un objet sur un tableau.

    cf: https://github.com/SortableJS/sortablejs#options for draggable options
-->
<template>
    <nav class="vw-flex-payload vw-flex-col">
        <!-- Default component -->
        <vue-draggable
            id="component-dock-default"
            :key="key + '_note'"
            handle=".component-summary"
            ghost=".component-preview"
            :disabled="componentLibraryIsOpen"
            :forceFallback="!componentLibraryIsOpen"
            @drag="componentDockCreateObject_resetSelection"
            @drop="componentDockCreateObject_do"
            v-if="
                componentLibraryIsOpen ||
                (!componentLibraryIsOpen && displayDefaultModel)
            "
        >
            <component-icon
                size="small"
                :scaleOfGhost="scale"
                :staticData="{}"
                :key="defaultComponentId"
                :data-component-id="defaultComponentId"
                :componentId="defaultComponentId"
                :class="
                    !displayDefaultModel
                        ? 'component-icon-visibility_off '
                        : 'component-icon-visibility'
                "
            >
                <span
                    v-if="componentLibraryIsOpen && displayDefaultModel"
                    @click="onDisplayDefaultModelChange(false)"
                    class="material-icons-outlined btn-display-defaultModel"
                >
                    visibility
                </span>
                <span
                    v-if="componentLibraryIsOpen && !displayDefaultModel"
                    @click="onDisplayDefaultModelChange(true)"
                    class="material-icons-outlined btn-display-defaultModel"
                >
                    visibility_off
                </span>
            </component-icon>
            <span
                v-if="
                    (componentsOfBoard.length != 0 && displayDefaultModel) ||
                    (componentsOfBoard.length != 0 && componentLibraryIsOpen)
                "
                class="dock-separator"
            ></span>
        </vue-draggable>

        <!-- Favorite components of the board -->
        <vue-draggable
            id="component-dock"
            class="vw-flex-payload"
            handle=".component-summary"
            ghost=".component-preview"
            :class="[componentLibraryIsOpen ? 'component-dock-library' : null]"
            :key="key"
            :group="{
                name: 'component',
                pull: !componentLibraryIsOpen,
                put: componentLibraryIsOpen,
            }"
            :sort="componentLibraryIsOpen"
            :forceFallback="!componentLibraryIsOpen"
            :fallbackTolerance="5"
            @drag="componentDockCreateObject_resetSelection"
            @drop="componentDockCreateObject_do"
            @sort="componentDockSort_do"
        >
            <template
                v-if="
                    (!componentLibraryIsOpen &&
                        componentsOfBoard.length == 0 &&
                        !displayDefaultModel) ||
                    componentsOfBoard.length != 0
                "
            >
                <component-icon
                    ref="component-dock-item"
                    size="small"
                    v-for="componentOfBoard of componentsOfBoard"
                    :key="componentOfBoard.componentId"
                    :data-component-id="componentOfBoard.componentId"
                    :componentId="componentOfBoard.componentId"
                    :scaleOfGhost="scale"
                    :staticData="{}"
                />
            </template>
            <btn-library
                v-if-granted:forAll="[
                    'board-alive/list-template',
                    'position-alive/create-front',
                    'position-alive/create-back',
                    $view,
                ]"
            >
                {{ $t("library.component.add_remove") }}
            </btn-library>
        </vue-draggable>
    </nav>
</template>
<script>
import app from "../../conf/app.js";
import ComponentDockCreateObject from "./component-dock-create-object";
import ComponentDockSort from "./component-dock-sort";
import ComponentIcon from "../component-icon/component-icon";
import VueDraggable from "../../lib/vue-draggable";
import BtnLibrary from "../btn-library/btn-library.vue";
export default {
    name: "ComponentDock",

    mixins: [ComponentDockCreateObject, ComponentDockSort],

    components: {
        VueDraggable,
        ComponentIcon,
        BtnLibrary,
    },

    inject: ["$view"],

    computed: {
        defaultComponentId() {
            return app.visualWorldComponent.VW_default;
        },

        componentLibraryIsOpen() {
            return false;
            // Sort & drag-n-drop from library are deactivated
            // try{
            //     return this.$store.getters[ `app/librariesOfUniverse/activeTabIsComponent` ]
            // } catch( e ){
            //     return false
            // }
        },

        // Which layer is being edited ?
        // Returns "foreground" or "background"
        activeLayer() {
            return this.$store.getters[`app/objectsInBoard/activeLayer`];
        },

        // Components displayed in the dock
        // nb: displays all components of the world if component-dock doesnt exist
        componentsOfBoard() {
            this.$emit("edit-dock-position");
            const isBackground =
                this.$store.getters[
                    `app/objectsInBoard/activeLayerIsBackground`
                ];
            let boardComponents = this.$store.getters[`boardComponent/byLayer`](
                { isBackground }
            );

            if (boardComponents) {
                boardComponents.forEach((boardComponent) => {
                    boardComponent.name = this.$store.getters[
                        "componentAlive/nameById"
                    ](boardComponent.componentId);
                });
                boardComponents.sort((a, b) => {
                    const nameA = a.name || a.componentId;
                    const nameB = b.name || b.componentId;
                    return nameA.localeCompare(nameB);
                });
            }
            return boardComponents;
        },

        // Scale of the board is necessary to scale the ghost
        scale() {
            try {
                return this.$store.getters[`panzoom/scale`];
            } catch (e) {
                return 1;
            }
        },

        // Refresh dock:
        // - on component-library opening or closing > refresh class & ghost design
        // - on componentsOfBoard change > remove the node created on drop by vdr
        key() {
            return `${JSON.stringify(this.componentsOfBoard)}-${
                this.componentLibraryIsOpen
            }}`;
        },

        displayDefaultModel() {
            return true;
            // Display management of default model is deactivated
            // return this.$store.getters[ 'boardAlive/byId' ]( this.$view.boardId )?.data?.displayDefaultModel
        },
    },

    methods: {
        onDisplayDefaultModelChange(value) {
            this.$store.dispatch("boardAlive/update", {
                worldId: this.$view.worldId,
                boardId: this.$view.boardId,
                data: { displayDefaultModel: value },
                reply: true,
            });
        },
    },
};
</script>
<style scoped>
#component-dock {
    overflow-x: hidden;
    padding: 0px 0px 6px 0px;
}

#component-dock,
#component-dock-default {
    position: relative;
    z-index: var(--dock-z-index);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    user-select: none;
    border-radius: 0px;
    box-shadow: none;
}
#component-dock.component-dock-library:before {
    opacity: 1;
}
#component-dock > li {
    list-style-type: none;
}

#component-dock >>> .component-icon:last-child {
    margin-bottom: 6px;
}

#component-dock-default >>> .component-icon div.component-summary,
#component-dock >>> .component-icon div.component-summary {
    display: flex;
    flex-direction: row-reverse;
    align-items: center;
    margin: 2px 4px 2px 4px;
    padding: 6px 4px;

    /* drag from component-library */
    /* border: none; */
    height: unset;
}
#component-dock-default >>> .component-summary-name,
#component-dock >>> .component-summary-name {
    text-shadow: 0 0 3px white;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    text-overflow: ellipsis;
    margin-left: 6px;
    width: 150px;
    line-height: 1.3;
}
#component-dock-default >>> .component-preview,
#component-dock >>> .component-preview {
    display: none !important; /* Will be overrided by style of component-dock-drag */
}

.component-remove,
.btn-display-defaultModel {
    position: relative;
    top: -40px;
    right: 0;
    height: 0;
    padding: 0;
}

.btn-display-defaultModel {
    font-size: 14px;
}

.btn-display-defaultModel:hover {
    cursor: pointer;
}

.component-icon-visibility_off .btn-display-defaultModel {
    color: #ed6181;
}
.component-icon-visibility .btn-display-defaultModel {
    color: var(--style-color-lightblue);
}

#component-dock.component-dock-library,
#component-dock.default-component-dock {
    z-index: var(--dock-z-index);
}
#component-dock >>> .component-summary,
#component-dock-default >>> .component-summary {
    border: 1px solid transparent;
}
#component-dock >>> .component-icon:hover .component-summary-name,
#component-dock-default >>> .component-icon:hover .component-summary-name {
    color: var(--style-color-lightblue);
}
#component-dock >>> .component-icon:hover .component-summary,
#component-dock-default >>> .component-icon:hover .component-summary {
    box-shadow: 0px 0px 2px 1px var(--style-color-lightblue);
}

.dock-separator {
    background: var(--style-color-lightgrey);
    height: 1px;
    padding: 0px 5px;
    box-sizing: border-box;
    width: 100%;
    margin-bottom: 4px;
}
/* Fallback */
.sortable-fallback >>> .component-summary-name,
.sortable-fallback >>> .component-summary {
    display: none;
}
.sortable-fallback >>> .component-preview {
    display: block;
}
.sortable-fallback >>> input,
.sortable-fallback >>> textarea {
    opacity: 0;
}

nav {
    display: flex;
    position: relative;
}
nav div {
    margin: 0;
    padding: 0;
}
nav > div:first-of-type {
    border-radius: 5px 5px 0 0;
}
nav > div:last-of-type {
    border-radius: 0 0 5px 5px;
    box-shadow: none;
}
#component-dock > button {
    margin: 1px auto;
    background: #dfe1e7;
    border: inherit;
}
</style>
