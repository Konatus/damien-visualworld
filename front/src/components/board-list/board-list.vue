<template>
    <div v-if="worldId" :key="worldId" class="vw-absolute-0 vw-flex-col">
        <div id="board-list-header" class="vw-flex-row">
            <div class="vw-flex-payload vw-flex-col">
                <span id="board-list-world-team">
                    {{ world.data.team }}
                </span>
                <span id="board-list-world-name">
                    {{ world.data.name }}
                </span>
            </div>
            <el-button
                class="vw-link-color vw-link-filter board-list-dark-button"
                size="small"
                @click="onOpenWorldRootConfig"
                v-show-granted:root
            >
                <img
                    src="../../assets/icons/settings.svg"
                    :alt="$t('home.root_parameters')"
                />
                <span> {{ $t("home.root_parameters") }} </span>
            </el-button>
            <el-button
                class="vw-link-color vw-link-filter board-list-dark-button"
                size="small"
                @click="onOpenWorldParameters"
                v-show-granted:forOne="[
                    'world-alive/update',
                    'world-alive/demo',
                    { worldId },
                ]"
            >
                <img
                    src="../../assets/icons/settings.svg"
                    :alt="$t('home.parameters')"
                />
                <span> {{ $t("home.parameters") }} </span>
            </el-button>
            <el-button
                type="success"
                size="small"
                @click="onCreateBoard(worldId)"
                v-if="
                    $store.getters[`connectionMe/isGrantedFor`](
                        ['board-alive/create'],
                        { worldId }
                    )
                "
            >
                <i class="el-icon-plus"></i>
                <span> {{ $t("home.modal.create_board_title") }} </span>
            </el-button>
        </div>

        <div id="board-list-main" class="vw-flex-payload vw-flex-col">
            <div id="board-list-title">{{ $t("board.home_title") }}</div>

            <div div id="board-list-sort-and-search" class="vw-flex-row">
                <el-button-group>
                    <el-button
                        @click="sortByName"
                        class="vw-link-color"
                        size="mini"
                    >
                        {{ $t("board.sort_name") }}
                        <i v-if="sortName" class="el-icon-top" />
                        <i v-else class="el-icon-bottom" />
                    </el-button>
                    <el-button
                        @click="sortByDate"
                        class="vw-link-color"
                        size="mini"
                    >
                        {{ $t("board.sort_date") }}
                        <i v-if="sortDate" class="el-icon-top" />
                        <i v-else class="el-icon-bottom" />
                    </el-button>
                </el-button-group>
                <div id="board-list-search" class="vw-flex-row vw-flex-center">
                    <el-input
                        size="mini"
                        v-model="search"
                        placeholder="Rechercher un tableau"
                        prefix-icon="el-icon-search"
                        :clearable="true"
                    />
                    <el-tag
                        id="board-list-tag"
                        size="mini"
                        v-show="search.length"
                    >
                        {{ filteredBoards.length }} / {{ boards.length }}
                    </el-tag>
                    <div class="vw-flex-payload" />
                </div>
                <div class="vw-flex-payload" />
            </div>

            <div class="vw-flex-payload">
                <ol id="board-list" class="vw-absolute-0">
                    <router-link
                        tag="li"
                        class="board-list-item vw-link-color vw-flex-row vw-flex-center"
                        v-for="board of filteredBoards"
                        :key="board._id"
                        :to="{
                            name: 'objectsInBoard',
                            params: {
                                worldId: worldId,
                                boardId: board.boardId,
                            },
                        }"
                        v-show-granted:for="['board-alive/list', { ...board }]"
                    >
                        <span class="board-list-name">
                            {{ board.data.name }}
                        </span>
                        <span class="board-list-created">
                            {{ $t("board.creation_date") }}
                            {{ $d(new Date(board.private.createdAt), "long") }}
                        </span>

                        <el-dropdown
                            placement="right"
                            size="small"
                            trigger="click"
                        >
                            <el-button
                                class="vw-link-color"
                                size="mini"
                                type="info"
                                v-show-granted:forOne="[
                                    'board-alive/update',
                                    'board-alive/remove',
                                    'board-grant/update',
                                    { ...board },
                                ]"
                                @click.stop="/* avoid routing */"
                            >
                                <i class="el-icon-more"></i>
                            </el-button>

                            <el-dropdown-menu slot="dropdown">
                                <el-dropdown-item>
                                    <el-link
                                        class="btn-edit-board vw-link-color"
                                        @click="
                                            onEditBoard(worldId, board.boardId)
                                        "
                                        v-show-granted:forOne="[
                                            'user-alive/list',
                                            'user-alive/create',
                                            'user-alive/read',
                                            'user-alive/update',
                                            'user-alive/remove',
                                            'board-grant/list',
                                            'board-grant/create',
                                            'board-grant/update',
                                            'board-alive/list',
                                            { worldId, boardId: board.boardId },
                                        ]"
                                        :underline="false"
                                    >
                                        {{ $t("tooltips.home.manage_board") }}
                                    </el-link>
                                </el-dropdown-item>
                                <el-dropdown-item>
                                    <el-link
                                        class="btn-delete-board vw-link-color"
                                        @click="
                                            onDeleteBoard(
                                                worldId,
                                                board.boardId
                                            )
                                        "
                                        v-show-granted:for="[
                                            'board-alive/remove',
                                            { ...board },
                                        ]"
                                        :underline="false"
                                    >
                                        {{ $t("tooltips.home.delete_board") }}
                                    </el-link>
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </el-dropdown>
                    </router-link>
                </ol>
            </div>
        </div>
    </div>
</template>

