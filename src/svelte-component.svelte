<script lang="ts">
  import { createEventDispatcher, mount, onDestroy, onMount, unmount } from "svelte";

  import type {
    AceGridHookElement,
    AceGridIconTemplateRegistry,
    AceGridTemplateRegistry,
  } from "./wc";
  import type { AceGridCustomEventDetail } from "./wc";
  import type {
    AceGridSvelteDefaultActions,
    AceGridSvelteDefaultHookOptions,
    AceGridSvelteDefaultProps,
    AceGridSvelteDefaultRows,
    AceGridSvelteElementHost,
    AceGridSvelteIconTemplateRegistry,
    AceGridSvelteReadyEvent,
  } from "./svelteShared";
  import {
    ACE_GRID_SVELTE_COMMON_EVENTS,
    ACE_GRID_SVELTE_DEFAULT_TAG_NAME,
    ACE_GRID_SVELTE_EVENT_PREFIX,
  } from "./svelteShared";

  export let customTagName: string = ACE_GRID_SVELTE_DEFAULT_TAG_NAME;
  export let props: AceGridSvelteDefaultProps = {};
  export let hookOptions: AceGridSvelteDefaultHookOptions | null = null;
  export let templates: AceGridTemplateRegistry | null = null;
  export let iconTemplates: AceGridSvelteIconTemplateRegistry | null = null;
  export let elementClassName = "";

  let container: HTMLDivElement | null = null;
  let element: AceGridSvelteElementHost<
    AceGridSvelteDefaultProps,
    AceGridSvelteDefaultHookOptions,
    AceGridSvelteDefaultRows,
    AceGridSvelteDefaultActions
  > | null = null;
  let unpatchDispatchEvent: (() => void) | null = null;

  const dispatch = createEventDispatcher<{
    ready: AceGridSvelteReadyEvent;
    customEvent: CustomEvent<AceGridCustomEventDetail>;
    cellChange: AceGridCustomEventDetail;
    rowAdd: AceGridCustomEventDetail;
    rowDelete: AceGridCustomEventDetail;
    selectionChange: AceGridCustomEventDetail;
    selectionRangeChange: AceGridCustomEventDetail;
    sortChange: AceGridCustomEventDetail;
    sortModelChange: AceGridCustomEventDetail;
    filterChange: AceGridCustomEventDetail;
  }>();

  const getResolvedTagName = (tagName: string) =>
    (tagName ?? "").trim() || ACE_GRID_SVELTE_DEFAULT_TAG_NAME;

  const ensureElement = (tagName: string, className: string) => {
    if (!container) return;

    const currentTagName = element?.tagName.toLowerCase();
    if (!element || currentTagName !== tagName.toLowerCase()) {
      teardownElement();
      const nextElement = document.createElement(tagName) as AceGridSvelteElementHost<
        AceGridSvelteDefaultProps,
        AceGridSvelteDefaultHookOptions,
        AceGridSvelteDefaultRows,
        AceGridSvelteDefaultActions
      >;
      nextElement.style.display = "block";
      nextElement.style.width = "100%";
      nextElement.style.height = "100%";
      nextElement.className = className;
      container.replaceChildren(nextElement);
      element = nextElement;
      unpatchDispatchEvent = patchDispatchEvent(nextElement);
      dispatch("ready", { element: nextElement });
      return;
    }

    element.className = className;
  };

  const applyInputs = (
    nextProps: AceGridSvelteDefaultProps,
    nextHookOptions: AceGridSvelteDefaultHookOptions | null,
    nextTemplates: AceGridTemplateRegistry | null,
    nextIconTemplates: AceGridSvelteIconTemplateRegistry | null,
  ) => {
    if (!element) return;

    element.props = (nextProps ?? {}) as AceGridSvelteDefaultProps;
    element.templates = mergeTemplateRegistries(
      nextTemplates,
      buildSvelteIconTemplateRegistry(nextIconTemplates),
    ) ?? {};

    if ("hookOptions" in element) {
      (
        element as AceGridSvelteElementHost<
          AceGridSvelteDefaultProps,
          AceGridSvelteDefaultHookOptions,
          AceGridSvelteDefaultRows,
          AceGridSvelteDefaultActions
        > &
          Required<
            Pick<
              AceGridHookElement<
                AceGridSvelteDefaultProps,
                AceGridSvelteDefaultHookOptions,
                AceGridSvelteDefaultRows,
                AceGridSvelteDefaultActions
              >,
              "hookOptions"
            >
          >
      ).hookOptions = (nextHookOptions ??
        {}) as AceGridSvelteDefaultHookOptions;
    }
  };

  const emitCustomEvent = (event: CustomEvent<AceGridCustomEventDetail>) => {
    dispatch("customEvent", event);
    const detail = event.detail;

    switch (event.type) {
      case ACE_GRID_SVELTE_COMMON_EVENTS.cellChange:
        dispatch("cellChange", detail);
        break;
      case ACE_GRID_SVELTE_COMMON_EVENTS.rowAdd:
        dispatch("rowAdd", detail);
        break;
      case ACE_GRID_SVELTE_COMMON_EVENTS.rowDelete:
        dispatch("rowDelete", detail);
        break;
      case ACE_GRID_SVELTE_COMMON_EVENTS.selectionChange:
        dispatch("selectionChange", detail);
        break;
      case ACE_GRID_SVELTE_COMMON_EVENTS.selectionRangeChange:
        dispatch("selectionRangeChange", detail);
        break;
      case ACE_GRID_SVELTE_COMMON_EVENTS.sortChange:
        dispatch("sortChange", detail);
        break;
      case ACE_GRID_SVELTE_COMMON_EVENTS.sortModelChange:
        dispatch("sortModelChange", detail);
        break;
      case ACE_GRID_SVELTE_COMMON_EVENTS.filterChange:
        dispatch("filterChange", detail);
        break;
      default:
        break;
    }
  };

  const patchDispatchEvent = (
    elementHost: AceGridSvelteElementHost<
      AceGridSvelteDefaultProps,
      AceGridSvelteDefaultHookOptions,
      AceGridSvelteDefaultRows,
      AceGridSvelteDefaultActions
    >,
  ) => {
    const originalDispatchEvent = elementHost.dispatchEvent.bind(elementHost);

    elementHost.dispatchEvent = ((event: Event) => {
      if (event.type.startsWith(ACE_GRID_SVELTE_EVENT_PREFIX)) {
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
    element?.remove();
    element = null;
  };

  export function getElement() {
    return element;
  }

  export function rerender() {
    element?.rerender();
  }

  export function setProps(partial: Partial<AceGridSvelteDefaultProps>) {
    element?.setProps?.(partial);
  }

  export function getProps() {
    return element?.getProps?.() ?? null;
  }

  export function setTemplates(partial: Partial<AceGridTemplateRegistry>) {
    element?.setTemplates?.(partial);
  }

  export function getTemplates() {
    return element?.getTemplates?.() ?? null;
  }

  export function setIconTemplates(
    partial: Partial<AceGridSvelteIconTemplateRegistry>,
  ) {
    iconTemplates = {
      ...(iconTemplates ?? {}),
      ...partial,
    };
  }

  export function getIconTemplates() {
    return iconTemplates ?? null;
  }

  export function setHookOptions(
    partial: Partial<AceGridSvelteDefaultHookOptions>,
  ) {
    element?.setHookOptions?.(partial);
  }

  export function getHookOptions() {
    return element?.getHookOptions?.() ?? null;
  }

  export function getRows() {
    return element?.getRows?.() ?? null;
  }

  export function getActions() {
    return element?.getActions?.() ?? null;
  }

  export function getApi() {
    return element?.getApi?.() ?? null;
  }

  onMount(() => {
    const resolvedTagName = getResolvedTagName(customTagName);
    ensureElement(resolvedTagName, elementClassName);
    applyInputs(props, hookOptions, templates, iconTemplates);
  });

  onDestroy(() => {
    teardownElement();
  });

  $: if (container) {
    ensureElement(getResolvedTagName(customTagName), elementClassName);
  }

  $: if (element) {
    applyInputs(props, hookOptions, templates, iconTemplates);
  }

  function buildSvelteIconTemplateRegistry(
    nextIconTemplates: AceGridSvelteIconTemplateRegistry | null,
  ): { icons: AceGridIconTemplateRegistry } | null {
    if (!nextIconTemplates || Object.keys(nextIconTemplates).length === 0) {
      return null;
    }

    const iconEntries = Object.entries(nextIconTemplates)
      .filter((entry): entry is [keyof AceGridSvelteIconTemplateRegistry, NonNullable<AceGridSvelteIconTemplateRegistry[keyof AceGridSvelteIconTemplateRegistry]>] => Boolean(entry[1]))
      .map(([slot, IconComponent]) => [
        slot,
        ({ props }: { props: Record<string, unknown> }) => {
          const mountTarget = document.createElement("span");
          mountTarget.style.display = "contents";
          const instance = mount(IconComponent as any, {
            target: mountTarget,
            props,
          });

          return {
            node: mountTarget,
            cleanup: () => {
              void unmount(instance);
            },
          };
        },
      ]);

    return {
      icons: Object.fromEntries(iconEntries) as AceGridIconTemplateRegistry,
    };
  }

  function mergeTemplateRegistries(
    base: AceGridTemplateRegistry | null,
    icons: { icons: AceGridIconTemplateRegistry } | null,
  ): AceGridTemplateRegistry | null {
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
  }
</script>

<div bind:this={container} class="ace-grid-svelte__container"></div>

<style>
  .ace-grid-svelte__container {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
