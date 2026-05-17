import {
  ApplicationRef,
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  createComponent,
  ElementRef,
  EnvironmentInjector,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  Type,
  ViewChild,
  inject,
} from "@angular/core";

import type { GridActions, UseGridOptions } from "./hooks/useGrid";
import type { GridIconSet } from "./features/theming";
import type { GridProps, GridRow } from "./types";
import type {
  AceGridCustomElement,
  AceGridCustomEventDetail,
  AceGridHookElement,
  AceGridIconTemplateRegistry,
  AceGridTemplateRegistry,
} from "./wc";

export const ACE_GRID_ANGULAR_DEFAULT_TAG_NAME = "ace-grid";
export const ACE_GRID_ANGULAR_EVENT_PREFIX = "ace-grid-";
export const ACE_GRID_ANGULAR_COMMON_EVENTS = {
  cellChange: "ace-grid-cell-change",
  rowAdd: "ace-grid-row-add",
  rowDelete: "ace-grid-row-delete",
  selectionChange: "ace-grid-selection-change",
  selectionRangeChange: "ace-grid-selection-range-change",
  sortChange: "ace-grid-sort-change",
  sortModelChange: "ace-grid-sort-model-change",
  filterChange: "ace-grid-filter-change",
} as const;

type GridComponentProps = Record<string, unknown>;

export type AceGridAngularCommonEventName =
  (typeof ACE_GRID_ANGULAR_COMMON_EVENTS)[keyof typeof ACE_GRID_ANGULAR_COMMON_EVENTS];

type AceGridHookSurface<
  TProps extends GridComponentProps = GridComponentProps,
  THookOptions = Record<string, unknown>,
  TRows = unknown,
  TActions = unknown,
> = Pick<
  AceGridHookElement<TProps, THookOptions, TRows, TActions>,
  | "actions"
  | "api"
  | "getActions"
  | "getApi"
  | "getHookOptions"
  | "getRows"
  | "hookOptions"
  | "rows"
  | "setHookOptions"
>;

export type AceGridAngularElementHost<
  TProps extends GridComponentProps = GridComponentProps,
  THookOptions = Record<string, unknown>,
  TRows = unknown,
  TActions = unknown,
> = AceGridCustomElement<TProps> &
  Partial<AceGridHookSurface<TProps, THookOptions, TRows, TActions>>;

export interface AceGridAngularReadyEvent<
  TProps extends GridComponentProps = GridComponentProps,
  THookOptions = Record<string, unknown>,
  TRows = unknown,
  TActions = unknown,
> {
  element: AceGridAngularElementHost<TProps, THookOptions, TRows, TActions>;
}

export type AceGridAngularIconTemplateRegistry = Partial<{
  [K in keyof GridIconSet]: Type<any>;
}>;

