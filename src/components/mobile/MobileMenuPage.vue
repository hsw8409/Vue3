<script setup lang="ts">
/**
 * @file     MobileMenuPage.vue
 * @menu     모바일 메뉴페이지
 * @author   astems
 * @since    2026-07-01
 * @version  1.0
 */

// ==================================================
// import 영역
// ==================================================
const emit = defineEmits<{
    (e: 'goPage', event: MouseEvent): void;
}>();
const pageClick = (event: MouseEvent) => {
    emit('goPage', event);
};
</script>

<template>
    <div id="container">
        <div>
            <button type="button" class="mobileMenu" value="UI_MOB_003" @click="pageClick">
                출고처리
            </button>
            <br />
            <button type="button" class="mobileMenu" value="UI_MOB_004" @click="pageClick">
                재고실사
            </button>
        </div>
    </div>
</template>
