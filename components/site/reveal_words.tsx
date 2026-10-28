import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";

// Splits heading text into words for the word-by-word reveal (see RevealGroup). Elements
// such as <Accent> keep their wrapper; the words inside them are split too. Server-safe.

const START_MS = 300;
const STEP_MS = 50;

export function RevealWords({ children }: { children: ReactNode }) {
  let n = 0;
  const split = (node: ReactNode): ReactNode =>
    Children.map(node, (child) => {
      if (typeof child === "string" || typeof child === "number") {
        return String(child)
          .split(/(\s+)/)
          .map((part, k) =>
            /^\s+$/.test(part) || !part ? (
              part
            ) : (
              <span key={k} className="rv-word" style={{ ["--rv-delay" as string]: `${START_MS + STEP_MS * n++}ms` }}>
                {part}
              </span>
            ),
          );
      }
      if (isValidElement(child)) {
        const el = child as ReactElement<{ children?: ReactNode }>;
        return el.props.children === undefined ? el : cloneElement(el, undefined, split(el.props.children));
      }
      return child;
    });
  return <>{split(children)}</>;
}
