<template>
    <div class="object-linked-tab">
        <div v-for="(componentAndLink, i) of componentsAndLinks" :key="i">
            <div v-if="componentAndLink.length" class="present-object">
                <span v-if="i === 0">{{
                    $t("links.present_in_this_board")
                }}</span>
                <span v-else>{{ $t("links.present_in_others_boards") }}</span>
            </div>
            <div class="object-linked-wrapper">
                <div
                    v-for="(object, j) of componentAndLink"
                    :key="object.objectId + i + j"
                    class="object-linked"
                >
                    <div
                        class="object-linked-inner-top"
                        :style="{
                            width: `${wrapperSize.width}px`,
                            height: `${wrapperSize.height}px`,
                        }"
                    >
                        <div
                            class="object-linked-inner"
                            :style="{
                                width: `${wrapperSize.width}px`,
                                height: `${wrapperSize.height}px`,
                            }"
                        >
                            <link-icon
                                :style="{
                                    position: 'absolute',
                                    top: 20,
                                    left: 0,
                                }"
                                :size="{
                                    marginX: 0,
                                    marginY: 20,
                                    width:
                                        (wrapperSize.width -
                                            object.component.width *
                                                object.component.scale) /
                                        2,
                                    height: wrapperSize.height / 2,
                                    scale: object.component.scale,
                                }"
                                :linkModelId="object.link.linkModelId"
                                :linkModel="object.link"
                            />
                            <object-view
                                :key="object.objectId"
                                :componentId="object.component.componentId"
                                :positionId="object.position[0].positionId"
                                class="object-view object-view-data"
                                :style="{
                                    height: object.component.height + 'px',
                                    width: object.component.width + 'px',
                                    transform:
                                        'scale(' + object.component.scale + ')',
                                }"
                            />
                        </div>
                    </div>
                    <object-data-link-select
                        class="object-data-link-select-footer vw-link-color"
                        :linkId="object.link.linkId"
                        :linkModelId="object.link.linkModelId"
                        @getLinkFromSelect="getLinkModel"
                    />

                    <el-dropdown
                        @command="onDelete"
                        class="object-linked-inner-dropdown"
                        trigger="click"
                        placement="right-start"
                        size="small"
                    >
                        <el-button type="text" class="vw-link-filter">
                            <img
                                src="../../assets/icons/three-dots.svg"
                                :alt="$t('icon.three_dots')"
                            />
                        </el-button>
                        <el-dropdown-menu
                            slot="dropdown"
                            class="object-linked-inner-dropdown-menu vw-link-color vw-link-filter"
                        >
                            <el-dropdown-item :command="object">
                                <div>
                                    <img
                                        src="../../assets/icons/delete.svg"
                                        :alt="$t('icon.three_dots')"
                                    />
                                    <span class="link-delete">
                                        {{ $t(`links.delete_this_link`) }}</span
                                    >
                                </div>
                            </el-dropdown-item>
                            <el-dropdown-item
                                style="color: initial"
                                disabled
                                :divided="!i"
                                v-for="(position, i) of object.position"
                                :key="i"
                                popper-class="object-linked-inner-dropdown-item"
                            >
                                <div v-if="!i">
                                    <i18n
                                        :path="`links.present_in_${
                                            object.position.length === 1
                                                ? 'single'
                                                : 'plural'
                                        }_board`"
                                        tag="h5"
                                        style="text-transform: uppercase"
                                    >
                                        <span place="nbr_tableau">{{
                                            object.position.length
                                        }}</span>
                                    </i18n>
                                </div>
                                <div>
                                    <img
                                        src="../../assets/icons/board.svg"
                                        :alt="$t('icon.board')"
                                    />
                                    <span class="board-list-name">
                                        {{
                                            $store.getters[
                                                "boardAlive/nameById"
                                            ](position.boardId)
                                        }}
                                    </span>
                                </div>
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { getMinScale } from "../../utils/scale";

import LinkIcon from "../link-icon/link-icon.vue";
import ObjectDataLinkSelect from "./object-data-link-select.vue";
import ObjectView from "../object-view/object-view";
import app from "../../conf/app";
import flatten from "lodash.flatten";
export default {
    name: "ObjectDataLink",

    components: {
        LinkIcon,
        ObjectView,
        ObjectDataLinkSelect,
    },

    inject: ["$view"],

    props: {
        objectId: String,
    },

    computed: {
        wrapperSize() {
            return app.objectLinked; //{ width, height }
        },
        componentsAndLinks() {
            const linkByObject = this.$store.getters["linkAlive/byObjectId"](
                this.objectId
            );
            let components = flatten(
                linkByObject.map((link) => {
                    const thisObject = link.objects.filter(
                        (object) => object.objectId === this.objectId
                    )[0];
                    const otherObjects = link.objects.filter(
                        (object) => object.objectId != this.objectId
                    );
                    return otherObjects.map((otherObject) => {
                        const showOtherPosition = otherObject.positions[0]; // 1st is arbitraty chosen
                        const scale = getMinScale(
                            app.objectLinked.width,
                            app.objectLinked.height,
                            showOtherPosition.data?.width,
                            showOtherPosition.data?.height,
                            0.3
                        );

                        return {
                            objectId: otherObject.objectId,
                            component: {
                                componentId: showOtherPosition.componentId,
                                height: showOtherPosition.data?.height,
                                width: showOtherPosition.data?.width,
                                scale,
                            },
                            link: {
                                linkModelId: link.linkModelId
                                    ? link.linkModelId
                                    : app.visualWorldComponent.VW_default,
                                linkId: link.linkId,
                                data: {
                                    ...link.data,
                                    anchors: [
                                        { data: thisObject.data },
                                        { data: otherObject.data },
                                    ],
                                },
                                title: link.data.title,
                            },
                            position: otherObject.positions,
                        };
                    });
                })
            );

            // Filter objects present or not in current board
            return [
                components.filter((link) =>
                    link.position
                        .map((position) => position.boardId)
                        .some((boardId) => boardId === this.$view.boardId)
                ),
                components.filter((link) =>
                    link.position
                        .map((position) => position.boardId)
                        .some((boardId) => boardId !== this.$view.boardId)
                ),
            ];
        },
    },

    methods: {
        groupBy(objectArray, property) {
            return objectArray.reduce((acc, item) => {
                const itemId = item[property];
                if (!acc[itemId]) {
                    acc[itemId] = [];
                }
                acc[itemId].push(item);
                return acc;
            }, {});
        },
        onDelete(object) {
            // Todo Boards selection is disabled
            this.$modal.show(
                "dialog",
                {
                    title: this.$t(`links.delete_title_singular`),
                    text: this.$t(`links.delete_content_singular`),
                    buttons: [
                        {
                            title: this.$t("modal.yes"),
                            default: true,
                            handler: () => {
                                this.$store.dispatch("linkAlive/delete", {
                                    worldId: this.$view.worldId,
                                    boardId: this.$view.boardId,
                                    document: [
                                        {
                                            linkId: object.link.linkId,
                                        },
                                    ],
                                });
                                this.$modal.hide("dialog");
                            },
                        },
                        {
                            title: this.$t("modal.no"),
                        },
                    ],
                },
                app.modal.parameters
            );
        },
        getLinkModel(linkModel) {
            this.$emit("select", linkModel);
        },
    },
};
</script>

<style>
.object-linked-inner-dropdown-menu .el-dropdown-menu__item {
    padding-left: 10px;
}
.object-linked-inner-dropdown-menu.vw-link-filter:hover
    .el-dropdown-menu__item.is-disabled
    img {
    filter: initial;
}
.object-linked-inner-dropdown-menu img {
    width: 17px;
}
.object-linked-inner-dropdown-menu .link-delete,
.object-linked-inner-dropdown-menu .board-list-name {
    font-size: 12px;
}
</style>

<style scoped>
.object-linked-wrapper {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
}

.object-linked {
    border: 1px solid #aeb1bb;
    width: var(--object-linked-width);
    height: var(--object-linked-height);
    margin-right: 20px;
    margin-bottom: 20px;
    position: relative;
    border-radius: var(--style-border-radius);
    overflow: hidden;
}

.object-linked-inner {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.object-linked-inner-dropdown {
    z-index: 1;
    position: absolute;
    top: 0px;
    right: 0px;
}
.object-linked-inner-dropdown button {
    border-radius: 0px;
    padding: 11px 0;
}

.object-view-data {
    transform-origin: center;
    flex-shrink: 0;
    flex-grow: 0;
    align-self: center;
}

.object-view-data >>> .el-form-item__content {
    pointer-events: none;
}

.object-view-data >>> .el-input__inner,
.object-view-data >>> .el-textarea__inner {
    background: none;
    border: none;
}
.el-dropdown-menu__item > div {
    display: flex;
    align-items: center;
}
.el-dropdown-menu__item > div h5 {
    opacity: 0.8;
    margin: 2px 10px;
    text-transform: uppercase;
}
div.present-object {
    text-align: left;
    font-size: 14px;
    font-weight: 600;
    width: max-content;
    margin-bottom: 20px;
}
.el-dropdown-menu__item > div img,
.el-dropdown-menu__item > div > span {
    margin: 2px 6px;
}
.link-label {
    position: absolute;
    top: 14px;
    left: 60px;
    width: 100%;
}
.anchors {
    position: absolute;
    box-sizing: border-box;
    z-index: 1;
}
</style>
