<template>
    <pattern-config tabPosition="left" theme="dark">
        <template #title>
            <img
                src="../assets/icons/board.svg"
                :alt="$t('icon.board')"
                style="margin-right: 10px"
            />
            <span>
                <span>
                    {{ $t("board.parameters.title") }}
                </span>

                <span class="item-name">
                    {{ parameters.name }}
                </span>
            </span>
        </template>

        <template class="vw-link-color">
            <el-tab-pane :label="$t('board.parameters.tabs.general')">
                <span class="board-edit-title">
                    {{ $t("board.parameters.tabs.general") }}
                </span>
                <el-form label-position="right" @submit.prevent.native>
                    <el-form-item :label="$t('board.parameters.name')">
                        <el-input
                            :placeholder="boardId"
                            @change="onNameChange"
                            v-model="parameters.name"
                        />
                    </el-form-item>
                    <el-form-item :label="$t('board.parameters.description')">
                        <el-input
                            type="textarea"
                            @change="onDescriptionChange"
                            v-model="parameters.description"
                        />
                    </el-form-item>
                </el-form>
            </el-tab-pane>

            <el-tab-pane
                :label="$t('board.parameters.tabs.feature_flipping.title')"
            >
                <span class="board-edit-title">
                    {{ $t("board.parameters.tabs.feature_flipping.title") }}
                </span>
                <span class="board-edit-subtitle">
                    {{ $t("board.parameters.tabs.feature_flipping.subtitle") }}
                </span>
                <el-form label-position="right">
                    <el-form-item>
                        <el-switch
                            :activeText="
                                $t('board.parameters.enable_object_creation')
                            "
                            @change="onEnableObjectCreationChange"
                            v-model="parameters.enableObjectCreation"
                        />
                    </el-form-item>
                    <el-form-item>
                        <el-switch
                            :activeText="
                                $t('board.parameters.enable_object_duplication')
                            "
                            @change="onEnableObjectDuplicationChange"
                            v-model="parameters.enableObjectDuplication"
                        />
                    </el-form-item>
                    <el-form-item>
                        <el-switch
                            :activeText="
                                $t('board.parameters.enable_object_edition')
                            "
                            @change="onEnableObjectEditionChange"
                            v-model="parameters.enableObjectEdition"
                        />
                    </el-form-item>
                    <el-form-item>
                        <el-switch
                            :activeText="
                                $t('board.parameters.enable_object_resize')
                            "
                            @change="onEnableObjectResizeChange"
                            v-model="parameters.enableObjectResize"
                        />
                    </el-form-item>
                    <el-form-item>
                        <el-switch
                            :activeText="
                                $t('board.parameters.enable_object_deletion')
                            "
                            @change="onEnableObjectDeletionChange"
                            v-model="parameters.enableObjectDeletion"
                        />
                    </el-form-item>
                    <el-form-item>
                        <el-switch
                            :activeText="
                                $t(
                                    'board.parameters.enable_object_model_deletion'
                                )
                            "
                            @change="onEnableObjectModelChange"
                            v-model="parameters.enableObjectModelChange"
                        />
                    </el-form-item>
                </el-form>

                <span class="board-edit-subtitle">{{
                    $t("board.parameters.snap")
                }}</span>
                <el-form label-position="right">
                    <el-form-item>
                        <el-switch
                            :activeText="$t('board.parameters.grid_enabled')"
                            @change="onGridEnabledChange"
                            v-model="parameters.gridEnabled"
                        />
                    </el-form-item>
                    <el-form-item :label="$t('board.parameters.grid_x')">
                        <el-input-number
                            size="small"
                            controlsPosition="right"
                            @change="onGridXChange"
                            v-model.number="parameters.gridX"
                            :min="1"
                        />
                    </el-form-item>
                    <el-form-item :label="$t('board.parameters.grid_y')">
                        <el-input-number
                            size="small"
                            controlsPosition="right"
                            @change="onGridYChange"
                            v-model.number="parameters.gridY"
                            :min="1"
                        />
                    </el-form-item>

                    <el-form-item :label="$t('board.parameters.snap_radius')">
                        <el-input-number
                            size="small"
                            controlsPosition="right"
                            @change="onSnapRadiusChange"
                            v-model.number="parameters.snapRadius"
                            :min="0"
                        />
                    </el-form-item>
                    <el-form-item>
                        <el-switch
                            :activeText="$t('board.parameters.snap_border')"
                            @change="onSnapBorderChange"
                            v-model="parameters.snapBorder"
                        />
                    </el-form-item>
                    <el-form-item>
                        <el-switch
                            :activeText="
                                $t('board.parameters.snap_vertical_axis')
                            "
                            @change="onSnapVerticalAxisChange"
                            v-model="parameters.snapVerticalAxis"
                        />
                    </el-form-item>
                    <el-form-item>
                        <el-switch
                            :activeText="
                                $t('board.parameters.snap_horizontal_axis')
                            "
                            @change="onSnapHorizontalAxisChange"
                            v-model="parameters.snapHorizontalAxis"
                        />
                    </el-form-item>
                </el-form>
            </el-tab-pane>

            <el-tab-pane :label="$t('board.parameters.tabs.users_management')">
                <span class="board-edit-title">
                    {{ $t("board.parameters.tabs.users_management") }}
                </span>
                <user-list :guest="false" />
            </el-tab-pane>
            <el-tab-pane :label="$t('board.parameters.tabs.guests_management')">
                <span class="board-edit-title">
                    {{ $t("board.parameters.tabs.guests_management") }}
                </span>
                <user-list :guest="true" />
            </el-tab-pane>

            <el-tab-pane
                :label="$t('board.parameters.tabs.components_display')"
            >
                <span class="board-edit-title">
                    {{ $t("board.parameters.tabs.components_display") }}
                </span>
                <component-library :displayManagement="true" />
            </el-tab-pane>
            <el-tab-pane
                :label="$t('board.parameters.tabs.link_models_display')"
            >
                <span class="board-edit-title">
                    {{ $t("board.parameters.tabs.link_models_display") }}
                </span>
                <link-model-library :displayManagement="true" />
            </el-tab-pane>
            <el-tab-pane :label="$t('board.parameters.tabs.jira_sync')">
                <span class="board-edit-title">
                    {{ $t("board.parameters.tabs.jira_sync") }}
                </span>
                <jira-sync />
            </el-tab-pane>
        </template>

        <template #buttons>
            <el-button
                v-show-granted:root
                size="small"
                type="submit"
                class="el-button--success"
                @click="
                    $store.commit(`app/objectsInBoard/event`, 'refreshAbacus')
                "
            >
                Refresh fit-text
            </el-button>
        </template>
    </pattern-config>
