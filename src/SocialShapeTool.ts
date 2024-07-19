import { BaseBoxShapeTool } from 'tldraw'

export class SocialShapeTool extends BaseBoxShapeTool {
  static override id = 'social'
  static override initial = 'idle'
  override shapeType = 'social'

}

