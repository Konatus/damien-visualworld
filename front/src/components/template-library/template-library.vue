<!--
    This component represents all the available board templates.
    Ce component représente tous les modèles de tableaux disponibles.
-->

<template>
    <div id="template-library">
        <pattern-library>
            <template #library-title>
                {{ $t("library.template.title") }}
            </template>

            <template #header-start>
                <button
                    v-show-granted:for="['board-alive/create-template', $view]"
                    id="btn-create-template"
                    @click="onCreateTemplate"
                    class="vw-link-color vw-link-filter"
                >
                    <div>
                        <img
                            src="../../assets/icons/component-create.svg"
                            :alt="$t('library.component.create.label')"
                        />
                    </div>
                    <span> {{ $t("library.template.create.label") }} </span>
                </button>
            </template>

            <template #header-middle>
                <el-dropdown v-show-granted:root>
                    <el-button
                        id="btn-root-options"
                        class="vw-link-color"
                        trigger="hover"
                        type="info"
                    >
                        {{ $t("library.template.root_options") }}
                        <i class="el-icon-arrow-down el-icon--right"></i>
                    </el-button>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item
                            icon="el-icon-upload2"
                            class="vw-link-color"
                        >
                            <span @click="templateLibraryImportJson_do">
                                {{ $t("library.template.import.label") }}
                            </span>
                        </el-dropdown-item>
                        <el-dropdown-item
                            icon="el-icon-download"
                            class="vw-link-color"
                        >
                            <span @click="templateLibraryExportJson_do">
                                {{ $t("library.template.export.label") }}
                            </span>
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </template>

            <template #header-end>
                <el-input
                    size="mini"
                    v-model="search"
                    :placeholder="$t('library.template.search')"
                    prefix-icon="el-icon-search"
                />
            </template>
        </pattern-library>

        <ul class="library-list">
            <li v-for="template of filteredTemplates" :key="template._id">
                <pattern-library-item-wrapper>
                    <template #item-wrapper-header>
                        <el-tooltip
                            popper-class="template-description"
                            placement="right"
                            effect="light"
                            :open-delay="openDelayTooltip"
                        >
                            <div
                                class="template-description-content"
                                slot="content"
                                v-if="template.data.description !== ''"
                            >
                                {{ template.data.description }}
                            </div>

                            <div
                                class="template-description-content"
                                slot="content"
                                v-else
                            >
                                {{ $t("library.no_description") }}
                            </div>

                            <div class="template-wrapper-header">
                                <vue-draggable
                                    ghost=".template-preview"
                                    :group="{
                                        name: 'template',
                                        pull: 'clone',
                                        put: false,
                                    }"
                                    :sort="false"
                                    :forceFallback="true"
                                    :fallbackTolerance="5"
                                    :disabled="false"
                                    @start="onDrag"
                                    @drop="onDrop"
                                >
                                    <template-icon
                                        class="template-icon"
                                        :boardId="template._id"
                                        :data-board-id="template._id"
                                        :scaleOfBoard="scale"
                                    />
                                </vue-draggable>
                            </div>
                        </el-tooltip>
                    </template>

                    <template #item-wrapper-footer>
                        <div class="item-name">{{ template.data.name }}</div>

                        <div class="item-wrapper-footer-actions">
                            <el-button
                                v-if="template.boardId !== $view.boardId"
                                @click="onUpdateTemplate(template)"
                                :underline="false"
                                v-show-granted:for="[
                                    'link-model-alive/update',
                                    $view,
                                ]"
                                type="info"
                                size="mini"
                                class="btn-item-edit vw-link-color vw-link-filter"
                            >
                                <img
                                    src="../../assets/icons/component-edit.svg"
                                    :alt="$t('library.link.update.label')"
                                />
                                {{ $t("library.link.update.label") }}
                            </el-button>

                            <el-dropdown
                                class="template-dropdown"
                                v-if="template.boardId !== $view.boardId"
                                trigger="click"
                                placement="right"
                                size="small"
                                v-if-granted:forOne="[
                                    'board-alive/create-template',
                                    'board-alive/remove-template',
                                    $view,
                                ]"
                            >
                                <el-button type="text" class="vw-link-filter">
                                    <img
                                        src="../../assets/icons/three-dots.svg"
                                        :alt="$t('icon.three_dots')"
                                    />
                                </el-button>

                                <el-dropdown-menu slot="dropdown">
                                    <el-dropdown-item>
                                        <el-link
                                            @click="onDeleteTemplate(template)"
                                            :underline="false"
                                            class="vw-link-color"
                                            v-if-granted:for="[
                                                'board-alive/remove-template',
                                                $view,
                                            ]"
                                        >
                                            {{
                                                $t(
                                                    "library.template.delete.label"
                                                )
                                            }}
                                        </el-link>
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </el-dropdown>

                            <el-tag v-else type="warning">
                                {{ $t("library.template.currentlyUpdating") }}
                            </el-tag>
                        </div>
                    </template>
                </pattern-library-item-wrapper>
            </li>
        </ul>
    </div>
