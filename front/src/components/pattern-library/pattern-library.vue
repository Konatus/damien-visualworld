<template>
    <div>
        <div id="library-title">
            <slot name="library-title" />
        </div>

        <div id="library-header">
            <div id="header-start">
                <slot name="header-start" />
            </div>

            <div id="header-middle">
                <slot name="header-middle" />
            </div>

            <div id="header-end">
                <slot name="header-end" />
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "PatternLibrary",
};
</script>

<style>
.library-list {
    position: absolute;
    bottom: 50px;
    top: 150px;
    left: 30px;
    right: 30px;
    z-index: 1;

    padding: 1px 0px 0px 0px;
    margin: 0px;

    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-content: flex-start;

    user-select: none;
    overflow-y: auto;
}

/* Component wrapper */
.library-list > li {
    list-style-type: none;
    overflow: hidden;
    margin-left: 10px;
    margin-bottom: 10px;
    border-radius: var(--style-border-radius);
    height: max-content;
    position: relative;
}
</style>

<style scoped>
/* Library header */
#library-title {
    font-size: 18px;
    font-weight: 700;
    position: relative;
    top: -10px;
}

#library-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 20px;
    margin-bottom: 30px;
}

#library-header >>> * {
    display: flex;
    align-items: center;
}

#library-header #header-start {
    width: 41%;
}
#library-header #header-middle {
    width: 20%;
}
#library-header #header-end {
    width: 35%;
}

/* Library elements creation */
#library-header >>> span {
    color: var(--color-main-font);
    font-size: 14px;
    font-weight: 700;
}

#header-start button {
    background: #f1f1f4;
    border: 1px solid #dedee2;
    border-radius: 26px;
    padding: 3px;
    display: flex;
    align-items: center;
    z-index: var(--modal-z-index);
}
#library-header button > span {
    margin: 0 10px;
}

#header-start > * {
    margin-left: 10px;
}
#header-start button > div {
    border-radius: 100%;
    background: white;
    width: 34px;
    height: 34px;
}

/*  Library search */
#header-end >>> .el-input {
    height: 100%;
}
</style>
