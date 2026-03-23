<template>
    <div
        id="board-toolbar"
        class="vw-card"
        :style="position"
        v-if="show"
        v-show="selectedPositionIds.length || selectedLinkIds.length"
        v-if-granted:forOne="[
            'position-alive/update-front',
            'position-alive/update-back',
            $view,
        ]"
        @touchstart="doEmulateMouseEvent"
    >
        <link-toolbar v-if="selectedLinkIds.length" />
        <object-toolbar v-else-if="selectedPositionIds.length" />

        <!-- hidden toolbar for positions paste even if if no object nor link is selected -->
        <object-toolbar v-if="!selectedPositionIds.length" v-show="false" />
    </div>
</template>
<script>
const SIZE_ADJUST = 0.8;
const MARGIN = 30; //px
const WRAPPER_NODE = "body";
const NAV_NODES =
    "#pattern-board-head-start,#pattern-board-head-end,#pattern-board-aside,#pattern-board-drawer";
const OBJECT_WIDTH = 556 * SIZE_ADJUST;
const OBJECT_HEIGHT = 44 * SIZE_ADJUST;
const LINK_WIDTH = 796 * SIZE_ADJUST;
const LINK_HEIGHT = 44 * SIZE_ADJUST;
import { getScreenPosition } from "../../utils/scale";
import { include, match } from "../../utils/position";

