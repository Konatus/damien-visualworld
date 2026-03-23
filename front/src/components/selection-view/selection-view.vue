<template>
    <div
        id="selection-view"
        :class="{
            normal: isUserSelection,
            none: !isUserSelection,
        }"
        v-if="styleWrapper && !(isUserSelection && positionIds.length < 2)"
        :style="styleWrapper"
    >
        <div v-if="email" class="user-icon-tags" :style="styleUserTag">
            <el-tag :class="grantClass">
                <i v-if="edition" class="el-icon-edit"></i>
                <img
                    v-else
                    src="../../assets/icons/cursor/move.svg"
                    alt=""
                    srcset=""
                />
                {{ displayedName }}
            </el-tag>
        </div>
    </div>
</template>

<script>
import app from "../../conf/app";
import { getRect } from "../../utils/position";
export default {
    name: "SelectionView",

    props: {
        isUserSelection: Boolean,
        positionIds: Array,
        email: String,
        edition: Boolean,
        index: { type: Number, default: 0 },
    },
    inject: ["$view"],

    computed: {
        scaleSqrt() {
            return Math.sqrt(this.$store.getters[`panzoom/scale`]);
        },

        // Position of the selection
        styleWrapper() {
            try {
                const positions = this.positionIds.map((positionId) =>
                    this.$store.getters[`positionAlive/byId`](positionId)
                );
                if (positions.length < 1) {
                    return null;
                }

                const borderedPositions = positions.map(({ data }) => ({
                    data: {
                        zIndex: data.zIndex,
                        width: data.width,
                        height: data.height,
                        top: Math.min(
                            Math.max(0, data.top),
                            app.board.size.height - data.height
                        ),
                        left: Math.min(
                            Math.max(0, data.left),
                            app.board.size.width - data.width
                        ),
                    },
                }));

                const rect = getRect(borderedPositions);
                return {
                    left: `${rect.left}px`,
                    width: `${rect.width}px`,
                    top: `${rect.top}px`,
                    height: `${rect.height}px`,
                    outlineWidth: `${3 / this.scaleSqrt}px`,
                    zIndex: Math.min(
                        ...borderedPositions.map(
                            (position) => position.data.zIndex
                        )
                    ),
                };
            } catch (e) {
                return null;
            }
        },

        // Position of user tag
        styleUserTag() {
            try {
                return {
                    transform: `scale(${1.5 / this.scaleSqrt})translateY(${
                        (this.positionIds.length == 1 ? this.index : 0) * 100
                    }%)`,
                };
            } catch (e) {
                return null;
            }
        },

        // User, grant levels and their classes
        userData() {
            try {
                return this.$store.getters["connectionAll/byEmail"](this.email);
            } catch {
                return {};
            }
        },
        displayedName() {
            try {
                const out = [];
                if (this.userData.identity.firstname) {
                    out.push(this.userData.identity.firstname.trim());
                }
                if (this.userData.identity.lastname) {
                    const lastname = this.userData.identity.lastname.trim();
                    if (out.length === 0) {
                        out.push(lastname);
                    } else {
                        out.push(`${lastname.charAt(0)}.`);
                    }
                }
                if (out.length === 0) {
                    out.push(this.email.trim());
                }
                return out.join(" ");
            } catch (e) {
                return this.email.trim();
            }
        },
        grantLevel() {
            if (!this.$view.worldId && !this.$view.boardId) {
                if (this.userData.profile.app.isRoot) {
                    return { root: true };
                }
            }
            if (this.$view.worldId) {
                if (
                    this.userData.profile.app.isRoot &&
                    this.$store.getters["worldAlive/byId"](this.$view.worldId)
                        ?.data?.rootable
                ) {
                    return { root: true };
                }
            }
            if (this.userData.grantLevel) {
                return this.userData.grantLevel;
            }
            return {};
        },
        grantClass() {
            try {
                if (this.grantLevel.root) {
                    return "user-icon-root";
                }
                if (this.grantLevel.administrator) {
                    return "user-icon-wm";
                }
                if (this.grantLevel.modeler) {
                    return "user-icon-cm";
                }
                if (this.grantLevel.animator) {
                    return "user-icon-bm";
                }
                if (this.grantLevel.participant) {
                    return "user-icon-su";
                }
                if (this.grantLevel.observer) {
                    return "user-icon-so";
                }
                return "user-icon-none";
            } catch (e) {
                return "user-icon-none";
            }
        },
    },
};
</script>

<style scoped>
#selection-view {
    position: absolute;
    pointer-events: none;
}
#selection-view:before {
    content: " ";
    position: absolute;
    top: calc(-1 * var(--selection-margin));
    left: calc(-1 * var(--selection-margin));
    bottom: calc(-1 * var(--selection-margin));
    right: calc(-1 * var(--selection-margin));
    outline-style: dashed;
    pointer-events: none;
    outline-color: var(--color-select, #2196f3);
}
#selection-view.none:before {
    outline-color: var(--color-border-board);
}
.user-icon-tags {
    transform-origin: top left;
    position: absolute;
    left: 100%;
    top: 0;
}
</style>
