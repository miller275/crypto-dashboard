import type {
  DiagramElement,
  DiagramRule,
  DiagramTemplate,
  DiagramTemplateJson,
  WorkType,
} from "@/lib/types";
import { diagramRules, diagramTemplates } from "@/data/renovData";

const applyBindings = (
  text: string,
  variables: Record<string, number | string | boolean>
) => {
  return text.replace(/\{(\w+)\}/g, (_, key) => {
    const value = variables[key];
    if (typeof value === "undefined") return "";
    return String(value);
  });
};

const checkCondition = (
  condition: DiagramRule["condition"],
  variables: Record<string, number | string | boolean>
) => {
  const evaluate = (rule: DiagramRule["condition"]["all"][number]) => {
    const value = variables[rule.field];
    switch (rule.operator) {
      case "==":
        return value === rule.value;
      case "!=":
        return value !== rule.value;
      case ">":
        return Number(value) > Number(rule.value);
      case "<":
        return Number(value) < Number(rule.value);
      case ">=":
        return Number(value) >= Number(rule.value);
      case "<=":
        return Number(value) <= Number(rule.value);
      case "in":
        return Array.isArray(rule.value) ? rule.value.includes(String(value)) : false;
      default:
        return false;
    }
  };
  const all = condition.all?.every(evaluate) ?? true;
  const any = condition.any?.some(evaluate) ?? true;
  return all && any;
};

export const selectDiagramTemplate = (
  workType: WorkType,
  variables: Record<string, number | string | boolean>
) => {
  const rules = diagramRules
    .filter((rule) => rule.workType === workType && rule.isActive)
    .sort((a, b) => b.priority - a.priority);
  const matched = rules.find((rule) => checkCondition(rule.condition, variables));
  const templateId =
    matched?.action.templateId ??
    diagramTemplates.find((template) => template.workType === workType && template.isActive)?.id;
  const template = diagramTemplates.find((item) => item.id === templateId);
  return { template, rule: matched };
};

const renderElement = (
  element: DiagramElement,
  variables: Record<string, number | string | boolean>,
  translate: (key: string) => string
): string[] => {
  const bindings = element.bindings;
  if (bindings?.visibleIf?.length) {
    const visible = bindings.visibleIf.every((rule) => {
      const value = variables[rule.field];
      switch (rule.operator) {
        case "==":
          return value === rule.value;
        case "!=":
          return value !== rule.value;
        default:
          return true;
      }
    });
    if (!visible) return [];
  }

  const rawText = element.textKey ? translate(element.textKey) : element.text;
  const bindingText = bindings?.textKey ? translate(bindings.textKey) : bindings?.text;
  const text = rawText ? applyBindings(bindingText ?? rawText, variables) : undefined;

  const buildSvg = (x: number, y: number) => {
    switch (element.type) {
      case "rect":
        return `<rect x="${x}" y="${y}" width="${element.w}" height="${element.h}" fill="${element.fill ?? "none"}" stroke="${element.stroke ?? "#94a3b8"}" stroke-width="${element.strokeWidth ?? 2}" rx="8" />`;
      case "line":
        return `<line x1="${x}" y1="${y}" x2="${x + (element.w ?? 0)}" y2="${y + (element.h ?? 0)}" stroke="${element.stroke ?? "#94a3b8"}" stroke-width="${element.strokeWidth ?? 2}" />`;
      case "polyline":
        return `<polyline points="${element.points ?? ""}" fill="none" stroke="${element.stroke ?? "#94a3b8"}" stroke-width="${element.strokeWidth ?? 2}" />`;
      case "text":
        return `<text x="${x}" y="${y}" fill="${element.fill ?? "#0f172a"}" font-size="14" font-family="Inter, sans-serif">${text ?? ""}</text>`;
      case "icon":
        return `<rect x="${x}" y="${y}" width="24" height="24" rx="6" fill="#e2e8f0" stroke="#64748b" stroke-width="1.5" /><text x="${x + 12}" y="${y + 16}" text-anchor="middle" font-size="10" fill="#334155">${element.icon ?? ""}</text>`;
      default:
        return "";
    }
  };

  if (bindings?.repeater) {
    const count = Number(variables[bindings.repeater.countVar] ?? 0);
    const visibleCount = bindings.repeater.maxVisible
      ? Math.min(count, bindings.repeater.maxVisible)
      : count;
    if (visibleCount <= 0) return [];
    return Array.from({ length: visibleCount }).map((_, index) => {
      const offset = bindings.repeater.spacing * index;
      const x = bindings.repeater.direction === "column" ? element.x : element.x + offset;
      const y = bindings.repeater.direction === "column" ? element.y + offset : element.y;
      return buildSvg(x, y);
    });
  }

  return [buildSvg(element.x, element.y)];
};

export const renderDiagram = (
  template: DiagramTemplate | undefined,
  variables: Record<string, number | string | boolean>,
  enabledLayers?: string[],
  translate: (key: string) => string = (key) => key
) => {
  if (!template) return "";
  const layers = template.template.layers;
  const activeLayerIds = new Set(
    layers.filter((layer) => layer.visible || enabledLayers?.includes(layer.id)).map((layer) => layer.id)
  );
  const svgElements = template.template.elements
    .filter((element) => !element.layerId || activeLayerIds.has(element.layerId))
    .flatMap((element) => renderElement(element, variables, translate))
    .join("");
  return `<svg width="${template.canvasW}" height="${template.canvasH}" viewBox="0 0 ${template.canvasW} ${template.canvasH}" xmlns="http://www.w3.org/2000/svg">${svgElements}</svg>`;
};

export const exportTemplateJson = (template: DiagramTemplateJson) =>
  JSON.stringify(template, null, 2);
