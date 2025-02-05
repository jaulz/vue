<template>
  <t-modal
    ref="modalRef"
    v-model="showModel"
    :modal-attributes="configuration.dialogAttributes"
    :focus-on-open="false"
    :click-to-close="configuration.clickToClose"
    :esc-to-close="configuration.escToClose"
    :hide-close-button="! configuration.showCloseButton"
    :disable-body-scroll="configuration.disableBodyScroll"
    :body-scroll-lock-options="configuration.bodyScrollLockOptions"
    :teleport="configuration.teleport"
    :teleport-to="configuration.teleportTo"
    :classes="modalClasses"
    :fixed-classes="undefined"
    @shown="onShown"
    @hidden="onHidden"
    @before-show="onBeforeShow"
    @before-hide="onBeforeHide"
  >
    <template #closeButton>
      <button
        v-if="!configuration.hideCloseButton"
        type="button"
        :disabled="busy"
        :class="configuration.classesList?.close"
        @click="hide(DialogHideReason.Close)"
      >
        <slot
          name="closeButtonIcon"
          :hide="hide"
        >
          <close-icon :class="configuration.classesList?.closeIcon" />
        </slot>
      </button>
    </template>

    <div
      v-if="busy"
      :class="configuration.classesList?.busyWrapper"
    >
      <loading-icon :class="configuration.classesList?.busyIcon" />
    </div>

    <slot
      :hide="hide"
      :ok="ok"
      :cancel="cancel"
    >
      <div
        v-if="errorMessage !== undefined"
        :class="configuration.classesList?.errorMessage"
      >
        <slot
          name="error"
          :setError="setError"
          :hide="hide"
          :error-message="errorMessage"
        >
          {{ errorMessage }}
        </slot>
      </div>

      <div
        v-if="configuration.icon"
        ref="iconWrapperRef"
        :class="configuration.classesList?.iconWrapper"
      >
        <slot
          name="icon"
          :hide="hide"
          :ok="ok"
          :cancel="cancel"
        >
          <template v-if="configuration.useSolidIcon">
            <solid-check-circle-icon
              v-if="configuration.icon === 'success'"
              :class="configuration.classesList?.icon"
            />
            <solid-question-mark-circle-icon
              v-else-if="configuration.icon === 'question'"
              :class="configuration.classesList?.icon"
            />
            <solid-information-circle-icon
              v-else-if="configuration.icon === 'info'"
              :class="configuration.classesList?.icon"
            />
            <solid-exclamation-icon
              v-else-if="configuration.icon === 'warning'"
              :class="configuration.classesList?.icon"
            />
            <solid-cross-circle-icon
              v-else-if="configuration.icon === 'error'"
              :class="configuration.classesList?.icon"
            />
          </template>
          <template v-else>
            <check-circle-icon
              v-if="configuration.icon === 'success'"
              :class="configuration.classesList?.icon"
            />
            <question-mark-circle-icon
              v-else-if="configuration.icon === 'question'"
              :class="configuration.classesList?.icon"
            />
            <information-circle-icon
              v-else-if="configuration.icon === 'info'"
              :class="configuration.classesList?.icon"
            />
            <exclamation-icon
              v-else-if="configuration.icon === 'warning'"
              :class="configuration.classesList?.icon"
            />
            <cross-circle-icon
              v-else-if="configuration.icon === 'error'"
              :class="configuration.classesList?.icon"
            />
          </template>
        </slot>
      </div>

      <div :class="configuration.classesList?.content">
        <div
          v-if="configuration.title !== undefined || $slots.title"
          :class="configuration.classesList?.titleWrapper"
        >
          <component
            :is="configuration.titleTag"

            :class="configuration.classesList?.title"
          >
            <slot
              name="title"
              :hide="hide"
              :ok="ok"
              :cancel="cancel"
            >
              {{ configuration.title }}
            </slot>
          </component>
        </div>
        <div
          v-if="configuration.text !== undefined || $slots.text"
          :class="configuration.classesList?.textWrapper"
        >
          <component
            :is="configuration.textTag"
            :class="configuration.classesList?.text"
          >
            <slot
              name="text"
              :hide="hide"
              :ok="ok"
              :cancel="cancel"
            >
              {{ configuration.text }}
            </slot>
          </component>
        </div>

        <template v-if="configuration.type === 'prompt'">
          <div
            ref="inputWrapperRef"
            :class="configuration.classesList?.inputWrapper"
          >
            <slot
              name="input"
              :hide="hide"
              :ok="ok"
              :cancel="cancel"
              :setInputValue="setInputValue"
              :inputValue="inputValue"
              :variant="configuration.inputVariant"
              :inputAttributes="configuration.inputAttributes"
            >
              <input
                v-model="inputModel"
                :variant="configuration.inputVariant"
                :type="configuration.inputType"
                :class="configuration.classesList?.input"
                v-bind="configuration.inputAttributes"
              >
            </slot>

            <div
              v-if="validationErrorMessage !== undefined"
              :class="configuration.classesList?.inputValidationError"
            >
              <slot
                name="validation-error"
                :setError="setValidationError"
                :hide="hide"
                :error-message="validationErrorMessage"
              >
                {{ validationErrorMessage }}
              </slot>
            </div>
          </div>
        </template>
      </div>
    </slot>

    <template #footer>
      <slot
        name="footer"
        :hide="hide"
        :ok="ok"
        :cancel="cancel"
      >
        <button
          v-if="showCancelButton"
          ref="cancelButton"
          type="button"
          :class="configuration.classesList?.cancelButton"
          :aria-label="cancelButtonAriaLabel"
          :disabled="busy"
          @click="cancel"
        >
          {{ cancelButtonText }}
        </button>
        <button
          ref="okButton"
          type="button"
          :class="configuration.classesList?.okButton"
          :aria-label="okButtonAriaLabel"
          :disabled="busy"
          @click="ok"
        >
          {{ okButtonText }}
        </button>
      </slot>
    </template>
  </t-modal>
