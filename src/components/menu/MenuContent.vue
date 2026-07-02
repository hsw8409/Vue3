<script setup lang="ts">
/*
 * @file     MenuContent.vue
 * @menu     메뉴 컨텐츠 영역
 * @author   astems
 * @since    2026-06-25
 * @version  1.0
 */
</script>
<template>
    <div class="scroll_wrap">
        <div class="cont_wrap">
            <slot></slot>
        </div>
    </div>
</template>
<style>
.scroll_wrap {
    /* height:100vh; */
    height: calc(100%-30px);
    width: 100%;
    box-sizing: border-box;
    /* overflow: auto; */
}
.cont_wrap {
    flex: 1;
    display: flex;
    flex-direction: column;
    /* overflow: hidden; */
    height: 100%;
    margin-top: 5px;
}
</style>
