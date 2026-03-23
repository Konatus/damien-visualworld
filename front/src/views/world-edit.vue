<template>
    <pattern-config tabPosition="left" theme="dark">
        <template #title>
            <img
                src="../assets/vw-small-grey.svg"
                :alt="$t('icon.VW')"
                style="margin-right: 10px"
            />
            <span>
                <span>
                    {{ $t("world.parameters.title") }}
                </span>
                <span class="item-name">
                    {{ parameters.name }}
                </span>
            </span>
        </template>

        <template>
            <el-tab-pane :label="$t('world.parameters.tabs.general')">
                <span class="world-edit-title">
                    {{ $t("world.parameters.tabs.general") }}
                </span>

                <el-form label-position="right" @submit.prevent.native>
                    <el-form-item :label="$t('world.parameters.name')">
                        <el-input
                            :disabled="demoAdministrator"
                            :placeholder="$view.worldId"
                            @change="onNameChange"
                            v-model="parameters.name"
                        />
                    </el-form-item>
                    <el-form-item :label="$t('world.parameters.description')">
                        <el-input
                            type="textarea"
                            @change="onDescriptionChange"
                            v-model="parameters.description"
                        />
                    </el-form-item>
                    <el-form-item>
                        <el-switch
                            :disabled="demoAdministrator"
                            :activeText="$t('world.parameters.rootable')"
                            @change="onRootableChange"
                            v-model="parameters.rootable"
                        />
                    </el-form-item>
                </el-form>
            </el-tab-pane>

            <el-tab-pane
                :label="$t('world.parameters.tabs.licenses_management')"
            >
                <span class="world-edit-title">
                    {{ $t("world.parameters.tabs.licenses_management") }}
                </span>
                <world-use :worldId="worldId" />
            </el-tab-pane>

            <el-tab-pane :label="$t('world.parameters.tabs.users_management')">
                <span class="world-edit-title">
                    {{ $t("world.parameters.tabs.users_management") }}
                </span>
                <user-list :guest="false" />
            </el-tab-pane>

            <el-tab-pane :label="$t('world.parameters.tabs.deleted_boards')">
                <span class="world-edit-title">
                    {{ $t("world.parameters.tabs.deleted_boards") }}
                </span>
                <pattern-restoration item="board" />
            </el-tab-pane>
        </template>
    </pattern-config>
</template>

<script>
// Components
import PatternConfig from "../components/pattern-config/pattern-config";
import WorldUse from "../components/world-use/world-use";
import UserList from "../components/user-list/user-list";
import PatternRestoration from "../components/pattern-restoration/pattern-restoration";

// Vue integration
export default {
    name: "WorldEdit",

    components: {
        PatternConfig,
        WorldUse,
        UserList,
        PatternRestoration,
    },

    props: {
        worldId: String,
    },

    // Descendant-provided properties of the view
    provide() {
        return {
            $view: this.$view,
        };
    },

    methods: {
        onNameChange(evt) {
            this.doParameterChange("name", evt);
        },
        onDescriptionChange(evt) {
            this.doParameterChange("description", evt);
        },
        onRootableChange(evt) {
            this.doParameterChange("rootable", evt);
        },
        doParameterChange(key, value) {
            this.$store.dispatch("worldAlive/update", {
                worldId: this.worldId,
                data: { [key]: value },
                reply: true,
            });
        },
    },

    computed: {
        $view() {
            return {
                name: this.$options.name,
                worldId: this.worldId,
            };
        },

        parameters() {
            return this.$store.getters["worldAlive/byId"](this.worldId).data;
        },
        demoAdministrator() {
            return this.$store.getters[`connectionMe/isDemoAdministrator`](
                this.$view
            );
        },
    },
};
</script>

<style scoped>
.world-edit-title {
    display: block;
    width: 70%;
    color: #aeb1bb;
    font-size: 18px;
    margin-bottom: 20px;
}

.title img {
    width: 20px;
}
</style>
