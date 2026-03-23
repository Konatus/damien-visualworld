<template>
    <div id="link-model-edit">
        <header class="component-form-header">
            <h3>{{ titleForm }}</h3>
            <div>
                <el-button
                    size="small"
                    type="submit"
                    @click="onSubmit('form')"
                    class="el-button--success"
                >
                    {{ $t("link_model_edit.submit.validate") }}
                </el-button>
                <el-button
                    size="small"
                    v-if="displayCancel"
                    @click="onCancel()"
                    class="vw-link-color"
                >
                    {{ $t("link_model_edit.submit.cancel") }}
                </el-button>
            </div>
        </header>
        <main>
            <link-icon :linkModel="{ data: liveData }" size="large" />
            <aside>
                <el-form
                    :model="liveData"
                    ref="form"
                    id="link-model-edit-definition-form"
                >
                    <div class="link-type">
                        <el-form :rules="rules" @submit.prevent.native>
                            <el-form-item
                                prop="data.name"
                                :label="$t('link_model_edit.name_label')"
                            >
                                <el-input
                                    type="text"
                                    v-model="liveData.name"
                                    :placeholder="
                                        $t('link_model_edit.name_placeholder')
                                    "
                                    size="small"
                                />
                            </el-form-item>
                            <el-form-item
                                prop="data.description"
                                :label="$t('link_model_edit.description_label')"
                            >
                                <el-input
                                    class="link-model-description"
                                    type="textarea"
                                    resize="none"
                                    :placeholder="
                                        $t(
                                            'link_model_edit.description_placeholder'
                                        )
                                    "
                                    v-model="liveData.description"
                                    autosize
                                    :rows="3"
                                />
                            </el-form-item>
                        </el-form>
                    </div>
                    <el-menu class="link-style" mode="horizontal">
                        <li>
                            <link-toolbar-property
                                property="size"
                                :label="false"
                                v-model="liveData.size"
                            />
                            <link-toolbar-property
                                property="dash"
                                :label="false"
                                v-model="liveData.dash"
                            />
                            <link-toolbar-property
                                property="curve"
                                :label="false"
                                v-model="liveData.curve"
                            />
                        </li>
                        <el-submenu index="4" class="link-model-edit-color">
                            <template slot="title">
                                <color-picker
                                    mode="link"
                                    :data-color="$t('links.color')"
                                    v-model="liveData.color"
                                />
                            </template>
                        </el-submenu>
                        <li>
                            <link-toolbar-property
                                property="anchor-start"
                                :label="false"
                                v-model="liveData.anchors[0].data.type"
                            />
                            <link-toolbar-property
                                property="anchor-end"
                                :label="false"
                                v-model="liveData.anchors[1].data.type"
                            />
                        </li>
                    </el-menu>
                </el-form>
            </aside>
        </main>
    </div>
</template>
<script>
import app from "../conf/app";
import jsonDeepCopy from "../utils/json-deep-copy";
import ColorPicker from "../components/color-picker/color-picker.vue";
import LinkToolbarProperty from "../components/link-toolbar/link-toolbar-property.vue";
import LinkIcon from "../components/link-icon/link-icon.vue";
export default {
    name: "LinkModelEdit",

    components: {
        ColorPicker,
        LinkToolbarProperty,
        LinkIcon,
    },

    props: {
        worldId: String,
        titleForm: String,
        displayCancel: Boolean,
        submitCallback: Function,
        link: Object,
        updateLink: Boolean,
    },
    data() {
        const defaultLink = jsonDeepCopy(app.defaultLink);
        const defaultLinkObject = jsonDeepCopy(app.defaultLinkObject).map(
            (data) => ({ data })
        );
        const liveData = jsonDeepCopy({
            ...(this.updateLink ? this.link.data : defaultLink),
            anchors: this.updateLink
                ? this.link.data.anchors
                : defaultLinkObject,
        });
        return {
            defaultLink,
            defaultLinkObject,
            liveData,
            rules: {
                required: true,
                message: this.$i18n.t("link_model_edit.required.name"),
                trigger: "change",
            },
        };
    },

    computed: {
        displayedInModal() {
            try {
                return this.$parent.$options._componentTag === "modal";
            } catch (e) {
                return false;
            }
        },
    },

    methods: {
        onSubmit(refToForm) {
            this.$refs[refToForm].validate((/* valid*/) => {
                if (
                    this.liveData.name == undefined ||
                    this.liveData.name == ""
                ) {
                    return;
                } else {
                    this.submitCallback({ data: this.liveData });
                    this.onCancel();
                }
            });
        },

        // On cancel, close the modal
        onCancel() {
            this.doCloseModal();
        },

        // If opened in a modal, close it
        doCloseModal() {
            if (this.displayedInModal) {
                this.$emit("close");
            }
        },
    },
};
</script>
<style scoped>
.el-button.vw-link-color:hover {
    background: none;
}
.component-form-header {
    border-radius: var(--style-border-radius) var(--style-border-radius) 0 0;
    border-bottom: 2px solid var(--link-data-inline-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 30px;
    height: 68px;
}
h3 {
    font-size: 1.2rem;
    color: var(--link-title-color);
}
main {
    position: absolute;
    top: 110px;
    bottom: 0px;
    left: 0px;
    right: 0px;
    display: flex;
}

main >>> svg {
    width: 65%;
}

aside {
    border-left: 2px solid var(--link-data-inline-border);
    width: 35%;
}
#link-model-edit-definition-form {
    padding: 30px 30px 10px 30px;
    margin: 0 auto;
    width: 70%;
    min-width: 210px;
}

/* #link-model-edit-definition-form .link-type span,
    #link-model-edit-definition-form .link-style span {
        color: var(--link-title-color);
        display: inline-block;
    } */

#link-model-edit-definition-form .link-style > li > div {
    width: 70px;
    display: inline-block;
}
.link-model-description >>> textarea {
    height: inherit !important;
    font-size: 13px;
}
#link-model-edit {
    height: 100%;
}

#link-model-edit .el-form-item {
    margin: 0px;
}

#link-model-edit .el-form-item:first-child {
    margin-bottom: 20px;
}
</style>
<style>
#link-model-edit .el-menu {
    border-bottom: none;
}
#link-model-edit .el-submenu__icon-arrow {
    display: none;
}
#link-model-edit-definition-form .board-toolbar-button.vw-triangle:before {
    bottom: -14px;
}
</style>
