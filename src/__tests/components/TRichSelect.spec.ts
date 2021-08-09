import { shallowMount } from '@vue/test-utils';
import TRichSelect from '../../components/TRichSelect.vue';
import { componentHasAttributeWithValue, getChildComponentNameByRef } from '../testUtils';

describe('TRichSelect.vue', () => {
  it('renders the component', () => {
    const wrapper = shallowMount(TRichSelect);
    expect(wrapper.get('div')).toBeTruthy();
  });

  it('hides the dropdown and focus the trigger when the vmodel value changes and the `closeOnSelect` option is set', async () => {
    const focusDropdownTriggerMock = jest.fn();
    const options = [1, 2];
    const wrapper = shallowMount(TRichSelect, {
      props: {
        options,
        modelValue: 1,
        show: true,
        closeOnSelect: true,
      },
      global: {
        stubs: {
          TDropdown: {
            template: '<div />',
            methods: {
              focus: focusDropdownTriggerMock,
            },
          },
        },
      },
    });

    wrapper.vm.shown = true;

    await wrapper.vm.$nextTick();

    await wrapper.setProps({
      modelValue: 2,
    });

    expect(wrapper.vm.shown).toBe(false);
    expect(focusDropdownTriggerMock).toHaveBeenCalled();
  });

  it('hides the dropdown and focus the trigger when the vmodel value changes and the `closeOnSelect` is undefined and is not multipe', async () => {
    const focusDropdownTriggerMock = jest.fn();
    const options = [1, 2];
    const wrapper = shallowMount(TRichSelect, {
      props: {
        options,
        modelValue: 1,
        show: true,
        closeOnSelect: undefined,
        multiple: false,
      },
      global: {
        stubs: {
          TDropdown: {
            template: '<div />',
            methods: {
              focus: focusDropdownTriggerMock,
            },
          },
        },
      },
    });

    wrapper.vm.shown = true;

    await wrapper.vm.$nextTick();

    await wrapper.setProps({
      modelValue: 2,
    });

    expect(wrapper.vm.shown).toBe(false);
    expect(focusDropdownTriggerMock).toHaveBeenCalled();
  });

  it('doesnt hide the dropdown and focus the trigger when the vmodel value changes and the `closeOnSelect` is undefined but is multipe', async () => {
    const focusDropdownTriggerMock = jest.fn();
    const options = [1, 2];
    const wrapper = shallowMount(TRichSelect, {
      props: {
        options,
        modelValue: 1,
        show: true,
        closeOnSelect: undefined,
        multiple: true,
      },
      global: {
        stubs: {
          TDropdown: {
            template: '<div />',
            methods: {
              focus: focusDropdownTriggerMock,
            },
          },
        },
      },
    });

    wrapper.vm.shown = true;

    await wrapper.vm.$nextTick();

    await wrapper.setProps({
      modelValue: 2,
    });

    expect(wrapper.vm.shown).toBe(true);
    expect(focusDropdownTriggerMock).not.toHaveBeenCalled();
  });

  it('doesnt hide the dropdown and focus the trigger when the vmodel value changes, is not multiple but closeOnSelect is `false`', async () => {
    const focusDropdownTriggerMock = jest.fn();
    const options = [1, 2];
    const wrapper = shallowMount(TRichSelect, {
      props: {
        options,
        modelValue: 1,
        show: true,
        closeOnSelect: false,
        multiple: false,
      },
      global: {
        stubs: {
          TDropdown: {
            template: '<div />',
            methods: {
              focus: focusDropdownTriggerMock,
            },
          },
        },
      },
    });

    wrapper.vm.shown = true;

    await wrapper.vm.$nextTick();

    await wrapper.setProps({
      modelValue: 2,
    });

    expect(wrapper.vm.shown).toBe(true);
    expect(focusDropdownTriggerMock).not.toHaveBeenCalled();
  });

  describe('selectedOption', () => {
    it('sets the selectedOption from the initial v-model ', () => {
      const options = [1, 2, 3];
      const modelValue = 2;

      const wrapper = shallowMount(TRichSelect, {
        props: {
          options,
          modelValue,
        },
      });

      expect(wrapper.vm.selectedOption).toEqual({
        value: 2,
        text: 2,
        raw: 2,
      });
    });

    it('sets the selectedOption from the initial v-model when not defined', () => {
      const options = [1, 2, 3];

      const wrapper = shallowMount(TRichSelect, {
        props: {
          options,
        },
      });

      expect(wrapper.vm.selectedOption).toBeUndefined();
    });

    it('updates the selectedOption within the v-model ', async () => {
      const options = [1, 2, 3];
      const modelValue = 2;

      const wrapper = shallowMount(TRichSelect, {
        props: {
          options,
          modelValue,
        },
      });

      await wrapper.setProps({
        modelValue: 3,
      });

      expect(wrapper.vm.selectedOption).toEqual({
        value: 3,
        text: 3,
        raw: 3,
      });
    });

    it('updates the selectedOption within the v-model when set to null ', async () => {
      const options = [1, 2, 3];
      const modelValue = 2;

      const wrapper = shallowMount(TRichSelect, {
        props: {
          options,
          modelValue,
        },
      });

      await wrapper.setProps({
        modelValue: null,
      });

      expect(wrapper.vm.selectedOption).toBeUndefined();
    });
  });

  describe('ClearButton', () => {
    it('set showClearButton as `true` if `selectedOption` is clearable and is not multiple', () => {
      const options = [1, 2, 3];
      const modelValue = 2;

      const wrapper = shallowMount(TRichSelect, {
        props: {
          clearable: true,
          multiple: false,
          options,
          modelValue,
        },
      });

      expect(wrapper.vm.showClearButton).toBe(true);
    });

    it('set showClearButton as `false` if `selectedOption`, is clearable but is multiple', () => {
      const options = [1, 2, 3];
      const modelValue = 2;

      const wrapper = shallowMount(TRichSelect, {
        props: {
          clearable: true,
          multiple: true,
          options,
          modelValue,
        },
      });

      expect(wrapper.vm.showClearButton).toBe(false);
    });

    it('set showClearButton as `false` if `selectedOption` is multiple but is not clearable', () => {
      const options = [1, 2, 3];
      const modelValue = 2;

      const wrapper = shallowMount(TRichSelect, {
        props: {
          clearable: false,
          multiple: false,
          options,
          modelValue,
        },
      });

      expect(wrapper.vm.showClearButton).toBe(false);
    });

    it('set showClearButton as `false` if no selectedOption even if is clearable and is not multiple', () => {
      const options = [1, 2, 3];

      const wrapper = shallowMount(TRichSelect, {
        props: {
          clearable: true,
          multiple: false,
          options,
        },
      });

      expect(wrapper.vm.showClearButton).toBe(false);
    });

    it('shows the clearButton if showClearButton is `true`', () => {
      const options = [1, 2, 3];
      const modelValue = 2;

      const wrapper = shallowMount(TRichSelect, {
        props: {
          clearable: true,
          multiple: false,
          options,
          modelValue,
        },
      });

      expect(wrapper.vm.$refs.clearButton).toBeDefined();
      expect(getChildComponentNameByRef(wrapper, 'clearButton')).toEqual('RichSelectClearButton');
    });

    it('hides the clearButton if showClearButton is `false`', () => {
      const wrapper = shallowMount(TRichSelect);

      expect(wrapper.vm.$refs.clearButton).not.toBeDefined();
    });

    it('contains a `click` handler that calls the `clearValue` method', async () => {
      const options = [1, 2, 3];
      const modelValue = 2;

      const wrapper = shallowMount(TRichSelect, {
        props: {
          clearable: true,
          multiple: false,
          options,
          modelValue,
        },
      });

      const component = wrapper.vm.$refs.clearButton;

      expect(componentHasAttributeWithValue(component, 'onClick', wrapper.vm.clearValue)).toBe(true);
    });
  });

  describe('Dropdown stuff', () => {
    it('invalidates invalid dropdown placements', () => {
      const { validator } = TRichSelect.props.dropdownPlacement;
      expect(validator('invalid')).toBe(false);
    });

    it.each([
      'auto',
      'auto-start',
      'auto-end',
      'top',
      'top-start',
      'top-end',
      'bottom',
      'bottom-start',
      'bottom-end',
      'right',
      'right-start',
      'right-end',
      'left',
      'left-start',
      'left-end',
    ])('accept valid dropdown placements', (placement) => {
      const { validator } = TRichSelect.props.dropdownPlacement;
      expect(validator(placement)).toBe(true);
    });
  });
});
