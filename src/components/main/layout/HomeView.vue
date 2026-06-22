<script setup lang="ts">
import { shallowRef, watchEffect, defineAsyncComponent } from 'vue';
import type { Component } from 'vue'; // 💡 Vue에서 Component 타입을 가져옵니다.
import tokenService from '@/common/service/token';

// 💡 shallowRef 뒤에 <Component | null> 제네릭을 추가하여 타입을 확장합니다.
const CurrentDashboard = shallowRef<Component | null>(null);

// 비동기 컴포넌트 정의
const Dashboard01 = defineAsyncComponent(
    () => import('@/components/main/layout/dashboard/Dashboard_01.vue'),
);
const Dashboard02 = defineAsyncComponent(
    () => import('@/components/main/layout/dashboard/Dashboard_02.vue'),
);

watchEffect(() => {
    const user = tokenService.getUser();

    if (user && user.role === '100') {
        CurrentDashboard.value = Dashboard01; // 💡 이제 에러 없이 정상 할당됩니다.
    } else {
        CurrentDashboard.value = Dashboard02;
    }
});
</script>

<template>
    <component :is="CurrentDashboard" v-if="CurrentDashboard" />
</template>
