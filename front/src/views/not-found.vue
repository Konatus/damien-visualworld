<template>
    <div class="background-dark">
        <header>
            <router-link :to="{ name: 'worldsOfUniverse' }">
                <img
                    src="../assets/vw-full-light-rgb.svg"
                    :alt="$t('icon.VW')"
                />
            </router-link>
        </header>
        <main>
            <h1>
                <span v-for="(char, index) in title" :key="index">{{
                    char
                }}</span>
            </h1>
            <div>{{ $t(subtitle) }}</div>
            <p>{{ $t(message) }}</p>
            <router-link
                v-if="$route.params.value !== 'access'"
                :to="{ name: 'worldsOfUniverse' }"
            >
                <el-button icon="el-icon-arrow-left">{{
                    $t("not_found.back_to_home")
                }}</el-button>
            </router-link>
        </main>
        <div class="background-image" />
    </div>
</template>

<script>
export default {
    name: "NotFound",
    provide() {
        return {
            $view: {},
        };
    },
    computed: {
        title() {
            switch (this.$route.params.value) {
                case "access":
                    return ""; // waiting for model
                case "world":
                    return "404";
                case "board":
                    return "404";
                case "grant":
                    return "401";
                default:
                    return "404";
            }
        },
        subtitle() {
            switch (this.$route.params.value) {
                case "access":
                    return ""; // waiting for model
                case "world":
                    return "not_found.subtitle.not_found_world";
                case "board":
                    return "not_found.subtitle.not_found_board";
                case "grant":
                    return "not_found.subtitle.not_granted";
                default:
                    return "not_found.subtitle.not_found_page";
            }
        },
        message() {
            switch (this.$route.params.value) {
                case "access":
                    return ""; // waiting for model
                case "world":
                    return "not_found.message.not_found_world";
                case "board":
                    return "not_found.message.not_found_board";
                case "grant":
                    return "not_found.message.not_granted";
                default:
                    return "not_found.message.not_found_page";
            }
        },
    },
};
</script>
<style scoped>
header {
    z-index: 1;
    position: fixed;
}
header img {
    margin: 20px;
    height: 40px;
}
main {
    z-index: 1;
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
main h1 {
    font-size: 16rem;
    margin: 0;
}
main h1 span:nth-child(1) {
    color: #6d7385;
}
main h1 span:nth-child(2) {
    color: #ffffff;
}
main h1 span:nth-child(3) {
    color: #e3a51a;
}
main div {
    font-size: 1.75rem;
}
main p {
    color: #ffffff;
    font-size: 1.75rem;
}

main >>> button {
    background: transparent;
    color: #ffffff;
    margin: 20px;
    padding: 15px 20px;
    font-size: 21px;
}
</style>
