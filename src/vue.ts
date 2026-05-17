import {
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  render,
  ref,
  toRaw,
  watch,
  type PropType,
} from "vue";

import type {
  AceGridCustomEventDetail,
  AceGridIconTemplateRegistry,
  AceGridTemplateRegistry,
} from "./wc";
import type { AceGridHookElement } from "./wc";
import type {
  AceGridVueComponentInstance,
  AceGridVueDefaultActions,
  AceGridVueDefaultHookOptions,
  AceGridVueDefaultProps,
  AceGridVueDefaultRows,
  AceGridVueElementHost,
  AceGridVueIconTemplateRegistry,
  AceGridVueReadyEvent,
} from "./vueShared";
import {
  ACE_GRID_VUE_COMMON_EVENTS,
  ACE_GRID_VUE_DEFAULT_TAG_NAME,
  ACE_GRID_VUE_EVENT_PREFIX,
} from "./vueShared";

export {
  ACE_GRID_VUE_COMMON_EVENTS,
  ACE_GRID_VUE_DEFAULT_TAG_NAME,
  ACE_GRID_VUE_EVENT_PREFIX,
} from "./vueShared";
export type {
  AceGridVueCommonEventName,
  AceGridVueComponentEvents,
  AceGridVueComponentInstance,
  AceGridVueComponentProps,
  AceGridVueIconTemplateRegistry,
  AceGridVueElementHost,
  AceGridVueReadyEvent,
} from "./vueShared";

