<template>
    <div id="terms-template">
        <h3>{{ $t("terms.title") }}</h3>
        <div
            class="terms-description"
            v-html="$t('terms.descriptionHTML', { supportMail })"
        ></div>
        <div>
            <el-button @click="onDeclin">
                <h4>{{ $t("terms.declin.title") }}</h4>
                <p>{{ $t("terms.declin.description") }}</p>
            </el-button>
            <el-button type="success" @click="onAccept">
                <h4>{{ $t("terms.accept.title") }}</h4>
                <p>{{ $t("terms.accept.description") }}</p>
            </el-button>
        </div>
    </div>
</template>
<script>
export default {
    name: "TermOverlay",

    computed: {
        email() {
            return this.$store.getters[`connectionMe/email`];
        },
        worldIds() {
            return this.$store.getters[`worldAlive/asArray`].map(
                (world) => world.worldId
            );
        },
        signoutUrl() {
            return this.$store.state["connectionMe"].user.signoutUrl;
        },
        supportMail() {
            return this.$store.state["connectionMe"].user.supportMail;
        },
    },
    methods: {
        onAccept() {
            this.$store.dispatch("connectionMe/update", {
                data: {
                    email: this.email,
                    terms: new Date(),
                },
            });
        },
        onDeclin() {
            window.location = this.signoutUrl;
        },
    },
};
</script>

<style scoped>
#terms-template {
    padding: 20px;
    line-height: 1.5;
}

#terms-template h3 {
    text-align: center;
    margin-top: 0px;
}
#terms-template >>> a:hover,
h3 {
    color: var(--style-color-lightblue);
}
#terms-template >>> ul {
    list-style: none;
    padding: 0;
}
#terms-template >>> li {
    padding-left: 1.3em;
}
#terms-template >>> li:before {
    content: "-";
    font-family: inherit;
    font-weight: 600;
    display: inline-block;
    margin-left: -1em;
    width: 1em;
}

.terms-description {
    text-align: center;
    font-size: 14px;
}

#terms-template div:last-of-type {
    display: flex;
    justify-content: space-evenly;
    max-width: 90%;
    margin: 40px auto 0px auto;
}
#terms-template >>> button {
    border-radius: 20px;
    width: 45%;
}
#terms-template >>> button h4 {
    margin: 0;
}
#terms-template >>> button p {
    margin-bottom: 0;
    white-space: normal;
    line-height: 1.5;
    font-size: 0.8rem;
}
</style>
