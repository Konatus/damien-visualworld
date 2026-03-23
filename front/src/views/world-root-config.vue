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
                    {{ $t("root_world.title") }}
                </span>
                <span class="item-name">
                    {{ world.name }}
                </span>
            </span>
        </template>

        <template>
            <el-tab-pane :label="$t('root_world.tabs.general')">
                <span class="world-root-config-title">
                    {{ $t("root_world.tabs.general") }}
                </span>
                <el-form
                    ref="data"
                    label-position="right"
                    :model="world"
                    :rules="rules"
                    @submit.prevent.native
                >
                    <el-form-item :label="$t('root_world.team')">
                        <el-input @change="onTeamChange" v-model="world.team" />
                    </el-form-item>
                    <el-form-item :label="$t('root_world.owner')" prop="owner">
                        <el-input
                            @change="onOwnerChange"
                            v-model="world.owner"
                        />
                    </el-form-item>
                </el-form>
            </el-tab-pane>

            <el-tab-pane :label="$t('root_world.tabs.limits')">
                <span class="world-root-config-title">
                    {{ $t("root_world.tabs.limits") }}
                </span>
                <el-form>
                    <world-use
                        :worldId="worldId"
                        @change="onWorldRootConfigUpdate"
                        v-model="limits"
                    />
                </el-form>
            </el-tab-pane>
        </template>

        <template #buttons>
            <el-button
                size="small"
                icon="el-icon-delete"
                @click="onDeleteWorld(worldId)"
                v-show-granted:for="['world-alive/remove', world]"
            >
                {{ $t("home.delete_world") }}
            </el-button>
        </template>
    </pattern-config>
</template>

<script>
import PatternConfig from "../components/pattern-config/pattern-config";
import WorldUse from "../components/world-use/world-use";
import VueModalFinder from "../utils/vue-modal-finder";
export default {
    name: "WorldRootConfig",

    components: {
        PatternConfig,
        WorldUse,
    },

    props: {
        worldId: String,
    },

    data() {
        return {
            limits: {},
            owner: "",
            rules: {
                owner: [
                    {
                        type: "email",
                        message: this.$t("root_world.wrong_email"),
                        trigger: ["blur", "change"],
                    },
                ],
            },
        };
    },

    computed: {
        world() {
            return this.$store.getters["worldAlive/byId"](this.worldId).data;
        },
    },
    beforeCreate() {
        const beforeCloseValidation = () => {
            this.$parent.$on("before-close", (evt) => {
                this.$refs["data"].validate((valid) => {
                    if (!valid) {
                        evt.stop();
                        document.activeElement.blur();
                    }
                });
            });
        };
        VueModalFinder(this, beforeCloseValidation);
    },

    methods: {
        onTeamChange(evt) {
            this.doParameterChange("team", evt);
        },
        onOwnerChange(evt) {
            this.$refs["data"].validate((valid) => {
                if (valid) this.doParameterChange("owner", evt);
            });
        },
        doParameterChange(key, value) {
            this.$store.dispatch("worldAlive/update", {
                worldId: this.worldId,
                data: { [key]: value },
                reply: true,
            });
        },

        onWorldRootConfigUpdate() {
            try {
                this.$store.dispatch("worldUse/setLimit", {
                    worldId: this.worldId,
                    limits: this.limits,
                    reply: true,
                });
                this.onClose();
            } catch (e) {
                /* not catched */
            }
        },

        onDeleteWorld: function (worldId) {
            this.$modal.show("dialog", {
                title: this.$t("home.modal.delete_world_title"),
                text: this.$t("home.modal.delete_world_content"),
                buttons: [
                    {
                        title: this.$t("modal.yes"),
                        handler: () => {
                            this.$store.dispatch("worldAlive/delete", {
                                worldId,
                            });
                            this.$modal.hide("dialog");
                            this.$emit("close");
                        },
                    },
                    {
                        title: this.$t("modal.no"),
                        default: true,
                    },
                ],
            });
        },
    },
};
</script>

<style scoped>
.world-root-config-title {
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
