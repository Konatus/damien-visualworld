<template>
    <div class="grid-view" :style="style" />
</template>
<script>
export default {
    name: "GridView",
    props: {
        colCount: Number,
        rowCount: Number,

        colSize: Number,
        rowSize: Number,
    },
    computed: {
        style() {
            return this.colSize && this.rowSize
                ? {
                      backgroundSize: `${this.colSize}px ${this.rowSize}px`,
                  }
                : this.colCount && this.rowCount
                ? {
                      backgroundSize: `${100 / this.colCount}% ${
                          100 / this.rowCount
                      }%`,
                  }
                : {
                      display: "none",
                  };
        },
    },
};
</script>
<style scoped>
.grid-view {
    display: grid;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;

    background-image: radial-gradient(
        circle at 1px 1px,
        var(--style-color-lightgrey) 0.5px,
        transparent 0
    );
    background-position: -1px -1px;
}
</style>
