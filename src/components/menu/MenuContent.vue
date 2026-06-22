<script setup lang="ts"></script>
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