</template>

<script lang="ts">
import {
  defineComponent, PropType, HTMLAttributes, inject, computed, ref, onMounted, watch,
} from 'vue';
import { BodyScrollOptions } from 'body-scroll-lock';
import {
  Data,
  TDialogClassesKeys,
  TDialogClassesValidKeys,
  DialogType,
  DialogPreconfirmFn,
  DialogResponse,
  DialogHideReason,
  DialogInputValidatorFn,
  TDialogConfig,
  ModalHideReason,
  getFocusableElements,
  promisifyFunctionResult,
  DialogBeforeHideParams,
  DialogBeforeShowParams,
} from '@variantjs/core';
import {
  TDialogOptions, EmitterInterface, PromiseRejectFn,
} from '../types';
import useConfigurationWithClassesList from '../use/useConfigurationWithClassesList';
import { getVariantPropsWithClassesList } from '../utils/getVariantProps';
import useVModel from '../use/useVModel';
import TModal from './TModal.vue';
import CheckCircleIcon from '../icons/CheckCircleIcon.vue';
import QuestionMarkCircleIcon from '../icons/QuestionMarkCircleIcon.vue';
import InformationCircleIcon from '../icons/InformationCircleIcon.vue';
import ExclamationIcon from '../icons/ExclamationIcon.vue';
import SolidCheckCircleIcon from '../icons/SolidCheckCircleIcon.vue';
import SolidQuestionMarkCircleIcon from '../icons/SolidQuestionMarkCircleIcon.vue';
import SolidInformationCircleIcon from '../icons/SolidInformationCircleIcon.vue';
import SolidExclamationIcon from '../icons/SolidExclamationIcon.vue';
import CrossCircleIcon from '../icons/CrossCircleIcon.vue';
import SolidCrossCircleIcon from '../icons/SolidCrossCircleIcon.vue';
import LoadingIcon from '../icons/LoadingIcon.vue';
import CloseIcon from '../icons/CloseIcon.vue';

