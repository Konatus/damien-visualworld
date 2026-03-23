<!--
    This component represents all the available linkModels.
    Ce component représente tous les modèles de lien disponibles.
-->

<template>
    <div id="link-model-library">
        <pattern-library>
            <template #library-title>
                {{ $t("library.link.title") }}
            </template>

            <template v-if="!displayManagement" #header-start>
                <button
                    v-show-granted:for="['link-model-alive/create', $view]"
                    id="btn-create-link-model"
                    @click="onLinkModelCreate"
                    class="vw-link-color vw-link-filter"
                >
                    <div>
                        <img
                            src="../../assets/icons/component-create.svg"
                            :alt="$t('library.component.create.label')"
                        />
                    </div>
                    <span> {{ $t("library.link.create.label") }} </span>
                </button>
            </template>
            <template v-if="!displayManagement" #header-middle>
                <el-switch
                    v-show-granted:for="['link-model-trash/restore', $view]"
                    v-model="showTrash"
                    :active-text="$t('library.link.show_trashed')"
                />
            </template>

            <template #header-end>
                <el-input
                    size="mini"
                    v-model="search"
                    :placeholder="$t('library.link.search')"
                    prefix-icon="el-icon-search"
                />
            </template>
        </pattern-library>

        <ul class="library-list">
            <li v-for="linkModel of filteredLinkModels" :key="linkModel._id">
                <div class="vw-logo" v-if="linkModel.data.defaultModel">
                    <img
                        src="../../assets/vw-small-rgb.svg"
                        :alt="$t('icon.VW')"
                    />
                </div>
                <pattern-library-item-wrapper>
                    <template #item-wrapper-header>
                        <el-tooltip
                            popper-class="link-model-description"
                            placement="right"
                            effect="light"
                            :open-delay="openDelayTooltip"
                        >
                            <div
                                class="link-model-description-content"
                                slot="content"
                                v-if="linkModel.data.description !== ''"
                            >
                                {{ linkModel.data.description }}
                            </div>

                            <div
                                class="link-model-description-content"
                                slot="content"
                                v-else
                            >
                                {{ $t("library.no_description") }}
                            </div>

                            <div>
                                <link-icon
                                    size="small"
                                    :linkModelId="linkModel.linkModelId"
                                    :class="{
                                        'link-model-hidden':
                                            displayManagement &&
                                            hiddenLinkModels.includes(
                                                linkModel.linkModelId
                                            ),
                                    }"
                                />
                            </div>
                        </el-tooltip>
                    </template>

                    <template #item-wrapper-footer>
                        <div
                            class="item-name"
                            :class="{
                                'link-model-hidden':
                                    displayManagement &&
                                    hiddenLinkModels.includes(
                                        linkModel.linkModelId
                                    ),
                            }"
                        >
                            {{ linkModel.data.name }}
                        </div>
                        <div class="item-wrapper-footer-actions">
                            <btn-model-display-management
                                v-if="displayManagement"
                                :model="'linkModels'"
                                :modelId="linkModel.linkModelId"
                                :hiddenItems="hiddenLinkModels"
                            />

                            <template v-else-if="linkModel.isAlive">
                                <el-button
                                    v-if="!linkModel.data.defaultModel"
                                    @click="onLinkModelUpdate(linkModel)"
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
                                    class="link-model-dropdown"
                                    v-if="!linkModel.data.defaultModel"
                                    trigger="click"
                                    placement="right"
                                    size="small"
                                    v-show-granted:forAll="[
                                        'link-model-alive/update',
                                        'link-model-alive/remove',
                                        $view,
                                    ]"
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
                                                    onLinkModelDelete(linkModel)
                                                "
                                                :underline="false"
                                                class="vw-link-color"
                                            >
                                                {{
                                                    $t(
                                                        "library.link.delete.label"
                                                    )
                                                }}
                                            </el-link>
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </el-dropdown>
                            </template>
                            <template v-else>
                                <el-button
                                    @click="onLinkModelRestore(linkModel)"
                                    v-show-granted:for="[
                                        'link-model-trash/restore',
                                        $view,
                                    ]"
                                    type="info"
                                    size="mini"
                                >
                                    <i class="el-icon-bangzhu"></i>
                                    <span>{{
                                        $t("library.link.restore.label")
                                    }}</span>
                                </el-button>
                            </template>
                        </div>
                    </template>
                </pattern-library-item-wrapper>
            </li>
        </ul>
    </div>
</template>

<script>
import LinkIcon from "../link-icon/link-icon";
import ReactiveDialog from "../../lib/reactive-dialog.vue";

import app from "../../conf/app";
import LinkModelEdit from "../../views/link-model-edit";

import PatternLibrary from "../pattern-library/pattern-library.vue";
import PatternLibraryItemWrapper from "../pattern-library/pattern-library-item-wrapper.vue";

import BtnModelDisplayManagement from "../btn-model-display-management/btn-model-display-management";

