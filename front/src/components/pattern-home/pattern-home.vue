<template>
    <section class="vw-flex-row">
        <div id="pattern-home-side" class="vw-flex-col">
            <img
                id="pattern-home-side-logo"
                src="../../assets/vw-full-rgb.svg"
                :alt="$t('icon.VW')"
            />
            <div class="vw-flex-payload">
                <slot name="side-start" />
            </div>
            <div id="pattern-home-side-end">
                <slot name="side-end" />
            </div>
        </div>
        <div id="pattern-home-main" class="vw-flex-payload vw-flex-col">
            <div id="pattern-home-alert">
                <slot name="alert" />
            </div>
            <div class="vw-flex-payload">
                <slot name="default" />
            </div>
            <div id="pattern-home-foot" class="vw-flex-row">
                <div class="vw-flex-row vw-flex-center">
                    <slot name="foot-start" />
                </div>
                <div class="vw-flex-row vw-flex-center">
                    <slot name="foot-end" />
                </div>
            </div>
        </div>
        <modals-container />
    </section>
</template>
<script>
export default {
    name: "PatternHome",
};
</script>
<style>
#pattern-home-side {
    width: 296px;
    border-right: 4px solid #dedee2;
    background: var(--style-color-white);
}
#pattern-home-side-logo {
    width: 160px;
    margin: 30px;
    margin-bottom: 0;
}
#pattern-home-side-end {
    margin: 15px 10px;
}
#pattern-home-main {
    background: #f1f1f4;
}
#pattern-home-alert {
    max-height: 50px;
}
#pattern-home-foot {
    max-height: 36px;
    padding: 16px 21px;
}
</style>