<script>
import BoardData from "../board-data/board-data";
import BoardEdit from "../../views/board-edit";
import WorldEdit from "../../views/world-edit";
import WorldRootConfig from "../../views/world-root-config";
import app from "../../conf/app";
export default {
    name: "BoardList",

    inject: ["$view"],

    data() {
        return {
            search: "",
            sortName: true,
            sortDate: false,
        };
    },

    computed: {
        worldId() {
            return this.$store.getters[`app/worldsOfUniverse/worldId`];
        },
        world() {
            return this.$store.getters["worldAlive/byId"](this.worldId);
        },

        boards() {
            if (!this.worldId) {
                return undefined;
            }

            const boards = this.$store.getters["boardAlive/instanceByWorld"](
                this.worldId
            ).filter((item) => {
                return (
                    this.hasWorldGrant ||
                    Object.keys(this.profile.board).includes(item.boardId)
                );
            });
            return (
                boards.sort((a, b) => {
                    let nameA = a.data.name || a.boardId;
                    let nameB = b.data.name || b.boardId;

                    let dateA = new Date(a.private.createdAt) || 0;
                    let dateB = new Date(b.private.createdAt) || 0;

                    let sortName = this.sortName
                        ? nameA.localeCompare(nameB)
                        : nameB.localeCompare(nameA);
                    let sortDate = this.sortDate
                        ? dateB - dateA
                        : dateA - dateB;

                    if (this.sortName) {
                        return sortName;
                    }
                    if (this.sortDate) {
                        return sortDate;
                    }
                }) || []
            );
        },

        filteredBoards() {
            return this.boards.filter(
                (data) =>
                    !this.search ||
                    data.data.name
                        .toLowerCase()
                        .includes(this.search.toLowerCase())
            );
        },
        profile() {
            return this.$store.state["connectionMe"].user.profile;
        },
        hasWorldGrant() {
            return (
                ["modeler", "administrator", "demoAdministrator", "owner"].some(
                    (item) => this.profile.world[this.worldId][item]
                ) || this.$store.getters["connectionMe/isRoot"]()
            );
        },
    },

    methods: {
        onOpenWorldParameters: function () {
            this.$modal.show(
                WorldEdit,
                {
                    worldId: this.worldId,
                },
                app.modal.parameters_world_edit,
                {
                    "before-close": () => document.activeElement.blur(),
                }
            );
        },

        onOpenWorldRootConfig: function () {
            this.$modal.show(
                WorldRootConfig,
                {
                    worldId: this.worldId,
                },
                app.modal.parameters_world_edit
            );
        },

        onCreateBoard: function (worldId) {
            this.$store.commit("listenToAWorld", { worldId });
            this.$modal.show(
                BoardData,
                {
                    callback: (data) => {
                        this.$store.dispatch("boardAlive/create", {
                            worldId,
                            data,
                        });

                        if (
                            !this.hasWorldGrant &&
                            Object.values(this.profile.board).some(
                                (item) => item["animator"]
                            )
                        ) {
                            this.$router.go();
                        }
                    },
                },
                app.modal.parameters_modal_data
            );
        },

        onEditBoard: function (worldId, boardId) {
            this.$store.commit("listenToABoard", { worldId, boardId });
            this.$modal.show(
                BoardEdit,
                {
                    worldId: worldId,
                    boardId: boardId,
                },
                app.modal.parameters_world_edit,
                {
                    "before-close": () => document.activeElement.blur(),
                }
            );
        },

        onDeleteBoard: function (worldId, boardId) {
            this.$modal.show("dialog", {
                title: this.$t("home.modal.delete_board_title"),
                text: this.$t("home.modal.delete_board_content"),
                buttons: [
                    {
                        title: this.$t("modal.yes"),
                        handler: () => {
                            this.$store.dispatch("boardAlive/delete", {
                                worldId,
                                boardId,
                            });
                            this.$modal.hide("dialog");
                        },
                    },
                    {
                        title: this.$t("modal.no"),
                        default: true,
                    },
                ],
            });
        },

        sortByName() {
            this.sortDate = false;
            this.sortName = !this.sortName;
        },
        sortByDate() {
            this.sortName = false;
            this.sortDate = !this.sortDate;
        },
    },
};
</script>
<style>
#board-list-header {
    background: var(--style-color-main);
    padding: 25px 45px 25px 60px;
    align-items: center;
}

#board-list-header .el-button > span {
    display: flex;
    align-items: center;
}

#board-list-header .board-list-dark-button:hover {
    background: #fff;
}

#board-list-header img {
    padding-right: 8px;
    width: 12px;
}

#board-list-world-team {
    color: #6d7385;
    font-size: 16px;
}
#board-list-world-name {
    color: var(--style-color-white);
    font-size: 22px;
}

#board-list-main {
    padding: 45px 60px 0 45px;
}
#board-list-main > *:not(:last-child) {
    margin-bottom: 25px;
}
#board-list-title {
    font-size: 20px;
    font-weight: 700;
}
#board-list-sort-and-search > * {
    margin-right: 30px;
}
#board-list-search {
    width: 200px;
}
#board-list-tag {
    height: 18px;
    line-height: 16px;
    margin-left: 10px;
    border-radius: 9px;
    font-size: 11px;
    font-weight: 500;
}

#board-list {
    list-style: none;
    margin: 0;
    padding: 0;
    overflow: auto;
    column-gap: 0;
}
.board-list-item {
    border: 1px solid #dedee2;
    padding: 15px 20px;
    max-height: 20px;
    background: var(--style-color-white);
    break-inside: avoid-column;
}
.board-list-name,
.board-list-created {
    flex: 1;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    padding-right: 35px;
}
.board-list-name {
    font-size: 14px;
    font-weight: 700;
}
.board-list-created {
    color: #6d7385;
    font-size: 12px;
}

@media (min-width: 1300px) {
    #board-list {
        column-count: 2;
    }
}
</style>
