<!--
    This component represents all the available components.
    Ce component représente tous les composants disponibles.

    cf: https://github.com/SortableJS/sortablejs#options for draggable options
-->
<template>
    <div id="component-library">
        <pattern-library>
            <template #library-title>
                {{ $t("library.component.title") }}
            </template>

            <template v-if="!displayManagement" #header-start>
                <button
                    v-show-granted:for="['component-alive/create', $view]"
                    @click="onComponentCreate"
                    class="vw-link-color vw-link-filter"
                >
                    <div>
                        <img
                            src="../../assets/icons/component-create.svg"
                            :alt="$t('library.component.create.label')"
                        />
                    </div>
                    <span> {{ $t("library.component.create.label") }} </span>
                </button>
            </template>
            <template v-if="!displayManagement" #header-middle>
                <el-switch
                    v-show-granted:for="['component-trash/restore', $view]"
                    v-model="showTrash"
                    :active-text="$t('library.component.show_trashed')"
                />
            </template>

            <template #header-end>
                <el-input
                    size="mini"
                    v-model="search"
                    :placeholder="$t('library.component.search')"
                    prefix-icon="el-icon-search"
                />
            </template>
        </pattern-library>

        <ul class="library-list">
            <li v-for="component of filteredComponents" :key="component.name">
                <pattern-library-item-wrapper
                    class="component-wrapper"
                    :class="{
                        'already-set-to-board':
                            component.alreadySetToBoard && !displayManagement,
                    }"
                >
                    <template #item-wrapper-header>
                        <div class="vw-logo" v-if="component.data.defaultModel">
                            <img
                                src="../../assets/vw-small-rgb.svg"
                                :alt="$t('icon.VW')"
                            />
                        </div>
                        <vue-draggable
                            ghost=".component-summary"
                            :group="{
                                name: 'component',
                                pull: 'clone',
                                put: false,
                            }"
                            :sort="false"
                            :forceFallback="true"
                            :fallbackTolerance="5"
                            :disabled="
                                true ||
                                !component.isAlive ||
                                component.alreadySetToBoard ||
                                displayManagement
                            "
                            @choose="onComponentDrag"
                            @end="onComponentDrop"
                            :class="{
                                'component-hidden':
                                    displayManagement &&
                                    hiddenComponents.includes(
                                        component.componentId
                                    ),
                            }"
                        >
                            <component-icon
                                size="large"
                                :componentId="component.componentId"
                                :data-component-id="component.componentId"
                                :scaleOfGhost="component.scale"
                                v-show-granted:for="[
                                    'board-component/set',
                                    $view,
                                ]"
                            />
                        </vue-draggable>
                    </template>

                    <template #item-wrapper-footer>
                        <div
                            class="item-name"
                            :class="{
                                'component-hidden':
                                    displayManagement &&
                                    hiddenComponents.includes(
                                        component.componentId
                                    ),
                            }"
                        >
                            {{ component.data.name }}
                        </div>
                        <div class="item-wrapper-footer-actions">
                            <btn-model-display-management
                                v-if="displayManagement"
                                :model="'components'"
                                :modelId="component.componentId"
                                :hiddenItems="hiddenComponents"
                            />
                            <template v-else-if="component.isAlive">
                                <el-button
                                    v-if="component.alreadySetToBoard"
                                    class="vw-link-color vw-link-filter"
                                    @click="
                                        onComponentRemoveFromDock(component)
                                    "
                                    v-show-granted:for="[
                                        'board-component/set',
                                        $view,
                                    ]"
                                    type="info"
                                    size="mini"
                                    icon="el-icon-minus"
                                >
                                    {{ $t("library.component.remove_dock") }}
                                </el-button>

                                <el-button
                                    v-else
                                    class="vw-link-color vw-link-filter"
                                    @click="onComponentAddToDock(component)"
                                    v-show-granted:for="[
                                        'board-component/set',
                                        $view,
                                    ]"
                                    type="info"
                                    size="mini"
                                    icon="el-icon-plus"
                                >
                                    {{ $t("library.component.add_dock") }}
                                </el-button>

                                <el-button
                                    v-if="!component.data.defaultModel"
                                    @click="onComponentUpdate(component)"
                                    v-show-granted:for="[
                                        'component-alive/update',
                                        $view,
                                    ]"
                                    type="info"
                                    size="mini"
                                    class="btn-item-edit vw-link-color vw-link-filter"
                                >
                                    <img
                                        src="../../assets/icons/component-edit.svg"
                                        :alt="
                                            $t('library.component.update.label')
                                        "
                                    />
                                    <span>{{
                                        $t("library.component.update.label")
                                    }}</span>
                                </el-button>

                                <el-dropdown
                                    class="item-dropdown"
                                    trigger="click"
                                    placement="right"
                                    v-show-granted:forOne="[
                                        'component-alive/create',
                                        'component-alive/remove',
                                        $view,
                                    ]"
                                    size="small"
                                >
                                    <el-button
                                        type="text"
                                        class="vw-link-filter"
                                    >
                                        <img
                                            src="../../assets/icons/three-dots.svg"
                                            :alt="$t('icon.three_dots')"
                                        />
                                    </el-button>

                                    <el-dropdown-menu slot="dropdown">
                                        <el-dropdown-item>
                                            <el-link
                                                @click="
                                                    onComponentDuplicate(
                                                        component
                                                    )
                                                "
                                                v-show-granted:for="[
                                                    'component-alive/create',
                                                    $view,
                                                ]"
                                                :underline="false"
                                                class="vw-link-color"
                                            >
                                                {{
                                                    $t(
                                                        "library.component.duplicate.label"
                                                    )
                                                }}
                                            </el-link>
                                        </el-dropdown-item>

                                        <el-dropdown-item
                                            v-if="!component.data.defaultModel"
                                        >
                                            <el-link
                                                @click="
                                                    onComponentDelete(component)
                                                "
                                                v-if="
                                                    !componentVW.includes(
                                                        component.componentId
                                                    )
                                                "
                                                v-show-granted:for="[
                                                    'component-alive/remove',
                                                    $view,
                                                ]"
                                                :underline="false"
                                                class="vw-link-color"
                                            >
                                                {{
                                                    $t(
                                                        "library.component.delete.label"
                                                    )
                                                }}
                                            </el-link>
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </el-dropdown>
                            </template>
                            <template v-else>
                                <el-button
                                    @click="onComponentRestore(component)"
                                    v-show-granted:for="[
                                        'component-trash/restore',
                                        $view,
                                    ]"
                                    type="info"
                                    size="mini"
                                >
                                    <i class="el-icon-bangzhu"></i>
                                    <span>{{
                                        $t("library.component.restore.label")
                                    }}</span>
                                </el-button>
                            </template>
                        </div>
                    </template>
                </pattern-library-item-wrapper>
            </li>
        </ul>

        <!-- Catch everything  -->
        <vue-draggable
            id="component-dock-catcher"
            v-if="dragIsInProgress"
            :group="{ name: 'component', pull: false, put: true }"
            :key="refreshCatcher"
            @add="onCatch"
        >
        </vue-draggable>
    </div>
