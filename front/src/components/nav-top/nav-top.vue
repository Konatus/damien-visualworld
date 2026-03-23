<template>
    <header id="nav-top">
        <nav id="nav-top-start">
            <slot name="start" />
        </nav>

        <nav id="nav-top-middle">
            <slot name="middle" />
        </nav>

        <nav id="nav-top-end">
            <slot name="end" />
        </nav>
    </header>
</template>

<script>
export default {
    name: "NavTop",
};
</script>

<style scoped>
#nav-top-start,
#nav-top-middle,
#nav-top-end {
    display: flex;
    flex-direction: revert;
    align-items: center;
}

#nav-top-start > *,
#nav-top-middle > *,
#nav-top-end > * {
    display: flex;
    flex-direction: revert;
    align-items: center;
    height: 48px;
}
#nav-top-start >>> *,
#nav-top-middle >>> *,
#nav-top-end >>> * {
    max-height: 48px;
}
</style>