</template>
<script>
import app from "../../conf/app";
import Position from "../../utils/position";
import BoardData from "../board-data/board-data";
import VueDraggable from "../../lib/vue-draggable.vue";
import TemplateIcon from "../template-icon/template-icon.vue";
import TemplateLibraryExportJson from "./template-library-export-json";
import templateLibraryImportJson from "./template-library-import-json";

import PatternLibrary from "../pattern-library/pattern-library.vue";
import PatternLibraryItemWrapper from "../pattern-library/pattern-library-item-wrapper.vue";
import VueModalFinder from "../../utils/vue-modal-finder";

export default {
    name: "TemplateLibrary",

    components: {
        VueDraggable,
        TemplateIcon,
        PatternLibrary,
        PatternLibraryItemWrapper,
    },

    mixins: [TemplateLibraryExportJson],

    inject: ["$view"],

    data() {
        return {
            search: "",
        };
    },

    computed: {
        filteredTemplates() {
            return this.$store.getters["boardAlive/templateByWorld"](
                this.$view.worldId
            )
                .sort((a, b) => {
                    const nameA = a?.data?.name || a._id;
                    const nameB = b?.data?.name || b._id;
                    return nameA.localeCompare(nameB);
                })
                .filter(
                    (item) =>
                        !this.search ||
                        (item.data.name &&
                            item.data.name.match(
                                new RegExp(this.search, "i")
                            )) ||
                        (item.data.description &&
                            item.data.description.match(
                                new RegExp(this.search, "i")
                            ))
                );
        },

        scale() {
            return this.$store.getters[`panzoom/scale`];
        },

        openDelayTooltip() {
            return app?.tooltip_config?.delay;
        },
    },

    methods: {
        // Template management
        onCreateTemplate() {
            this.$modal.show(
                BoardData,
                {
                    isTemplate: true,
                    callback: ({ name, description }) => {
                        this.$store.dispatch("boardAlive/createTemplate", {
                            worldId: this.$view.worldId,
                            data: { name, description },
                        });
                    },
                },
                app.modal.parameters_modal_data
            );
        },
        onUpdateTemplate({ worldId, boardId }) {
            this.$router.push({
                name: "objectsInBoard",
                params: {
                    worldId,
                    boardId,
                },
            });
        },
        onDeleteTemplate({ worldId, boardId }) {
            this.$modal.show("dialog", {
                title: this.$t("library.template.delete.modal_title"),
                text: this.$t("library.template.delete.modal_content"),
                buttons: [
                    {
                        title: this.$t("modal.yes"),
                        handler: () => {
                            this.$store.dispatch("boardAlive/deleteTemplate", {
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

        // Drag-n-drop template management
        onDrag() {
            this.modalVisibility(false);
        },
        onDrop(event) {
            this.modalClose();

            // Transform a screen position into a board position
            const panzoom = this.$store.getters[`panzoom/panzoom`];
            const templateCenter = Position.eventToLayer(event, panzoom)[0]; // TODO: use full list in case of touch event

            this.$store.dispatch("boardAlive/addState", {
                worldId: this.$view.worldId,
                boardId: this.$view.boardId,
                templateBoardId: event.dataset.boardId,
                data: {
                    top: templateCenter.top,
                    left: templateCenter.left,
                    zIndex: 1 + this.$store.getters[`positionAlive/zIndexMax`],
                },
            });
        },

        // Manage the modal
        modalVisibility(show = true) {
            VueModalFinder(this, (modal) => {
                modal.$el.style.visibility = show ? "visible" : "hidden";
            });
        },
        modalClose() {
            VueModalFinder(this, (_, modalChild) => {
                modalChild.$emit("close");
            });
        },
        templateLibraryImportJson_do() {
            this.$modal.show(
                templateLibraryImportJson,
                {
                    worldId: this.$view.worldId,
                },
                app.modal.parameters
            );
        },
    },
};
</script>

<style>
.template-description {
    max-width: 20em;
    max-height: 20em;
    min-height: 15px;
    min-width: 15px;
}

.template-description-content {
    max-width: 20em;
    max-height: 20em;
    overflow-y: auto;
}
</style>

<style scoped>
.template-wrapper-header {
    height: 100%;
}
.template-wrapper-header div {
    display: flex;
    justify-content: center;
    align-items: center;
    height: inherit;
}
#template-library >>> .template-icon > .template-name,
#template-library >>> .template-icon > .template-preview {
    display: none;
}

#template-library >>> .template-mini {
    max-width: 80%;
    max-height: 80%;
}

/* Fallback */
.sortable-fallback >>> .template-name,
.sortable-fallback >>> .template-mini {
    display: none;
}
.sortable-fallback >>> .template-preview {
    display: block;
}

#btn-root-options {
    border-radius: 26px;
    border: 1px solid #dedee2;
    font-size: 14px;
    font-weight: 700;
}
</style>
