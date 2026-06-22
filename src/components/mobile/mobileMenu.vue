<script setup>
const emit = defineEmits(['goPage']);
const pageClick = function (event) {
  emit('goPage', event);
};
</script>

<template>
  <div id="container">
    <!--- S : 버튼 -->
    <div>
      <!-- <button type="button" class="mobileMenu" value='UI_MOB_002' @click="pageClick" >
                <span>입고처리</span>
            </button> -->
      <!-- <br/> -->
      <button type="button" class="mobileMenu" value="UI_MOB_003" @click="pageClick">
        출고처리
      </button>
      <br />
      <button type="button" class="mobileMenu" value="UI_MOB_004" @click="pageClick">
        재고실사
      </button>
    </div>
    <!--- E : 버튼 -->
  </div>
</template>
