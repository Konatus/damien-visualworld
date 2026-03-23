<template>
    <div id="modal-world-data" class="modal-data vue-dialog">
        <el-button
            id="btn-close-world-data"
            class="modal-btn-close"
            @click="onClose()"
            size="mini"
            icon="el-icon-close"
            type="info"
        />

        <div id="data-header" class="modal-header">
            <span class="modal-title">
                {{ $t("home.modal.create_world_title_modal") }}
            </span>
        </div>

        <el-form ref="data" :model="world" :rules="rules" label-width="120px">
            <el-form-item
                :label="$t('home.modal.create_world_name')"
                prop="name"
            >
                <el-input ref="name" v-model="world.name"></el-input>
            </el-form-item>

            <el-form-item
                :label="$t('home.modal.create_world_team')"
                prop="team"
            >
                <el-input v-model="world.team"></el-input>
            </el-form-item>
            <el-form-item
                :label="$t('home.modal.create_world_owner')"
                prop="owner"
            >
                <el-input v-model="world.owner"></el-input>
            </el-form-item>
            <el-form-item>
                <world-use v-model="world.limits" />
            </el-form-item>
        </el-form>

        <div class="vue-dialog-buttons" style="padding-left: 120px">
            <el-button
                size="mini"
                type="submit"
                @click="submitForm('data')"
                class="el-button--success"
            >
                <template>
                    {{ $t("home.modal.create_world_submit") }}
                </template>
            </el-button>
            <el-button class="vw-link-color" size="mini" @click="onClose()">{{
                $t("modal.submit.cancel")
            }}</el-button>
        </div>
    </div>
</template>

<script>
import WorldUse from "../world-use/world-use";
import app from "../../conf/app";

export default {
    name: "WorldData",

    components: {
        WorldUse,
    },

    props: {
        worldId: String,
        callback: Function,
    },

    data() {
        return {
            world: {
                name: "",
                team: "",
                owner: "",
                limits: app.useMax,
            },
            rules: {
                name: [
                    {
                        required: true,
                        message: this.$t("home.modal.create_world_name_error"),
                        trigger: "blur",
                    },
                ],
                owner: [
                    {
                        type: "email",
                        message: this.$t(
                            "home.modal.create_world_owner_wrong_email"
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
                    const {
                        name,
                        team,
                        owner,
                        limits: {
                            useMaxDbSize,
                            useMaxGuest,
                            useMaxUser,
                            useMaxJiraProjects,
                        },
                    } = this.world;

                    this.$store.dispatch("worldAlive/create", {
                        data: {
                            name,
                            team,
                            owner,
                        },
                        limits: {
                            useMaxDbSize,
                            useMaxGuest,
                            useMaxUser,
                            useMaxJiraProjects,
                        },
                    });

                    this.onClose();
                    if (this.callback) {
                        this.callback(this.world);
                    }
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
.vw-link-color.el-button:hover {
    background: none;
}
</style>