const AceGridComponent = defineComponent({
  name: "AceGridComponent",
  inheritAttrs: false,
  props: {
    customTagName: {
      type: String,
      default: ACE_GRID_VUE_DEFAULT_TAG_NAME,
    },
    props: {
      type: Object as PropType<AceGridVueDefaultProps>,
      default: () => ({}),
    },
    hookOptions: {
      type: Object as PropType<AceGridVueDefaultHookOptions | null>,
      default: null,
    },
    templates: {
      type: Object as PropType<AceGridTemplateRegistry | null>,
      default: null,
    },
    iconTemplates: {
      type: Object as PropType<AceGridVueIconTemplateRegistry | null>,
      default: null,
    },
    elementClassName: {
      type: String,
      default: "",
    },
  },
  emits: {
    ready: (_event: AceGridVueReadyEvent) => true,
    customEvent: (_event: CustomEvent<AceGridCustomEventDetail>) => true,
    cellChange: (_detail: AceGridCustomEventDetail) => true,
    rowAdd: (_detail: AceGridCustomEventDetail) => true,
    rowDelete: (_detail: AceGridCustomEventDetail) => true,
    selectionChange: (_detail: AceGridCustomEventDetail) => true,
    selectionRangeChange: (_detail: AceGridCustomEventDetail) => true,
    sortChange: (_detail: AceGridCustomEventDetail) => true,
    sortModelChange: (_detail: AceGridCustomEventDetail) => true,
    filterChange: (_detail: AceGridCustomEventDetail) => true,
  },
  setup(componentProps, { emit, expose }) {
    const dispatch = emit as (event: string, payload?: unknown) => void;
    const container = ref<HTMLDivElement | null>(null);
    const iconTemplateState = ref<AceGridVueIconTemplateRegistry | null>(
      componentProps.iconTemplates ?? null,
    );
    const element = ref<
      AceGridVueElementHost<
        AceGridVueDefaultProps,
        AceGridVueDefaultHookOptions,
        AceGridVueDefaultRows,
        AceGridVueDefaultActions
      > | null
    >(null);
    let unpatchDispatchEvent: (() => void) | null = null;

    const getResolvedTagName = (tagName: string) =>
      (tagName ?? "").trim() || ACE_GRID_VUE_DEFAULT_TAG_NAME;

    const emitCustomEvent = (event: CustomEvent<AceGridCustomEventDetail>) => {
      dispatch("customEvent", event);
      const detail = event.detail;

      switch (event.type) {
        case ACE_GRID_VUE_COMMON_EVENTS.cellChange:
          dispatch("cellChange", detail);
          break;
        case ACE_GRID_VUE_COMMON_EVENTS.rowAdd:
          dispatch("rowAdd", detail);
          break;
        case ACE_GRID_VUE_COMMON_EVENTS.rowDelete:
          dispatch("rowDelete", detail);
          break;
        case ACE_GRID_VUE_COMMON_EVENTS.selectionChange:
          dispatch("selectionChange", detail);
          break;
        case ACE_GRID_VUE_COMMON_EVENTS.selectionRangeChange:
          dispatch("selectionRangeChange", detail);
          break;
        case ACE_GRID_VUE_COMMON_EVENTS.sortChange:
          dispatch("sortChange", detail);
          break;
        case ACE_GRID_VUE_COMMON_EVENTS.sortModelChange:
          dispatch("sortModelChange", detail);
          break;
        case ACE_GRID_VUE_COMMON_EVENTS.filterChange:
          dispatch("filterChange", detail);
          break;
        default:
          break;
      }
    };

    const patchDispatchEvent = (
      elementHost: AceGridVueElementHost<
        AceGridVueDefaultProps,
        AceGridVueDefaultHookOptions,
        AceGridVueDefaultRows,
        AceGridVueDefaultActions
      >,
    ) => {
      const originalDispatchEvent = elementHost.dispatchEvent.bind(elementHost);

      elementHost.dispatchEvent = ((event: Event) => {
        if (event.type.startsWith(ACE_GRID_VUE_EVENT_PREFIX)) {
          emitCustomEvent(event as CustomEvent<AceGridCustomEventDetail>);
        }
        return originalDispatchEvent(event);
      }) as typeof elementHost.dispatchEvent;

      return () => {
        elementHost.dispatchEvent = originalDispatchEvent as typeof elementHost.dispatchEvent;
      };
    };

    const teardownElement = () => {
      unpatchDispatchEvent?.();
      unpatchDispatchEvent = null;
      element.value?.remove();
      element.value = null;
    };

    const ensureElement = (tagName: string, className: string) => {
      if (!container.value) return;

      const currentTagName = element.value?.tagName.toLowerCase();
      if (!element.value || currentTagName !== tagName.toLowerCase()) {
        teardownElement();
        const nextElement = document.createElement(tagName) as AceGridVueElementHost<
          AceGridVueDefaultProps,
          AceGridVueDefaultHookOptions,
          AceGridVueDefaultRows,
          AceGridVueDefaultActions
        >;
        nextElement.style.display = "block";
        nextElement.style.width = "100%";
        nextElement.style.height = "100%";
        nextElement.className = className;
        container.value.replaceChildren(nextElement);
        element.value = nextElement;
        unpatchDispatchEvent = patchDispatchEvent(nextElement);
        dispatch("ready", { element: nextElement });
        return;
      }

      element.value.className = className;
    };

    const applyInputs = (
      nextProps: AceGridVueDefaultProps,
      nextHookOptions: AceGridVueDefaultHookOptions | null,
      nextTemplates: AceGridTemplateRegistry | null,
      nextIconTemplates: AceGridVueIconTemplateRegistry | null,
    ) => {
      if (!element.value) return;

      element.value.props = (nextProps ? toRaw(nextProps) : {}) as AceGridVueDefaultProps;
      element.value.templates =
        mergeTemplateRegistries(
          nextTemplates ? toRaw(nextTemplates) : null,
          buildVueIconTemplateRegistry(
            nextIconTemplates ? toRaw(nextIconTemplates) : null,
          ),
        ) ?? {};

      if ("hookOptions" in element.value) {
        (
          element.value as AceGridVueElementHost<
            AceGridVueDefaultProps,
            AceGridVueDefaultHookOptions,
            AceGridVueDefaultRows,
            AceGridVueDefaultActions
          > &
            Required<
              Pick<
                AceGridHookElement<
                  AceGridVueDefaultProps,
                  AceGridVueDefaultHookOptions,
                  AceGridVueDefaultRows,
                  AceGridVueDefaultActions
                >,
                "hookOptions"
              >
            >
        ).hookOptions = (nextHookOptions ? toRaw(nextHookOptions) : {}) as AceGridVueDefaultHookOptions;
      }
    };

    const getElement = () => element.value;
    const rerender = () => {
      element.value?.rerender();
    };
    const setProps = (partial: Partial<AceGridVueDefaultProps>) => {
      element.value?.setProps?.(partial);
    };
    const getProps = () => element.value?.getProps?.() ?? null;
    const setTemplates = (partial: Partial<AceGridTemplateRegistry>) => {
      element.value?.setTemplates?.(partial);
    };
    const getTemplates = () => element.value?.getTemplates?.() ?? null;
    const setIconTemplates = (
      partial: Partial<AceGridVueIconTemplateRegistry>,
    ) => {
      iconTemplateState.value = {
        ...(iconTemplateState.value ?? {}),
        ...partial,
      } as AceGridVueIconTemplateRegistry;
    };
    const getIconTemplates = () => iconTemplateState.value ?? null;
    const setHookOptions = (
      partial: Partial<AceGridVueDefaultHookOptions>,
    ) => {
      element.value?.setHookOptions?.(partial);
    };
    const getHookOptions = () => element.value?.getHookOptions?.() ?? null;
    const getRows = () => element.value?.getRows?.() ?? null;
    const getActions = () => element.value?.getActions?.() ?? null;
    const getApi = () => element.value?.getApi?.() ?? null;

    expose({
      getElement,
      rerender,
      setProps,
      getProps,
      setTemplates,
      getTemplates,
      setIconTemplates,
      getIconTemplates,
      setHookOptions,
      getHookOptions,
      getRows,
      getActions,
      getApi,
    } satisfies AceGridVueComponentInstance);

    onMounted(() => {
      ensureElement(
        getResolvedTagName(componentProps.customTagName),
        componentProps.elementClassName,
      );
      applyInputs(
        componentProps.props,
        componentProps.hookOptions,
        componentProps.templates,
        iconTemplateState.value,
      );
    });

    onBeforeUnmount(() => {
      teardownElement();
    });

    watch(
      () => [componentProps.customTagName, componentProps.elementClassName] as const,
      ([nextTagName, nextClassName]) => {
        ensureElement(getResolvedTagName(nextTagName), nextClassName ?? "");
      },
      { flush: "post" },
    );

    watch(
      () => componentProps.iconTemplates,
      (nextIconTemplates) => {
        iconTemplateState.value = nextIconTemplates ?? null;
      },
      { deep: true, flush: "post" },
    );

    watch(
      () =>
        [
          componentProps.props,
          componentProps.hookOptions,
          componentProps.templates,
          iconTemplateState.value,
        ] as const,
      ([nextProps, nextHookOptions, nextTemplates, nextIconTemplates]) => {
        applyInputs(
          nextProps ?? {},
          nextHookOptions,
          nextTemplates,
          nextIconTemplates,
        );
      },
      { deep: true, flush: "post" },
    );

    const buildVueIconTemplateRegistry = (
      nextIconTemplates: AceGridVueIconTemplateRegistry | null,
    ): { icons: AceGridIconTemplateRegistry } | null => {
      if (!nextIconTemplates || Object.keys(nextIconTemplates).length === 0) {
        return null;
      }

      const iconEntries = Object.entries(nextIconTemplates)
        .filter((entry): entry is [keyof AceGridVueIconTemplateRegistry, NonNullable<AceGridVueIconTemplateRegistry[keyof AceGridVueIconTemplateRegistry]>] => Boolean(entry[1]))
        .map(([slot, IconComponent]) => [
          slot,
          ({ props }: { props: Record<string, unknown> }) => {
            const mountTarget = document.createElement("span");
            mountTarget.style.display = "contents";
            render(h(IconComponent as any, props), mountTarget);

            return {
              node: mountTarget,
              cleanup: () => {
                render(null, mountTarget);
              },
            };
          },
        ]);

      return {
        icons: Object.fromEntries(iconEntries) as AceGridIconTemplateRegistry,
      };
    };

    const mergeTemplateRegistries = (
      base: AceGridTemplateRegistry | null,
      icons: { icons: AceGridIconTemplateRegistry } | null,
    ): AceGridTemplateRegistry | null => {
      if (!base && !icons) {
        return null;
      }

      return {
        ...(base ?? {}),
        ...(icons ?? {}),
        icons: {
          ...(base?.icons ?? {}),
          ...(icons?.icons ?? {}),
        },
      };
    };

    return () =>
      h("div", {
        ref: container,
        class: "ace-grid-vue__container",
        style: {
          display: "block",
          width: "100%",
          height: "100%",
        },
      });
  },
});

export { AceGridComponent };
export default AceGridComponent;
