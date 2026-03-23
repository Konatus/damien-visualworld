<template>
    <el-dropdown-item id="search-wrapper" v-if="results.length > 0">
        <div
            v-for="result of results"
            :key="result.objectId + 'search-a'"
            class="search-result"
            :class="{
                preventInsert:
                    preventInsert[result.objectId] || !grantedToAddObjects,
            }"
        >
            <template v-for="component of result.asComponent">
                <div
                    :key="component.componentId + 'search-a'"
                    class="search-result-object"
                >
                    <span class="search-result-title">
                        {{ $t("search_bar.template_name") }}
                    </span>
                    <div class="search-result-component">
                        <vue-draggable
                            :key="component.componentId"
                            handle=".component-summary"
                            ghost=".component-preview"
                            :sort="false"
                            :forceFallback="true"
                            :disabled="
                                preventInsert[result.objectId] ||
                                !grantedToAddObjects
                            "
                            @drag="onDrag"
                            @drop="onDrop"
                        >
                            <component-icon
                                size="large"
                                :key="component.componentId"
                                :componentId="component.componentId"
                                :staticData="result.data"
                                :scaleOfGhost="scale"
                                :data-component-id="component.componentId"
                                :data-object-id="result.objectId"
                            />
                        </vue-draggable>
                        <span class="component-summary-name">
                            <!-- TODO: remove if name may be displayed with component-icon -->
                            {{
                                component.componentName ||
                                $t("library.component.default_model")
                            }}
                        </span>
                    </div>
                </div>

                <div
                    :key="component.componentId + 'search-b'"
                    class="search-result-board"
                >
                    <span
                        class="search-result-title"
                        v-if="result.context.length < 2"
                    >
                        {{ $t("search_bar.board_name_singular") }}
                    </span>
                    <span class="search-result-title" v-else>
                        {{ $t("search_bar.board_name_plural") }}
                    </span>
                    <div class="board-names">
                        <span
                            class="board-name-values"
                            v-for="board of component.board"
                            :key="board.boardId"
                            >{{ board.boardName }}</span
                        >
                    </div>
                </div>

                <div
                    :key="component.componentId + 'search-c'"
                    class="search-result-content"
                >
                    <div
                        v-for="(value, name) of result.display"
                        :key="value.id"
                        class="search-result-data"
                    >
                        <span class="search-result-title"> {{ name }}</span>
                        <span class="search-result-data-content">
                            {{ value.before
                            }}<span class="highlight">{{ value.search }}</span
                            >{{ value.after }}
                        </span>
                    </div>
                </div>
            </template>
        </div>
    </el-dropdown-item>
</template>
<script>
// Components
import ComponentIcon from "../component-icon/component-icon";

import Position from "../../utils/position";
import VueDraggable from "../../lib/vue-draggable";
import app from "../../conf/app";

