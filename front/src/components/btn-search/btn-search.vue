<template>
    <div
        v-show-granted:forOne="[
            'object-search',
            'position-alive/create-front',
            'position-alive/create-back',
            $view,
        ]"
    >
        <el-dropdown
            trigger="click"
            placement="top-end"
            @visible-change="focusInput"
            :hide-on-click="false"
        >
            <i
                class="btn-search-icon el-icon-search vw-link-color vw-center"
            ></i>

            <!-- TODO: design of input & results -->
            <el-dropdown-menu slot="dropdown" class="btn-search-menu">
                <el-dropdown-item>
                    <el-input
                        ref="btnInputSearch"
                        id="btn-search-input"
                        type="text"
                        size="mini"
                        v-model="search"
                        :placeholder="$t('search_bar.input_placeholder')"
                        :clearable="true"
                    />
                </el-dropdown-item>

                <btn-search-results :search="search" :refresh="refresh" />
            </el-dropdown-menu>
        </el-dropdown>
    </div>
</template>

<script>
// Components
import BtnSearchResults from "./btn-search-results";

export default {
    name: "BtnSearch",
    inject: ["$view"],
    components: {
        BtnSearchResults,
    },

    data() {
        return {
            search: "",
            refresh: 0,
        };
    },

    methods: {
        focusInput(dropdownIsOpen) {
            if (dropdownIsOpen === true) {
                this.refresh++;
                this.$nextTick(() => this.$refs.btnInputSearch.focus());
            }
        },
    },
};
</script>

<style scoped>
.btn-search-icon {
    font-size: 22px;
    width: 46px;
    height: 46px;
}

.btn-search-menu {
    z-index: var(--modal-z-index) !important;
    background: none;
    width: 302px;
    box-shadow: none;
    left: initial !important;
    right: 13px;
    top: 60px !important;
    padding: 0px;
    border: none;
}

.btn-search-menu >>> .el-dropdown-menu__item {
    padding: 0px;
}
.btn-search-menu >>> .popper__arrow {
    display: none;
}

#btn-search-input {
    width: 100%;
}
</style>