</template>
<script>
// TODO: remove that
const COMPONENT_ICON_WIDTH = 250;
const COMPONENT_ICON_HEIGHT = 138;
import { getMinScale } from "../../utils/scale";

import ReactiveDialog from "../../lib/reactive-dialog";
import VueDraggable from "../../lib/vue-draggable";
import ComponentIcon from "../component-icon/component-icon";
import ComponentEdit from "../../views/component-edit";

import PatternLibrary from "../pattern-library/pattern-library.vue";
import PatternLibraryItemWrapper from "../pattern-library/pattern-library-item-wrapper.vue";

import BtnModelDisplayManagement from "../btn-model-display-management/btn-model-display-management";

import app from "../../conf/app";

export default {
    name: "ComponentLibrary",

    components: {
        VueDraggable,
        ComponentIcon,
        PatternLibrary,
        PatternLibraryItemWrapper,
        BtnModelDisplayManagement,
    },

    props: {
        displayManagement: {
            type: Boolean,
            default: false,
        },
    },

    inject: ["$view"],

    data() {
        return {
            search: "",
            refreshCatcher: 0,
            dragIsInProgress: false,
            showTrash: false,
        };
    },

    computed: {
        isBackground() {
            return this.$store.getters[
                `app/objectsInBoard/activeLayerIsBackground`
            ];
        },

        components() {
            const boardComponent = this.$store.getters[
                `boardComponent/byLayer`
            ]({ isBackground: this.isBackground }).map(
                (component) => component.componentId
            );

            return [
                ...this.$store.getters[`componentAlive/asArray`],
                ...(this.showTrash
                    ? this.$store.getters[`componentTrash/asArray`]
                    : []),
            ]
                .sort((a, b) => {
                    const nameA = a?.data?.name || a.componentId;
                    const nameB = b?.data?.name || b.componentId;
                    return nameA.localeCompare(nameB);
                })
                .map((component) => {
                    const scale = getMinScale(
                        COMPONENT_ICON_WIDTH,
                        COMPONENT_ICON_HEIGHT,
                        component.data.defaultWidth,
                        component.data.defaultHeight,
                        0.3
                    );

                    return {
                        componentId: component.componentId,
                        data: component.data,
                        scale,
                        alreadySetToBoard: boardComponent.includes(
                            component.componentId
                        ),
                        isAlive: this.$store.getters[
                            `componentAlive/asId`
                        ].includes(component.componentId),
                    };
                });
        },

        filteredComponents() {
            return this.components
                .filter((item) => item.data.noLibrary !== true)
                .filter(
                    (item) =>
                        !this.search || // Proceed the search if necessary
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

        hiddenComponents() {
            return (
                this.$store.getters["boardAlive/hiddenItems"](
                    this.$view.boardId
                )?.components || []
            );
        },
        componentVW() {
            return Object.values(app.visualWorldComponent);
        },
    },

    methods: {
        onComponentCreate() {
            this.$modal.show(
                ComponentEdit,
                {
                    worldId: this.$view.worldId,
                    title: this.$t("component_edit.create"),
                    submitCallback: ({ data }) => {
                        this.$store.dispatch(`componentAlive/create`, {
                            worldId: this.$view.worldId,
                            data,
                        });
                    },
                    displayCancel: true,
                },
                app.modal.parameters_component_edit
            );
        },
        // Open a component-edit view inside a modal window
        onComponentUpdate({ componentId }) {
            const component =
                this.$store.getters[`componentAlive/byId`](componentId);
            this.$modal.show(
                ComponentEdit,
                {
                    worldId: this.$view.worldId,
                    componentId,
                    title: this.$t("component_edit.update", {
                        componentName: component.data.name,
                    }),
                    submitCallback: ({ componentId, data }) => {
                        this.$store.dispatch(`componentAlive/update`, {
                            worldId: this.$view.worldId,
                            componentId,
                            data,
                            reply: true,
                        });
                    },
                    displayCancel: true,
                },
                app.modal.parameters_component_edit
            );
        },
        // Restore a trashed component
        onComponentRestore({ componentId }) {
            this.$store.dispatch(`componentTrash/restore`, {
                worldId: this.$view.worldId,
                data: [
                    {
                        componentId,
                    },
                ],
            });
        },
        // Duplicate an existing component
        onComponentDuplicate({ componentId }) {
            const component =
                this.$store.getters[`componentAlive/byId`](componentId);
            this.$store.dispatch(`componentAlive/create`, {
                worldId: this.$view.worldId,
                data: component.data,
            });
        },
        // Confirm & delete a component
        onComponentDelete({ componentId }) {
            const componentName =
                this.$store.getters[`componentAlive/nameById`](componentId);
            this.$store.dispatch(`componentAlive/checkDelete`, {
                worldId: this.$view.worldId,
                componentId,
            });
            this.$modal.show(
                ReactiveDialog,
                {
                    title: () =>
                        this.$t("component_edit.delete.title", {
                            componentName,
                        }),
                    texts: () => {
                        const component =
                            this.$store.getters[`componentAlive/byId`](
                                componentId
                            );
                        const boards = component?.private?.removable;
                        const boardNames =
                            boards && Array.isArray(boards)
                                ? boards.map((board) => board?.data?.name)
                                : [];
                        return boardNames.length == 0
                            ? [this.$t("component_edit.delete.text")]
                            : [
                                  this.$t(
                                      "component_edit.delete.existing_items",
                                      { boardNames }
                                  ),
                                  this.$t("component_edit.delete.text"),
                              ];
                    },
                    buttons: [
                        {
                            title: this.$t("modal.yes"),
                            handler: () => {
                                this.$store.dispatch(`componentAlive/delete`, {
                                    worldId: this.$view.worldId,
                                    componentId,
                                });

                                this.$modal.hide("dialog");
                            },
                        },
                        {
                            title: this.$t("modal.no"),
                            default: true,
                        },
                    ],
                },
                app.modal.parameters
            );
        },
        // Set component to dock
        onComponentAddToDock({ componentId }) {
            let data = this.$store.getters[`boardComponent/byLayer`]({
                isBackground: this.isBackground,
            }).map((component) => component.componentId);
            data.unshift(componentId);

            this.$store.dispatch(`boardComponent/update`, {
                worldId: this.$view.worldId,
                boardId: this.$view.boardId,
                isBackground: this.isBackground,
                data,
            });
        },
        // Unset component from
        onComponentRemoveFromDock({ componentId }) {
            // TODO: src/components/component-dock/component-dock-remove duplicate
            const data = this.$store.getters[`boardComponent/byLayer`]({
                isBackground: this.isBackground,
            })
                .filter((component) => component.componentId != componentId)
                .map((component) => component.componentId);

            this.$store.dispatch(`boardComponent/update`, {
                worldId: this.$view.worldId,
                boardId: this.$view.boardId,
                isBackground: this.isBackground,
                data,
            });
        },
        // Catcher management
        onComponentDrag() {
            this.dragIsInProgress = true;
        },
        onComponentDrop() {
            this.dragIsInProgress = false;
        },
        onCatch() {
            this.refreshCatcher++;
        },
    },
};
</script>
<style scoped>
/* .component-wrapper{
        cursor: move;
    } */

.component-wrapper .vw-logo {
    width: 1.2em;
    height: 1.2em;
    border: 1px solid lightgray;
    padding: 2px 5px 5px 5px;
    border-radius: var(--style-border-radius);
    position: absolute;
    right: 5px;
    top: 5px;
    background: #fff;
}

.component-wrapper.already-set-to-board {
    border-color: var(--style-color-lightblue);
    box-shadow: 0px 0px 1px 1px var(--style-color-lightblue);
    background: #e1f2fa;
}

.already-set-to-board >>> .item-wrapper-footer {
    border-top-color: #9ad2ef;
}

.component-hidden {
    opacity: 0.25;
}

#component-library >>> .component-icon:not(.sortable-fallback) {
    display: flex;
    justify-content: center;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 60%;
}

#component-library >>> .component-icon > .component-summary,
#component-library >>> .component-icon > .item-name {
    display: none;
}

