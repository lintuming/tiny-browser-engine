import { StyledNode, Display } from "RenderTree";
import { last, measureDimension, match } from "utils";
import { Dimensions } from "Dimensions";
enum BoxType {
  Inline,
  Block,
  AnonymousBlock,
}

const Auto = {
  unit: "",
  value: 0,
  auto: true,
};

class LayoutBox {
  boxType: BoxType;
  children: LayoutBox[];
  styledNode?: StyledNode;
  dimensions: Dimensions;
  constructor({ boxType }: { boxType: BoxType }) {
    this.boxType = boxType;
    this.children = [];
    this.dimensions = new Dimensions();
  }

  layout(containerDimensions: Dimensions) {
    switch (this.boxType) {
      case BoxType.Block:
        return this.layoutBlock(containerDimensions);
    }
  }

  layoutBlock(containerDimensions: Dimensions) {
    this.calculateWidth(containerDimensions);
    this.calculatePos(containerDimensions)
  }
  calculateWidth(containerDimensions: Dimensions) {
    const styled = this.styledNode;
    if (styled) {
      const percentageBase = containerDimensions.content.width;

      const width = styled.resolver.width || Auto;

      const marginLeft =
        styled.resolver["margin-left"] || styled.resolver["margin"] || Auto;
      const marginRight =
        styled.resolver["margin-right"] || styled.resolver["margin"] || Auto;

      const paddingLeft =
        styled.resolver["padding-left"] || styled.resolver["padding"];
      const paddingRight =
        styled.resolver["padding-right"] || styled.resolver["padding"];

      const borderLeft =
        styled.resolver["border-left"] || styled.resolver["border"];
      const borderRight =
        styled.resolver["border-right"] || styled.resolver["border"];

      const total = [
        marginLeft,
        borderLeft,
        paddingLeft,
        width,
        paddingRight,
        borderRight,
        marginRight,
      ]
        .map((valueObj) => measureDimension(valueObj, percentageBase))
        .reduce((a, b) => a + b);

      let w = measureDimension(width, percentageBase);
      let mL = measureDimension(marginLeft, percentageBase);
      let mR = measureDimension(marginLeft, percentageBase);
      let pL = measureDimension(paddingLeft, percentageBase);
      let pR = measureDimension(paddingRight, percentageBase);
      let bL = measureDimension(borderLeft, percentageBase);
      let bR = measureDimension(borderRight, percentageBase);
      if (!width.auto && total > containerDimensions.content.width) {
        if (marginLeft?.auto) {
          mL = 0;
        }
        if (marginRight?.auto) {
          mR = 0;
        }
      }
      const Autos = [
        width.auto === true,
        marginLeft.auto === true,
        marginRight.auto === true,
      ];
      const underFlow = containerDimensions.content.width - total;
      if (match(Autos, [false, false, false])) {
        mR = underFlow;
      } else if (match(Autos, [false, true, false])) {
        mL = underFlow;
      } else if (match(Autos, [false, false, true])) {
        mR = underFlow;
      } else if (match(Autos, [true, true, true])) {
        mL = 0;
        mR = 0;
        if (underFlow >= 0) {
          w = containerDimensions.content.width;
        } else {
          w = 0;
          mR = mR + underFlow;
        }
      } else if (match(Autos, [false, true, true])) {
        mL = mL + underFlow / 2;
        mR = mR + underFlow / 2;
      }

      const dimensions = this.dimensions;
      dimensions.content.width = w;
      dimensions.margin.left = mL;
      dimensions.margin.right = mR;
      dimensions.border.left = bL;
      dimensions.border.right = bR;
      dimensions.padding.left = pL;
      dimensions.padding.right = pR;
    }
  }
  calculatePos(containerDimensions: Dimensions) {
    const styled = this.styledNode;
    if(styled){
      const d = this.dimensions;
      const percentageBase = containerDimensions.content.width
      const mT = measureDimension(styled.resolver["margin-top"],percentageBase);
      const mB = measureDimension(styled.resolver["margin-bottom"],percentageBase);

      const bT = measureDimension(styled.resolver['border-top'],percentageBase);
      const bB = measureDimension(styled.resolver['border-bottom'],percentageBase);
      
      const pT = measureDimension(styled.resolver['padding-top'],percentageBase);
      const pB = measureDimension(styled.resolver['padding-bottom'],percentageBase);

      

    }
  }
  calculateBlockChild() {}
  getInlineBoxContainer() {
    const lastChild = last(this.children);
    if (lastChild.boxType === BoxType.AnonymousBlock) {
      return lastChild;
    }
    const AnonymouseBlock = new LayoutBox({ boxType: BoxType.AnonymousBlock });
    this.children.push(AnonymouseBlock);
    return AnonymouseBlock;
  }
}

function buildLayoutTree(styledNode: StyledNode): LayoutBox | null {
  let root: LayoutBox | null;
  switch (styledNode.display) {
    case Display.Block:
      root = new LayoutBox({ boxType: BoxType.Block });
      break;
    case Display.Inline:
      root = new LayoutBox({ boxType: BoxType.Inline });
      break;
    case Display.None:
      return null;
  }
  root.styledNode = styledNode;
  for (const child of styledNode.children) {
    switch (child.display) {
      case Display.Block: {
        const childNode = buildLayoutTree(child);
        childNode && root.children.push(childNode);
        break;
      }
      case Display.Inline: {
        const childNode = buildLayoutTree(child);
        childNode && root.getInlineBoxContainer().children.push(childNode);
      }
    }
  }
  return root;
}

export { buildLayoutTree };
