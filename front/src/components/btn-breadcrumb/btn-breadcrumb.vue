<template>
    <el-menu
        id="btn-breadcrumb"
        class="btn-breadcrumb vw-link-color"
        mode="horizontal"
    >
        <el-submenu
            id="submenu-world"
            popper-class="submenu-world vw-card"
            index="1"
        >
            <template slot="title">
                <div id="title" v-if="title">{{ title }}</div>
                <div id="home-name" v-else>
                    <span id="world-name"> {{ currentWorldName }} </span>
                    <span id="board-name"> {{ currentBoardName }} </span>
                </div>
            </template>

            <div index="1-2">
                <el-collapse
                    id="list-world"
                    accordion
                    v-model="worldId"
                    @change="getBoardList"
                >
                    <el-collapse-item
                        v-for="world of worlds"
                        :key="world._id"
                        :name="world.worldId"
                        class="vw-link-color"
                    >
                        <template slot="title">
                            <span class="world-list-name">
                                {{ world.data.name }}
                            </span>
                        </template>
                        <div
                            v-for="board of boardsOfCurrentWorld"
                            :key="board.boardId"
                            class="board-list"
                            :class="
                                board.boardId == $view.boardId
                                    ? 'activeBoard'
                                    : null
                            "
                        >
                            <router-link
                                :to="{ name: 'objectsInBoard', params: board }"
                                class="vw-link-color vw-link-filter btn-breadcrumb-board-link"
                            >
                                <img
                                    src="../../assets/icons/board.svg"
                                    :alt="$t('icon.board')"
                                />
                                <span class="btn-breadcrumb-board-name">
                                    {{ board.data.name }}
                                </span>
                            </router-link>
                        </div>
                    </el-collapse-item>
                </el-collapse>
            </div>
        </el-submenu>
    </el-menu>
</template>
<script>
import jsonDeepCopy from "../../utils/json-deep-copy";
export default {
    name: "BtnBreadcrumb",

    props: {
        title: String,
    },
    inject: ["$view"],

    data() {
        return {
            worldId: this.$view.worldId,
        };
    },

    computed: {
        currentWorldName() {
            try {
                return this.$store.getters["worldAlive/byId"](
                    this.$view.worldId
                ).data.name;
            } catch (e) {
                return this.$view.worldId;
            }
        },

        currentBoardName() {
            try {
                return this.$store.getters["boardAlive/byId"](
                    this.$view.boardId
                ).data.name;
            } catch (e) {
                return this.$view.boardId;
            }
        },

        boardsOfCurrentWorld() {
            const worldId = this.worldId || this.$view.worldId;
            try {
                const boards =
                    this.$store.getters["boardAlive/instanceByWorld"](worldId);
                boards.sort((a, b) => a.data.name.localeCompare(b.data.name));
                return boards;
            } catch (e) {
                return [];
            }
        },

        worlds() {
            try {
                const worlds = jsonDeepCopy(
                    this.$store.getters["worldAlive/asSortedArray"]
                );
                const index = worlds.findIndex(
                    (world) => world._id === this.$view.worldId
                );
                if (index > 0) worlds.unshift(...worlds.splice(index, 1));
                return worlds;
            } catch (e) {
                return [];
            }
        },
    },

    methods: {
        getBoardList(worldId) {
            this.worldId = worldId;
            this.$store.commit("listenToAWorldBoards", { worldId });
        },
    },
};
</script>
<style>
.btn-breadcrumb {
    border: none !important;
}

.submenu-world {
    width: 252px;
    max-height: calc(100% - 76px);
    overflow-y: auto;
    margin-top: 8px;
    margin-left: 0;
}

.submenu-world > .el-menu--popup-bottom-start {
    margin-top: 0px;
    padding-top: 0px;
}

.submenu-world .el-collapse-item__wrap {
    padding-bottom: 10px;
}

.el-menu--horizontal > .el-submenu {
    float: revert;
}

.submenu-option-menu {
    width: 270px;
    max-height: 80vh;
    overflow-y: auto;
}

.submenu-option {
    width: 220px;
}

.submenu-option .el-menu-item,
.submenu-option .el-submenu__title {
    font-size: 14px;
}

.submenu-option .el-submenu__title {
    margin: 0 3px;
}

.el-collapse {
    border-top: 0px;
}
</style>
<style scoped>
#btn-breadcrumb-wrapper {
    padding: 3px;
    border-radius: var(--style-border-radius);
    overflow: hidden;
}

#btn-breadcrumb {
    display: flex;
}

#submenu-world {
    min-width: 200px;
}

#submenu-world >>> .el-submenu__title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 14px;
    padding-right: 7px;
}

#home-name {
    display: flex;
    flex-direction: column;
    min-width: 100px;
}

#home-name span {
    line-height: 20px;
}

#title {
    font-weight: 700;
    font-size: 13px;
    line-height: 13px;
}

#world-name {
    color: #6d7385;
    font-size: 11px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 165px;
}

#board-name {
    font-weight: 700;
    font-size: 13px;
    color: var(--color-main-font);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 165px;
}

#list-world {
    border: none;
}

#list-world .activeBoard {
    background: #f1f1f4;
}

#list-world >>> .el-collapse-item__arrow {
    margin: 0px;
}

#list-world >>> .el-collapse-item__header {
    display: flex;
    justify-content: space-around;
}

#list-world >>> .el-collapse-item__header .world-list-name {
    color: var(--color-main-font);
    font-weight: 700;
    font-size: 14px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    height: 45px;
    width: 170px;
}

#list-world >>> .el-collapse-item:last-child .el-collapse-item__header {
    border: none;
}

#list-world >>> .el-collapse-item__content {
    padding-bottom: 0px;
}

#list-world >>> .el-collapse-item__content a {
    color: inherit;
    display: flex;
    align-items: center;
    padding: 7px 5px;
}

#list-world >>> .el-collapse-item__content a img {
    margin-right: 10px;
}

#list-world >>> .el-collapse-item__content div {
    margin: 5px 5px 5px 30px;
}

#list-world .el-collapse-item:last-child >>> .el-collapse-item__wrap {
    border-bottom: none;
}

.btn-breadcrumb-board-link {
    text-decoration: none;
}
.btn-breadcrumb-board-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    height: 25px;
    width: 190px;
}
</style>
