<template>
    <div>
        <el-button-group>
            <el-button
                size="small"
                :disabled="undoableActionShow"
                @click="handleUndo"
                class="vw-link-filter"
            >
                <img
                    src="../../assets/icons/undo.svg"
                    style="transform: scaleY(-1)"
                    :alt="$t('icon.undo')"
                    :class="{ deactivated: undoableActionShow }"
                />
            </el-button>
            <el-button
                size="small"
                :disabled="redoableActionShow"
                @click="handleRedo"
                class="vw-link-filter"
            >
                <img
                    src="../../assets/icons/undo.svg"
                    style="transform: scaleY(-1) scaleX(-1)"
                    :alt="$t('icon.redo')"
                    :class="{ deactivated: redoableActionShow }"
                />
            </el-button>
        </el-button-group>
    </div>
</template>
<script>
const UNDO = "historyUndo";
const REDO = "historyRedo";

import { writable } from "../../utils/html.js";
export default {
    name: "BtnUndoRedo",

    data() {
        return {
            previousContentCache: [],
        };
    },
    created() {
        document.addEventListener("keydown", this.onKeyDown);
    },
    destroyed() {
        document.removeEventListener("keydown", this.onKeyDown);
    },
    computed: {
        redoableActionCount() {
            return this.undoActionsKeys.length - this.position;
        },
        undoableActionShow() {
            return !this.position;
        },
        redoableActionShow() {
            return !this.redoableActionCount;
        },
        undoActionsKeys() {
            return this.$store.getters["undoRedo/undoActions"];
        },
        position() {
            return this.$store.getters["undoRedo/position"];
        },
    },
    watch: {
        "$store.state.undoRedo.undoActions": {
            deep: true,
            handler(value) {
                const newObjectKeys = Object.keys(value).filter(
                    (item) => !this.previousContentCache.includes(item)
                );
                if (newObjectKeys.length) {
                    const removeKeys = this.undoActionsKeys.slice(
                        this.position - this.undoActionsKeys.length,
                        -1
                    );
                    if (removeKeys.length) {
                        this.$store.commit("undoRedo/reset", removeKeys);
                        this.previousContentCache =
                            this.previousContentCache.filter(
                                (item) => !removeKeys.includes(item)
                            );
                    }
                    this.$store.commit("undoRedo/redo");
                    this.previousContentCache = [
                        ...this.previousContentCache,
                        newObjectKeys[newObjectKeys.length - 1],
                    ];
                }
            },
        },
    },
    methods: {
        onKeyDown(evt) {
            if (
                (evt.ctrlKey || evt.metaKey) &&
                (evt.keyCode == 90 || evt.keyCode == 89) &&
                !writable({ tagName: document.activeElement.nodeName })
            ) {
                evt.preventDefault();
                if (
                    ((evt.shiftKey && evt.keyCode == 90) ||
                        (!evt.shiftKey && evt.keyCode == 89)) &&
                    !this.redoableActionShow
                ) {
                    this.handleRedo();
                } else if (
                    !evt.shiftKey &&
                    evt.keyCode == 90 &&
                    !this.undoableActionShow
                ) {
                    this.handleUndo();
                }
            }
        },

        handleUndo() {
            this.onUndoOrRedo(UNDO);
            this.$store.commit("undoRedo/undo");
        },

        handleRedo() {
            this.onUndoOrRedo(REDO);
            this.$store.commit("undoRedo/redo");
        },

        onUndoOrRedo(eventType) {
            const actionId =
                eventType === UNDO
                    ? this.undoActionsKeys[this.position - 1]
                    : this.undoActionsKeys[this.position];

            this.$store.dispatch("undoRedo/undo", {
                actionId,
                eventType,
            });
        },
    },
};
</script>
<style scoped>
.el-button:hover,
.el-button:focus {
    background: none;
    border: none;
    color: transparent;
}
button,
button:disabled {
    border-color: transparent;
}
button {
    --size: 46px;
    width: var(--size);
    height: var(--size);
    padding: 9px;
    font-size: 14px;
    transform: scaleY(-1);
}
.deactivated {
    filter: var(--style-filter-deactivated);
}
</style>