.library-list >>> .component-icon > .component-preview {
    transform-origin: center;
    flex-shrink: 0;
    flex-grow: 0;
    align-self: center;
}

.library-list >>> .component-preview input,
.library-list >>> .component-preview textarea {
    background: none;
    border: none;
}

.library-list >>> .component-preview .el-textarea,
.library-list >>> .component-preview .el-radio,
.library-list >>> .component-preview .el-radio-group,
.library-list >>> .component-preview .el-radio__label,
.library-list >>> .component-preview .el-checkbox,
.library-list >>> .component-preview .el-checkbox-group,
.library-list >>> .component-preview .el-checkbox__label,
.library-list >>> .component-preview .el-input--small,
.library-list >>> .component-preview .el-input__inner,
.library-list >>> .component-preview .el-textarea__inner,
.library-list >>> .component-preview .el-form-item__content {
    font-size: inherit;
    color: inherit;
    overflow: hidden;
    background: none;
    border: none;
    text-align: inherit;
}

#component-dock-catcher {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: calc(var(--dock-width) + 2 * var(--app-padding));
    opacity: 0;
    margin: 0;
    padding: 0;
    z-index: 0;
}

/* Fallback */
.component-icon >>> .component-preview {
    transform-origin: center;
    flex-shrink: 0;
    flex-grow: 0;
    align-self: center;
}
.component-icon.sortable-fallback >>> .component-summary-name,
.component-icon.sortable-fallback >>> .component-preview {
    display: none !important;
}
.sortable-fallback >>> .component-summary {
    display: block;
}
</style>
