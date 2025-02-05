<template>
  <slot
    v-if="isFetchingOptionsWhileClosed || !hasSelectedOption"
    name="placeholder"
    :is-fetching-options-while-closed="isFetchingOptionsWhileClosed"
  >
    <template v-if="isFetchingOptionsWhileClosed">
      <text-placeholder
        ref="fetchingPlaceholder"
        class-property="selectButtonSearchingPlaceholder"
        :placeholder="configuration.loadingClosedPlaceholder"
      />
      <loading-icon
        ref="loadingIcon"
        :class="classesList.selectButtonLoadingIcon"
      />
    </template>

    <text-placeholder
      v-else
      ref="placeholder"
      class-property="selectButtonPlaceholder"
      :placeholder="configuration.placeholder"
    />
  </slot>

  <rich-select-trigger-tags v-else-if="usesTags">
    <template #tagCloseIcon="props">
      <slot
        name="tagCloseIcon"
        v-bind="props"
      />
    </template>
    <template #tagLabel="props">
      <slot
        name="tagLabel"
        v-bind="props"
      />
    </template>
  </rich-select-trigger-tags>

  <span
    v-else
    ref="label"
    :class="classesList.selectButtonLabel"
  >
    <slot
      name="label"
      :label="label"
      :selected-option="selectedOption"
    >
      {{ label }}
    </slot>
  </span>

  <slot
    v-if="showSelectorIcon"
    name="selectorIcon"
  >
    <selector-icon
      ref="selectorIcon"
      :class="classesList.selectButtonSelectorIcon"
    />
  </slot>
</template>

<script lang="ts">
import {
  ComputedRef, defineComponent, inject, Ref,
} from 'vue';
import { NormalizedOption } from '@variantjs/core';
import TextPlaceholder from '../misc/TextPlaceholder.vue';
import RichSelectTriggerTags from './RichSelectTriggerTags.vue';
import SelectorIcon from '../../icons/SelectorIcon.vue';
import LoadingIcon from '../../icons/LoadingIcon.vue';
import { TRichSelectOptions } from '../../types/components/t-rich-select';
import useInjectsClassesList from '../../use/useInjectsClassesList';
import useInjectsConfiguration from '../../use/useInjectsConfiguration';

export default defineComponent({
  name: 'RichSelectTrigger',
  compatConfig: {
    MODE: 3,
  },
  components: {
    RichSelectTriggerTags,
    TextPlaceholder,
    SelectorIcon,
    LoadingIcon,
  },
  setup() {
    const configuration = useInjectsConfiguration<TRichSelectOptions>();

    const selectedOption = inject<ComputedRef<NormalizedOption | undefined | NormalizedOption[]>>('selectedOption')!;

    const hasSelectedOption = inject<ComputedRef<boolean>>('hasSelectedOption')!;

    const fetchingOptions = inject<Ref<boolean>>('fetchingOptions')!;

    const shown = inject<ComputedRef<boolean>>('shown')!;

    const usesTags = inject<ComputedRef<boolean>>('usesTags')!;

    const classesList = useInjectsClassesList()!;

    return {
      selectedOption,
      hasSelectedOption,
      configuration,
      fetchingOptions,
      shown,
      usesTags,
      classesList,
    };
  },
  computed: {
    label(): string | undefined {
      if (!this.hasSelectedOption) {
        return undefined;
      }

      if (this.multiple) {
        return (this.selectedOption as NormalizedOption[])
          .map((o) => o.text).join(', ');
      }

      return String((this.selectedOption as NormalizedOption).text);
    },
    isFetchingOptionsWhileClosed(): boolean {
      return this.fetchingOptions && !this.shown;
    },
    multiple(): boolean {
      return Array.isArray(this.selectedOption);
    },
    showSelectorIcon(): boolean {
      if (this.isFetchingOptionsWhileClosed) {
        return false;
      }

      if (!this.configuration.clearable) {
        return true;
      }

      return !this.hasSelectedOption || this.configuration.disabled === true;
    },
  },
});
</script>