export default {
    name: "LinkModelLibrary",

    components: {
        LinkIcon,
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
            showTrash: false,
        };
    },

    computed: {
        filteredLinkModels() {
            return [
                ...this.$store.getters[`linkModelAlive/asArray`],
                ...(this.showTrash
                    ? this.$store.getters[`linkModelTrash/asArray`]
                    : []),
            ]
                .sort((a, b) => {
                    const nameA = a?.data?.name || a.linkModelId;
                    const nameB = b?.data?.name || b.linkModelId;
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
                )
                .map((item) => ({
                    linkModelId: item.linkModelId,
                    data: item.data,
                    isAlive: this.$store.getters[
                        `linkModelAlive/asId`
                    ].includes(item.linkModelId),
                }));
        },

        hiddenLinkModels() {
            return (
                this.$store.getters["boardAlive/hiddenItems"](
                    this.$view.boardId
                )?.linkModels || []
            );
        },

        openDelayTooltip() {
            return app?.tooltip_config?.delay;
        },
    },

    methods: {
        onLinkModelCreate() {
            this.$modal.show(
                LinkModelEdit,
                {
                    worldId: this.$view.worldId,
                    titleForm: this.$t("link_model_edit.create"),
                    updateLink: false,
                    submitCallback: ({ data }) => {
                        this.$store.dispatch(`linkModelAlive/create`, {
                            worldId: this.$view.worldId,
                            boardId: this.$view.boardId,
                            data,
                        });
                    },
                    displayCancel: true,
                },
                app.modal.parameters_link_model_edit
            );
        },
        // Update of a link model
        onLinkModelUpdate(link) {
            const linkModelName = this.$store.getters[`linkModelAlive/byId`](
                link.linkModelId
            ).data.name;

            this.$modal.show(
                LinkModelEdit,
                {
                    worldId: this.$view.worldId,
                    updateLink: true,
                    link: link,
                    titleForm: this.$t("link_model_edit.update", {
                        linkModelName,
                    }),

                    submitCallback: ({ data }) => {
                        this.$store.dispatch(`linkModelAlive/update`, {
                            worldId: this.$view.worldId,
                            linkModelId: link.linkModelId,
                            data,
                        });
                    },
                    displayCancel: true,
                },
                app.modal.parameters_link_model_edit
            );
        },
        // Restore a trashed link-model
        onLinkModelRestore({ linkModelId }) {
            this.$store.dispatch(`linkModelTrash/restore`, {
                worldId: this.$view.worldId,
                data: [
                    {
                        linkModelId,
                    },
                ],
            });
        },
        // Confirm & delete a link model
        onLinkModelDelete({ linkModelId }) {
            const linkModelName =
                this.$store.getters[`linkModelAlive/byId`](linkModelId).data
                    .name;
            this.$store.dispatch(`linkModelAlive/checkDelete`, {
                worldId: this.$view.worldId,
                linkModelId,
            });
            this.$modal.show(
                ReactiveDialog,
                {
                    title: () =>
                        this.$t("link_model_edit.delete.title", {
                            linkModelName,
                        }),
                    texts: () => {
                        const linkModel =
                            this.$store.getters[`linkModelAlive/byId`](
                                linkModelId
                            );
                        const boards = linkModel?.private?.removable;
                        const boardNames =
                            boards && Array.isArray(boards)
                                ? boards.map((board) => board?.data?.name)
                                : [];
                        return boardNames.length == 0
                            ? [this.$t("link_model_edit.delete.text")]
                            : [
                                  this.$t(
                                      "link_model_edit.delete.existing_items",
                                      { boardNames }
                                  ),
                                  this.$t("link_model_edit.delete.text"),
                              ];
                    },
                    buttons: [
                        {
                            title: this.$t("modal.yes"),
                            handler: () => {
                                this.$store.dispatch(`linkModelAlive/delete`, {
                                    worldId: this.$view.worldId,
                                    linkModelId,
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
    },
};
</script>

<style>
.link-model-description {
    max-width: 20em;
    max-height: 20em;
    min-height: 15px;
    min-width: 15px;
}

.link-model-description-content {
    max-width: 20em;
    max-height: 20em;
    overflow-y: auto;
}
.link-model-hidden {
    opacity: 0.25;
}
</style>

<style scoped>
.el-icon-delete:before {
    display: flex;
    line-height: 34px;
    width: 34px;
    height: 34px;
    justify-content: center;
}
.el-icon-delete {
    border-radius: 100%;
    background: white;
}
.el-icon-strike {
    background: linear-gradient(
        to top left,
        white 0%,
        white calc(50% - 0.8px),
        black 50%,
        white calc(50% + 0.8px),
        white 100%
    );
}

#link-model-library-list > li > svg {
    width: 100%;
    height: 100%;
}
.vw-logo {
    width: 1.2em;
    height: 1.2em;
    border: 1px solid lightgray;
    padding: 2px 5px 5px 5px;
    border-radius: var(--style-border-radius);
    position: absolute;
    right: 7px;
    top: 7px;
    background: #fff;
    z-index: 1;
}
</style>