import ObjectToolbar from "../object-toolbar/object-toolbar.vue";
import LinkToolbar from "../link-toolbar/link-toolbar.vue";
export default {
    name: "BoardToolbar",
    components: {
        ObjectToolbar,
        LinkToolbar,
    },
    props: {
        show: {
            type: Boolean,
            default: false,
        },
    },
    inject: ["$view"],
    computed: {
        selectedPositionIds() {
            return this.$store.getters[
                `app/objectsInBoard/selectedPositionIds`
            ];
        },
        selectedLinkIds() {
            return this.$store.getters[`app/objectsInBoard/selectedLinkIds`];
        },
        position() {
            const ignoredOnlyForReactivity =
                this.$store.getters[`app/objectsInBoard/drawerMounted`];
            const clickPosition = {
                data: {
                    ...this.$store.getters[`app/objectsInBoard/selectPosition`],
                    width: 0,
                    height: 0,
                },
            };
            const selectedPositions = this.$store.getters[
                `app/objectsInBoard/selectedPositionIds`
            ].map((positionId) =>
                this.$store.getters[`positionAlive/byId`](positionId)
            );
            return this.findValidPosition(
                this.$store,
                selectedPositions.length ? selectedPositions : [clickPosition],
                {
                    isObj: selectedPositions.length,
                }
            );
        },
        boardToolbar_hasUpdateGrant() {
            const socketName = this.$store.getters[
                `app/objectsInBoard/activeLayerIsForeground`
            ]
                ? "position-alive/update-front"
                : "position-alive/update-back";
            return this.$store.getters[`connectionMe/isGrantedFor`](
                [socketName],
                this.$view
            );
        },
    },
    methods: {
        findValidPosition(store, positions, { isObj }) {
            if (!Array.isArray(positions) || !positions.length) {
                return null;
            }

            const scale = store.getters[`panzoom/scale`];
            const scaledMargin = MARGIN / Math.sqrt(scale);
            const scaledToolbarSize = {
                width: (isObj ? OBJECT_WIDTH : LINK_WIDTH) / scale,
                height: (isObj ? OBJECT_HEIGHT : LINK_HEIGHT) / scale,
            };

            const getScreenPositionPlusPlus = (node) => {
                const rect = node.getBoundingClientRect();
                const { left, top } = store.getters[`panzoom/scene`];
                return {
                    ...getScreenPosition(
                        store.getters[`panzoom/x`] + left - rect.left,
                        store.getters[`panzoom/y`] + top - rect.top,
                        scale,
                        rect.width,
                        rect.height
                    ),
                    node,
                };
            };
            const screen = [...document.querySelectorAll(WRAPPER_NODE)].map(
                getScreenPositionPlusPlus
            )[0];
            const navPositions = [...document.querySelectorAll(NAV_NODES)].map(
                getScreenPositionPlusPlus
            );
            const objectPositions = positions
                .map((position) => position.data)
                .sort((a, b) =>
                    a.top != b.top ? a.top - b.top : a.left - b.left
                );
            // [ screen, ...navPositions ].forEach( item => this.debugShowPosition( item ) )

            const position = (() => {
                for (let objectPosition of objectPositions) {
                    for (let func of [
                        ({ left, top, zIndex }) => ({
                            ...scaledToolbarSize,
                            left: left - (zIndex ? scaledMargin : 0),
                            bottom: top - (zIndex ? scaledMargin : 0),
                        }), // on top left
                        ({ left, width, top, zIndex }) => ({
                            ...scaledToolbarSize,
                            right: left + width + (zIndex ? scaledMargin : 0),
                            bottom: top - (zIndex ? scaledMargin : 0),
                        }), // on top right
                        ({ left, width, top, zIndex }) => ({
                            ...scaledToolbarSize,
                            left: left + width + (zIndex ? scaledMargin : 0),
                            top: top - (zIndex ? scaledMargin : 0),
                        }), // on right top
                        ({ left, width, top, height, zIndex }) => ({
                            ...scaledToolbarSize,
                            left: left + width + (zIndex ? scaledMargin : 0),
                            bottom: top + height + (zIndex ? scaledMargin : 0),
                        }), // on right bottom
                        ({ left, top, height, zIndex }) => ({
                            ...scaledToolbarSize,
                            left: left - (zIndex ? scaledMargin : 0),
                            top: top + height + (zIndex ? scaledMargin : 0),
                        }), // on bottom left
                        ({ left, width, top, height, zIndex }) => ({
                            ...scaledToolbarSize,
                            right: left + width + (zIndex ? scaledMargin : 0),
                            top: top + height + (zIndex ? scaledMargin : 0),
                        }), // on bottom right
                        ({ left, top, zIndex }) => ({
                            ...scaledToolbarSize,
                            right: left - (zIndex ? scaledMargin : 0),
                            top: top - (zIndex ? scaledMargin : 0),
                        }), // on left top
                        ({ left, top, height, zIndex }) => ({
                            ...scaledToolbarSize,
                            right: left - (zIndex ? scaledMargin : 0),
                            bottom: top + height + (zIndex ? scaledMargin : 0),
                        }), // on left bottom
                    ]) {
                        const toolbarPosition = func(objectPosition);
                        const otherPositions = objectPosition.zIndex
                            ? objectPositions.filter(
                                  (x) => x !== objectPosition
                              )
                            : [];
                        if (
                            this.positionIsValid(
                                toolbarPosition,
                                [screen],
                                [...navPositions, ...otherPositions]
                            )
                        ) {
                            return toolbarPosition;
                        }
                    }
                    return null;
                }
            })();
            return position
                ? {
                      transform: `scale(${SIZE_ADJUST / scale}) translate(${
                          position.left ? "0%" : "-100%"
                      }, ${position.top ? "0%" : "-100%"})`,
                      top: `${position.top || position.bottom}px`,
                      left: `${position.left || position.right}px`,
                      "transform-origin": "top left",
                      "max-height": `${
                          (isObj ? OBJECT_HEIGHT : LINK_HEIGHT) / SIZE_ADJUST
                      }px`, // avoid "transition" with both object & link toolbars
                  }
                : {
                      display: "none",
                  };
        },
        positionIsValid(toolbar, mustInclude, mustNotMatch) {
            for (let must of mustInclude) {
                if (!include(must, toolbar)) {
                    return false;
                }
            }
            for (let mustNot of mustNotMatch) {
                if (match(mustNot, toolbar)) {
                    return false;
                }
            }
            return true;
        },
        doEmulateMouseEvent(evt) {
            const clickEvt = new Event("click", {});
            const moveEvt = new Event("mouseenter", {});
            for (let target of evt.path) {
                if (target.id === this.$el.id) {
                    break;
                }
                target.dispatchEvent(clickEvt);
                target.dispatchEvent(moveEvt);
            }
        },

        // debugShowPosition( src ){
        //     console.log( 'debugShowWrapper', src )
        //     const _id = src?.node?.id || src?.node?.tagName
        //     if( !src.left ){ src.left = src.right - src.width }
        //     if( !src.top ){ src.top = src.bottom - src.height }
        //     this.$store.commit( `positionAlive/set`, [{
        //         _id,
        //         objectId: _id,
        //         data: src,
        //         protect: {
        //             isBackground: true,
        //         },
        //         private: {},
        //     }] )
        //     this.$store.commit( `object/set`, [{
        //         _id,
        //         data: {
        //             description: _id,
        //         },
        //         protect: {
        //             styleBackgroundColor: 'lightblue',
        //             styleOutlineColor: 'blue',
        //             isBackground: true,
        //         },
        //         private: {},
        //     }] )
        // }
    },
};
</script>
<style>
:root {
    --board-toolbar-box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.12);
}

@keyframes delayed {
    0% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
}
#board-toolbar {
    animation: delayed 0.2s steps(1, end);
    position: absolute;
    z-index: var(--max-z-index);
    border-radius: var(--style-border-radius);
    box-shadow: var(--board-toolbar-box-shadow);
    overflow: hidden;
    margin: 0;
    padding-left: 6px;
}
#board-toolbar .el-divider {
    margin: 0;
    height: 44px !important;
}
#board-toolbar .el-menu-item,
#board-toolbar .el-submenu__title {
    padding: 0;
    height: unset;
    line-height: unset;
}
#board-toolbar .el-submenu__icon-arrow {
    display: none;
}
#board-toolbar,
#board-toolbar .el-menu,
#board-toolbar .el-menu-item,
#board-toolbar .el-submenu__title {
    border-bottom: none;
}
#board-toolbar .board-toolbar-button,
#board-toolbar .board-toolbar-jira-sync-button {
    padding: 6px 7px;
    margin: 0 5px;
}
</style>
