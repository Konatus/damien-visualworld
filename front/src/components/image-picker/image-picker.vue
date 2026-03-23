<template>
    <el-upload
        id="saved"
        v-if="value && value.length"
        action="#"
        list-type="picture-card"
        :disabled="disabled"
        :file-list="value"
        :on-remove="onRemove"
    />
    <el-upload
        id="upload"
        v-else
        drag
        :action="postUrl"
        :disabled="disabled"
        :on-success="onSuccess"
    >
        <i class="el-icon-upload"></i>
    </el-upload>
</template>
<script>
import jsonDeepCopy from "../../utils/json-deep-copy";
export default {
    name: "ImagePicker",
    props: {
        value: Array,
        postUrl: String,
        disabled: Boolean,
    },
    methods: {
        onSuccess(_, file) {
            const value = jsonDeepCopy(file.raw);
            value.url = this.postUrl;
            this.$emit("input", [value]);
        },
        onRemove() {
            this.$emit("input", []);
        },
    },
};
</script>
<style scoped>
#saved >>> .el-upload-list__item,
#upload >>> .el-upload-dragger {
    width: 148px;
    height: 148px;
}
#saved >>> .el-upload-list__item-thumbnail {
    object-fit: contain;
}
#saved >>> .el-upload-list__item-delete {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}
#saved >>> .el-upload--picture-card,
#saved >>> .el-upload-list__item-status-label,
#upload >>> .el-upload-list {
    display: none;
}
</style>
