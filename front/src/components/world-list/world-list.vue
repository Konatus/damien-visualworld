<template>
    <div class="vw-absolute-0 vw-flex-col">
        <div id="world-list-header">
            <div>
                <span id="world-list-title"> {{ $t("home.title") }} </span>
                <el-tag id="world-list-tag" size="mini" v-show="search.length">
                    {{ filteredWorlds.length }} / {{ worlds.length }}
                </el-tag>
            </div>
            <div id="world-list-search">
                <el-input
                    size="mini"
                    prefix-icon="el-icon-search"
                    v-model="search"
                    :placeholder="$t('home.search_in_world_list')"
                    :clearable="true"
                />
            </div>
        </div>
        <ol
            id="world-list"
            class="vw-flex-payload"
            v-if="filteredWorlds && filteredWorlds.length"
            v-show-granted:for="['world-alive/list']"
        >
            <li
                class="world-list-item vw-flex-center vw-link-filter vw-link-color"
                :class="{ 'world-list-item-focus': world._id == worldId }"
                v-for="world of filteredWorlds"
                :key="world._id"
                @click="onDisplayWorld(world.worldId)"
            >
                <div class="vw-flex-col">
                    <span class="world-list-team"> {{ world.data.team }} </span>
                    <span class="world-list-name"> {{ world.data.name }} </span>
                </div>
            </li>
        </ol>
        <btn-buy-world v-show-granted:demo :size="'small'" class="buy-world" />
        <div id="world-list-footer">
            <button
                class="vw-link-color"
                v-show-granted:for="['world-alive/create']"
                @click="onCreateWorld"
            >
                <i class="el-icon-plus"></i> {{ $t("home.add_world") }}
            </button>
            <button
                class="vw-link-color"
                v-show-granted:forAll="[
                    'world-trash/list',
                    'world-trash/restore',
                ]"
                @click="onRestoreWorld"
            >
                <i class="el-icon-delete"></i> {{ $t("home.restore_world") }}
            </button>
        </div>
    </div>
</template>

<script>
import isEqual from "lodash.isequal";
import app from "../../conf/app";
import WorldData from "../world-data/world-data";
import DeletedWorldsOfUniverse from "../../views/deleted-worlds-of-universe";
import BtnBuyWorld from "../../components/btn-buy-world/btn-buy-world.vue";
export default {
    name: "WorldList",
    data() {
        return {
            search: "",
        };
    },
    components: {
        BtnBuyWorld,
    },
    computed: {
        // Context is saved in store, in order to be "kept-alive" after several routing events
        worldId: {
            get() {
                return this.$store.getters[`app/worldsOfUniverse/worldId`];
            },
            set(value) {
                this.$store.commit(`app/worldsOfUniverse/worldId`, value);
            },
        },

        // Get world list from the store & filter them if search string is provided
        worlds() {
            return this.$store.getters["worldAlive/asSortedArray"];
        },
        filteredWorlds() {
            return this.worlds.filter(
                (world) =>
                    !this.search ||
                    (world.data.name &&
                        world.data.name.match(new RegExp(this.search, "i"))) ||
                    (world.data.description &&
                        world.data.description.match(
                            new RegExp(this.search, "i")
                        ))
            );
        },
    },
    watch: {
        filteredWorlds: {
            deep: true,
            handler(newV, oldV) {
                if (!isEqual(newV, oldV)) {
                    this.onDisplayDefaultWorld();
                }
            },
        },
    },
    created() {
        this.onDisplayDefaultWorld();
    },
    methods: {
        // Display the board list of a user chosen world
        onDisplayWorld(worldId) {
            this.worldId = worldId;
            this.$store.commit("listenToAWorld", { worldId });
        },

        // Display the board list of an arbitrary chosen world
        onDisplayDefaultWorld() {
            const worldIds = (this.filteredWorlds || []).map(
                (world) => world._id
            );
            if (!worldIds.length) {
                this.worldId = null;
            } else if (!this.worldId || !worldIds.includes(this.worldId)) {
                this.worldId = worldIds[0];
            }
            this.$store.commit("listenToAWorld", { worldId: this.worldId });
        },

        onCreateWorld() {
            this.$modal.show(
                WorldData,
                {
                    callback: () => {
                        // Refresh page, allows to reload connection-me with grants on that new world
                        // TODO: in API, refresh user-grant and dispatch new connection-me
                        this.$router.go();
                    },
                },
                app.modal.parameters_modal_data
            );
        },

        onRestoreWorld() {
            this.$modal.show(
                DeletedWorldsOfUniverse,
                {
                    // no props to be provided
                },
                app.modal.parameters_modal_data
            );
        },
    },
};
</script>
<style>
:root {
    --horizontal-margin: 30px;
    --vertical-margin: 15px;
}
#world-list-header {
    margin: var(--horizontal-margin);
    margin-bottom: 20px;
}
#world-list-title {
    font-size: 12px;
    color: #6d7385;
}
#world-list-search {
    margin-top: 10px;
}
#world-list-tag {
    border-radius: 9px;
    height: 17px;
    line-height: 17px;
    font-size: 10px;
    margin-left: 10px;
    font-weight: 500;
}
#world-list {
    list-style: none;
    margin: 0;
    padding: 0;
    overflow: auto;
}
.world-list-item {
    padding: var(--vertical-margin) var(--horizontal-margin);
    display: flex;
    flex-wrap: wrap;
    background: var(--style-color-white);
}
.world-list-item:hover,
.world-list-item:focus,
.world-list-item-focus {
    background: #f1f1f4;
    border-right: 2px solid #171e36;
}
.world-list-item:not(:last-child) {
    border-bottom: 1px solid #dedee2;
}
.world-list-name,
.world-list-team {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    width: calc(
        300px /* TODO: pattern-home-side width in a var? */ - 2 *
            var(--horizontal-margin)
    );
    font-weight: 700;
}
.world-list-name {
    font-size: 13px;
}
.world-list-team {
    font-size: 10px;
    font-weight: 500;
    color: #6d7385;
}
#world-list-footer {
    border-top: 1px solid #dedee2;
    min-height: 25px;
    padding-left: calc(0.5 * var(--horizontal-margin));
    padding-top: var(--vertical-margin);
}
#world-list-footer > button {
    width: 100%;
    text-align: left;
    color: #6d7385;
    font-size: 13px;
    font-weight: 700;
    padding: 0;
    padding-bottom: var(--vertical-margin);
}
.buy-world {
    margin: 10px auto;
}
</style>