export default {
    name: "BtnSearchResults",

    props: {
        search: String,
        refresh: Number,
    },
    inject: ["$view"],

    components: {
        ComponentIcon,
        VueDraggable,
    },

    watch: {
        search() {
            this.doSearch();
        },
        refresh() {
            this.doSearch();
        },
    },

    computed: {
        worldId() {
            return this.$view.worldId || null;
        },
        boardId() {
            return this.$view.boardId || null;
        },
        scale() {
            try {
                return this.$store.getters[`panzoom/scale`];
            } catch (e) {
                return 1;
            }
        },
        positions() {
            return this.$store.getters[`positionAlive/asArray`] || null;
        },
        results() {
            let results = this.$store.getters["objectSearch/asArray"] || [];

            if (results.length) {
                for (let result of results) {
                    /* Get part of the content with the search */
                    for (let data in result.data) {
                        if (typeof result.data[data] === "string") {
                            /* index of the search in the content */
                            let index = result.data[data]
                                .toLowerCase()
                                .indexOf(this.search.toLowerCase());
                            if (index >= 0) {
                                if (!result.display) {
                                    result.display = {};
                                }
                                /* Get some chars before the search and some after */
                                /* Numbers of chars is set with app.searchBar.lengthContent ( app.js ) */
                                let searchLength = this.search.length;
                                if (index <= app.searchBar.lengthContent) {
                                    result.display[data] = {
                                        before: result.data[data].slice(
                                            0,
                                            index
                                        ),
                                        search: result.data[data].slice(
                                            index,
                                            index + searchLength
                                        ),
                                        after: result.data[data].slice(
                                            index + searchLength,
                                            index +
                                                searchLength +
                                                app.searchBar.lengthContent
                                        ),
                                    };
                                } else {
                                    result.display[data] = {
                                        before: result.data[data].slice(
                                            index - app.searchBar.lengthContent,
                                            index
                                        ),
                                        search: result.data[data].slice(
                                            index,
                                            index + searchLength
                                        ),
                                        after: result.data[data].slice(
                                            index + searchLength,
                                            index +
                                                searchLength +
                                                app.searchBar.lengthContent
                                        ),
                                    };
                                }
                            }
                        }
                    }

                    result.asComponent = {};
                    for (let context of result.context) {
                        if (!result.asComponent[context.componentId]) {
                            result.asComponent[context.componentId] = {
                                componentId: context.componentId,
                                board: [],
                            };

                            const component = this.$store.getters[
                                "componentAlive/byId"
                            ](context.componentId);
                            if (
                                component &&
                                component.data &&
                                component.data.name
                            ) {
                                result.asComponent[
                                    context.componentId
                                ].componentName = component.data.name;
                            }
                        }

                        const board = this.$store.getters["boardAlive/byId"](
                            context.boardId
                        );
                        if (board && board.data && board.data.name) {
                            context.boardName = board.data.name;
                        }
                        result.asComponent[context.componentId].board.push({
                            boardId: context.boardId,
                            boardName: context.boardName,
                        });
                    }
                }
            }
            return results;
        },
        preventInsert() {
            const objectIdInCurrentBoard = this.positions.map((x) => [
                x.objectId,
                true,
            ]);
            return Object.fromEntries(objectIdInCurrentBoard);
        },
        grantedToAddObjects() {
            try {
                return (
                    this.$store.getters["connectionMe/isRoot"]() ||
                    this.$store.getters["connectionMe/hasProfile"](
                        "owner",
                        this.$view
                    ) ||
                    this.$store.getters["connectionMe/hasProfile"](
                        "administrator",
                        this.$view
                    ) ||
                    this.$store.getters["connectionMe/hasProfile"](
                        "modeler",
                        this.$view
                    )
                );
            } catch (e) {
                return false;
            }
        },
    },

    methods: {
        doSearch() {
            const searchIsLongEnough =
                this.search && this.search.length > app.searchBar.lengthSearch;
            if (searchIsLongEnough) {
                this.$store.dispatch("objectSearch/search", {
                    worldId: this.worldId,
                    boardId: this.boardId,
                    search: this.search,
                });
            } else {
                this.$store.commit("objectSearch/reset");
            }
            return searchIsLongEnough;
        },
        onDrag() {
            this.$store.commit(`app/objectsInBoard/selectedPositionIds`, []);
            this.$store.commit(`app/objectsInBoard/selectedLinkIds`, []);
        },
        onDrop(event) {
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
            // Needed ids for position insertion
            const objectId = event.dataset.objectId;
            const componentId = event.dataset.componentId;

            // Needed coordinates values for position insertion
            const panzoom = this.$store.getters[`panzoom/panzoom`];
            const objectCenter = Position.eventToLayer(event, panzoom)[0]; // TODO: use full list in case of touch event

            // Insert position on board
            this.$store.dispatch(`positionAlive/create`, {
                worldId: this.worldId,
                boardId: this.boardId,
                data: [
                    {
                        componentId,
                        objectId,
                        data: {
                            left: objectCenter.left - event.position.width / 2,
                            top: objectCenter.top - event.position.height / 2,
                            width: event.position.width,
                            height: event.position.height,
                            zIndex: this.$store.getters[
                                `positionAlive/zIndexMax`
                            ],
                        },
                    },
                ],
                isBackground:
                    this.$store.getters[
                        `app/objectsInBoard/activeLayerIsBackground`
                    ],
            });

            this.doSearch();
        },
    },
};
</script>

<style scoped>
#search-wrapper {
    background: #fff;
    max-height: 85vh;
    min-height: min-content;
    overflow-x: auto;
    border: 1px solid #ebeef5;
    cursor: initial;
    margin-top: 8px;
}

#search-wrapper:hover {
    background: #fff !important;
}

/* Hide design name inherited from component-icon */
#search-wrapper >>> .component-icon .component-summary-name {
    display: none;
}

/* Title of eaech category */
.search-result-title {
    font-size: 12px;
    color: #aeb1bb;
    font-weight: 700;
    word-wrap: break-word;
    line-height: initial;
    overflow: hidden;
    width: 80px;
    text-align: left;
    margin-right: 20px;
}

.search-result {
    background: var(--style-color-white);
    border-bottom: 2px solid #f1f1f4;
    padding: 20px;
}

.search-result >>> .component {
    opacity: 0;
    position: absolute;
}

.search-result > div {
    display: flex;
    align-items: center;
}

.search-result > .search-result-object,
.search-result > .search-result-board {
    margin-bottom: 20px;
}

.preventInsert {
    opacity: 0.4;
}
.preventInsert >>> .component-summary {
    cursor: auto;
}

/* Search-object content */

.component-summary-name {
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    text-overflow: ellipsis;
    line-height: 20px;
    font-size: 12px;
    font-weight: 700;
    margin-left: 10px;
}

.search-result-board .board-names,
.search-result-content .search-result-data-content {
    font-size: 12px;
    text-align: left;
    line-height: initial;
    width: 175px;
}

.search-result-component {
    width: 175px;
    display: flex;
    align-items: center;
}
.search-result-component >>> .component-preview {
    display: none;
}
.board-name-values {
    font-size: 12px;
}

.board-name-values + .board-name-values::before {
    content: ", ";
}

.search-result-content {
    display: flex;
    flex-direction: column;
    width: 100%;
}

.search-result-content > div:not(:last-child) {
    margin-bottom: 20px;
}

.search-result-content > div {
    display: flex;
    width: 100%;
    word-break: break-all;
    align-items: center;
}

.search-result-content .search-result-title {
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    text-overflow: ellipsis;
}

.search-result-content .highlight {
    background-color: rgba(110, 255, 255, 0.322);
}

/* Fallback */
.sortable-fallback >>> .component-summary-name,
.sortable-fallback >>> .component-summary {
    display: none;
}
.sortable-fallback >>> .component-preview {
    display: block;
}
</style>
