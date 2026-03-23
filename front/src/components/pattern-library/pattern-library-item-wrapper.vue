<template>
    <div class="item-wrapper">
        <div class="item-wrapper-header">
            <slot name="item-wrapper-header"></slot>
        </div>

        <div class="item-wrapper-footer">
            <slot name="item-wrapper-footer"></slot>
        </div>
    </div>
</template>

<script>
export default {
    name: "PatternLibraryItemWrapper",
};
</script>

<style scoped>
.item-wrapper {
    position: relative;
    border: 2px solid var(--color-border-board);
    border-radius: var(--style-border-radius);
    width: 250px;
    height: 230px;
    overflow: hidden;
}

.item-wrapper-header {
    width: 100%;
    height: 60%;
    background: var(--layer-background);
}

/* Item wrapper footer */
.item-name {
    margin: 0px 0px 15px 0px;
    font-weight: 700;
    font-size: 14px;
    height: 25px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.item-wrapper-footer {
    border-top: 2px solid #dedee2;
    padding: 10px;
    background: white;
}

.item-wrapper-footer-actions {
    display: flex;
    align-items: center;
    height: 25px;
    margin-top: 20px;
}

.item-wrapper-footer-actions > * {
    margin-right: 5px;
}

.item-wrapper-footer-actions > button {
    width: 85px;
}

.item-wrapper-footer-actions > button:first-child {
    padding: 5px 0px;
}

.btn-item-edit >>> img {
    height: 15px;
}

.item-wrapper-footer-actions .item-dropdown >>> .el-button {
    padding: 0px;
}

.btn-item-edit {
    padding: 4px 6px;
    align-items: center;
    margin-left: 0px;
}

.btn-item-edit >>> span {
    align-items: center;
    display: flex;
    justify-content: space-around;
}
</style>
