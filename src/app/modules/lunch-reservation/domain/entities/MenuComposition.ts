export interface MenuCompositionUpdateData {
  observations?: string;
  isMainProtein?: boolean;
  isAlternativeProtein?: boolean;
}

export class MenuComposition {
  constructor(
    public readonly id: string,
    public readonly menuId: string,
    public readonly menuItemId: string,
    public observations: string,
    public isMainProtein: boolean,
    public isAlternativeProtein: boolean
  ) {}

  public update(data: MenuCompositionUpdateData): void {
    if (data.observations !== undefined) this.observations = data.observations;
    if (data.isMainProtein !== undefined) this.isMainProtein = data.isMainProtein;
    if (data.isAlternativeProtein !== undefined) this.isAlternativeProtein = data.isAlternativeProtein;
  }

  public isProtein(): boolean {
    return this.isMainProtein || this.isAlternativeProtein;
  }
}
