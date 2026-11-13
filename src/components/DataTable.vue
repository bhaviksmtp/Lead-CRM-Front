<template>
  <DataTableComponent v-bind="$attrs">
    <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps"></slot>
    </template>
  </DataTableComponent>
</template>

<script setup>
import DataTableComponent from './common/DataTable.vue';
</script>
