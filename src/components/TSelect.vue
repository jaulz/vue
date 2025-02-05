<template>
  <select
    v-model="localValue"
    :multiple="configuration.multiple"
    v-bind="attributes"
  >
    <t-select-option
      v-for="(option, index) in normalizedOptions"
      :key="`${option.value}-${index}`"
      :option="option"
    />
  </select>
</template>

<script lang="ts">
import {
  InputOptions, NormalizedOption, NormalizedOptions, TSelectConfig,
} from '@variantjs/core';
import { defineComponent, PropType, computed } from 'vue';
import { Truthy, TSelectOptions, TSelectValue } from '../types';
import TSelectOption from './TSelect/TSelectOption.vue';
import useMulipleableVModel from '../use/useMulipleableVModel';
import useMultioptions from '../use/useMultioptions';
import useConfiguration from '../use/useConfiguration';
import { getVariantProps } from '../utils/getVariantProps';

// @vue/component
export default defineComponent({
  name: 'TSelect',
  compatConfig: {
    MODE: 3,
  },
  components: {
    TSelectOption,
  },
  props: {
    ...getVariantProps<TSelectOptions>(),
    modelValue: {
      type: [String, Number, Boolean, Array, Object, Date, Function, Symbol] as PropType<TSelectValue>,
      default: undefined,
    },
    options: {
      type: [Array, Object] as PropType<InputOptions | NormalizedOption[] | NormalizedOptions>,
      default: undefined,
    },
    normalizeOptions: {
      type: Boolean,
      default: true,
    },
    valueAttribute: {
      type: String,
      default: undefined,
    },
    textAttribute: {
      type: String,
      default: undefined,
    },
    multiple: {
      type: [String, Boolean] as PropType<Truthy>,
      default: false,
    },
  },
  setup(props) {
    const { configuration, attributes } = useConfiguration<TSelectOptions>(TSelectConfig);
    const { localValue } = useMulipleableVModel(props, 'modelValue', configuration);

    const {
      normalizedOptions,
    } = useMultioptions(
      computed(() => configuration.options as InputOptions | undefined),
      computed(() => configuration.textAttribute),
      computed(() => configuration.valueAttribute),
      computed(() => configuration.normalizeOptions!),
    );

    return {
      localValue: localValue as any,
      configuration,
      attributes,
      normalizedOptions,
    };
  },
});
</script>