// @vue/component
export default defineComponent({
  name: 'TDialog',
  compatConfig: {
    MODE: 3,
  },
  components: {
    TModal,
    CloseIcon,
    LoadingIcon,
    CrossCircleIcon,
    SolidCrossCircleIcon,
    CheckCircleIcon,
    QuestionMarkCircleIcon,
    InformationCircleIcon,
    ExclamationIcon,
    SolidQuestionMarkCircleIcon,
    SolidInformationCircleIcon,
    SolidExclamationIcon,
    SolidCheckCircleIcon,
  },
  props: {
    ...getVariantPropsWithClassesList<TDialogOptions, TDialogClassesValidKeys>(),
    type: {
      type: String,
      default: DialogType.Alert,
    },
    icon: {
      type: String,
      default: undefined,
    },
    useSolidIcon: {
      type: Boolean,
      default: false,
    },
    rejectOnCancel: {
      type: Boolean,
      default: true,
    },
    rejectOnDismiss: {
      type: Boolean,
      default: undefined,
    },
    title: {
      type: String,
      default: undefined,
    },
    titleTag: {
      type: String,
      default: 'h3',
    },
    textTag: {
      type: String,
      default: 'p',
    },
    text: {
      type: String,
      default: undefined,
    },
    cancelButtonText: {
      type: String,
      default: 'Cancel',
    },
    cancelButtonAriaLabel: {
      type: String,
      default: 'Cancel',
    },
    okButtonText: {
      type: String,
      default: 'OK',
    },
    okButtonAriaLabel: {
      type: String,
      default: 'OK',
    },
    preConfirm: {
      type: Function as PropType<DialogPreconfirmFn>,
      default: undefined,
    },
    name: {
      type: String,
      default: undefined,
    },
    modelValue: {
      type: Boolean,
      default: false,
    },
    dialogAttributes: {
      type: Object as PropType<HTMLAttributes & Data>,
      default: () => ({}),
    },
    focusOnOpen: {
      type: Boolean,
      default: true,
    },
    clickToClose: {
      type: Boolean,
      default: true,
    },
    escToClose: {
      type: Boolean,
      default: true,
    },
    showCloseButton: {
      type: Boolean,
      default: true,
    },
    disableBodyScroll: {
      type: Boolean,
      default: true,
    },
    bodyScrollLockOptions: {
      type: Object as PropType<BodyScrollOptions>,
      default: () => ({}),
    },
    teleport: {
      type: Boolean,
      default: true,
    },
    teleportTo: {
      type: [String, Object] as PropType<string | HTMLElement>,
      default: 'body',
    },
    inputAttributes: {
      type: Object as PropType<HTMLAttributes & Data>,
      default: () => ({}),
    },
    inputType: {
      type: String,
      default: 'text',
    },
    inputValidator: {
      type: Function as PropType<DialogInputValidatorFn>,
      default: undefined,
    },
    inputValue: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: [String, Number, Boolean, Array, Object, Date, Function, Symbol],
      default: undefined,
    },
  },
  emits: {
    shown: () => true,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    hidden: (response: DialogResponse) => true,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    error: (response: any) => true,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    'validation-error': (message: string) => true,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    'before-show': (e: DialogBeforeShowParams) => true,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    'before-hide': (e: DialogBeforeHideParams) => true,
    'update:modelValue': () => true,
  },
  setup(props, { emit }) {
    const { configuration, attributes } = useConfigurationWithClassesList<TDialogOptions>(TDialogConfig, TDialogClassesKeys);

    const inputWrapperRef = ref<HTMLDivElement>();

    const modalRef = ref<typeof TModal>();

    const showModel = useVModel(props, 'modelValue');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const inputModel = ref<any>(props.inputValue);

    const busy = ref<boolean>(false);

    const errorMessage = ref<string | undefined>(undefined);

    const validationErrorMessage = ref<string | undefined>(undefined);

    const hideReason = ref<DialogHideReason | undefined>(undefined);

    const dialogResponse = ref<DialogResponse | undefined>(undefined);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const preConfirmResponse = ref<any>(undefined);

    const promiseResolve = ref<((value: DialogResponse) => void) | undefined>(undefined);

    const promiseReject = ref<PromiseRejectFn | undefined>(undefined);

    const isPrompt = computed<boolean>(() => configuration.type === DialogType.Prompt);

    const setError = (error: string | undefined | Error) => {
      if (error instanceof Error) {
        errorMessage.value = error.message;
      } else {
        errorMessage.value = error;
      }
    };

    const setValidationError = (error: string | undefined) => {
      validationErrorMessage.value = error;
    };

    const focusDialog = () => {
      modalRef.value!.focusModal();
    };

    const focusPromptInput = () => {
      const focusableField = getFocusableElements(inputWrapperRef.value!).shift();
      if (focusableField) {
        focusableField.focus();
      } else {
        focusDialog();
      }
    };

    const initDialog = () => {
      if (configuration.focusOnOpen) {
        if (isPrompt.value) {
          focusPromptInput();
        } else {
          focusDialog();
        }
      }
    };

    onMounted(() => {
      if (showModel.value) {
        initDialog();
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const setInputValue = (value: any) => {
      inputModel.value = value;
    };

    const reset = (): void => {
      promiseResolve.value = undefined;
      promiseReject.value = undefined;
      hideReason.value = undefined;
      dialogResponse.value = undefined;
      busy.value = false;
      setError(undefined);
      setValidationError(undefined);
      preConfirmResponse.value = undefined;
      setInputValue(props.inputValue);
    };

    const onBeforeShow = (e: DialogBeforeShowParams) => {
      emit('before-show', e);
    };

    const onBeforeHide = (e: { cancel: PromiseRejectFn, reason: ModalHideReason }) => {
      // The `e.reason` comes from the modal so may differ to the dialog reason
      const hideReasonValue: DialogHideReason = (hideReason.value !== undefined ? hideReason.value : e.reason) as DialogHideReason;

      if (busy.value && hideReasonValue !== DialogHideReason.Ok) {
        e.cancel();
        return;
      }

      const response: DialogResponse = {
        hideReason: hideReasonValue,
        isOk: hideReasonValue === DialogHideReason.Ok,
        isCancel: hideReasonValue === DialogHideReason.Cancel,
        isDismissed: ![DialogHideReason.Cancel, DialogHideReason.Ok].includes(hideReasonValue),
      };

      if (configuration.preConfirm) {
        response.response = preConfirmResponse.value;
      }

      if (isPrompt.value) {
        response.input = inputModel.value;
      }

      dialogResponse.value = response;

      emit('before-hide', {
        cancel: e.cancel,
        response,
      });
    };

    const rejectOnDismiss = computed<boolean>(() => {
      if (configuration.rejectOnDismiss === undefined) {
        return configuration.type !== DialogType.Alert;
      }

      return configuration.rejectOnDismiss;
    });

    const onHidden = () => {
      const response = dialogResponse.value!;

      emit('hidden', response);

      if (
        (response.isCancel && configuration.rejectOnCancel)
        || (response.isDismissed && rejectOnDismiss.value)
      ) {
        if (promiseReject.value) {
          promiseReject.value(response);
        }
      } else if (promiseResolve.value) {
        promiseResolve.value(response);
      }

      reset();
    };

    const onShown = () => {
      emit('shown');

      initDialog();
    };

    const hide = (reason: DialogHideReason = DialogHideReason.Other) :void => {
      hideReason.value = reason;

      showModel.value = false;
    };

    const ok = () : void => {
      setValidationError(undefined);

      setError(undefined);

      if (configuration.inputValidator && isPrompt.value) {
        const response = configuration.inputValidator(inputModel.value);

        if (typeof response === 'string' && response.length > 0) {
          setValidationError(response);

          emit('validation-error', response);

          return;
        }
      }

      if (configuration.preConfirm) {
        const promise = promisifyFunctionResult(configuration.preConfirm, inputModel.value);

        busy.value = true;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        promise.then((response: any) => {
          preConfirmResponse.value = response;

          hide(DialogHideReason.Ok);
        }).catch((error) => {
          setError(error);

          emit('error', error);
        }).then(() => {
          busy.value = false;
        });
      } else {
        hide(DialogHideReason.Ok);
      }
    };

    const cancel = () :void => {
      hide(DialogHideReason.Cancel);
    };

    const show = () : Promise<DialogResponse> => {
      const promise = new Promise((resolve, reject) => {
        promiseResolve.value = resolve;

        promiseReject.value = reject;

        showModel.value = true;
      });

      // eslint-disable-next-line consistent-return
      return promise as Promise<DialogResponse>;
    };

    if (configuration.name) {
      const emitter = inject<EmitterInterface>('emitter')!;

      emitter.on('dialog:show', (name: string, resolve: ((value: DialogResponse) => void), reject: PromiseRejectFn) => {
        if (configuration.name !== name) {
          return;
        }

        promiseResolve.value = resolve;

        promiseReject.value = reject;

        showModel.value = true;
      });

      emitter.on('dialog:hide', (name) => {
        if (configuration.name !== name) {
          return;
        }

        hide(DialogHideReason.Method);
      });
    }

    watch(inputModel, () => {
      if (!configuration.inputValidator) {
        return;
      }

      const response = configuration.inputValidator(inputModel.value);

      if (typeof response === 'string' && response.length > 0) {
        setValidationError(response);

        emit('validation-error', response);
      } else {
        setValidationError(undefined);
      }
    });

    const modalClasses = computed(() => ({
      overlay: configuration.classesList!.overlay,
      wrapper: configuration.classesList!.wrapper,
      modal: configuration.classesList!.dialog,
      body: configuration.classesList!.body,
      footer: configuration.classesList!.buttons,
      overlayEnterActiveClass: configuration.classesList!.overlayEnterActiveClass,
      overlayEnterFromClass: configuration.classesList!.overlayEnterFromClass,
      overlayEnterToClass: configuration.classesList!.overlayEnterToClass,
      overlayLeaveActiveClass: configuration.classesList!.overlayLeaveActiveClass,
      overlayLeaveFromClass: configuration.classesList!.overlayLeaveFromClass,
      overlayLeaveToClass: configuration.classesList!.overlayLeaveToClass,
      enterActiveClass: configuration.classesList!.enterActiveClass,
      enterFromClass: configuration.classesList!.enterFromClass,
      enterToClass: configuration.classesList!.enterToClass,
      leaveActiveClass: configuration.classesList!.leaveActiveClass,
      leaveFromClass: configuration.classesList!.leaveFromClass,
      leaveToClass: configuration.classesList!.leaveToClass,
    }));

    const showCancelButton = computed(() => configuration.type !== DialogType.Alert);

    return {
      configuration,
      attributes,
      showModel,
      modalClasses,
      showCancelButton,
      DialogHideReason,
      inputModel,
      busy,
      show,
      hide,
      ok,
      cancel,
      onBeforeShow,
      onBeforeHide,
      onShown,
      onHidden,
      setInputValue,
      setError,
      setValidationError,
      errorMessage,
      validationErrorMessage,
      inputWrapperRef,
      modalRef,

    };
  },
});
</script>
