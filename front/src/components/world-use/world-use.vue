<template>
    <div id="world-use">
        <div v-if="displayGet">
            <el-tag
                :type="currentUse.dbSize >= maxUse.useMaxDbSize ? 'danger' : ''"
            >
                <span class="bold">
                    {{ this.$t("world.world_use.dbSize") }}
                </span>
                {{ currentUse.dbSize }}/{{ maxUse.useMaxDbSize }}
            </el-tag>

            <el-tag
                :type="
                    Math.max(...Object.values(currentUse.guest || {}), 0) >=
                    maxUse.useMaxGuest
                        ? 'danger'
                        : ''
                "
            >
                <span class="bold">
                    {{ this.$t("world.world_use.guests") }}
                </span>
                {{ Math.max(...Object.values(currentUse.guest || {}), 0) }}/{{
                    maxUse.useMaxGuest
                }}
            </el-tag>

            <el-tag
                :type="currentUse.user >= maxUse.useMaxUser ? 'danger' : ''"
            >
                <span class="bold">
                    {{ this.$t("world.world_use.users") }}
                </span>
                {{ currentUse.user }}/{{ maxUse.useMaxUser }}
            </el-tag>

            <el-tag
                :type="
                    currentUse.jiraProject >= maxUse.useMaxJiraProjects
                        ? 'danger'
                        : ''
                "
            >
                <span class="bold">
                    {{ this.$t("world.world_use.jiraProjects") }}
                </span>
                {{ currentUse.jiraProject }}/{{ maxUse.useMaxJiraProjects }}
            </el-tag>
        </div>

        <el-form
            v-show-granted:root
            v-if="displaySet"
            :label-position="'left'"
            label-width="350px"
        >
            <el-divider></el-divider>

            <el-form-item :label="$t('world.world_use.maxDbSize')">
                <el-input-number
                    :min="0"
                    v-model="maxUse.useMaxDbSize"
                    :step="0.1"
                    @change="doInput"
                    size="mini"
                ></el-input-number>
            </el-form-item>

            <el-form-item :label="$t('world.world_use.maxGuests')">
                <el-input-number
                    :min="0"
                    v-model="maxUse.useMaxGuest"
                    @change="doInput"
                    size="mini"
                ></el-input-number>
            </el-form-item>

            <el-form-item :label="$t('world.world_use.maxUsers')">
                <el-input-number
                    :min="0"
                    v-model="maxUse.useMaxUser"
                    @change="doInput"
                    size="mini"
                ></el-input-number>
            </el-form-item>

            <el-form-item :label="$t('world.world_use.maxJiraProject')">
                <el-input-number
                    :min="0"
                    v-model="maxUse.useMaxJiraProjects"
                    @change="doInput"
                    size="mini"
                ></el-input-number>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
import app from "../../conf/app";
export default {
    name: "WorldUse",

    props: {
        worldId: String,
        value: Object,
    },

    created() {
        this.$store.dispatch("worldUse/get", this);
    },

    computed: {
        displayGet() {
            return !!this.worldId;
        },
        displaySet() {
            return !!this.value;
        },
        currentUse() {
            try {
                return this.$store.state.worldUse[this.worldId].data;
            } catch (e) {
                return {};
            }
        },
        maxUse() {
            const out = JSON.parse(JSON.stringify(app.useMax));
            try {
                Object.assign(
                    out,
                    this.$store.getters["worldUse/byId"](this.worldId).private
                );
            } catch {
                /* Nothing to do */
            }
            return out;
        },
    },
    methods: {
        doInput() {
            this.$emit("input", this.maxUse);
            this.$emit("change", this.maxUse);
        },
    },
};
</script>

<style scoped>
el-form-item {
    display: flex-end;
    align-items: center;
}

#world-use > div {
    display: flex;
    justify-content: space-between;
}

#world-use > div > span:not(:last-child) {
    flex: 1;
    margin: 0px 20px 0px 0px;
}
</style>