@Component({
  standalone: true,
  selector: "ace-grid-angular",
  template: `<div #container class="ace-grid-angular__container"></div>`,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }

      .ace-grid-angular__container {
        display: block;
        width: 100%;
        height: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AceGridComponent<
  TProps extends GridComponentProps = Partial<GridProps>,
  THookOptions = UseGridOptions,
  TRows = GridRow[],
  TActions = GridActions,
> implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild("container") containerRef!: ElementRef<HTMLDivElement>;

  @Input() customTagName: string = ACE_GRID_ANGULAR_DEFAULT_TAG_NAME;
  @Input() props: TProps = {} as TProps;
  @Input() hookOptions: THookOptions | null = null;
  @Input() templates: AceGridTemplateRegistry | null = null;
  @Input() iconTemplates: AceGridAngularIconTemplateRegistry | null = null;
  @Input() elementClassName: string = "";

  @Output() readonly ready =
    new EventEmitter<AceGridAngularReadyEvent<TProps, THookOptions, TRows, TActions>>();
  @Output() readonly customEvent =
    new EventEmitter<CustomEvent<AceGridCustomEventDetail>>();
  @Output() readonly cellChange = new EventEmitter<AceGridCustomEventDetail>();
  @Output() readonly rowAdd = new EventEmitter<AceGridCustomEventDetail>();
  @Output() readonly rowDelete = new EventEmitter<AceGridCustomEventDetail>();
  @Output() readonly selectionChange = new EventEmitter<AceGridCustomEventDetail>();
  @Output() readonly selectionRangeChange = new EventEmitter<AceGridCustomEventDetail>();
  @Output() readonly sortChange = new EventEmitter<AceGridCustomEventDetail>();
  @Output() readonly sortModelChange = new EventEmitter<AceGridCustomEventDetail>();
  @Output() readonly filterChange = new EventEmitter<AceGridCustomEventDetail>();

  private readonly zone = inject(NgZone);
  private readonly appRef = inject(ApplicationRef);
  private readonly environmentInjector = inject(EnvironmentInjector);

  private element: AceGridAngularElementHost<
    TProps,
    THookOptions,
    TRows,
    TActions
  > | null = null;
  private unpatchDispatchEvent: (() => void) | null = null;

  ngAfterViewInit(): void {
    const tagName =
      (this.customTagName ?? "").trim() || ACE_GRID_ANGULAR_DEFAULT_TAG_NAME;
    const container = this.containerRef.nativeElement;
    this.ensureElement(container, tagName, this.elementClassName);
    this.applyInputs(
      this.props,
      this.hookOptions,
      this.templates,
      this.iconTemplates,
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.containerRef) return;

    const container = this.containerRef.nativeElement;
    const tagName =
      (this.customTagName ?? "").trim() || ACE_GRID_ANGULAR_DEFAULT_TAG_NAME;

    if (changes["customTagName"] || changes["elementClassName"]) {
      this.ensureElement(container, tagName, this.elementClassName);
    }

    if (
      changes["props"] ||
      changes["hookOptions"] ||
      changes["templates"] ||
      changes["iconTemplates"]
    ) {
      this.applyInputs(
        this.props,
        this.hookOptions,
        this.templates,
        this.iconTemplates,
      );
    }
  }

  ngOnDestroy(): void {
    this.teardownElement();
  }

  getElement = () => this.element;

  rerender = () => {
    this.element?.rerender();
  };

  setProps = (partial: Partial<TProps>) => {
    this.element?.setProps?.(partial);
  };

  getProps = () => this.element?.getProps?.() ?? null;

  setTemplates = (partial: Partial<AceGridTemplateRegistry>) => {
    this.element?.setTemplates?.(partial);
  };

  getTemplates = () => this.element?.getTemplates?.() ?? null;

  setIconTemplates = (partial: Partial<AceGridAngularIconTemplateRegistry>) => {
    this.iconTemplates = {
      ...(this.iconTemplates ?? {}),
      ...partial,
    };
    this.applyInputs(
      this.props,
      this.hookOptions,
      this.templates,
      this.iconTemplates,
    );
  };

  getIconTemplates = () => this.iconTemplates ?? null;

  setHookOptions = (partial: Partial<THookOptions>) => {
    const element = this.element;
    if (!element?.setHookOptions) return;
    element.setHookOptions(partial);
  };

  getHookOptions = () => {
    const element = this.element;
    if (!element?.getHookOptions) return null;
    return element.getHookOptions();
  };

  getRows = () => {
    const element = this.element;
    return element?.getRows?.() ?? null;
  };

  getActions = () => {
    const element = this.element;
    return element?.getActions?.() ?? null;
  };

  getApi = () => {
    const element = this.element;
    return element?.getApi?.() ?? null;
  };

  private ensureElement(
    container: HTMLDivElement,
    tagName: string,
    elementClassName: string,
  ) {
    const currentTagName = this.element?.tagName.toLowerCase();
    if (!this.element || currentTagName !== tagName.toLowerCase()) {
      this.teardownElement();
      const nextElement = document.createElement(
        tagName,
      ) as AceGridAngularElementHost<TProps, THookOptions, TRows, TActions>;
      nextElement.style.display = "block";
      nextElement.style.width = "100%";
      nextElement.className = elementClassName;
      container.replaceChildren(nextElement);
      this.element = nextElement;
      this.unpatchDispatchEvent = this.patchDispatchEvent(nextElement);
      this.ready.emit({ element: nextElement });
      return;
    }

    this.element.className = elementClassName;
  }

  private applyInputs(
    props: TProps,
    hookOptions: THookOptions | null,
    templates: AceGridTemplateRegistry | null,
    iconTemplates: AceGridAngularIconTemplateRegistry | null,
  ) {
    if (!this.element) return;

    this.element.props = (props ?? {}) as TProps;
    this.element.templates =
      this.mergeTemplateRegistries(
        templates,
        this.buildAngularIconTemplateRegistry(iconTemplates),
      ) ?? {};

    if ("hookOptions" in this.element) {
      (
        this.element as AceGridAngularElementHost<
          TProps,
          THookOptions,
          TRows,
          TActions
        > &
          Required<Pick<AceGridHookElement<TProps, THookOptions, TRows, TActions>, "hookOptions">>
      ).hookOptions = (hookOptions ?? {}) as THookOptions;
    }
  }

  private patchDispatchEvent(
    element: AceGridAngularElementHost<TProps, THookOptions, TRows, TActions>,
  ) {
    const originalDispatchEvent = element.dispatchEvent.bind(element);

    element.dispatchEvent = ((event: Event) => {
      if (event.type.startsWith(ACE_GRID_ANGULAR_EVENT_PREFIX)) {
        this.zone.run(() => {
          this.emitCustomEvent(event as CustomEvent<AceGridCustomEventDetail>);
        });
      }
      return originalDispatchEvent(event);
    }) as typeof element.dispatchEvent;

    return () => {
      element.dispatchEvent = originalDispatchEvent as typeof element.dispatchEvent;
    };
  }

  private emitCustomEvent(event: CustomEvent<AceGridCustomEventDetail>) {
    this.customEvent.emit(event);
    const detail = event.detail;
    switch (event.type) {
      case ACE_GRID_ANGULAR_COMMON_EVENTS.cellChange:
        this.cellChange.emit(detail);
        break;
      case ACE_GRID_ANGULAR_COMMON_EVENTS.rowAdd:
        this.rowAdd.emit(detail);
        break;
      case ACE_GRID_ANGULAR_COMMON_EVENTS.rowDelete:
        this.rowDelete.emit(detail);
        break;
      case ACE_GRID_ANGULAR_COMMON_EVENTS.selectionChange:
        this.selectionChange.emit(detail);
        break;
      case ACE_GRID_ANGULAR_COMMON_EVENTS.selectionRangeChange:
        this.selectionRangeChange.emit(detail);
        break;
      case ACE_GRID_ANGULAR_COMMON_EVENTS.sortChange:
        this.sortChange.emit(detail);
        break;
      case ACE_GRID_ANGULAR_COMMON_EVENTS.sortModelChange:
        this.sortModelChange.emit(detail);
        break;
      case ACE_GRID_ANGULAR_COMMON_EVENTS.filterChange:
        this.filterChange.emit(detail);
        break;
      default:
        break;
    }
  }

  private teardownElement() {
    this.unpatchDispatchEvent?.();
    this.unpatchDispatchEvent = null;
    this.element?.remove();
    this.element = null;
  }

  private buildAngularIconTemplateRegistry(
    iconTemplates: AceGridAngularIconTemplateRegistry | null,
  ): { icons: AceGridIconTemplateRegistry } | null {
    if (!iconTemplates || Object.keys(iconTemplates).length === 0) {
      return null;
    }

    const iconEntries = Object.entries(iconTemplates)
      .filter((entry): entry is [keyof AceGridAngularIconTemplateRegistry, NonNullable<AceGridAngularIconTemplateRegistry[keyof AceGridAngularIconTemplateRegistry]>] => Boolean(entry[1]))
      .map(([slot, IconComponent]) => [
        slot,
        ({ props }: { props: Record<string, unknown> }) => {
          const mountTarget = document.createElement("span");
          mountTarget.style.display = "contents";
          const componentRef = createComponent(IconComponent, {
            environmentInjector: this.environmentInjector,
            hostElement: mountTarget,
          });
          const declaredInputs = new Set<string>(
            Object.keys((IconComponent as any).ɵcmp?.inputs ?? {}),
          );

          this.appRef.attachView(componentRef.hostView);
          Object.entries(props).forEach(([key, value]) => {
            if (declaredInputs.size === 0 || declaredInputs.has(key)) {
              componentRef.setInput(key, value);
            }
          });
          componentRef.changeDetectorRef.detectChanges();

          return {
            node: mountTarget,
            cleanup: () => {
              this.appRef.detachView(componentRef.hostView);
              componentRef.destroy();
            },
          };
        },
      ]);

    return {
      icons: Object.fromEntries(iconEntries) as AceGridIconTemplateRegistry,
    };
  }

  private mergeTemplateRegistries(
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
}
