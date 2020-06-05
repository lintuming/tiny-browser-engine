

type Rect = {
  [key in "x" | "y" | "width" | "height"]: number;
};

type Edges = {
  [key in "top" | "left" | "right" | "bottom"]: number;
};

const createEdges = () => {
  return {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  };
};



export class Dimensions {
  content: Rect;
  margin: Edges;
  border: Edges;
  padding: Edges;
  constructor() {
    this.content = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    };
    this.margin = createEdges();
    this.border = createEdges();
    this.padding = createEdges();
  }
}