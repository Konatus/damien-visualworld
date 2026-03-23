<template>
    <pattern-board v-if="board">
        <template #default>
            <board-2d />
        </template>
        <template #side-start>
            <btn-mode
                v-if-granted:forOne="[
                    'position-alive/create-front',
                    'position-alive/create-back',
                    'position-alive/update-front',
                    'position-alive/update-back',
                    'position-alive/resize-front',
                    'position-alive/resize-back',
                    $view,
                ]"
            />
            <el-divider />
            <btn-dock
                v-if-granted:forOne="[
                    'position-alive/create-front',
                    'position-alive/create-back',
                    $view,
                ]"
            />
            <el-divider />
            <btn-library
                v-if-granted:forAll="[
                    'board-alive/list-template',
                    'position-alive/create-front',
                    'position-alive/create-back',
                    $view,
                ]"
            >
                <img
                    src="../assets/icons/component-library.svg"
                    :alt="$t('icon.components')"
                />
            </btn-library>
            <btn-layer
                v-if-granted:for="['position-alive/create-back', $view]"
            />
            <el-divider />
            <btn-konatus />
        </template>
        <template #drawer>
            <component-dock
                v-if="$store.getters['app/objectsInBoard/drawerIsComponent']"
            />
            <user-dock
                v-else-if="$store.getters['app/objectsInBoard/drawerIsUser']"
            />
            <drawing-dock
                v-else-if="$store.getters['app/objectsInBoard/modeIsDrawing']"
            />
        </template>
        <template #side-end>
            <btn-root />
            <btn-connection-all />
            <btn-connection-me />
        </template>
        <template #head-start>
            <div class="vw-card vw-flex-row">
                <btn-breadcrumb />
                <el-divider
                    direction="vertical"
                    v-if-granted:forOne="[
                        'position-alive/update-front',
                        'position-alive/update-back',
                        $view,
                    ]"
                />
                <btn-board-option
                    v-if-granted:forOne="[
                        'position-alive/update-front',
                        'position-alive/update-back',
                        $view,
                    ]"
                />
            </div>
            <btn-undo-redo
                class="vw-card"
                v-if-granted:forOne="[
                    'position-alive/update-front',
                    'position-alive/update-back',
                    $view,
                ]"
            />
            <btn-board-template class="vw-card" />
        </template>
        <template #head-middle>
            <btn-buy-world
                v-show-granted:demo
                :size="'medium'"
                class="buy-world"
            />
        </template>
        <template #head-end>
            <btn-zoom class="vw-card" />
            <btn-jira class="vw-card" />
            <btn-search class="vw-card" />
        </template>
        <!--template #foot-start>
            tt
        </template-->
        <template #foot-end>
            <btn-info />
        </template>
    </pattern-board>
</template>
<script>
import Board2d from "../components/board-2d/board-2d.vue";
import BtnBoardOption from "../components/btn-board-option/btn-board-option.vue";
import BtnBreadcrumb from "../components/btn-breadcrumb/btn-breadcrumb.vue";
import BtnBuyWorld from "../components/btn-buy-world/btn-buy-world.vue";
import BtnConnectionAll from "../components/btn-connection-all/btn-connection-all.vue";
import BtnConnectionMe from "../components/btn-connection-me/btn-connection-me.vue";
import BtnDock from "../components/btn-dock/btn-dock.vue";
import BtnInfo from "../components/btn-info/btn-info.vue";
import BtnJira from "../components/btn-jira/btn-jira.vue";
import BtnKonatus from "../components/btn-konatus/btn-konatus.vue";
import BtnLayer from "../components/btn-layer/btn-layer.vue";
import BtnLibrary from "../components/btn-library/btn-library.vue";
import BtnMode from "../components/btn-mode/btn-mode.vue";
import BtnRoot from "../components/btn-root/btn-root.vue";
import BtnSearch from "../components/btn-search/btn-search.vue";
import BtnUndoRedo from "../components/btn-undo-redo/btn-undo-redo.vue";
import BtnBoardTemplate from "../components/btn-board-template/btn-board-template.vue";
import BtnZoom from "../components/btn-zoom/btn-zoom.vue";
import DrawingDock from "../components/drawing-dock/drawing-dock.vue";
import ComponentDock from "../components/component-dock/component-dock.vue";
import PatternBoard from "../components/pattern-board/pattern-board.vue";
import UserDock from "../components/user-dock/user-dock.vue";

export default {
    name: "ObjectsInBoard",

    components: {
        Board2d,
        BtnBreadcrumb,
        BtnBuyWorld,
        BtnBoardOption,
        BtnConnectionAll,
        BtnConnectionMe,
        BtnDock,
        BtnInfo,
        BtnJira,
        BtnKonatus,
        BtnLayer,
        BtnLibrary,
        BtnMode,
        BtnRoot,
        BtnSearch,
        BtnUndoRedo,
        BtnBoardTemplate,
        BtnZoom,
        ComponentDock,
        DrawingDock,
        PatternBoard,
        UserDock,
    },

    props: {
        worldId: String,
        boardId: String,
    },

    // Descendant-provided properties of the view
    provide() {
        return {
            $view: this.$view,
        };
    },
    data() {
        return {
            watchStoredBoardList: null,
            drawerComponentDock: false,
            drawerUserDock: false,
        };
    },
    computed: {
        $view() {
            return {
                name: this.$options.name,
                worldId: this.worldId,
                boardId: this.boardId,
            };
        },
        islibrariesOfUniverseOpen() {
            return this.$store.getters[`app/librariesOfUniverse/activeTab`];
        },
        libraries() {
            return this.$store.getters[
                `app/librariesOfUniverse/activeTabOptions`
            ];
        },
        demoAdministrator() {
            return this.$store.getters[`connectionMe/isDemoAdministrator`](
                this.$view
            );
        },
        drawerOpen() {
            return !this.$store.getters["app/objectsInBoard/drawerIsNone"];
        },
        createObjectByClick() {
            return this.$store.getters[
                `app/librariesOfUniverse/createObjectByClick`
            ];
        },
        board() {
            return this.$store.getters["boardAlive/asArray"].length;
        },
    },
    methods: {
        onMouseDown() {
            if (this.drawerOpen && !this.createObjectByClick) {
                this.$store.commit("app/objectsInBoard/setDrawerNone");
            }
        },
    },
    created() {
        // Redirect to not-found page if board does not exist
        // TODO: why is that check not in a common watch?
        this.watchStoredBoardList = this.$store.watch(
            () => this.$store.getters["boardAlive/asArray"],
            (boardList) => {
                if (
                    boardList.filter((x) => x.boardId == this.boardId)
                        .length === 0
                ) {
                    this.$router.push({
                        name: "notFound",
                        params: { value: "board" },
                    });
                }
                this.watchStoredBoardList();
            }
        );
        document.addEventListener("mousedown", this.onMouseDown);
        document.addEventListener("touchstart", this.onMouseDown);
    },
    destroyed() {
        this.watchStoredBoardList();
        document.removeEventListener("mousedown", this.onMouseDown);
        document.removeEventListener("touchstart", this.onMouseDown);
    },
};
</script>