</template>

<script>
// Components
import PatternConfig from "../components/pattern-config/pattern-config";
import UserList from "../components/user-list/user-list";
import ComponentLibrary from "../components/component-library/component-library";
import LinkModelLibrary from "../components/link-model-library/link-model-library";
import JiraSync from "../components/jira-sync/jira-sync.vue";

export default {
    name: "BoardEdit",

    components: {
        PatternConfig,
        UserList,
        ComponentLibrary,
        LinkModelLibrary,
        JiraSync,
    },

    props: {
        worldId: String,
        boardId: String,
    },

    // Descendant-provided properties of the view
    provide() {
        return {
            $view: {
                name: this.$options.name,
                worldId: this.worldId,
                boardId: this.boardId,
            },
        };
    },
    methods: {
        onNameChange(evt) {
            this.doParameterChange("name", evt);
        },
        onDescriptionChange(evt) {
            this.doParameterChange("description", evt);
        },
        onEnableObjectCreationChange(evt) {
            this.doParameterChange("enableObjectCreation", evt);
        },
        onEnableObjectDuplicationChange(evt) {
            this.doParameterChange("enableObjectDuplication", evt);
        },
        onEnableObjectEditionChange(evt) {
            this.doParameterChange("enableObjectEdition", evt);
        },
        onEnableObjectResizeChange(evt) {
            this.doParameterChange("enableObjectResize", evt);
        },
        onEnableObjectDeletionChange(evt) {
            this.doParameterChange("enableObjectDeletion", evt);
        },
        onEnableObjectModelChange(evt) {
            this.doParameterChange("enableObjectModelChange", evt);
        },
        onGridEnabledChange(evt) {
            this.doParameterChange("gridEnabled", evt);
        },
        onGridXChange(evt) {
            this.doParameterChange("gridX", evt);
        },
        onGridYChange(evt) {
            this.doParameterChange("gridY", evt);
        },
        onSnapRadiusChange(evt) {
            this.doParameterChange("snapRadius", evt);
        },
        onSnapBorderChange(evt) {
            this.doParameterChange("snapBorder", evt);
        },
        onSnapVerticalAxisChange(evt) {
            this.doParameterChange("snapVerticalAxis", evt);
        },
        onSnapHorizontalAxisChange(evt) {
            this.doParameterChange("snapHorizontalAxis", evt);
        },
        doParameterChange(key, value) {
            this.$store.dispatch("boardAlive/update", {
                worldId: this.worldId,
                boardId: this.boardId,
                data: { [key]: value },
                reply: true,
            });
        },
    },
    computed: {
        parameters() {
            return this.$store.getters["boardAlive/byId"](this.boardId).data;
        },
    },
};
</script>

<style scoped>
.board-edit-title {
    display: block;
    width: 70%;
    color: #aeb1bb;
    font-size: 18px;
    margin-bottom: 20px;
}

.board-edit-subtitle {
    display: block;
    width: 70%;
    color: var(--style-main-color);
    font-size: 16px;
    margin-bottom: 20px;
    font-weight: bold;
}

.title.left > span:first-child {
    display: flex;
    align-items: center;
}

.title.left > .item-name {
    margin-left: 35px;
}
</style>
