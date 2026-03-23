<template>
    <el-popover placement="top-end" trigger="click">
        <div id="btn-info-popover">
            <div class="vw-link-color" v-if="helpUrl">
                <a :href="helpUrl" target="_blank" rel="noopener noreferrer">{{
                    $t("info.help")
                }}</a>
            </div>
            <div class="vw-link-color" v-if="termsUrl">
                <a :href="termsUrl" target="_blank">{{ $t("info.terms") }}</a>
            </div>
            <div class="vw-link-color" v-if="mailToSupport">
                <a :href="`mailto:${mailToSupport}`" target="_blank">{{
                    mailToSupport
                }}</a>
            </div>
            <div class="btn-info-commit-version">
                <div>{{ $t("info.title") }}</div>
                <div>
                    {{ info.commit.slice(0, 10) }}
                    <span v-show-granted:root> {{ info.branch }} </span>
                </div>
            </div>
        </div>
        <el-button id="btn-info" class="vw-link-color" slot="reference" circle>
            ?
        </el-button>
    </el-popover>
</template>

<script>
import info from "../../info.json";

export default {
    name: "BtnInfo",
    data() {
        return {
            info,
        };
    },
    computed: {
        helpUrl() {
            return this.$store.state["connectionMe"].user.helpUrl;
        },
        termsUrl() {
            return this.$store.state["connectionMe"].user.termsUrl;
        },
        mailToSupport() {
            return this.$store.state["connectionMe"].user.supportMail;
        },
    },
};
</script>
<style>
#btn-info {
    --btn-info-size: 36px;
    --btn-info-font-size: 20px;
    width: var(--btn-info-size);
    height: var(--btn-info-size);
    padding: calc((var(--btn-info-size) - var(--btn-info-font-size)) / 2);
    font-size: var(--btn-info-font-size);
    color: var(--style-color-white);
    background: var(--style-color-main);
    border: none;
}

#btn-info-popover {
    font-size: 14px;
}
#btn-info-popover > *:not(:last-child) {
    margin-bottom: 10px;
}

.btn-info-commit-version {
    font-size: 12px;
}
</style>
