import {
  BaseBoxShapeUtil,
  Editor,
  Geometry2d,
  HTMLContainer,
  Rectangle2d,
  TLBaseShape,
  TLOnResizeHandler,
  TLShape,
  TLShapeId,
  resizeBox,
} from "tldraw";
import { getUserId } from "./storeUtils";
import { getEdge } from "./propagators/tlgraph";

export type ValueType = "SCALAR" | "BOOLEAN" | "STRING" | "RANK" | "NONE";

export type ISocialShape = TLBaseShape<
  "social",
  {
    w: number;
    h: number;
    text: string;
    selector: string;
    valueType: ValueType;
    values: Record<string, any>;
    value: any;
    syntaxError: boolean;
  }
>;

export class SocialShapeUtil extends BaseBoxShapeUtil<ISocialShape> {
  static override type = "social" as const;
  private valueTypeRegex = (valueType: ValueType) =>
    new RegExp(`${valueType}\\s*\\((.*?)\\)|${valueType}`);
  override canBind = () => true;
  override canEdit = () => false;
  override getDefaultProps(): ISocialShape["props"] {
    return {
      w: 160 * 2,
      h: 90 * 2,
      text: "",
      selector: "",
      valueType: "NONE",
      values: {},
      value: null,
      syntaxError: false,
    };
  }
  override onResize: TLOnResizeHandler<ISocialShape> = (shape, info) => {
    return resizeBox(shape, info);
  };
  override getGeometry(shape: ISocialShape): Geometry2d {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  indicator(shape: ISocialShape) {
    return <rect width={shape.props.w} height={shape.props.h} rx={4} />;
  }

  override component(shape: ISocialShape) {
    const currentUser = getUserId(this.editor);

    const defaultValues = {
      BOOLEAN: false,
      SCALAR: 0,
      DEFAULT: null,
    };

    const handleOnChange = (newValue: boolean | number) => {
      console.log("NEW VALUE", newValue);
      this.updateProps(shape, {
        values: { ...shape.props.values, [currentUser]: newValue },
      });
      this.updateValue(shape.id);
    };

    const handleTextChange = (text: string) => {
      let valueType: ValueType = "NONE";
      const selector = text.match(/@([a-zA-Z]+)/)?.[1] || "";

      if (text.includes("SCALAR")) {
        valueType = "SCALAR";
      } else if (text.includes("BOOLEAN")) {
        valueType = "BOOLEAN";
      } else if (text.includes("STRING")) {
        valueType = "STRING";
      } else if (text.includes("RANK")) {
        valueType = "RANK";
      }

      if (valueType !== shape.props.valueType) {
        this.updateProps(shape, { text, valueType, selector, values: {} });
      } else {
        this.updateProps(shape, { text, selector });
      }
      this.updateValue(shape.id);
    };

    const args = this.getArgs(shape, shape.props.valueType);
    const inputMap = getInputMap(this.editor, shape);
    const usedInputs: any[] = [];
    for (const arg of args) {
      if (arg !== false && arg !== true && inputMap[arg]) {
        if (Array.isArray(inputMap[arg].value)) {
          usedInputs.push(...inputMap[arg].value);
        } else {
          usedInputs.push(inputMap[arg].value);
        }
      }
    }
    // console.log("USED INPUTS", usedInputs)

    return (
      <HTMLContainer
        style={{
          padding: 4,
          borderRadius: 4,
          border: "1px solid #ccc",
          outline: shape.props.syntaxError ? "2px solid orange" : "none",
        }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <textarea
          style={{
            width: "100%",
            minHeight: "4em",
            height: "auto",
            border: "1px solid lightgrey",
            resize: "none",
            pointerEvents: "all",
          }}
          value={shape.props.text}
          onChange={(e) => handleTextChange(e.target.value)}
          rows={2}
        />
        <ValueInterface
          type={shape.props.valueType ?? null}
          value={
            shape.props.values[currentUser] ??
            defaultValues[shape.props.valueType as keyof typeof defaultValues]
          }
          values={shape.props.values}
          inputs={usedInputs}
          onChange={handleOnChange}
          editor={this.editor}
        />
      </HTMLContainer>
    );
  }

  private getArgs(shape: ISocialShape, valueType: ValueType) {
    const match = shape.props.text.match(this.valueTypeRegex(valueType));
    let args: (string | number | boolean)[] = [];
    if (match?.[1]) {
      args = match[1].split(",").map((arg) => {
        const trimmed = arg.trim();
        if (trimmed === "true") return true;
        if (trimmed === "false") return false;
        if (!Number.isNaN(Number(trimmed))) return Number(trimmed);
        return trimmed;
      });
    }
    return args;
  }

  private updateValue(shapeId: TLShapeId) {
    const shape = this.editor.getShape(shapeId) as ISocialShape;
    const valueType = shape.props.valueType;
    const vals = Array.from(Object.values(shape.props.values));

    const functionBody = `return ${shape.props.text.replace(
      this.valueTypeRegex(valueType),
      "VALUES"
    )};`;

    const sum = (vals: number[] | boolean[]) => {
      if (valueType === "SCALAR") {
        return (vals as number[]).reduce((acc, val) => acc + val, 0);
      }
      if (valueType === "BOOLEAN") {
        //@ts-ignore
        return vals.filter(Boolean).length;
      }
    };
    const average = (vals: number[] | boolean[]) => {
      if (valueType === "SCALAR") {
        return (
          (vals as number[]).reduce((acc, val) => acc + val, 0) / vals.length
        );
      }
      if (valueType === "BOOLEAN") {
        //@ts-ignore
        return vals.filter(Boolean).length;
      }
    };

    const countVotes = (votes: Array<{ up: string[]; down: string[] }>) => {
      const voteCount = votes.reduce((acc, vote) => {
        for (const item of vote.up) {
          acc[item] = (acc[item] || 0) + 1;
        }
        for (const item of vote.down) {
          acc[item] = (acc[item] || 0) - 1;
        }
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(voteCount).sort((a, b) => b[1] - a[1]);
    };

    const inputMap = getInputMap(this.editor, shape);

    try {
      const paramNames = [
        "sum",
        "average",
        "countVotes",
        "VALUES",
        ...Object.keys(inputMap),
      ];
      const paramValues = [
        sum,
        average,
        countVotes,
        vals,
        ...Object.values(inputMap).map((s) => s.value),
      ];
      const func = new Function(...paramNames, functionBody);
      const result = func(...paramValues);

      if (typeof result === "function") {
        this.updateProps(
          { ...shape, props: { ...shape.props, value: null } },
          { syntaxError: true }
        );
        return;
      }

      this.updateProps(shape, { value: result, syntaxError: false });
    } catch (e) {
      console.log("ERROR", e);
      this.updateProps(shape, { syntaxError: true });
    }
  }

  private updateProps(
    shape: ISocialShape,
    props: Partial<ISocialShape["props"]>
  ) {
    this.editor.updateShape<ISocialShape>({
      id: shape.id,
      type: "social",
      props: {
        ...shape.props,
        ...props,
      },
    });
  }
}

function ValueInterface({
  type,
  value,
  values,
  onChange,
  inputs,
  editor,
}: {
  type: ValueType;
  value: boolean | number | string;
  values: Record<string, any>;
  onChange: (value: any) => void;
  inputs: any[];
  editor: Editor;
}) {
  switch (type) {
    case "BOOLEAN":
      return (
        <>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <input
              style={{
                pointerEvents: "all",
                width: "20px",
                height: "20px",
                margin: 0,
              }}
              type="checkbox"
              checked={value as boolean}
              onChange={(e) => onChange(e.target.checked)}
            />
            <div
              style={{ width: "1px", height: "20px", backgroundColor: "grey" }}
            />
            {Object.values(values).map((bool, i) => (
              <div
                key={`boolean-${i}`}
                style={{
                  backgroundColor: bool ? "blue" : "white",
                  width: "20px",
                  height: "20px",
                  border: "1px solid lightgrey",
                  borderRadius: 2,
                }}
              />
            ))}
          </div>
        </>
      );
    case "STRING":
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            gap: "4px",
          }}
        >
          <textarea
            style={{
              pointerEvents: "all",
              width: "100%",
              minHeight: "60px",
              resize: "vertical",
              padding: "4px",
              boxSizing: "border-box",
            }}
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", gap: "2px" }}>
              {Object.values(values)
                .filter((value) => value !== "")
                .map((_, i) => (
                  <div
                    key={`string-${i}`}
                    style={{
                      width: "8px",
                      height: "8px",
                      backgroundColor: "blue",
                      borderRadius: "50%",
                    }}
                  />
                ))}
            </div>
          </div>
        </div>
      );
    case "RANK": {
      const currentUser = getUserId(editor);
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            gap: "8px",
          }}
        >
          {inputs.map((input, index) => (
            <div
              key={`rank-${index}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                border: "1px solid lightgrey",
                borderRadius: 4,
                padding: "4px 8px",
              }}
            >
              <span
                style={{
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {input}
              </span>
              <button
                type="button"
                onClick={() => {
                  const newUp = [
                    ...new Set([...(values[currentUser]?.up || []), input]),
                  ];
                  //@ts-ignore
                  const newDown = (values[currentUser]?.down || []).filter(
                    (v: string) => v !== input
                  );
                  onChange({ up: newUp, down: newDown });
                }}
                style={{
                  cursor: "pointer",
                  padding: "4px 8px",
                  pointerEvents: "all",
                  backgroundColor: values[currentUser]?.up?.includes(input)
                    ? "#4CAF50"
                    : "inherit",
                }}
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => {
                  //@ts-ignore
                  const newUp = (values[currentUser]?.up || []).filter(
                    (v: string) => v !== input
                  );
                  //@ts-ignore
                  const newDown = [
                    ...new Set([...(values[currentUser]?.down || []), input]),
                  ];
                  onChange({ up: newUp, down: newDown });
                }}
                style={{
                  cursor: "pointer",
                  padding: "4px 8px",
                  pointerEvents: "all",
                  backgroundColor: values[currentUser]?.down?.includes(input)
                    ? "#FF3B30"
                    : "inherit",
                }}
              >
                ▼
              </button>
            </div>
          ))}
          <div style={{ display: "flex", gap: "2px" }}>
            {Object.values(values)
              .filter((value) => value !== "")
              .map((_, i) => (
                <div
                  key={`rank-dot-${i}`}
                  style={{
                    width: "8px",
                    height: "8px",
                    backgroundColor: "blue",
                    borderRadius: "50%",
                  }}
                />
              ))}
          </div>
        </div>
      );
    }
    case "SCALAR":
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={(value as number) ?? 0}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            style={{ width: "100px", pointerEvents: "all" }}
          />
          <span style={{ fontFamily: "monospace" }}>
            {((value as number) ?? 0).toFixed(2)}
          </span>
          <div
            style={{ width: "1px", height: "20px", backgroundColor: "grey" }}
          />
          {Object.values(values).map((val, i) => (
            <div
              key={`scalar-${i}`}
              style={{
                backgroundColor: `rgba(0, 0, 255, ${val ?? 0})`,
                width: "20px",
                height: "20px",
                border: "1px solid lightgrey",
                borderRadius: 2,
              }}
            />
          ))}
        </div>
      );
    default:
      return (
        <div style={{ marginTop: 10, textAlign: "center" }}>
          No Interface...
        </div>
      );
  }
}

function getInputMap(editor: Editor, shape: TLShape) {
  const arrowBindings = editor.getBindingsInvolvingShape(shape.id, "arrow");
  const arrows = arrowBindings.map((binding) =>
    editor.getShape(binding.fromId)
  );

  return arrows.reduce((acc, arrow) => {
    const edge = getEdge(arrow, editor);
    if (edge && edge.to === shape.id) {
      const sourceShape = editor.getShape(edge.from);
      if (sourceShape && edge.text) {
        //@ts-ignore
        acc[edge.text] = {
          //@ts-ignore
          value: sourceShape.props.value || sourceShape.props.text || null,
          shapeId: sourceShape.id,
        };
      }
    }
    return acc;
  }, {} as Record<string, { value: any; shapeId: TLShapeId }>);
}
