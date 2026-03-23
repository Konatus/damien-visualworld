<template>
    <div id="modal-board-data" class="modal-data vue-dialog">
        <el-button
            id="btn-close-board-data"
            class="modal-btn-close"
            @click="onClose()"
            size="mini"
            icon="el-icon-close"
            type="info"
        />

        <div id="data-header" class="modal-header">
            <span class="modal-title">
                {{
                    $t(
                        `home.modal.create_board${
                            isTemplate ? "_template" : ""
                        }_title_modal`
                    )
                }}
            </span>
        </div>

        <el-form
            id="board-data"
            ref="data"
            :model="board"
            :rules="rules"
            label-position="top"
            size="small"
            @submit.prevent.native
        >
            <el-form-item
                :label="
                    $t(
                        `home.modal.create_board${
                            isTemplate ? '_template' : ''
                        }_name`
                    )
                "
                prop="name"
            >
                <el-input ref="name" v-model="board.name"></el-input>
            </el-form-item>

            <el-form-item
                :label="
                    $t(
                        `home.modal.create_board${
                            isTemplate ? '_template' : ''
                        }_description`
                    )
                "
            >
                <el-input type="textarea" :rows="5" v-model="board.description">
                </el-input>
            </el-form-item>
        </el-form>

        <div class="vue-dialog-buttons el-input--small">
            <el-button
                size="small"
                type="submit"
                class="el-button--success"
                @click="submitForm('data')"
            >
                <template>
                    {{
                        $t(
                            `home.modal.create_board${
                                isTemplate ? "_template" : ""
                            }_submit`
                        )
                    }}
                </template>
            </el-button>
            <el-button class="vw-link-color" size="small" @click="onClose()">{{
                $t(`modal.submit.cancel`)
            }}</el-button>
        </div>
    </div>
</template>

<script>
export default {
    name: "BoardData",

    props: {
        callback: Function,
        isTemplate: Boolean,
    },

    data() {
        return {
            board: {
                name: "",
                description: "",
            },
            rules: {
                name: [
                    {
                        required: true,
                        message: this.$t(
                            `home.modal.create_board${
                                this.isTemplate ? "_template" : ""
                            }_name_error`
                        ),
                        trigger: "blur",
                    },
                ],
            },
        };
    },

    mounted() {
        this.$refs.name.$el.children[0].focus();
    },

    methods: {
        submitForm(formName) {
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    this.callback(this.board);
                    this.onClose();
                } else {
                    return false;
                }
            });
        },
        onClose() {
            this.$emit("close");
        },
    },
};
</script>

<style scoped>
#errors {
    margin: 0 20px;
    font-size: 0.65em;
    padding: 4px 10px;
    border: 1px solid darkgray;
    border-radius: var(--style-border-radius);
    color: var(--color-error-input);
}

.el-input--small {
    width: 85%;
}

.vw-link-color.el-button:hover {
    background: none;
}
</style>
